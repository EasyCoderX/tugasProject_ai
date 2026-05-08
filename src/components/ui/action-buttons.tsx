'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

const btnVariants = cva(
  'inline-flex items-center justify-center rounded-full shadow-lg transition-all disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      color: {
        // These classes will be overridden by inline styles using CSS variables
        orange: 'bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-orange-300/50',
        purple: 'bg-gradient-to-br from-purple-400 to-purple-500 text-white shadow-purple-300/50',
        teal: 'bg-gradient-to-br from-teal-400 to-teal-500 text-white shadow-teal-300/50',
        white: 'bg-white/90 shadow-md text-gray-600 hover:text-gray-800',
      },
      size: {
        sm: 'h-12 w-12 sm:h-14 sm:w-14', // 48px minimum for touch targets
        lg: 'h-20 w-20 sm:h-24 sm:w-24', // 80px for main action button
      },
    },
    defaultVariants: {
      color: 'orange',
      size: 'sm',
    },
  }
);

interface BtnProps extends VariantProps<typeof btnVariants> {
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export function Btn({ icon, onClick, color, size, disabled, className }: BtnProps) {
  return (
    <motion.div whileTap={{ scale: 0.9 }}>
      <button
        onClick={onClick}
        disabled={disabled}
        className={cn(btnVariants({ color, size }), className)}
        data-slot="btn"
        style={{
          minWidth: '48px',
          minHeight: '48px',
        }}
      >
        {icon}
      </button>
    </motion.div>
  );
}

interface BigBtnProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export function BigBtn({ children, onClick, disabled, className }: BigBtnProps) {
  return (
    <motion.div whileTap={{ scale: 0.85 }} whileHover={{ scale: 1.05 }}>
      <button
        onClick={onClick}
        disabled={disabled}
        className={cn(
          'relative inline-flex items-center justify-center rounded-full shadow-xl disabled:opacity-50 overflow-hidden',
          'h-20 w-20 sm:h-24 sm:w-24',
          'bg-gradient-to-br from-red-400 via-pink-400 to-red-500 text-white',
          className
        )}
        data-slot="big-btn"
        style={{
          minWidth: '80px',
          minHeight: '80px',
        }}
      >
        <div className="absolute inset-0 rounded-full border-4 border-white/40" />
        <span className="relative z-10 text-3xl">{children}</span>
      </button>
    </motion.div>
  );
}
