import express from 'express';
import {
  createProduct,
  deleteProduct,
  listProducts,
  updateProduct,
} from '../controllers/productController.js';

const router = express.Router();

router.get('/tim-kiem', listProducts);
router.post('/them', createProduct);
router.put('/sua/:id', updateProduct);
router.delete('/xoa/:id', deleteProduct);

export default router;
