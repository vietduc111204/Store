import express from 'express';
import { authMe, changePassword, signIn, signUp, logout, refresh } from '../controllers/authController.js';
import { protectedRoute } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/refresh', refresh);
router.get('/me', protectedRoute, authMe);
router.post('/change-password', protectedRoute, changePassword);
router.post('/logout', logout);

export default router;
