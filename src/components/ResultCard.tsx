'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Volume2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/lib/i18n';
import type { IdentifyResult } from '@/lib/helpers';
import type { ThemeConfig } from '@/lib/themes';
import { staggerContainer, staggerItem, emojiBounce, contentReveal } from '@/lib/animation';

interface ResultCardProps {
  result: IdentifyResult | null;
  language: string;
  onListen: () => void;
  onQuiz: () => void;
  onPuzzle: () => void;
  getNameInLang: (item: IdentifyResult, lang: string) => string;
  getDescInLang: (item: IdentifyResult, lang: string) => string;
  getFactInLang: (item: IdentifyResult, lang: string) => string;
  sectionAccent?: { hex: string; rgb: string; gradient: string };
  themeData?: ThemeConfig;
}

export default function ResultCard({
  result,
  language,
  onListen,
  onQuiz,
  onPuzzle,
  getNameInLang,
  getDescInLang,
  getFactInLang,
  sectionAccent,
  themeData,
}: ResultCardProps) {
  const { t } = useTranslation(language);
  const [showBack, setShowBack] = useState(true);

  // Theme-aware values — prefer theme accent over section accent
  const activeColor = themeData?.accentHex || sectionAccent?.hex || '#FF6B35';
  const cardRadius = themeData?.cardStyle === 'organic' ? '1.5rem 1.25rem 1.75rem 1.25rem / 1.25rem 1.75rem 1.25rem 1.5rem'
    : themeData?.cardStyle === 'wavy' ? '1.5rem 2rem 1.5rem 2rem / 2rem 1.5rem 2rem 1.5rem'
    : '1.5rem';

  useEffect(() => {
    if (result) {
      setShowBack(true);
      const timer = setTimeout(() => setShowBack(false), 600);
      return () => clearTimeout(timer);
    } else {
      setShowBack(true);
    }
  }, [result]);

  return (
    <AnimatePresence>
      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          whileHover={themeData?.cardStyle === 'bouncy' ? { y: -3 } : undefined}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          style={{ perspective: 1200 }}
        >
          {/* Two-face flip: back (loading) flips to 180, front (result) flips from -180 to 0 */}
          <div className="relative" style={{ transformStyle: 'preserve-3d' }}>
            {/* Back face — sparkle loading, starts at rotateY(0) and flips to 180 */}
            <motion.div
              initial={{ rotateY: 0, opacity: 1 }}
              animate={{ rotateY: showBack ? 0 : 180, opacity: showBack ? 1 : 0 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="absolute inset-0 flex flex-col items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${activeColor}, ${activeColor}cc)`,
                borderRadius: cardRadius,
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transformOrigin: 'center center',
              }}
            >
              <motion.div
                animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-6xl mb-3"
              >
                🔍
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="text-5xl mb-3"
              >
                ✨
              </motion.div>
              <p className="text-white font-bold text-lg font-fredoka">Discovering...</p>
              <div className="flex gap-1.5 mt-3">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-white/80"
                    animate={{ y: [0, -8, 0], opacity: [1, 0.3, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                  />
                ))}
              </div>
            </motion.div>

            {/* Front face — result card, starts at rotateY(-180) and flips to 0 */}
            <motion.div
              initial={{ rotateY: -180, opacity: 0 }}
              animate={{ rotateY: showBack ? -180 : 0, opacity: showBack ? 0 : 1 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.05 }}
              className="w-full overflow-hidden"
              style={{
                background: 'var(--kid-card-bg)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                borderRadius: cardRadius,
                boxShadow: `0 8px 40px ${activeColor}25, 0 0 0 1px ${activeColor}15`,
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transformOrigin: 'center center',
              }}
            >
              {/* Accent top bar */}
              <div
                className="h-2"
                style={{
                  background: `linear-gradient(135deg, ${activeColor}, ${activeColor}aa)`,
                }}
              />

              <div className="p-6">
                <motion.div
                  variants={staggerContainer(0.08)}
                  initial="hidden"
                  animate="visible"
                >
                  {/* Emoji bounce */}
                  <motion.div variants={emojiBounce} className="text-6xl sm:text-7xl text-center mb-4 drop-shadow-xl">
                    {result.emoji}
                  </motion.div>

                  {/* Name + Badge */}
                  <motion.div variants={contentReveal} className="flex items-center justify-center gap-3 mb-3 flex-wrap">
                    <h2
                      className="text-2xl sm:text-3xl font-extrabold"
                      style={{
                        fontFamily: themeData?.fontFamily === 'font-sans' ? 'var(--font-nunito)' : 'var(--font-fredoka)',
                        backgroundImage: `linear-gradient(135deg, ${activeColor}, ${activeColor}cc)`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      {getNameInLang(result, language)}
                    </h2>
                    <Badge className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: `${activeColor}20`, color: activeColor }}>
                      {result.category}
                    </Badge>
                  </motion.div>

                  {/* Description */}
                  <motion.p
                    variants={contentReveal}
                    className="text-sm text-gray-600 text-center leading-relaxed mb-4 max-w-md mx-auto"
                    style={{ fontFamily: themeData?.fontFamily === 'font-sans' ? 'var(--font-nunito)' : 'var(--font-fredoka)' }}
                  >
                    {getDescInLang(result, language)}
                  </motion.p>

                  {/* Fun Fact */}
                  <motion.div
                    variants={contentReveal}
                    className="p-4 rounded-2xl border mb-5"
                    style={{
                      background: `linear-gradient(135deg, ${activeColor}12, ${activeColor}06)`,
                      borderColor: `${activeColor}30`,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      </motion.div>
                      <span className="text-xs font-bold font-fredoka" style={{ color: activeColor }}>
                        {t('funFact')}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: `${activeColor}cc` }}>
                      {getFactInLang(result, language)}
                    </p>
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div variants={contentReveal} className="flex justify-center gap-3 flex-wrap">
                    <motion.button
                      whileHover={{ scale: 1.08, boxShadow: `0 6px 20px ${activeColor}60` }}
                      whileTap={{ scale: 0.94 }}
                      onClick={onListen}
                      className={`px-5 py-2.5 text-white font-semibold text-sm shadow-md transition-shadow ${themeData?.buttonRadius || 'rounded-2xl'}`}
                      style={{ background: `linear-gradient(135deg, ${activeColor}, ${activeColor}cc)` }}
                    >
                      <Volume2 className="h-4 w-4 inline mr-1.5" />{t('listenBtn')}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.08, boxShadow: `0 6px 20px ${activeColor}60` }}
                      whileTap={{ scale: 0.94 }}
                      onClick={onQuiz}
                      className={`px-5 py-2.5 text-white font-semibold text-sm shadow-md transition-shadow ${themeData?.buttonRadius || 'rounded-2xl'}`}
                      style={{ background: `linear-gradient(135deg, ${activeColor}, ${activeColor}cc)` }}
                    >
                      🧠 {t('quizBtn')}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.08, boxShadow: `0 6px 20px ${activeColor}60` }}
                      whileTap={{ scale: 0.94 }}
                      onClick={onPuzzle}
                      className={`px-5 py-2.5 text-white font-semibold text-sm shadow-md transition-shadow ${themeData?.buttonRadius || 'rounded-2xl'}`}
                      style={{ background: `linear-gradient(135deg, ${activeColor}, ${activeColor}cc)` }}
                    >
                      🧩 {t('puzzleBtn')}
                    </motion.button>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
