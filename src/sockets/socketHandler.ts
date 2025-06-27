import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { Message } from '../models/Message';
import { logger } from '../utils/logger';

export const setupSocketIO = (io: Server) => {
  // Authentication middleware for Socket.IO
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      const user = await User.findByPk(decoded.userId);

      if (!user || !user.isActive) {
        return next(new Error('Authentication error'));
      }

      socket.data.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user;
    logger.info(`User ${user.username} connected to WebSocket`);

    // Join user to their personal room
    socket.join(`user:${user.id}`);

    // Join agents to agent room
    if (user.role === 'agent') {
      socket.join('agents');
    }

    // Handle joining order rooms
    socket.on('join_order', (orderId) => {
      if (orderId) {
        socket.join(`order:${orderId}`);
        logger.info(`User ${user.username} joined order room: ${orderId}`);
      } else {
        logger.warn(`User ${user.username} tried to join order room without orderId`);
      }
    });

    // Handle leaving order rooms
    socket.on('leave_order', (orderId) => {
      if (orderId) {
        socket.leave(`order:${orderId}`);
        logger.info(`User ${user.username} left order room: ${orderId}`);
      } else {
        logger.warn(`User ${user.username} tried to leave order room without orderId`);
      }
    });

    // Handle sending messages
    socket.on('send_message', async (data) => {
      try {
        const { receiverId, orderId, content, messageType = 'text' } = data;

        // Create message in database
        const message = await Message.create({
          senderId: user.id,
          receiverId,
          orderId: orderId || null,
          content,
          messageType,
          isRead: false
        });

        // Include sender info in the message
        const messageWithSender = await Message.findByPk(message.id, {
          include: [
            { model: User, as: 'sender', attributes: ['id', 'username', 'role'] },
            { model: User, as: 'receiver', attributes: ['id', 'username', 'role'] }
          ]
        });

        // Send to receiver
        io.to(`user:${receiverId}`).emit('new_message', messageWithSender);

        // Send to order room if orderId is provided
        if (orderId) {
          socket.to(`order:${orderId}`).emit('new_order_message', messageWithSender);
        }

        // Acknowledge to sender
        socket.emit('message_sent', { messageId: message.id, success: true });

        logger.info(`Message sent from ${user.username} to user ${receiverId}`);
      } catch (error) {
        logger.error('Error sending message:', error);
        socket.emit('message_error', { error: 'Failed to send message' });
      }
    });

    // Handle order status updates
    socket.on('order_status_update', (data) => {
      const { orderId, status, userId } = data;
      
      if (orderId) {
        // Broadcast to order room
        socket.to(`order:${orderId}`).emit('order_status_changed', {
          orderId,
          status,
          updatedBy: user.id,
          timestamp: new Date()
        });
      }

      // Notify specific user if provided
      if (userId) {
        io.to(`user:${userId}`).emit('order_notification', {
          orderId: orderId || null,
          status,
          message: `Your order status has been updated to ${status}`
        });
      }

      logger.info(`Order ${orderId || 'N/A'} status updated to ${status} by ${user.username}`);
    });

    // Handle typing indicators
    socket.on('typing_start', (data) => {
      const { receiverId, orderId } = data;
      
      if (receiverId) {
        io.to(`user:${receiverId}`).emit('user_typing', {
          userId: user.id,
          username: user.username,
          orderId: orderId || null
        });
      }
      
      if (orderId) {
        socket.to(`order:${orderId}`).emit('user_typing', {
          userId: user.id,
          username: user.username,
          orderId
        });
      }
    });

    socket.on('typing_stop', (data) => {
      const { receiverId, orderId } = data;
      
      if (receiverId) {
        io.to(`user:${receiverId}`).emit('user_stopped_typing', {
          userId: user.id,
          orderId: orderId || null
        });
      }
      
      if (orderId) {
        socket.to(`order:${orderId}`).emit('user_stopped_typing', {
          userId: user.id,
          orderId
        });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`User ${user.username} disconnected from WebSocket`);
    });
  });
};