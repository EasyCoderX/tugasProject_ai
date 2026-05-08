'use client';

import { motion } from 'framer-motion';
import type { ThemeConfig } from '@/lib/themes';

interface ThemeCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  as?: keyof JSX.IntrinsicElements;
  themeData?: ThemeConfig; // Theme configuration
  themeStyle?: string; // Override theme style
}

export default function ThemeCard({
  children,
  className = '',
  onClick,
  as: Component = 'div',
  themeData,
  themeStyle,
}: ThemeCardProps) {
  // Use themeStyle prop, or derive from themeData cardStyle, or default to bouncy
  const cardClassName = themeStyle || (themeData ? `card-style-${themeData.cardStyle}` : 'card-style-bouncy');

  return (
    <motion.div
      as={Component}
      onClick={onClick}
      className={`${cardClassName} ${className}`}
      whileHover={{ scale: onClick ? 1.02 : 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {children}
    </motion.div>
  );
}
