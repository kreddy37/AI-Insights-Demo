'use client';

import Image from 'next/image';
import React, { useRef, useState } from 'react';
import {
  ArrowUp,
  RotateCcw,
  Sparkles,
  SparklesIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function FormattedContent({ content }: { content: string }) {
  const parts: React.ReactNode[] = [];
  const lines = content.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Check for image markdown: ![alt](url)
    if (line.match(/!\[.*?\]\(.*?\)/)) {
      const imageMatch = line.match(/!\[(.*?)\]\((.*?)\)/);
      if (imageMatch) {
        parts.push(
          <div key={`image-${parts.length}`} className="relative my-2 w-2/3">
            <Image
              src={imageMatch[2]}
              alt={imageMatch[1]}
              width={300}
              height={200}
              className="w-full rounded-lg object-contain"
              unoptimized
            />
          </div>
        );
      }
      i++;
    }
    // Check for markdown table
    else if (line.includes('|') && i + 1 < lines.length && lines[i + 1].includes('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].includes('|')) {
        const currentLine = lines[i];
        // Skip separator rows (rows with only dashes, pipes, and spaces)
        if (!currentLine.match(/^\|\s*-+(\s*\|\s*-+)*\s*\|?\s*$/)) {
          tableLines.push(currentLine);
        }
        i++;
      }

      if (tableLines.length > 0) {
        parts.push(
          <div key={`table-${parts.length}`} className="my-2 w-full overflow-x-auto">
            <table className="w-full border-collapse text-xs whitespace-nowrap">
              <tbody>
                {tableLines.map((tableLine, idx) => {
                  const cells = tableLine.split('|').filter((cell) => cell.trim());
                  const isHeader = idx === 0;
                  return (
                    <tr key={`row-${idx}`}>
                      {cells.map((cell, cellIdx) => (
                        <td
                          key={`cell-${cellIdx}`}
                          className={`border border-slate-300 px-2 py-1 ${
                            isHeader ? 'bg-slate-200 font-semibold' : ''
                          }`}
                        >
                          {cell.trim()}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      }
    }
    // Check for bullet points
    else if (line.trim().startsWith('•')) {
      parts.push(
        <div key={`bullet-${parts.length}`} className="ml-4 flex items-start gap-2">
          <span className="mt-0.5 text-slate-600">•</span>
          <span>{line.replace(/^•\s*/, '').trim()}</span>
        </div>
      );
      i++;
    }
    // Check for numbered list
    else if (/^\d+\.\s/.test(line.trim())) {
      parts.push(
        <div key={`list-${parts.length}`} className="ml-4">
          {line.trim()}
        </div>
      );
      i++;
    }
    // Check for bold section headers
    else if (line.trim().endsWith(':') && line.trim().length > 0) {
      parts.push(
        <div key={`header-${parts.length}`} className="mt-3 font-semibold text-slate-900">
          {line.trim()}
        </div>
      );
      i++;
    }
    // Regular text with preserved spacing
    else if (line.trim()) {
      parts.push(
        <div key={`text-${parts.length}`} className="whitespace-normal">
          {line.trim()}
        </div>
      );
      i++;
    } else {
      i++;
    }
  }

  return <div className="flex flex-col gap-1">{parts}</div>;
}

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const SUGGESTED_TAGS = [
  'Get Started',
  'Common Questions',
  'Best Practices',
  'Recommendations',
  'Help',
];

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>(generateSessionId());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleTagClick = (tag: string) => {
    handleSendMessage(tag);
  };

  const handleNewSession = () => {
    setSessionId(generateSessionId());
    setMessages([]);
    setInputValue('');
  };

  const handleSendMessage = async (messageToSend: string = inputValue) => {
    if (!messageToSend.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: messageToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const conversationHistory = messages.map((msg) => ({
        role: msg.type === 'user' ? ('user' as const) : ('assistant' as const),
        content: msg.content,
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageToSend,
          conversationHistory,
          sessionId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An error occurred';

      const errorAiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `I encountered an error: ${errorMessage}. Please try again.`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorAiMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-screen w-full flex-col bg-gray-50">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-2 border-b border-slate-200 bg-white px-4 py-2 sm:flex-row sm:px-6 sm:py-3">
        <div className="flex flex-1 flex-col gap-1">
          <h1 className="text-2xl font-semibold leading-tight text-gray-900 sm:text-3xl">
            AI Insights
          </h1>
          <p className="text-xs font-normal text-slate-500 sm:text-sm">
            Chat with our AI agent for insights and recommendations
          </p>
        </div>
        {messages.length > 0 && (
          <Button
            onClick={handleNewSession}
            variant="outline"
            size="sm"
            className="flex flex-shrink-0 items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            New Session
          </Button>
        )}
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto pt-2 sm:pt-3">
        {messages.length === 0 ? (
          // Initial State
          <div className="flex h-full flex-col items-center justify-center gap-4">
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
                <div className="flex items-center rounded-md bg-lime-100 px-1.5 py-0.5">
                  <div className="text-xs font-medium text-green-700">
                    Tip
                  </div>
                </div>
                <div className="text-xs font-normal text-gray-800 sm:text-sm">
                  Start by asking a question or selecting a suggestion below
                </div>
                <Sparkles className="h-4 w-4 flex-shrink-0 text-gray-900 sm:h-5 sm:w-5" />
              </div>
              <div className="text-center text-lg font-semibold text-gray-900 sm:text-xl">
                How can I help?
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTED_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className="flex items-center rounded-md border border-slate-200 px-2 py-1 text-xs transition-colors hover:bg-slate-50 sm:text-sm"
                >
                  <div className="font-medium text-slate-900">
                    {tag}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          // Messages
          <div className="flex flex-col gap-3 px-4 sm:px-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[64%] rounded-lg p-3 ${
                    message.type === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="w-full overflow-hidden text-sm font-normal leading-tight">
                    {message.type === 'user' ? (
                      message.content
                    ) : (
                      <FormattedContent content={message.content} />
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-lg bg-gray-100 p-3 text-gray-900">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
                      <div
                        className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                        style={{ animationDelay: '0.1s' }}
                      ></div>
                      <div
                        className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                        style={{ animationDelay: '0.2s' }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Chat Input */}
      <div className="flex flex-col gap-1.5 border-t border-slate-200 bg-white p-2 sm:p-3">
        <div className="w-full">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask anything?"
            className="border border-slate-200 text-sm sm:text-base"
            disabled={isLoading}
          />
        </div>
        <div className="flex justify-end gap-2">
          <SparklesIcon className="my-auto h-4 w-4 text-gray-600 sm:h-5 sm:w-5" />
          <Button
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isLoading}
            className="rounded-full bg-slate-900 p-2 hover:bg-gray-700"
            size="icon"
          >
            <ArrowUp className="h-4 w-4 text-white sm:h-5 sm:w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
