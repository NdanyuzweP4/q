import express from 'express';
import { PaymentMethod } from '../models/PaymentMethod';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validation';
import Joi from 'joi';

const router = express.Router();

const paymentMethodSchema = Joi.object({
  name: Joi.string().required(),
  type: Joi.string().valid('bank_transfer', 'paypal', 'crypto', 'mobile_money', 'cash').required(),
  details: Joi.object().required()
});

/**
 * @swagger
 * /api/payments/methods:
 *   get:
 *     summary: Get user's payment methods
 *     tags: [Payment Methods]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment methods retrieved successfully
 */
router.get('/methods', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const paymentMethods = await PaymentMethod.findAll({
      where: { userId: req.user!.id, isActive: true },
      order: [['createdAt', 'DESC']]
    });

    res.json({ paymentMethods });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/payments/methods:
 *   post:
 *     summary: Add a new payment method
 *     tags: [Payment Methods]
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
 *               - type
 *               - details
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [bank_transfer, paypal, crypto, mobile_money, cash]
 *               details:
 *                 type: object
 *                 description: Payment method specific details
 *     responses:
 *       201:
 *         description: Payment method added successfully
 */
router.post('/methods', authenticate, validate(paymentMethodSchema), async (req: AuthRequest, res, next) => {
  try {
    const { name, type, details } = req.body;

    const paymentMethod = await PaymentMethod.create({
      userId: req.user!.id,
      name,
      type,
      details,
      isActive: true,
      isVerified: false
    });

    res.status(201).json({ 
      message: 'Payment method added successfully', 
      paymentMethod 
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/payments/methods/{id}:
 *   put:
 *     summary: Update payment method
 *     tags: [Payment Methods]
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
 *             properties:
 *               name:
 *                 type: string
 *               details:
 *                 type: object
 *     responses:
 *       200:
 *         description: Payment method updated successfully
 */
router.put('/methods/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const paymentMethod = await PaymentMethod.findOne({
      where: { id: req.params.id, userId: req.user!.id }
    });

    if (!paymentMethod) {
      return res.status(404).json({ error: 'Payment method not found' });
    }

    const { name, details } = req.body;
    await paymentMethod.update({ name, details });

    res.json({ message: 'Payment method updated successfully', paymentMethod });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/payments/methods/{id}:
 *   delete:
 *     summary: Delete payment method
 *     tags: [Payment Methods]
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
 *         description: Payment method deleted successfully
 */
router.delete('/methods/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const paymentMethod = await PaymentMethod.findOne({
      where: { id: req.params.id, userId: req.user!.id }
    });

    if (!paymentMethod) {
      return res.status(404).json({ error: 'Payment method not found' });
    }

    await paymentMethod.update({ isActive: false });

    res.json({ message: 'Payment method deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;