import React, { useRef, useEffect } from 'react';
import { ChatMessage, MessageRole, GenerationState } from '../types';

interface ChatAreaProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  generationState: GenerationState;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ messages, onSendMessage, generationState }) => {
  const [input, setInput] = React.useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, generationState]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || generationState.isGenerating) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-neutral-900 border-r border-neutral-800">
      {/* Header */}
      <div className="p-4 border-b border-neutral-800 bg-neutral-900 sticky top-0 z-10">
        <h1 className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
          NanoLayer
        </h1>
        <p className="text-xs text-neutral-500">Powered by Gemini Nano Banana</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === MessageRole.USER ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === MessageRole.USER
                  ? 'bg-yellow-600/20 text-yellow-100 border border-yellow-600/30 rounded-br-none'
                  : 'bg-neutral-800 text-neutral-200 border border-neutral-700 rounded-bl-none'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>
            </div>
          </div>
        ))}
        
        {generationState.isGenerating && (
          <div className="flex justify-start">
            <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-2xl px-4 py-3 rounded-bl-none flex items-center gap-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
              <span className="text-xs text-neutral-400 animate-pulse">
                {generationState.currentTask || "Thinking..."}
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-neutral-900 border-t border-neutral-800">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={generationState.isGenerating ? "Processing..." : "Describe an ad creative..."}
            disabled={generationState.isGenerating}
            className="w-full bg-neutral-950 text-neutral-100 rounded-xl pl-4 pr-12 py-3 border border-neutral-800 focus:outline-none focus:border-yellow-600/50 focus:ring-1 focus:ring-yellow-600/50 placeholder-neutral-600 disabled:opacity-50 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || generationState.isGenerating}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg disabled:opacity-0 disabled:scale-90 transition-all duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};