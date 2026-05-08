export type Lang = 'en' | 'id' | 'zh';

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  displayName: string | null;
  avatar: string | null;
  isPro: boolean;
  language: string;
}

export interface IdentifyResult {
  name: string;
  emoji: string;
  description: string;
  funFact: string;
  category: string;
  warning?: string;
  nameOptions?: { en?: string; id?: string; zh?: string };
  descriptionOptions?: { en?: string; id?: string; zh?: string };
  funFactOptions?: { en?: string; id?: string; zh?: string };
}

export interface HistoryItem extends IdentifyResult {
  id: string;
  timestamp: Date;
  imageData: string;
}

export interface Achievement {
  id: string;
  type: string;
  title: string;
  emoji: string;
  unlockedAt: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface PortalUserInfo {
  id: string;
  isPro: boolean;
  displayName?: string | null;
  username?: string;
}

export const LANGUAGES = [
  { id: 'en', name: 'English', emoji: '🇬🇧' },
  { id: 'id', name: 'Indonesia', emoji: '🇮🇩' },
  { id: 'zh', name: '中文', emoji: '🇨🇳' },
];

export const ACHIEVEMENT_DEFS = [
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

export function getNameInLang(
  item: { name: string; nameOptions?: { en?: string; id?: string; zh?: string } },
  lang: string
): string {
  const opts = item.nameOptions;
  return (opts && opts[lang as keyof typeof opts]) || item.name;
}

export function getDescInLang(
  item: { description: string; descriptionOptions?: { en?: string; id?: string; zh?: string } },
  lang: string
): string {
  const opts = item.descriptionOptions;
  return (opts && opts[lang as keyof typeof opts]) || item.description;
}

export function getFactInLang(
  item: { funFact: string; funFactOptions?: { en?: string; id?: string; zh?: string } },
  lang: string
): string {
  const opts = item.funFactOptions;
  return (opts && opts[lang as keyof typeof opts]) || item.funFact;
}
