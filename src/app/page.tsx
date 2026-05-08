'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, Volume2, VolumeX, RotateCcw, Sparkles, SwitchCamera, ImagePlus,
  Upload, Settings, Star, BookOpen, MessageCircle, Home, Gamepad2,
  User, Trophy, Send, RotateCw, Puzzle, HelpCircle, Crown, LogOut,
  Languages, Palette, Trash2, ChevronRight, Check, X, Mic, Eye, Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Sidebar from '@/components/Sidebar';
import MobileTabBar from '@/components/MobileTabBar';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useTranslation, type Lang } from '@/lib/i18n';

// ==================== TYPES ====================
interface UserInfo {
  id: string; username: string; email: string; displayName: string | null;
  avatar: string | null; isPro: boolean; theme: string; language: string;
}
interface IdentifyResult {
  name: string; emoji: string; description: string; funFact: string; category: string; warning?: string;
  nameOptions?: { en?: string; id?: string; zh?: string };
  descriptionOptions?: { en?: string; id?: string; zh?: string };
  funFactOptions?: { en?: string; id?: string; zh?: string };
}
interface HistoryItem extends IdentifyResult {
  id: string; timestamp: Date; imageData: string;
}
interface Achievement {
  id: string; type: string; title: string; emoji: string; unlockedAt: string;
}
interface ChatMessage {
  role: 'user' | 'assistant'; content: string;
}

function getNameInLang(item: { name: string; nameOptions?: { en?: string; id?: string; zh?: string } }, lang: string): string {
  const opts = item.nameOptions;
  return (opts && opts[lang]) || item.name;
}
function getDescInLang(item: { description: string; descriptionOptions?: { en?: string; id?: string; zh?: string } }, lang: string): string {
  const opts = item.descriptionOptions;
  return (opts && opts[lang]) || item.description;
}
function getFactInLang(item: { funFact: string; funFactOptions?: { en?: string; id?: string; zh?: string } }, lang: string): string {
  const opts = item.funFactOptions;
  return (opts && opts[lang]) || item.funFact;
}

const THEMES = [
  { id: 'default', name: 'Default', emoji: '🌈', bg: 'from-orange-50 via-yellow-50 to-green-50', header: 'from-orange-400 via-yellow-400 to-green-400' },
  { id: 'ocean', name: 'Ocean', emoji: '🌊', bg: 'from-blue-50 via-cyan-50 to-teal-50', header: 'from-blue-500 via-cyan-500 to-teal-500' },
  { id: 'forest', name: 'Forest', emoji: '🌲', bg: 'from-green-50 via-emerald-50 to-lime-50', header: 'from-green-500 via-emerald-500 to-lime-500' },
  { id: 'sunset', name: 'Sunset', emoji: '🌅', bg: 'from-orange-50 via-rose-50 to-pink-50', header: 'from-orange-500 via-rose-500 to-pink-500' },
  { id: 'night', name: 'Night', emoji: '🌙', bg: 'from-slate-50 via-indigo-50 to-purple-50', header: 'from-slate-700 via-indigo-700 to-purple-700' },
  { id: 'candy', name: 'Candy', emoji: '🍬', bg: 'from-pink-50 via-fuchsia-50 to-violet-50', header: 'from-pink-400 via-fuchsia-400 to-violet-400' },
];

const LANGUAGES = [
  { id: 'en', name: 'English', emoji: '🇬🇧' },
  { id: 'id', name: 'Indonesia', emoji: '🇮🇩' },
  { id: 'zh', name: '中文', emoji: '🇨🇳' },
];

const ACHIEVEMENT_DEFS = [
  { type: 'first_scan', title: 'First Discovery!', emoji: '🔍', desc: 'Identify your very first object' },
  { type: 'scan_5', title: 'Explorer', emoji: '🧭', desc: 'Identify 5 different objects' },
  { type: 'scan_10', title: 'Scientist', emoji: '🔬', desc: 'Identify 10 different objects' },
  { type: 'scan_20', title: 'Professor', emoji: '🎓', desc: 'Identify 20 different objects' },
  { type: 'quiz_perfect', title: 'Perfect Score!', emoji: '💯', desc: 'Get a perfect score on a quiz' },
  { type: 'puzzle_complete', title: 'Puzzle Master', emoji: '🧩', desc: 'Complete a puzzle correctly' },
  { type: 'listen_master', title: 'Good Listener', emoji: '👂', desc: 'Listen and identify an object correctly' },
  { type: 'chat_first', title: 'Chatty Kid', emoji: '💬', desc: 'Send your first chat message' },
  { type: 'feedback_given', title: 'Helper', emoji: '⭐', desc: 'Submit app feedback' },
];

