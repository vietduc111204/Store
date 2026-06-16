import express from 'express';
import { calculateFee, getDistricts, getProvinces, getWards } from '../controllers/shippingController.js';

const router = express.Router();

router.get('/van-chuyen/tinh-thanh', getProvinces);
router.get('/van-chuyen/quan-huyen', getDistricts);
router.get('/van-chuyen/phuong-xa', getWards);
router.post('/van-chuyen/tinh-phi', calculateFee);

export default router;
