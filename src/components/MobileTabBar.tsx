'use client';

import { motion } from 'framer-motion';
import { Home, BookOpen, Gamepad2, MessageCircle, User } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import type { ThemeConfig } from '@/lib/themes';

interface MobileTabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  themeData: ThemeConfig;
  language?: string;
}

const navItems = [
  { id: 'home', icon: Home, label: 'home' },
  { id: 'learn', icon: BookOpen, label: 'learn' },
  { id: 'games', icon: Gamepad2, label: 'games' },
  { id: 'chat', icon: MessageCircle, label: 'chat' },
  { id: 'profile', icon: User, label: 'me' },
];

export default function MobileTabBar({ activeTab, onTabChange, themeData, language = 'en' }: MobileTabBarProps) {
  const { t } = useTranslation(language);

  // Theme-driven colors — uses the selected theme's accent
  const accent = themeData.accentHex;
  const accentRgb = themeData.accentRgb;
  const isDark = themeData.textHex === '#f8fafc' || themeData.textHex === '#ffffff' || themeData.bg.includes('900') || themeData.bg.includes('950');

  // Background adapts to theme brightness
  const bgStyle = isDark
    ? `linear-gradient(180deg, ${accent}15 0%, rgba(15,23,42,0.96) 100%)`
    : `linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(${accentRgb}, 0.06) 100%)`;

  const activeText = themeData.textHex;
  const inactiveText = isDark ? 'rgba(248,250,252,0.4)' : '#9ca3af';

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="border-t-2 shadow-2xl pb-safe"
      style={{
        background: bgStyle,
        backdropFilter: isDark ? 'blur(24px) saturate(160%)' : 'blur(20px)',
        WebkitBackdropFilter: isDark ? 'blur(24px) saturate(160%)' : 'blur(20px)',
        borderColor: isDark ? `${accent}30` : `${accentRgb}20`,
      }}
    >
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <motion.button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              whileTap={{ scale: 0.9 }}
              className="flex flex-col items-center justify-center gap-0.5 relative transition-colors"
              style={{ color: isActive ? activeText : inactiveText }}
            >
              {isActive && (
                <motion.div
                  layoutId="mobileActiveTab"
                  className="absolute inset-1 rounded-xl -z-10"
                  style={{
                    background: isDark
                      ? `linear-gradient(135deg, ${accent}28, ${accent}18)`
                      : `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                    boxShadow: `0 4px 16px ${accent}40`,
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-bold font-fredoka">{t(item.label)}</span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
