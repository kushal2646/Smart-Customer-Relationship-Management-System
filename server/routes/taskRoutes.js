import express from 'express';
import { body } from 'express-validator';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';
import { protect } from '../middleware/auth.js';
import validate from '../middleware/validate.js';

const router = express.Router();

router.use(protect);

router.get('/', getTasks);
router.get('/:id', getTaskById);

router.post(
  '/',
  [
    body('title').trim().notEmpty(),
    body('deadline').isISO8601(),
    body('assignedUser').notEmpty(),
  ],
  validate,
  createTask
);

router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;
