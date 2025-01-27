import { Router } from 'express';
import { AuthController } from '../controllers';

const router = Router();
const controller = new AuthController();

router.post('/authenticate', controller.authenticate);
router.post('/register', controller.createUser);

export const authRoutes = router;