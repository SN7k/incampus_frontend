import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../types';
import { mockUsers } from '../data/mockData';
import { Send, Search, MessageSquare, ChevronLeft } from 'lucide-react';
import Button from '../components/ui/Button';

// Mock conversation data
interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  read: boolean;
}

interface Conversation {
  id: string;
  participantId: string;
  participant: User;
  messages: Message[];
  lastMessageTime: Date;
}

// Create mock conversations
const mockConversations: Conversation[] = [
  {
    id: '1',
    participantId: '1',
    participant: mockUsers[0],
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    messages: [
      {
        id: '1',
        senderId: '1',
        text: 'Hey, how are you doing?',
        timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        read: true
      },
      {
        id: '2',
        senderId: 'current',
        text: 'I\'m good! Just working on my final project.',
        timestamp: new Date(Date.now() - 1000 * 60 * 55), // 55 minutes ago
        read: true
      },
      {
        id: '3',
        senderId: '1',
        text: 'That sounds interesting! What\'s it about?',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        read: false
      }
    ]
  },
  {
    id: '2',
    participantId: '2',
    participant: mockUsers[1],
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
    messages: [
      {
        id: '1',
        senderId: 'current',
        text: 'Did you get the notes from today\'s lecture?',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
        read: true
      },
      {
        id: '2',
        senderId: '2',
        text: 'Yes, I\'ll send them to you!',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
        read: true
      }
    ]
  },
  {
    id: '3',
    participantId: '3',
    participant: mockUsers[2],
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    messages: [
      {
        id: '1',
        senderId: '3',
        text: 'Please submit your assignment by Friday.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
        read: true
      },
      {
        id: '2',
        senderId: 'current',
        text: 'I\'ll have it ready, Professor!',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        read: true
      }
    ]
  }
];

const Messages: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  
  if (!user) return null;

  const filteredConversations = conversations.filter(conv => 
    conv.participant.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeConversation) return;
    
    const newMessageObj: Message = {
      id: Date.now().toString(),
      senderId: 'current',
      text: newMessage,
      timestamp: new Date(),
      read: true
    };
    
    setConversations(prev => 
      prev.map(conv => 
        conv.id === activeConversation.id 
          ? {
              ...conv,
              messages: [...conv.messages, newMessageObj],
              lastMessageTime: new Date()
            }
          : conv
      )
    );
    
    // Simulate a reply after 1 second
    setTimeout(() => {
      if (activeConversation) {
        const replyMessage: Message = {
          id: (Date.now() + 1).toString(),
          senderId: activeConversation.participantId,
          text: getRandomReply(),
          timestamp: new Date(),
          read: false
        };
        
        setConversations(prev => 
          prev.map(conv => 
            conv.id === activeConversation.id 
              ? {
                  ...conv,
                  messages: [...conv.messages, replyMessage],
                  lastMessageTime: new Date()
                }
              : conv
          )
        );
      }
    }, 1000);
    
    setNewMessage('');
  };
  
  // Function to generate random replies
  const getRandomReply = () => {
    const replies = [
      "That sounds interesting!",
      "I'll get back to you on that soon.",
      "Thanks for letting me know!",
      "Could you tell me more about that?",
      "I appreciate your message.",
      "Let's discuss this further when we meet.",
      "Great idea! I'm on board.",
      "I'll check and let you know.",
      "Sure, that works for me.",
      "I'm not sure I understand. Could you explain?"
    ];
    
    return replies[Math.floor(Math.random() * replies.length)];
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="pt-2 pb-16 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
          style={{ height: 'calc(100vh - 140px)' }}
        >
          <div className="flex h-full">
            {/* Conversations list */}
            <div className="w-full md:w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    className="w-full py-2 pl-10 pr-4 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500">
                    <Search size={18} />
                  </div>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.map(conversation => (
                  <div
                    key={conversation.id}
                    className={`flex items-center p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                      activeConversation?.id === conversation.id ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                    }`}
                    onClick={() => {
                      setActiveConversation(conversation);
                      setShowMobileChat(true); // Show mobile chat view when conversation is selected
                    }}
                  >
                    <img
                      src={conversation.participant.avatar}
                      alt={conversation.participant.name}
                      className="w-12 h-12 rounded-full object-cover mr-3"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {conversation.participant.name}
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTime(conversation.lastMessageTime)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {conversation.messages[conversation.messages.length - 1].text}
                      </p>
                    </div>
                    {conversation.messages.some(m => m.senderId !== 'current' && !m.read) && (
                      <span className="ml-2 w-3 h-3 bg-blue-600 rounded-full"></span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Conversation view - Desktop */}
            <div className="hidden md:flex flex-col w-2/3">
              {activeConversation ? (
                <>
                  {/* Conversation header */}
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
                    <img
                      src={activeConversation.participant.avatar}
                      alt={activeConversation.participant.name}
                      className="w-10 h-10 rounded-full object-cover mr-3"
                    />
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        {activeConversation.participant.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {activeConversation.participant.role === 'student' 
                          ? `${activeConversation.participant.program}, ${activeConversation.participant.batch}`
                          : activeConversation.participant.program}
                      </p>
                    </div>
                  </div>
                  
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {activeConversation.messages.map(message => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderId === 'current' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 ${
                            message.senderId === 'current'
                              ? 'bg-blue-600 text-white rounded-br-none'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
                          }`}
                        >
                          <p>{message.text}</p>
                          <p className={`text-xs mt-1 text-right ${
                            message.senderId === 'current' ? 'text-blue-200' : 'text-gray-500'
                          }`}>
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Message input */}
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex">
                      <input
                        type="text"
                        placeholder="Type a message..."
                        className="flex-1 py-2 px-4 rounded-l-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSendMessage();
                          }
                        }}
                      />
                      <Button
                        variant="primary"
                        className="rounded-l-none"
                        onClick={handleSendMessage}
                      >
                        <Send size={18} />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    <MessageSquare size={48} className="mx-auto mb-4 text-gray-400 dark:text-gray-600" />
                    <p>Select a conversation to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Mobile conversation view - Appears as overlay when a conversation is selected */}
          {showMobileChat && activeConversation && (
            <div className="md:hidden fixed inset-0 bg-white dark:bg-gray-800 z-50 flex flex-col" style={{ paddingBottom: '70px' }}>
              {/* Mobile conversation header with back button */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
                <button 
                  onClick={() => setShowMobileChat(false)} 
                  className="mr-3 text-gray-600 dark:text-gray-400"
                >
                  <ChevronLeft size={24} />
                </button>
                <img
                  src={activeConversation.participant.avatar}
                  alt={activeConversation.participant.name}
                  className="w-10 h-10 rounded-full object-cover mr-3"
                />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    {activeConversation.participant.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {activeConversation.participant.role === 'student' 
                      ? `${activeConversation.participant.program}, ${activeConversation.participant.batch}`
                      : activeConversation.participant.program}
                  </p>
                </div>
              </div>
              
              {/* Mobile messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {activeConversation.messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === 'current' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 ${
                        message.senderId === 'current'
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
                      }`}
                    >
                      <p>{message.text}</p>
                      <p className={`text-xs mt-1 text-right ${
                        message.senderId === 'current' ? 'text-blue-200' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Mobile message input */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="flex">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 py-3 px-4 rounded-l-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:outline-none"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSendMessage();
                      }
                    }}
                    autoFocus
                  />
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-r-lg px-6 py-3 focus:outline-none flex items-center justify-center"
                    onClick={handleSendMessage}
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Messages;
