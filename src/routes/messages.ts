import express from 'express';
import { Message } from '../models/Message';
import { User } from '../models/User';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate, validationSchemas } from '../middleware/validation';
import { Op } from 'sequelize';

const router = express.Router();

/**
 * @swagger
 * /api/messages:
 *   post:
 *     summary: Send a message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - receiverId
 *               - content
 *             properties:
 *               receiverId:
 *                 type: integer
 *               orderId:
 *                 type: integer
 *               content:
 *                 type: string
 *               messageType:
 *                 type: string
 *                 enum: [text, image, file]
 *     responses:
 *       201:
 *         description: Message sent successfully
 */
router.post('/', authenticate, validate(validationSchemas.sendMessage), async (req: AuthRequest, res, next) => {
  try {
    const { receiverId, orderId, content, messageType = 'text' } = req.body;

    const message = await Message.create({
      senderId: req.user!.id,
      receiverId,
      orderId,
      content,
      messageType,
      isRead: false
    });

    const messageWithDetails = await Message.findByPk(message.id, {
      include: [
        { model: User, as: 'sender', attributes: ['id', 'username', 'role'] },
        { model: User, as: 'receiver', attributes: ['id', 'username', 'role'] }
      ]
    });

    res.status(201).json({ message: 'Message sent successfully', data: messageWithDetails });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/messages:
 *   get:
 *     summary: Get user's messages
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: orderId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: withUserId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Messages retrieved successfully
 */
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { orderId, withUserId } = req.query;
    const where: any = {
      $or: [
        { senderId: req.user!.id },
        { receiverId: req.user!.id }
      ]
    };

    if (orderId) {
      where.orderId = parseInt(orderId as string);
    }

    if (withUserId) {
      where.$or = [
        { senderId: req.user!.id, receiverId: parseInt(withUserId as string) },
        { senderId: parseInt(withUserId as string), receiverId: req.user!.id }
      ];
    }

    const messages = await Message.findAll({
      where,
      include: [
        { model: User, as: 'sender', attributes: ['id', 'username', 'role'] },
        { model: User, as: 'receiver', attributes: ['id', 'username', 'role'] }
      ],
      order: [['createdAt', 'ASC']]
    });

    res.json({ messages });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/messages/{id}/read:
 *   patch:
 *     summary: Mark message as read
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Message marked as read
 *       404:
 *         description: Message not found
 */
router.patch('/:id/read', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const message = await Message.findOne({
      where: {
        id: req.params.id,
        receiverId: req.user!.id
      }
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    await message.update({ isRead: true });

    res.json({ message: 'Message marked as read' });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/messages/conversations:
 *   get:
 *     summary: Get user's conversations
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Conversations retrieved successfully
 */
router.get('/conversations', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const conversations = await Message.findAll({
      where: {
        [Op.or]: [ 
          { senderId: req.user!.id },
          { receiverId: req.user!.id },
        ],
      },
      include: [
        { model: User, as: 'sender', attributes: ['id', 'username', 'role'] },
        { model: User, as: 'receiver', attributes: ['id', 'username', 'role'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    // Group conversations by participants
    const conversationMap = new Map();
    
    conversations.forEach(message => {
      const otherUserId = message.senderId === req.user!.id ? message.receiverId : message.senderId;
      const key = `${Math.min(req.user!.id, otherUserId)}-${Math.max(req.user!.id, otherUserId)}`;
      
      if (!conversationMap.has(key)) {
        conversationMap.set(key, {
          otherUser: message.senderId === req.user!.id ? message.receiverId : message.senderId,
          lastMessage: message,
          unreadCount: 0
        });
      }
      
      if (message.receiverId === req.user!.id && !message.isRead) {
        conversationMap.get(key).unreadCount++;
      }
    });

    res.json({ conversations: Array.from(conversationMap.values()) });
  } catch (error) {
    next(error);
  }
});

export default router;