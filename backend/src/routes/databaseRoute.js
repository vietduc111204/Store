import express from 'express';
import accountRoute from './accountRoute.js';
import categoryRoute from './categoryRoute.js';
import orderRoute from './orderRoute.js';
import productRoute from './productRoute.js';
import promotionRoute from './promotionRoute.js';
import reportRoute from './reportRoute.js';

const router = express.Router();

router.use(reportRoute);
router.use('/danh-muc', categoryRoute);
router.use('/san-pham', productRoute);
router.use('/tai-khoan', accountRoute);
router.use('/khuyen-mai', promotionRoute);
router.use(orderRoute);

export default router;
