import express from 'express';
import { Order } from '../models/Order';
import { User } from '../models/User';
import { Currency } from '../models/Currency';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { validate, validationSchemas } from '../middleware/validation';
import { io } from '../server';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         userId:
 *           type: integer
 *         agentId:
 *           type: integer
 *         currencyId:
 *           type: integer
 *         amount:
 *           type: number
 *         price:
 *           type: number
 *         totalValue:
 *           type: number
 *         type:
 *           type: string
 *           enum: [buy, sell]
 *         status:
 *           type: string
 *           enum: [pending, matched, confirmed, completed, cancelled]
 *         description:
 *           type: string
 */

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currencyId
 *               - amount
 *               - price
 *               - type
 *             properties:
 *               currencyId:
 *                 type: integer
 *               amount:
 *                 type: number
 *               price:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [buy, sell]
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Validation error
 */
router.post('/', authenticate, validate(validationSchemas.createOrder), async (req: AuthRequest, res, next) => {
  try {
    const { currencyId, amount, price, type, description } = req.body;

    const order = await Order.create({
      userId: req.user!.id,
      currencyId,
      amount,
      price,
      type,
      description,
      totalValue: amount * price, // Calculate total value
      status: 'pending' // Default status
    });

    // Notify all agents about new order
    io.to('agents').emit('new_order', {
      orderId: order.id,
      userId: req.user!.id,
      amount,
      price,
      type,
      currency: currencyId
    });

    res.status(201).json({ message: 'Order created successfully', order });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get user's orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, matched, confirmed, completed, cancelled]
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [buy, sell]
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 */
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { status, type } = req.query;
    const where: any = { userId: req.user!.id };

    if (status) where.status = status;
    if (type) where.type = type;

    const orders = await Order.findAll({
      where,
      include: [
        { model: Currency, as: 'currency' },
        { model: User, as: 'agent', attributes: ['id', 'username', 'role'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ orders });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/orders/pending:
 *   get:
 *     summary: Get all pending orders (agents only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pending orders retrieved successfully
 *       403:
 *         description: Access denied
 */
router.get('/pending', authenticate, authorize('agent', 'admin'), async (req: AuthRequest, res, next) => {
  try {
    const orders = await Order.findAll({
      where: { status: 'pending' },
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'role'] },
        { model: Currency, as: 'currency' }
      ],
      order: [['createdAt', 'ASC']]
    });

    res.json({ orders });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/orders/{id}/match:
 *   patch:
 *     summary: Match an order (agents only)
 *     tags: [Orders]
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
 *         description: Order matched successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Order not found
 */
router.patch('/:id/match', authenticate, authorize('agent', 'admin'), async (req: AuthRequest, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ error: 'Order is not pending' });
    }

    await order.update({
      status: 'matched',
      agentId: req.user!.id
    });

    // Notify user about order match
    io.to(`user:${order.userId}`).emit('order_matched', {
      orderId: order.id,
      agentId: req.user!.id,
      agentUsername: req.user!.username
    });

    res.json({ message: 'Order matched successfully', order });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/orders/{id}/confirm:
 *   patch:
 *     summary: Confirm order payment received (agents only)
 *     tags: [Orders]
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
 *         description: Order confirmed successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Order not found
 */
router.patch('/:id/confirm', authenticate, authorize('agent', 'admin'), async (req: AuthRequest, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status !== 'matched' || order.agentId !== req.user!.id) {
      return res.status(400).json({ error: 'Cannot confirm this order' });
    }

    await order.update({ status: 'confirmed' });

    // Notify user about order confirmation
    io.to(`user:${order.userId}`).emit('order_confirmed', {
      orderId: order.id,
      message: 'Payment confirmed by agent'
    });

    res.json({ message: 'Order confirmed successfully', order });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/orders/{id}/complete:
 *   patch:
 *     summary: Complete an order
 *     tags: [Orders]
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
 *         description: Order completed successfully
 */
router.patch('/:id/complete', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const canComplete = order.userId === req.user!.id || 
                       order.agentId === req.user!.id || 
                       req.user!.role === 'admin';

    if (!canComplete || order.status !== 'confirmed') {
      return res.status(400).json({ error: 'Cannot complete this order' });
    }

    await order.update({ status: 'completed' });

    // Notify both parties about completion
    io.to(`user:${order.userId}`).emit('order_completed', { orderId: order.id });
    if (order.agentId) {
      io.to(`user:${order.agentId}`).emit('order_completed', { orderId: order.id });
    }

    res.json({ message: 'Order completed successfully', order });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/orders/{id}/cancel:
 *   patch:
 *     summary: Cancel an order
 *     tags: [Orders]
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
 *         description: Order cancelled successfully
 */
router.patch('/:id/cancel', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const canCancel = order.userId === req.user!.id || req.user!.role === 'admin';

    if (!canCancel || order.status === 'completed') {
      return res.status(400).json({ error: 'Cannot cancel this order' });
    }

    await order.update({ status: 'cancelled' });

    // Notify agent if order was matched
    if (order.agentId) {
      io.to(`user:${order.agentId}`).emit('order_cancelled', { orderId: order.id });
    }

    res.json({ message: 'Order cancelled successfully', order });
  } catch (error) {
    next(error);
  }
});

export default router;