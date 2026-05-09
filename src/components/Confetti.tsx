'use client';

import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useCallback } from 'react';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  opacity: number;
  color: string;
  shape: 'circle' | 'rect' | 'star';
  speed: number;
  delay: number;
}

interface ConfettiProps {
  isActive: boolean;
  count?: number;
  colors?: string[];
  duration?: number;
}

const DEFAULT_COLORS = [
  '#fb923c', '#4ade80', '#3b82f6', '#f472b6', '#a855f7',
  '#facc15', '#f97316', '#06b6d4', '#ec4899', '#84cc16',
];

export default function Confetti({
  isActive,
  count = 30,
  colors = DEFAULT_COLORS,
  duration = 6,
}: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  const generatePieces = useCallback(() => {
    const newPieces: ConfettiPiece[] = [];
    for (let i = 0; i < count; i++) {
      newPieces.push({
        id: i,
        x: Math.random() * 100,
        y: -10 - Math.random() * 20,
        rotation: Math.random() * 360,
        scale: 0.3 + Math.random() * 0.7,
        opacity: 0.7 + Math.random() * 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: ['circle', 'rect', 'star'][Math.floor(Math.random() * 3)] as const,
        speed: 1 + Math.random() * 2,
        delay: Math.random() * 0.5,
      });
    }
    setPieces(newPieces);
  }, [count, colors]);

  useEffect(() => {
    if (isActive) {
      generatePieces();
    }
  }, [isActive, generatePieces]);

  if (!isActive && pieces.length === 0) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {pieces.map((piece) => (
          <motion.div
            key={piece.id}
            initial={{
              x: `${piece.x}%`,
              y: `${piece.y}%`,
              rotate: piece.rotation,
              scale: piece.scale,
              opacity: piece.opacity,
            }}
            animate={{
              y: `${100 + Math.random() * 20}%`,
              rotate: piece.rotation + 360 * piece.speed,
              opacity: 0,
              x: `calc(${piece.x}% + ${(Math.random() - 0.5) * 40}px)`,
            }}
            transition={{
              duration: duration * (0.5 + Math.random()),
              delay: piece.delay,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            onAnimationComplete={() => {
              setPieces(prev => prev.filter(p => p.id !== piece.id));
            }}
            className="absolute"
            style={{ width: 10 * piece.scale + 'px', height: 10 * piece.scale + 'px' }}
          >
            {piece.shape === 'circle' && (
              <div
                className="rounded-full"
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: piece.color,
                  boxShadow: `0 2px 8px ${piece.color}66`,
                }}
              />
            )}
            {piece.shape === 'rect' && (
              <div
                className="rounded-sm"
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: piece.color,
                  boxShadow: `0 2px 6px ${piece.color}55`,
                }}
              />
            )}
            {piece.shape === 'star' && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                style={{ color: piece.color, fontSize: 12 * piece.scale }}
              >
                ✦
              </motion.div>
            )}
          </motion.div>
        ))}

        {/* Sparkle overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isActive ? 0.06 : 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 bg-gradient-to-br from-yellow-200 via-pink-200 to-blue-200"
          style={{ mixBlendMode: 'screen' }}
        />
      </div>
    </AnimatePresence>
  );
}