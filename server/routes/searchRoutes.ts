import { Router } from 'express';
import { globalSearch } from '../controllers/searchController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/', globalSearch);

export default router;
