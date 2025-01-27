import { Router } from 'express';
import { TransactionController } from '../controllers/transaction-controller';
import { authMiddleware } from '../middleware/auth-middleware';

const router = Router();
const controller = new TransactionController();

// Optional authentication for these endpoints
router.get('/eth', authMiddleware(true), controller.getTransactions);
router.get('/eth/:rlphex',authMiddleware(true), controller.getRlpTransactions);
router.get('/all', controller.getAllTransactions);

// Required authentication for user transactions
router.get('/my', authMiddleware(false), controller.getUserTransactions);

export const transactionRoutes = router;