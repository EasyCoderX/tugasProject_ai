'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Star, Check, X, Volume2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';
import type { IdentifyResult } from '@/lib/helpers';

interface ResultCardProps {
  result: IdentifyResult;
  language: string;
  onListen: () => void;
  onQuiz: () => void;
  onPuzzle: () => void;
  getNameInLang: (item: IdentifyResult, lang: string) => string;
  getDescInLang: (item: IdentifyResult, lang: string) => string;
  getFactInLang: (item: IdentifyResult, lang: string) => string;
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
}: ResultCardProps) {
  const { t } = useTranslation(language);

  return (
    <AnimatePresence>
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          key="result"
        >
          <Card className="border-2 border-yellow-200 bg-white/95 shadow-2xl overflow-hidden backdrop-blur-sm">
            {/* Gradient accent bar */}
            <div className="h-2 bg-gradient-to-r from-orange-400 via-yellow-400 to-green-400" />

            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                {/* Large emoji with float animation */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-5xl sm:text-6xl flex-shrink-0 drop-shadow-lg"
                >
                  {result.emoji}
                </motion.div>

                <div className="flex-1 min-w-0">
                  {/* Name + Badges */}
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-gray-800 font-fredoka">
                      {getNameInLang(result, language)}
                    </h2>
                    <Badge variant="secondary" className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {result.category}
                    </Badge>
                    {result.warning && (
                      <Badge className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        ⚠️ {result.warning}
                      </Badge>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 leading-relaxed mb-3">{getDescInLang(result, language)}</p>

                  {/* Fun Fact */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-2 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl border border-yellow-200 shadow-sm"
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <motion.div
                        animate={{ rotate: [0, 15, -15, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      </motion.div>
                      <span className="text-xs font-bold text-yellow-700">{t('funFact')}</span>
                    </div>
                    <p className="text-sm text-yellow-800 leading-relaxed">{getFactInLang(result, language)}</p>
                  </motion.div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-4 flex-wrap">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={onListen}
                      className="px-4 py-2 bg-gradient-to-r from-green-400 to-emerald-400 text-white rounded-xl font-medium hover:shadow-lg transition-all font-fredoka text-sm shadow-md"
                    >
                      <Volume2 className="h-4 w-4 inline mr-1.5" />{t('listenBtn')}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={onQuiz}
                      className="px-4 py-2 bg-gradient-to-r from-blue-400 to-cyan-400 text-white rounded-xl font-medium hover:shadow-lg transition-all font-fredoka text-sm shadow-md"
                    >
                      🧠 {t('quizBtn')}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={onPuzzle}
                      className="px-4 py-2 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-xl font-medium hover:shadow-lg transition-all font-fredoka text-sm shadow-md"
                    >
                      🧩 {t('puzzleBtn')}
                    </motion.button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
