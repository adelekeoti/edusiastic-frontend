// src/app/(dashboard)/student/ai-assistant/page.tsx

'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChatMessage } from '@/components/ai/ChatMessage';
import { RecommendationCards } from '@/components/ai/RecommendationCards';
import { 
  Send, 
  Loader2,
  Plus,
  Trash2,
  MessageSquare,
  Bot,
  Sparkles
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { 
  startConversation, 
  sendMessage, 
  getChatHistory, 
  getAllConversations,
  deleteConversation,
  ChatMessage as ChatMessageType,
  ChatConversation,
  Recommendations
} from '@/lib/api/aiChat';
import { toast } from 'sonner';

export default function AIAssistantPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendations>({ teachers: [], products: [] });
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);

  // Email verification check
  useEffect(() => {
    if (user && !user.isVerified) {
      router.push('/verify-email-prompt');
    }
  }, [user, router]);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      setLoadingConversations(true);
      const response = await getAllConversations();
      if (response.data) {
        setConversations(response.data.conversations);
      }
    } catch (error: any) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoadingConversations(false);
    }
  };

  const handleStartNewConversation = async () => {
    try {
      setLoading(true);
      setMessages([]);
      setRecommendations({ teachers: [], products: [] });
      setCurrentChatId(null);

      const response = await startConversation();
      
      if (response.data) {
        setCurrentChatId(response.data.chatId);
        setMessages([{
          role: 'assistant',
          content: response.data.message,
          timestamp: new Date().toISOString()
        }]);
        setRecommendations(response.data.recommendations);
        loadConversations();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to start conversation');
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleLoadConversation = async (chatId: string) => {
    try {
      setLoadingChat(true);
      const response = await getChatHistory(chatId);
      
      if (response.data) {
        setCurrentChatId(response.data.chatId);
        setMessages(response.data.messages);
        setRecommendations(response.data.recommendations || { teachers: [], products: [] });
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load conversation');
    } finally {
      setLoadingChat(false);
    }
  };

  const handleDeleteConversation = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this conversation?')) {
      return;
    }

    try {
      await deleteConversation(chatId);
      toast.success('Conversation deleted');
      
      if (currentChatId === chatId) {
        setCurrentChatId(null);
        setMessages([]);
        setRecommendations({ teachers: [], products: [] });
      }
      
      loadConversations();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete conversation');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || loading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');

    // Add user message immediately to UI
    const newUserMessage: ChatMessageType = {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, newUserMessage]);

    try {
      setLoading(true);
      
      const response = await sendMessage(userMessage, currentChatId || undefined);
      
      if (response.data) {
        // Update chat ID if this was first message
        if (!currentChatId) {
          setCurrentChatId(response.data.chatId);
          loadConversations();
        }

        // Add AI response to messages
        const aiMessage: ChatMessageType = {
          role: 'assistant',
          content: response.data.message,
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, aiMessage]);
        setRecommendations(response.data.recommendations);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message');
      // Remove the user message if sending failed
      setMessages(prev => prev.slice(0, -1));
      setInputMessage(userMessage); // Restore message to input
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-180px)] flex gap-6">
        {/* Left Sidebar - Conversations */}
        <div className="w-80 flex-shrink-0 flex flex-col">
          <Card className="flex-1 flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Conversations
                </CardTitle>
                <Button 
                  size="sm" 
                  onClick={handleStartNewConversation}
                  disabled={loading}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0">
              {loadingConversations ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <Bot className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-4">
                    No conversations yet
                  </p>
                  <Button 
                    size="sm" 
                    onClick={handleStartNewConversation}
                    disabled={loading}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Start Chatting
                  </Button>
                </div>
              ) : (
                <div className="divide-y">
                  {conversations.map((conv) => (
                    <div
                      key={conv.id}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        currentChatId === conv.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                      }`}
                      onClick={() => handleLoadConversation(conv.id)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 line-clamp-2 mb-1">
                            {conv.lastMessage}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{conv.messageCount} messages</span>
                            {conv.hasRecommendations && (
                              <span className="flex items-center gap-1">
                                <Sparkles className="h-3 w-3" />
                                Recommendations
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={(e) => handleDeleteConversation(conv.id, e)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          <Card className="flex-1 flex flex-col">
            {/* Chat Header */}
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Bot className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">AI Learning Advisor</CardTitle>
                    <p className="text-sm text-gray-600">
                      {loading ? 'Typing...' : 'Here to help you find the perfect courses'}
                    </p>
                  </div>
                </div>
                {messages.length === 0 && (
                  <Button onClick={handleStartNewConversation} disabled={loading}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Chat
                  </Button>
                )}
              </div>
            </CardHeader>

            {/* Messages Area */}
            <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
              {loadingChat ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mb-4">
                    <Bot className="h-10 w-10 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Welcome to AI Assistant!
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md">
                    I'm here to help you discover the perfect teachers and courses for your learning journey.
                  </p>
                  <Button onClick={handleStartNewConversation} disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Starting...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Start Conversation
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <>
                  {messages.map((msg, idx) => (
                    <ChatMessage 
                      key={idx} 
                      message={msg} 
                      userImage={user?.profileImage}
                    />
                  ))}
                  
                  {/* Recommendations */}
                  {recommendations && (recommendations.teachers.length > 0 || recommendations.products.length > 0) && (
                    <RecommendationCards recommendations={recommendations} />
                  )}
                  
                  {/* Loading indicator */}
                  {loading && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Bot className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex items-center gap-2 bg-gray-100 rounded-2xl px-4 py-3">
                        <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
                        <span className="text-sm text-gray-600">Thinking...</span>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </>
              )}
            </CardContent>

            {/* Input Area */}
            <div className="border-t p-4">
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <Input
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask me anything about courses, teachers, or your learning goals..."
                  disabled={loading}
                  className="flex-1"
                />
                <Button type="submit" disabled={loading || !inputMessage.trim()}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}