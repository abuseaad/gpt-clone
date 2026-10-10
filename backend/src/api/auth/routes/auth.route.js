import express from 'express';
import {
  registerController,
  loginController,
  meController,
} from '../controller/auth.controller.js';
import {
  registerValidation,
  loginValidation,
} from '../validation/auth.validation.js';
import { authenticateUser } from '../../../middleware/authentication.js';

const router = express.Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', registerValidation, registerController);

/**
 * @route POST /api/auth/login
 * @desc Authenticate user and get token
 * @access Public
 */
router.post('/login', loginValidation, loginController);

/**
 * @route GET /api/auth/me
 * @desc Get the logged-in user (restores the session after a page refresh)
 * @access Private
 */
router.get('/me', authenticateUser, meController);

export default router;