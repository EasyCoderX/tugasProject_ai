'use client';

import { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Sparkles, RotateCw, SwitchCamera, ImagePlus, RotateCcw, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';
import { Btn, BigBtn } from '@/components/ui/action-buttons';
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
  const showCameraFeed = cameraActive && !capturedImage;
  const showCaptured = !!capturedImage;
  const showPlaceholder = !cameraActive && !capturedImage;

  return (
    <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-white/90 backdrop-blur-xl border border-white/50 aspect-[4/3] max-h-[45vh]"
         style={sectionAccent ? { boxShadow: `0 8px 32px ${sectionAccent.hex}20` } : {}}>
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

      {/* Neon corner brackets */}
      {sectionAccent && (
        <>
          <div className="absolute top-3 left-3 w-6 h-6 border-t-3 border-l-3 rounded-tl-lg" style={{ borderColor: sectionAccent.hex }} />
          <div className="absolute top-3 right-3 w-6 h-6 border-t-3 border-r-3 rounded-tr-lg" style={{ borderColor: sectionAccent.hex }} />
          <div className="absolute bottom-3 left-3 w-6 h-6 border-b-3 border-l-3 rounded-bl-lg" style={{ borderColor: sectionAccent.hex }} />
          <div className="absolute bottom-3 right-3 w-6 h-6 border-b-3 border-r-3 rounded-br-lg" style={{ borderColor: sectionAccent.hex }} />
        </>
      )}
    </div>
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

  return (
    <div className="flex items-center justify-center gap-4">
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
          <BigBtn onClick={onCapture} disabled={isIdentifying} sectionAccent={sectionAccent}>📷</BigBtn>
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
