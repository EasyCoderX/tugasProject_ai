export interface ThemeConfig {
  id: string;
  name: string;
  emoji: string;
  bg: string;
  header: string;
  // Expanded properties for immersive theming
  accent: string;
  accentHex: string;
  textHex: string;
  cardStyle: 'bouncy' | 'flat' | 'raised' | 'wavy' | 'organic' | 'glow' | 'candy' | 'warm';
  buttonRadius: string;
  iconStyle: 'filled' | 'outlined' | 'cartoon';
  fontFamily: string;
  pattern: 'none' | 'waves' | 'leaves' | 'sun-rays' | 'stars' | 'dots';
  patternOpacity: string;
  shadowColor: string;
  particleEmoji: string;
  pro: boolean;
}

export const THEMES: ThemeConfig[] = [
  {
    id: 'default',
    name: 'Luminous Meadow',
    emoji: '🌈',
    bg: 'from-orange-50 via-yellow-50 to-green-50',
    header: 'from-orange-400 via-yellow-400 to-green-400',
    accent: 'orange',
    accentHex: '#fb923c',
    textHex: '#1f2937',
    cardStyle: 'bouncy',
    buttonRadius: 'rounded-2xl',
    iconStyle: 'filled',
    fontFamily: 'font-sans',
    pattern: 'none',
    patternOpacity: '0',
    shadowColor: 'orange',
    particleEmoji: '✨',
    pro: false,
  },
  {
    id: 'ocean',
    name: 'Coral Dreams',
    emoji: '🌊',
    bg: 'from-blue-50 via-cyan-50 to-teal-50',
    header: 'from-blue-500 via-cyan-500 to-teal-500',
    accent: 'blue',
    accentHex: '#3b82f6',
    textHex: '#1f2937',
    cardStyle: 'wavy',
    buttonRadius: 'rounded-2xl',
    iconStyle: 'filled',
    fontFamily: 'font-sans',
    pattern: 'waves',
    patternOpacity: '0.05',
    shadowColor: 'blue',
    particleEmoji: '🫧',
    pro: true,
  },
  {
    id: 'forest',
    name: 'Whispering Woods',
    emoji: '🌲',
    bg: 'from-green-50 via-emerald-50 to-lime-50',
    header: 'from-green-500 via-emerald-500 to-lime-500',
    accent: 'green',
    accentHex: '#22c55e',
    textHex: '#1f2937',
    cardStyle: 'organic',
    buttonRadius: 'rounded-2xl',
    iconStyle: 'outlined',
    fontFamily: 'font-sans',
    pattern: 'leaves',
    patternOpacity: '0.08',
    shadowColor: 'green',
    particleEmoji: '🍃',
    pro: true,
  },
  {
    id: 'sunset',
    name: 'Golden Hour',
    emoji: '🌅',
    bg: 'from-orange-50 via-rose-50 to-pink-50',
    header: 'from-orange-500 via-rose-500 to-pink-500',
    accent: 'rose',
    accentHex: '#f43f5e',
    textHex: '#1f2937',
    cardStyle: 'warm',
    buttonRadius: 'rounded-2xl',
    iconStyle: 'filled',
    fontFamily: 'font-sans',
    pattern: 'sun-rays',
    patternOpacity: '0.06',
    shadowColor: 'rose',
    particleEmoji: '☀️',
    pro: true,
  },
  {
    id: 'night',
    name: 'Twilight Reverie',
    emoji: '🌙',
    bg: 'from-slate-900 via-indigo-950 to-purple-950',
    header: 'from-slate-700 via-indigo-700 to-purple-700',
    accent: 'indigo',
    accentHex: '#6366f1',
    textHex: '#f8fafc',
    cardStyle: 'glow',
    buttonRadius: 'rounded-xl',
    iconStyle: 'cartoon',
    fontFamily: 'font-sans',
    pattern: 'stars',
    patternOpacity: '0.1',
    shadowColor: 'indigo',
    particleEmoji: '⭐',
    pro: true,
  },
  {
    id: 'candy',
    name: 'Sugar Paradise',
    emoji: '🍬',
    bg: 'from-pink-50 via-fuchsia-50 to-violet-50',
    header: 'from-pink-400 via-fuchsia-400 to-violet-400',
    accent: 'pink',
    accentHex: '#ec4899',
    textHex: '#1f2937',
    cardStyle: 'candy',
    buttonRadius: 'rounded-2xl',
    iconStyle: 'cartoon',
    fontFamily: 'font-sans',
    pattern: 'dots',
    patternOpacity: '0.1',
    shadowColor: 'pink',
    particleEmoji: '🍭',
    pro: true,
  },
];
