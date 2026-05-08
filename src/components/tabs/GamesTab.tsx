'use client';

import { TabsContent } from '@/components/ui/tabs';
import { Gamepad2, ChevronRight } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import QuizGame from './QuizGame';
import PuzzleGame from './PuzzleGame';
import type { HistoryItem, IdentifyResult } from '@/lib/helpers';

interface GamesTabProps {
  // Quiz state
  quizActive: boolean;
  quizQuestion: string;
  quizOptions: string[];
  quizCorrect: number;
  quizAnswer: string | null;
  quizScore: { score: number; total: number };
  showQuizResult: boolean;
  quizGenerating: boolean;
  quizRevealed: boolean;
  quizCorrectAnswer: string | null;
  quizCache: Array<{ historyItem: HistoryItem; options: string[]; correctAnswer: string }>;
  isPreloading: boolean;

  // Quiz handlers
  onStartQuiz: () => void;
  onAnswerQuiz: (answer: string) => void;
  onRevealQuiz: () => void;

  // Puzzle state
  puzzleActive: boolean;
  puzzlePieces: string[];
  puzzleOriginalPieces: string[];
  puzzleSlots: (string | null)[];
  selectedPiece: number | null;
  puzzleResult: 'correct' | 'incorrect' | null;
  puzzleImageWidth: number;
  puzzleImageHeight: number;
  puzzlePieceWidth: number;
  puzzlePieceHeight: number;
  history: HistoryItem[];
  capturedImage: string | null;
  currentResult: IdentifyResult | null;
  activeHistoryItem: HistoryItem | null;
  puzzleHistoryItem: HistoryItem | null;

  // Puzzle handlers
  onStartPuzzle: () => void;
  onPlacePiece: (idx: number) => void;
  onSelectPiece: (idx: number | null) => void;
  onPickNewImage: (item: HistoryItem) => void;
  onClosePuzzle: () => void;

  // Shared
  t: (key: string, params?: Record<string, string | number>) => string;
  language: string;
  pickRandomHistoryItem: (excludeId?: string) => HistoryItem | null;
}

export default function GamesTab({
  quizActive,
  quizQuestion,
  quizOptions,
  quizAnswer,
  quizScore,
  showQuizResult,
  quizGenerating,
  quizRevealed,
  quizCorrectAnswer,
  onStartQuiz,
  onAnswerQuiz,
  onRevealQuiz,
  puzzleActive,
  puzzlePieces,
  puzzleSlots,
  selectedPiece,
  puzzleResult,
  puzzleImageWidth,
  puzzleImageHeight,
  puzzlePieceWidth,
  puzzlePieceHeight,
  history,
  capturedImage,
  currentResult,
  onPlacePiece,
  onSelectPiece,
  onPickNewImage,
  onClosePuzzle,
  onStartPuzzle,
  t,
  language,
  pickRandomHistoryItem,
}: GamesTabProps) {
  const { t: tLocal } = useTranslation(language);

  return (
    <TabsContent value="games" className="flex-1 min-h-0 overflow-y-auto pb-2">
      <div className="space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2 font-fredoka">
          <Gamepad2 className="h-5 w-5 text-purple-500" /> {tLocal('miniGames')}
        </h3>

        {/* Quiz Game */}
        {quizActive ? (
          <QuizGame
            quizQuestion={quizQuestion}
            quizOptions={quizOptions}
            quizAnswer={quizAnswer}
            quizScore={quizScore}
            showQuizResult={showQuizResult}
            quizGenerating={quizGenerating}
            quizRevealed={quizRevealed}
            quizCorrectAnswer={quizCorrectAnswer}
            currentResult={currentResult}
            capturedImage={capturedImage}
            onAnswer={onAnswerQuiz}
            onReveal={onRevealQuiz}
            onStartQuiz={onStartQuiz}
            language={language}
          />
        ) : (
          <div
            className="border-2 border-green-200 bg-white/90 cursor-pointer hover:shadow-md transition-shadow rounded-3xl overflow-hidden"
            onClick={(currentResult || history.length > 0) ? onStartQuiz : undefined}
          >
            <div className="p-4 flex items-center gap-3">
              <div className="text-3xl">🧠</div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-800 font-fredoka">{tLocal('quizCardTitle')}</h4>
                <p className="text-xs text-gray-500">
                  {currentResult ? tLocal('testKnowledge') : tLocal('identifyFirst')}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        )}

        {/* Puzzle Game */}
        {puzzleActive ? (
          <PuzzleGame
            puzzlePieces={puzzlePieces}
            puzzleSlots={puzzleSlots}
            selectedPiece={selectedPiece}
            puzzleResult={puzzleResult}
            puzzleImageWidth={puzzleImageWidth}
            puzzleImageHeight={puzzleImageHeight}
            puzzlePieceWidth={puzzlePieceWidth}
            puzzlePieceHeight={puzzlePieceHeight}
            history={history}
            onPlacePiece={onPlacePiece}
            onSelectPiece={onSelectPiece}
            onPickNewImage={onPickNewImage}
            onClosePuzzle={onClosePuzzle}
            t={t}
            language={language}
            pickRandomHistoryItem={pickRandomHistoryItem}
          />
        ) : (
          <div
            className="border-2 border-purple-200 bg-white/90 cursor-pointer hover:shadow-md transition-shadow rounded-3xl overflow-hidden"
            onClick={(capturedImage || history.length > 0) ? onStartPuzzle : undefined}
          >
            <div className="p-4 flex items-center gap-3">
              <div className="text-3xl">🧩</div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-800 font-fredoka">{tLocal('puzzleGameTitle')}</h4>
                <p className="text-xs text-gray-500">
                  {capturedImage ? tLocal('solvePuzzle') : tLocal('identifyFirstPuzzle')}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        )}
      </div>
    </TabsContent>
  );
}

