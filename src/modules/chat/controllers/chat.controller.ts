import { Request, Response } from 'express';
import * as chatService from '../services/chat.service';

/**
 * GET /api/chat/conversation/:userId
 * Lấy hoặc tạo phòng chat của User
 */
export const getOrCreateConversation = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    const conversation = await chatService.getOrCreateConversationService(userId);
    return res.json(conversation);
  } catch (error: any) {
    console.error('Error in getOrCreateConversation:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * GET /api/chat/admin/conversations
 * Lấy danh sách tất cả cuộc hội thoại cho Admin
 */
export const getAllConversations = async (req: Request, res: Response) => {
  try {
    const search = req.query.search as string | undefined;
    const status = req.query.status as string | undefined;
    const skip = req.query.skip ? parseInt(req.query.skip as string, 10) : undefined;
    const take = req.query.take ? parseInt(req.query.take as string, 10) : undefined;

    const conversations = await chatService.getAllConversationsService({
      search,
      status,
      skip,
      take,
    });
    return res.json(conversations);
  } catch (error: any) {
    console.error('Error in getAllConversations:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * GET /api/chat/messages/:conversationId
 * Lấy tin nhắn của một cuộc hội thoại
 */
export const getMessages = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const skip = req.query.skip ? parseInt(req.query.skip as string, 10) : undefined;
    const take = req.query.take ? parseInt(req.query.take as string, 10) : undefined;

    const messages = await chatService.getMessagesService(conversationId, { skip, take });
    return res.json(messages);
  } catch (error: any) {
    console.error('Error in getMessages:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * POST /api/chat/send
 * Gửi tin nhắn mới
 */
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { conversationId, senderId, senderRole, content, imageUrl } = req.body;

    if (!conversationId || !senderId || !senderRole || !content) {
      return res.status(400).json({
        error: 'conversationId, senderId, senderRole, and content are required',
      });
    }

    const message = await chatService.sendMessageService({
      conversationId,
      senderId,
      senderRole,
      content,
      imageUrl,
    });

    return res.status(201).json(message);
  } catch (error: any) {
    console.error('Error in sendMessage:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * PUT /api/chat/read/:conversationId
 * Đánh dấu đã đọc tin nhắn trong cuộc hội thoại
 */
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const { readerRole } = req.body; // 'USER' | 'ADMIN'

    if (!readerRole || (readerRole !== 'USER' && readerRole !== 'ADMIN')) {
      return res.status(400).json({ error: 'readerRole ("USER" or "ADMIN") is required' });
    }

    const result = await chatService.markAsReadService(conversationId, readerRole);
    return res.json(result);
  } catch (error: any) {
    console.error('Error in markAsRead:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * DELETE /api/chat/messages/:messageId
 * Thu hồi / Xóa tin nhắn
 */
export const recallMessage = async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const { senderId } = req.body;

    if (!messageId || !senderId) {
      return res.status(400).json({ error: 'messageId và senderId là bắt buộc.' });
    }

    const message = await chatService.recallMessageService(messageId, senderId);
    return res.json(message);
  } catch (error: any) {
    console.error('Error in recallMessage:', error);
    return res.status(400).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * PUT /api/chat/conversations/:conversationId/claim
 * Admin tiếp nhận cuộc trò chuyện từ danh sách Tin nhắn chờ
 */
export const claimConversation = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const { adminId } = req.body;

    if (!conversationId || !adminId) {
      return res.status(400).json({ error: 'conversationId và adminId là bắt buộc.' });
    }

    const conversation = await chatService.claimConversationService(conversationId, adminId);
    return res.json(conversation);
  } catch (error: any) {
    console.error('Error in claimConversation:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * PUT /api/chat/conversations/:conversationId/close
 * Đóng phiên hỗ trợ chat
 */
export const closeConversation = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;

    if (!conversationId) {
      return res.status(400).json({ error: 'conversationId là bắt buộc.' });
    }

    const conversation = await chatService.closeConversationService(conversationId);
    return res.json(conversation);
  } catch (error: any) {
    console.error('Error in closeConversation:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * GET /api/chat/unread-count
 * Lấy tổng số tin chưa đọc
 */
export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    const role = (req.query.role as string) || 'USER';

    if (!userId) {
      return res.status(400).json({ error: 'userId là bắt buộc.' });
    }

    const result = await chatService.getUnreadCountService(userId, role);
    return res.json(result);
  } catch (error: any) {
    console.error('Error in getUnreadCount:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
