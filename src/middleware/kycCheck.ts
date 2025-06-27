import { Request, Response, NextFunction } from 'express';
import { KYC } from '../models/KYC';
import { AuthRequest } from './auth';

export const requireKYC = (minLevel: number = 1) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const kyc = await KYC.findOne({ where: { userId: req.user.id } });

      if (!kyc || kyc.status !== 'approved' || kyc.level < minLevel) {
        return res.status(403).json({ 
          error: 'KYC verification required',
          requiredLevel: minLevel,
          currentLevel: kyc?.level || 0,
          status: kyc?.status || 'not_submitted'
        });
      }

      // Check if KYC is expired
      if (kyc.expiresAt && new Date() > kyc.expiresAt) {
        return res.status(403).json({ 
          error: 'KYC verification expired',
          expiredAt: kyc.expiresAt
        });
      }

      next();
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

export const checkTradeLimit = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const kyc = await KYC.findOne({ where: { userId: req.user.id } });
    const maxUnverifiedAmount = parseFloat(process.env.MAX_UNVERIFIED_TRADE_AMOUNT || '100');

    // If user has no KYC or unverified, check trade amount
    if (!kyc || kyc.status !== 'approved') {
      const { amount, price } = req.body;
      const totalValue = amount * price;

      if (totalValue > maxUnverifiedAmount) {
        return res.status(403).json({
          error: 'Trade amount exceeds limit for unverified users',
          maxAmount: maxUnverifiedAmount,
          requestedAmount: totalValue
        });
      }
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};