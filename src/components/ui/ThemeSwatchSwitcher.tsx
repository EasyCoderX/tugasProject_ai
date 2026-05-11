'use client';

import { motion } from 'framer-motion';
import { THEMES } from '@/lib/themes';

interface ThemeSwatchSwitcherProps {
  currentTheme: string;
  onThemeChange: (themeId: string) => void;
}

// 2-stop gradient for each theme's swatch preview
const SWATCH_GRADIENTS: Record<string, string> = {
  default:   'linear-gradient(135deg, #fb923c 0%, #fdba74 100%)',
  ocean:     'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
  forest:    'linear-gradient(135deg, #22c55e 0%, #84cc16 100%)',
  sunset:    'linear-gradient(135deg, #f43f5e 0%, #fb923c 100%)',
  night:     'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  candy:     'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',
};

// Short labels so 6 swatches fit in a single row
const SWATCH_LABELS: Record<string, string> = {
  default:   'Meadow',
  ocean:     'Coral',
  forest:    'Woods',
  sunset:    'Sunset',
  night:     'Night',
  candy:     'Sugar',
};

export default function ThemeSwatchSwitcher({ currentTheme, onThemeChange }: ThemeSwatchSwitcherProps) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-3 justify-center">
      {THEMES.map((theme) => {
        const isActive = theme.id === currentTheme;
        return (
          <motion.button
            key={theme.id}
            onClick={() => onThemeChange(theme.id)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            whileFocus={{ scale: 1.05 }}
            className="flex flex-col items-center gap-1.5 flex-shrink-0"
            aria-label={theme.name}
            title={theme.name}
          >
            <motion.div
              animate={{ scale: isActive ? 1.25 : 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className={`
                w-9 h-9 rounded-full border-[2.5px] transition-colors
                ${isActive ? 'ring-2 ring-white ring-offset-2 shadow-lg' : 'border-transparent'}
              `}
              style={{
                background: SWATCH_GRADIENTS[theme.id] || SWATCH_GRADIENTS.default,
                boxShadow: isActive ? `0 4px 12px ${theme.accentHex}60` : 'none',
              }}
            />
            <span className={`text-[10px] whitespace-nowrap ${isActive ? 'font-bold' : 'font-medium opacity-60'}`}>
              {theme.emoji} {theme.name}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
