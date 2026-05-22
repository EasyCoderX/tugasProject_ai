'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Volume2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/lib/i18n';
import type { IdentifyResult } from '@/lib/helpers';
import { staggerContainer, contentReveal, emojiBounce } from '@/lib/animation';

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
  const [flipped, setFlipped] = useState(false);

  // Reset flip state when result changes, then trigger flip reveal
  useEffect(() => {
    if (result) {
      setFlipped(false);
      const timer = setTimeout(() => setFlipped(true), 300);
      return () => clearTimeout(timer);
    } else {
      setFlipped(false);
    }
  }, [result]);

  // Resolve active color from section accent or fallback
  const activeColor = sectionAccent?.hex || '#f97316';

  return (
    <AnimatePresence>
      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          style={{ perspective: 1200 }}
        >
          {/* Flip container - single motion.div wraps both faces */}
          <div className="relative" style={{ perspective: 1200 }}>
            <motion.div
              animate={{ rotateY: flipped ? 0 : 180 }}
              transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
              style={{
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
              }}
              className="rounded-3xl overflow-hidden"
            >
              {/* Back face — shown during flip (rotated 180deg, so it appears as front during flip) */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl"
                style={{
                  background: `linear-gradient(135deg, ${activeColor}, ${activeColor}80)`,
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                }}
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="text-6xl"
                >
                  ✨
                </motion.div>
                <p className="text-white font-bold text-lg mt-2 font-fredoka">Discovering...</p>
              </div>

              {/* Front face — result card with glass morphism */}
              <Card
                className="bg-white/90 backdrop-blur-xl border border-white/50 shadow-2xl"
                style={{
                  boxShadow: `0 8px 32px ${activeColor}20, 0 0 0 1px ${activeColor}10`,
                  backdropFilter: 'blur(20px)',
                }}
              >
                {/* Accent top bar */}
                <div className={`h-2 bg-gradient-to-r ${sectionAccent?.gradient || 'from-orange-400 to-yellow-400'}`} />

                <CardContent className="p-6">
                  {/* Staggered content after flip */}
                  <motion.div
                    variants={staggerContainer(0.1)}
                    initial="hidden"
                    animate="visible"
                  >
                    {/* Emoji with bounce */}
                    <motion.div variants={emojiBounce} className="text-6xl sm:text-7xl text-center mb-3 drop-shadow-lg">
                      {result.emoji}
                    </motion.div>

                    {/* Name + Badge */}
                    <motion.div variants={contentReveal} className="flex items-center justify-center gap-3 mb-3 flex-wrap">
                      <h2
                        className="text-2xl sm:text-3xl font-extrabold font-fredoka"
                        style={{
                          background: `linear-gradient(135deg, ${activeColor}, ${activeColor}aa)`,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                        }}
                      >
                        {getNameInLang(result, language)}
                      </h2>
                      <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">
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

                    {/* Fun Fact with section accent styling */}
                    <motion.div
                      variants={contentReveal}
                      className="p-4 rounded-2xl border mb-5"
                      style={{
                        background: `linear-gradient(135deg, ${activeColor}10, ${activeColor}05)`,
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
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onListen}
                        className="px-5 py-2.5 text-white rounded-2xl font-medium font-fredoka text-sm shadow-md transition-all"
                        style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                      >
                        <Volume2 className="h-4 w-4 inline mr-1.5" />{t('listenBtn')}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onQuiz}
                        className="px-5 py-2.5 text-white rounded-2xl font-medium font-fredoka text-sm shadow-md transition-all"
                        style={{ background: `linear-gradient(135deg, ${activeColor}, ${activeColor}cc)` }}
                      >
                        🧠 {t('quizBtn')}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onPuzzle}
                        className="px-5 py-2.5 text-white rounded-2xl font-medium font-fredoka text-sm shadow-md transition-all"
                        style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}
                      >
                        🧩 {t('puzzleBtn')}
                      </motion.button>
                    </motion.div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}