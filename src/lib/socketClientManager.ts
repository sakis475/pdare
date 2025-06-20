import { socketIO } from '../server';

interface SocketClientInfo {
  user: {
    username?: string;
    email?: string;
    role: string;
    source: 'mobile_app' | 'printer_app';
  };
  rooms: Set<string>;
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
    if (clientInfo.user.email) {
      // Remove old sockets for this email before adding new one
      this.removeByEmail(clientInfo.user.email);

      connectedSocketUsers.set(clientInfo.user.email, socketId);
    }

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
