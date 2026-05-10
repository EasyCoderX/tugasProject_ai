'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Volume2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/lib/i18n';
import type { IdentifyResult } from '@/lib/helpers';
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
}: ResultCardProps) {
  const { t } = useTranslation(language);
  const [showBack, setShowBack] = useState(true);

  const activeColor = sectionAccent?.hex || '#FF6B35';

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
              className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl"
              style={{
                background: `linear-gradient(135deg, ${activeColor}, ${activeColor}cc)`,
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
              className="w-full rounded-3xl overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                boxShadow: `0 8px 40px ${activeColor}25, 0 0 0 1px ${activeColor}15`,
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transformOrigin: 'center center',
              }}
            >
              {/* Accent top bar */}
              <div className={`h-2 bg-gradient-to-r ${sectionAccent?.gradient || 'from-orange-400 to-yellow-400'}`} />

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
                      className="text-2xl sm:text-3xl font-extrabold font-fredoka"
                      style={{
                        background: `linear-gradient(135deg, ${activeColor}, ${activeColor}cc)`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      {getNameInLang(result, language)}
                    </h2>
                    <Badge className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">
                      {result.category}
                    </Badge>
                  </motion.div>

                  {/* Description */}
                  <motion.p
                    variants={contentReveal}
                    className="text-sm text-gray-600 text-center leading-relaxed mb-4 max-w-md mx-auto"
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
                      whileHover={{ scale: 1.08, boxShadow: '0 6px 20px rgba(16,185,129,0.4)' }}
                      whileTap={{ scale: 0.94 }}
                      onClick={onListen}
                      className="px-5 py-2.5 text-white rounded-2xl font-semibold font-fredoka text-sm shadow-md transition-shadow"
                      style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                    >
                      <Volume2 className="h-4 w-4 inline mr-1.5" />{t('listenBtn')}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.08, boxShadow: `0 6px 20px ${activeColor}60` }}
                      whileTap={{ scale: 0.94 }}
                      onClick={onQuiz}
                      className="px-5 py-2.5 text-white rounded-2xl font-semibold font-fredoka text-sm shadow-md transition-shadow"
                      style={{ background: `linear-gradient(135deg, ${activeColor}, ${activeColor}cc)` }}
                    >
                      🧠 {t('quizBtn')}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.08, boxShadow: '0 6px 20px rgba(139,92,246,0.4)' }}
                      whileTap={{ scale: 0.94 }}
                      onClick={onPuzzle}
                      className="px-5 py-2.5 text-white rounded-2xl font-semibold font-fredoka text-sm shadow-md transition-shadow"
                      style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}
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