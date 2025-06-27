import express from 'express';
import { Dispute } from '../models/Dispute';
import { Order } from '../models/Order';
import { User } from '../models/User';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validation';
import Joi from 'joi';
import { Op } from 'sequelize';

const router = express.Router();

const disputeSchema = Joi.object({
  orderId: Joi.number().integer().positive().required(),
  reason: Joi.string().required(),
  description: Joi.string().required()
});

/**
 * @swagger
 * /api/disputes:
 *   post:
 *     summary: Create a dispute for an order
 *     tags: [Disputes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - reason
 *               - description
 *             properties:
 *               orderId:
 *                 type: integer
 *               reason:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Dispute created successfully
 */
router.post('/', authenticate, validate(disputeSchema), async (req: AuthRequest, res, next) => {
  try {
    const { orderId, reason, description } = req.body;

    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if user is involved in the order
    if (order.userId !== req.user!.id && order.agentId !== req.user!.id) {
      return res.status(403).json({ error: 'You are not authorized to dispute this order' });
    }

    // Check if dispute already exists
    const existingDispute = await Dispute.findOne({ where: { orderId } });
    if (existingDispute) {
      return res.status(400).json({ error: 'Dispute already exists for this order' });
    }

    const respondentId = order.userId === req.user!.id ? order.agentId! : order.userId;

    const dispute = await Dispute.create({
      orderId,
      initiatorId: req.user!.id,
      respondentId,
      reason,
      description,
      status: 'open'
    });

    res.status(201).json({ message: 'Dispute created successfully', dispute });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/disputes:
 *   get:
 *     summary: Get user's disputes
 *     tags: [Disputes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Disputes retrieved successfully
 */
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const disputes = await Dispute.findAll({
      where: {
        [Op.or]: [
          { initiatorId: req.user!.id },
          { respondentId: req.user!.id }
        ]
      },
      include: [
        { model: Order, as: 'order' },
        { model: User, as: 'initiator', attributes: ['id', 'username'] },
        { model: User, as: 'respondent', attributes: ['id', 'username'] },
        { model: User, as: 'resolver', attributes: ['id', 'username'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ disputes });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/disputes/all:
 *   get:
 *     summary: Get all disputes (admin only)
 *     tags: [Disputes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, in_review, resolved, closed]
 *     responses:
 *       200:
 *         description: All disputes retrieved successfully
 */
router.get('/all', authenticate, authorize('admin'), async (req: AuthRequest, res, next) => {
  try {
    const { status } = req.query;
    const where: any = {};
    
    if (status) {
      where.status = status;
    }

    const disputes = await Dispute.findAll({
      where,
      include: [
        { model: Order, as: 'order' },
        { model: User, as: 'initiator', attributes: ['id', 'username'] },
        { model: User, as: 'respondent', attributes: ['id', 'username'] },
        { model: User, as: 'resolver', attributes: ['id', 'username'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ disputes });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/disputes/{id}/resolve:
 *   patch:
 *     summary: Resolve a dispute (admin only)
 *     tags: [Disputes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resolution
 *             properties:
 *               resolution:
 *                 type: string
 *     responses:
 *       200:
 *         description: Dispute resolved successfully
 */
router.patch('/:id/resolve', authenticate, authorize('admin'), async (req: AuthRequest, res, next) => {
  try {
    const { resolution } = req.body;
    
    const dispute = await Dispute.findByPk(req.params.id);
    if (!dispute) {
      return res.status(404).json({ error: 'Dispute not found' });
    }

    if (dispute.status === 'resolved' || dispute.status === 'closed') {
      return res.status(400).json({ error: 'Dispute is already resolved or closed' });
    }

    await dispute.update({
      status: 'resolved',
      resolution,
      resolvedBy: req.user!.id,
      resolvedAt: new Date()
    });

    res.json({ message: 'Dispute resolved successfully', dispute });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/disputes/{id}/close:
 *   patch:
 *     summary: Close a dispute
 *     tags: [Disputes]
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
 *         description: Dispute closed successfully
 */
router.patch('/:id/close', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const dispute = await Dispute.findByPk(req.params.id);
    if (!dispute) {
      return res.status(404).json({ error: 'Dispute not found' });
    }

    // Only initiator or admin can close dispute
    if (dispute.initiatorId !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'You are not authorized to close this dispute' });
    }

    if (dispute.status === 'closed') {
      return res.status(400).json({ error: 'Dispute is already closed' });
    }

    await dispute.update({ status: 'closed' });

    res.json({ message: 'Dispute closed successfully', dispute });
  } catch (error) {
    next(error);
  }
});

export default router;