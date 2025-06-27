import express from 'express';
import { walletService } from '../services/walletService';
import { nowPaymentsService } from '../services/nowPaymentsService';
import { authenticate, AuthRequest } from '../middleware/auth';
import { Currency } from '../models/Currency';

const router = express.Router();

/**
 * @swagger
 * /api/wallets:
 *   get:
 *     summary: Get user's wallets
 *     tags: [Wallets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallets retrieved successfully
 */
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const wallets = await walletService.getUserWallets(req.user!.id);
    res.json({ wallets });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/wallets/create:
 *   post:
 *     summary: Create a new wallet for a currency
 *     tags: [Wallets]
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
 *             properties:
 *               currencyId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Wallet created successfully
 */
router.post('/create', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { currencyId } = req.body;

    const currency = await Currency.findByPk(currencyId);
    if (!currency || !currency.isActive) {
      return res.status(404).json({ error: 'Currency not found or inactive' });
    }

    const wallet = await walletService.createWallet(req.user!.id, currencyId);
    res.status(201).json({ message: 'Wallet created successfully', wallet });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/wallets/balance/{currencyId}:
 *   get:
 *     summary: Get wallet balance for specific currency
 *     tags: [Wallets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: currencyId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Balance retrieved successfully
 */
router.get('/balance/:currencyId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const currencyId = parseInt(req.params.currencyId);
    const balance = await walletService.getWalletBalance(req.user!.id, currencyId);
    res.json({ balance });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/wallets/transactions:
 *   get:
 *     summary: Get transaction history
 *     tags: [Wallets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Transaction history retrieved successfully
 */
router.get('/transactions', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const transactions = await walletService.getTransactionHistory(req.user!.id, limit, offset);
    res.json({ transactions });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/wallets/deposit/create:
 *   post:
 *     summary: Create a deposit payment
 *     tags: [Wallets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - currency
 *             properties:
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *               payCurrency:
 *                 type: string
 *     responses:
 *       201:
 *         description: Deposit payment created successfully
 */
router.post('/deposit/create', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { amount, currency, payCurrency } = req.body;

    const orderId = `deposit_${req.user!.id}_${Date.now()}`;

    const payment = await nowPaymentsService.createPayment({
      price_amount: amount,
      price_currency: currency,
      pay_currency: payCurrency,
      order_id: orderId,
      order_description: `Deposit ${amount} ${currency}`,
      ipn_callback_url: `${process.env.BASE_URL || 'http://localhost:3000'}/api/wallets/deposit/callback`
    });

    res.status(201).json({ 
      message: 'Deposit payment created successfully', 
      payment 
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/wallets/deposit/callback:
 *   post:
 *     summary: Handle deposit payment callback (IPN)
 *     tags: [Wallets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Callback processed successfully
 */
router.post('/deposit/callback', async (req, res, next) => {
  try {
    const signature = req.headers['x-nowpayments-sig'] as string;
    const payload = JSON.stringify(req.body);

    if (!nowPaymentsService.verifyIPNSignature(payload, signature)) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const { payment_status, order_id, price_amount, price_currency } = req.body;

    if (payment_status === 'finished') {
      // Extract user ID from order ID
      const userId = parseInt(order_id.split('_')[1]);
      
      // Find currency
      const currency = await Currency.findOne({ where: { symbol: price_currency } });
      if (currency) {
        await walletService.updateBalance(
          userId,
          currency.id,
          parseFloat(price_amount),
          'credit',
          'deposit',
          undefined,
          { paymentId: req.body.payment_id, orderId: order_id }
        );
      }
    }

    res.json({ message: 'Callback processed successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;