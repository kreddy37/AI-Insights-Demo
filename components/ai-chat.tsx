'use client';

import Image from 'next/image';
import React, { useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ArrowUp,
  RotateCcw,
  Sparkles,
  SparklesIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function FormattedContent({ content }: { content: string }) {
  return (
    <div className="prose prose-sm max-w-none text-gray-900">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ ...props }) => <h1 className="text-xl font-bold mb-2" {...props} />,
          h2: ({ ...props }) => <h2 className="text-lg font-bold mb-2 mt-3" {...props} />,
          h3: ({ ...props }) => <h3 className="text-base font-bold mb-2 mt-2" {...props} />,
          h4: ({ ...props }) => <h4 className="font-bold mb-2" {...props} />,
          p: ({ ...props }) => <p className="mb-2" {...props} />,
          strong: ({ ...props }) => <strong className="font-semibold" {...props} />,
          em: ({ ...props }) => <em className="italic" {...props} />,
          ul: ({ ...props }) => <ul className="ml-4 mb-2 list-disc" {...props} />,
          ol: ({ ...props }) => <ol className="ml-4 mb-2 list-decimal" {...props} />,
          li: ({ ...props }) => <li className="mb-1" {...props} />,
          code: ({ node, inline, children, ...props }: any) =>
            inline ? (
              <code className="bg-slate-200 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                {children}
              </code>
            ) : (
              <code className="block bg-slate-100 p-2 rounded mb-2 overflow-x-auto font-mono text-sm" {...props}>
                {children}
              </code>
            ),
          blockquote: ({ ...props }) => (
            <blockquote className="border-l-4 border-slate-300 pl-4 py-2 my-2 italic text-slate-700" {...props} />
          ),
          table: ({ ...props }) => (
            <div className="my-4 w-full overflow-x-auto rounded-lg border border-slate-300">
              <table className="w-full border-collapse text-sm" {...props} />
            </div>
          ),
          thead: ({ ...props }) => <thead className="bg-slate-100" {...props} />,
          th: ({ ...props }) => <th className="border-b-2 border-slate-300 px-4 py-3 font-semibold text-left text-slate-900" {...props} />,
          td: ({ ...props }) => <td className="border-b border-slate-200 px-4 py-2 text-slate-700" {...props} />,
          img: ({ node, src, alt, ...props }: any) =>
            src ? (
              <div className="relative my-2 w-full">
                <Image
                  src={src}
                  alt={alt || 'image'}
                  width={300}
                  height={200}
                  className="w-full max-w-md rounded-lg object-contain"
                  unoptimized
                />
              </div>
            ) : null,
          a: ({ node, href, children, ...props }: any) => (
            <a
              href={href}
              className="text-blue-600 hover:text-blue-800 underline"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            >
              {children}
            </a>
          ),
          hr: () => <hr className="my-2 border-slate-300" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
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
            onKeyDown={handleKeyDown}
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
