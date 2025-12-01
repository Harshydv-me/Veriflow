import express from 'express';
import {
  submitFieldData,
  getFieldDataByProject,
  getFieldDataById,
  verifyFieldData,
  getAllFieldData,
} from '../controllers/fieldData.controller';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.post('/', protect, submitFieldData);
router.get('/all', protect, authorize('verifier', 'admin'), getAllFieldData);
router.get('/project/:projectId', protect, getFieldDataByProject);
router.get('/:dataId', protect, getFieldDataById);
router.put('/:dataId/verify', protect, authorize('verifier', 'admin'), verifyFieldData);

export default router;
