'use client';

import { motion } from 'framer-motion';
import { BookOpen, Volume2, Check, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TabsContent } from '@/components/ui/tabs';
import { useTranslation } from '@/lib/i18n';
import type { HistoryItem } from '@/lib/helpers';

interface LearnTabProps {
  listenWord: string;
  listenOptions: HistoryItem[];
  listenAnswer: string | null;
  listenResult: 'correct' | 'wrong' | null;
  listenScore: { score: number; total: number };
  onStartListen: () => void;
  onAnswerListen: (itemName: string) => void;
  onSpeakTTS: (text: string) => void;
  language: string;
  getNameInLang: (item: HistoryItem, lang: string) => string;
}

export default function LearnTab({
  listenWord,
  listenOptions,
  listenAnswer,
  listenResult,
  listenScore,
  onStartListen,
  onAnswerListen,
  onSpeakTTS,
  language,
  getNameInLang,
}: LearnTabProps) {
  const { t } = useTranslation(language);

  return (
    <TabsContent value="learn" className="space-y-4">
      <motion.h3
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-lg font-bold flex items-center gap-2 font-fredoka"
        style={{ color: 'var(--kid-accent-hex)' }}
      >
        <BookOpen className="h-5 w-5" /> {t('learnPractice')}
      </motion.h3>

      {/* Listen and Pick */}
      {listenWord && listenOptions.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="card-kid">
            <CardContent className="p-5">
              <h4 className="font-bold text-gray-800 mb-1 flex items-center gap-2 font-fredoka text-base">
                👂 {t('listenChallengeTitle')}
              </h4>
              <p className="text-xs text-gray-500 mb-4">{t('listenInstruction')}</p>

              {/* Play Sound button with pulse animation */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSpeakTTS(listenWord)}
                className="mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:shadow-lg transition-all font-fredoka flex items-center gap-2 shadow-md"
                style={{ boxShadow: '0 4px 15px var(--kid-shadow-color)' }}
              >
                <Volume2 className="h-4 w-4" /> {t('playSound')}
              </motion.button>

              {/* Result messages */}
              {listenResult === 'correct' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-50 text-green-700 px-4 py-2.5 rounded-xl text-sm font-medium mb-3 flex items-center gap-2"
                  style={{ border: '2px solid rgb(34, 197, 94, 0.3)' }}
                >
                  <Check className="h-4 w-4" /> {t('listenCorrect')}
                </motion.div>
              )}
              {listenResult === 'wrong' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-50 text-red-700 px-4 py-2.5 rounded-xl text-sm font-medium mb-3 flex items-center gap-2"
                  style={{ border: '2px solid rgb(239, 68, 68, 0.3)' }}
                >
                  <X className="h-4 w-4" /> {t('listenWrong')}
                </motion.div>
              )}

              {/* Image Options Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {listenOptions.map((opt, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => onAnswerListen(getNameInLang(opt, language))}
                    disabled={listenAnswer !== null}
                    className={`rounded-2xl border-2 overflow-hidden transition-all duration-300
                      ${listenAnswer
                        ? (getNameInLang(opt, language) === listenWord
                          ? 'border-green-400 bg-green-50 shadow-lg'
                          : getNameInLang(opt, language) === listenAnswer
                            ? 'border-red-400 bg-red-50'
                            : 'border-gray-200 opacity-50')
                        : 'border-gray-200 hover:border-blue-300 hover:shadow-lg hover:scale-105 active:scale-95'
                      }`}
                    style={{
                      borderColor: listenAnswer && getNameInLang(opt, language) === listenWord
                        ? 'rgb(34, 197, 94)'
                        : listenAnswer && getNameInLang(opt, language) === listenAnswer
                          ? 'rgb(239, 68, 68)'
                          : `rgb(var(--kid-accent-rgb) / 0.3)`
                    }}
                  >
                    <img
                      src={opt.imageData}
                      alt={getNameInLang(opt, language)}
                      className="w-full aspect-square object-cover"
                    />
                    <div className="p-2 text-sm font-medium text-gray-700 truncate font-fredoka bg-white/50">
                      {opt.emoji} {getNameInLang(opt, language)}
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Score + Next */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-fredoka">
                    {t('score')}: {listenScore.score}/{listenScore.total}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {Math.round((listenScore.score / Math.max(listenScore.total, 1)) * 100)}%
                  </span>
                </div>
                <Progress
                  value={(listenScore.score / Math.max(listenScore.total, 1)) * 100}
                  className="h-2"
                  style={{ background: 'rgb(var(--kid-accent-rgb) / 0.2)' }}
                />
                <Button
                  onClick={onStartListen}
                  size="sm"
                  className="w-full bg-gradient-to-r from-green-400 to-emerald-400 text-white rounded-xl text-xs font-fredoka shadow-md hover:shadow-lg transition-all"
                  style={{ boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3)' }}
                >
                  {t('nextWord')} →
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <Card className="card-kid opacity-60">
          <CardContent className="p-6 text-center text-gray-400 text-sm font-fredoka">
            <div className="text-4xl mb-3">👂</div>
            {t('identifyFirstListen')}
          </CardContent>
        </Card>
      )}
    </TabsContent>
  );
}
