import express from 'express';
import { Currency } from '../models/Currency';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * /api/currencies:
 *   get:
 *     summary: Get all active currencies
 *     tags: [Currencies]
 *     responses:
 *       200:
 *         description: Currencies retrieved successfully
 */
router.get('/', async (req, res, next) => {
  try {
    const currencies = await Currency.findAll({
      where: { isActive: true },
      order: [['name', 'ASC']]
    });

    res.json({ currencies });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/currencies:
 *   post:
 *     summary: Create a new currency (admin only)
 *     tags: [Currencies]
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
 *               - symbol
 *             properties:
 *               name:
 *                 type: string
 *               symbol:
 *                 type: string
 *               minOrderAmount:
 *                 type: number
 *               maxOrderAmount:
 *                 type: number
 *               currentPrice:
 *                 type: number
 *     responses:
 *       201:
 *         description: Currency created successfully
 */
router.post('/', authenticate, authorize('admin'), async (req: AuthRequest, res, next) => {
  try {
    const { name, symbol, minOrderAmount, maxOrderAmount, currentPrice } = req.body;

    const currency = await Currency.create({
      name,
      symbol,
      minOrderAmount: minOrderAmount || 0.00000001,
      maxOrderAmount: maxOrderAmount || 1000000,
      currentPrice: currentPrice || 0,
      isActive: true // Default value for isActive
    });

    res.status(201).json({ message: 'Currency created successfully', currency });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/currencies/{id}:
 *   put:
 *     summary: Update currency (admin only)
 *     tags: [Currencies]
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
 *               symbol:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               minOrderAmount:
 *                 type: number
 *               maxOrderAmount:
 *                 type: number
 *               currentPrice:
 *                 type: number
 *     responses:
 *       200:
 *         description: Currency updated successfully
 */
router.put('/:id', authenticate, authorize('admin'), async (req: AuthRequest, res, next) => {
  try {
    const currency = await Currency.findByPk(req.params.id);

    if (!currency) {
      return res.status(404).json({ error: 'Currency not found' });
    }

    await currency.update(req.body);

    res.json({ message: 'Currency updated successfully', currency });
  } catch (error) {
    next(error);
  }
});

export default router;