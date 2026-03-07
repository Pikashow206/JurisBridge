const express = require('express');
const router = express.Router();

// Controller
const {
  sendMessage,
  getMessages,
  getUnreadCount,
} = require('../controllers/chatController');

// Middleware
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/upload');

// All chat routes require authentication
router.use(protect);

// ========================
// CHAT ROUTES
// ========================

// GET /api/chat/unread — Get unread message count
router.get('/unread', getUnreadCount);

// POST /api/chat/:caseId/messages — Send a message (with optional file attachments)
router.post('/:caseId/messages', upload.array('attachments', 5), sendMessage);

// GET /api/chat/:caseId/messages — Get messages for a case
router.get('/:caseId/messages', getMessages);

module.exports = router;