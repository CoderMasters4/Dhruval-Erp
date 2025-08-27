import { Router } from 'express';
import AuthController from '@/controllers/AuthController';

const router = Router();

// =============================================
// AUTH ROUTES (No Authentication Required)
// =============================================

// User registration
router.post('/register', AuthController.register);

// User login
router.post('/login', AuthController.login);

// Refresh token
router.post('/refresh-token', AuthController.refreshToken);

// Logout (requires authentication)
router.post('/logout', AuthController.logout);

// Health check
router.get('/health', AuthController.health);

export default router;
