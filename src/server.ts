import { app } from './app';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
// import { connect } from './model/postgres-connect';

// connect(process.env.POSTGRES!);

const server = createServer(app);
// Initialize Socket.IO server
const io = new Server(server, {
  cors: {
    origin: '*', // Adjust the origin as per your requirements
  },
});

// Export io to use in other modules
export { io };

const PORT = process.env.SERVER_PORT || 3013;

server.listen(PORT, () => {
  console.log(`Application started on port ${PORT}!`);
});
