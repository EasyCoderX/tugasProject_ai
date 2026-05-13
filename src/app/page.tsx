'use client';

import { useState, useRef, useCallback, useEffect, useMemo, type React } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { THEMES, type ThemeConfig } from '@/lib/themes';
import {
  Camera, Volume2, VolumeX, RotateCcw, Sparkles, SwitchCamera, ImagePlus,
  Upload, Settings, Star, BookOpen, MessageCircle, Home, Gamepad2,
  User, Trophy, Send, RotateCw, Puzzle, HelpCircle, Crown, LogOut,
  Languages, Palette, Trash2, ChevronRight, Check, X, Mic, Eye, Award,
  Shield, Trophy as TrophyIcon, Zap, Rainbow, Smile, Laugh, Heart
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
import Confetti from '@/components/Confetti';
import CelebrationOverlay from '@/components/CelebrationOverlay';
import ResultCard from '@/components/ResultCard';
import ThemeSwatchSwitcher from '@/components/ui/ThemeSwatchSwitcher';

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

const LANGUAGES = [
  { id: 'en', name: 'English', emoji: '🇬🇧' },
  { id: 'id', name: 'Indonesia', emoji: '🇮🇩' },
  { id: 'zh', name: '中文', emoji: '🇨🇳' },
];

const ACHIEVEMENT_DEFS = [
  { type: 'first_scan', emoji: '🔍', titleKey: 'achFirstScan', descKey: 'achFirstScanDesc' },
  { type: 'scan_5', emoji: '🧭', titleKey: 'achExplorer', descKey: 'achExplorerDesc' },
  { type: 'scan_10', emoji: '🔬', titleKey: 'achScientist', descKey: 'achScientistDesc' },
  { type: 'scan_20', emoji: '🎓', titleKey: 'achProfessor', descKey: 'achProfessorDesc' },
  { type: 'quiz_perfect', emoji: '💯', titleKey: 'achPerfectScore', descKey: 'achPerfectScoreDesc' },
  { type: 'puzzle_complete', emoji: '🧩', titleKey: 'achPuzzleMaster', descKey: 'achPuzzleMasterDesc' },
  { type: 'listen_master', emoji: '👂', titleKey: 'achGoodListener', descKey: 'achGoodListenerDesc' },
  { type: 'chat_first', emoji: '💬', titleKey: 'achChattyKid', descKey: 'achChattyKidDesc' },
  { type: 'feedback_given', emoji: '⭐', titleKey: 'achHelper', descKey: 'achHelperDesc' },
];

const SECTION_COLORS: Record<string, { hex: string; rgb: string; gradient: string }> = {
  home:    { hex: '#FF6B35', rgb: '255,107,53',  gradient: 'from-orange-400 to-yellow-400' },
  learn:   { hex: '#00D4FF', rgb: '0,212,255',  gradient: 'from-cyan-400 to-blue-400' },
  games:   { hex: '#FF2D95', rgb: '255,45,149',  gradient: 'from-pink-500 to-rose-500' },
  chat:    { hex: '#7FFF00', rgb: '127,255,0',   gradient: 'from-lime-400 to-green-400' },
  profile: { hex: '#9B5DE5', rgb: '155,93,229',  gradient: 'from-violet-400 to-purple-500' },
};

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

  // Global click ripple effect
  const [clicks, setClicks] = useState<{ x: number; y: number; id: number }[]>([]);

  const handleGlobalClick = (e: React.MouseEvent) => {
    const id = Date.now();
    setClicks(prev => [...prev, { x: e.clientX, y: e.clientY, id }]);
    setTimeout(() => {
      setClicks(prev => prev.filter(c => c.id !== id));
    }, 600);
  };

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
  const [confetti, setConfetti] = useState(false);

  // Confetti trigger
  const handleCapture = () => {
    setConfetti(true);
    setTimeout(() => setConfetti(false), 900);
    captureAndIdentify();
  };

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
  const [quizError, setQuizError] = useState(false);
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
  const [guestCelebrated, setGuestCelebrated] = useState<Set<string>>(new Set());
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [themeFlash, setThemeFlash] = useState(false);

  // Set data-theme attribute and CSS custom properties for theming
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      // Resolve theme object inline (theme state is already in dependency array)
      const t = THEMES.find(th => th.id === theme) || THEMES[0];
      const isDark = t.textHex === '#f8fafc' || t.textHex === '#ffffff' || t.bg.includes('900') || t.bg.includes('950');

      // Button tokens
      document.documentElement.style.setProperty('--btn-accent', t.accentHex);
      document.documentElement.style.setProperty('--btn-accent-light', t.accentHex + 'cc');
      document.documentElement.style.setProperty('--btn-shadow', t.accentHex + '4d');
      document.documentElement.style.setProperty('--icon-btn-bg', t.accentHex + '1f');
      document.documentElement.style.setProperty('--bubble-shadow', t.accentHex + '59');

      // Card tokens
      document.documentElement.style.setProperty('--card-border', isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.06)');
      document.documentElement.style.setProperty('--card-shadow-color', isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.08)');
      document.documentElement.style.setProperty('--card-topper-start', t.accentHex);
      document.documentElement.style.setProperty('--card-topper-end', t.accentHex + '99');

      // Theme text color
      document.documentElement.style.setProperty('--theme-text', t.textHex);
    }
  }, [theme]);

  // Theme transition flash
  useEffect(() => {
    if (themeFlash) {
      const timer = setTimeout(() => setThemeFlash(false), 450);
      return () => clearTimeout(timer);
    }
  }, [themeFlash]);

  // Celebration state for achievements
  const [showConfetti, setShowConfetti] = useState(false);
  const [celebration, setCelebration] = useState<{
    isOpen: boolean;
    emoji: string;
    title: string;
  }>({ isOpen: false, emoji: '', title: '' });

  const triggerCelebration = useCallback((message: string) => {
    const parts = message.split(' ');
    const emoji = parts[0] || '🎉';
    const title = parts.length > 1 ? parts.slice(1).join(' ') : message;
    setCelebration({ isOpen: true, emoji, title });
    setShowConfetti(true);
  }, []);

  const handleCelebrationClose = useCallback(() => {
    setCelebration({ isOpen: false, emoji: '', title: '' });
    setShowConfetti(false);
  }, []);

  // ---- Theme (needed early for heroBackground) ----
  const currentTheme = THEMES.find(th => th.id === theme) || THEMES[0];

  // Sidebar/MobileTabBar use the actual selected theme color
  const themedThemeData: ThemeConfig = currentTheme;

  // Section accent still used by CameraView corner brackets and ResultCard
  const sectionAccent = SECTION_COLORS[activeTab] || SECTION_COLORS.home;

  // Memoized emoji positions to avoid hydration mismatch (Math.random() differs between SSR and client)
  const floatingEmojiPositions = useMemo(() =>
    ['📸', '🔬', '🎨', '🌟', '🧩', '📚'].map((emoji, i) => ({
      emoji,
      top: `${15 + (i * 11.1) % 70}%`,
      left: `${10 + (i * 13.7) % 80}%`,
      duration: 8 + i * 2,
      index: i,
    })), []
  );

  // Memoized background particle animations (stable across re-renders to prevent flickering)
  const backgroundParticles = useMemo(() =>
    Array.from({ length: 8 }).map((_, i) => ({
      y: [0, -20 - Math.random() * 30, 0],
      x: [0, (Math.random() - 0.5) * 40, 0],
      rotate: [0, (Math.random() - 0.5) * 40, 0],
      duration: 6 + Math.random() * 6,
      delay: i * 0.8,
      top: `${10 + Math.random() * 80}%`,
      left: `${5 + Math.random() * 90}%`,
    })),
    [] // empty deps = runs once on mount
  );

  // Animated gradient background style
  const heroBackground = useMemo(() => ({
    backgroundImage: `linear-gradient(135deg, ${currentTheme.accentHex}22 0%, ${currentTheme.accentHex}11 30%, transparent 60%), radial-gradient(circle at 80% 20%, ${currentTheme.accentHex}15 0%, transparent 50%), radial-gradient(circle at 20% 80%, ${currentTheme.accentHex}10 0%, transparent 50%)`,
  }), [currentTheme.accentHex]);

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

  // Handle theme portal event from Sidebar
  useEffect(() => {
    const handler = () => setShowSettings(true);
    window.addEventListener('open-theme-portal', handler);
    return () => window.removeEventListener('open-theme-portal', handler);
  }, []);

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
        // Always try to unlock — server is idempotent. Only celebrate if this call actually created the achievement.
        // Check if achievement already exists in local state before requesting
        if (!achievements.some(ach => ach.type === 'first_scan')) {
          fetch('/api/achievements', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'first_scan', title: 'First Discovery!', emoji: '🔍' }) }).then(r => r.json()).then(data => {
            // Server returns 201 for NEW achievements, 200 for already-existing (idempotent)
            if (r.status === 201) {
              setAchievements(prev => prev.some(a => a.type === 'first_scan') ? prev : [...prev, data.achievement]);
              triggerCelebration(`🎉 ${t('achFirstScan')}`);
            }
          }).catch(() => {});
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
    setQuizError(false);
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
    setQuizQuestion(t('quizError') || 'Oops! The quiz could not load. Want to try again? 🔄');
    setQuizError(true);
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
        try { await fetch('/api/achievements', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'quiz_perfect', title: 'Perfect Score!', emoji: '💯' }) }).then(r => r.json()).then(data => {
          if (r.status === 201) {
            setAchievements(prev => prev.some(a => a.type === 'quiz_perfect') ? prev : [...prev, data.achievement]);
            triggerCelebration(`🏆 ${t('achPerfectScore')}`);
          }
        }); } catch {}
        try { await fetch('/api/quiz', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ score: 1, total: 1 }) }); } catch {}
      } else {
        unlockGuestAchievement('quiz_perfect');
        triggerCelebration(`🏆 ${t('achPerfectScore')}`);
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
        fetch('/api/achievements', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'listen_master', title: 'Good Listener', emoji: '👂' }) }).then(r => r.json()).then(data => {
          if (r.status === 201) {
            setAchievements(prev => prev.some(a => a.type === 'listen_master') ? prev : [...prev, data.achievement]);
            triggerCelebration(`👂 ${t('achGoodListener')}`);
          }
        }).catch(() => {});
      } else {
        unlockGuestAchievement('listen_master');
        triggerCelebration(`👂 ${t('achGoodListener')}`);
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
          fetch('/api/achievements', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'puzzle_complete', title: 'Puzzle Master', emoji: '🧩' }) }).then(r => r.json()).then(data => {
            if (r.status === 201) {
              setAchievements(prev => prev.some(a => a.type === 'puzzle_complete') ? prev : [...prev, data.achievement]);
              triggerCelebration(`🧩 ${t('achPuzzleMaster')}`);
            }
          }).catch(() => {});
        } else {
          unlockGuestAchievement('puzzle_complete');
          triggerCelebration(`🧩 ${t('achPuzzleMaster')}`);
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
        fetch('/api/achievements', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'chat_first', title: 'Chatty Kid', emoji: '💬' }) }).then(r => r.json()).then(data => {
          if (r.status === 201) {
            setAchievements(prev => prev.some(a => a.type === 'chat_first') ? prev : [...prev, data.achievement]);
            triggerCelebration(`💬 ${t('achChattyKid')}`);
          }
        }).catch(() => {});
      } else {
        unlockGuestAchievement('chat_first');
        triggerCelebration(`💬 ${t('achChattyKid')}`);
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
          // Unlock feedback achievement
          fetch('/api/achievements', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'feedback_given', title: 'Helper', emoji: '⭐' }) }).then(r => r.json()).then(data => {
            if (r.status === 201) {
              setAchievements(prev => prev.some(a => a.type === 'feedback_given') ? prev : [...prev, data.achievement]);
              triggerCelebration(`⭐ ${t('achHelper')}`);
            }
          }).catch(() => {});
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
    if (!guestCelebrated.has(type)) {
      setGuestCelebrated(prev => new Set([...prev, type]));
      localStorage.setItem('guestCelebrated', JSON.stringify([...guestCelebrated, type]));
      const def = ACHIEVEMENT_DEFS.find(d => d.type === type);
      setAchievements(prev => [...prev, { id: type, type, title: def ? t(def.titleKey) : type, emoji: def?.emoji || '🏆', unlockedAt: new Date().toISOString() }]);
    }
  };

  // Load guest celebrated achievements from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('guestCelebrated');
      if (saved) setGuestCelebrated(new Set(JSON.parse(saved)));
    } catch {}
  }, []);

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
      <div className={`min-h-screen flex flex-col items-center justify-center ${currentTheme.bg} p-4 relative overflow-hidden`} style={heroBackground} onClick={handleGlobalClick}>
        {/* Global click ripple effect */}
        <AnimatePresence>
          {clicks.map(click => (
            <motion.span
              key={click.id}
              initial={{ scale: 0, opacity: 0.6 }}
              animate={{ scale: 3, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="fixed rounded-full pointer-events-none"
              style={{
                left: click.x,
                top: click.y,
                width: 40,
                height: 40,
                transform: 'translate(-50%, -50%)',
                background: currentTheme.accentHex + '40',
              }}
            />
          ))}
        </AnimatePresence>
        {/* Animated background blobs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ x: [0, 100, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-gradient-to-br from-orange-300/20 to-yellow-300/20 blur-3xl"
          />
          <motion.div
            animate={{ x: [0, -80, 0], y: [0, 60, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 5 }}
            className="absolute bottom-1/4 right-10 w-80 h-80 rounded-full bg-gradient-to-br from-green-300/20 to-teal-300/20 blur-3xl"
          />
          <motion.div
            animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.3, 1] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 10 }}
            className="absolute top-1/2 left-1/3 w-72 h-72 rounded-full bg-gradient-to-br from-purple-300/15 to-pink-300/15 blur-3xl"
          />
        </div>

        {/* Decorative floating emojis */}
        {floatingEmojiPositions.map(({ emoji, top, left, duration, index }) => (
          <motion.div
            key={emoji}
            animate={{
              y: [0, -30 - index * 10, 0],
              rotate: [0, (emoji.charCodeAt(0) % 40) - 20, 0],
            }}
            transition={{
              duration,
              repeat: Infinity,
              delay: index * 0.8,
              ease: "easeInOut",
            }}
            className="absolute text-3xl opacity-10 pointer-events-none"
            style={{ top, left }}
          >
            {emoji}
          </motion.div>
        ))}

        <Confetti isActive={showConfetti} />

        <CelebrationOverlay
          isOpen={celebration.isOpen}
          emoji={celebration.emoji}
          title={celebration.title}
          onClose={handleCelebrationClose}
          accentColor={currentTheme?.accent || 'orange'}
          accentHex={currentTheme?.accentHex || '#fb923c'}
          buttonRadius={currentTheme?.buttonRadius || 'rounded-2xl'}
          lang={language}
        />

        {/* Main content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-md mx-auto">
          {/* Animated hero icon */}
          <motion.div
            animate={{ y: [0, -12, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="text-8xl mb-6 drop-shadow-xl"
          >
            🔍
          </motion.div>

          {/* App title with gradient */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl sm:text-5xl font-extrabold mb-2 text-center font-fredoka leading-tight"
            style={{
              background: `linear-gradient(135deg, ${currentTheme.accentHex}, #facc15 50%, ${currentTheme.accentHex})`,
              backgroundSize: '200% 200%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'gradientShift 8s ease infinite',
            }}
          >
            {t('appTitle')}
          </motion.h1>

          {/* App subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-gray-500 mb-10 text-center text-base font-medium"
          >
            {t('appSubtitle')}
          </motion.p>

          <AnimatePresence mode="wait">
            {showAuth ? (
              <motion.div
                key={showAuth}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full border border-gray-100/50"
                style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.03)' }}
              >
                <h2 className="text-2xl font-extrabold mb-6 text-center font-fredoka" style={{ color: 'var(--kid-accent-hex)' }}>
                  {showAuth === 'login' ? '👋 ' + t('welcomeBack') : '🎉 ' + t('joinTheFun')}
                </h2>

                {authError && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm mb-5 text-center font-medium border border-red-200"
                  >
                    {authError}
                  </motion.div>
                )}

                {showAuth === 'register' && (
                  <div className="mb-4">
                    <label className="text-sm font-semibold text-gray-600 mb-1.5 block">{t('username')}</label>
                    <Input
                      placeholder="CoolKid123"
                      value={authForm.username}
                      onChange={e => setAuthForm(p => ({ ...p, username: e.target.value }))}
                      className="rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/15 transition-all font-fredoka py-4 text-base"
                    />
                  </div>
                )}

                <div className="mb-4">
                  <label className="text-sm font-semibold text-gray-600 mb-1.5 block">{t('email')}</label>
                  <Input
                    type="email"
                    placeholder="kid@example.com"
                    value={authForm.email}
                    onChange={e => setAuthForm(p => ({ ...p, email: e.target.value }))}
                    className="rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/15 transition-all font-fredoka py-4 text-base"
                  />
                </div>

                <div className="mb-6">
                  <label className="text-sm font-semibold text-gray-600 mb-1.5 block">{t('password')}</label>
                  <Input
                    type="password"
                    placeholder="••••••"
                    value={authForm.password}
                    onChange={e => setAuthForm(p => ({ ...p, password: e.target.value }))}
                    className="rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/15 transition-all font-fredoka py-4 text-base"
                  />
                </div>

                <Button onClick={() => handleAuth(showAuth)} className="w-full font-bold text-lg rounded-2xl py-5 shadow-lg hover:shadow-xl transition-all font-fredoka"
                  style={{
                    background: `linear-gradient(135deg, ${currentTheme.accentHex}, ${currentTheme.accentHex}cc)`,
                    color: 'white',
                    boxShadow: `0 8px 30px ${currentTheme.accentHex}33`,
                  }}
                >
                  {showAuth === 'login' ? t('login') : t('createAccount')}
                </Button>

                <p className="text-center text-sm text-gray-500 mt-4 font-fredoka">
                  {showAuth === 'login' ? t('dontHaveAccount') : t('alreadyHaveAccount')}
                  <button onClick={() => setShowAuth(showAuth === 'login' ? 'register' : 'login')} className="font-semibold hover:underline ml-1" style={{ color: currentTheme.accentHex }}>
                    {showAuth === 'login' ? t('register') : t('login')}
                  </button>
                </p>

                <button onClick={() => setShowAuth(null)} className="w-full text-center text-sm text-gray-400 mt-3 hover:text-gray-600 transition-colors">{t('cancel')}</button>
              </motion.div>
            ) : (
              <motion.div
                key="buttons"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.1 }}
                className="flex flex-col gap-4 w-full max-w-sm relative z-10"
              >
                <motion.div
                  whileHover={{ y: -3, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button size="lg" className="w-full font-extrabold text-lg rounded-2xl py-7 shadow-2xl font-fredoka tracking-wide"
                    style={{
                      background: `linear-gradient(135deg, ${currentTheme.accentHex}, ${currentTheme.accentHex}dd)`,
                      color: 'white',
                      boxShadow: `0 12px 40px ${currentTheme.accentHex}44`,
                      border: 'none',
                    }}
                  >
                    🎉 {t('createAccount')}
                  </Button>
                </motion.div>

                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                  <Button size="lg" variant="outline" className="w-full font-bold text-lg rounded-2xl py-7 border-2 font-fredoka"
                    style={{
                      borderColor: `${currentTheme.accentHex}55`,
                      color: currentTheme.accentHex,
                      background: `${currentTheme.accentHex}08`,
                    }}
                    onClick={() => setShowAuth('login')}
                  >
                    🔑 {t('login')}
                  </Button>
                </motion.div>

                <motion.div whileHover={{ x: 5 }}>
                  <Button variant="ghost" className="text-gray-500 hover:text-gray-700 font-fredoka w-full" onClick={() => {
                    setUser({ id: 'guest', username: 'guest', email: '', displayName: 'Guest', avatar: null, isPro: false, theme: 'default', language: 'en' });
                  }}>
                    👤 {t('continueAsGuest')}
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex items-center justify-center gap-4 mt-8 text-sm text-gray-400"
          >
            <div className="flex items-center gap-1">
              <Shield className="h-4 w-4 text-green-400" />
              <span>Safe</span>
            </div>
            <div className="flex items-center gap-1">
              <Laugh className="h-4 w-4 text-yellow-400" />
              <span>Fun</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4 text-red-400" />
              <span>Kid-Friendly</span>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ==================== MAIN APP LAYOUT ====================
  const showCameraFeed = cameraActive && !capturedImage;
  const showCaptured = !!capturedImage;
  const showPlaceholder = !cameraActive && !capturedImage;

  return (
    <div className={`min-h-screen flex flex-col md:flex-row bg-gradient-to-br ${currentTheme.bg}`} style={{ color: currentTheme.textHex }} onClick={handleGlobalClick}>
      {/* Theme transition flash */}
      {themeFlash && (
        <div
          className="theme-transition-flash"
          style={{ '--theme-flash-color': (THEMES.find(t => t.id === theme)?.accentHex || '#fb923c') + '30' } as React.CSSProperties}
        />
      )}
      {/* Global click ripple effect */}
      <AnimatePresence>
        {clicks.map(click => (
          <motion.span
            key={click.id}
            initial={{ scale: 0, opacity: 0.6 }}
            animate={{ scale: 3, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="fixed rounded-full pointer-events-none"
            style={{
              left: click.x,
              top: click.y,
              width: 40,
              height: 40,
              transform: 'translate(-50%, -50%)',
              background: currentTheme.accentHex + '40',
            }}
          />
        ))}
      </AnimatePresence>
      {/* Celebration Overlay - rendered here for main app view */}
      <CelebrationOverlay
        isOpen={celebration.isOpen}
        emoji={celebration.emoji}
        title={celebration.title}
        onClose={handleCelebrationClose}
        accentColor={currentTheme?.accent || 'orange'}
        accentHex={currentTheme?.accentHex || '#fb923c'}
        buttonRadius={currentTheme?.buttonRadius || 'rounded-2xl'}
        lang={language}
      />

      {/* Confetti */}
      <Confetti isActive={showConfetti} />

      {/* Animated background decorations */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {backgroundParticles.map((anim, i) => (
          <motion.div
            key={i}
            animate={{
              y: anim.y,
              x: anim.x,
              rotate: anim.rotate,
            }}
            transition={{
              duration: anim.duration,
              repeat: Infinity,
              delay: anim.delay,
              ease: "easeInOut",
            }}
            className="absolute text-2xl opacity-20"
            style={{
              top: anim.top,
              left: anim.left,
            }}
          >
            {currentTheme.emoji}
          </motion.div>
        ))}
      </div>

      {/* Sidebar - desktop only */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} themeData={themedThemeData} user={user} />

      {/* Main area (Header + Content + Footer) */}
      <div className="flex-1 flex flex-col min-h-screen px-4 md:px-0">
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
              <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); }} className="bg-white/20 hover:bg-white/30 text-white rounded-full h-8 w-8">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleLogout(); }} className="bg-white/20 hover:bg-white/30 text-white rounded-full h-8 w-8">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Settings Dialog */}
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogContent className="max-w-sm" style={{ background: currentTheme.textHex === '#f8fafc' ? 'rgba(30,30,50,0.95)' : 'white', borderColor: currentTheme.textHex === '#f8fafc' ? 'rgba(99,102,241,0.3)' : undefined }}>
            <DialogHeader><DialogTitle style={{ color: currentTheme.textHex === '#f8fafc' ? '#e2e8f0' : undefined }}>⚙️ {t('settings')}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              {user?.isPro && (
                <div>
                  <label className="text-sm font-bold mb-2 block" style={{ color: currentTheme.textHex === '#f8fafc' ? '#ffffff' : currentTheme.textHex, textShadow: currentTheme.textHex === '#f8fafc' ? '0 1px 2px rgba(0,0,0,0.5)' : 'none' }}>🎨 {t('theme')}</label>
                  <ThemeSwatchSwitcher
                    currentTheme={theme}
                    onThemeChange={(id) => { setTheme(id); setThemeFlash(true); user?.id !== 'guest' ? updateProfile({ theme: id }) : localStorage.setItem('theme', id); }}
                    isDarkTheme={currentTheme.textHex === '#f8fafc'}
                  />
                </div>
              )}
              <div>
                <label className="text-sm font-bold mb-2 block" style={{ color: currentTheme.textHex === '#f8fafc' ? '#ffffff' : currentTheme.textHex, textShadow: currentTheme.textHex === '#f8fafc' ? '0 1px 2px rgba(0,0,0,0.5)' : 'none' }}>🌐 {t('languageLabel')}</label>
                <div className="flex gap-2">
                  {LANGUAGES.map(l => (
                    <button key={l.id} onClick={() => { setLanguage(l.id); user?.id !== 'guest' ? updateProfile({ language: l.id }) : localStorage.setItem('language', l.id); }}
                      className="flex-1 p-2 rounded-xl text-xs font-medium transition-all font-fredoka"
                      style={{
                        color: currentTheme.textHex === '#f8fafc' ? '#ffffff' : currentTheme.textHex,
                        background: language === l.id
                          ? currentTheme.accentHex
                          : currentTheme.textHex === '#f8fafc' ? 'rgba(255,255,255,0.12)' : 'white',
                        border: `2px solid ${language === l.id ? currentTheme.accentHex : currentTheme.textHex === '#f8fafc' ? 'rgba(255,255,255,0.15)' : '#e5e7eb'}`,
                        boxShadow: language === l.id ? `0 0 16px ${currentTheme.accentHex}88` : currentTheme.textHex === '#f8fafc' ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.1)',
                      }}>
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
        <main className="flex-1 w-full max-w-2xl mx-auto px-3 sm:px-4 py-4 pb-20 md:pb-4 flex flex-col gap-4 relative z-10">
          {/* Home Tab */}
          {activeTab === 'home' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col gap-4"
            >
              {/* Camera View */}
              <div className="relative" style={{ filter: `drop-shadow(0 8px 32px ${sectionAccent.hex}30)` }}>
              <div
                className="relative rounded-3xl overflow-hidden bg-black aspect-[4/3] max-h-[45vh]"
                style={{
                  width: '100%',
                  boxShadow: cameraActive ? `0 0 8px ${sectionAccent.hex}, 0 0 24px ${sectionAccent.hex}40` : 'none',
                  animation: cameraActive ? 'camera-breathing 2s ease-in-out infinite' : 'none',
                }}
              >
                {/* Scanning line */}
                {showCameraFeed && (
                  <div
                    className="absolute left-0 right-0 h-0.5 z-20 pointer-events-none"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${sectionAccent.hex}, transparent)`,
                      animation: 'scan-sweep 2s linear infinite',
                      animationDelay: '0.5s',
                    }}
                  />
                )}

                {(cameraActive || capturedImage) && (
                  <>
                    <motion.div initial={{ scaleX: 0, scaleY: 0 }} animate={{ scaleX: 1, scaleY: 1 }} transition={{ delay: 0, type: 'spring' as const, stiffness: 260, damping: 22 }}
                      className="absolute top-3 left-3 w-6 h-6 border-t-3 border-l-3 rounded-tl-lg origin-top-left z-50 bg-transparent"
                      style={{ borderColor: sectionAccent.hex }}
                    />
                    <motion.div initial={{ scaleX: 0, scaleY: 0 }} animate={{ scaleX: 1, scaleY: 1 }} transition={{ delay: 0.12, type: 'spring' as const, stiffness: 260, damping: 22 }}
                      className="absolute top-3 right-3 w-6 h-6 border-t-3 border-r-3 rounded-tr-lg origin-top-right z-50 bg-transparent"
                      style={{ borderColor: sectionAccent.hex }}
                    />
                    <motion.div initial={{ scaleX: 0, scaleY: 0 }} animate={{ scaleX: 1, scaleY: 1 }} transition={{ delay: 0.24, type: 'spring' as const, stiffness: 260, damping: 22 }}
                      className="absolute bottom-3 left-3 w-6 h-6 border-b-3 border-l-3 rounded-bl-lg origin-bottom-left z-50 bg-transparent"
                      style={{ borderColor: sectionAccent.hex }}
                    />
                    <motion.div initial={{ scaleX: 0, scaleY: 0 }} animate={{ scaleX: 1, scaleY: 1 }} transition={{ delay: 0.36, type: 'spring' as const, stiffness: 260, damping: 22 }}
                      className="absolute bottom-3 right-3 w-6 h-6 border-b-3 border-r-3 rounded-br-lg origin-bottom-right z-50 bg-transparent"
                      style={{ borderColor: sectionAccent.hex }}
                    />
                  </>
                )}

                <video ref={videoRef} playsInline muted autoPlay
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity ${showCameraFeed ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                  style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
                />
                <AnimatePresence>
                  {showCaptured && (
                    <motion.img key="captured" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      src={capturedImage!} alt="Captured" className="absolute inset-0 w-full h-full object-contain z-20 bg-black"
                      style={{ transform: `rotate(${imageRotation}deg)` }} />
                  )}
                </AnimatePresence>
                {showPlaceholder && (
                  <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center text-white gap-3 z-30"
                    style={{ background: `linear-gradient(135deg, ${sectionAccent.hex}30 0%, ${sectionAccent.hex}10 100%)` }}>
                    <motion.div animate={{ y: [0, -6, 0], scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }} className="text-6xl">📸</motion.div>
                    <p className="text-base font-bold text-center">{t('readyToExplore')}</p>
                    <p className="text-xs text-gray-400 text-center">{cameraSupported ? t('useCameraOrUpload') : t('uploadAnImage')}</p>
                  </div>
                )}
                {cameraLoading && <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-40"><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><Camera className="h-12 w-12 text-yellow-400 drop-shadow-lg" /></motion.div></div>}
                {isIdentifying && <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-3 z-40"><motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}><Sparkles className="h-12 w-12 text-yellow-400 drop-shadow-lg" /></motion.div><p className="text-white font-bold text-sm">{t('identifying')}</p></div>}
                {error && <div className="absolute bottom-4 left-4 right-4 z-40"><motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/90 text-white px-4 py-2.5 rounded-xl text-xs font-medium text-center backdrop-blur-sm shadow-lg">{error}</motion.div></div>}
                <canvas ref={canvasRef} className="hidden" />
              </div>
              </div>

              {/* Action Buttons */}
              <div className="relative flex items-center justify-center gap-3">
                {capturedImage && currentResult ? (
                  <>
                    <Btn icon={<RotateCcw className="h-5 w-5" />} onClick={resetView} color="orange" />
                    <Btn icon={<RotateCw className="h-5 w-5" />} onClick={rotateImage} color="teal" />
                    <Btn icon={<Volume2 className="h-5 w-5" />} onClick={() => speakBrowserTTS(getNameInLang(currentResult!, language) + '. ' + getDescInLang(currentResult!, language) + '. ' + t('ttsFunFact', { fact: getFactInLang(currentResult!, language) }))} color="purple" />
                  </>
                ) : (cameraActive || cameraLoading) ? (
                  <>
                    {/* Close camera button - uses theme accent */}
                    <Button onClick={(e) => { e.stopPropagation(); stopCamera(); setCameraActive(false); }}
                      className="text-white rounded-full p-4 border border-white/20"
                      style={{ background: `${currentTheme.accentHex}`, boxShadow: `0 4px 12px ${currentTheme.accentHex}60` }}>
                      <X className="h-6 w-6" />
                    </Button>

                    {/* Switch camera button - uses theme accent */}
                    <Button onClick={(e) => { e.stopPropagation(); switchCamera(); }}
                      className="text-white rounded-full p-4 border border-white/20"
                      style={{ background: `${currentTheme.accentHex}`, boxShadow: `0 4px 12px ${currentTheme.accentHex}60` }}>
                      <SwitchCamera className="h-6 w-6" />
                    </Button>

                    {/* Capture button with confetti - uses theme accent */}
                    <div className="relative">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={(e) => { e.stopPropagation(); handleCapture(); }}
                        disabled={isIdentifying}
                        className="flex items-center gap-2 px-8 py-4 rounded-full text-white font-bold text-base font-fredoka shadow-lg transition-all hover:shadow-xl cursor-pointer"
                        style={{ background: `linear-gradient(135deg, ${currentTheme.accentHex}, ${currentTheme.accentHex}cc)`, boxShadow: `0 6px 24px ${currentTheme.accentHex}50` }}
                      >
                        <Camera className="h-6 w-6" />
                        {/* Confetti particles inside button */}
                        {confetti && (
                          <div className="absolute inset-0 pointer-events-none overflow-visible">
                            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
                              <motion.div
                                key={deg}
                                initial={{ scale: 0, opacity: 1, x: 0, y: 0 }}
                                animate={{ scale: [0, 1.2, 0], opacity: [1, 1, 0], x: Math.cos((deg * Math.PI) / 180) * 60, y: Math.sin((deg * Math.PI) / 180) * 60 }}
                                transition={{ duration: 0.5, delay: i * 0.02 }}
                                className="absolute w-2 h-2 rounded-full"
                                style={{ background: [currentTheme.accentHex, '#fbbf24', '#34d399', '#f472b6', '#60a5fa'][i % 5], left: '50%', top: '50%' }}
                              />
                            ))}
                          </div>
                        )}
                      </motion.button>
                    </div>

                    {/* Upload button - uses theme accent */}
                    <Button onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                      className="text-white font-bold rounded-full px-6 py-4"
                      style={{ background: `linear-gradient(135deg, ${currentTheme.accentHex}, ${currentTheme.accentHex}cc)`, boxShadow: `0 4px 16px ${currentTheme.accentHex}40` }}>
                      <Upload className="h-5 w-5" />
                    </Button>
                  </>
                ) : (
                  <div className="flex items-center gap-3">
                    {cameraSupported && <Button onClick={(e) => { e.stopPropagation(); startCamera(); }} className="text-white font-bold rounded-full px-6 py-5" style={{ background: `linear-gradient(135deg, ${currentTheme.accentHex}, ${currentTheme.accentHex}cc)`, boxShadow: `0 4px 16px ${currentTheme.accentHex}40` }}><Camera className="h-5 w-5 mr-2" />{t('camera')}</Button>}
                    <Button onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }} className="text-white font-bold rounded-full px-6 py-5" style={{ background: `linear-gradient(135deg, ${currentTheme.accentHex}, ${currentTheme.accentHex}cc)`, boxShadow: `0 4px 16px ${currentTheme.accentHex}40` }}><Upload className="h-5 w-5 mr-2" />{t('upload')}</Button>
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
              <ResultCard
                result={currentResult}
                language={language}
                onListen={() => { setActiveTab('learn'); startListen(); }}
                onQuiz={() => { setActiveTab('games'); startQuiz(); }}
                onPuzzle={() => { setPuzzleHistoryItem(activeHistoryItem || currentResult); setActiveTab('games'); startPuzzle(); }}
                getNameInLang={getNameInLang}
                getDescInLang={getDescInLang}
                getFactInLang={getFactInLang}
                sectionAccent={sectionAccent}
              />
            </motion.div>
          )}

          {/* Learn Tab */}
          {activeTab === 'learn' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col gap-4"
            >
              <div className="space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2"><BookOpen className="h-5 w-5 text-green-500" /> {t('learnPractice')}</h3>

                {/* Listen and Pick */}
                {listenWord && listenOptions.length > 0 ? (
                  <motion.div
                    whileHover={{ y: -3 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className={`card-style-${currentTheme.cardStyle}`}
                  >
                  <Card>
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
                  </motion.div>
                ) : (
                  <motion.div
                    whileHover={{ y: -3 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className={`card-style-${currentTheme.cardStyle} opacity-60`}
                  >
                  <Card><CardContent className="p-4 text-center text-gray-400 text-sm">
                    {t('identifyFirstListen')}
                  </CardContent></Card>
                  </motion.div>
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
              className="flex-1 flex flex-col gap-4"
            >
              <div className="space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2"><Gamepad2 className="h-5 w-5 text-purple-500" /> {t('miniGames')}</h3>

                {/* Quiz */}
                {quizActive ? (
                  <motion.div
                    whileHover={{ y: -3 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className={`card-style-${currentTheme.cardStyle}`}
                  >
                  <Card>
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
                      ) : quizError ? (
                        <div className="text-center py-4">
                          <div className="text-4xl mb-2">😅</div>
                          <p className="text-sm text-gray-600 mb-4">{quizQuestion}</p>
                          <button
                            onClick={() => { setQuizError(false); setQuizQuestion(t('quizQuestion')); startQuiz(); }}
                            className="bg-gradient-to-r from-green-400 to-blue-400 text-white px-4 py-2 rounded-xl text-sm font-bold hover:shadow-lg transition-all"
                          >
                            🔄 {t('tryAgain') || 'Try Again'}
                          </button>
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
                  </motion.div>
                ) : (
                  <motion.div
                    whileHover={{ y: -3 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className={`card-style-${currentTheme.cardStyle}`}
                  >
                  <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={(currentResult || history.length > 0) ? startQuiz : undefined}>
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="text-3xl">🧠</div>
                      <div className="flex-1"><h4 className="font-bold text-gray-800">{t('quizCardTitle')}</h4><p className="text-xs text-gray-500">{currentResult ? t('testKnowledge') : t('identifyFirst')}</p></div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </CardContent>
                  </Card>
                  </motion.div>
                )}

                {/* Puzzle */}
                {puzzleActive ? (
                  <motion.div
                    whileHover={{ y: -3 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className={`card-style-${currentTheme.cardStyle}`}
                  >
                  <Card>
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
                  </motion.div>
                ) : (
                  <motion.div
                    whileHover={{ y: -3 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className={`card-style-${currentTheme.cardStyle}`}
                  >
                  <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={(capturedImage || history.length > 0) ? startPuzzle : undefined}>
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="text-3xl">🧩</div>
                      <div className="flex-1"><h4 className="font-bold text-gray-800">{t('puzzleGameTitle')}</h4><p className="text-xs text-gray-500">{capturedImage ? t('solvePuzzle') : t('identifyFirstPuzzle')}</p></div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </CardContent>
                  </Card>
                  </motion.div>
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
              className="flex-1 flex flex-col gap-4"
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
                        <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${m.role === 'user' ? 'bg-gradient-to-r from-blue-400 to-cyan-400 text-white' : 'bg-white text-gray-900 border border-gray-300 shadow-md'}`}>
                          {m.content}
                        </div>
                      </div>
                    ))}
                    {chatLoading && <div className="flex justify-start"><div className="bg-white px-3 py-2 rounded-2xl text-sm text-gray-400 animate-pulse border border-gray-300">{t('chatThinking')}</div></div>}
                  </div>
                </ScrollArea>
                <div className="flex gap-2 p-2 border-t border-gray-100">
                  <Input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()} placeholder={t('chatPlaceholder')} className="rounded-full text-sm flex-1" />
                  <Button onClick={(e) => { e.stopPropagation(); sendChat(); }} disabled={chatLoading || !chatInput.trim()} size="icon" className="rounded-full bg-gradient-to-r from-blue-400 to-cyan-400"><Send className="h-4 w-4" /></Button>
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
              className="flex-1 flex flex-col gap-4"
            >
              <div className="space-y-4">
                {/* User Info */}
                <motion.div
                  whileHover={{ y: -3 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                <Card><CardContent className="p-4 flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-r from-orange-400 to-green-400 rounded-full flex items-center justify-center text-2xl text-white font-bold">{(user.displayName || user.username || 'G')[0].toUpperCase()}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">{user.displayName || user.username}</h3>
                    <p className="text-xs text-gray-500">{user.isPro ? `👑 ${t('proMember')}` : t('freeMember')}</p>
                    {!user.isPro && <button onClick={upgradeToPro} disabled={upgrading} className="text-[10px] text-purple-600 font-medium mt-0.5 hover:underline">{upgrading ? t('upgrading') : `⬆️ ${t('upgradeToPro')}`}</button>}
                  </div>
                </CardContent></Card>
                </motion.div>

                {/* Achievements */}
                <motion.div
                  whileHover={{ y: -3 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                <Card><CardContent className="p-4">
                  <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><Trophy className="h-4 w-4 text-yellow-500" /> {t('achievements')} ({unlockedCount}/{ACHIEVEMENT_DEFS.length})</h4>
                  <Progress value={(unlockedCount / ACHIEVEMENT_DEFS.length) * 100} className="mb-3 h-2" />
                  <div className="grid grid-cols-3 gap-2">
                    {ACHIEVEMENT_DEFS.map(a => {
                      const unlocked = achievements.find(ach => ach.type === a.type);
                      return <div key={a.type} className={`p-2 rounded-xl text-center transition-all cursor-default ${unlocked ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50 border border-gray-100 opacity-50'}`} title={t(a.descKey)}>
                        <div className="text-2xl">{unlocked ? a.emoji : '🔒'}</div>
                        <p className="text-[10px] font-medium mt-1">{t(a.titleKey)}</p>
                        <p className="text-[8px] text-gray-400 mt-0.5 leading-tight">{t(a.descKey)}</p>
                      </div>;
                    })}
                  </div>
                </CardContent></Card>
                </motion.div>

                {/* History */}
                <motion.div
                  whileHover={{ y: -3 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                <Card><CardContent className="p-4">
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
                </motion.div>

                {/* Feedback */}
                <motion.div
                  whileHover={{ y: -3 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                <Card><CardContent className="p-4">
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
                </motion.div>
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
        <MobileTabBar activeTab={activeTab} onTabChange={setActiveTab} themeData={themedThemeData} language={language} />
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
