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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useTranslation, QUIZ_WRONG_ANSWERS, type Lang } from '@/lib/i18n';

// ==================== TYPES ====================
interface UserInfo {
  id: string; username: string; email: string; displayName: string | null;
  avatar: string | null; isPro: boolean; theme: string; language: string;
}
interface IdentifyResult {
  name: string; emoji: string; description: string; funFact: string; category: string; warning?: string;
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
interface VoiceSettings {
  voice: string; speed: number;
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

const API_VOICES = [
  { id: 'chuichui', label: 'Chuichui', emoji: '🎈' },
  { id: 'tongtong', label: 'Tongtong', emoji: '🌸' },
  { id: 'jam', label: 'Jam', emoji: '🎩' },
  { id: 'kazi', label: 'Kazi', emoji: '🎤' },
  { id: 'xiaochen', label: 'Xiaochen', emoji: '🍃' },
];

const ACHIEVEMENT_DEFS = [
  { type: 'first_scan', title: 'First Discovery!', emoji: '🔍', desc: 'Identify your very first object' },
  { type: 'scan_5', title: 'Explorer', emoji: '🧭', desc: 'Identify 5 different objects' },
  { type: 'scan_10', title: 'Scientist', emoji: '🔬', desc: 'Identify 10 different objects' },
  { type: 'scan_20', title: 'Professor', emoji: '🎓', desc: 'Identify 20 different objects' },
  { type: 'quiz_perfect', title: 'Perfect Score!', emoji: '💯', desc: 'Get a perfect score on a quiz' },
  { type: 'puzzle_complete', title: 'Puzzle Master', emoji: '🧩', desc: 'Complete a puzzle correctly' },
  { type: 'spell_master', title: 'Spelling Bee', emoji: '📝', desc: 'Spell an object name correctly' },
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
  const audioRef = useRef<HTMLAudioElement | null>(null);
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

  // Voice state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({ voice: 'chuichui', speed: 0.85 });
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);

  // Learn state
  const [spellWord, setSpellWord] = useState('');
  const [spellInput, setSpellInput] = useState('');
  const [spellResult, setSpellResult] = useState<'correct' | 'wrong' | null>(null);
  const [showSpellHint, setShowSpellHint] = useState(false);

  // Quiz state
  const [quizQuestion, setQuizQuestion] = useState('');
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const [quizCorrect, setQuizCorrect] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
  const [quizActive, setQuizActive] = useState(false);
  const [quizScore, setQuizScore] = useState({ score: 0, total: 0 });
  const [showQuizResult, setShowQuizResult] = useState(false);

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

