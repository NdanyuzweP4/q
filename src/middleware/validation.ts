import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details.map(detail => detail.message)
      });
    }
    
    next();
  };
};

export const validationSchemas = {
  register: Joi.object({
    email: Joi.string().email().required(),
    username: Joi.string().min(3).max(50).required(),
    password: Joi.string().min(6).required(),
    firstName: Joi.string().max(50).optional(),
    lastName: Joi.string().max(50).optional(),
    role: Joi.string().valid('customer', 'agent').optional()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  createOrder: Joi.object({
    currencyId: Joi.number().integer().positive().required(),
    amount: Joi.number().positive().required(),
    price: Joi.number().positive().required(),
    type: Joi.string().valid('buy', 'sell').required(),
    description: Joi.string().max(500).optional(),
    paymentMethodIds: Joi.array().items(Joi.number().integer().positive()).optional()
  }),

  sendMessage: Joi.object({
    receiverId: Joi.number().integer().positive().required(),
    orderId: Joi.number().integer().positive().optional(),
    content: Joi.string().min(1).max(1000).required(),
    messageType: Joi.string().valid('text', 'image', 'file').optional()
  }),

  createPaymentMethod: Joi.object({
    name: Joi.string().required(),
    type: Joi.string().valid('bank_transfer', 'paypal', 'crypto', 'mobile_money', 'cash').required(),
    details: Joi.object().required()
  }),

  createDispute: Joi.object({
    orderId: Joi.number().integer().positive().required(),
    reason: Joi.string().required(),
    description: Joi.string().required()
  }),

  kycSubmission: Joi.object({
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
  })
};