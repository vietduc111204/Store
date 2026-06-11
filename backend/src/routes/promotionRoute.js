import express from 'express';
import {
  createPromotion,
  deletePromotion,
  searchPromotions,
  updatePromotion,
} from '../controllers/promotionController.js';

const router = express.Router();

router.get('/tim-kiem', searchPromotions);
router.post('/them', createPromotion);
router.put('/sua/:id', updatePromotion);
router.delete('/xoa/:id', deletePromotion);

export default router;
