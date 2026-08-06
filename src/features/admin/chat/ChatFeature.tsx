import React, { useState, useEffect, useRef } from 'react';
import { Send, UserCheck, XCircle, Clock, Volume2, VolumeX, MessageSquare, ArrowLeft } from 'lucide-react';
import { useTranslation } from '../../../lib/i18n';
import { useDebounce } from '../../../hooks/useDebounce';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { ConversationList, type Conversation } from './components/ConversationList';
import { MessageBubble, type ChatMessage } from './components/MessageBubble';
import {
  fetchAdminConversations,
  fetchMessages,
  sendChatMessageApi,
  markChatAsReadApi,
  recallChatMessageApi,
  claimConversationApi,
  closeConversationApi,
} from '../../../services/api';

export const ChatFeature: React.FC = () => {
  const { t } = useTranslation();

  // Admin user placeholder (In production, replace with auth Context or current logged in Admin ID)
  const currentAdminId = '660000000000000000000001';

  const [activeTab, setActiveTab] = useState<'OPEN' | 'WAITING'>('OPEN');
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const debouncedSearch = useDebounce(searchQuery, 400);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessagesCountRef = useRef<number>(0);

  // Sound effect notification
  const playNotificationSound = () => {
    if (!soundEnabled) return;
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch (e) {}
  };

  // Fetch all conversations for Admin
  const loadConversations = async () => {
    try {
      const data = await fetchAdminConversations({ search: debouncedSearch });
      setConversations(data);

      // Keep active conversation reference updated
      if (selectedConv) {
        const updated = data.find((c) => c.id === selectedConv.id);
        if (updated) setSelectedConv(updated);
      }
    } catch (err) {
      console.error('Error loading conversations:', err);
    }
  };

  // Fetch messages for selected conversation
  const loadMessages = async (convId: string, autoScroll = false) => {
    try {
      const data = await fetchMessages(convId);

      // Play sound if new message arrives from USER
      if (
        data.length > prevMessagesCountRef.current &&
        prevMessagesCountRef.current > 0 &&
        data[data.length - 1]?.senderRole === 'USER'
      ) {
        playNotificationSound();
      }
      prevMessagesCountRef.current = data.length;

      setMessages(data);

      if (autoScroll) {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  };

  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 4000);
    return () => clearInterval(interval);
  }, [debouncedSearch]);

  useEffect(() => {
    if (selectedConv) {
      loadMessages(selectedConv.id, true);
      // Mark as read for ADMIN
      markChatAsReadApi(selectedConv.id, 'ADMIN');

      const msgInterval = setInterval(() => {
        loadMessages(selectedConv.id, false);
      }, 3000);
      return () => clearInterval(msgInterval);
    }
  }, [selectedConv?.id]);

  const handleSelectConv = (conv: Conversation) => {
    setSelectedConv(conv);
    prevMessagesCountRef.current = 0;
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || !selectedConv) return;

    const contentToSend = inputMsg.trim();
    setInputMsg('');

    try {
      await sendChatMessageApi({
        conversationId: selectedConv.id,
        senderId: currentAdminId,
        senderRole: 'ADMIN',
        content: contentToSend,
      });

      await loadMessages(selectedConv.id, true);
      await loadConversations();
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleClaim = async () => {
    if (!selectedConv) return;
    setIsLoading(true);
    try {
      const updated = await claimConversationApi(selectedConv.id, currentAdminId);
      setSelectedConv(updated);
      await loadConversations();
    } catch (err) {
      console.error('Error claiming conversation:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = async () => {
    if (!selectedConv) return;
    setIsLoading(true);
    try {
      await closeConversationApi(selectedConv.id);
      setSelectedConv(null);
      await loadConversations();
    } catch (err) {
      console.error('Error closing conversation:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecall = async (messageId: string) => {
    if (!selectedConv) return;
    try {
      await recallChatMessageApi(messageId, currentAdminId);
      await loadMessages(selectedConv.id, false);
    } catch (err) {
      console.error('Error recalling message:', err);
    }
  };

  const filteredConversations = conversations.filter((c) => {
    if (activeTab === 'WAITING') return c.status === 'WAITING';
    return c.status === 'OPEN';
  });

  const waitingCount = conversations.filter((c) => c.status === 'WAITING').length;
  const openCount = conversations.filter((c) => c.status === 'OPEN').length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('chatManagement')}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('chatDesc')}</p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="flex items-center gap-1.5 cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="h-4 w-4 text-emerald-500" /> : <VolumeX className="h-4 w-4 text-rose-400" />}
            <span className="text-xs">{soundEnabled ? 'Bật âm thanh' : 'Tắt âm thanh'}</span>
          </Button>
        </div>
      </div>

      <div className="h-[680px] max-h-[80vh] bg-white dark:bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm flex overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
        {/* LEFT SIDEBAR: Conversations List */}
        <ConversationList
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          conversations={filteredConversations}
          selectedConv={selectedConv}
          onSelectConv={handleSelectConv}
          openCount={openCount}
          waitingCount={waitingCount}
        />

        {/* RIGHT WORKSPACE: Chat Screen */}
        <div className={`flex-1 flex-col bg-white dark:bg-slate-900 ${selectedConv ? 'flex' : 'hidden md:flex'}`}>
          {selectedConv ? (
            <>
              {/* Header */}
              <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50/50 dark:bg-white/5 gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Mobile Back Button */}
                  <button
                    type="button"
                    onClick={() => setSelectedConv(null)}
                    className="md:hidden p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-200/60 dark:hover:bg-white/10 transition cursor-pointer shrink-0"
                    title="Quay lại danh sách"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>

                  <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-indigo-500/20 text-indigo-600 flex items-center justify-center font-bold shrink-0">
                    {selectedConv.user.avatar ? (
                      <img src={selectedConv.user.avatar} alt="avatar" className="h-full w-full rounded-full object-cover" />
                    ) : (
                      selectedConv.user.fullName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-1.5 truncate">
                      <span className="truncate">{selectedConv.user.fullName}</span>
                      <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">({selectedConv.user.email})</span>
                    </h4>
                    <div className="flex items-center gap-2 text-xs">
                      {selectedConv.status === 'WAITING' ? (
                        <Badge variant="warning" className="text-[10px] truncate">● Tin nhắn chờ</Badge>
                      ) : (
                        <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
                          ● Trực tuyến
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {selectedConv.status === 'WAITING' ? (
                    <Button variant="primary" size="sm" onClick={handleClaim} disabled={isLoading} className="flex items-center gap-1.5">
                      <UserCheck className="h-4 w-4" />
                      <span>Tiếp nhận hỗ trợ</span>
                    </Button>
                  ) : (
                    <Button variant="secondary" size="sm" onClick={handleClose} disabled={isLoading} className="flex items-center gap-1.5 text-rose-500 hover:text-rose-600">
                      <XCircle className="h-4 w-4" />
                      <span>Đóng hội thoại</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Messages Content Body */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/30 dark:bg-black/10">
                {messages.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs flex flex-col items-center justify-center h-full gap-2">
                    <Clock className="h-8 w-8 opacity-30" />
                    <span>Chưa có tin nhắn nào trong cuộc hội thoại này</span>
                  </div>
                ) : (
                  messages.map((m, index) => (
                    <div key={m.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${Math.min(index * 40, 300)}ms` }}>
                    <MessageBubble
                      message={m}
                      userFullName={selectedConv.user.fullName}
                      onRecall={handleRecall}
                    />
                  </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Form Input */}
              {selectedConv.status === 'WAITING' ? (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border-t border-amber-200 dark:border-amber-900/30 text-center">
                  <p className="text-xs text-amber-800 dark:text-amber-300 mb-2 font-medium">
                    Cuộc trò chuyện này đang ở danh sách Tin nhắn chờ. Bạn cần tiếp nhận trước khi trả lời.
                  </p>
                  <Button variant="primary" size="sm" onClick={handleClaim} disabled={isLoading}>
                    <UserCheck className="h-4 w-4 mr-1.5" />
                    Bấm vào đây để tiếp nhận hỗ trợ
                  </Button>
                </div>
              ) : (
                <form
                  onSubmit={handleSend}
                  className="p-4 border-t border-slate-200 dark:border-white/10 flex items-center gap-2 bg-slate-50 dark:bg-white/5"
                >
                  <Input
                    placeholder="Nhập tin nhắn phản hồi cho khách..."
                    value={inputMsg}
                    onChange={(e) => setInputMsg(e.target.value)}
                    className="flex-1 text-xs"
                  />
                  <Button type="submit" variant="primary" disabled={!inputMsg.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs gap-3">
              <MessageSquare className="h-12 w-12 opacity-30 text-indigo-500" />
              <p className="font-semibold text-sm text-slate-600 dark:text-slate-300">
                Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu nhắn tin
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

