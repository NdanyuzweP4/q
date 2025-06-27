import express from 'express';
import { Subscription } from '../models/Subscription';
import { User } from '../models/User';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * /api/subscriptions:
 *   get:
 *     summary: Get all active subscriptions
 *     tags: [Subscriptions]
 *     responses:
 *       200:
 *         description: Subscriptions retrieved successfully
 */
router.get('/', async (req, res, next) => {
  try {
    const subscriptions = await Subscription.findAll({
      where: { isActive: true },
      order: [['level', 'ASC']]
    });

    res.json({ subscriptions });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/subscriptions:
 *   post:
 *     summary: Create a new subscription (admin only)
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - level
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *               level:
 *                 type: integer
 *               price:
 *                 type: number
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *               maxDailyOrders:
 *                 type: integer
 *               maxOrderAmount:
 *                 type: number
 *               tradingFeeDiscount:
 *                 type: number
 *     responses:
 *       201:
 *         description: Subscription created successfully
 */
router.post('/', authenticate, authorize('admin'), async (req: AuthRequest, res, next) => {
  try {
    const {
      name,
      level,
      price,
      features = [],
      maxDailyOrders = 10,
      maxOrderAmount = 1000,
      tradingFeeDiscount = 0
    } = req.body;

    const subscription = await Subscription.create({
      name,
      level,
      price,
      features,
      maxDailyOrders,
      maxOrderAmount,
      tradingFeeDiscount,
      isActive: true // Default value for isActive
    });

    res.status(201).json({ message: 'Subscription created successfully', subscription });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/subscriptions/{id}/subscribe:
 *   post:
 *     summary: Subscribe to a subscription plan
 *     tags: [Subscriptions]
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
 *         description: Subscription successful
 *       404:
 *         description: Subscription not found
 */
router.post('/:id/subscribe', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const subscription = await Subscription.findByPk(req.params.id);

    if (!subscription || !subscription.isActive) {
      return res.status(404).json({ error: 'Subscription not found or not active' });
    }

    // In a real application, you would process payment here
    // For now, we'll just update the user's subscription

    await User.update(
      { subscriptionId: subscription.id },
      { where: { id: req.user!.id } }
    );

    res.json({
      message: 'Subscription successful',
      subscription: {
        name: subscription.name,
        level: subscription.level,
        features: subscription.features
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/subscriptions/my-subscription:
 *   get:
 *     summary: Get current user's subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription retrieved successfully
 */
router.get('/my-subscription', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await User.findByPk(req.user!.id, {
      include: [{ model: Subscription, as: 'subscription' }]
    });

    res.json({ subscription: user?.subscriptionId || null });
  } catch (error) {
    next(error);
  }
});

export default router;