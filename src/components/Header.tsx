'use client';

import { motion } from 'framer-motion';
import { Crown, Palette, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/lib/i18n';
import type { ThemeConfig } from '@/lib/themes';
import type { UserInfo } from '@/lib/helpers';

interface HeaderProps {
  user: UserInfo | null;
  themeData: ThemeConfig;
  onThemePortalOpen: () => void;
  onSettingsToggle: () => void;
  onLogout: () => void;
  upgrading: boolean;
  onUpgrade: () => void;
  language?: string;
}

export default function Header({
  user,
  themeData,
  onThemePortalOpen,
  onSettingsToggle,
  onLogout,
  upgrading,
  onUpgrade,
  language = 'en',
}: HeaderProps) {
  const { t } = useTranslation(language);

  if (!user) return null;

  // Get user initials for avatar
  const initials = (user.displayName || user.username || 'G').charAt(0).toUpperCase();

  return (
    <header className={`relative overflow-hidden bg-gradient-to-r ${themeData.header} py-4 px-4 shadow-lg`}>
      {/* Animated gradient shimmer effect */}
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)`,
          backgroundSize: '200% 100%',
        }}
        animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      />

      {/* Floating emoji decorations */}
      <motion.div
        animate={{ y: [0, -8, 0], rotate: [0, 10, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute top-2 left-2 text-xl opacity-40"
      >✨</motion.div>
      <motion.div
        animate={{ y: [0, 8, 0], rotate: [0, -10, 10, 0] }}
        transition={{ duration: 4, repeat: Infinity, delay: 1 }}
        className="absolute top-3 right-20 text-lg opacity-30"
      >🌟</motion.div>

      <div className="relative max-w-2xl mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          {/* Animated logo */}
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="text-3xl sm:text-4xl drop-shadow-lg"
          >
            🔍
          </motion.div>

          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white drop-shadow-md font-fredoka">
              {t('appTitle')}
            </h1>
            <p className="text-[11px] sm:text-xs text-white/90 font-medium">
              {t('hiUser', { name: user.displayName || user.username })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* User avatar */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg cursor-pointer"
            style={{
              background: `linear-gradient(135deg, ${themeData.accentHex}, ${themeData.accentHex}80)`,
              boxShadow: `0 4px 15px ${themeData.accentHex}40`
            }}
          >
            {initials}
          </motion.div>

          {user.isPro && (
            <Badge className="bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5">
              <Crown className="h-3 w-3 mr-0.5" />PRO
            </Badge>
          )}

          {!user.isPro && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onUpgrade}
              disabled={upgrading}
              className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg hover:shadow-xl transition-shadow font-fredoka"
            >
              <Crown className="h-3 w-3" />
              {t('tryProThemes')}
            </motion.button>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={onThemePortalOpen}
            className="bg-white/20 hover:bg-white/30 text-white rounded-full h-9 w-9 hover:scale-105 transition-transform"
          >
            <Palette className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onSettingsToggle}
            className="bg-white/20 hover:bg-white/30 text-white rounded-full h-9 w-9 hover:scale-105 transition-transform"
          >
            <Settings className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onLogout}
            className="bg-white/20 hover:bg-red-400/30 text-white rounded-full h-9 w-9 hover:scale-105 transition-transform"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
