import express from 'express';
import { sendMessage, getMessages, clearMessages } from '../controllers/ChatMessage.js';
import { isAuth } from '../middlewares/isAuth.js';

const router = express.Router();

// All routes require authentication
router.use(isAuth);

// Send a message
router.post('/send', sendMessage);

// Get messages
router.get('/messages', getMessages);

// Clear messages for a specific user
router.delete('/clear/:userId', clearMessages);

export default router; 