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

  // Theme accent — sidebar adopts the selected theme's color
  const accent = themeData.accentHex;
  const accentRgb = themeData.accentRgb;
  const isDark = themeData.textHex === '#f8fafc' || themeData.textHex === '#ffffff' || themeData.bg.includes('900') || themeData.bg.includes('950');

  // Text colors from theme
  const labelText = themeData.textHex;
  const iconMuted = isDark ? 'rgba(248,250,252,0.45)' : '#9ca3af';

  // Background: theme-aware glass
  const sidebarBg = isDark
    ? `linear-gradient(180deg, ${accent}15 0%, rgba(15,23,42,0.94) 40%, rgba(30,41,59,0.97) 100%)`
    : `linear-gradient(180deg, ${accent}08 0%, rgba(255,255,255,0.94) 40%, rgba(255,255,255,0.99) 100%)`;

  const borderColor = isDark ? `${accent}25` : `${accent}18`;

  // Active item: theme accent with glow
  const activeBg = isDark
    ? `linear-gradient(135deg, ${accent}28, ${accent}18)`
    : `linear-gradient(135deg, ${accent}, ${accent}cc)`;

  const hoverBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 200 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="hidden md:flex flex-col h-screen sticky top-0 z-40 border-r-2 overflow-hidden"
      style={{
        background: sidebarBg,
        backdropFilter: isDark ? 'blur(24px) saturate(160%)' : 'blur(20px)',
        WebkitBackdropFilter: isDark ? 'blur(24px) saturate(160%)' : 'blur(20px)',
        borderColor,
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 border-b-2" style={{ borderColor }}>
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
              style={{ color: accent }}
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
              whileHover={{ scale: 1.04, background: isActive ? undefined : hoverBg }}
              whileTap={{ scale: 0.96 }}
              className={`flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-300 relative overflow-hidden whitespace-nowrap ${collapsed ? 'justify-center' : ''}`}
              style={{
                background: isActive ? activeBg : 'transparent',
                boxShadow: isActive ? `0 4px 20px ${accent}40, inset 0 0 0 1px ${accent}30` : 'none',
                color: isActive ? labelText : labelText,
                padding: collapsed ? '0.75rem' : undefined,
              }}
            >
              <Icon
                className="h-5 w-5 flex-shrink-0"
                style={{ color: isActive ? labelText : iconMuted }}
              />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="font-bold text-sm font-fredoka"
                    style={{ color: isActive ? labelText : iconMuted }}
                  >
                    {t(item.label)}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Left-edge glow pill when active */}
              {isActive && (
                <motion.div
                  layoutId="sidebarActivePill"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full"
                  style={{
                    background: `linear-gradient(180deg, ${accent}, ${accent}50)`,
                    boxShadow: `0 0 12px ${accent}80`,
                    height: '60%',
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Bottom: Theme + User + Collapse */}
      <div className="p-2 border-t-2 space-y-2" style={{ borderColor }}>
        {/* Theme switcher */}
        <motion.button
          onClick={() => {
            const event = new CustomEvent('open-theme-portal');
            window.dispatchEvent(event);
          }}
          whileHover={{ scale: 1.04, background: hoverBg }}
          whileTap={{ scale: 0.96 }}
          className={`flex items-center gap-3 px-3 py-3 rounded-2xl w-full transition-all ${collapsed ? 'justify-center' : ''}`}
          style={{ color: iconMuted, background: 'transparent', padding: collapsed ? '0.75rem' : undefined }}
        >
          <Palette className="h-5 w-5 flex-shrink-0" style={{ color: iconMuted }} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="font-bold text-sm font-fredoka whitespace-nowrap"
                style={{ color: iconMuted }}
              >
                {themeData.emoji} {themeData.name}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* User avatar */}
        {user && (
          <motion.div
            whileHover={{ scale: 1.04, background: hoverBg }}
            className={`flex items-center gap-3 px-3 py-2 rounded-2xl cursor-pointer transition-all ${collapsed ? 'justify-center' : ''}`}
            style={{ background: 'transparent', padding: collapsed ? '0.5rem' : undefined }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${accent}, ${accent}80)`,
                color: isDark ? '#0f172a' : '#ffffff',
                boxShadow: `0 2px 10px ${accent}40`,
              }}
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
                  <p className="font-bold text-xs font-fredoka truncate" style={{ color: labelText }}>
                    {user.displayName || user.username}
                  </p>
                  {user.isPro && (
                    <p className="text-[10px] font-medium" style={{ color: accent }}>PRO</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Collapse toggle */}
        <motion.button
          onClick={() => setCollapsed(!collapsed)}
          whileHover={{ scale: 1.04, background: hoverBg }}
          whileTap={{ scale: 0.96 }}
          className="flex items-center justify-center w-full py-2 rounded-2xl transition-all"
          style={{ color: iconMuted, background: 'transparent', padding: collapsed ? '0.75rem' : undefined }}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </motion.button>
      </div>
    </motion.aside>
  );
}