  // ---- Load user on mount ----
  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setCameraSupported(false);
    }
    fetch('/api/auth/me').then(async r => {
      if (r.status === 401) {
        const savedLang = localStorage.getItem('language');
        const savedTheme = localStorage.getItem('theme');
        const savedVoice = localStorage.getItem('voiceSettings');
        const savedGuestAchievements = localStorage.getItem('guestAchievements');
        if (savedLang) setLanguage(savedLang);
        if (savedTheme) setTheme(savedTheme);
        if (savedVoice) {
          try { setVoiceSettings(JSON.parse(savedVoice)); } catch {}
        }
        if (savedGuestAchievements) {
          try { setGuestAchievements(JSON.parse(savedGuestAchievements)); } catch {}
        }
        setAuthLoading(false);
        return;
      }
      const data = await r.json();
      if (data.id) { setUser(data); setTheme(data.theme || 'default'); setLanguage(data.language || 'en'); }
      setAuthLoading(false);
    }).catch(() => setAuthLoading(false));
  }, []);

  // ---- Cleanup camera & audio on unmount ----
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
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

  // ---- Achievement key mapping ----
  const achTitleKey: Record<string, string> = { first_scan: 'achFirstScan', scan_5: 'achExplorer', scan_10: 'achScientist', scan_20: 'achProfessor', quiz_perfect: 'achPerfectScore', puzzle_complete: 'achPuzzleMaster', spell_master: 'achSpellingBee', chat_first: 'achChattyKid', feedback_given: 'achHelper' };
  const achDescKey: Record<string, string> = { first_scan: 'achFirstScanDesc', scan_5: 'achExplorerDesc', scan_10: 'achScientistDesc', scan_20: 'achProfessorDesc', quiz_perfect: 'achPerfectScoreDesc', puzzle_complete: 'achPuzzleMasterDesc', spell_master: 'achSpellingBeeDesc', chat_first: 'achChattyKidDesc', feedback_given: 'achHelperDesc' };

  // ---- Theme ----
  const currentTheme = THEMES.find(th => th.id === theme) || THEMES[0];

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

  // ==================== TTS via API /api/speak ====================
  const doPlayVoice = useCallback(async (result?: IdentifyResult) => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    const target = result || currentResult;
    if (!target) return;
    setIsSpeaking(true);
    try {
      const text = `${target.name}. ${target.description}. ${t('ttsFunFact', { fact: target.funFact })}`;
      const res = await fetch('/api/speak', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, voice: voiceSettings.voice, speed: voiceSettings.speed }) });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url); audioRef.current = audio;
      audio.onended = () => { setIsSpeaking(false); URL.revokeObjectURL(url); };
      audio.onerror = () => { setIsSpeaking(false); URL.revokeObjectURL(url); };
      await audio.play();
    } catch { setIsSpeaking(false); }
  }, [currentResult, voiceSettings]);

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
        fetch('/api/history', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: result.name, emoji: result.emoji, description: result.description, funFact: result.funFact, category: result.category, imageData: rotated }) }).then(() => fetchHistory()).catch(() => {});
        fetch('/api/achievements', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'first_scan', title: 'First Discovery!', emoji: '🔍' }) }).catch(() => {});
      } else {
        // Guest: just save locally
        setHistory(prev => [{ ...result, id: Date.now().toString(), timestamp: new Date(), imageData: rotated }, ...prev]);
        unlockGuestAchievement('first_scan');
      }
      doPlayVoice(result);
    } catch { setError(t('couldNotIdentify')); }
    finally { setIsIdentifying(false); identifyingRef.current = false; }
  }, [imageRotation, getRotatedImage, user, doPlayVoice]);

  const captureAndIdentify = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current, c = canvasRef.current;
    c.width = v.videoWidth || 640; c.height = v.videoHeight || 480;
    c.getContext('2d')?.drawImage(v, 0, 0, c.width, c.height);
    const dataUrl = c.toDataURL('image/jpeg', 0.8);
    setImageRotation(0);
    await identifyImage(dataUrl);
  }, [identifyImage]);

  // ==================== PLAY VOICE (for replay button) ====================
  const playVoice = useCallback((result?: IdentifyResult) => { doPlayVoice(result); }, [doPlayVoice]);

  const stopSpeaking = useCallback(() => { if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; } setIsSpeaking(false); }, []);

  const speakText = useCallback(async (text: string) => {
    if (!text.trim()) return;
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setIsSpeaking(true);
    try {
      const res = await fetch('/api/speak', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, voice: voiceSettings.voice, speed: voiceSettings.speed }) });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url); audioRef.current = audio;
      audio.onended = () => { setIsSpeaking(false); URL.revokeObjectURL(url); };
      audio.onerror = () => { setIsSpeaking(false); URL.revokeObjectURL(url); };
      await audio.play();
    } catch { setIsSpeaking(false); }
  }, [voiceSettings]);

  // ==================== RESET ====================
  const resetView = useCallback(() => {
    setCapturedImage(null); setCurrentResult(null); setError(null); setImageRotation(0);
    stopSpeaking();
  }, [stopSpeaking]);

  const resetHistory = async () => {
    if (user?.id !== 'guest') await fetch('/api/history', { method: 'DELETE' });
    setHistory([]);
  };

  // ==================== QUIZ ====================
  const startQuiz = useCallback(() => {
    if (!currentResult) return;
    setQuizActive(true); setQuizAnswer(null); setShowQuizResult(false);
    const allWrongs = QUIZ_WRONG_ANSWERS[(language as Lang) || 'en'].filter(w => w !== currentResult.name);
    const shuffled = allWrongs.sort(() => Math.random() - 0.5).slice(0, 2);
    const options = [currentResult.name, ...shuffled].sort(() => Math.random() - 0.5);
    setQuizOptions(options);
    setQuizQuestion(t('quizQuestion'));
    setQuizCorrect(0); setQuizScore({ score: 0, total: 1 });
  }, [currentResult]);

  const answerQuiz = async (answer: string) => {
    if (!currentResult) return;
    const correct = answer.toLowerCase().trim() === currentResult.name.toLowerCase();
    setQuizAnswer(answer);
    setQuizScore({ score: correct ? 1 : 0, total: 1 });
    if (correct) {
      if (user?.id !== 'guest') {
        try { await fetch('/api/achievements', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'quiz_perfect', title: 'Perfect Score!', emoji: '💯' }) }); } catch {}
        try { await fetch('/api/quiz', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ score: 1, total: 1 }) }); } catch {}
      } else {
        unlockGuestAchievement('quiz_perfect');
      }
    }
    setTimeout(() => setShowQuizResult(true), 500);
  };

  // ==================== SPELL ====================
  const startSpell = useCallback(() => {
    if (!currentResult) return;
    setSpellWord(currentResult.name); setSpellInput(''); setSpellResult(null); setShowSpellHint(false);
  }, [currentResult]);

  const checkSpell = () => {
    if (!spellWord || !spellInput.trim()) return;
    if (spellInput.trim().toLowerCase() === spellWord.toLowerCase()) {
      setSpellResult('correct');
      speakText(t('ttsSpellCorrect', { word: spellWord }));
      if (user?.id !== 'guest') {
        fetch('/api/achievements', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'spell_master', title: 'Spelling Bee', emoji: '📝' }) }).catch(() => {});
      } else {
        unlockGuestAchievement('spell_master');
      }
    } else {
      setSpellResult('wrong');
      speakText(t('ttsSpellWrong', { word: spellWord }));
    }
  };

  // Auto-start spelling when switching to Learn tab
  useEffect(() => {
    if (activeTab === 'learn' && currentResult && !spellWord) {
      startSpell();
    }
  }, [activeTab, currentResult, spellWord, startSpell]);

  // ==================== PUZZLE ====================
  const startPuzzle = useCallback(async () => {
    if (!capturedImage) return;
    const img = new Image();
    img.onload = () => {
      const size = 2;
      const pieces: string[] = [];
      const pieceIndices: number[] = [];
      const pw = Math.floor(img.width / size), ph = Math.floor(img.height / size);
      for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) {
        const cv = document.createElement('canvas');
        cv.width = pw; cv.height = ph;
        cv.getContext('2d')!.drawImage(img, c * pw, r * ph, pw, ph, 0, 0, pw, ph);
        pieces.push(cv.toDataURL('image/jpeg', 0.8));
        pieceIndices.push(pieces.length - 1);
      }
      const shuffled = [...pieces].sort(() => Math.random() - 0.5);
      setPuzzleOriginalPieces([...pieces]); setPuzzlePieces(shuffled); setPuzzleSlots(new Array(4).fill(null)); setSelectedPiece(null); setPuzzleResult(null);
      setPuzzleImageWidth(img.width); setPuzzleImageHeight(img.height);
	      setPuzzlePieceWidth(pw); setPuzzlePieceHeight(ph);
	      setPuzzleActive(true);
    };
    img.src = capturedImage;
  }, [capturedImage]);

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
        speakText(t('ttsPuzzleComplete'));
      } else {
        speakText(t('ttsPuzzleAlmost'));
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
      if (!res.ok) throw new Error('Chat failed');
      const data = await res.json();
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch { setChatMessages(prev => [...prev, { role: 'assistant', content: t('chatError') }]); setError('Chat failed. Please try again!'); }
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
    <div className={`min-h-screen flex flex-col bg-gradient-to-br ${currentTheme.bg}`}>
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
            <div>
              <label className="text-sm font-semibold mb-2 block">🎙️ {t('voice')} ({voiceSettings.voice})</label>
              <div className="grid grid-cols-3 gap-1">
                {API_VOICES.map(v => (
                  <button key={v.id} onClick={() => { const newSettings = { ...voiceSettings, voice: v.id }; setVoiceSettings(newSettings); localStorage.setItem('voiceSettings', JSON.stringify(newSettings)); speakText('Hello! This is ' + v.label); }}
                    className={`p-1.5 rounded-lg text-[10px] font-medium ${voiceSettings.voice === v.id ? 'bg-purple-100 text-purple-700 ring-1 ring-purple-300' : 'bg-gray-50 text-gray-600'}`}>
                    {v.emoji} {v.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">⚡ {t('speed')}: {voiceSettings.speed.toFixed(2)}x</label>
              <input type="range" min="0.5" max="1.5" step="0.05" value={voiceSettings.speed}
                onChange={e => { const newSettings = { ...voiceSettings, speed: parseFloat(e.target.value) }; setVoiceSettings(newSettings); localStorage.setItem('voiceSettings', JSON.stringify(newSettings)); }}
                className="w-full accent-purple-500" />
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

      {/* Main Content */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-3 flex flex-col gap-3 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 min-h-0">
          <TabsList className="w-full grid grid-cols-5 h-12 rounded-2xl bg-white/80 shadow-sm p-1 mb-2">
            <TabsTrigger value="home" className="rounded-xl text-[10px] sm:text-xs gap-0.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-400 data-[state=active]:to-yellow-400 data-[state=active]:text-white"><Home className="h-3.5 w-3.5" /><span className="hidden sm:inline">{t('home')}</span></TabsTrigger>
            <TabsTrigger value="learn" className="rounded-xl text-[10px] sm:text-xs gap-0.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-400 data-[state=active]:to-emerald-400 data-[state=active]:text-white"><BookOpen className="h-3.5 w-3.5" /><span className="hidden sm:inline">{t('learn')}</span></TabsTrigger>
            <TabsTrigger value="games" className="rounded-xl text-[10px] sm:text-xs gap-0.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-400 data-[state=active]:to-pink-400 data-[state=active]:text-white"><Gamepad2 className="h-3.5 w-3.5" /><span className="hidden sm:inline">{t('games')}</span></TabsTrigger>
            <TabsTrigger value="chat" className="rounded-xl text-[10px] sm:text-xs gap-0.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-400 data-[state=active]:to-cyan-400 data-[state=active]:text-white"><MessageCircle className="h-3.5 w-3.5" /><span className="hidden sm:inline">{t('chat')}</span></TabsTrigger>
            <TabsTrigger value="profile" className="rounded-xl text-[10px] sm:text-xs gap-0.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-400 data-[state=active]:to-red-400 data-[state=active]:text-white"><User className="h-3.5 w-3.5" /><span className="hidden sm:inline">{t('me')}</span></TabsTrigger>
          </TabsList>

          {/* ============ HOME TAB ============ */}
          <TabsContent value="home" className="flex-1 min-h-0 flex flex-col gap-3 overflow-y-auto pb-2">
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
                  <Btn icon={isSpeaking ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />} onClick={isSpeaking ? stopSpeaking : () => playVoice()} color="purple" />
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
              <input ref={fileInputRef} type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = () => { stopCamera(); setCameraActive(false); setImageRotation(0); identifyImage(r.result as string); }; r.readAsDataURL(f); e.target.value = ''; }} className="hidden" />
            </div>

            {/* Result Card */}
            <AnimatePresence>
              {currentResult && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} key="result">
                  <Card className="border-2 border-yellow-200 bg-white/90 shadow-xl overflow-hidden">
                    <div className="h-1.5 bg-gradient-to-r from-orange-400 via-yellow-400 to-green-400" />
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-4xl sm:text-5xl">{currentResult.emoji}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-lg sm:text-xl font-extrabold text-gray-800">{currentResult.name}</h2>
                            <Badge variant="secondary" className="bg-green-100 text-green-700 text-[10px]">{currentResult.category}</Badge>
                            {currentResult.warning && <Badge className="bg-red-100 text-red-700 text-[10px]">⚠️ {currentResult.warning}</Badge>}
                          </div>
                          <p className="text-sm text-gray-600">{currentResult.description}</p>
                          <div className="mt-2 p-2 bg-yellow-50 rounded-xl border border-yellow-100">
                            <div className="flex items-center gap-1 mb-0.5"><Star className="h-3 w-3 text-yellow-500 fill-yellow-500" /><span className="text-[10px] font-bold text-yellow-700">{t('funFact')}</span></div>
                            <p className="text-xs text-yellow-800">{currentResult.funFact}</p>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <button onClick={() => { setActiveTab('learn'); startSpell(); }} className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-medium hover:bg-blue-100">📝 {t('spellIt')}</button>
                            <button onClick={() => { setActiveTab('games'); startQuiz(); }} className="text-xs bg-green-50 text-green-600 px-3 py-1.5 rounded-lg font-medium hover:bg-green-100">🧠 {t('quizBtn')}</button>
                            <button onClick={() => { setActiveTab('games'); startPuzzle(); }} className="text-xs bg-purple-50 text-purple-600 px-3 py-1.5 rounded-lg font-medium hover:bg-purple-100">🧩 {t('puzzleBtn')}</button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Speaking indicator */}
            <AnimatePresence>{isSpeaking && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center gap-1.5">
              {[0, 1, 2].map(i => <motion.div key={i} animate={{ scaleY: [1, 1.8, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} className="w-1 h-3 bg-purple-400 rounded-full" />)}
              <span className="text-xs text-purple-600 ml-1">{t('speaking')}</span>
            </motion.div>}</AnimatePresence>
          </TabsContent>

          {/* ============ LEARN TAB ============ */}
          <TabsContent value="learn" className="flex-1 min-h-0 overflow-y-auto pb-2">
            <div className="space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2"><BookOpen className="h-5 w-5 text-green-500" /> {t('learnPractice')}</h3>

              {/* Spell the Word */}
              {currentResult && spellWord ? (
                <Card className="border-2 border-blue-200 bg-white/90">
                  <CardContent className="p-4">
                    <h4 className="font-bold text-gray-800 mb-1 flex items-center gap-2">📝 {t('spellTheWord')} <span className="text-2xl">{currentResult.emoji}</span></h4>
                    <p className="text-xs text-gray-500 mb-3">{t('spellInstruction')}</p>
                    {spellResult === 'correct' && <div className="bg-green-50 text-green-700 px-3 py-2 rounded-xl text-sm font-medium mb-2">{t('correctAmazing')}</div>}
                    {spellResult === 'wrong' && <div className="bg-red-50 text-red-700 px-3 py-2 rounded-xl text-sm font-medium mb-2">{t('wrongNotQuite', { word: spellWord })}</div>}
                    {spellResult === 'correct' && (
                      <Button onClick={startSpell} size="sm" className="mb-2 bg-green-500 text-white rounded-xl text-xs">{t('tryAgain')}</Button>
                    )}
                    {spellResult !== 'correct' && (
                      <div className="flex gap-2 mb-2">
                        <Input placeholder={t('typeHere')} value={spellInput} onChange={e => { setSpellInput(e.target.value); setSpellResult(null); }}
                          onKeyDown={e => e.key === 'Enter' && spellInput.trim() && checkSpell()} className="rounded-xl flex-1" />
                        <Button onClick={checkSpell} disabled={!spellInput.trim()} className="bg-blue-500 text-white rounded-xl">{t('checkSpelling')}</Button>
                      </div>
                    )}
                    <div className="flex gap-2">
                      {spellResult !== 'correct' && (
                        <button onClick={() => setShowSpellHint(!showSpellHint)} className="text-xs text-blue-600 hover:underline">💡 {showSpellHint ? (spellWord.length > 0 ? `${spellWord[0]} ${'_ '.repeat(spellWord.length - 1).trim()}` : '') : t('showHint')}</button>
                      )}
                      <button onClick={() => speakText(spellWord)} className="text-xs text-purple-600 hover:underline">🔊 {t('listen')}</button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-2 border-gray-200 bg-white/60"><CardContent className="p-4 text-center text-gray-400 text-sm">
                  {t('identifyFirstSpell')}
                </CardContent></Card>
              )}
            </div>
          </TabsContent>

          {/* ============ GAMES TAB ============ */}
          <TabsContent value="games" className="flex-1 min-h-0 overflow-y-auto pb-2">
            <div className="space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2"><Gamepad2 className="h-5 w-5 text-purple-500" /> {t('miniGames')}</h3>

              {/* Quiz */}
              {quizActive ? (
                <Card className="border-2 border-green-200 bg-white/90">
                  <CardContent className="p-4">
                    <h4 className="font-bold mb-3 flex items-center gap-2">{t('quizChallenge')}</h4>
                    {capturedImage && <img src={capturedImage} alt="Quiz image" className="w-full rounded-xl mb-3 max-h-32 object-contain bg-gray-100" />}
                    <p className="font-medium text-gray-700 mb-3">{quizQuestion}</p>
                    <div className="grid grid-cols-1 gap-2">
                      {quizOptions.map((opt, i) => (
                        <button key={i} onClick={() => answerQuiz(opt)}
                          className={`p-3 rounded-xl text-sm font-medium transition-all ${quizAnswer ? (opt === currentResult?.name ? 'bg-green-100 border-2 border-green-400 text-green-700' : opt === quizAnswer ? 'bg-red-100 border-2 border-red-400 text-red-700' : 'bg-gray-50 text-gray-400') : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200'}`}>
                          {opt}
                        </button>
                      ))}
                    </div>
                    {showQuizResult && (
                      <div className={`mt-3 p-3 rounded-xl text-sm font-medium text-center ${quizScore.score === 1 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {quizScore.score === 1 ? t('correctAnswer') : t('wrongAnswer', { name: currentResult?.name })}
                        <div className="mt-2"><button onClick={startQuiz} className="text-xs underline">{t('tryAgain')}</button></div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-2 border-green-200 bg-white/90 cursor-pointer hover:shadow-md transition-shadow" onClick={currentResult ? startQuiz : undefined}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="text-3xl">🧠</div>
                    <div className="flex-1"><h4 className="font-bold text-gray-800">{t('quizCardTitle')}</h4><p className="text-xs text-gray-500">{currentResult ? t('testKnowledge') : t('identifyFirst')}</p></div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </CardContent>
                </Card>
              )}

              {/* Puzzle */}
              {puzzleActive ? (
                <Card className="border-2 border-purple-200 bg-white/90">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold">{t('puzzleChallenge')}</h4>
                      <button onClick={() => { setPuzzleActive(false); setPuzzleOriginalPieces([]); setPuzzleImageWidth(0); setPuzzleImageHeight(0); setPuzzlePieceWidth(0); setPuzzlePieceHeight(0); }} className="text-xs text-gray-500 hover:underline">{t('close')}</button>
                    </div>
                    {puzzlePieceWidth > 0 && (
                    <div className="grid grid-cols-2 gap-1.5 mb-3">
                      {puzzleSlots.map((piece, i) => (
                        <div key={i} onClick={() => placePiece(i)}
                          className={`rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer transition-all ${piece ? 'border-solid border-purple-300 bg-center bg-no-repeat' : 'border-gray-300 bg-gray-50'}`}
                          style={piece ? { backgroundImage: `url(${piece})`, backgroundSize: '100% 100%', aspectRatio: puzzlePieceWidth / puzzlePieceHeight } : { aspectRatio: puzzlePieceWidth / puzzlePieceHeight }}>
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
                          style={{ backgroundImage: `url(${piece})`, backgroundSize: '100% 100%', aspectRatio: puzzlePieceWidth / puzzlePieceHeight }} />
                      ))}
                    </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-2 border-purple-200 bg-white/90 cursor-pointer hover:shadow-md transition-shadow" onClick={capturedImage ? startPuzzle : undefined}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="text-3xl">🧩</div>
                    <div className="flex-1"><h4 className="font-bold text-gray-800">{t('puzzleGameTitle')}</h4><p className="text-xs text-gray-500">{capturedImage ? t('solvePuzzle') : t('identifyFirstPuzzle')}</p></div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* ============ CHAT TAB ============ */}
          <TabsContent value="chat" className="flex-1 min-h-0 flex flex-col pb-2">
            <div className="flex-1 min-h-0 flex flex-col bg-white/60 rounded-2xl shadow-sm overflow-hidden">
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
          </TabsContent>

          {/* ============ PROFILE TAB ============ */}
          <TabsContent value="profile" className="flex-1 min-h-0 overflow-y-auto pb-2">
            <div className="space-y-4">
              {/* User Info */}
              <Card className="bg-white/90 shadow-sm"><CardContent className="p-4 flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-r from-orange-400 to-green-400 rounded-full flex items-center justify-center text-2xl text-white font-bold">{(user.displayName || user.username || 'G')[0].toUpperCase()}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">{user.displayName || user.username}</h3>
                  <p className="text-xs text-gray-500">{user.isPro ? `👑 ${t('proMember')}` : t('freeMember')}</p>
                  {!user.isPro && <button onClick={upgradeToPro} disabled={upgrading} className="text-[10px] text-purple-600 font-medium mt-0.5 hover:underline">{upgrading ? t('upgrading') : `⬆️ ${t('upgradeToPro')}`}</button>}
                </div>
              </CardContent></Card>

              {/* Achievements */}
              <Card className="bg-white/90 shadow-sm"><CardContent className="p-4">
                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><Trophy className="h-4 w-4 text-yellow-500" /> {t('achievements')} ({achievements.length}/{ACHIEVEMENT_DEFS.length})</h4>
                <Progress value={(achievements.length / ACHIEVEMENT_DEFS.length) * 100} className="mb-3 h-2" />
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
              <Card className="bg-white/90 shadow-sm"><CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-gray-800 flex items-center gap-2"><BookOpen className="h-4 w-4 text-orange-500" /> History ({history.length})</h4>
                  {history.length > 0 && <button onClick={resetHistory} className="text-[10px] text-red-500 hover:underline flex items-center gap-0.5"><Trash2 className="h-3 w-3" /> Clear</button>}
                </div>
                {history.length === 0 ? <p className="text-sm text-gray-400 text-center py-4">No discoveries yet! 📸</p> : (
                  <ScrollArea className="max-h-48">
                    <div className="space-y-1.5">{history.slice(0, 20).map(item => (
                      <div key={item.id} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => { setActiveTab('home'); setCapturedImage(item.imageData); setCurrentResult(item); }}>
                        <span className="text-xl">{item.emoji}</span>
                        <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{item.name}</p><p className="text-[10px] text-gray-400">{item.category}</p></div>
                        <Volume2 className="h-3.5 w-3.5 text-gray-400" onClick={e => { e.stopPropagation(); speakText(`${item.name}. ${item.description}`); }} />
                      </div>
                    ))}</div>
                  </ScrollArea>
                )}
              </CardContent></Card>

              {/* Feedback */}
              <Card className="bg-white/90 shadow-sm"><CardContent className="p-4">
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
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-2 px-4 text-center bg-white/40 backdrop-blur-sm border-t border-gray-100">
        <p className="text-[10px] text-gray-400">🔍 What&apos;s This? — AI-Powered Object Learning for Kids</p>
      </footer>
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
