import express from 'express';
import multer from 'multer';
import path from 'path';
import { KYC } from '../models/KYC';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validation';
import Joi from 'joi';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_PATH || 'uploads/kyc');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only JPEG, JPG, PNG, and PDF files are allowed'));
    }
  }
});

const kycValidationSchema = Joi.object({
  documentType: Joi.string().valid('passport', 'id_card', 'driving_license').required(),
  documentNumber: Joi.string().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  dateOfBirth: Joi.date().required(),
  nationality: Joi.string().required(),
  address: Joi.string().required(),
  city: Joi.string().required(),
  postalCode: Joi.string().required(),
  country: Joi.string().required()
});

/**
 * @swagger
 * /api/kyc/submit:
 *   post:
 *     summary: Submit KYC verification
 *     tags: [KYC]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - documentType
 *               - documentNumber
 *               - firstName
 *               - lastName
 *               - dateOfBirth
 *               - nationality
 *               - address
 *               - city
 *               - postalCode
 *               - country
 *               - documentFront
 *               - selfie
 *             properties:
 *               documentType:
 *                 type: string
 *                 enum: [passport, id_card, driving_license]
 *               documentNumber:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               nationality:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               postalCode:
 *                 type: string
 *               country:
 *                 type: string
 *               documentFront:
 *                 type: string
 *                 format: binary
 *               documentBack:
 *                 type: string
 *                 format: binary
 *               selfie:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: KYC verification submitted successfully
 */
router.post('/submit', 
  authenticate, 
  upload.fields([
    { name: 'documentFront', maxCount: 1 },
    { name: 'documentBack', maxCount: 1 },
    { name: 'selfie', maxCount: 1 }
  ]),
  validate(kycValidationSchema),
  async (req: AuthRequest, res, next) => {
    try {
      const existingKYC = await KYC.findOne({ where: { userId: req.user!.id } });
      
      if (existingKYC && existingKYC.status === 'approved') {
        return res.status(400).json({ error: 'KYC already approved' });
      }

      if (existingKYC && existingKYC.status === 'pending') {
        return res.status(400).json({ error: 'KYC verification already pending' });
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      if (!files.documentFront || !files.selfie) {
        return res.status(400).json({ error: 'Document front and selfie are required' });
      }

      const kycData = {
        userId: req.user!.id,
        level: 1,
        status: 'pending' as const,
        ...req.body,
        documentFrontUrl: files.documentFront[0].path,
        documentBackUrl: files.documentBack ? files.documentBack[0].path : null,
        selfieUrl: files.selfie[0].path,
        dateOfBirth: new Date(req.body.dateOfBirth)
      };

      let kyc;
      if (existingKYC) {
        kyc = await existingKYC.update(kycData);
      } else {
        kyc = await KYC.create(kycData);
      }

      res.status(201).json({ 
        message: 'KYC verification submitted successfully', 
        kyc: {
          id: kyc.id,
          status: kyc.status,
          level: kyc.level,
          createdAt: kyc.createdAt
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/kyc/status:
 *   get:
 *     summary: Get KYC verification status
 *     tags: [KYC]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: KYC status retrieved successfully
 */
router.get('/status', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const kyc = await KYC.findOne({ where: { userId: req.user!.id } });
    
    if (!kyc) {
      return res.json({ status: 'not_submitted', level: 0 });
    }

    res.json({
      status: kyc.status,
      level: kyc.level,
      rejectionReason: kyc.rejectionReason,
      verifiedAt: kyc.verifiedAt,
      expiresAt: kyc.expiresAt
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/kyc/pending:
 *   get:
 *     summary: Get all pending KYC verifications (admin only)
 *     tags: [KYC]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pending KYC verifications retrieved successfully
 */
router.get('/pending', authenticate, authorize('admin'), async (req: AuthRequest, res, next) => {
  try {
    const pendingKYCs = await KYC.findAll({
      where: { status: 'pending' },
      include: [
        { model: require('../models/User').User, as: 'user', attributes: ['id', 'username', 'email'] }
      ],
      order: [['createdAt', 'ASC']]
    });

    res.json({ kycs: pendingKYCs });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/kyc/{id}/review:
 *   patch:
 *     summary: Review KYC verification (admin only)
 *     tags: [KYC]
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *               rejectionReason:
 *                 type: string
 *               level:
 *                 type: integer
 *     responses:
 *       200:
 *         description: KYC verification reviewed successfully
 */
router.patch('/:id/review', authenticate, authorize('admin'), async (req: AuthRequest, res, next) => {
  try {
    const { status, rejectionReason, level = 1 } = req.body;
    
    const kyc = await KYC.findByPk(req.params.id);
    if (!kyc) {
      return res.status(404).json({ error: 'KYC verification not found' });
    }

    if (kyc.status !== 'pending') {
      return res.status(400).json({ error: 'KYC verification is not pending' });
    }

    const updateData: any = { status, level };
    
    if (status === 'approved') {
      updateData.verifiedAt = new Date();
      updateData.expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
    } else if (status === 'rejected') {
      updateData.rejectionReason = rejectionReason;
    }

    await kyc.update(updateData);

    res.json({ message: 'KYC verification reviewed successfully', kyc });
  } catch (error) {
    next(error);
  }
});

export default router;