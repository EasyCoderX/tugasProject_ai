'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TabsContent } from '@/components/ui/tabs';
import { useTranslation } from '@/lib/i18n';
import type { ChatMessage } from '@/lib/helpers';

interface ChatTabProps {
  chatMessages: ChatMessage[];
  chatInput: string;
  chatLoading: boolean;
  onChatInputChange: (value: string) => void;
  onSendChat: () => void;
  chatScrollRef: React.RefObject<HTMLDivElement | null>;
  language?: string;
}

export default function ChatTab({
  chatMessages,
  chatInput,
  chatLoading,
  onChatInputChange,
  onSendChat,
  chatScrollRef,
  language = 'en',
}: ChatTabProps) {
  const { t } = useTranslation(language);

  // Auto-scroll
  useEffect(() => {
    if (chatScrollRef.current) {
      const el = chatScrollRef.current.querySelector('[data-radix-scroll-area-viewport]') || chatScrollRef.current;
      el.scrollTop = el.scrollHeight;
    }
  }, [chatMessages, chatScrollRef]);

  return (
    <TabsContent value="chat" className="flex-1 min-h-0 flex flex-col pb-2">
      <div className="flex-1 min-h-0 flex flex-col bg-white/70 rounded-3xl shadow-lg overflow-hidden backdrop-blur-sm border-2" style={{ borderColor: 'rgb(var(--kid-accent-rgb) / 0.2)' }}>
        {/* Chat Header */}
        <CardHeader className="flex-row items-center gap-3 p-4 border-b-2" style={{ borderColor: 'rgb(var(--kid-accent-rgb) / 0.2)' }}>
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-10 h-10 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-white text-lg shadow-lg"
            style={{ boxShadow: '0 4px 15px var(--kid-shadow-color)' }}
          >
            🤖
          </motion.div>
          <div>
            <CardTitle className="text-base font-bold text-gray-800 font-fredoka">
              {t('aiBuddy')}
            </CardTitle>
            <p className="text-[10px] text-green-500 font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              {t('online')}
            </p>
          </div>
        </CardHeader>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={chatScrollRef}>
          <div className="space-y-3">
            {chatMessages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12 text-gray-400"
              >
                <div className="text-5xl mb-3">💬</div>
                <p className="font-fredoka text-sm">{t('chatWelcome')}</p>
              </motion.div>
            )}

            {chatMessages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-2.5 rounded-3xl text-sm font-fredoka shadow-md
                    ${m.role === 'user'
                      ? 'bg-gradient-to-r from-blue-400 to-cyan-400 text-white'
                      : 'bg-white text-gray-800 border-2'
                    }`}
                  style={{
                    borderColor: m.role === 'user' ? 'transparent' : 'rgb(var(--kid-accent-rgb) / 0.2)',
                    boxShadow: m.role === 'user' ? '0 4px 15px var(--kid-shadow-color)' : undefined
                  }}
                >
                  {m.content}
                </div>
              </motion.div>
            ))}

            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-white px-4 py-3 rounded-3xl text-sm text-gray-400 animate-pulse font-fredoka shadow-md border-2" style={{ borderColor: 'rgb(var(--kid-accent-rgb) / 0.2)' }}>
                  <div className="flex items-center gap-1">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="w-2 h-2 rounded-full"
                      style={{ background: 'var(--kid-accent-hex)' }}
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                      className="w-2 h-2 rounded-full"
                      style={{ background: 'var(--kid-accent-hex)' }}
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                      className="w-2 h-2 rounded-full"
                      style={{ background: 'var(--kid-accent-hex)' }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="flex gap-2 p-3 border-t-2" style={{ borderColor: 'rgb(var(--kid-accent-rgb) / 0.2)' }}>
          <Input
            value={chatInput}
            onChange={e => onChatInputChange(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onSendChat()}
            placeholder={t('chatPlaceholder')}
            className="rounded-full text-sm flex-1 font-fredoka border-2 focus:border-blue-400 transition-colors"
            style={{ borderColor: 'rgb(var(--kid-accent-rgb) / 0.3)' }}
          />
          <Button
            onClick={onSendChat}
            disabled={chatLoading || !chatInput.trim()}
            size="icon"
            className="rounded-full shadow-lg hover:shadow-xl transition-all"
            style={{
              background: 'linear-gradient(135deg, var(--kid-gradient-from), var(--kid-gradient-to))',
              minWidth: '44px',
              minHeight: '44px'
            }}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </TabsContent>
  );
}
