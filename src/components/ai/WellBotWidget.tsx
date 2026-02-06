import React, { useState, useEffect } from 'react';
import { Bot, X, Minimize2, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WellBotWidgetProps {
  children: React.ReactNode;
}

export function WellBotWidget({ children }: WellBotWidgetProps) {
  const [isOpen, setIsOpen] = useState(() => {
    return localStorage.getItem('wellbot-open') === 'true';
  });
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    localStorage.setItem('wellbot-open', isOpen.toString());
  }, [isOpen]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg transition-all hover:scale-105"
        aria-label="Open WellBot"
      >
        <Bot className="h-6 w-6" />
        <span className="font-medium">WellBot</span>
      </button>
    );
  }

  return (
    <div
      className={cn(
        "fixed z-50 bg-white rounded-2xl shadow-2xl flex flex-col transition-all duration-300",
        isFullscreen 
          ? "inset-4" 
          : isMinimized 
            ? "bottom-6 right-6 w-80 h-14"
            : "bottom-6 right-6 w-96 h-[600px] max-h-[80vh]"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-emerald-600 text-white rounded-t-2xl">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          <span className="font-semibold">WellBot</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 hover:bg-emerald-700 rounded"
            aria-label={isMinimized ? "Restore" : "Minimize"}
          >
            <Minimize2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 hover:bg-emerald-700 rounded"
            aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            <Maximize2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-emerald-700 rounded"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      )}
    </div>
  );
}
