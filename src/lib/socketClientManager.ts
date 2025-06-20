import { socketIO } from '../server';

interface SocketClientInfo {
  user: {
    username?: string;
    email?: string;
    role: string;
    source: 'mobile_app' | 'printer_app';
  };
  rooms: Set<string>;
  connectionVersion?: number;
}

export const connectedSocketClients = new Map<string, SocketClientInfo>();
export const connectedSocketUsers = new Map<string, string>();
const connectionVersions = new Map<string, number>();

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

  set(
    socketId: string,
    clientInfo: Omit<SocketClientInfo, 'connectionVersion'>
  ) {
    if (!clientInfo.user.email) return;

    // 🚨 Only allow sockets that have joined at least one room
    if (clientInfo.rooms.size === 0) {
      console.warn(`Rejected socket ${socketId} - did not join any room`);
      return;
    }

    const email = clientInfo.user.email;

    const existingSocketId = connectedSocketUsers.get(email);
    if (existingSocketId && existingSocketId !== socketId) {
      // 🚨 Remove the previous connection regardless
      this.delete(existingSocketId);
    }

    connectedSocketUsers.set(email, socketId);
    connectedSocketClients.set(socketId, {
      ...clientInfo,
    });
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
