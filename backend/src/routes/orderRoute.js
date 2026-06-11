import express from 'express';
import {
  createOrder,
  cancelOrder,
  deleteOrder,
  listOrderDetailsByOrder,
  searchOrders,
  updateOrder,
  updateOrderStatus,
} from '../controllers/orderController.js';

const router = express.Router();

router.get('/don-hang/tim-kiem', searchOrders);
router.get('/don-hang/:id/chi-tiet', listOrderDetailsByOrder);
router.post('/don-hang/them', createOrder);
router.put('/don-hang/sua/:id', updateOrder);
router.delete('/don-hang/xoa/:id', deleteOrder);
router.patch('/don-hang/huy/:id', cancelOrder);
router.patch('/don-hang/cap-nhat-trang-thai/:id', updateOrderStatus);

export default router;
