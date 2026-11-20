import { io } from 'socket.io-client';

const socketUrl =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.MODE === 'production'
    ? 'https://ama-yaar.vercel.app'
    : 'http://192.168.1.12:5000');

export const socket = io(socketUrl, {
  transports: ['websocket', 'polling'],
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
});

export function joinUserRoom(userId) {
  if (userId && socket.connected) {
    socket.emit('join_user_room', userId);
  }
}

export function joinOrderRoom(orderId) {
  if (orderId && socket.connected) {
    socket.emit('join_order_room', orderId);
  }
}

export default socket;
