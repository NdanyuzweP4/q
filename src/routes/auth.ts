import express from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User } from '../models/User';
import { validate, validationSchemas } from '../middleware/validation';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Validate JWT_SECRET at startup
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev';
if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET environment variable is required in production');
}

// Default JWT expiration (ensure it matches StringValue or number)
type JwtExpiresIn = string | number; // You can refine this to specific string literals if needed
const JWT_EXPIRES_IN: JwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - username
 *         - password
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the user
 *         email:
 *           type: string
 *           description: The user's email address
 *         username:
 *           type: string
 *           description: The user's unique username
 *         role:
 *           type: string
 *           enum: [admin, agent, customer]
 *           description: The user's role in the system
 *         isActive:
 *           type: boolean
 *           description: Whether the user account is active
 *         walletBalance:
 *           type: number
 *           description: The user's wallet balance
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - username
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [customer, agent]
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: User already exists
 */
router.post('/register', validate(validationSchemas.register), async (req, res, next) => {
  try {
    const { email, username, password, firstName, lastName, role = 'customer' } = req.body;

    const user = await User.create({
      email,
      username,
      password,
      firstName,
      lastName,
      role,
      isActive: true,
      isVerified: false,
      walletBalance: 0,
    });

    const payload = { userId: user.id };
    

    const token = jwt.sign(payload, JWT_SECRET);

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        isActive: user.isActive,
        walletBalance: user.walletBalance,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid credentials
 *       401:
 *         description: User not active
 */
router.post('/login', validate(validationSchemas.login), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user || !(await user.validatePassword(password))) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is not active' });
    }

    const payload = { userId: user.id };

    const token = jwt.sign(payload, JWT_SECRET);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        isActive: user.isActive,
        walletBalance: user.walletBalance,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Authentication required
 */
router.get('/me', authenticate, async (req: AuthRequest, res) => {
  res.json({
    user: {
      id: req.user!.id,
      email: req.user!.email,
      username: req.user!.username,
      firstName: req.user!.firstName,
      lastName: req.user!.lastName,
      role: req.user!.role,
      isActive: req.user!.isActive,
      isVerified: req.user!.isVerified,
      walletBalance: req.user!.walletBalance,
      subscriptionId: req.user!.subscriptionId,
    },
  });
});

export default router;