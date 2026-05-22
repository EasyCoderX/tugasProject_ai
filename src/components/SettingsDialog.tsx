'use client';

import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { THEMES, type ThemeConfig } from '@/lib/themes';
import type { UserInfo } from '@/lib/helpers';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  theme: string;
  onThemeChange: (themeId: string) => void;
  user: UserInfo | null;
  language: string;
  onLanguageChange: (lang: string) => void;
  onUpgrade: () => void;
  upgrading: boolean;
  onUpdateProfile: (updates: { language?: string; theme?: string }) => void;
  onUpgradeModalOpen: () => void;
  LANGUAGES: Array<{ id: string; name: string; emoji: string }>;
}

export default function SettingsDialog({
  open,
  onOpenChange,
  theme,
  onThemeChange,
  user,
  language,
  onLanguageChange,
  onUpgrade,
  upgrading,
  onUpdateProfile,
  onUpgradeModalOpen,
  LANGUAGES,
}: SettingsDialogProps) {
  const { t } = useTranslation(language);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-3xl border-4 backdrop-blur-sm" style={{ borderColor: `rgb(var(--kid-accent-rgb) / 0.3)` }}>
        <DialogHeader>
          <DialogTitle className="font-fredoka text-xl">⚙️ {t('settings')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Theme Selection */}
          <div>
            <label className="text-sm font-semibold mb-3 block font-fredoka">🎨 {t('theme')}</label>
            <div className="grid grid-cols-3 gap-2">
              {THEMES.map((tm: ThemeConfig) => {
                const isActive = tm.id === theme;
                const isLocked = tm.pro && !user?.isPro;

                return (
                  <motion.button
                    key={tm.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (isLocked) {
                        onUpgradeModalOpen();
                        return;
                      }
                      onThemeChange(tm.id);
                      if (user?.id !== 'guest') {
                        onUpdateProfile({ theme: tm.id });
                      } else {
                        localStorage.setItem('theme', tm.id);
                      }
                    }}
                    className={`p-3 rounded-2xl text-xs font-medium transition-all relative font-fredoka
                      ${isActive ? 'ring-2 shadow-lg' : 'bg-white/80 hover:bg-white/90 shadow-md hover:shadow-lg'}`}
                    style={{
                      ringColor: isActive ? tm.accentHex : undefined,
                      background: isActive ? `linear-gradient(135deg, ${tm.accentHex}20, ${tm.accentHex}10)` : undefined,
                      minHeight: '60px'
                    }}
                  >
                    {isLocked && !user?.isPro && (
                      <span className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                        PRO
                      </span>
                    )}
                    <div className="text-center">
                      <div className="text-2xl mb-1">{tm.emoji}</div>
                      <div className="text-[10px]">{tm.name}</div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Language Selection */}
          <div>
            <label className="text-sm font-semibold mb-3 block font-fredoka">🌐 {t('languageLabel')}</label>
            <div className="flex gap-2">
              {LANGUAGES.map(l => (
                <motion.button
                  key={l.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    onLanguageChange(l.id);
                    if (user?.id !== 'guest') {
                      onUpdateProfile({ language: l.id });
                    } else {
                      localStorage.setItem('language', l.id);
                    }
                  }}
                  className={`flex-1 p-3 rounded-2xl text-xs font-medium transition-all font-fredoka
                    ${language === l.id ? 'ring-2 shadow-lg' : 'bg-white/80 hover:bg-white/90 shadow-md'}`}
                  style={{
                    ringColor: language === l.id ? 'var(--kid-accent-hex)' : undefined,
                    background: language === l.id ? `linear-gradient(135deg, rgb(var(--kid-accent-rgb) / 0.2), rgb(var(--kid-accent-rgb) / 0.1))` : undefined,
                    minHeight: '60px'
                  }}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-1">{l.emoji}</div>
                    <div className="text-[10px]">{l.name}</div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Upgrade to Pro */}
          {!user?.isPro && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-4 text-center shadow-md"
              style={{
                background: `linear-gradient(135deg, rgb(234, 179, 8, 0.2), rgb(234, 179, 8, 0.1))`,
                border: `2px solid rgb(234, 179, 8, 0.3)`
              }}
            >
              <Crown className="h-6 w-6 mx-auto mb-2" style={{ color: 'rgb(202, 138, 4)' }} />
              <p className="text-xs font-semibold mb-1" style={{ color: 'rgb(161, 98, 7)' }}>{t('upgradeToPro')}</p>
              <p className="text-[10px] mb-3" style={{ color: 'rgb(180, 113, 1)' }}>{t('unlockFeatures')}</p>
              <Button
                size="sm"
                onClick={onUpgrade}
                disabled={upgrading}
                className="font-fredoka shadow-md hover:shadow-lg transition-all"
                style={{
                  background: `linear-gradient(135deg, rgb(234, 179, 8), rgb(249, 115, 22))`,
                  color: 'white',
                  minHeight: '36px'
                }}
              >
                {upgrading ? t('upgrading') : `⬆️ ${t('getPro')}`}
              </Button>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
