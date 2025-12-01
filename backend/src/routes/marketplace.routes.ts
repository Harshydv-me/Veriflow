import express from 'express';
import {
  getBrowseCredits,
  getCreditDetails,
  purchaseCredits,
  getTrendingProjects,
} from '../controllers/marketplace.controller';
import { auth } from '../middleware/auth';

const router = express.Router();

// Public routes (browsing)
router.get('/credits', getBrowseCredits);
router.get('/credits/:id', getCreditDetails);
router.get('/trending', getTrendingProjects);

// Protected routes (purchasing)
router.post('/purchase', auth, purchaseCredits);

export default router;
