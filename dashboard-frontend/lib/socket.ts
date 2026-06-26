import { io, type Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getDashboardSocket() {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080', {
      transports: ['websocket', 'polling'],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 10,
    });
  }

  return socket;
}
