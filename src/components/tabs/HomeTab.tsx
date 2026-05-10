'use client';

import { TabsContent } from '@/components/ui/tabs';
import CameraView, { CameraActions } from '@/components/CameraView';
import ResultCard from '@/components/ResultCard';
import { useTranslation } from '@/lib/i18n';
import type { IdentifyResult } from '@/lib/helpers';

interface HomeTabProps {
  // Refs
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;

  // Camera state
  cameraActive: boolean;
  cameraSupported: boolean;
  cameraLoading: boolean;
  facingMode: 'environment' | 'user';
  capturedImage: string | null;
  imageRotation: number;

  // Camera handlers
  onStartCamera: (preferBack?: boolean) => void;
  onSwitchCamera: () => void;
  onCapture: () => void;
  onRotateImage: () => void;
  onResetView: () => void;
  onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

  // Identify state
  isIdentifying: boolean;
  currentResult: IdentifyResult | null;
  error: string | null;

  // TTS
  onSpeakTTS: (text: string) => void;

  // Navigation
  onLearn: () => void;
  onGames: () => void;

  // Helpers
  language: string;
  getNameInLang: (item: IdentifyResult, lang: string) => string;
  getDescInLang: (item: IdentifyResult, lang: string) => string;
  getFactInLang: (item: IdentifyResult, lang: string) => string;
  sectionAccent?: { hex: string; rgb: string; gradient: string };
}

export default function HomeTab({
  videoRef,
  canvasRef,
  fileInputRef,
  cameraActive,
  cameraSupported,
  cameraLoading,
  facingMode,
  capturedImage,
  imageRotation,
  onStartCamera,
  onSwitchCamera,
  onCapture,
  onRotateImage,
  onResetView,
  onFileInputChange,
  isIdentifying,
  currentResult,
  error,
  onSpeakTTS,
  language,
  onLearn,
  onGames,
  getNameInLang,
  getDescInLang,
  getFactInLang,
  sectionAccent,
}: HomeTabProps) {
  const { t } = useTranslation(language);

  return (
    <TabsContent value="home" className="flex-1 min-h-0 flex flex-col gap-3 overflow-y-auto pb-2">
      {/* Camera View - Centered Hero Card */}
      <div className="max-w-lg mx-auto px-1">
        <div
          className="relative rounded-3xl overflow-hidden shadow-2xl bg-white/90 backdrop-blur-xl border border-white/50"
          style={sectionAccent ? { boxShadow: `0 8px 32px ${sectionAccent.hex}20` } : {}}
        >
          {/* Radial glow behind */}
          <div
            className="absolute inset-0 pointer-events-none rounded-3xl opacity-30 -z-10"
            style={sectionAccent ? { background: `radial-gradient(circle, ${sectionAccent.hex}40 0%, transparent 70%)` } : {}}
          />
          <CameraView
            videoRef={videoRef}
            canvasRef={canvasRef}
            fileInputRef={fileInputRef}
            cameraActive={cameraActive}
            capturedImage={capturedImage}
            currentResult={currentResult}
            isIdentifying={isIdentifying}
            error={error}
            cameraLoading={cameraLoading}
            cameraSupported={cameraSupported}
            imageRotation={imageRotation}
            facingMode={facingMode}
            onStartCamera={onStartCamera}
            onStopCamera={() => {}}
            onSwitchCamera={onSwitchCamera}
            onCapture={onCapture}
            onRotateImage={onRotateImage}
            onResetView={onResetView}
            onFileUpload={(e) => onFileInputChange(e)}
            onSpeakTTS={onSpeakTTS}
            t={t}
            language={language}
            sectionAccent={sectionAccent}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <CameraActions
        capturedImage={capturedImage}
        currentResult={currentResult}
        cameraActive={cameraActive}
        isIdentifying={isIdentifying}
        cameraSupported={cameraSupported}
        onResetView={onResetView}
        onRotateImage={onRotateImage}
        onSpeakTTS={(text) => onSpeakTTS(text)}
        onSwitchCamera={onSwitchCamera}
        onCapture={onCapture}
        onFileUpload={() => fileInputRef.current?.click()}
        onStartCamera={() => onStartCamera()}
        language={language}
        t={t}
        sectionAccent={sectionAccent}
      />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onFileInputChange}
        className="hidden"
      />

      {/* Result Card */}
      {currentResult && (
        <ResultCard
          result={currentResult}
          language={language}
          onListen={onLearn}
          onQuiz={onGames}
          onPuzzle={() => onGames()}
          getNameInLang={getNameInLang}
          getDescInLang={getDescInLang}
          getFactInLang={getFactInLang}
          sectionAccent={sectionAccent}
        />
      )}
    </TabsContent>
  );
}
