import express from 'express';
import {
  createSubmission,
  getUserSubmissions,
  getSubmissionById,
  getAllSubmissions,
  reviewSubmission,
  getSubmissionStats,
} from '../controllers/submission.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// User routes
router.post('/', createSubmission);
router.get('/my-submissions', getUserSubmissions);
router.get('/:id', getSubmissionById);

// Admin routes
router.get('/admin/all', requireAdmin, getAllSubmissions);
router.post('/admin/:id/review', requireAdmin, reviewSubmission);
router.get('/admin/stats', requireAdmin, getSubmissionStats);

export default router;
