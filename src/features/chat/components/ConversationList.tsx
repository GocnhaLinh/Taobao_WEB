import React from 'react';
import { Search, MessageSquare } from 'lucide-react';
import { Input } from '../../../components/ui/Input';

export interface Conversation {
  id: string;
  userId: string;
  adminId?: string;
  lastMessage?: string;
  lastMessageAt: string;
  unreadUserCount: number;
  unreadAdminCount: number;
  status: 'WAITING' | 'OPEN' | 'CLOSED' | 'DELETED';
  user: {
    id: string;
    fullName: string;
    email: string;
    avatar?: string;
  };
  admin?: {
    id: string;
    fullName: string;
    avatar?: string;
  };
}

interface ConversationListProps {
  activeTab: 'OPEN' | 'WAITING';
  setActiveTab: (tab: 'OPEN' | 'WAITING') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  conversations: Conversation[];
  selectedConv: Conversation | null;
  onSelectConv: (conv: Conversation) => void;
  openCount: number;
  waitingCount: number;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  conversations,
  selectedConv,
  onSelectConv,
  openCount,
  waitingCount,
}) => {
  return (
    <div className={`w-full md:w-80 border-r border-slate-200 dark:border-white/10 flex-col bg-slate-50/50 dark:bg-white/5 shrink-0 ${selectedConv ? 'hidden md:flex' : 'flex'}`}>
      {/* Tabs header */}
      <div className="p-3 border-b border-slate-200 dark:border-white/10 space-y-3">
        <div className="grid grid-cols-2 p-1 bg-slate-200/60 dark:bg-white/10 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('OPEN')}
            className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'OPEN'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm font-bold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <span>Đang hỗ trợ</span>
            {openCount > 0 && (
              <span className="px-1.5 py-0.2 bg-indigo-500 text-white text-[10px] rounded-full">{openCount}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('WAITING')}
            className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'WAITING'
                ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm font-bold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <span>Tin nhắn chờ</span>
            {waitingCount > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-500 text-white text-[10px] rounded-full animate-pulse">
                {waitingCount}
              </span>
            )}
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <Input
            placeholder="Tìm tên khách hàng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 py-1.5 text-xs bg-white dark:bg-slate-800"
          />
        </div>
      </div>

      {/* Conversations Items List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
        {conversations.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
            <MessageSquare className="h-8 w-8 opacity-40" />
            <span>Không tìm thấy cuộc trò chuyện nào</span>
          </div>
        ) : (
          conversations.map((conv) => {
            const isSelected = selectedConv?.id === conv.id;
            const hasUnread = conv.unreadAdminCount > 0;

            return (
              <div
                key={conv.id}
                onClick={() => onSelectConv(conv)}
                className={`p-3 cursor-pointer transition-colors flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-white/10 ${
                  isSelected ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-l-4 border-indigo-600' : ''
                }`}
              >
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-indigo-500/20 text-indigo-600 flex items-center justify-center font-bold text-sm">
                    {conv.user.avatar ? (
                      <img src={conv.user.avatar} alt="avatar" className="h-full w-full rounded-full object-cover" />
                    ) : (
                      conv.user.fullName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-slate-900 dark:text-white text-xs truncate">
                      {conv.user.fullName}
                    </h4>
                    <span className="text-[10px] text-slate-400">
                      {new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p
                    className={`text-xs truncate mt-0.5 ${
                      hasUnread ? 'font-bold text-slate-900 dark:text-white' : 'text-slate-500'
                    }`}
                  >
                    {conv.lastMessage || 'Bắt đầu cuộc trò chuyện'}
                  </p>
                </div>

                {hasUnread && (
                  <span className="h-4 min-w-4 px-1 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-sm">
                    {conv.unreadAdminCount}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
