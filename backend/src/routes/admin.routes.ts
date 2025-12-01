import express from 'express';
import {
  getPendingVerifications,
  verifyFieldData,
  verifyProject,
  getAdminStats,
} from '../controllers/admin.controller';
import { auth } from '../middleware/auth';

const router = express.Router();

// All admin routes require authentication
// TODO: Add admin role check middleware
router.use(auth);

router.get('/stats', getAdminStats);
router.get('/pending', getPendingVerifications);
router.post('/verify/field-data/:id', verifyFieldData);
router.post('/verify/project/:id', verifyProject);

export default router;
