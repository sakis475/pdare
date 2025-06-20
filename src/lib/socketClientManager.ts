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

  getByEmail(email: string) {
    const socketId = connectedSocketUsers.get(email);
    if (socketId) {
      return socketIO.sockets.sockets.get(socketId); // ✅ Return actual socket instance
    }
    return undefined;
  },

  delete(socketId: string) {
    const clientInfo = connectedSocketClients.get(socketId);
    if (clientInfo && clientInfo.user.email) {
      connectedSocketUsers.delete(clientInfo.user.email);
    }
    connectedSocketClients.delete(socketId);
  },
};
