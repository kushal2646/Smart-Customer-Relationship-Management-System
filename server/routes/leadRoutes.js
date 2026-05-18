import express from 'express';
import { body } from 'express-validator';
import {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
} from '../controllers/leadController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roles.js';
import validate from '../middleware/validate.js';

const router = express.Router();

router.use(protect);

router.get('/', getLeads);
router.get('/:id', getLeadById);

router.post(
  '/',
  [
    body('title').trim().notEmpty(),
    body('customerName').trim().notEmpty(),
    body('email').isEmail(),
  ],
  validate,
  createLead
);

router.put('/:id', updateLead);
router.delete('/:id', authorize('admin', 'sales_manager'), deleteLead);

export default router;