// ==================== MAIN APP ====================
export default function HomePage() {
  // Auth state
  const [user, setUser] = useState<UserInfo | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAuth, setShowAuth] = useState<'login' | 'register' | null>(null);
  const [authForm, setAuthForm] = useState({ username: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');

  // App state
  const [activeTab, setActiveTab] = useState('home');
  const [theme, setTheme] = useState('default');
  const [language, setLanguage] = useState('en');

  // Camera state
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraSupported, setCameraSupported] = useState(true);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [imageRotation, setImageRotation] = useState(0);

  // Identify state
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [currentResult, setCurrentResult] = useState<IdentifyResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // History state
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [activeHistoryItem, setActiveHistoryItem] = useState<HistoryItem | null>(null);
  const [puzzleHistoryItem, setPuzzleHistoryItem] = useState<HistoryItem | null>(null);

  // Listen state
  const [listenWord, setListenWord] = useState('');
  const [listenOptions, setListenOptions] = useState<HistoryItem[]>([]);
  const [listenAnswer, setListenAnswer] = useState<string | null>(null);
  const [listenResult, setListenResult] = useState<'correct' | 'wrong' | null>(null);
  const [listenScore, setListenScore] = useState({ score: 0, total: 0 });

  // Quiz state
  const [quizQuestion, setQuizQuestion] = useState('');
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const [quizCorrect, setQuizCorrect] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
  const [quizActive, setQuizActive] = useState(false);
  const [quizScore, setQuizScore] = useState({ score: 0, total: 0 });
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [quizGenerating, setQuizGenerating] = useState(false);
  const [quizRevealed, setQuizRevealed] = useState(false);
  const [quizCorrectAnswer, setQuizCorrectAnswer] = useState<string | null>(null);
  const [quizCache, setQuizCache] = useState<Array<{
    historyItem: HistoryItem;
    options: string[];
    correctAnswer: string;
  }>>([]);
  const [isPreloading, setIsPreloading] = useState(false);

  // Puzzle state
  const [puzzleActive, setPuzzleActive] = useState(false);
  const [puzzlePieces, setPuzzlePieces] = useState<string[]>([]);
  const [puzzleOriginalPieces, setPuzzleOriginalPieces] = useState<string[]>([]);
  const [puzzleSlots, setPuzzleSlots] = useState<(string | null)[]>([]);
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
  const [puzzleResult, setPuzzleResult] = useState<'correct' | 'incorrect' | null>(null);
  const [puzzleImageWidth, setPuzzleImageWidth] = useState(0);
  const [puzzleImageHeight, setPuzzleImageHeight] = useState(0);
  const [puzzlePieceWidth, setPuzzlePieceWidth] = useState(0);
  const [puzzlePieceHeight, setPuzzlePieceHeight] = useState(0);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Profile state
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [guestAchievements, setGuestAchievements] = useState<string[]>([]);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Set data-theme attribute for CSS theming
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  // ---- Load user on mount ----
  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setCameraSupported(false);
    }
    fetch('/api/auth/me').then(async r => {
      if (r.status === 401) {
        const savedLang = localStorage.getItem('language');
        const savedTheme = localStorage.getItem('theme');
        const savedGuestAchievements = localStorage.getItem('guestAchievements');
        if (savedLang) setLanguage(savedLang);
        if (savedTheme) setTheme(savedTheme);
        if (savedGuestAchievements) {
          try {
            const parsed = JSON.parse(savedGuestAchievements);
            setGuestAchievements(parsed);
            // Populate achievements state for display
            const achList = parsed.map((type: string) =>
              ACHIEVEMENT_DEFS.find(d => d.type === type)
            ).filter(Boolean).map((def: any) => ({
              id: def.type,
              type: def.type,
              title: def.title,
              emoji: def.emoji,
              unlockedAt: new Date().toISOString()
            }));
            setAchievements(achList);
          } catch {}
        }
        setAuthLoading(false);
        return;
      }
      const data = await r.json();
      if (data.id) { setUser(data); setTheme(data.theme || 'default'); setLanguage(data.language || 'en'); }
      setAuthLoading(false);
    }).catch(() => setAuthLoading(false));
  }, []);

  // ---- Cleanup camera on unmount ----
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // ---- Chat scroll ----
  useEffect(() => {
    if (chatScrollRef.current) {
      const el = chatScrollRef.current.querySelector('[data-radix-scroll-area-viewport]') || chatScrollRef.current;
      el.scrollTop = el.scrollHeight;
    }
  }, [chatMessages]);

  // ---- i18n ----
  const { t } = useTranslation(language);

  // ---- Theme ----
  const currentTheme = THEMES.find(th => th.id === theme) || THEMES[0];

  // ---- Achievement count (only count types defined in ACHIEVEMENT_DEFS) ----
  const unlockedCount = ACHIEVEMENT_DEFS.filter(a =>
    achievements.some(ach => ach.type === a.type)
  ).length;

  // ==================== AUTH ====================
  const handleAuth = async (mode: 'login' | 'register') => {
    setAuthError('');
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm),
      });
      const data = await res.json();
      if (!res.ok) { setAuthError(data.error || t('authFailed')); return; }
      setUser(data.user || data);
      setShowAuth(null);
      setAuthForm({ username: '', email: '', password: '' });
      if (mode === 'register') fetchHistory();
    } catch { setAuthError(t('networkError')); }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null); setHistory([]); setAchievements([]);
  };

  // ==================== CAMERA ====================
  const getCameraStream = useCallback(async (preferBack: boolean) => {
    try {
      const temp = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      temp.getTracks().forEach(t => t.stop());
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(d => d.kind === 'videoinput');
      if (videoDevices.length > 1) {
        const back = ['back', 'rear', 'environment'];
        let target = preferBack
          ? videoDevices.find(d => back.some(k => d.label.toLowerCase().includes(k))) || videoDevices[videoDevices.length - 1]
          : videoDevices[0];
        if (target?.deviceId) return await navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: target.deviceId }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
      } else if (videoDevices.length === 1) {
        return await navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: videoDevices[0].deviceId } }, audio: false });
      }
    } catch {}
    const facing = preferBack ? 'environment' : 'user';
    try { return await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: facing } }, audio: false }); }
    catch { return await navigator.mediaDevices.getUserMedia({ video: true, audio: false }); }
  }, []);

  const startCamera = useCallback(async (preferBack = true) => {
    try {
      setError(null); setCameraLoading(true);
      const stream = await getCameraStream(preferBack);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await new Promise<void>(r => { const v = videoRef.current!; v.onloadeddata = () => r(); setTimeout(r, 3000); });
        await videoRef.current.play();
      }
      setFacingMode(preferBack ? 'environment' : 'user');
      setCameraActive(true); setCameraLoading(false);
    } catch {
      setCameraLoading(false); setCameraSupported(false);
      setError(t('cameraNotAvailable'));
    }
  }, [getCameraStream]);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
  }, []);

  const switchCamera = useCallback(async () => {
    stopCamera();
    const preferBack = facingMode !== 'environment';
    await startCamera(preferBack);
  }, [facingMode, startCamera, stopCamera]);

  // ==================== IMAGE OPERATIONS ====================
  const rotateImage = useCallback(() => {
    setImageRotation(prev => (prev + 90) % 360);
  }, []);

  const getRotatedImage = useCallback(async (imgSrc: string, rotation: number): Promise<string> => {
    if (rotation === 0) return imgSrc;
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas');
        const isRotated = rotation === 90 || rotation === 270;
        c.width = isRotated ? img.height : img.width;
        c.height = isRotated ? img.width : img.height;
        const ctx = c.getContext('2d')!;
        ctx.translate(c.width / 2, c.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        resolve(c.toDataURL('image/jpeg', 0.9));
      };
      img.src = imgSrc;
    });
  }, []);

  // ==================== IDENTIFY ====================
  const identifyingRef = useRef(false);

  const identifyImage = useCallback(async (imageData: string) => {
    if (identifyingRef.current) return;
    identifyingRef.current = true;
    setIsIdentifying(true); setCurrentResult(null); setError(null);
    try {
      const rotated = await getRotatedImage(imageData, imageRotation);
      const res = await fetch('/api/identify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: rotated, language }) });
      if (!res.ok) throw new Error();
      const result: IdentifyResult = await res.json();
      setCurrentResult(result);
      setCapturedImage(rotated); setImageRotation(0);
      if (user && user.id !== 'guest') {
        // Save to DB history
        fetch('/api/history', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: result.name, emoji: result.emoji, description: result.description, funFact: result.funFact, category: result.category, imageData: rotated, nameOptions: result.nameOptions, descriptionOptions: result.descriptionOptions, funFactOptions: result.funFactOptions }) }).then(() => fetchHistory()).catch(() => {});
        // Only unlock first_scan if not already unlocked
        if (!achievements.some(ach => ach.type === 'first_scan')) {
          fetch('/api/achievements', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'first_scan', title: 'First Discovery!', emoji: '🔍' }) }).catch(() => {});
        }
      } else {
        // Guest: just save locally
        setHistory(prev => [{ ...result, id: Date.now().toString(), timestamp: new Date(), imageData: rotated }, ...prev]);
        unlockGuestAchievement('first_scan');
      }
      speakBrowserTTS(getNameInLang(result, language) + '. ' + getDescInLang(result, language) + '. ' + t('ttsFunFact', { fact: getFactInLang(result, language) }));
    } catch { setError(t('couldNotIdentify')); }
    finally { setIsIdentifying(false); identifyingRef.current = false; }
  }, [imageRotation, getRotatedImage, user, t]);

  const captureAndIdentify = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current, c = canvasRef.current;
    const containerAspect = 4/3;
    const videoAspect = (v.videoWidth || 640) / (v.videoHeight || 480);
    let sx = 0, sy = 0, sw = v.videoWidth || 640, sh = v.videoHeight || 480;
    if (videoAspect > containerAspect) {
      sw = sh * containerAspect;
      sx = ((v.videoWidth || 640) - sw) / 2;
    } else {
      sh = sw / containerAspect;
      sy = ((v.videoHeight || 480) - sh) / 2;
    }
    c.width = sw; c.height = sh;
    c.getContext('2d')?.drawImage(v, sx, sy, sw, sh, 0, 0, sw, sh);
    const dataUrl = c.toDataURL('image/jpeg', 0.8);
    setImageRotation(0);
    await identifyImage(dataUrl);
  }, [identifyImage]);

  // ==================== PLAY VOICE (for replay button) ====================

  // ==================== HELPER: Pick Random History Item ====================
  const pickRandomHistoryItem = useCallback((excludeId?: string): HistoryItem | null => {
    if (history.length === 0) return null;
    const available = excludeId
      ? history.filter(h => h.id !== excludeId)
      : history;
    if (available.length === 0) return history[0];
    return available[Math.floor(Math.random() * available.length)];
  }, [history]);

  // ==================== HELPER: Preload Quizzes ====================
  const preloadQuizzes = useCallback(async () => {
    if (history.length === 0 || isPreloading || quizCache.length >= 3) return;
    setIsPreloading(true);

    const needed = 3 - quizCache.length;
    const cachedIds = new Set(quizCache.map(q => q.historyItem.id));
    const available = history.filter(h => !cachedIds.has(h.id));

    for (let i = 0; i < Math.min(needed, available.length); i++) {
      const item = available[i];
      try {
        const recentNames = history.slice(0, 10).map(h => h.name).filter(n => n !== item.name);
        const res = await fetch('/api/quiz/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: item.name,
            category: item.category,
            description: item.description,
            language,
            recentNames
          })
        });
        if (res.ok) {
          const data = await res.json();
          const wrongAnswers = Array.isArray(data.wrongAnswers) ? data.wrongAnswers : [];
          const selected = wrongAnswers.sort(() => Math.random() - 0.5).slice(0, 4);
          const options = [item.name, ...selected].sort(() => Math.random() - 0.5);
          setQuizCache(prev => [...prev, {
            historyItem: item,
            options,
            correctAnswer: item.name
          }]);
        }
      } catch {}
      if (i < Math.min(needed, available.length) - 1) await new Promise(r => setTimeout(r, 1500));
    }
    setIsPreloading(false);
  }, [history, language, quizCache, isPreloading]);

  // ==================== RESET ====================
  const resetView = useCallback(() => {
    setCapturedImage(null); setCurrentResult(null); setError(null); setImageRotation(0);
  }, []);

  const resetHistory = async () => {
    if (user?.id !== 'guest') await fetch('/api/history', { method: 'DELETE' });
    setHistory([]);
  };

  const deleteHistoryItem = async (id: string) => {
    if (user?.id !== 'guest') {
      try {
        await fetch(`/api/history/${id}`, { method: 'DELETE' });
        fetchHistory();
      } catch {}
    } else {
      setHistory(prev => prev.filter(item => item.id !== id));
    }
  };

  // ==================== QUIZ ====================
  const startQuiz = useCallback(async () => {
    // Try to use a cached quiz first (instant, no waiting)
    if (quizCache.length > 0) {
      const cached = quizCache[0];
      setQuizCache(prev => prev.slice(1));
      setActiveHistoryItem(cached.historyItem);
      setQuizQuestion(t('quizQuestion'));
      setQuizCorrectAnswer(cached.correctAnswer);
      setQuizOptions(cached.options);
      setQuizAnswer(null);
      setQuizRevealed(false);
      setShowQuizResult(false);
      setQuizActive(true);
      setQuizScore({ score: 0, total: 1 });
      // Trigger preload to replenish cache
      setTimeout(() => preloadQuizzes(), 0);
      return;
    }

    // Fallback: generate on-demand
    const item = activeHistoryItem || pickRandomHistoryItem() || currentResult;
    if (!item) return;

    setActiveHistoryItem(item);
    setQuizCorrectAnswer(item.name);
    setQuizActive(true);
    setQuizAnswer(null);
    setQuizRevealed(false);
    setShowQuizResult(false);
    setQuizGenerating(true);
    setQuizQuestion(t('quizQuestion'));
    setQuizScore({ score: 0, total: 1 });

    const recentNames = history.slice(0, 10).map(h => h.name).filter(n => n !== item.name);

    try {
      const res = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: item.name, category: item.category, description: item.description, language, recentNames }),
      });
      if (res.ok) {
        const data = await res.json();
        const wrongAnswers = Array.isArray(data.wrongAnswers) ? data.wrongAnswers : [];
        const selected = wrongAnswers.sort(() => Math.random() - 0.5).slice(0, 4);
        const options = [item.name, ...selected].sort(() => Math.random() - 0.5);
        setQuizOptions(options);
        setQuizGenerating(false);
        return;
      }
    } catch {}

    setQuizGenerating(false);
    setQuizOptions([]);
    setQuizQuestion(t('quizError') || 'Could not generate quiz. Please try again!');
  }, [activeHistoryItem, currentResult, language, history, quizCache, preloadQuizzes]);

  const answerQuiz = (answer: string) => {
    if (!activeHistoryItem && !currentResult && history.length === 0) return;
    setQuizAnswer(answer);
    // DON'T check correctness or show result yet
    // Just store the user's answer so UI can show "Reveal Answer" button
  };

  const revealQuizAnswer = async () => {
    if (!quizAnswer) return;
    const correct = quizAnswer.toLowerCase().trim() === (quizCorrectAnswer || '').toLowerCase();
    setQuizRevealed(true);
    setQuizScore({ score: correct ? 1 : 0, total: 1 });
    setShowQuizResult(true);

    if (correct) {
      // Unlock achievement, save score (same as current logic)
      if (user?.id !== 'guest') {
        try { await fetch('/api/achievements', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'quiz_perfect', title: 'Perfect Score!', emoji: '💯' }) }); } catch {}
        try { await fetch('/api/quiz', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ score: 1, total: 1 }) }); } catch {}
      } else {
        unlockGuestAchievement('quiz_perfect');
      }
      // DON'T change activeHistoryItem here - wait until next quiz starts
      // The "Next Question" button will handle it
    }
    // On wrong: do nothing special, user stays on same question
    // They can click "Try Another Question" to skip
  };;

  // ==================== LISTEN (Browser TTS) ====================
  const speakBrowserTTS = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      alert('Your browser does not support speech playback. Try Chrome or Edge!');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'id' ? 'id-ID' : language === 'zh' ? 'zh-CN' : 'en-US';
    utterance.rate = 0.85;
    utterance.pitch = 1.1;
    window.speechSynthesis.speak(utterance);
  }, [language]);

  const startListen = useCallback(() => {
    if (history.length === 0) return;
    const correctItem = history[Math.floor(Math.random() * history.length)];
    const distrators = history.filter(h => h.name !== getNameInLang(correctItem, language)).sort(() => Math.random() - 0.5).slice(0, 3);
    const options = [correctItem, ...distrators].sort(() => Math.random() - 0.5);
    setListenWord(getNameInLang(correctItem, language));
    setListenOptions(options);
    setListenAnswer(null);
    setListenResult(null);
    speakBrowserTTS(getNameInLang(correctItem, language));
  }, [history, speakBrowserTTS]);

  const answerListen = (itemName: string) => {
    if (!listenWord) return;
    setListenAnswer(itemName);
    const correct = itemName === listenWord;
    setListenResult(correct ? 'correct' : 'wrong');
    setListenScore(prev => ({ score: prev.score + (correct ? 1 : 0), total: prev.total + 1 }));
    if (correct) {
      speakBrowserTTS(t('ttsListenCorrect', { word: listenWord }));
      if (user?.id !== 'guest') {
        fetch('/api/achievements', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'listen_master', title: 'Good Listener', emoji: '👂' }) }).catch(() => {});
      } else {
        unlockGuestAchievement('listen_master');
      }
    } else {
      speakBrowserTTS(t('ttsListenWrong', { word: listenWord }));
    }
  };

  // Auto-start listening when switching to Learn tab
  useEffect(() => {
    if (activeTab === 'learn' && !listenWord && history.length > 0) {
      startListen();
    }
  }, [activeTab, history.length]);

  // ==================== PUZZLE ====================
  const startPuzzle = useCallback(async () => {
    const image = puzzleHistoryItem?.imageData || activeHistoryItem?.imageData || capturedImage || (history.length > 0 ? history[0].imageData : null);
    if (!image) return;
    const img = new Image();
    img.onload = () => {
      const size = 2;
      // Crop to dimensions evenly divisible by size to avoid partial pieces
      const cw = Math.floor(img.width / size) * size;
      const ch = Math.floor(img.height / size) * size;
      const cropCvs = document.createElement('canvas');
      cropCvs.width = cw; cropCvs.height = ch;
      cropCvs.getContext('2d')!.drawImage(img, 0, 0, cw, ch, 0, 0, cw, ch);
      const croppedImg = new Image();
      croppedImg.onload = () => {
        const pw = cw / size, ph = ch / size;
        const pieces: string[] = [];
        for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) {
          const cv = document.createElement('canvas');
          cv.width = pw; cv.height = ph;
          cv.getContext('2d')!.drawImage(croppedImg, c * pw, r * ph, pw, ph, 0, 0, pw, ph);
          pieces.push(cv.toDataURL('image/jpeg', 0.8));
        }
        const shuffled = [...pieces].sort(() => Math.random() - 0.5);
        setPuzzleOriginalPieces([...pieces]); setPuzzlePieces(shuffled); setPuzzleSlots(new Array(4).fill(null)); setSelectedPiece(null); setPuzzleResult(null);
        setPuzzleImageWidth(cw); setPuzzleImageHeight(ch);
        setPuzzlePieceWidth(pw); setPuzzlePieceHeight(ph);
        setPuzzleActive(true);
      };
      croppedImg.src = cropCvs.toDataURL('image/jpeg', 0.9);
    };
    img.src = image;
  }, [puzzleHistoryItem, activeHistoryItem, capturedImage, history]);

  const placePiece = (idx: number) => {
    if (selectedPiece === null) return;
    const newSlots = [...puzzleSlots];
    const newPuzzlePieces = [...puzzlePieces];
    let movedPiece = newPuzzlePieces[selectedPiece];
    newPuzzlePieces.splice(selectedPiece, 1);
    newPuzzlePieces.push(movedPiece);
    const oldIdx = newSlots.indexOf(movedPiece);
    if (oldIdx >= 0) newSlots[oldIdx] = null;
    newSlots[idx] = movedPiece;
    setPuzzleSlots(newSlots); setSelectedPiece(null);
    setPuzzlePieces(newPuzzlePieces);
    if (newSlots.every(s => s !== null)) {
      const correct = newSlots.every((s, i) => s === puzzleOriginalPieces[i]);
      setPuzzleResult(correct ? 'correct' : 'incorrect');
      if (correct) {
        if (user?.id !== 'guest') {
          fetch('/api/achievements', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'puzzle_complete', title: 'Puzzle Master', emoji: '🧩' }) }).catch(() => {});
        } else {
          unlockGuestAchievement('puzzle_complete');
        }
        speakBrowserTTS(t('ttsPuzzleComplete'));
      } else {
        speakBrowserTTS(t('ttsPuzzleAlmost'));
      }
    }
  };

  // ==================== CHAT ====================
  const sendChat = async () => {
    if (!chatInput.trim()) return;
    const msg = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', content: msg }]);
    setChatInput(''); setChatLoading(true);
    if (chatMessages.length === 0) {
      if (user?.id !== 'guest') {
        fetch('/api/achievements', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'chat_first', title: 'Chatty Kid', emoji: '💬' }) }).catch(() => {});
      } else {
        unlockGuestAchievement('chat_first');
      }
    }
    try {
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: msg, history: chatMessages.slice(-6), language }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Chat failed');
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (e) { setChatMessages(prev => [...prev, { role: 'assistant', content: t('chatError') }]); setError(e instanceof Error ? e.message : 'Chat failed. Please try again!'); }
    setChatLoading(false);
  };

  // ==================== FEEDBACK ====================
  const sendFeedback = async () => {
    if (feedbackRating === 0) return;
    if (user?.id !== 'guest') {
      try {
        const res = await fetch('/api/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rating: feedbackRating, comment: feedbackComment }) });
        if (res.ok) {
          setFeedbackSent(true);
        } else {
          setError('Failed to send feedback. Please try again!');
        }
      } catch { setError('Failed to send feedback. Please try again!'); }
    } else {
      setFeedbackSent(true);
    }
  };

  // ==================== LOAD DATA ====================
  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/history');
      if (res.ok) {
        const data = await res.json();
        const items = Array.isArray(data) ? data : (Array.isArray(data.history) ? data.history : []);
        setHistory(items.map((h: any) => ({ ...h, timestamp: h.createdAt ? new Date(h.createdAt) : new Date(), imageData: h.imageData || '' })));
      }
    } catch {}
  };

  const fetchAchievements = async () => {
    try {
      const res = await fetch('/api/achievements');
      if (res.ok) { const data = await res.json(); setAchievements(Array.isArray(data) ? data : (Array.isArray(data.achievements) ? data.achievements : [])); }
    } catch {}
  };

  const unlockGuestAchievement = (type: string) => {
    if (!guestAchievements.includes(type)) {
      const newAchievements = [...guestAchievements, type];
      setGuestAchievements(newAchievements);
      localStorage.setItem('guestAchievements', JSON.stringify(newAchievements));
      setAchievements(prev => [...prev, { id: type, type, title: ACHIEVEMENT_DEFS.find(d => d.type === type)?.title || type, emoji: ACHIEVEMENT_DEFS.find(d => d.type === type)?.emoji || '🏆', unlockedAt: new Date().toISOString() }]);
    }
  };

  useEffect(() => { if (user && user.id !== 'guest') { fetchHistory(); fetchAchievements(); } }, [user]);
  useEffect(() => { if (activeTab === 'profile' && user && user.id !== 'guest') fetchAchievements(); }, [activeTab, user]);

  // Preload quizzes when history changes
  useEffect(() => {
    if (history.length > 0 && quizCache.length < 3) {
      preloadQuizzes();
    }
  }, [history, quizCache.length]);

  // ==================== UPDATE PROFILE ====================
  const updateProfile = async (updates: { language?: string; theme?: string }) => {
    try {
      const res = await fetch('/api/auth/update', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) });
      if (res.ok) {
        const data = await res.json();
        // API returns user object directly after fix
        const updatedUser = data.user || data;
        if (updatedUser.id) setUser(updatedUser);
      }
    } catch {}
  };

  // ==================== UPGRADE TO PRO ====================
  const [upgrading, setUpgrading] = useState(false);
  const upgradeToPro = async () => {
    setUpgrading(true);
    try {
      const res = await fetch('/api/auth/upgrade', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        const updatedUser = data.user || data;
        if (updatedUser.id) setUser(updatedUser);
        fetchAchievements();
      }
    } catch {}
    setUpgrading(false);
  };

  // ==================== AUTH SCREEN ====================
  if (!user) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center bg-gradient-to-br ${currentTheme.bg} p-4`}>
        <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-7xl mb-4">🔍</motion.div>
        <h1 className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-orange-500 to-green-500 bg-clip-text text-transparent">{t('appTitle')}</h1>
        <p className="text-gray-500 mb-8">{t('appSubtitle')}</p>
        <AnimatePresence mode="wait">
          {showAuth ? (
            <motion.div key={showAuth} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-3xl shadow-xl p-6 w-full max-w-sm">
              <h2 className="text-2xl font-bold mb-4 text-center">{showAuth === 'login' ? t('welcomeBack') : t('joinTheFun')}</h2>
              {authError && <div className="bg-red-50 text-red-600 px-3 py-2 rounded-xl text-sm mb-4 text-center">{authError}</div>}
              {showAuth === 'register' && (
                <div className="mb-3"><label className="text-sm font-medium text-gray-600 mb-1 block">{t('username')}</label>
                  <Input placeholder="CoolKid123" value={authForm.username} onChange={e => setAuthForm(p => ({ ...p, username: e.target.value }))} className="rounded-xl" /></div>
              )}
              <div className="mb-3"><label className="text-sm font-medium text-gray-600 mb-1 block">{t('email')}</label>
                <Input type="email" placeholder="kid@example.com" value={authForm.email} onChange={e => setAuthForm(p => ({ ...p, email: e.target.value }))} className="rounded-xl" /></div>
              <div className="mb-4"><label className="text-sm font-medium text-gray-600 mb-1 block">{t('password')}</label>
                <Input type="password" placeholder="••••••" value={authForm.password} onChange={e => setAuthForm(p => ({ ...p, password: e.target.value }))} className="rounded-xl" /></div>
              <Button onClick={() => handleAuth(showAuth)} className="w-full bg-gradient-to-r from-orange-400 to-green-400 text-white font-bold rounded-xl py-5 text-lg">
                {showAuth === 'login' ? t('login') : t('createAccount')}
              </Button>
              <p className="text-center text-sm text-gray-500 mt-3">
                {showAuth === 'login' ? t('dontHaveAccount') : t('alreadyHaveAccount')}
                <button onClick={() => setShowAuth(showAuth === 'login' ? 'register' : 'login')} className="text-purple-600 font-semibold">{showAuth === 'login' ? t('register') : t('login')}</button>
              </p>
              <button onClick={() => setShowAuth(null)} className="w-full text-center text-sm text-gray-400 mt-2">{t('cancel')}</button>
            </motion.div>
          ) : (
            <motion.div key="buttons" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-3 w-full max-w-sm">
              <Button onClick={() => setShowAuth('register')} size="lg" className="bg-gradient-to-r from-orange-400 via-yellow-400 to-green-400 text-white font-bold text-lg rounded-2xl py-6 shadow-xl">
                🎉 {t('createAccount')}
              </Button>
              <Button onClick={() => setShowAuth('login')} size="lg" variant="outline" className="font-bold text-lg rounded-2xl py-6">
                🔑 {t('login')}
              </Button>
              <Button onClick={() => { setUser({ id: 'guest', username: 'guest', email: '', displayName: 'Guest', avatar: null, isPro: false, theme: 'default', language: 'en' }); }} variant="ghost" className="text-gray-500">
                {t('continueAsGuest')}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ==================== MAIN APP LAYOUT ====================
  const showCameraFeed = cameraActive && !capturedImage;
  const showCaptured = !!capturedImage;
  const showPlaceholder = !cameraActive && !capturedImage;

  return (
    <div className={`min-h-screen flex flex-col md:flex-row bg-gradient-to-br ${currentTheme.bg}`}>
      {/* Animated background decorations */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -20 - Math.random() * 30, 0],
              x: [0, (Math.random() - 0.5) * 40, 0],
              rotate: [0, (Math.random() - 0.5) * 40, 0],
            }}
            transition={{
              duration: 6 + Math.random() * 6,
              repeat: Infinity,
              delay: i * 0.8,
              ease: "easeInOut",
            }}
            className="absolute text-2xl opacity-20"
            style={{
              top: `${10 + Math.random() * 80}%`,
              left: `${5 + Math.random() * 90}%`,
            }}
          >
            {currentTheme.emoji}
          </motion.div>
        ))}
      </div>

      {/* Sidebar - desktop only */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} themeData={currentTheme} user={user} />

      {/* Main area (Header + Content + Footer) */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className={`relative overflow-hidden bg-gradient-to-r ${currentTheme.header} py-3 px-4 shadow-lg`}>
          <div className="relative max-w-2xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }} className="text-2xl sm:text-3xl">🔍</motion.div>
              <div>
                <h1 className="text-lg sm:text-2xl font-extrabold text-white drop-shadow-md">{t('appTitle')}</h1>
                <p className="text-[10px] sm:text-xs text-white/80">{t('hiUser', { name: user.displayName || user.username })}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {user.isPro && <Badge className="bg-yellow-400 text-yellow-900 text-[10px]"><Crown className="h-3 w-3 mr-0.5" />PRO</Badge>}
              <Button variant="ghost" size="icon" onClick={() => setShowSettings(!showSettings)} className="bg-white/20 hover:bg-white/30 text-white rounded-full h-8 w-8">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout} className="bg-white/20 hover:bg-white/30 text-white rounded-full h-8 w-8">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Settings Dialog */}
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>⚙️ {t('settings')}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              {user?.isPro && (
                <div>
                  <label className="text-sm font-semibold mb-2 block">🎨 {t('theme')}</label>
                  <div className="grid grid-cols-3 gap-2">
                    {THEMES.map(tm => (
                      <button key={tm.id} onClick={() => { setTheme(tm.id); user?.id !== 'guest' ? updateProfile({ theme: tm.id }) : localStorage.setItem('theme', tm.id); }}
                        className={`p-2 rounded-xl text-xs font-medium transition-all ${theme === tm.id ? 'ring-2 ring-purple-400 bg-purple-50' : 'bg-gray-50 hover:bg-gray-100'}`}>
                        {tm.emoji} {t('theme' + tm.id.charAt(0).toUpperCase() + tm.id.slice(1))}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label className="text-sm font-semibold mb-2 block">🌐 {t('languageLabel')}</label>
                <div className="flex gap-2">
                  {LANGUAGES.map(l => (
                    <button key={l.id} onClick={() => { setLanguage(l.id); user?.id !== 'guest' ? updateProfile({ language: l.id }) : localStorage.setItem('language', l.id); }}
                      className={`flex-1 p-2 rounded-xl text-xs font-medium transition-all ${language === l.id ? 'ring-2 ring-purple-400 bg-purple-50' : 'bg-gray-50 hover:bg-gray-100'}`}>
                      {l.emoji} {l.name}
                    </button>
                  ))}
                </div>
              </div>
              {!user.isPro && (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-3 text-center">
                  <Crown className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
                  <p className="text-xs font-semibold text-yellow-700">{t('upgradeToPro')}</p>
                  <p className="text-[10px] text-yellow-600">{t('unlockFeatures')}</p>
                  <Button size="sm" onClick={upgradeToPro} disabled={upgrading} className="mt-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs">{upgrading ? t('upgrading') : t('getPro')}</Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Main Content - responsive width */}
        <main className="flex-1 w-full max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 flex flex-col gap-4 overflow-hidden relative z-10">
          {/* Home Tab */}
          {activeTab === 'home' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col gap-4 overflow-y-auto pb-2"
            >
              {/* Camera View */}
              <div className="relative rounded-2xl overflow-hidden shadow-xl bg-black aspect-[4/3] max-h-[45vh]">
                <video ref={videoRef} playsInline muted autoPlay
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity ${showCameraFeed ? 'opacity-100 z-10' : 'opacity-0 z-0'}`} />
                <AnimatePresence>
                  {showCaptured && (
                    <motion.img key="captured" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      src={capturedImage!} alt="Captured" className="absolute inset-0 w-full h-full object-contain z-20 bg-black"
                      style={{ transform: `rotate(${imageRotation}deg)` }} />
                  )}
                </AnimatePresence>
                {showPlaceholder && (
                  <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 text-white gap-3 z-30">
                    <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-5xl">📸</motion.div>
                    <p className="text-sm font-bold text-center">{t('readyToExplore')}</p>
                    <p className="text-xs text-gray-400 text-center">{cameraSupported ? t('useCameraOrUpload') : t('uploadAnImage')}</p>
                  </div>
                )}
                {cameraLoading && <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-40"><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><Camera className="h-10 w-10 text-yellow-400" /></motion.div></div>}
                {isIdentifying && <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2 z-40"><motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}><Sparkles className="h-10 w-10 text-yellow-400" /></motion.div><p className="text-white font-bold text-sm">{t('identifying')}</p></div>}
                {error && <div className="absolute bottom-3 left-3 right-3 z-40"><div className="bg-red-500/90 text-white px-3 py-2 rounded-xl text-xs font-medium text-center">{error}</div></div>}
                <canvas ref={canvasRef} className="hidden" />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-3">
                {capturedImage && currentResult ? (
                  <>
                    <Btn icon={<RotateCcw className="h-5 w-5" />} onClick={resetView} color="orange" />
                    <Btn icon={<RotateCw className="h-5 w-5" />} onClick={rotateImage} color="teal" />
                    <Btn icon={<Volume2 className="h-5 w-5" />} onClick={() => speakBrowserTTS(getNameInLang(currentResult!, language) + '. ' + getDescInLang(currentResult!, language) + '. ' + t('ttsFunFact', { fact: getFactInLang(currentResult!, language) }))} color="purple" />
                  </>
                ) : cameraActive ? (
                  <>
                    <Btn icon={<SwitchCamera className="h-5 w-5" />} onClick={switchCamera} color="white" />
                    <BigBtn onClick={captureAndIdentify} disabled={isIdentifying}>📷</BigBtn>
                    <Btn icon={<ImagePlus className="h-5 w-5" />} onClick={() => fileInputRef.current?.click()} color="white" />
                  </>
                ) : (
                  <div className="flex items-center gap-3">
                    {cameraSupported && <Button onClick={() => startCamera()} className="bg-gradient-to-r from-orange-400 to-green-400 text-white font-bold rounded-full px-6 py-5"><Camera className="h-5 w-5 mr-2" />{t('camera')}</Button>}
                    <Button onClick={() => fileInputRef.current?.click()} className="bg-gradient-to-r from-purple-400 to-pink-400 text-white font-bold rounded-full px-6 py-5"><Upload className="h-5 w-5 mr-2" />{t('upload')}</Button>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = () => {
                  stopCamera(); setCameraActive(false); setImageRotation(0);
                  const img = new Image();
                  img.onload = () => {
                    const aspect = 4/3;
                    const imgAspect = img.width / img.height;
                    let sx = 0, sy = 0, sw = img.width, sh = img.height;
                    if (imgAspect > aspect) { sw = sh * aspect; sx = (img.width - sw) / 2; }
                    else { sh = sw / aspect; sy = (img.height - sh) / 2; }
                    const c = document.createElement('canvas');
                    c.width = sw; c.height = sh;
                    c.getContext('2d')!.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
                    identifyImage(c.toDataURL('image/jpeg', 0.8));
                  };
                  img.src = r.result as string;
                }; r.readAsDataURL(f); e.target.value = ''; }} className="hidden" />
              </div>

              {/* Result Card */}
              <AnimatePresence>
                {currentResult && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} key="result">
                    <Card className={`card-style-${currentTheme.cardStyle} overflow-hidden`}>
                      <div className="h-1.5 bg-gradient-to-r from-orange-400 via-yellow-400 to-green-400" />
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="text-4xl sm:text-5xl">{currentResult.emoji}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h2 className="text-lg sm:text-xl font-extrabold text-gray-800">{getNameInLang(currentResult, language)}</h2>
                              <Badge variant="secondary" className="bg-green-100 text-green-700 text-[10px]">{currentResult.category}</Badge>
                              {currentResult.warning && <Badge className="bg-red-100 text-red-700 text-[10px]">⚠️ {currentResult.warning}</Badge>}
                            </div>
                            <p className="text-sm text-gray-600">{getDescInLang(currentResult, language)}</p>
                            <div className="mt-2 p-2 bg-yellow-50 rounded-xl border border-yellow-100">
                              <div className="flex items-center gap-1 mb-0.5"><Star className="h-3 w-3 text-yellow-500 fill-yellow-500" /><span className="text-[10px] font-bold text-yellow-700">{t('funFact')}</span></div>
                              <p className="text-xs text-yellow-800">{getFactInLang(currentResult, language)}</p>
                            </div>
                            <div className="flex gap-2 mt-3">
                              <button onClick={() => { setActiveTab('learn'); startListen(); }} className="text-xs bg-green-50 text-green-600 px-3 py-1.5 rounded-lg font-medium hover:bg-green-100">👂 {t('listenBtn')}</button>
                              <button onClick={() => { setActiveTab('games'); startQuiz(); }} className="text-xs bg-green-50 text-green-600 px-3 py-1.5 rounded-lg font-medium hover:bg-green-100">🧠 {t('quizBtn')}</button>
                              <button onClick={() => { setPuzzleHistoryItem(activeHistoryItem || currentResult); setActiveTab('games'); startPuzzle(); }} className="text-xs bg-purple-50 text-purple-600 px-3 py-1.5 rounded-lg font-medium hover:bg-purple-100">🧩 {t('puzzleBtn')}</button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Learn Tab */}
          {activeTab === 'learn' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col gap-4 overflow-y-auto pb-2"
            >
              <div className="space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2"><BookOpen className="h-5 w-5 text-green-500" /> {t('learnPractice')}</h3>

                {/* Listen and Pick */}
                {listenWord && listenOptions.length > 0 ? (
                  <Card className={`card-style-${currentTheme.cardStyle}`}>
                    <CardContent className="p-4">
                      <h4 className="font-bold text-gray-800 mb-1 flex items-center gap-2">👂 {t('listenChallengeTitle')}</h4>
                      <p className="text-xs text-gray-500 mb-3">{t('listenInstruction')}</p>
                      <button onClick={() => speakBrowserTTS(listenWord)} className="mb-3 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-100">🔊 {t('playSound')}</button>
                      {listenResult === 'correct' && <div className="bg-green-50 text-green-700 px-3 py-2 rounded-xl text-sm font-medium mb-2">{t('listenCorrect')}</div>}
                      {listenResult === 'wrong' && <div className="bg-red-50 text-red-700 px-3 py-2 rounded-xl text-sm font-medium mb-2">{t('listenWrong')}</div>}
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {listenOptions.map((opt, i) => (
                          <button key={i} onClick={() => answerListen(getNameInLang(opt, language))} disabled={listenAnswer !== null}
                            className={`rounded-xl border-2 overflow-hidden transition-all ${listenAnswer ? (getNameInLang(opt, language) === listenWord ? 'border-green-400 bg-green-50' : getNameInLang(opt, language) === listenAnswer ? 'border-red-400 bg-red-50' : 'border-gray-200 opacity-50') : 'border-gray-200 hover:border-blue-300 hover:shadow-md'}`}>
                            <img src={opt.imageData} alt={getNameInLang(opt, language)} className="w-full aspect-square object-cover" />
                            <div className="p-1 text-xs font-medium text-gray-700 truncate">{opt.emoji} {getNameInLang(opt, language)}</div>
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{t('nextWord')}: {listenScore.score}/{listenScore.total}</span>
                        <Button onClick={startListen} size="sm" className="bg-green-500 text-white rounded-xl text-xs">{t('nextWord')}</Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className={`card-style-${currentTheme.cardStyle} opacity-60`}><CardContent className="p-4 text-center text-gray-400 text-sm">
                    {t('identifyFirstListen')}
                  </CardContent></Card>
                )}
              </div>
            </motion.div>
          )}

          {/* Games Tab */}
          {activeTab === 'games' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col gap-4 overflow-y-auto pb-2"
            >
              <div className="space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2"><Gamepad2 className="h-5 w-5 text-purple-500" /> {t('miniGames')}</h3>

                {/* Quiz */}
                {quizActive ? (
                  <Card className={`card-style-${currentTheme.cardStyle}`}>
                    <CardContent className="p-4">
                      <h4 className="font-bold mb-3 flex items-center gap-2">{t('quizChallenge')}</h4>
                      {(activeHistoryItem?.imageData || capturedImage) && <img src={activeHistoryItem?.imageData || capturedImage} alt="Quiz image" className="w-full rounded-xl mb-3 max-h-32 object-contain bg-gray-100" />}
                      <p className="font-medium text-gray-700 mb-3">{quizQuestion}</p>
                      {quizGenerating ? (
                        <div className="flex items-center justify-center py-6">
                          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><Sparkles className="h-6 w-6 text-green-400" /></motion.div>
                          <span className="ml-2 text-sm text-gray-500">{t('generating') || 'Generating options...'}</span>
                        </div>
                      ) : quizOptions.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {quizOptions.map((opt, i) => (
                            <button key={i} onClick={() => answerQuiz(opt)}
                              className={`p-3 rounded-xl text-sm font-medium transition-all ${quizAnswer && quizRevealed ? (opt === quizCorrectAnswer ? 'bg-green-100 border-2 border-green-400 text-green-700' : opt === quizAnswer ? 'bg-red-100 border-2 border-red-400 text-red-700' : 'bg-gray-50 text-gray-400') : quizAnswer === opt ? 'bg-blue-100 border-2 border-blue-400 text-blue-700' : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200'}`}>
                              {opt}
                            </button>
                          ))}
                        </div>
                      ) : null}
                      {/* Reveal Answer button - shown after answering but before reveal */}
                      {quizAnswer && !quizRevealed && (
                        <div className="mt-3 flex gap-2 justify-center">
                          <button onClick={revealQuizAnswer} className="bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-600">
                            {t('revealAnswer') || 'Reveal Answer'}
                          </button>
                          <button onClick={startQuiz} className="text-xs text-gray-500 hover:underline">
                            {t('tryAnother') || 'Try Another Question'}
                          </button>
                        </div>
                      )}
                      {/* Result shown after revealing */}
                      {showQuizResult && quizRevealed && (
                        <div className={`mt-3 p-3 rounded-xl text-sm font-medium text-center ${quizScore.score === 1 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                          {quizScore.score === 1 ? t('correctAnswer') : t('wrongAnswer', { name: quizCorrectAnswer || '' })}
                          <div className="mt-2">
                            <button onClick={startQuiz} className="text-xs underline">
                              {quizScore.score === 1 ? (t('nextQuestion') || 'Next Question') : (t('tryAnother') || 'Try Another Question')}
                            </button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Card className={`card-style-${currentTheme.cardStyle} cursor-pointer hover:shadow-md transition-shadow`} onClick={(currentResult || history.length > 0) ? startQuiz : undefined}>
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="text-3xl">🧠</div>
                      <div className="flex-1"><h4 className="font-bold text-gray-800">{t('quizCardTitle')}</h4><p className="text-xs text-gray-500">{currentResult ? t('testKnowledge') : t('identifyFirst')}</p></div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </CardContent>
                  </Card>
                )}

                {/* Puzzle */}
                {puzzleActive ? (
                  <Card className={`card-style-${currentTheme.cardStyle}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold">{t('puzzleChallenge')}</h4>
                        <div className="flex items-center gap-2">
                          {history.length > 1 && (
                            <button onClick={() => {
                              const newItem = pickRandomHistoryItem(puzzleHistoryItem?.id || activeHistoryItem?.id);
                              if (newItem) {
                                setPuzzleHistoryItem(newItem);
                                setPuzzleActive(false);
                                setTimeout(() => startPuzzle(), 0);
                              }
                            }} className="text-xs text-purple-600 hover:underline">
                            {t('newImage') || 'New Image'}
                          </button>
                          )}
                          <button onClick={() => { setPuzzleActive(false); setPuzzleOriginalPieces([]); setPuzzleImageWidth(0); setPuzzleImageHeight(0); setPuzzlePieceWidth(0); setPuzzlePieceHeight(0); setPuzzleHistoryItem(null); }} className="text-xs text-gray-500 hover:underline">{t('close')}</button>
                        </div>
                      </div>
                      {puzzlePieceWidth > 0 && (
                      <div className="grid grid-cols-2 gap-1.5 mb-3">
                        {puzzleSlots.map((piece, i) => (
                          <div key={i} onClick={() => placePiece(i)}
                            className={`rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer transition-all ${piece ? 'border-solid border-purple-300 bg-center bg-no-repeat' : 'border-gray-300 bg-gray-50'}`}
                            style={piece ? { backgroundImage: `url(${piece})`, backgroundSize: 'cover', backgroundPosition: 'center', aspectRatio: puzzlePieceWidth / puzzlePieceHeight } : { aspectRatio: puzzlePieceWidth / puzzlePieceHeight }}>
                            {!piece && <span className="text-gray-300 text-xl">+</span>}
                          </div>
                        ))}
                      </div>
                      )}
                      {/* Puzzle result feedback */}
                      {puzzleResult && (
                        <div className={`text-center p-3 rounded-lg ${puzzleResult === 'correct' ? 'bg-green-50 border-2 border-green-300' : 'bg-red-50 border-2 border-red-300'}`}>
                          <div className="text-2xl mb-1">{puzzleResult === 'correct' ? '✅' : '❌'}</div>
                          <p className={`text-sm font-bold ${puzzleResult === 'correct' ? 'text-green-700' : 'text-red-700'}`}>
                            {puzzleResult === 'correct' ? t('puzzleCorrect') : t('puzzleIncorrect')}
                          </p>
                        </div>
                      )}
                      {!puzzleResult && <p className="text-[10px] text-gray-500 text-center">{t('puzzleInstruction')}</p>}
                      {puzzlePieceWidth > 0 && (
                      <div className="grid grid-cols-4 gap-1.5 mt-2">
                        {puzzlePieces.map((piece, i) => (
                          <div key={i} onClick={() => setSelectedPiece(i)}
                            className={`rounded-lg bg-center bg-no-repeat cursor-pointer border-2 transition-all ${selectedPiece === i ? 'border-purple-500 shadow-lg scale-105' : 'border-gray-200'}`}
                            style={{ backgroundImage: `url(${piece})`, backgroundSize: 'cover', backgroundPosition: 'center', aspectRatio: puzzlePieceWidth / puzzlePieceHeight }} />
                        ))}
                      </div>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Card className={`card-style-${currentTheme.cardStyle} cursor-pointer hover:shadow-md transition-shadow`} onClick={(capturedImage || history.length > 0) ? startPuzzle : undefined}>
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="text-3xl">🧩</div>
                      <div className="flex-1"><h4 className="font-bold text-gray-800">{t('puzzleGameTitle')}</h4><p className="text-xs text-gray-500">{capturedImage ? t('solvePuzzle') : t('identifyFirstPuzzle')}</p></div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </CardContent>
                  </Card>
                )}
              </div>
            </motion.div>
          )}

          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col gap-4 overflow-y-auto pb-2"
            >
              <div className={`flex-1 min-h-0 flex flex-col card-style-${currentTheme.cardStyle} overflow-hidden`}>
                <div className="flex items-center gap-2 p-3 border-b border-gray-100">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-white text-sm">🤖</div>
                  <div><p className="text-sm font-bold text-gray-800">{t('aiBuddy')}</p><p className="text-[10px] text-green-500">{t('online')}</p></div>
                </div>
                <ScrollArea className="flex-1 p-3" ref={chatScrollRef}>
                  <div className="space-y-2">
                    {chatMessages.length === 0 && <div className="text-center py-8 text-gray-400 text-sm"><p className="text-3xl mb-2">💬</p><p>{t('chatWelcome')}</p></div>}
                    {chatMessages.map((m, i) => (
                      <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${m.role === 'user' ? 'bg-gradient-to-r from-blue-400 to-cyan-400 text-white' : 'bg-gray-100 text-gray-800'}`}>
                          {m.content}
                        </div>
                      </div>
                    ))}
                    {chatLoading && <div className="flex justify-start"><div className="bg-gray-100 px-3 py-2 rounded-2xl text-sm text-gray-400 animate-pulse">{t('chatThinking')}</div></div>}
                  </div>
                </ScrollArea>
                <div className="flex gap-2 p-2 border-t border-gray-100">
                  <Input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()} placeholder={t('chatPlaceholder')} className="rounded-full text-sm flex-1" />
                  <Button onClick={sendChat} disabled={chatLoading || !chatInput.trim()} size="icon" className="rounded-full bg-gradient-to-r from-blue-400 to-cyan-400"><Send className="h-4 w-4" /></Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col gap-4 overflow-y-auto pb-2"
            >
              <div className="space-y-4">
                {/* User Info */}
                <Card className={`card-style-${currentTheme.cardStyle}`}><CardContent className="p-4 flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-r from-orange-400 to-green-400 rounded-full flex items-center justify-center text-2xl text-white font-bold">{(user.displayName || user.username || 'G')[0].toUpperCase()}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">{user.displayName || user.username}</h3>
                    <p className="text-xs text-gray-500">{user.isPro ? `👑 ${t('proMember')}` : t('freeMember')}</p>
                    {!user.isPro && <button onClick={upgradeToPro} disabled={upgrading} className="text-[10px] text-purple-600 font-medium mt-0.5 hover:underline">{upgrading ? t('upgrading') : `⬆️ ${t('upgradeToPro')}`}</button>}
                  </div>
                </CardContent></Card>

                {/* Achievements */}
                <Card className={`card-style-${currentTheme.cardStyle}`}><CardContent className="p-4">
                  <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><Trophy className="h-4 w-4 text-yellow-500" /> {t('achievements')} ({unlockedCount}/{ACHIEVEMENT_DEFS.length})</h4>
                  <Progress value={(unlockedCount / ACHIEVEMENT_DEFS.length) * 100} className="mb-3 h-2" />
                  <div className="grid grid-cols-3 gap-2">
                    {ACHIEVEMENT_DEFS.map(a => {
                      const unlocked = achievements.find(ach => ach.type === a.type);
                      return <div key={a.type} className={`p-2 rounded-xl text-center transition-all cursor-default ${unlocked ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50 border border-gray-100 opacity-50'}`} title={a.desc}>
                        <div className="text-2xl">{unlocked ? a.emoji : '🔒'}</div>
                        <p className="text-[10px] font-medium mt-1">{a.title}</p>
                        <p className="text-[8px] text-gray-400 mt-0.5 leading-tight">{a.desc}</p>
                      </div>;
                    })}
                  </div>
                </CardContent></Card>

                {/* History */}
                <Card className={`card-style-${currentTheme.cardStyle}`}><CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-gray-800 flex items-center gap-2"><BookOpen className="h-4 w-4 text-orange-500" /> History ({history.length})</h4>
                    {history.length > 0 && (
                      <button onClick={() => { if (confirm(t('confirmClearAll') || 'Clear all history?')) resetHistory(); }} className="text-[10px] text-red-500 hover:underline flex items-center gap-0.5">
                        <Trash2 className="h-3 w-3" /> Clear All
                      </button>
                    )}
                  </div>
                  {history.length === 0 ? <p className="text-sm text-gray-400 text-center py-4">No discoveries yet! 📸</p> : (
                    <div className="overflow-y-auto max-h-72">
                      <div className="space-y-1.5">{history.slice(0, 20).map(item => (
                        <div key={item.id} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-50 group">
                          <span className="text-xl">{item.emoji}</span>
                          <div className="flex-1 min-w-0 cursor-pointer" onClick={() => { setActiveTab('home'); setCapturedImage(item.imageData); setCurrentResult(item); }}>
                            <p className="text-sm font-medium truncate">{getNameInLang(item, language)}</p><p className="text-[10px] text-gray-400">{item.category}</p>
                          </div>
                          <Volume2 className="h-3.5 w-3.5 text-gray-400 shrink-0" onClick={e => { e.stopPropagation(); speakBrowserTTS(`${getNameInLang(item, language)}. ${getDescInLang(item, language)}`); }} />
                          <button onClick={e => { e.stopPropagation(); deleteHistoryItem(item.id); }} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-red-50 rounded">
                            <X className="h-3.5 w-3.5 text-red-400 hover:text-red-600" />
                          </button>
                        </div>
                      ))}</div>
                    </div>
                  )}
                </CardContent></Card>

                {/* Feedback */}
                <Card className={`card-style-${currentTheme.cardStyle}`}><CardContent className="p-4">
                  <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">⭐ Feedback</h4>
                  {feedbackSent ? (
                    <div className="bg-green-50 text-green-700 p-3 rounded-xl text-sm text-center">✅ Thank you for your feedback!</div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-500">How do you like this app?</p>
                      <div className="flex gap-1">{[1, 2, 3, 4, 5].map(s => (
                        <button key={s} onClick={() => setFeedbackRating(s)} className={`text-2xl transition-transform hover:scale-125 ${s <= feedbackRating ? '' : 'grayscale opacity-40'}`}>
                          {s <= feedbackRating ? '⭐' : '☆'}
                        </button>
                      ))}</div>
                      <Textarea placeholder="Tell us what you think..." value={feedbackComment} onChange={e => setFeedbackComment(e.target.value)} className="rounded-xl text-sm" rows={2} />
                      <Button onClick={sendFeedback} disabled={feedbackRating === 0} className="w-full bg-gradient-to-r from-orange-400 to-green-400 text-white rounded-xl">Send Feedback</Button>
                    </div>
                  )}
                </CardContent></Card>
              </div>
            </motion.div>
          )}
        </main>

        {/* Footer */}
        <footer className="mt-auto py-2 px-4 text-center bg-white/40 backdrop-blur-sm border-t border-gray-100">
          <p className="text-[10px] text-gray-400">🔍 What&apos;s This? — AI-Powered Object Learning for Kids</p>
        </footer>
      </div>

      {/* Mobile Tab Bar - mobile only */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        <MobileTabBar activeTab={activeTab} onTabChange={setActiveTab} themeData={currentTheme} language={language} />
      </div>
    </div>
  );
}

// ==================== HELPER COMPONENTS ====================
function Btn({ icon, onClick, color, disabled }: { icon: React.ReactNode; onClick: () => void; color: string; disabled?: boolean }) {
  const colors: Record<string, string> = {
    orange: 'bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-orange-300/50',
    purple: 'bg-gradient-to-br from-purple-400 to-purple-500 text-white shadow-purple-300/50',
    teal: 'bg-gradient-to-br from-teal-400 to-teal-500 text-white shadow-teal-300/50',
    white: 'bg-white/90 shadow-md text-gray-600 hover:text-gray-800',
  };
  return <motion.div whileTap={{ scale: 0.9 }}><Button onClick={onClick} disabled={disabled} className={`h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-lg ${colors[color]} disabled:opacity-50`}>{icon}</Button></motion.div>;
}

function BigBtn({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return <motion.div whileTap={{ scale: 0.85 }} whileHover={{ scale: 1.05 }}>
    <Button onClick={onClick} disabled={disabled} className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gradient-to-br from-red-400 via-pink-400 to-red-500 text-white shadow-xl disabled:opacity-50 relative overflow-hidden">
      <div className="absolute inset-0 rounded-full border-4 border-white/40" />
      <span className="relative z-10 text-3xl">{children}</span>
    </Button>
  </motion.div>;
}
