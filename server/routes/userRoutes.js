import express from 'express';
import { body } from 'express-validator';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getEmployees,
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roles.js';
import validate from '../middleware/validate.js';

const router = express.Router();

router.use(protect);

router.get('/employees', getEmployees);
router.get('/', authorize('admin', 'sales_manager'), getUsers);
router.get('/:id', authorize('admin', 'sales_manager'), getUserById);

router.post(
  '/',
  authorize('admin'),
  [
    body('name').trim().notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('role').isIn(['admin', 'sales_manager', 'employee']),
  ],
  validate,
  createUser
);

router.put('/:id', authorize('admin'), updateUser);
router.delete('/:id', authorize('admin'), deleteUser);

export default router;
