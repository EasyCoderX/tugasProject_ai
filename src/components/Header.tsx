'use client';

import { motion } from 'framer-motion';
import { Crown, Settings, LogOut } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/lib/i18n';
import type { ThemeConfig } from '@/lib/themes';
import type { UserInfo } from '@/lib/helpers';

interface HeaderProps {
  user: UserInfo | null;
  themeData: ThemeConfig;
  onSettingsToggle: () => void;
  onLogout: () => void;
  upgrading: boolean;
  onUpgrade: () => void;
  language?: string;
}

export default function Header({
  user,
  themeData,
  onSettingsToggle,
  onLogout,
  upgrading,
  onUpgrade,
  language = 'en',
}: HeaderProps) {
  const { t } = useTranslation(language);

  if (!user) return null;

  const initials = (user.displayName || user.username || 'G').charAt(0).toUpperCase();

  // Theme-aware floating particles
  const particles = [
    { emoji: themeData.particleEmoji, x: '10%', y: '12%', delay: 0 },
    { emoji: themeData.particleEmoji, x: '85%', y: '15%', delay: 1.2 },
    { emoji: themeData.particleEmoji, x: '25%', y: '78%', delay: 0.7 },
    { emoji: themeData.particleEmoji, x: '75%', y: '72%', delay: 1.9 },
    { emoji: themeData.particleEmoji, x: '50%', y: '6%', delay: 2.5 },
  ];

  // Staggered entrance for the left brand cluster
  const brandStagger = {
    hidden: { opacity: 0, x: -16 },
    show: {
      opacity: 1,
      x: 0,
      transition: { staggerChildren: 0.12, delayChildren: 0.1 },
    },
  };
  const brandItem = {
    hidden: { opacity: 0, x: -16 },
    show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } },
  };

  return (
    <header
      className="relative bg-gradient-to-r select-none"
      style={{
        background: `linear-gradient(135deg, ${themeData.accentHex}, ${themeData.accentHex}dd)`,
        boxShadow: `0 8px 32px ${themeData.accentHex}50, 0 2px 8px rgba(0,0,0,0.08)`,
      }}
    >
      {/* Decorative theme emoji watermarks — fill side space on wide screens */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden hidden md:block" aria-hidden="true">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 text-8xl lg:text-9xl opacity-[0.07] select-none">
          {themeData.emoji}
        </div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 text-8xl lg:text-9xl opacity-[0.07] select-none">
          {themeData.emoji}
        </div>
      </div>

      {/* Scanning beam overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.22) 50%, transparent 100%)`,
          backgroundSize: '200% 100%',
        }}
        animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Floating particle emojis */}
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none select-none text-base sm:text-lg"
          style={{ left: p.x, top: p.y }}
          animate={{
            y: [0, -14, 0],
            opacity: [0.12, 0.45, 0.12],
            scale: [0.85, 1.2, 0.85],
          }}
          transition={{
            duration: 4.5,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        >
          {p.emoji}
        </motion.div>
      ))}

      {/* Playful wavy bottom separator */}
      <div className="absolute bottom-0 left-0 right-0 h-5 pointer-events-none overflow-hidden" aria-hidden="true">
        <svg viewBox="0 0 1440 24" className="w-full h-full" preserveAspectRatio="none">
          <path d="M0,24 C180,8 360,20 540,12 C720,4 900,20 1080,10 C1260,0 1350,16 1440,8 L1440,24 Z" fill="rgba(255,255,255,0.12)" />
        </svg>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="relative flex items-center px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        {/* ---- LEFT: Brand cluster ---- */}
        <motion.div
          className="flex items-center gap-3 min-w-0"
          variants={brandStagger}
          initial="hidden"
          animate="show"
        >
          {/* Animated Logo */}
          <motion.div variants={brandItem} className="relative shrink-0">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.06, 1] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 5, ease: 'easeInOut' }}
              className="text-2xl sm:text-3xl drop-shadow-lg relative z-10"
              role="img"
              aria-label="Explore"
            >
              🔍
            </motion.div>
            {/* Glow ring */}
            <motion.div
              className="absolute -inset-2.5 rounded-full pointer-events-none"
              style={{
                background: `radial-gradient(circle, rgba(255,255,255,0.35) 0%, transparent 70%)`,
              }}
              animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>

          {/* Title + Greeting */}
          <motion.div variants={brandItem} className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-2xl font-extrabold text-white drop-shadow-md font-fredoka leading-tight truncate">
                {t('appTitle')}
              </h1>
              {user.isPro && (
                <Badge
                  variant="outline"
                  className="bg-yellow-400/20 text-yellow-100 border-yellow-300/40 text-[9px] font-bold px-1.5 py-0 leading-tight shadow-sm shrink-0"
                >
                  PRO
                </Badge>
              )}
            </div>
            <p className="text-[11px] sm:text-xs text-white/70 font-medium truncate">
              {t('hiUser', { name: user.displayName || user.username })}
            </p>
          </motion.div>
        </motion.div>

        {/* Upgrade (non-PRO only) */}
        {!user.isPro && (
          <motion.button
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.05 }}
            onClick={(e) => { e.stopPropagation(); onUpgrade(); }}
            disabled={upgrading}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.2 }}
            className="bg-white/20 hover:bg-white/30 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-full flex items-center gap-1 transition-all shadow-sm font-fredoka backdrop-blur-sm active:scale-95 ml-3"
          >
            <Crown className="h-3 w-3" />
            <span className="hidden sm:inline">{t('tryProThemes')}</span>
          </motion.button>
        )}

        {/* ---- FAR RIGHT: Settings + Logout ---- */}
        <motion.div
          className="flex items-center gap-2 ml-auto"
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.2 }}
        >
          {/* Settings */}
          <button
            onClick={(e) => { e.stopPropagation(); onSettingsToggle(); }}
            className="bg-white/20 hover:bg-white/30 text-white rounded-full h-10 w-10 flex items-center justify-center hover:scale-110 active:scale-95 transition-all backdrop-blur-sm"
            title={t('settings')}
          >
            <Settings className="h-4 w-4" />
          </button>

          {/* Logout */}
          <button
            onClick={(e) => { e.stopPropagation(); onLogout(); }}
            className="bg-white/15 hover:bg-red-400/30 text-white/70 hover:text-white rounded-full h-10 w-10 flex items-center justify-center hover:scale-110 active:scale-95 transition-all backdrop-blur-sm"
            title={t('cancel')}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </motion.div>
      </div>
    </header>
  );
}
