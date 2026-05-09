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
