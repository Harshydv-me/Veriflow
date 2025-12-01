import express from 'express';
import {
  getUserTasks,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats,
} from '../controllers/task.controller';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get user's tasks
router.get('/', getUserTasks);

// Get task statistics
router.get('/stats', getTaskStats);

// Create a new task
router.post('/', createTask);

// Update a task
router.put('/:id', updateTask);

// Delete a task
router.delete('/:id', deleteTask);

export default router;
