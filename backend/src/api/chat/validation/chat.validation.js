import { body, param } from 'express-validator';
import { validationErrorHandler } from '../../../middleware/validation-handler.js';

const chatIdParam = param('chatId')
  .isInt({ min: 1 })
  .withMessage('Invalid chat id');

export const createChatValidation = [
  body('title')
    .optional()
    .isString()
    .withMessage('Title must be a string')
    .trim()
    .isLength({ max: 255 })
    .withMessage('Title must be at most 255 characters long'),

  validationErrorHandler,
];

export const chatIdValidation = [chatIdParam, validationErrorHandler];

export const sendMessageValidation = [
  chatIdParam,
  body('question')
    .isString()
    .withMessage('Question is required')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Question is required')
    .isLength({ max: 4000 })
    .withMessage('Question must be at most 4000 characters long'),

  validationErrorHandler,
];

export const renameChatValidation = [
  chatIdParam,
  body('title')
    .isString()
    .withMessage('Title is required')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 255 })
    .withMessage('Title must be at most 255 characters long'),

  validationErrorHandler,
];