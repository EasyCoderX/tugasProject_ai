'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';
import type { HistoryItem } from '@/lib/helpers';

interface PuzzleGameProps {
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
  activeHistoryItem: HistoryItem | null;
  puzzleHistoryItem: HistoryItem | null;
  onPlacePiece: (idx: number) => void;
  onSelectPiece: (idx: number | null) => void;
  onPickNewImage: (item: HistoryItem) => void;
  onClosePuzzle: () => void;
  onStartPuzzle: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  language: string;
  pickRandomHistoryItem: (excludeId?: string) => HistoryItem | null;
}

export default function PuzzleGame({
  puzzlePieces,
  puzzleSlots,
  selectedPiece,
  puzzleResult,
  puzzlePieceWidth,
  puzzlePieceHeight,
  history,
  onPlacePiece,
  onSelectPiece,
  onPickNewImage,
  onClosePuzzle,
  onStartPuzzle,
  t,
  language,
  pickRandomHistoryItem,
}: PuzzleGameProps) {
  const { t: tLocal } = useTranslation(language);

  return (
    <div className="card-kid">
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold font-fredoka text-base" style={{ color: 'var(--kid-accent-hex)' }}>
            🧩 {tLocal('puzzleChallenge')}
          </h4>
          <div className="flex items-center gap-2">
            {history.length > 1 && (
              <button
                onClick={() => {
                  const newItem = pickRandomHistoryItem();
                  if (newItem) onPickNewImage(newItem);
                }}
                className="text-xs text-purple-600 hover:underline font-fredoka px-3 py-1.5 rounded-lg hover:bg-purple-50 transition-colors"
              >
                {tLocal('newImage') || 'New Image'}
              </button>
            )}
            <button
              onClick={onClosePuzzle}
              className="text-xs text-gray-500 hover:underline font-fredoka px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {tLocal('close')}
            </button>
          </div>
        </div>

        {/* Puzzle slots */}
        {puzzlePieceWidth > 0 && (
          <>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {puzzleSlots.map((piece, i) => (
                <div
                  key={i}
                  onClick={() => onPlacePiece(i)}
                  className={`rounded-2xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-all duration-300 min-h-[100px] sm:min-h-[120px]
                    ${piece ? 'border-solid shadow-md' : 'border-gray-300 bg-gray-50 hover:border-gray-400'}`}
                  style={{
                    backgroundImage: piece ? `url(${piece})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    aspectRatio: puzzlePieceWidth / puzzlePieceHeight,
                    borderColor: piece ? 'var(--kid-accent-hex)' : undefined
                  }}
                >
                  {!piece && <span className="text-gray-300 text-2xl">+</span>}
                </div>
              ))}
            </div>

            {/* Puzzle result */}
            {puzzleResult && (
              <div
                className="text-center p-4 rounded-2xl font-fredoka shadow-md"
                style={{
                  background: puzzleResult === 'correct' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  border: `2px solid ${puzzleResult === 'correct' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                }}
              >
                <div className="text-3xl mb-2">{puzzleResult === 'correct' ? '✅' : '❌'}</div>
                <p className="text-sm font-bold" style={{
                  color: puzzleResult === 'correct' ? 'rgb(21, 128, 61)' : 'rgb(185, 28, 28)'
                }}>
                  {puzzleResult === 'correct' ? tLocal('puzzleCorrect') : tLocal('puzzleIncorrect')}
                </p>
              </div>
            )}

            {!puzzleResult && (
              <p className="text-[10px] text-gray-500 text-center font-fredoka mb-4">
                {tLocal('puzzleInstruction')}
              </p>
            )}

            {/* Puzzle pieces */}
            <div className="grid grid-cols-4 gap-3 mt-2">
              {puzzlePieces.map((piece, i) => (
                <div
                  key={i}
                  onClick={() => onSelectPiece(i)}
                  className={`rounded-2xl bg-center bg-no-repeat cursor-pointer border-2 transition-all duration-300
                    ${selectedPiece === i ? 'border-purple-500 shadow-lg scale-105' : 'border-gray-200 hover:shadow-md hover:scale-102'}`}
                  style={{
                    backgroundImage: `url(${piece})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    aspectRatio: puzzlePieceWidth / puzzlePieceHeight,
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
