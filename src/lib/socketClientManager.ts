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

    const email = clientInfo.user.email;

    // Increment the version atomically
    const newVersion = (connectionVersions.get(email) ?? 0) + 1;
    connectionVersions.set(email, newVersion);

    // Prepare the full client info
    const fullClientInfo: SocketClientInfo = {
      ...clientInfo,
      connectionVersion: newVersion,
    };

    const existingSocketId = connectedSocketUsers.get(email);
    if (existingSocketId) {
      const existingClient = connectedSocketClients.get(existingSocketId);

      // If existing client is newer, abort
      if (
        existingClient &&
        existingClient.connectionVersion > fullClientInfo.connectionVersion
      ) {
        return;
      }

      // Remove old socket
      this.delete(existingSocketId);
    }

    connectedSocketUsers.set(email, socketId);
    connectedSocketClients.set(socketId, fullClientInfo);
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
