import express from 'express';
import {
  createCustomer,
  deleteCustomer,
  listCustomers,
  updateCustomer,
} from '../controllers/customerController.js';
import {
  createEmployee,
  deleteEmployee,
  listEmployees,
  updateEmployee,
} from '../controllers/employeeController.js';

const router = express.Router();

router.get('/khach-hang/tim-kiem', listCustomers);
router.post('/khach-hang/them', createCustomer);
router.put('/khach-hang/sua/:id', updateCustomer);
router.delete('/khach-hang/xoa/:id', deleteCustomer);

router.get('/nhan-vien/tim-kiem', listEmployees);
router.post('/nhan-vien/them', createEmployee);
router.put('/nhan-vien/sua/:id', updateEmployee);
router.delete('/nhan-vien/xoa/:id', deleteEmployee);

export default router;
