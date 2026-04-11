'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Volume2, VolumeX, RotateCcw, Sparkles, History, SwitchCamera, ImagePlus, BookOpen, Star, Settings, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

// API TTS voice options
const API_VOICES = [
  { id: 'chuichui', label: 'Chuichui (Playful)', emoji: '🎈' },
  { id: 'tongtong', label: 'Tongtong (Warm)', emoji: '🌸' },
  { id: 'xiaochen', label: 'Xiaochen (Calm)', emoji: '🍃' },
  { id: 'jam', label: 'Jam (British)', emoji: '🎩' },
  { id: 'kazi', label: 'Kazi (Clear)', emoji: '🎤' },
  { id: 'douji', label: 'Douji (Natural)', emoji: '🎵' },
  { id: 'luodo', label: 'Luodo (Expressive)', emoji: '🎭' },
];

interface IdentifyResult {
  name: string;
  emoji: string;
  description: string;
  funFact: string;
  category: string;
}

interface VoiceSettings {
  voice: string;
  speed: number;
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
  const [cameraSupported, setCameraSupported] = useState(true);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [currentResult, setCurrentResult] = useState<IdentifyResult | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    voice: 'chuichui',
    speed: 0.85,
  });
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);

  // Check if camera is available on mount
  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setCameraSupported(false);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Helper: find the correct camera device by enumerating hardware devices
  const getCameraStream = useCallback(async (preferBack: boolean) => {
    try {
      const tempStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      tempStream.getTracks().forEach((t) => t.stop());

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((d) => d.kind === 'videoinput');

      if (videoDevices.length > 1) {
        const backKeywords = ['back', 'rear', 'environment', 'arriere', 'posterior', 'trasera', '后面'];
        const frontKeywords = ['front', 'user', 'face', 'avant', 'delantera', '前面'];
        let targetDevice: MediaDeviceInfo | undefined;

        if (preferBack) {
          targetDevice = videoDevices.find((d) =>
            backKeywords.some((k) => d.label.toLowerCase().includes(k))
          );
          if (!targetDevice) {
            targetDevice = videoDevices[videoDevices.length - 1];
          }
        } else {
          targetDevice = videoDevices.find((d) =>
            frontKeywords.some((k) => d.label.toLowerCase().includes(k))
          );
          if (!targetDevice) {
            targetDevice = videoDevices[0];
          }
        }

        if (targetDevice?.deviceId) {
          return await navigator.mediaDevices.getUserMedia({
            video: { deviceId: { exact: targetDevice.deviceId }, width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: false,
          });
        }
      } else if (videoDevices.length === 1) {
        return await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: videoDevices[0].deviceId }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
      }
    } catch {
      // fall through
    }

    const facing = preferBack ? 'environment' : 'user';
    try {
      return await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facing }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
    } catch {
      return await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
    }
  }, []);

  // Start camera
  const startCamera = useCallback(async (preferBack: boolean = true) => {
    try {
      setError(null);
      setCameraLoading(true);

      const stream = await getCameraStream(preferBack);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await new Promise<void>((resolve) => {
          const video = videoRef.current!;
          const onLoaded = () => { cleanup(); resolve(); };
          const onError = () => { cleanup(); resolve(); };
          const cleanup = () => {
            video.removeEventListener('loadeddata', onLoaded);
            video.removeEventListener('error', onError);
          };
          video.addEventListener('loadeddata', onLoaded);
          video.addEventListener('error', onError);
          setTimeout(() => { cleanup(); resolve(); }, 3000);
        });
        await videoRef.current.play();
      }

      setFacingMode(preferBack ? 'environment' : 'user');
      setCameraActive(true);
      setCameraLoading(false);
    } catch (err) {
      setCameraLoading(false);
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setError('Camera access denied. Please allow camera access!');
        setCameraSupported(false);
      } else if (err instanceof DOMException && err.name === 'NotFoundError') {
        setError('No camera found on this device.');
        setCameraSupported(false);
      } else {
        setError('Could not start the camera. Try uploading an image instead!');
        setCameraSupported(false);
      }
    }
  }, [getCameraStream]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  // Reset to camera view
  const resetView = useCallback(() => {
    setCapturedImage(null);
    setCurrentResult(null);
    setError(null);
    setIsSpeaking(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, []);

  // Build a fun, kid-friendly speech script from the result
  const buildKidScript = useCallback((result: IdentifyResult) => {
    const greetings = [
      `Ooh! Look at that! It's a ${result.name}!`,
      `Wow! I found a ${result.name}! How cool is that?`,
      `Ta-da! That's a ${result.name}!`,
      `Yay! It's a ${result.name}!`,
      `Great job! This is a ${result.name}!`,
    ];
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];
    return `${greeting} ${result.description} And here's a fun fact! ${result.funFact} Keep exploring!`;
  }, []);

  // Play voice using the API TTS
  const playVoice = useCallback(async (result?: IdentifyResult) => {
    const target = result || currentResult;
    if (!target) return;

    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    setIsSpeaking(true);

    try {
      const text = buildKidScript(target);

      const response = await fetch('/api/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice: voiceSettings.voice,
          speed: voiceSettings.speed,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate voice');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };
      audio.onerror = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch {
      setIsSpeaking(false);
    }
  }, [currentResult, voiceSettings, buildKidScript]);

  // Identify image from base64 data
  const identifyFromImage = useCallback(async (imageData: string) => {
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

      setHistory((prev) => [
        { ...result, id: Date.now().toString(), timestamp: new Date(), imageData },
        ...prev,
      ]);

      playVoice(result);
    } catch {
      setError('Could not identify the object. Please try again!');
    } finally {
      setIsIdentifying(false);
    }
  }, [playVoice]);

  // Capture image from camera and identify
  const captureAndIdentify = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL('image/jpeg', 0.8);

    await identifyFromImage(imageData);
  }, [identifyFromImage]);

  // Switch camera (front/back)
  const switchCamera = useCallback(async () => {
    const preferBack = facingMode !== 'environment';
    stopCamera();
    resetView();
    setCameraLoading(true);
    try {
      const stream = await getCameraStream(preferBack);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await new Promise<void>((resolve) => {
          const video = videoRef.current!;
          const onLoaded = () => { video.removeEventListener('loadeddata', onLoaded); resolve(); };
          video.addEventListener('loadeddata', onLoaded);
          setTimeout(resolve, 3000);
        });
        await videoRef.current.play();
      }
      setFacingMode(preferBack ? 'environment' : 'user');
      setCameraActive(true);
      setCameraLoading(false);
    } catch {
      setCameraLoading(false);
      setError('Could not switch camera.');
    }
  }, [facingMode, resetView, getCameraStream, stopCamera]);

  // Upload image from gallery
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      stopCamera();
      setCameraActive(false);
      identifyFromImage(base64);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }, [identifyFromImage, stopCamera]);

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

  // Determine what to show in the viewport area
  const showCameraFeed = cameraActive && !capturedImage;
  const showCaptured = !!capturedImage;
  const showPlaceholder = !cameraActive && !capturedImage;

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
                Point, Snap &amp; Learn!
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
            {cameraSupported && (
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
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-4 sm:py-6 flex flex-col gap-4 sm:gap-6">
        {/* Camera / Image Display */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-black aspect-[4/3] max-h-[60vh]">
          {/* Video element - always rendered, visibility controlled by CSS */}
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              showCameraFeed ? 'opacity-100 z-[1]' : 'opacity-0 z-0 pointer-events-none'
            }`}
          />

          {/* Captured image overlay */}
          <AnimatePresence>
            {showCaptured && (
              <motion.img
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                src={capturedImage}
                alt="Captured object"
                className="absolute inset-0 w-full h-full object-cover z-[2]"
              />
            )}
          </AnimatePresence>

          {/* Placeholder (no camera active, no captured image) */}
          <AnimatePresence>
            {showPlaceholder && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 text-white gap-4 p-8 z-[3]"
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
                    {cameraSupported
                      ? 'Tap the camera button or upload an image to start'
                      : 'Upload an image to start learning!'}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading camera indicator */}
          <AnimatePresence>
            {cameraLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-3 z-[5]"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Camera className="h-12 w-12 text-yellow-400" />
                </motion.div>
                <p className="text-white text-lg font-bold">Starting Camera...</p>
                <p className="text-white/70 text-sm">Please allow camera access</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Corner decorations - visible when camera is active */}
          <div className={`absolute inset-0 pointer-events-none z-[4] transition-opacity duration-300 ${showCameraFeed ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute top-3 left-3 w-8 h-8 border-t-[3px] border-l-[3px] border-yellow-400 rounded-tl-lg" />
            <div className="absolute top-3 right-3 w-8 h-8 border-t-[3px] border-r-[3px] border-yellow-400 rounded-tr-lg" />
            <div className="absolute bottom-3 left-3 w-8 h-8 border-b-[3px] border-l-[3px] border-yellow-400 rounded-bl-lg" />
            <div className="absolute bottom-3 right-3 w-8 h-8 border-b-[3px] border-r-[3px] border-yellow-400 rounded-br-lg" />
          </div>

          {/* Crosshair overlay */}
          <AnimatePresence>
            {showCameraFeed && !isIdentifying && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center z-[4] pointer-events-none"
              >
                <div className="w-24 h-24 border-2 border-white/40 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full" />
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
                className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-3 z-[6]"
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
                className="absolute bottom-4 left-4 right-4 z-[7]"
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

              {/* Capture New Button (camera) or Upload New */}
              {cameraActive ? (
                <motion.div whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }}>
                  <Button
                    onClick={captureAndIdentify}
                    disabled={isIdentifying}
                    className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white shadow-lg shadow-green-300/50 disabled:opacity-50 disabled:cursor-not-allowed text-3xl"
                  >
                    📷
                  </Button>
                </motion.div>
              ) : (
                <motion.div whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }}>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isIdentifying}
                    className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white shadow-lg shadow-green-300/50 disabled:opacity-50 disabled:cursor-not-allowed text-3xl"
                  >
                    📷
                  </Button>
                </motion.div>
              )}

              {/* Voice Settings / Replay Button */}
              <motion.div whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }}>
                <Button
                  onClick={() => {
                    if (isSpeaking) {
                      if (audioRef.current) {
                        audioRef.current.pause();
                        audioRef.current = null;
                      }
                      setIsSpeaking(false);
                    } else {
                      setShowVoiceSettings(!showVoiceSettings);
                    }
                  }}
                  className={`h-14 w-14 sm:h-16 sm:w-16 rounded-full shadow-lg disabled:opacity-50 text-xl transition-colors ${
                    showVoiceSettings
                      ? 'bg-gradient-to-br from-blue-400 to-blue-500 text-white shadow-blue-300/50'
                      : 'bg-gradient-to-br from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white shadow-purple-300/50'
                  }`}
                >
                  <Settings className="h-6 w-6" />
                </Button>
              </motion.div>
            </>
          ) : cameraActive ? (
            <>
              {/* Switch Camera */}
              <motion.div whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }}>
                <Button
                  onClick={switchCamera}
                  disabled={cameraLoading || isIdentifying}
                  className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-white/90 shadow-md hover:bg-white text-gray-600 hover:text-gray-800 disabled:opacity-50"
                >
                  <SwitchCamera className="h-6 w-6" />
                </Button>
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

              {/* Upload from Gallery */}
              <motion.div whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }}>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isIdentifying}
                  className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-white/90 shadow-md hover:bg-white text-gray-600 hover:text-gray-800 disabled:opacity-50"
                >
                  <ImagePlus className="h-6 w-6" />
                </Button>
              </motion.div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-4"
            >
              {cameraSupported && (
                <Button
                  onClick={startCamera}
                  size="lg"
                  className="bg-gradient-to-r from-orange-400 via-yellow-400 to-green-400 hover:from-orange-500 hover:via-yellow-500 hover:to-green-500 text-white font-bold text-lg px-8 py-6 rounded-full shadow-xl shadow-orange-200/50"
                >
                  <Camera className="h-6 w-6 mr-2" />
                  Open Camera
                </Button>
              )}
              <Button
                onClick={() => fileInputRef.current?.click()}
                size="lg"
                className="bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 hover:from-purple-500 hover:via-pink-500 hover:to-rose-500 text-white font-bold text-lg px-8 py-6 rounded-full shadow-xl shadow-purple-200/50"
              >
                <Upload className="h-6 w-6 mr-2" />
                Upload Image
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
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

        {/* Voice Settings Panel */}
        <AnimatePresence>
          {showVoiceSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-2 border-purple-200 bg-white/90 backdrop-blur-sm shadow-lg">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                    <h3 className="font-bold text-gray-800">Voice Settings</h3>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 ml-auto text-xs">
                      AI Voice
                    </Badge>
                  </div>

                  {/* Voice Selection */}
                  <div className="mb-4">
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                      🎙️ Voice
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {API_VOICES.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => setVoiceSettings((prev) => ({ ...prev, voice: v.id }))}
                          className={`p-2.5 rounded-xl text-xs font-medium transition-all text-left ${
                            voiceSettings.voice === v.id
                              ? 'bg-purple-100 border-2 border-purple-400 text-purple-700 shadow-sm'
                              : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-purple-50 hover:border-purple-200'
                          }`}
                        >
                          <span className="mr-1">{v.emoji}</span> {v.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Speed Control */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-semibold text-gray-700">
                        ⚡ Speed
                      </label>
                      <span className="text-xs font-mono bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                        {voiceSettings.speed.toFixed(2)}x
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="1.5"
                      step="0.05"
                      value={voiceSettings.speed}
                      onChange={(e) => setVoiceSettings((prev) => ({ ...prev, speed: parseFloat(e.target.value) }))}
                      className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-purple-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>Slow</span>
                      <span className="text-purple-500 font-medium">Kid-friendly</span>
                      <span>Fast</span>
                    </div>
                  </div>

                  {/* Preset Buttons */}
                  <div className="mb-4">
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                      🎭 Presets
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setVoiceSettings({ voice: 'chuichui', speed: 0.75 })}
                        className={`p-2 rounded-xl text-xs font-medium transition-all ${
                          voiceSettings.voice === 'chuichui' && voiceSettings.speed === 0.75
                            ? 'bg-yellow-100 border-2 border-yellow-400 text-yellow-700'
                            : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-yellow-50 hover:border-yellow-200'
                        }`}
                      >
                        👶 Toddler
                      </button>
                      <button
                        onClick={() => setVoiceSettings({ voice: 'chuichui', speed: 0.85 })}
                        className={`p-2 rounded-xl text-xs font-medium transition-all ${
                          voiceSettings.voice === 'chuichui' && voiceSettings.speed === 0.85
                            ? 'bg-green-100 border-2 border-green-400 text-green-700'
                            : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-green-50 hover:border-green-200'
                        }`}
                      >
                        🧒 Kid
                      </button>
                      <button
                        onClick={() => setVoiceSettings({ voice: 'tongtong', speed: 1.0 })}
                        className={`p-2 rounded-xl text-xs font-medium transition-all ${
                          voiceSettings.voice === 'tongtong' && voiceSettings.speed === 1.0
                            ? 'bg-blue-100 border-2 border-blue-400 text-blue-700'
                            : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-blue-50 hover:border-blue-200'
                        }`}
                      >
                        🧑 Normal
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => playVoice()}
                      className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      <Volume2 className="h-4 w-4" />
                      Play Again
                    </button>
                    <button
                      onClick={() => {
                        if (audioRef.current) {
                          audioRef.current.pause();
                          audioRef.current = null;
                        }
                        setIsSpeaking(false);
                      }}
                      className="py-2.5 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold text-sm transition-all flex items-center justify-center gap-1"
                    >
                      <VolumeX className="h-4 w-4" />
                      Stop
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Speaking indicator */}
        <AnimatePresence>
          {isSpeaking && !showVoiceSettings && (
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
