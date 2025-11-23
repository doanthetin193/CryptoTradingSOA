import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

let socket = null;

/**
 * Initialize WebSocket connection
 */
export const initializeSocket = (token) => {
  if (socket?.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    // Connected successfully
  });

  socket.on('disconnect', () => {
    // Disconnected
  });

  socket.on('connect_error', (error) => {
    console.error('❌ WebSocket connection error:', error.message);
  });

  return socket;
};

/**
 * Disconnect WebSocket
 */
export const disconnectSocket = () => {
  if (socket?.connected) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * Listen to trade confirmations
 */
export const onTradeConfirmation = (callback) => {
  if (!socket) return;
  socket.on('trade_confirmation', callback);
};

/**
 * Listen to price alerts
 */
export const onPriceAlert = (callback) => {
  if (!socket) return;
  socket.on('price_alert', callback);
};

/**
 * Listen to price updates
 */
export const onPriceUpdate = (callback) => {
  if (!socket) return;
  socket.on('price_update', callback);
};

/**
 * Listen to general notifications
 */
export const onNotification = (callback) => {
  if (!socket) return;
  socket.on('notification', callback);
};

/**
 * Remove all listeners
 */
export const removeAllListeners = () => {
  if (!socket) return;
  socket.off('trade_confirmation');
  socket.off('price_alert');
  socket.off('price_update');
  socket.off('notification');
};

export default socket;
