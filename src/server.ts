import { app } from './app';
import { createServer } from 'node:http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { verifyToken } from './auth/jwt';
import { RestaurantService } from './services/restaurant.service';

interface AuthenticatedSocket extends Socket {
  user?: { username?: string; email?: string; role: string };
}

const restaurantService = new RestaurantService();

const server = createServer(app);

// Initialize Socket.IO server with authentication middleware
const io = new Server(server, {
  cors: {
    origin: '*',
  },
  pingTimeout: 60000,
  pingInterval: 25000,
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

    if (decoded.username) {
      socket.user = { username: decoded.username, role: decoded.role };
      console.log('[mobile]', decoded.username, decoded.role);
    } else if (decoded.email) {
      socket.user = { email: decoded.email, role: decoded.role };
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
export const connectedSocketClients = new Map<string, Set<string>>();

const initializeSocket = () => {
  // Track connected clients and their rooms

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(
      `Client connected: ${socket.id} (${
        socket.user?.username ? 'User' : 'Printer'
      }: ${socket.user?.username ?? socket.user?.email})`
    );
    connectedSocketClients.set(socket.id, new Set());

    // Listen for client's hello response
    socket.on('client:hello', (message: string) => {
      console.log(`Received from client: ${message}`);
    });

    socket.on('joinRestaurant', (restaurantId: string) => {
      const roomName = `restaurant:${restaurantId}`;
      socket.join(roomName);
      connectedSocketClients.get(socket.id)?.add(roomName);
      console.log(
        `Client ${socket.id} (${socket.user?.username ? 'User' : 'Printer'}: ${
          socket.user?.username ?? socket.user?.email
        }) joined room ${roomName}`
      );
    });

    socket.on('leaveRestaurant', (restaurantId: string) => {
      const roomName = `restaurant:${restaurantId}`;
      socket.leave(roomName);
      connectedSocketClients.get(socket.id)?.delete(roomName);
      console.log(
        `Client ${socket.id} (${socket.user?.username ? 'User' : 'Printer'}: ${
          socket.user?.username ?? socket.user?.email
        }) left room ${roomName}`
      );
    });

    socket.on('disconnect', () => {
      console.log(
        `Client disconnected: ${socket.id} (${
          socket.user?.username ? 'User' : 'Printer'
        }: ${socket.user?.username ?? socket.user?.email})`
      );

      connectedSocketClients.delete(socket.id);
    });
  });

  return io;
};

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
