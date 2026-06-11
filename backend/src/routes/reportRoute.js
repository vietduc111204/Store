import express from 'express';
import {
  getProductStatistics,
  getRevenueStatistics,
} from '../controllers/reportController.js';

const router = express.Router();

router.get('/thong-ke/doanh-thu', getRevenueStatistics);
router.get('/thong-ke/san-pham', getProductStatistics);

export default router;
