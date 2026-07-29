import { prisma } from '../../../config/prisma';
import { isNotEmpty } from '../../../utils/prisma-helpers';

// -------------------------------------------------------------
// Conversation Queries
// -------------------------------------------------------------

/**
 * Tìm phòng chat đang mở của một User
 */
export const findConversationByUserId = async (userId: string) => {
  return prisma.conversation.findFirst({
    where: {
      userId,
      status: { in: ['WAITING', 'OPEN'] },
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          avatar: true,
          role: true,
        },
      },
      admin: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
        },
      },
    },
  });
};

/**
 * Tạo mới một phòng chat cho User (Mặc định ở trạng thái WAITING - tin nhắn chờ)
 */
export const createConversation = async (userId: string, adminId?: string) => {
  return prisma.conversation.create({
    data: {
      userId,
      adminId,
      status: adminId ? 'OPEN' : 'WAITING',
      lastMessageAt: new Date(),
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          avatar: true,
          role: true,
        },
      },
      admin: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
        },
      },
    },
  });
};

/**
 * Lấy chi tiết phòng chat theo ID
 */
export const findConversationById = async (id: string) => {
  return prisma.conversation.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          avatar: true,
        },
      },
      admin: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
        },
      },
    },
  });
};

/**
 * Lấy tất cả các cuộc hội thoại dành cho trang Admin quản lý
 */

export const getAllConversations = async (params: {
  search?: string;
  status?: string;
  skip?: number;
  take?: number;
} = {}) => {
  const { search, status, skip, take } = params;

  return prisma.conversation.findMany({
    where: {
      ...(status && { status }),
      ...(isNotEmpty(search) && {
        user: {
          OR: [
            { fullName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        },
      }),
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          avatar: true,
        },
      },
      admin: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
        },
      },
    },
    orderBy: {
      lastMessageAt: 'desc',
    },
    skip,
    take,
  });
};

/**
 * Cập nhật tin nhắn mới nhất và tăng đếm tin chưa đọc của bên nhận
 */
export const updateConversationLastMessage = async (
  id: string,
  lastMessage: string,
  senderRole: string
) => {
  const isSentByUser = senderRole === 'USER';

  return prisma.conversation.update({
    where: { id },
    data: {
      lastMessage,
      lastMessageAt: new Date(),
      ...(isSentByUser
        ? { unreadAdminCount: { increment: 1 } }
        : { unreadUserCount: { increment: 1 } }),
    },
  });
};

/**
 * Đặt lại số lượng tin chưa đọc về 0 khi đọc tin nhắn
 */
export const resetUnreadCount = async (id: string, readerRole: 'USER' | 'ADMIN') => {
  return prisma.conversation.update({
    where: { id },
    data: {
      ...(readerRole === 'USER' ? { unreadUserCount: 0 } : { unreadAdminCount: 0 }),
    },
  });
};

// -------------------------------------------------------------
// ChatMessage Queries
// -------------------------------------------------------------

/**
 * Tạo một tin nhắn mới trong CSDL
 */
export const createChatMessage = async (data: {
  conversationId: string;
  senderId: string;
  senderRole: string;
  content: string;
  imageUrl?: string;
}) => {
  return prisma.chatMessage.create({
    data: {
      conversationId: data.conversationId,
      senderId: data.senderId,
      senderRole: data.senderRole,
      content: data.content,
      imageUrl: data.imageUrl,
    },
    include: {
      sender: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
          role: true,
        },
      },
    },
  });
};

/**
 * Lấy lịch sử tin nhắn của một cuộc hội thoại
 */
export const getMessagesByConversationId = async (
  conversationId: string,
  options: { skip?: number; take?: number } = {}
) => {
  const { skip, take } = options;

  return prisma.chatMessage.findMany({
    where: { conversationId },
    include: {
      sender: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
          role: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
    skip,
    take,
  });
};

/**
 * Đánh dấu tất cả tin nhắn đối phương gửi là ĐÃ ĐỌC (isRead = true)
 */
export const markMessagesAsReadInConversation = async (
  conversationId: string,
  readerRole: 'USER' | 'ADMIN'
) => {
  // Nếu readerRole là USER thì đọc các tin nhắn do ADMIN gửi và ngược lại
  const targetSenderRole = readerRole === 'USER' ? 'ADMIN' : 'USER';

  return prisma.chatMessage.updateMany({
    where: {
      conversationId,
      senderRole: targetSenderRole,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });
};

/**
 * Admin tiếp nhận cuộc trò chuyện từ danh sách Tin nhắn chờ (WAITING -> OPEN)
 */
export const claimConversation = async (conversationId: string, adminId: string) => {
  return prisma.conversation.update({
    where: { id: conversationId },
    data: {
      adminId,
      status: 'OPEN',
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          avatar: true,
        },
      },
      admin: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
        },
      },
    },
  });
};

/**
 * Đóng phiên hỗ trợ (OPEN -> CLOSED)
 */
export const closeConversation = async (conversationId: string) => {
  return prisma.conversation.update({
    where: { id: conversationId },
    data: {
      status: 'CLOSED',
    },
  });
};

/**
 * Tìm tin nhắn theo ID
 */
export const findChatMessageById = async (id: string) => {
  return prisma.chatMessage.findUnique({
    where: { id },
  });
};

/**
 * Thu hồi / Xóa tin nhắn (chuyển status thành DELETED, isDeleted = true)
 */
export const recallChatMessage = async (id: string) => {
  return prisma.chatMessage.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
      content: 'Tin nhắn đã được thu hồi',
    },
  });
};

/**
 * Lấy tổng số tin nhắn chưa đọc đối với User hoặc Admin
 */
export const getTotalUnreadCount = async (userId: string, role: string) => {
  if (role === 'ADMIN') {
    const aggregate = await prisma.conversation.aggregate({
      _sum: {
        unreadAdminCount: true,
      },
      where: {
        status: { in: ['WAITING', 'OPEN'] },
      },
    });
    return aggregate._sum.unreadAdminCount || 0;
  } else {
    const aggregate = await prisma.conversation.aggregate({
      _sum: {
        unreadUserCount: true,
      },
      where: {
        userId,
        status: { in: ['WAITING', 'OPEN'] },
      },
    });
    return aggregate._sum.unreadUserCount || 0;
  }
};
