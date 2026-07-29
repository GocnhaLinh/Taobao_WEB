import * as chatModel from '../models/chat.model';

/**
 * Lấy hoặc tự động tạo cuộc hội thoại cho User
 */
export const getOrCreateConversationService = async (userId: string) => {
  let conversation = await chatModel.findConversationByUserId(userId);
  if (!conversation) {
    conversation = await chatModel.createConversation(userId);
  }
  return conversation;
};

/**
 * Lấy tất cả các cuộc hội thoại cho trang Admin quản lý
 */
export const getAllConversationsService = async (params?: {
  search?: string;
  status?: string;
  skip?: number;
  take?: number;
}) => {
  return chatModel.getAllConversations(params);
};

/**
 * Gửi tin nhắn mới trong cuộc hội thoại
 */
export const sendMessageService = async (data: {
  conversationId: string;
  senderId: string;
  senderRole: 'USER' | 'ADMIN';
  content: string;
  imageUrl?: string;
}) => {
  // 1. Tạo tin nhắn trong DB
  const message = await chatModel.createChatMessage(data);

  // 2. Cập nhật lastMessage của conversation & tăng đếm tin chưa đọc
  await chatModel.updateConversationLastMessage(
    data.conversationId,
    data.content,
    data.senderRole
  );

  return message;
};

/**
 * Lấy danh sách tin nhắn của 1 phòng chat
 */
export const getMessagesService = async (
  conversationId: string,
  options?: { skip?: number; take?: number }
) => {
  return chatModel.getMessagesByConversationId(conversationId, options);
};

/**
 * Đánh dấu tin nhắn đã đọc
 */
export const markAsReadService = async (
  conversationId: string,
  readerRole: 'USER' | 'ADMIN'
) => {
  await chatModel.markMessagesAsReadInConversation(conversationId, readerRole);
  await chatModel.resetUnreadCount(conversationId, readerRole);
  return { success: true };
};

/**
 * Thu hồi tin nhắn
 */
export const recallMessageService = async (messageId: string, senderId: string) => {
  const message = await chatModel.findChatMessageById(messageId);
  if (!message) {
    throw new Error('Tin nhắn không tồn tại.');
  }

  if (message.senderId !== senderId) {
    throw new Error('Bạn không có quyền thu hồi tin nhắn này.');
  }

  return chatModel.recallChatMessage(messageId);
};

/**
 * Admin tiếp nhận cuộc trò chuyện từ danh sách Tin nhắn chờ
 */
export const claimConversationService = async (conversationId: string, adminId: string) => {
  return chatModel.claimConversation(conversationId, adminId);
};

/**
 * Đóng phiên hỗ trợ chat
 */
export const closeConversationService = async (conversationId: string) => {
  return chatModel.closeConversation(conversationId);
};

/**
 * Lấy tổng số tin nhắn chưa đọc của người dùng hoặc Admin
 */
export const getUnreadCountService = async (userId: string, role: string) => {
  const count = await chatModel.getTotalUnreadCount(userId, role);
  return { unreadCount: count };
};
