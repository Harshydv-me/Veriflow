import express from 'express';
import {
  createProject,
  getProjects,
  getProjectById,
  getAllProjects,
  updateProjectStatus,
} from '../controllers/project.controller';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.post('/', protect, createProject);
router.get('/', protect, getProjects);
router.get('/all', protect, authorize('verifier', 'admin'), getAllProjects);
router.get('/:projectId', protect, getProjectById);
router.put('/:projectId/status', protect, authorize('verifier', 'admin'), updateProjectStatus);

export default router;
