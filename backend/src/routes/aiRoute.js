import express from 'express';
import { adviseCustomer, testAiConnection } from '../controllers/aiController.js';

const router = express.Router();

router.post('/tu-van', adviseCustomer);
router.get('/test', testAiConnection);

export default router;
