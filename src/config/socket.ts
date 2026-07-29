import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import * as chatService from '../modules/chat/services/chat.service';

let io: Server | null = null;

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: '*', // Cho phép kết nối CORS từ bất kỳ origin nào (Frontend React)
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`⚡ Socket connected: ${socket.id}`);

    // User hoặc Admin tham gia vào phòng chat cụ thể theo conversationId
    socket.on('join_room', (conversationId: string) => {
      const roomName = `conversation_${conversationId}`;
      socket.join(roomName);
      console.log(`Socket ${socket.id} joined room: ${roomName}`);
    });

    // Rời phòng chat
    socket.on('leave_room', (conversationId: string) => {
      const roomName = `conversation_${conversationId}`;
      socket.leave(roomName);
      console.log(`Socket ${socket.id} left room: ${roomName}`);
    });

    // Admin kết nối vào phòng chờ tổng (để nhận thông báo real-time khi có bất kỳ User nào nhắn tin mới)
    socket.on('join_admin', () => {
      socket.join('admin_room');
      console.log(`Admin Socket ${socket.id} joined admin_room`);
    });

    // Lắng nghe sự kiện GỬI TIN NHẮN thời gian thực
    socket.on(
      'send_message',
      async (data: {
        conversationId: string;
        senderId: string;
        senderRole: 'USER' | 'ADMIN';
        content: string;
        imageUrl?: string;
      }) => {
        try {
          // 1. Lưu tin nhắn vào CSDL MongoDB qua chatService
          const savedMessage = await chatService.sendMessageService(data);

          const roomName = `conversation_${data.conversationId}`;

          // 2. Phát tin nhắn mới tới TẤT CẢ các thành viên trong phòng chat (Client & Admin)
          io?.to(roomName).emit('receive_message', savedMessage);

          // 3. Phát thông báo cập nhật cuộc hội thoại tới phòng Admin tổng hợp
          io?.to('admin_room').emit('conversation_updated', {
            conversationId: data.conversationId,
            lastMessage: data.content,
            senderRole: data.senderRole,
            updatedAt: new Date(),
          });
        } catch (error) {
          console.error('Error handling send_message socket event:', error);
          socket.emit('error_message', { error: 'Failed to send message' });
        }
      }
    );

    // Sự kiện ĐANG GÕ TIN NHẮN (Typing Indicator)
    socket.on('typing', (data: { conversationId: string; senderRole: string; senderName: string }) => {
      const roomName = `conversation_${data.conversationId}`;
      socket.to(roomName).emit('user_typing', data);
    });

    socket.on('stop_typing', (data: { conversationId: string; senderRole: string }) => {
      const roomName = `conversation_${data.conversationId}`;
      socket.to(roomName).emit('user_stop_typing', data);
    });

    // Sự kiện ĐÁNH DẤU ĐÃ ĐỌC real-time
    socket.on('mark_read', async (data: { conversationId: string; readerRole: 'USER' | 'ADMIN' }) => {
      try {
        await chatService.markAsReadService(data.conversationId, data.readerRole);
        const roomName = `conversation_${data.conversationId}`;
        io?.to(roomName).emit('messages_read', data);
      } catch (error) {
        console.error('Error in mark_read socket event:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io has not been initialized!');
  }
  return io;
};
