import { app } from './app';
import { createServer } from 'node:http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { verifyToken } from './auth/jwt';

interface AuthenticatedSocket extends Socket {
  user?: { username: string; role: string };
}

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
io.use((socket: AuthenticatedSocket, next) => {
  let token = socket.handshake.auth.token;

  if (!token) {
    console.log('No token found in request');
    return next(new Error('Authentication token is required'));
  }

  try {
    // Verify JWT token
    const decoded = verifyToken(token);
    socket.user = decoded as { username: string; role: string };
    console.log(socket.user, 'socket.user');
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return next(new Error('Invalid authentication token'));
  }
});

const initializeSocket = () => {
  // Track connected clients and their rooms
  const connectedClients = new Map<string, Set<string>>();

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(
      `Client connected: ${socket.id} (User: ${socket.user?.username})`
    );
    connectedClients.set(socket.id, new Set());

    socket.on('joinRestaurant', (restaurantId: string) => {
      const roomName = `restaurant:${restaurantId}`;
      socket.join(roomName);
      connectedClients.get(socket.id)?.add(roomName);
      console.log(
        `Client ${socket.id} (User: ${socket.user?.username}) joined room ${roomName}`
      );
    });

    socket.on('leaveRestaurant', (restaurantId: string) => {
      const roomName = `restaurant:${restaurantId}`;
      socket.leave(roomName);
      connectedClients.get(socket.id)?.delete(roomName);
      console.log(
        `Client ${socket.id} (User: ${socket.user?.username}) left room ${roomName}`
      );
    });

    socket.on('disconnect', () => {
      console.log(
        `Client disconnected: ${socket.id} (User: ${socket.user?.username})`
      );
      connectedClients.delete(socket.id);
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
