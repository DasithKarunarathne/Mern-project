import express from 'express';
import { register, login, getProfile, updateProfile } from '../../controllers/customer/authController.js';
import { protect, customerOnly } from '../../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', protect, customerOnly, getProfile);
router.put('/profile', protect, customerOnly, updateProfile);

export default router; 