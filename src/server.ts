import { app } from './app';
import { createServer } from 'node:http';
import { Server, Socket } from 'socket.io';
import { verifyToken } from './auth/jwt';
import { RestaurantService } from './services/restaurant.service';
import { UserService } from './services/user.service';
import {
  connectedSocketClients,
  socketClientManager,
} from './lib/socketClientManager';
import dayjs from './lib/dayjs';

interface AuthenticatedSocket extends Socket {
  initializedAt?: Date;
  user?: {
    email: string;
    restaurant: number;
    role: string;
    source: 'mobile_app' | 'printer_app';
  };
}

interface SocketClientInfo {
  user: {
    username?: string;
    email?: string;
    role: string;
    source: 'mobile_app' | 'printer_app';
  };
  rooms: Set<string>;
}

const restaurantService = new RestaurantService();
const userService = new UserService();

const server = createServer(app);

// Initialize Socket.IO server with authentication middleware
const io = new Server(server, {
  cors: {
    origin: '*',
  },
  pingTimeout: 5000,
  pingInterval: 10000,
});

// Authentication middleware
io.use(async (socket: AuthenticatedSocket, next) => {
  let token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error('Authentication token is required'));
  }

  try {
    // Verify JWT token
    const decoded = verifyToken(token) as any;
    socket.user = {
      email: decoded.email,
      restaurant: decoded.restaurant,
      role: decoded.role,
      source: decoded.source,
    };
    socket.initializedAt = new Date();
    if (decoded.source === 'mobile_app') {
      console.log('[mobile]', decoded.email, decoded.role);
      const user = await userService.getUserByJWT(token);
      if (!user) {
        return next(
          new Error(
            'Invalid authentication user token [Not Found ConnectionCode]'
          )
        );
      }
    } else if (decoded.source === 'printer_app') {
      console.log('[printer]', decoded.email, decoded.role);
      const restaurant = await restaurantService.getRestaurantByConnectionCode(
        token
      );
      if (!restaurant) {
        return next(
          new Error('Invalid authentication token [Not Found ConnectionCode]')
        );
      }
    }
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return next(new Error('Invalid authentication token'));
  }
});

const initializeSocket = () => {
  // Track connected clients and their rooms
  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`Client connected: ${socket.id}: ${socket.user?.email}`);

    // Store user information and initialize rooms
    socketClientManager.set(socket.id, {
      user: socket.user!, // Use non-null assertion since the user is set in the middleware
      rooms: new Set(),
      connectedAt: Date.now(),
    });

    // Listen for client's hello response
    socket.on('client:hello', (message: string) => {
      console.log(`Received from client: ${message}`);
    });

    socket.on('joinRestaurant', (restaurantId: string) => {
      const roomName = `restaurant:${restaurantId}`;
      socket.join(roomName);

      // Add the room to the client's room set
      const clientInfo = socketClientManager.getSocketClientInfo(socket.id);
      if (clientInfo) {
        clientInfo.rooms.add(roomName);
      }

      console.log(
        `Client ${socket.id}: ${socket.user?.email}) joined room ${roomName}`
      );
    });

    socket.on('leaveRestaurant', (restaurantId: string) => {
      const roomName = `restaurant:${restaurantId}`;
      socket.leave(roomName);

      // Remove the room from the client's room set
      const clientInfo = socketClientManager.getSocketClientInfo(socket.id);
      if (clientInfo) {
        clientInfo.rooms.delete(roomName);
      }

      console.log(
        `Client ${socket.id}: ${socket.user?.email}) left room ${roomName}`
      );
    });

    socket.on('disconnect', () => {
      console.log(
        `Client disconnected: ${socket.id} (${
          socket.user?.email ? 'User' : 'Printer'
        }`
      );

      // Remove the client from the map
      socketClientManager.delete(socket.id);
    });
  });

  return io;
};

// const removeDeadConnections = () => {
//   connectedSocketClients.forEach((clientInfo, socketId) => {
//     const socket = io.sockets.sockets.get(socketId);
//     if (socket) {
//       // If the client is not in any rooms except their own socket room, disconnect them
//       if (clientInfo.rooms.size === 0) {
//         console.log(`Disconnecting dead connection: ${socketId}`);
//         socket.disconnect(true);
//         socketClientManager.delete(socketId);
//       }
//     } else {
//       // If the socket is not found, remove it from the map
//       socketClientManager.delete(socketId);
//     }
//   });
// };

// // Run cleanup every 30 seconds
// setInterval(removeDeadConnections, 30 * 1000);

// Start the server and initialize sockets
const startServer = () => {
  const socketIO = initializeSocket();
  const PORT = process.env.SERVER_PORT || 3013;

  server.listen(PORT, () => {
    console.log(`Application started on port ${PORT}!`);
  });

  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });

  process.once('SIGUSR2', function () {
    process.kill(process.pid, 'SIGUSR2');
  });

  return socketIO;
};

export const socketIO = startServer();
