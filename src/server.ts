import { app } from './app';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { healthCheckEmitter } from './lib/socketio';
import { Restaurant } from './database/entity/Restaurant.entity';

const server = createServer(app);

// Initialize Socket.IO server
const io = new Server(server, {
  cors: {
    origin: '*',
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

const PORT = process.env.SERVER_PORT || 3013;

// Initialize socket connections before starting the server
const initializeSocket = () => {
  // Track connected clients and their rooms
  const connectedClients = new Map<string, Set<string>>();

  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);
    connectedClients.set(socket.id, new Set());

    socket.on('joinRestaurant', (restaurantId: string) => {
      const roomName = `restaurant:${restaurantId}`;
      socket.join(roomName);
      connectedClients.get(socket.id)?.add(roomName);
      console.log(`Client ${socket.id} joined room ${roomName}`);
    });

    socket.on('leaveRestaurant', (restaurantId: string) => {
      const roomName = `restaurant:${restaurantId}`;
      socket.leave(roomName);
      connectedClients.get(socket.id)?.delete(roomName);
      console.log(`Client ${socket.id} left room ${roomName}`);
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
      connectedClients.delete(socket.id);
    });

    socket.on('requestHealthCheck', async (data: { restaurantId: number }) => {
      try {
        // Verify socket is in the correct room
        const roomName = `restaurant:${data.restaurantId}`;
        const rooms = Array.from(socket.rooms);

        if (rooms.includes(roomName)) {
          const restaurant = { id: data.restaurantId } as Restaurant; // Minimal restaurant object
          await healthCheckEmitter(restaurant);
        } else {
          console.log(
            `Health check failed - socket ${socket.id} not in room ${roomName}`
          );
        }
      } catch (error) {
        console.error('Error in health check:', error);
      }
    });
  });

  return io;
};

// Start the server and initialize sockets
const startServer = () => {
  const socketIO = initializeSocket();

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
