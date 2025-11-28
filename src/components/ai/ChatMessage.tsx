// src/components/ai/ChatMessage.tsx

'use client';

import { Bot, User } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '@/lib/api/aiChat';

interface ChatMessageProps {
  message: ChatMessageType;
  userImage?: string;
}

export function ChatMessage({ message, userImage }: ChatMessageProps) {
  const isAI = message.role === 'assistant';

  return (
    <div className={`flex gap-3 ${isAI ? 'justify-start' : 'justify-end'}`}>
      {/* AI Avatar (left side) */}
      {isAI && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Bot className="h-5 w-5 text-white" />
          </div>
        </div>
      )}

      {/* Message Content */}
      <div className={`flex flex-col ${isAI ? 'items-start' : 'items-end'} max-w-[75%]`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isAI
              ? 'bg-gray-100 text-gray-900'
              : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>
        
        {/* Timestamp */}
        <span className="text-xs text-gray-500 mt-1 px-2">
          {new Date(message.timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      </div>

      {/* User Avatar (right side) */}
      {!isAI && (
        <div className="flex-shrink-0">
          {userImage ? (
            <img
              src={userImage}
              alt="You"
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}