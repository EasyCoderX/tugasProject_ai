'use client';

import { motion } from 'framer-motion';
import { Trophy, BookOpen, Trash2, X, Volume2 } from 'lucide-react';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/lib/i18n';
import { ACHIEVEMENT_DEFS } from '@/lib/helpers';
import type { Achievement, HistoryItem, IdentifyResult, UserInfo } from '@/lib/helpers';

interface ProfileTabProps {
  user: UserInfo | null;
  achievements: Achievement[];
  history: HistoryItem[];
  feedbackRating: number;
  feedbackComment: string;
  feedbackSent: boolean;
  onFeedbackRatingChange: (rating: number) => void;
  onFeedbackCommentChange: (comment: string) => void;
  onSendFeedback: () => void;
  onUpgrade: () => void;
  upgrading: boolean;
  onDeleteHistoryItem: (id: string) => void;
  onResetHistory: () => void;
  onSelectHistoryItem: (item: HistoryItem) => void;
  onSpeakHistoryItem: (item: HistoryItem, language: string) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  getNameInLang: (item: HistoryItem, lang: string) => string;
  getDescInLang: (item: IdentifyResult, lang: string) => string;
  language: string;
  unlockedCount: number;
}

export default function ProfileTab({
  user,
  achievements,
  history,
  feedbackRating,
  feedbackComment,
  feedbackSent,
  onFeedbackRatingChange,
  onFeedbackCommentChange,
  onSendFeedback,
  onUpgrade,
  upgrading,
  onDeleteHistoryItem,
  onResetHistory,
  onSelectHistoryItem,
  onSpeakHistoryItem,
  t,
  getNameInLang,
  language,
  unlockedCount,
}: ProfileTabProps) {
  const { t: tLocal } = useTranslation(language);

  // Get user initials for avatar
  const initials = (user?.displayName || user?.username || 'G').charAt(0).toUpperCase();

  return (
    <TabsContent value="profile" className="flex-1 min-h-0 overflow-y-auto pb-2">
      <div className="space-y-4">

        {/* User Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="card-kid">
            <CardContent className="p-5 flex items-center gap-4">
              {/* Avatar with gradient ring */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl text-white font-bold shadow-lg cursor-pointer relative"
                style={{
                  background: 'linear-gradient(135deg, var(--kid-gradient-from), var(--kid-gradient-to))',
                  boxShadow: '0 8px 30px var(--kid-shadow-color)'
                }}
              >
                {/* Gradient ring */}
                <div className="absolute inset--2 rounded-full" style={{
                  background: 'linear-gradient(135deg, var(--kid-gradient-from), var(--kid-gradient-to))',
                  zIndex: -1,
                  filter: 'blur(8px)',
                  opacity: 0.5
                }} />
                {initials}
              </motion.div>

              <div className="flex-1">
                <h3 className="font-bold text-gray-800 font-fredoka text-lg">
                  {user?.displayName || user?.username}
                </h3>
                <p className="text-xs text-gray-500">
                  {user?.isPro ? `👑 ${tLocal('proMember')}` : tLocal('freeMember')}
                </p>
                {!user?.isPro && (
                  <button
                    onClick={onUpgrade}
                    disabled={upgrading}
                    className="text-[10px] text-purple-600 font-medium mt-1 hover:underline font-fredoka"
                  >
                    {upgrading ? tLocal('upgrading') : `⬆️ ${tLocal('upgradeToPro')}`}
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="card-kid">
            <CardContent className="p-5">
              <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2 font-fredoka text-base">
                <Trophy className="h-4 w-4" style={{ color: 'var(--kid-accent-hex)' }} /> {tLocal('achievements')} ({unlockedCount}/{ACHIEVEMENT_DEFS.length})
              </h4>
              <Progress
                value={(unlockedCount / ACHIEVEMENT_DEFS.length) * 100}
                className="mb-4 h-2"
                style={{ background: 'rgb(var(--kid-accent-rgb) / 0.2)' }}
              />
              <div className="grid grid-cols-3 gap-2">
                {ACHIEVEMENT_DEFS.map((a, i) => {
                  const unlocked = achievements.find(ach => ach.type === a.type);
                  return (
                    <motion.div
                      key={a.type}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className={`p-3 rounded-2xl text-center transition-all cursor-default
                        ${unlocked ? 'bg-yellow-50 border-2 border-yellow-200' : 'bg-gray-50 border-2 border-gray-100 opacity-50'}`}
                      title={a.desc}
                    >
                      <div className="text-2xl">{unlocked ? a.emoji : '🔒'}</div>
                      <p className="text-[10px] font-medium mt-1 font-fredoka">{a.title}</p>
                      <p className="text-[8px] text-gray-400 mt-0.5 leading-tight">{a.desc}</p>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="card-kid">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-gray-800 flex items-center gap-2 font-fredoka text-base">
                  <BookOpen className="h-4 w-4" style={{ color: 'var(--kid-accent-hex)' }} /> History ({history.length})
                </h4>
                {history.length > 0 && (
                  <button
                    onClick={() => { if (confirm(tLocal('confirmClearAll') || 'Clear all history?')) onResetHistory(); }}
                    className="text-[10px] text-red-500 hover:underline flex items-center gap-0.5 font-fredoka"
                  >
                    <Trash2 className="h-3 w-3" /> Clear All
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6 font-fredoka">
                  No discoveries yet! 📸
                </p>
              ) : (
                <div className="overflow-y-auto max-h-80">
                  <div className="space-y-2">
                    {history.slice(0, 20).map((item, i) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-50 group transition-colors"
                      >
                        <span className="text-xl">{item.emoji}</span>
                        <div
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => onSelectHistoryItem(item)}
                        >
                          <p className="text-sm font-medium truncate font-fredoka">
                            {getNameInLang(item, language)}
                          </p>
                          <p className="text-[10px] text-gray-400">{item.category}</p>
                        </div>
                        <Volume2
                          className="h-3.5 w-3.5 text-gray-400 shrink-0 hover:text-blue-500 transition-colors cursor-pointer"
                          onClick={e => {
                            e.stopPropagation();
                            onSpeakHistoryItem(item, language);
                          }}
                        />
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            onDeleteHistoryItem(item.id);
                          }}
                          className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-red-50 rounded"
                        >
                          <X className="h-3.5 w-3.5 text-red-400 hover:text-red-600" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Feedback */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="card-kid">
            <CardContent className="p-5">
              <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2 font-fredoka text-base">
                ⭐ {tLocal('feedback') || 'Feedback'}
              </h4>

              {feedbackSent ? (
                <div className="bg-green-50 text-green-700 p-4 rounded-2xl text-sm text-center font-fredoka shadow-sm" style={{ border: '2px solid rgb(34, 197, 94, 0.3)' }}>
                  ✅ {tLocal('feedbackSent') || 'Thank you for your feedback!'}
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500 font-fredoka">
                    {tLocal('feedbackTitle') || 'How do you like this app?'}
                  </p>
                  <div className="flex gap-1 justify-center">
                    {[1, 2, 3, 4, 5].map(s => (
                      <motion.button
                        key={s}
                        whileHover={{ scale: 1.25 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onFeedbackRatingChange(s)}
                        className={`text-2xl transition-transform ${s <= feedbackRating ? '' : 'grayscale opacity-40'}`}
                      >
                        {s <= feedbackRating ? '⭐' : '☆'}
                      </motion.button>
                    ))}
                  </div>
                  <Textarea
                    placeholder={tLocal('feedbackPlaceholder') || 'Tell us what you think...'}
                    value={feedbackComment}
                    onChange={e => onFeedbackCommentChange(e.target.value)}
                    className="rounded-xl text-sm font-fredoka border-2 focus:border-blue-400 transition-colors"
                    style={{ borderColor: 'rgb(var(--kid-accent-rgb) / 0.3)' }}
                    rows={2}
                  />
                  <Button
                    onClick={onSendFeedback}
                    disabled={feedbackRating === 0}
                    className="w-full font-fredoka text-sm shadow-md hover:shadow-lg transition-all"
                    style={{
                      background: 'linear-gradient(135deg, var(--kid-gradient-from), var(--kid-gradient-to))',
                      color: 'white'
                    }}
                  >
                    {tLocal('submitFeedback') || 'Submit Feedback'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </TabsContent>
  );
}
