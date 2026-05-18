import express from 'express';
import { getDashboardStats, getActivities } from '../controllers/dashboardController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roles.js';

const router = express.Router();

router.use(protect);

router.get('/stats', getDashboardStats);
router.get('/activities', authorize('admin', 'sales_manager'), getActivities);

export default router;
