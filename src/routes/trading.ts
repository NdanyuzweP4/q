import express from 'express';
import { TradingPair } from '../models/TradingPair';
import { Currency } from '../models/Currency';
import { Order } from '../models/Order';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { Op } from 'sequelize';

const router = express.Router();

/**
 * @swagger
 * /api/trading/pairs:
 *   get:
 *     summary: Get all active trading pairs
 *     tags: [Trading]
 *     responses:
 *       200:
 *         description: Trading pairs retrieved successfully
 */
router.get('/pairs', async (req, res, next) => {
  try {
    const pairs = await TradingPair.findAll({
      where: { isActive: true },
      include: [
        { model: Currency, as: 'baseCurrency' },
        { model: Currency, as: 'quoteCurrency' }
      ],
      order: [['symbol', 'ASC']]
    });

    res.json({ pairs });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/trading/pairs:
 *   post:
 *     summary: Create a new trading pair (admin only)
 *     tags: [Trading]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - baseCurrencyId
 *               - quoteCurrencyId
 *               - symbol
 *             properties:
 *               baseCurrencyId:
 *                 type: integer
 *               quoteCurrencyId:
 *                 type: integer
 *               symbol:
 *                 type: string
 *               minOrderAmount:
 *                 type: number
 *               maxOrderAmount:
 *                 type: number
 *               tradingFee:
 *                 type: number
 *     responses:
 *       201:
 *         description: Trading pair created successfully
 */
router.post('/pairs', authenticate, authorize('admin'), async (req: AuthRequest, res, next) => {
  try {
    const {
      baseCurrencyId,
      quoteCurrencyId,
      symbol,
      minOrderAmount,
      maxOrderAmount,
      priceDecimals = 8,
      amountDecimals = 8,
      tradingFee = 0.001
    } = req.body;

    const pair = await TradingPair.create({
      baseCurrencyId,
      quoteCurrencyId,
      symbol,
      minOrderAmount: minOrderAmount || 0.00000001,
      maxOrderAmount: maxOrderAmount || 1000000,
      priceDecimals,
      amountDecimals,
      tradingFee,
      isActive: true
    });

    res.status(201).json({ message: 'Trading pair created successfully', pair });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/trading/orderbook/{pairId}:
 *   get:
 *     summary: Get order book for a trading pair
 *     tags: [Trading]
 *     parameters:
 *       - in: path
 *         name: pairId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Order book retrieved successfully
 */
router.get('/orderbook/:pairId', async (req, res, next) => {
  try {
    const pairId = parseInt(req.params.pairId);
    
    const pair = await TradingPair.findByPk(pairId);
    if (!pair) {
      return res.status(404).json({ error: 'Trading pair not found' });
    }

    // Get buy orders (bids) - highest price first
    const buyOrders = await Order.findAll({
      where: {
        currencyId: pair.baseCurrencyId,
        type: 'buy',
        status: 'pending'
      },
      order: [['price', 'DESC']],
      limit: 50
    });

    // Get sell orders (asks) - lowest price first
    const sellOrders = await Order.findAll({
      where: {
        currencyId: pair.baseCurrencyId,
        type: 'sell',
        status: 'pending'
      },
      order: [['price', 'ASC']],
      limit: 50
    });

    res.json({
      pair,
      bids: buyOrders,
      asks: sellOrders
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/trading/history/{pairId}:
 *   get:
 *     summary: Get trading history for a pair
 *     tags: [Trading]
 *     parameters:
 *       - in: path
 *         name: pairId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Trading history retrieved successfully
 */
router.get('/history/:pairId', async (req, res, next) => {
  try {
    const pairId = parseInt(req.params.pairId);
    const limit = parseInt(req.query.limit as string) || 50;
    
    const pair = await TradingPair.findByPk(pairId);
    if (!pair) {
      return res.status(404).json({ error: 'Trading pair not found' });
    }

    const trades = await Order.findAll({
      where: {
        currencyId: pair.baseCurrencyId,
        status: 'completed'
      },
      order: [['updatedAt', 'DESC']],
      limit
    });

    res.json({ trades });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/trading/stats/{pairId}:
 *   get:
 *     summary: Get 24h trading statistics for a pair
 *     tags: [Trading]
 *     parameters:
 *       - in: path
 *         name: pairId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Trading statistics retrieved successfully
 */
router.get('/stats/:pairId', async (req, res, next) => {
  try {
    const pairId = parseInt(req.params.pairId);
    
    const pair = await TradingPair.findByPk(pairId);
    if (!pair) {
      return res.status(404).json({ error: 'Trading pair not found' });
    }

    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const trades = await Order.findAll({
      where: {
        currencyId: pair.baseCurrencyId,
        status: 'completed',
        updatedAt: {
          [Op.gte]: yesterday
        }
      }
    });

    const volume = trades.reduce((sum, trade) => sum + trade.amount, 0);
    const prices = trades.map(trade => trade.price);
    const high = prices.length > 0 ? Math.max(...prices) : 0;
    const low = prices.length > 0 ? Math.min(...prices) : 0;
    const lastPrice = trades.length > 0 ? trades[0].price : 0;

    // Get price 24h ago for change calculation
    const oldTrades = await Order.findAll({
      where: {
        currencyId: pair.baseCurrencyId,
        status: 'completed',
        updatedAt: {
          [Op.lt]: yesterday
        }
      },
      order: [['updatedAt', 'DESC']],
      limit: 1
    });

    const oldPrice = oldTrades.length > 0 ? oldTrades[0].price : lastPrice;
    const priceChange = lastPrice - oldPrice;
    const priceChangePercent = oldPrice > 0 ? (priceChange / oldPrice) * 100 : 0;

    res.json({
      pair: pair.symbol,
      lastPrice,
      priceChange,
      priceChangePercent,
      high,
      low,
      volume,
      count: trades.length
    });
  } catch (error) {
    next(error);
  }
});

export default router;