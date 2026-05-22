"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";

interface CelebrationOverlayProps {
  isOpen: boolean;
  emoji: string;
  title: string;
  onClose: () => void;
  accentColor: string;
  accentHex: string;
  buttonRadius: string;
  lang?: string;
}

export default function CelebrationOverlay({
  isOpen,
  emoji,
  title,
  onClose,
  accentColor,
  accentHex,
  buttonRadius,
  lang = "en",
}: CelebrationOverlayProps) {
  const { t } = useTranslation(lang);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);

  // Play ta-da sound with proper cleanup
  useEffect(() => {
    if (!isOpen) return;

    const oscillators: OscillatorNode[] = [];

    try {
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      const now = ctx.currentTime;
      const notes = [
        { freq: 523.25, time: 0, duration: 0.15 },      // C5
        { freq: 659.25, time: 0.15, duration: 0.15 },   // E5
        { freq: 783.99, time: 0.3, duration: 0.3 },     // G5
      ];

      notes.forEach(({ freq, time, duration }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.value = freq;

        gain.gain.setValueAtTime(0.3, now + time);
        gain.gain.exponentialRampToValueAtTime(0.01, now + time + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + time);
        osc.stop(now + time + duration);

        oscillators.push(osc);
      });

      oscillatorsRef.current = oscillators;
    } catch (e) {
      console.warn("CelebrationOverlay: audio failed", e);
    }

    return () => {
      // Stop all oscillators explicitly
      oscillators.forEach((osc) => {
        try {
          osc.stop();
        } catch {
          // Ignore if already stopped
        }
      });
      oscillatorsRef.current = [];

      // Close audio context
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    };
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
            }}
            className="flex flex-col items-center gap-6"
          >
            {/* Floating emoji with glow */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
              style={{
                filter: `drop-shadow(0 0 20px ${accentHex}) drop-shadow(0 0 40px ${accentHex}40)`,
              }}
            >
              <span className="text-8xl select-none">{emoji}</span>
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              <h2 className="text-3xl font-bold text-white">
                {title}
              </h2>
            </motion.div>

            {/* Continue button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              <Button
                onClick={onClose}
                className="h-14 px-8"
                style={{
                  backgroundColor: accentColor,
                  borderRadius: buttonRadius,
                }}
              >
                {t("continue")}
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
