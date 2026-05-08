'use client';

import { motion } from 'framer-motion';
import { Sparkles, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from '@/lib/i18n';
import type { IdentifyResult } from '@/lib/helpers';

interface QuizGameProps {
  quizQuestion: string;
  quizOptions: string[];
  quizAnswer: string | null;
  quizScore: { score: number; total: number };
  showQuizResult: boolean;
  quizGenerating: boolean;
  quizRevealed: boolean;
  quizCorrectAnswer: string | null;
  currentResult: IdentifyResult | null;
  capturedImage: string | null;
  onAnswer: (answer: string) => void;
  onReveal: () => void;
  onStartQuiz: () => void;
  language: string;
}

export default function QuizGame({
  quizQuestion,
  quizOptions,
  quizAnswer,
  quizScore,
  showQuizResult,
  quizGenerating,
  quizRevealed,
  quizCorrectAnswer,
  currentResult,
  capturedImage,
  onAnswer,
  onReveal,
  onStartQuiz,
  language,
}: QuizGameProps) {
  const { t } = useTranslation(language);

  return (
    <div className="card-kid">
      <div className="p-5">
        <h4 className="font-bold mb-3 flex items-center gap-2 font-fredoka text-base" style={{ color: 'var(--kid-accent-hex)' }}>
          🧠 {t('quizChallenge')}
        </h4>

        {(currentResult?.imageData || capturedImage) && (
          <img
            src={currentResult?.imageData || capturedImage || ''}
            alt="Quiz image"
            className="w-full rounded-2xl mb-4 max-h-36 object-cover shadow-md"
          />
        )}

        <p className="font-medium text-gray-700 mb-4 text-base">{quizQuestion}</p>

        {quizGenerating ? (
          <div className="flex items-center justify-center py-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="h-8 w-8" style={{ color: 'var(--kid-accent-hex)' }} />
            </motion.div>
            <span className="ml-3 text-sm text-gray-500">
              {t('generating') || 'Generating options...'}
            </span>
          </div>
        ) : quizOptions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quizOptions.map((opt, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => onAnswer(opt)}
                disabled={quizAnswer !== null}
                className={`p-4 rounded-2xl text-sm font-medium transition-all duration-300 font-fredoka
                  ${quizAnswer && quizRevealed
                    ? (opt === quizCorrectAnswer
                        ? 'bg-green-100 border-2 border-green-400 text-green-700 shadow-lg scale-105'
                        : opt === quizAnswer
                          ? 'bg-red-100 border-2 border-red-400 text-red-700'
                          : 'bg-gray-50 text-gray-400 opacity-60')
                    : quizAnswer === opt
                      ? 'bg-blue-100 border-2 border-blue-400 text-blue-700 shadow-md'
                      : 'bg-white border-2 hover:shadow-lg hover:scale-105 active:scale-95 cursor-pointer'
                  }`}
                style={{
                  borderColor: quizAnswer && quizRevealed
                    ? (opt === quizCorrectAnswer ? 'rgb(34, 197, 94)' : opt === quizAnswer ? 'rgb(239, 68, 68)' : 'rgb(var(--kid-accent-rgb))')
                    : quizAnswer === opt
                      ? 'rgb(59, 130, 246)'
                      : 'rgb(var(--kid-accent-rgb))'
                }}
              >
                <span className="flex items-center gap-2">
                  {quizAnswer && quizRevealed && opt === quizCorrectAnswer && <Check className="h-4 w-4" />}
                  {quizAnswer && quizRevealed && opt === quizAnswer && opt !== quizCorrectAnswer && <X className="h-4 w-4" />}
                  {opt}
                </span>
              </motion.button>
            ))}
          </div>
        ) : null}

        {/* Reveal Answer button */}
        {quizAnswer && !quizRevealed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex gap-2 justify-center flex-wrap"
          >
            <button
              onClick={onReveal}
              className="bg-gradient-to-r from-green-400 to-emerald-400 text-white px-6 py-3 rounded-xl text-sm font-medium hover:shadow-lg transition-all font-fredoka shadow-md"
              style={{ boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3)' }}
            >
              <Check className="h-4 w-4 inline mr-2" />
              {t('revealAnswer') || 'Reveal Answer'}
            </button>
            <button
              onClick={onStartQuiz}
              className="text-xs text-gray-500 hover:underline font-fredoka px-4 py-2"
            >
              {t('tryAnother') || 'Try Another Question'}
            </button>
          </motion.div>
        )}

        {/* Result */}
        {showQuizResult && quizRevealed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 p-4 rounded-2xl text-sm font-medium text-center font-fredoka shadow-md"
            style={{
              background: quizScore.score === 1 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `2px solid ${quizScore.score === 1 ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              color: quizScore.score === 1 ? 'rgb(21, 128, 61)' : 'rgb(185, 28, 28)'
            }}
          >
            <div className="text-3xl mb-2">{quizScore.score === 1 ? '✅' : '❌'}</div>
            {quizScore.score === 1
              ? t('correctAnswer')
              : t('wrongAnswer', { name: quizCorrectAnswer || '' })}
            <div className="mt-3">
              <button onClick={onStartQuiz} className="text-xs underline font-fredoka">
                {quizScore.score === 1
                  ? (t('nextQuestion') || 'Next Question')
                  : (t('tryAnother') || 'Try Another Question')}
              </button>
            </div>
          </motion.div>
        )}

        {/* Score Progress */}
        {quizScore.total > 0 && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-fredoka">
                {t('score')}: {quizScore.score}/{quizScore.total}
              </span>
              <span className="text-[10px] text-gray-400 font-fredoka">
                {Math.round((quizScore.score / Math.max(quizScore.total, 1)) * 100)}%
              </span>
            </div>
            <Progress
              value={(quizScore.score / Math.max(quizScore.total, 1)) * 100}
              className="h-2"
              style={{ background: 'rgb(var(--kid-accent-rgb) / 0.2)' }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
