import express from 'express';
import { createPaymentLink, receiveWebhook } from '../controllers/paymentController.js';

const router = express.Router();

router.post('/payment/create-link', createPaymentLink);
router.post('/payment/webhook', receiveWebhook);

export default router;
