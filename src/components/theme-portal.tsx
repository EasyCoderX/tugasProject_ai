'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { THEMES, type ThemeConfig } from '@/lib/themes';
import { Crown } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PortalUserInfo {
  id: string;
  isPro: boolean;
  displayName?: string | null;
  username?: string;
}

interface ThemePortalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: string;
  onSelectTheme: (themeId: string) => void;
  user: PortalUserInfo | null;
  language?: string;
}

export default function ThemePortal({ isOpen, onClose, currentTheme, onSelectTheme, user, language = 'en' }: ThemePortalProps) {
  const { t } = useTranslation(language);
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)' }}
          onClick={onClose}
        >
          {/* Main modal */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-3xl shadow-2xl bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative top wave */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400" />

            {/* Header */}
            <div className="p-6 pb-2 text-center">
              <div className="text-5xl mb-2 inline-block">🎨</div>
              <h2 className="text-2xl font-black text-gray-800">
                {t('chooseWorld')}
              </h2>
              <p className="text-sm text-gray-500 mt-1">{t('enterWorld')}</p>
            </div>

            {/* Scrollable content */}
            <div className="px-6 pb-6 overflow-y-auto max-h-[65vh]">
              <div className="grid grid-cols-2 gap-4">
                {THEMES.map((tm: ThemeConfig, index: number) => {
                  const isActive = tm.id === currentTheme;
                  const isLocked = tm.pro && !user?.isPro;

                  return (
                    <motion.div
                      key={tm.id}
                      initial={{ opacity: 0, y: 60, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{
                        delay: index * 0.1,
                        type: 'spring',
                        stiffness: 200,
                        damping: 20,
                      }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative"
                    >
                      <Card
                        className={`cursor-pointer transition-all hover:shadow-xl ${
                          isActive ? 'ring-4' : ''
                        } ${isLocked ? 'opacity-70 grayscale' : ''}`}
                        style={{
                          background: `linear-gradient(135deg, ${tm.accentHex}15 0%, white 100%)`,
                          borderColor: isActive ? tm.accentHex : `${tm.accentHex}30`,
                        }}
                        onClick={() => {
                          if (!isLocked) {
                            onSelectTheme(tm.id);
                          }
                        }}
                      >
                        <CardContent className="p-4">
                          {/* Emoji */}
                          <div className="text-5xl mb-2 text-center">
                            {tm.emoji}
                          </div>

                          {/* Theme name */}
                          <h3 className="text-sm font-black text-center mb-2" style={{ color: tm.accentHex }}>
                            {tm.name}
                          </h3>

                          {/* Mini live preview */}
                          <div className="space-y-1.5 mb-2">
                            <div
                              className="h-2 rounded-full"
                              style={{ background: `linear-gradient(to right, ${tm.accentHex}, ${tm.accentHex}60)` }}
                            />
                            <div className="grid grid-cols-2 gap-1">
                              <div
                                className="h-6 rounded"
                                style={{ background: `${tm.accentHex}20`, border: `1px solid ${tm.accentHex}40` }}
                              />
                              <div
                                className="h-6 rounded"
                                style={{ background: `${tm.accentHex}30`, border: `1px solid ${tm.accentHex}50` }}
                              />
                            </div>
                            <div
                              className="text-[8px] font-bold text-center py-0.5 rounded"
                              style={{ background: `${tm.accentHex}20`, color: tm.accentHex }}
                            >
                              {t('enterWorld')}
                            </div>
                          </div>

                          {/* Active indicator or Enter button */}
                          {isActive && !isLocked && (
                            <div className="text-center">
                              <span className="inline-block bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                ✓ {t('enterWorld')}
                              </span>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Pro lock overlay */}
                      {isLocked && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute inset-0 bg-white/70 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center gap-1 z-10"
                        >
                          <motion.div
                            animate={{ rotate: [0, 15, -15, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <Crown className="h-5 w-5 text-yellow-500" />
                          </motion.div>
                          <Badge variant="secondary" className="font-black bg-yellow-100 text-yellow-700">
                            PRO
                          </Badge>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Trigger upgrade flow
                            }}
                            style={{ background: `linear-gradient(to right, ${tm.accentHex}, ${tm.accentHex}80)` }}
                          >
                            {t('unlockWorld')}
                          </Button>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/80 hover:bg-white shadow-md flex items-center justify-center text-gray-500 hover:text-gray-700"
            >
              ✕
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
