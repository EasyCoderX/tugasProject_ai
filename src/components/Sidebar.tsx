'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, BookOpen, Gamepad2, MessageCircle, User, Palette, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import type { ThemeConfig } from '@/lib/themes';
import type { UserInfo } from '@/lib/helpers';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  themeData: ThemeConfig;
  user: UserInfo | null;
}

const navItems = [
  { id: 'home', icon: Home, label: 'home' },
  { id: 'learn', icon: BookOpen, label: 'learn' },
  { id: 'games', icon: Gamepad2, label: 'games' },
  { id: 'chat', icon: MessageCircle, label: 'chat' },
  { id: 'profile', icon: User, label: 'me' },
];

export default function Sidebar({ activeTab, onTabChange, themeData, user }: SidebarProps) {
  const { t } = useTranslation(user?.language || 'en');
  const [collapsed, setCollapsed] = useState(false);

  const initials = (user?.displayName || user?.username || 'G').charAt(0).toUpperCase();

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 200 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="hidden md:flex flex-col h-screen sticky top-0 z-40 border-r-2 overflow-hidden"
      style={{
        background: `linear-gradient(180deg, ${themeData.accentHex}08 0%, var(--kid-card-bg) 100%)`,
        borderColor: `rgb(var(--kid-accent-rgb) / 0.15)`,
      }}
    >
      {/* Logo area */}
      <div className="flex items-center gap-3 p-4 border-b-2" style={{ borderColor: `rgb(var(--kid-accent-rgb) / 0.15)` }}>
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          className="text-3xl flex-shrink-0"
        >
          🔍
        </motion.div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="font-black text-sm whitespace-nowrap font-fredoka"
              style={{ color: 'var(--kid-accent-hex)' }}
            >
              What's This?
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 flex flex-col gap-2 px-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <motion.button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-300 relative overflow-hidden whitespace-nowrap ${
                isActive ? 'text-white shadow-lg' : 'text-gray-600 hover:bg-white/50'
              }`}
              style={{
                background: isActive
                  ? `linear-gradient(135deg, ${themeData.accentHex}, ${themeData.accentHex}80)`
                  : 'transparent',
                boxShadow: isActive ? `0 4px 15px ${themeData.accentHex}40` : 'none',
              }}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="font-bold text-sm font-fredoka"
                  >
                    {t(item.label)}
                  </motion.span>
                )}
              </AnimatePresence>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-2xl -z-10"
                  style={{ background: `linear-gradient(135deg, ${themeData.accentHex}, ${themeData.accentHex}80)` }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Bottom section: Theme + User + Collapse */}
      <div className="p-2 border-t-2 space-y-2" style={{ borderColor: `rgb(var(--kid-accent-rgb) / 0.15)` }}>
        {/* Theme button */}
        <motion.button
          onClick={() => {
            // Trigger theme portal - will be handled by parent
            const event = new CustomEvent('open-theme-portal');
            window.dispatchEvent(event);
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-3 px-3 py-3 rounded-2xl w-full text-gray-600 hover:bg-white/50 transition-all"
        >
          <Palette className="h-5 w-5 flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="font-bold text-sm font-fredoka whitespace-nowrap"
              >
                {themeData.emoji} {themeData.name}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* User avatar */}
        {user && (
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 px-3 py-2 rounded-2xl cursor-pointer"
            style={{ background: `rgb(var(--kid-accent-rgb) / 0.1)` }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${themeData.accentHex}, ${themeData.accentHex}80)` }}
            >
              {initials}
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  <p className="font-bold text-xs font-fredoka text-gray-700 truncate">
                    {user.displayName || user.username}
                  </p>
                  {user.isPro && (
                    <p className="text-[10px] text-yellow-600 font-medium">PRO</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Collapse toggle */}
        <motion.button
          onClick={() => setCollapsed(!collapsed)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center justify-center w-full py-2 rounded-2xl text-gray-400 hover:bg-white/50 transition-all"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </motion.button>
      </div>
    </motion.aside>
  );
}
