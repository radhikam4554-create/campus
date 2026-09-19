import { Router } from 'express';
import { chatWithAssistant, getChatHistory, clearChatHistory } from '../controllers/aiController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.post('/chat', chatWithAssistant);
router.get('/history', getChatHistory);
router.delete('/history', clearChatHistory);

export default router;
