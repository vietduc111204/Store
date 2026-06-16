import express from 'express';
import accountRoute from './accountRoute.js';
import aiRoute from './aiRoute.js';
import categoryRoute from './categoryRoute.js';
import orderRoute from './orderRoute.js';
import paymentRoute from './paymentRoute.js';
import productRoute from './productRoute.js';
import promotionRoute from './promotionRoute.js';
import reportRoute from './reportRoute.js';
import shippingRoute from './shippingRoute.js';

const router = express.Router();

router.use(reportRoute);
router.use('/ai', aiRoute);
router.use('/danh-muc', categoryRoute);
router.use('/san-pham', productRoute);
router.use('/tai-khoan', accountRoute);
router.use('/khuyen-mai', promotionRoute);
router.use(orderRoute);
router.use(paymentRoute);
router.use(shippingRoute);

export default router;
