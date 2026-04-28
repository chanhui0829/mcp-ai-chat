import { Router } from 'express';
import { streamChat, summarizeTitle } from '../controllers/mcp';

const router = Router();

// 주소와 로직(Controller)을 매핑
router.get('/', streamChat);
router.post('/Tsummarize', summarizeTitle);

export default router;
