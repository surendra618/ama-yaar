const { Server } = require('socket.io');

let io = null;

function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    // When a customer connects and joins their private user room
    socket.on('join_user_room', (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
      }
    });

    // When an admin connects and joins the admin broadcast room
    socket.on('join_admin_room', () => {
      socket.join('admin_channel');
    });

    // When a user tracks an individual order live
    socket.on('join_order_room', (orderId) => {
      if (orderId) {
        socket.join(`order_${orderId}`);
      }
    });

    socket.on('disconnect', () => {});
  });

  return io;
}

function getIO() {
  return io;
}

/**
 * Emit an event to all connected admin dashboards
 * (e.g. new orders placed, return requested, low stock alert)
 */
function emitAdminEvent(event, data) {
  if (io) {
    io.to('admin_channel').emit(event, data);
  }
}

/**
 * Emit a private notification or order update to a specific customer
 */
function emitUserEvent(userId, event, data) {
  if (io && userId) {
    io.to(`user_${userId}`).emit(event, data);
  }
}

/**
 * Emit an update for a specific order (e.g., Live Tracking changes, Delivery status)
 */
function emitOrderEvent(orderId, event, data) {
  if (io && orderId) {
    io.to(`order_${orderId}`).emit(event, data);
  }
}

module.exports = {
  initSocket,
  getIO,
  emitAdminEvent,
  emitUserEvent,
  emitOrderEvent,
};
