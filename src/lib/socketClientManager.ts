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
  set(socketId: string, clientInfo: SocketClientInfo) {
    connectedSocketClients.set(socketId, clientInfo);

    if (clientInfo.user.email) {
      connectedSocketUsers.set(clientInfo.user.email, socketId);
    }
  },

  getSocketClientInfo(socketId: string) {
    return connectedSocketClients.get(socketId);
  },

  getBySocketId(socketId: string) {
    return socketIO.sockets.sockets.get(socketId);
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
        connectedSocketUsers.delete(clientInfo.user.email);
      }
    }
  },
};
