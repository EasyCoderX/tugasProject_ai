'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Volume2, VolumeX, RotateCcw, Sparkles, History, Loader2, Eye, BookOpen, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface IdentifyResult {
  name: string;
  emoji: string;
  description: string;
  funFact: string;
  category: string;
}

interface HistoryItem extends IdentifyResult {
  id: string;
  timestamp: Date;
  imageData: string;
}

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [currentResult, setCurrentResult] = useState<IdentifyResult | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch {
      setError('Camera access denied. Please allow camera access and try again!');
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [stopCamera]);

  // Capture image and identify
  const captureAndIdentify = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg', 0.8);

    setCapturedImage(imageData);
    setIsIdentifying(true);
    setCurrentResult(null);
    setError(null);

    try {
      const response = await fetch('/api/identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to identify object');
      }

      const result: IdentifyResult = await response.json();
      setCurrentResult(result);

      // Add to history
      setHistory((prev) => [
        { ...result, id: Date.now().toString(), timestamp: new Date(), imageData },
        ...prev,
      ]);

      // Auto-play voice
      playVoice(result);
    } catch {
      setError('Could not identify the object. Please try again!');
    } finally {
      setIsIdentifying(false);
    }
  }, []);

  // Play voice
  const playVoice = useCallback(async (result?: IdentifyResult) => {
    const target = result || currentResult;
    if (!target) return;

    setIsSpeaking(true);
    try {
      const response = await fetch('/api/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: target.description }),
      });

      if (!response.ok) throw new Error('Failed to generate voice');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }

      audioRef.current = new Audio(url);
      audioRef.current.onended = () => setIsSpeaking(false);
      audioRef.current.onerror = () => setIsSpeaking(false);
      await audioRef.current.play();
    } catch {
      setIsSpeaking(false);
    }
  }, [currentResult]);

  // Reset to camera view
  const resetView = useCallback(() => {
    setCapturedImage(null);
    setCurrentResult(null);
    setError(null);
    setIsSpeaking(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  // Toggle camera
  const toggleCamera = useCallback(() => {
    if (cameraActive) {
      stopCamera();
      resetView();
    } else {
      resetView();
      startCamera();
    }
  }, [cameraActive, stopCamera, startCamera, resetView]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 via-yellow-50 to-green-50">
      {/* Header */}
      <header className="relative overflow-hidden bg-gradient-to-r from-orange-400 via-yellow-400 to-green-400 py-4 px-4 sm:py-6 shadow-lg">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.3)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(255,255,255,0.2)_0%,transparent_50%)]" />
        <div className="relative max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="text-3xl sm:text-4xl"
            >
              🔍
            </motion.div>
            <div>
              <h1 className="text-xl sm:text-3xl font-extrabold text-white drop-shadow-md">
                What&apos;s This?
              </h1>
              <p className="text-xs sm:text-sm text-white/90 font-medium">
                Point, Snap & Learn!
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <motion.div whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowHistory(!showHistory)}
                  className="bg-white/20 hover:bg-white/30 text-white rounded-full h-10 w-10 sm:h-11 sm:w-11"
                >
                  <History className="h-5 w-5" />
                </Button>
              </motion.div>
            )}
            <motion.div whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleCamera}
                className={`rounded-full h-10 w-10 sm:h-11 sm:w-11 ${
                  cameraActive
                    ? 'bg-red-400/80 hover:bg-red-500/80 text-white'
                    : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
              >
                <Camera className="h-5 w-5" />
              </Button>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-4 sm:py-6 flex flex-col gap-4 sm:gap-6">
        {/* Camera / Image Display */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-black aspect-[4/3] max-h-[60vh]">
          {/* Corner decorations */}
          <div className="absolute top-3 left-3 w-8 h-8 border-t-3 border-l-3 border-yellow-400 rounded-tl-lg z-10 pointer-events-none" />
          <div className="absolute top-3 right-3 w-8 h-8 border-t-3 border-r-3 border-yellow-400 rounded-tr-lg z-10 pointer-events-none" />
          <div className="absolute bottom-3 left-3 w-8 h-8 border-b-3 border-l-3 border-yellow-400 rounded-bl-lg z-10 pointer-events-none" />
          <div className="absolute bottom-3 right-3 w-8 h-8 border-b-3 border-r-3 border-yellow-400 rounded-br-lg z-10 pointer-events-none" />

          {/* Crosshair overlay */}
          {cameraActive && !capturedImage && !isIdentifying && (
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <div className="w-24 h-24 border-2 border-white/40 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-yellow-400 rounded-full" />
              </div>
            </div>
          )}

          {/* Camera feed */}
          <AnimatePresence mode="wait">
            {cameraActive && !capturedImage ? (
              <motion.video
                key="camera"
                ref={videoRef}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : capturedImage ? (
              <motion.img
                key="captured"
                src={capturedImage}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                alt="Captured object"
                className="w-full h-full object-cover"
              />
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 text-white gap-4 p-8"
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-6xl sm:text-7xl"
                >
                  📸
                </motion.div>
                <div className="text-center">
                  <p className="text-lg sm:text-xl font-bold">Ready to Explore?</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Tap the camera button to start
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Identifying overlay */}
          <AnimatePresence>
            {isIdentifying && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-3 z-20"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkles className="h-12 w-12 text-yellow-400" />
                </motion.div>
                <p className="text-white text-lg font-bold">Identifying...</p>
                <p className="text-white/70 text-sm">Let me see what this is!</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error overlay */}
          <AnimatePresence>
            {error && !isIdentifying && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-4 left-4 right-4 z-20"
              >
                <div className="bg-red-500/90 backdrop-blur-sm text-white px-4 py-3 rounded-2xl text-sm font-medium text-center shadow-lg">
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3 sm:gap-4">
          {capturedImage && currentResult ? (
            <>
              {/* Try Again Button */}
              <motion.div whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }}>
                <Button
                  onClick={resetView}
                  className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white shadow-lg shadow-orange-300/50 text-xl"
                >
                  <RotateCcw className="h-6 w-6" />
                </Button>
              </motion.div>

              {/* Capture New Button */}
              <motion.div whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }}>
                <Button
                  onClick={captureAndIdentify}
                  disabled={!cameraActive || isIdentifying}
                  className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white shadow-lg shadow-green-300/50 disabled:opacity-50 disabled:cursor-not-allowed text-3xl"
                >
                  📷
                </Button>
              </motion.div>

              {/* Voice Button */}
              {currentResult && (
                <motion.div whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }}>
                  <Button
                    onClick={() => playVoice()}
                    disabled={isSpeaking}
                    className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-gradient-to-br from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white shadow-lg shadow-purple-300/50 disabled:opacity-50 text-xl"
                  >
                    {isSpeaking ? (
                      <VolumeX className="h-6 w-6" />
                    ) : (
                      <Volume2 className="h-6 w-6" />
                    )}
                  </Button>
                </motion.div>
              )}
            </>
          ) : cameraActive ? (
            <>
              {/* Info */}
              <motion.div whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }}>
                <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-white/80 shadow-md flex items-center justify-center text-2xl">
                  <Eye className="h-6 w-6 text-gray-500" />
                </div>
              </motion.div>

              {/* Main Capture Button */}
              <motion.div
                whileTap={{ scale: 0.85 }}
                whileHover={{ scale: 1.08 }}
              >
                <Button
                  onClick={captureAndIdentify}
                  disabled={isIdentifying}
                  className="h-24 w-24 sm:h-28 sm:w-28 rounded-full bg-gradient-to-br from-red-400 via-pink-400 to-red-500 hover:from-red-500 hover:via-pink-500 hover:to-red-600 text-white shadow-xl shadow-red-300/50 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                >
                  <div className="absolute inset-0 rounded-full border-4 border-white/40" />
                  <Camera className="h-10 w-10 sm:h-12 sm:w-12 relative z-10" />
                </Button>
              </motion.div>

              {/* Flash placeholder */}
              <motion.div whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }}>
                <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-white/80 shadow-md flex items-center justify-center text-2xl opacity-40">
                  ⚡
                </div>
              </motion.div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                onClick={startCamera}
                size="lg"
                className="bg-gradient-to-r from-orange-400 via-yellow-400 to-green-400 hover:from-orange-500 hover:via-yellow-500 hover:to-green-500 text-white font-bold text-lg px-8 py-6 rounded-full shadow-xl shadow-orange-200/50"
              >
                <Camera className="h-6 w-6 mr-2" />
                Open Camera
              </Button>
            </motion.div>
          )}
        </div>

        {/* Result Card */}
        <AnimatePresence mode="wait">
          {currentResult && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 20 }}
            >
              <Card className="border-2 border-yellow-200 bg-white/90 backdrop-blur-sm shadow-xl shadow-yellow-100/50 overflow-hidden">
                {/* Colorful top bar */}
                <div className="h-2 bg-gradient-to-r from-orange-400 via-yellow-400 via-green-400 to-teal-400" />

                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start gap-4">
                    {/* Emoji */}
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', delay: 0.2 }}
                      className="text-5xl sm:text-6xl flex-shrink-0"
                    >
                      {currentResult.emoji}
                    </motion.div>

                    <div className="flex-1 min-w-0">
                      {/* Name and category */}
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <h2 className="text-xl sm:text-2xl font-extrabold text-gray-800">
                          {currentResult.name}
                        </h2>
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-700 font-semibold text-xs"
                        >
                          {currentResult.category}
                        </Badge>
                      </div>

                      {/* Description */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                          {currentResult.description}
                        </p>
                      </motion.div>

                      {/* Fun fact */}
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mt-3 p-3 bg-yellow-50 rounded-xl border border-yellow-100"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs font-bold text-yellow-700 uppercase tracking-wide">
                            Fun Fact
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-yellow-800">
                          {currentResult.funFact}
                        </p>
                      </motion.div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* History Panel */}
        <AnimatePresence>
          {showHistory && history.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-2 border-orange-200 bg-white/90 backdrop-blur-sm shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="h-5 w-5 text-orange-500" />
                    <h3 className="font-bold text-gray-800">Discovery Log</h3>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-700 ml-auto">
                      {history.length} items
                    </Badge>
                  </div>
                  <ScrollArea className="max-h-72 overflow-y-auto">
                    <div className="space-y-2">
                      {history.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-orange-50 transition-colors cursor-pointer"
                          onClick={() => {
                            setCapturedImage(item.imageData);
                            setCurrentResult(item);
                            setShowHistory(false);
                          }}
                        >
                          <div className="text-3xl flex-shrink-0">{item.emoji}</div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-800 text-sm truncate">
                              {item.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.category} &middot;{' '}
                              {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <Volume2 className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State when no camera */}
        {!cameraActive && !currentResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center py-8"
          >
            <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
              {[
                { emoji: '🍎', label: 'Fruits' },
                { emoji: '🐕', label: 'Animals' },
                { emoji: '🚗', label: 'Vehicles' },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-white/60 backdrop-blur-sm"
                >
                  <span className="text-3xl">{item.emoji}</span>
                  <span className="text-xs font-medium text-gray-500">{item.label}</span>
                </motion.div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Point your camera at any object to learn what it is!
            </p>
          </motion.div>
        )}

        {/* Speaking indicator */}
        <AnimatePresence>
          {isSpeaking && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex items-center justify-center gap-2 py-2"
            >
              <div className="flex items-center gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ scaleY: [1, 1.8, 1] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.15,
                    }}
                    className="w-1.5 h-4 bg-purple-400 rounded-full"
                  />
                ))}
              </div>
              <span className="text-sm text-purple-600 font-medium">Speaking...</span>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-3 px-4 text-center bg-white/50 backdrop-blur-sm border-t border-gray-100">
        <p className="text-xs text-gray-400">
          🔍 What&apos;s This? &mdash; AI-Powered Object Learning for Kids
        </p>
      </footer>
    </div>
  );
}
