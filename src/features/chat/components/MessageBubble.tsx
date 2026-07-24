import React from 'react';
import { Check, CheckCheck, RotateCcw } from 'lucide-react';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: 'USER' | 'ADMIN';
  content: string;
  imageUrl?: string;
  isRead: boolean;
  isDeleted: boolean;
  createdAt: string;
  sender?: {
    id: string;
    fullName: string;
    avatar?: string;
  };
}

interface MessageBubbleProps {
  message: ChatMessage;
  userFullName: string;
  onRecall: (messageId: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, userFullName, onRecall }) => {
  const isMe = message.senderRole === 'ADMIN';

  return (
    <div className={`flex flex-col group ${isMe ? 'items-end' : 'items-start'}`}>
      <div className="flex items-end gap-1.5 max-w-[75%]">
        {!isMe && (
          <div className="h-6 w-6 rounded-full bg-slate-300 dark:bg-slate-700 text-[10px] font-bold flex items-center justify-center mb-1">
            {userFullName.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="relative group">
          <div
            className={`px-4 py-2.5 rounded-2xl text-xs leading-relaxed font-medium shadow-sm transition-all ${
              message.isDeleted
                ? 'bg-slate-200 dark:bg-white/10 text-slate-400 italic rounded-2xl'
                : isMe
                ? 'bg-indigo-600 text-white rounded-br-xs'
                : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-xs border border-slate-200 dark:border-white/10'
            }`}
          >
            {message.isDeleted ? (
              <span className="flex items-center gap-1.5">
                <RotateCcw className="h-3 w-3" />
                <span>Tin nhắn đã được thu hồi</span>
              </span>
            ) : (
              message.content
            )}
          </div>

          {/* Option to Recall (Only for admin's non-deleted messages) */}
          {isMe && !message.isDeleted && (
            <button
              onClick={() => onRecall(message.id)}
              title="Thu hồi tin nhắn"
              className="opacity-0 group-hover:opacity-100 transition-opacity absolute -left-8 top-1.5 p-1 text-slate-400 hover:text-rose-500 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-white/10 shadow-sm cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Timestamp & Read Status */}
      <div className="flex items-center gap-1 mt-1 px-1">
        <span className="text-[10px] text-slate-400">
          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
        {isMe && !message.isDeleted && (
          <span className="text-slate-400" title={message.isRead ? 'Đã xem' : 'Đã gửi'}>
            {message.isRead ? <CheckCheck className="h-3 w-3 text-emerald-500" /> : <Check className="h-3 w-3" />}
          </span>
        )}
      </div>
    </div>
  );
};
