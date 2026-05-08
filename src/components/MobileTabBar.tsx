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

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="bg-white/90 backdrop-blur-lg border-t-2 shadow-2xl pb-safe"
      style={{
        borderColor: `rgb(var(--kid-accent-rgb) / 0.2)`,
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
              className={`flex flex-col items-center justify-center gap-0.5 relative ${
                isActive ? '' : 'text-gray-400'
              }`}
              style={{
                color: isActive ? 'white' : undefined,
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="mobileActiveTab"
                  className="absolute inset-1 rounded-xl -z-10"
                  style={{
                    background: `linear-gradient(135deg, ${themeData.accentHex}, ${themeData.accentHex}80)`,
                    boxShadow: `0 4px 15px ${themeData.accentHex}40`,
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
