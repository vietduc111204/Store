import express from 'express';
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from '../controllers/categoryController.js';

const router = express.Router();

router.get('/tim-kiem', listCategories);
router.post('/them', createCategory);
router.put('/sua/:id', updateCategory);
router.delete('/xoa/:id', deleteCategory);

export default router;
