import React, { useState } from 'react';
import {
  MessageSquare,
  Search,
  Send,
  Paperclip,
  Smile,
  Mic,
  Check,
  CheckCheck,
  Phone,
  Video,
  MoreVertical,
  PlusCircle,
  Users,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  X,
  Volume2
} from 'lucide-react';
import { ChatGroup, ChatMessage, User } from '../../types';
import { INITIAL_CHAT_GROUPS, INITIAL_CHAT_MESSAGES } from '../../data/seedData';

interface ChatViewProps {
  currentUser: User | null;
  onSendMessage: (groupId: string, text: string) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  currentUser,
  onSendMessage,
}) => {
  const [chatGroups, setChatGroups] = useState<ChatGroup[]>(INITIAL_CHAT_GROUPS);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(INITIAL_CHAT_MESSAGES);
  const [activeGroupId, setActiveGroupId] = useState<string>('group_jets');
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'club' | 'pta_teacher' | 'department'>('all');
  const [showCreateGcModal, setShowCreateGcModal] = useState(false);

  // New GC form
  const [newGcName, setNewGcName] = useState('');
  const [newGcType, setNewGcType] = useState<ChatGroup['type']>('club');
  const [newGcDesc, setNewGcDesc] = useState('');

  const activeGroup = chatGroups.find((g) => g.id === activeGroupId) || chatGroups[0];
  const activeMessages = messages[activeGroupId] || [];

  const filteredGroups = chatGroups.filter((g) => {
    if (filterType !== 'all' && g.type !== filterType) return false;
    if (searchQuery.trim()) {
      return (
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      groupId: activeGroupId,
      senderId: currentUser?.id || 'curr_user',
      senderName: currentUser?.name || 'Natasha Musonda',
      senderRole: currentUser?.role || 'student',
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'read',
    };

    setMessages((prev) => ({
      ...prev,
      [activeGroupId]: [...(prev[activeGroupId] || []), newMsg],
    }));

    // Update last message in group list
    setChatGroups((prev) =>
      prev.map((g) =>
        g.id === activeGroupId
          ? {
              ...g,
              lastMessage: `${newMsg.senderName.split(' ')[0]}: ${newMsg.text}`,
              lastMessageTime: newMsg.timestamp,
            }
          : g
      )
    );

    onSendMessage(activeGroupId, inputText.trim());
    setInputText('');
  };

  const handleCreateGcSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `group_${Date.now()}`;
    const created: ChatGroup = {
      id: newId,
      name: newGcName.trim() || 'New Discussion Forum',
      type: newGcType,
      avatar:
        newGcType === 'club'
          ? 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=100'
          : 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=100',
      description: newGcDesc.trim() || 'Official Mpatamatu Secondary School Group Chat.',
      lastMessage: 'Group Chat initialized. Welcome members!',
      lastMessageTime: 'Just now',
      unreadCount: 0,
      membersCount: 12,
      badge: newGcType === 'club' ? 'Club GC' : 'PTA & Teachers',
      isOfficial: true,
    };

    const initialWelcomeMsg: ChatMessage = {
      id: `msg_welcome_${Date.now()}`,
      groupId: newId,
      senderId: currentUser?.id || 'admin',
      senderName: currentUser?.name || 'Group Admin',
      senderRole: currentUser?.role || 'admin',
      text: `Welcome to ${created.name}! Please maintain respectful and constructive school discussions.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'read',
    };

    setChatGroups([created, ...chatGroups]);
    setMessages({ ...messages, [newId]: [initialWelcomeMsg] });
    setActiveGroupId(newId);
    setShowCreateGcModal(false);
    setNewGcName('');
    setNewGcDesc('');
  };

  return (
    <div className="bg-white dark:bg-emerald-950 rounded-3xl border border-emerald-200 dark:border-emerald-800 shadow-xl overflow-hidden flex flex-col md:flex-row h-[78vh] min-h-[550px] animate-in fade-in duration-300">
      
      {/* Left Sidebar: Chat Group Directory (WhatsApp style) */}
      <div className="w-full md:w-80 lg:w-96 border-r border-emerald-100 dark:border-emerald-800 flex flex-col bg-emerald-50/30 dark:bg-emerald-950/60">
        
        {/* WhatsApp Top Bar */}
        <div className="p-3.5 bg-emerald-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center font-bold text-xs ring-1 ring-amber-400">
              MC
            </div>
            <div>
              <h3 className="font-extrabold text-sm leading-tight">Mpatamatu Chat</h3>
              <p className="text-[10px] text-emerald-200">WhatsApp-Style School GCs</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateGcModal(true)}
            title="Create New Group Chat (GC)"
            className="p-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-amber-300 text-xs font-bold flex items-center gap-1 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">New GC</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="p-2.5 border-b border-emerald-100 dark:border-emerald-800/80">
          <div className="relative">
            <Search className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats, clubs, teachers..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-emerald-200 dark:border-emerald-700 bg-white dark:bg-emerald-900/40 text-emerald-950 dark:text-emerald-100"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 mt-2 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap ${
                filterType === 'all'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200'
              }`}
            >
              All GCs
            </button>
            <button
              type="button"
              onClick={() => setFilterType('club')}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap ${
                filterType === 'club'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200'
              }`}
            >
              Clubs GCs
            </button>
            <button
              type="button"
              onClick={() => setFilterType('pta_teacher')}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap ${
                filterType === 'pta_teacher'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200'
              }`}
            >
              PTA &amp; Faculty
            </button>
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto divide-y divide-emerald-100 dark:divide-emerald-800/60">
          {filteredGroups.map((group) => {
            const isSelected = group.id === activeGroupId;
            return (
              <div
                key={group.id}
                onClick={() => setActiveGroupId(group.id)}
                className={`p-3 flex items-center gap-3 cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-emerald-100/80 dark:bg-emerald-900/80'
                    : 'hover:bg-emerald-50 dark:hover:bg-emerald-900/30'
                }`}
              >
                <img
                  src={group.avatar}
                  alt={group.name}
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-emerald-500/30 flex-shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs sm:text-sm font-extrabold text-emerald-950 dark:text-emerald-50 truncate">
                      {group.name}
                    </h4>
                    <span className="text-[10px] text-emerald-700/80 dark:text-emerald-400 font-medium ml-1">
                      {group.lastMessageTime || ''}
                    </span>
                  </div>

                  <p className="text-xs text-emerald-800/70 dark:text-emerald-300/70 truncate mt-0.5">
                    {group.lastMessage || group.description}
                  </p>

                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
                      {group.badge || 'GC'}
                    </span>
                    <span className="text-[9px] text-emerald-600 dark:text-emerald-400">
                      {group.membersCount} members
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Right Pane: Active WhatsApp Conversation */}
      <div className="flex-1 flex flex-col h-full bg-[#efeae2] dark:bg-emerald-950/90 relative">
        
        {/* WhatsApp Chat Top Header */}
        <div className="p-3 bg-emerald-800 text-white flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center gap-3">
            <img
              src={activeGroup.avatar}
              alt={activeGroup.name}
              className="w-10 h-10 rounded-full object-cover ring-1 ring-white"
            />
            <div>
              <h4 className="font-extrabold text-sm sm:text-base leading-tight">
                {activeGroup.name}
              </h4>
              <p className="text-[11px] text-emerald-200">
                {activeGroup.membersCount} participants &bull; Official School Forum
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              title="Voice Call"
              className="p-2 rounded-full hover:bg-emerald-700 transition-colors"
            >
              <Phone className="w-4 h-4 text-emerald-200" />
            </button>
            <button
              type="button"
              title="Video Call"
              className="p-2 rounded-full hover:bg-emerald-700 transition-colors"
            >
              <Video className="w-4 h-4 text-emerald-200" />
            </button>
          </div>
        </div>

        {/* Messages Stream with WhatsApp Wallpaper Texture */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          
          {/* Security Notice Pill */}
          <div className="text-center my-2">
            <span className="inline-block px-3 py-1 rounded-lg bg-amber-100/90 text-amber-950 text-[10px] font-semibold shadow-xs">
              🔒 Messages are protected by Mpatamatu Secondary School Community Guidelines.
            </span>
          </div>

          {activeMessages.map((msg) => {
            const isMe = msg.senderId === (currentUser?.id || 'curr_user') || msg.senderName.includes(currentUser?.name || 'Natasha');
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-md p-3 rounded-2xl shadow-xs text-xs sm:text-sm ${
                    isMe
                      ? 'bg-[#d9fdd3] dark:bg-emerald-800 text-emerald-950 dark:text-emerald-50 rounded-tr-none'
                      : 'bg-white dark:bg-emerald-900 text-emerald-950 dark:text-emerald-50 rounded-tl-none border border-emerald-100 dark:border-emerald-800'
                  }`}
                >
                  {/* Sender Name and Role tag if in Group Chat */}
                  {!isMe && (
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="font-extrabold text-[11px] text-emerald-700 dark:text-amber-300">
                        {msg.senderName}
                      </span>
                      <span className="text-[9px] uppercase px-1 rounded font-bold bg-emerald-100 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200">
                        {msg.senderRole}
                      </span>
                    </div>
                  )}

                  {/* Attachment if any */}
                  {msg.attachment && (
                    <div className="mb-2 p-2.5 rounded-xl bg-black/5 dark:bg-black/20 border border-black/10 flex items-center gap-2.5">
                      {msg.attachment.type === 'pdf' ? (
                        <FileText className="w-5 h-5 text-red-600 flex-shrink-0" />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold truncate">{msg.attachment.name}</div>
                        <div className="text-[10px] opacity-75">{msg.attachment.size}</div>
                      </div>
                    </div>
                  )}

                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                  <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-emerald-700 dark:text-emerald-400">
                    <span>{msg.timestamp}</span>
                    {isMe && (
                      <CheckCheck className="w-3.5 h-3.5 text-blue-500 font-bold" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input Bar (WhatsApp style) */}
        <form
          onSubmit={handleSend}
          className="p-3 bg-white dark:bg-emerald-900/90 border-t border-emerald-100 dark:border-emerald-800 flex items-center gap-2"
        >
          <button
            type="button"
            className="p-2 text-emerald-700 dark:text-emerald-300 hover:text-emerald-900"
            title="Add Emoji"
          >
            <Smile className="w-5 h-5" />
          </button>

          <button
            type="button"
            className="p-2 text-emerald-700 dark:text-emerald-300 hover:text-emerald-900"
            title="Attach File or Worksheet"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Message ${activeGroup.name}...`}
            className="flex-1 px-4 py-2 text-xs sm:text-sm rounded-full border border-emerald-200 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/50 text-emerald-950 dark:text-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />

          <button
            type="submit"
            className="p-2.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white shadow-md flex items-center justify-center transition-transform hover:scale-105"
            aria-label="Send message"
          >
            {inputText.trim() ? <Send className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        </form>

      </div>

      {/* Modal: Create New Group Chat (GC) */}
      {showCreateGcModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-emerald-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-emerald-950 rounded-2xl shadow-2xl border border-emerald-200 dark:border-emerald-800 max-w-md w-full p-5 sm:p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-100 dark:border-emerald-800">
              <h3 className="text-base font-extrabold text-emerald-950 dark:text-emerald-50 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <span>Create New Group Chat (GC)</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateGcModal(false)}
                className="p-1 text-emerald-700 hover:bg-emerald-100 dark:text-emerald-300 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGcSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-emerald-950 dark:text-emerald-200 mb-1">
                  Group Chat Name
                </label>
                <input
                  type="text"
                  required
                  value={newGcName}
                  onChange={(e) => setNewGcName(e.target.value)}
                  placeholder="e.g. ⚽ Mpatamatu Tigers Football or 📚 Grade 10 Math GC"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900/40 text-emerald-950 dark:text-emerald-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-950 dark:text-emerald-200 mb-1">
                  GC Category Type
                </label>
                <select
                  value={newGcType}
                  onChange={(e) => setNewGcType(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900/40 text-emerald-950 dark:text-emerald-100 font-medium"
                >
                  <option value="club">Club GC (JETS, Debate, Sports, ICT)</option>
                  <option value="pta_teacher">PTA &amp; Faculty Forum</option>
                  <option value="department">Academic Department GC</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-950 dark:text-emerald-200 mb-1">
                  Description &amp; Rules
                </label>
                <textarea
                  rows={2}
                  value={newGcDesc}
                  onChange={(e) => setNewGcDesc(e.target.value)}
                  placeholder="Purpose of this group chat, meeting schedules, and guidelines..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-900/40 text-emerald-950 dark:text-emerald-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateGcModal(false)}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:underline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Create Group Chat</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
