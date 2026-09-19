import { Router } from 'express';
import { getNotices, markNoticeAsRead } from '../controllers/noticesController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/', getNotices);
router.put('/:id/read', markNoticeAsRead);

export default router;
