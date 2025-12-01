import express from 'express';
import {
  getWalletBalance,
  getTransactions,
  depositFunds,
  withdrawFunds,
  transferCredits,
} from '../controllers/wallet.controller';
import { auth } from '../middleware/auth';

const router = express.Router();

// All wallet routes require authentication
router.use(auth);

router.get('/balance', getWalletBalance);
router.get('/transactions', getTransactions);
router.post('/deposit', depositFunds);
router.post('/withdraw', withdrawFunds);
router.post('/transfer', transferCredits);

export default router;
