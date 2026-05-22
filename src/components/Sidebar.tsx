'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, BookOpen, Gamepad2, MessageCircle, User, Palette, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import type { ThemeConfig } from '@/lib/themes';
import type { UserInfo } from '@/lib/helpers';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import '@/components/sidebar-styles.css';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  themeData: ThemeConfig;
  user: UserInfo | null;
}

const navItems = [
  { id: 'home',   icon: Home,        label: 'home'   },
  { id: 'learn',  icon: BookOpen,    label: 'learn'  },
  { id: 'games',  icon: Gamepad2,    label: 'games'  },
  { id: 'chat',   icon: MessageCircle, label: 'chat' },
  { id: 'profile', icon: User,      label: 'me'     },
];

export default function Sidebar({ activeTab, onTabChange, themeData, user }: SidebarProps) {
  const { t } = useTranslation(user?.language || 'en');
  const [collapsed, setCollapsed] = useState(false);

  const initials = (user?.displayName || user?.username || 'G').charAt(0).toUpperCase();

  const accent       = themeData.accentHex;
  const accentRgb    = themeData.accentRgb;
  const isDark = themeData.textHex === '#f8fafc' || themeData.textHex === '#ffffff' || themeData.bg.includes('900') || themeData.bg.includes('950');

  const labelText  = themeData.textHex;
  const iconMuted  = isDark ? 'rgba(248,250,252,0.45)' : '#9ca3af';
  const iconBright = labelText;

  const sidebarBg = isDark
    ? `linear-gradient(180deg, ${accent}15 0%, rgba(15,23,42,0.94) 40%, rgba(30,41,59,0.97) 100%)`
    : `linear-gradient(180deg, ${accent}08 0%, rgba(255,255,255,0.94) 40%, rgba(255,255,255,0.99) 100%)`;

  const borderColor   = isDark ? `${accent}25` : `${accent}18`;
  const activeBg      = isDark
    ? `linear-gradient(135deg, ${accent}dd, ${accent}99)`
    : `linear-gradient(135deg, ${accent}, ${accent}cc)`;
  const hoverBg       = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
  const activeLabel   = '#ffffff';
  const activeIcon    = '#ffffff';

  // Glassy tooltip style
  const tooltipStyle: React.CSSProperties = {
    background: isDark ? `linear-gradient(135deg, ${accent}22, rgba(15,23,42,0.96))` : `linear-gradient(135deg, ${accent}18, rgba(255,255,255,0.96))`,
    backdropFilter: 'blur(16px) saturate(180%)',
    WebkitBackdropFilter: 'blur(16px) saturate(180%)',
    border: `1.5px solid ${isDark ? `${accent}30` : `${accent}25`}`,
    color: labelText,
    fontFamily: 'var(--font-fredoka)',
    fontWeight: 600,
    fontSize: '0.72rem',
    boxShadow: `0 4px 20px ${accent}30`,
    borderRadius: '0.75rem',
    padding: '0.4rem 0.75rem',
  };

  return (
    <TooltipProvider delayDuration={300}>
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
        {/* ── 6. LOGO AREA ──────────────────────────────────────────── */}
        <div className="relative flex items-center gap-3 p-4 border-b-2" style={{ borderColor }}>
          {/* Sparkle burst — 4 pseudo stars orbiting the logo */}
          <div className="relative flex-shrink-0 w-9 h-9 flex items-center justify-center">
            <span
              className="star-sparkle star-1"
              style={{ '--accent-color': accent } as React.CSSProperties}
              aria-hidden="true"
            />
            <span
              className="star-sparkle star-2"
              style={{ '--accent-color': accent } as React.CSSProperties}
              aria-hidden="true"
            />
            <span
              className="star-sparkle star-3"
              style={{ '--accent-color': accent } as React.CSSProperties}
              aria-hidden="true"
            />
            <span
              className="star-sparkle star-4"
              style={{ '--accent-color': accent } as React.CSSProperties}
              aria-hidden="true"
            />
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="text-3xl z-10 relative"
            >
              🔍
            </motion.div>
          </div>

          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="whitespace-nowrap overflow-hidden font-fredoka"
              >
                <span style={{ fontWeight: 400, color: labelText }}>What&apos;s</span>
                <span style={{ fontWeight: 700, color: accent }}>This?</span>
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* ── 7. NAV ITEMS ──────────────────────────────────────────── */}
        <nav className="flex-1 py-4 flex flex-col gap-2 px-2">
          {navItems.map((item, idx) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            const isGames = item.id === 'games';

            return (
              <motion.button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                whileHover={isActive ? {} : { scale: 1.04, background: hoverBg }}
                whileTap={{ scale: 0.96 }}
                className={`flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-300 relative overflow-hidden whitespace-nowrap ${collapsed ? 'justify-center' : ''}`}
                style={{
                  background: isActive ? activeBg : 'transparent',
                  boxShadow: isActive
                    ? `0 4px 20px ${accent}40, inset 0 0 0 1px ${accent}30`
                    : 'none',
                  padding: collapsed ? '0.75rem' : undefined,
                }}
              >
                {/* Full-width active pill */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="sidebarActivePill"
                      className="absolute inset-0 rounded-2xl pointer-events-none"
                      style={{
                        background: activeBg,
                        boxShadow: `0 4px 20px ${accent}40, inset 0 0 0 1px ${accent}30`,
                      }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </AnimatePresence>

                {/* Icon */}
                <div className="relative z-10 flex items-center gap-2">
                  <Icon
                    className="h-5 w-5 flex-shrink-0"
                    style={{
                      color: isActive ? activeIcon : iconMuted,
                      transition: 'color 0.2s ease',
                      filter: isActive ? 'brightness(1.2)' : 'none',
                    }}
                  />

                  {/* Animated badge dot on Games */}
                  <AnimatePresence>
                    {isGames && !isActive && (
                      <motion.span
                        className="games-badge-dot"
                        style={{ background: accent }}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                        aria-label="New games available"
                      />
                    )}
                  </AnimatePresence>
                </div>

                {/* Label with staggered exit animation */}
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0, x: 8 }}
                      animate={{ opacity: 1, width: 'auto', x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      transition={{
                        opacity: { duration: 0.18, ease: 'easeIn' },
                        x:      { duration: 0.18, ease: 'easeIn' },
                        width:   { duration: 0.18, ease: [0.4, 0, 0.2, 1] },
                      }}
                      className="relative z-10 font-bold text-sm font-fredoka"
                      style={{
                        color: isActive ? activeLabel : iconMuted,
                        fontWeight: isActive ? 700 : 600,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {t(item.label)}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </nav>

        {/* ── BOTTOM: Theme + User + Collapse ─────────────────────── */}
        <div className="p-2 border-t-2 space-y-2" style={{ borderColor }}>

          {/* Theme switcher */}
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  onClick={() => {
                    const event = new CustomEvent('open-theme-portal');
                    window.dispatchEvent(event);
                  }}
                  whileHover={{ scale: 1.04, background: hoverBg }}
                  whileTap={{ scale: 0.96 }}
                  className="flex items-center justify-center w-full py-2 rounded-2xl transition-all"
                  style={{ color: iconMuted, background: 'transparent', padding: '0.75rem' }}
                >
                  <Palette className="h-5 w-5" style={{ color: iconMuted }} />
                </motion.button>
              </TooltipTrigger>
              <TooltipContent style={tooltipStyle} side="right">
                {themeData.emoji} {t('theme', { defaultValue: 'Theme' })}
              </TooltipContent>
            </Tooltip>
          ) : (
            <motion.button
              onClick={() => {
                const event = new CustomEvent('open-theme-portal');
                window.dispatchEvent(event);
              }}
              whileHover={{ scale: 1.04, background: hoverBg }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-3 px-3 py-3 rounded-2xl w-full transition-all"
              style={{ color: iconMuted, background: 'transparent' }}
            >
              <Palette className="h-5 w-5 flex-shrink-0" style={{ color: iconMuted }} />
              <motion.span
                className="font-bold text-sm font-fredoka whitespace-nowrap"
                style={{ color: iconMuted }}
              >
                {themeData.emoji} {themeData.name}
              </motion.span>
            </motion.button>
          )}

          {/* User avatar */}
          {user && (
            <Tooltip>
              <TooltipTrigger asChild>
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
              </TooltipTrigger>
              <TooltipContent style={tooltipStyle} side="right">
                {user.displayName || user.username}
              </TooltipContent>
            </Tooltip>
          )}

          {/* ── 8. COLLAPSE TOGGLE — floating half-overlapping ─────── */}
          <div className="relative">
            {/* Floating toggle button, half-overlapping bottom-right border */}
            <motion.button
              onClick={() => setCollapsed(!collapsed)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.92 }}
              className="absolute right-2 bottom-0 translate-y-1/2 z-50 flex items-center justify-center rounded-full transition-all shadow-lg"
              style={{
                width: '2rem',
                height: '2rem',
                background: `linear-gradient(135deg, ${accent}, ${accent}aa)`,
                color: '#fff',
                boxShadow: `0 4px 16px ${accent}50`,
                border: `2px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.8)'}`,
                backdropFilter: 'blur(12px)',
              }}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed
                ? <ChevronRight className="h-3.5 w-3.5" />
                : <ChevronLeft  className="h-3.5 w-3.5" />
              }
            </motion.button>
          </div>
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}
