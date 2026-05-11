'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Sparkles, RotateCw, SwitchCamera, ImagePlus, RotateCcw, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Btn } from '@/components/ui/action-buttons';
import type { IdentifyResult } from '@/lib/helpers';

interface CameraViewProps {
  // Refs (passed as refs, not values)
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;

  // State
  cameraActive: boolean;
  capturedImage: string | null;
  currentResult: IdentifyResult | null;
  isIdentifying: boolean;
  error: string | null;
  cameraLoading: boolean;
  cameraSupported: boolean;
  imageRotation: number;
  facingMode: 'environment' | 'user';

  // Handlers
  onStartCamera: (preferBack?: boolean) => void;
  onStopCamera: () => void;
  onSwitchCamera: () => void;
  onCapture: () => void;
  onRotateImage: () => void;
  onResetView: () => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSpeakTTS: (text: string) => void;

  // Misc
  t: (key: string, params?: Record<string, string | number>) => string;
  language: string;
  sectionAccent?: { hex: string; rgb: string };
}

export default function CameraView({
  videoRef,
  canvasRef,
  fileInputRef,
  cameraActive,
  capturedImage,
  currentResult,
  isIdentifying,
  error,
  cameraLoading,
  cameraSupported,
  imageRotation,
  facingMode,
  onStartCamera,
  onStopCamera,
  onSwitchCamera,
  onCapture,
  onRotateImage,
  onResetView,
  onFileUpload,
  onSpeakTTS,
  t,
  language,
  sectionAccent,
}: CameraViewProps) {
  const showCameraFeed  = cameraActive && !capturedImage;
  const showCaptured   = !!capturedImage;
  const showPlaceholder = !cameraActive && !capturedImage;

  // ── 9. HERO CAMERA CARD — neon corner bracket mount animation ──────────
  const bracketVariants = {
    hidden: { scaleX: 0, scaleY: 0 },
    visible: (i: number) => ({
      scaleX: 1,
      scaleY: 1,
      transition: {
        delay: i * 0.12,
        type: 'spring' as const,
        stiffness: 260,
        damping: 22,
      },
    }),
  };

  return (
    <div
      className="relative rounded-3xl overflow-hidden bg-white/90 backdrop-blur-xl border border-white/50 aspect-[4/3] max-h-[45vh]"
      style={{
        // ── Breathing glow while camera is active ──
        boxShadow: cameraActive
          ? `0 0 8px ${sectionAccent?.hex ?? '#fb923c'}, 0 0 24px ${sectionAccent?.hex ?? '#fb923c'}40`
          : 'none',
        animation: cameraActive ? 'camera-breathing 2s ease-in-out infinite' : 'none',
      }}
    >
      {/* ── Scanning line (only when camera feed is live) ── */}
      <AnimatePresence>
        {showCameraFeed && (
          <motion.div
            key="scanline"
            initial={{ y: '-100%', opacity: 0 }}
            animate={{ y: '100%', opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0, opacity: { duration: 0.3 } }}
            className="absolute left-0 right-0 h-0.5 z-20 pointer-events-none"
            style={{
              background: `linear-gradient(90deg, transparent, ${sectionAccent?.hex ?? '#fb923c'}, transparent)`,
              animation: 'scan-sweep 2s linear infinite',
              animationDelay: '0.5s',
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Neon corner brackets — staggered draw-in on mount ── */}
      {sectionAccent && (
        <>
          {/* TL */}
          <motion.div
            custom={0}
            initial="hidden"
            animate="visible"
            variants={bracketVariants}
            className="absolute top-3 left-3 w-6 h-6 border-t-3 border-l-3 rounded-tl-lg origin-top-left"
            style={{ borderColor: sectionAccent.hex, boxShadow: `0 0 8px ${sectionAccent.hex}60` }}
          />
          {/* TR */}
          <motion.div
            custom={1}
            initial="hidden"
            animate="visible"
            variants={bracketVariants}
            className="absolute top-3 right-3 w-6 h-6 border-t-3 border-r-3 rounded-tr-lg origin-top-right"
            style={{ borderColor: sectionAccent.hex, boxShadow: `0 0 8px ${sectionAccent.hex}60` }}
          />
          {/* BL */}
          <motion.div
            custom={2}
            initial="hidden"
            animate="visible"
            variants={bracketVariants}
            className="absolute bottom-3 left-3 w-6 h-6 border-b-3 border-l-3 rounded-bl-lg origin-bottom-left"
            style={{ borderColor: sectionAccent.hex, boxShadow: `0 0 8px ${sectionAccent.hex}60` }}
          />
          {/* BR */}
          <motion.div
            custom={3}
            initial="hidden"
            animate="visible"
            variants={bracketVariants}
            className="absolute bottom-3 right-3 w-6 h-6 border-b-3 border-r-3 rounded-br-lg origin-bottom-right"
            style={{ borderColor: sectionAccent.hex, boxShadow: `0 0 8px ${sectionAccent.hex}60` }}
          />
        </>
      )}

      {/* Camera Feed */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300
          ${showCameraFeed ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
      />

      {/* Captured Image */}
      <AnimatePresence>
        {showCaptured && (
          <motion.img
            key="captured"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            src={capturedImage!}
            alt="Captured"
            className="absolute inset-0 w-full h-full object-contain z-20 bg-black"
            style={{ transform: `rotate(${imageRotation}deg)` }}
          />
        )}
      </AnimatePresence>

      {/* Placeholder */}
      {showPlaceholder && (
        <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center text-white gap-3 z-30"
            style={{ background: sectionAccent ? `linear-gradient(135deg, ${sectionAccent.hex}30 0%, ${sectionAccent.hex}10 100%)` : 'linear-gradient(135deg, #374151 0%, #111827 100%)' }}>
          <motion.div
            animate={{ y: [0, -6, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-6xl"
          >
            📸
          </motion.div>
          <p className="text-base font-bold text-center px-4">{t('readyToExplore')}</p>
          <p className="text-xs text-gray-400 text-center px-4">
            {cameraSupported ? t('useCameraOrUpload') : t('uploadAnImage')}
          </p>
        </div>
      )}

      {/* Camera Loading */}
      {cameraLoading && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-40">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Camera className="h-12 w-12 text-yellow-400 drop-shadow-lg" />
          </motion.div>
        </div>
      )}

      {/* Identifying Loading */}
      {isIdentifying && (
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-3 z-40">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles className="h-12 w-12 text-yellow-400 drop-shadow-lg" />
          </motion.div>
          <p className="text-white font-bold text-sm">{t('identifying')}</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="absolute bottom-4 left-4 right-4 z-40">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/90 text-white px-4 py-2.5 rounded-xl text-xs font-medium text-center backdrop-blur-sm shadow-lg"
          >
            {error}
          </motion.div>
        </div>
      )}

      {/* Hidden canvas */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

// ── 10. INSTRUCTION HINT BUBBLE ─────────────────────────────────────────
interface HintBubbleProps {
  cameraActive: boolean;
  accentHex: string;
}
const HINTS = [
  'Point at anything! 🌟',
  'What IS that? 🤔',
  "Let's find out! 🔍",
];
function HintBubble({ cameraActive, accentHex }: HintBubbleProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!cameraActive) return;
    const id = setInterval(() => setIndex(i => (i + 1) % HINTS.length), 3000);
    return () => clearInterval(id);
  }, [cameraActive]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${cameraActive}-${index}`}
        initial={{ opacity: 0, y: 8, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.9 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="absolute -top-12 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
      >
        {/* Speech bubble tail */}
        <div
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45"
          style={{ background: accentHex }}
        />
        <div
          className="px-4 py-2 rounded-2xl text-white text-sm font-bold whitespace-nowrap shadow-lg font-fredoka"
          style={{
            background: `linear-gradient(135deg, ${accentHex}, ${accentHex}cc)`,
            boxShadow: `0 4px 16px ${accentHex}50`,
          }}
        >
          {HINTS[index]}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Action buttons component
interface CameraActionsProps {
  capturedImage: string | null;
  currentResult: IdentifyResult | null;
  cameraActive: boolean;
  isIdentifying: boolean;
  cameraSupported: boolean;
  onResetView: () => void;
  onRotateImage: () => void;
  onSpeakTTS: (text: string) => void;
  onSwitchCamera: () => void;
  onCapture: () => void;
  onFileUpload: () => void;
  onStartCamera: () => void;
  language: string;
  t: (key: string, params?: Record<string, string | number>) => string;
  sectionAccent?: { hex: string; rgb: string; gradient: string };
}

export function CameraActions({
  capturedImage,
  currentResult,
  cameraActive,
  isIdentifying,
  cameraSupported,
  onResetView,
  onRotateImage,
  onSpeakTTS,
  onSwitchCamera,
  onCapture,
  onFileUpload,
  onStartCamera,
  language,
  t,
  sectionAccent,
}: CameraActionsProps) {
  const [confetti, setConfetti] = useState(false);
  const getNameInLang = (item: IdentifyResult, lang: string): string => {
    const opts = item.nameOptions;
    return (opts && opts[lang as keyof typeof opts]) || item.name;
  };

  const getDescInLang = (item: IdentifyResult, lang: string): string => {
    const opts = item.descriptionOptions;
    return (opts && opts[lang as keyof typeof opts]) || item.description;
  };

  const getFactInLang = (item: IdentifyResult, lang: string): string => {
    const opts = item.funFactOptions;
    return (opts && opts[lang as keyof typeof opts]) || item.funFact;
  };

  const accentHex = sectionAccent?.hex ?? '#fb923c';

  // ── 9. CTA button with confetti burst ──────────────────────────────────
  const handleCapture = () => {
    setConfetti(true);
    setTimeout(() => setConfetti(false), 700);
    onCapture();
  };

  return (
    <div className="relative flex items-center justify-center gap-4">
      {capturedImage && currentResult ? (
        <>
          <Btn icon={<RotateCcw className="h-5 w-5" />} onClick={onResetView} color="orange" sectionAccent={sectionAccent} />
          <Btn icon={<RotateCw className="h-5 w-5" />} onClick={onRotateImage} color="teal" sectionAccent={sectionAccent} />
          <Btn
            icon={<Volume2 className="h-5 w-5" />}
            onClick={() =>
              onSpeakTTS(
                `${getNameInLang(currentResult, language)}. ${getDescInLang(currentResult, language)}. ${t('ttsFunFact', { fact: getFactInLang(currentResult, language) })}`
              )
            }
            color="purple"
            sectionAccent={sectionAccent}
          />
        </>
      ) : cameraActive ? (
        <>
          <Btn icon={<SwitchCamera className="h-5 w-5" />} onClick={onSwitchCamera} color="white" sectionAccent={sectionAccent} />

          {/* ── 9. Snap & Discover! CTA with confetti ── */}
          <div className="relative flex items-center">
            <HintBubble cameraActive={cameraActive} accentHex={accentHex} />
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={handleCapture}
              disabled={isIdentifying}
              className="relative overflow-visible flex items-center gap-2 px-8 py-4 rounded-full text-white font-bold text-base font-fredoka shadow-lg transition-all"
              style={{
                background: `linear-gradient(135deg, ${accentHex}, ${accentHex}cc)`,
                boxShadow: `0 6px 24px ${accentHex}50`,
              }}
            >
              {/* Confetti burst particles — live inside the button */}
              <AnimatePresence>
                {confetti && (
                  <div className="confetti-burst" aria-hidden="true">
                    {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
                      <motion.span
                        key={deg}
                        initial={{ scale: 0, opacity: 1, x: 0, y: 0 }}
                        animate={{ scale: 1, opacity: 0, x: Math.cos((deg * Math.PI) / 180) * 52, y: Math.sin((deg * Math.PI) / 180) * 52 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.65, ease: 'easeOut', delay: i * 0.03 }}
                        className="confetti-particle"
                        style={{
                          background: [accentHex, '#fbbf24', '#34d399', '#f472b6', '#60a5fa'][i % 5],
                        }}
                      />
                    ))}
                  </div>
                )}
              </AnimatePresence>
              <Camera className="h-5 w-5" />
              <span>{t('snapDiscover', { defaultValue: 'Snap & Discover!' })}</span>
            </motion.button>
          </div>

          <Btn icon={<ImagePlus className="h-5 w-5" />} onClick={onFileUpload} color="white" sectionAccent={sectionAccent} />
        </>
      ) : (
        <div className="flex items-center gap-3">
          {cameraSupported && (
            <Button
              onClick={onStartCamera}
              className="bg-gradient-to-r from-orange-400 to-green-400 hover:from-orange-500 hover:to-green-500 text-white font-bold rounded-full px-8 py-6 text-base font-fredoka shadow-lg hover:shadow-xl transition-all"
            >
              <Camera className="h-5 w-5 mr-2" />{t('camera')}
            </Button>
          )}
          <Button
            onClick={onFileUpload}
            className="bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-full px-8 py-6 text-base font-fredoka shadow-lg hover:shadow-xl transition-all"
          >
            <ImagePlus className="h-5 w-5 mr-2" />{t('upload')}
          </Button>
        </div>
      )}
    </div>
  );
}
