import { socketIO } from '../server';

interface SocketClientInfo {
  user: {
    username?: string;
    email?: string;
    role: string;
    source: 'mobile_app' | 'printer_app';
  };
  rooms: Set<string>;
  connectedAt: number; // Timestamp to track connection time
}

export const connectedSocketClients = new Map<string, SocketClientInfo>();
export const connectedSocketUsers = new Map<string, string>();

export const socketClientManager = {
  // Remove all existing socket entries for a user email
  removeByEmail(email: string) {
    for (const [socketId, clientInfo] of connectedSocketClients.entries()) {
      if (clientInfo.user.email === email) {
        connectedSocketClients.delete(socketId);
      }
    }
    connectedSocketUsers.delete(email);
  },

  getBySocketId(socketId: string) {
    return socketIO.sockets.sockets.get(socketId);
  },

  set(socketId: string, clientInfo: SocketClientInfo) {
    if (!clientInfo.user.email) return;

    const existingSocketId = connectedSocketUsers.get(clientInfo.user.email);

    if (existingSocketId) {
      const existingClient = connectedSocketClients.get(existingSocketId);

      // If the new connection is older, ignore it
      if (
        existingClient &&
        existingClient.connectedAt > clientInfo.connectedAt
      ) {
        return;
      }

      // Clean up the old connection
      this.delete(existingSocketId);
    }

    // Save the new socket
    connectedSocketUsers.set(clientInfo.user.email, socketId);
    connectedSocketClients.set(socketId, clientInfo);
  },

  getSocketClientInfo(socketId: string) {
    return connectedSocketClients.get(socketId);
  },

  getByEmail(email: string) {
    const socketId = connectedSocketUsers.get(email);
    return this.getBySocketId(socketId);
  },

  delete(socketId: string) {
    const clientInfo = connectedSocketClients.get(socketId);
    if (clientInfo) {
      connectedSocketClients.delete(socketId);

      if (clientInfo.user.email) {
        const mappedSocketId = connectedSocketUsers.get(clientInfo.user.email);
        if (mappedSocketId === socketId) {
          connectedSocketUsers.delete(clientInfo.user.email);
        }
      }
    }
  },
};
