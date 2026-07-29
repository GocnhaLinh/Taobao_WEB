import { Router } from 'express';
import {
  getOrCreateConversation,
  getAllConversations,
  getMessages,
  sendMessage,
  markAsRead,
  recallMessage,
  claimConversation,
  closeConversation,
  getUnreadCount,
} from '../controllers/chat.controller';

const router = Router();

// Lấy hoặc tạo phòng chat của User
router.get('/conversation/:userId', getOrCreateConversation);

// Lấy toàn bộ cuộc hội thoại dành cho Admin
router.get('/admin/conversations', getAllConversations);

// Lấy tổng số tin nhắn chưa đọc
router.get('/unread-count', getUnreadCount);

// Lấy danh sách tin nhắn của 1 phòng chat
router.get('/messages/:conversationId', getMessages);

// Gửi tin nhắn mới
router.post('/send', sendMessage);

// Đánh dấu đã đọc
router.put('/read/:conversationId', markAsRead);

// Thu hồi tin nhắn
router.delete('/messages/:messageId', recallMessage);

// Admin tiếp nhận cuộc trò chuyện (Tin nhắn chờ -> Đang hỗ trợ)
router.put('/conversations/:conversationId/claim', claimConversation);

// Đóng phiên hỗ trợ chat
router.put('/conversations/:conversationId/close', closeConversation);

export default router;
