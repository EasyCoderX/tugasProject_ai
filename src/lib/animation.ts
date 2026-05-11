import { Variants, Transition } from 'framer-motion';

// Spring presets
export const SPRING = {
  snappy: { type: 'spring', stiffness: 400, damping: 30 } as Transition,
  bounce: { type: 'spring', stiffness: 260, damping: 20 } as Transition,
  gentle: { type: 'spring', stiffness: 200, damping: 25 } as Transition,
  sidebar: { type: 'spring', stiffness: 300, damping: 30 } as Transition,
};

// Micro-interaction: button press
export const tapScale = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
};

// Card hover lift (spec: y -3, spring 300/20)
export const cardLift = {
  whileHover: { y: -3, transition: { type: 'spring', stiffness: 300, damping: 20 } },
};

export const cardHover = {
  whileHover: { y: -4, transition: SPRING.snappy },
};

// Stagger container variants (pass staggerDelay as prop)
export function staggerContainer(delay = 0.05): Variants {
  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: delay },
    },
  };
}

// Stagger item variants
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: SPRING.bounce },
};

// Card flip variants (front → back)
export const cardFlipVariants: Variants = {
  front: { rotateY: 0, opacity: 1 },
  back: { rotateY: 180, opacity: 1 },
};

// Content fade-in with bounce
export const contentReveal: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: SPRING.bounce },
};

// Emoji bounce-in
export const emojiBounce: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 400, damping: 15 } },
};

// Section header slide-down
export const slideDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: SPRING.gentle },
};