import { axiosClient } from './axiosClient';

export const fetchAdminConversations = async (params?: { search?: string; status?: string }) => {
  return axiosClient.get<any, any[]>('/chat/admin/conversations', { params });
};

export const fetchMessages = async (conversationId: string) => {
  return axiosClient.get<any, any[]>(`/chat/messages/${conversationId}`);
};

export const sendChatMessageApi = async (data: {
  conversationId: string;
  senderId: string;
  senderRole: 'USER' | 'ADMIN';
  content: string;
  imageUrl?: string;
}) => {
  return axiosClient.post<any, any>('/chat/send', data);
};

export const markChatAsReadApi = async (conversationId: string, readerRole: 'USER' | 'ADMIN') => {
  return axiosClient.put<any, any>(`/chat/read/${conversationId}`, { readerRole });
};

export const recallChatMessageApi = async (messageId: string, senderId: string) => {
  return axiosClient.delete<any, any>(`/chat/messages/${messageId}`, { data: { senderId } });
};

export const claimConversationApi = async (conversationId: string, adminId: string) => {
  return axiosClient.put<any, any>(`/chat/conversations/${conversationId}/claim`, { adminId });
};

export const closeConversationApi = async (conversationId: string) => {
  return axiosClient.put<any, any>(`/chat/conversations/${conversationId}/close`);
};

export const fetchUnreadChatCount = async (userId: string, role: string = 'ADMIN') => {
  return axiosClient.get<any, { unreadCount: number }>('/chat/unread-count', { params: { userId, role } });
};
