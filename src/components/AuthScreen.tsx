'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/lib/i18n';
import type { ThemeConfig } from '@/lib/themes';

interface AuthScreenProps {
  showAuth: 'login' | 'register' | null;
  setShowAuth: (mode: 'login' | 'register' | null) => void;
  authForm: { username: string; email: string; password: string };
  setAuthForm: (form: { username: string; email: string; password: string }) => void;
  authError: string;
  onAuth: (mode: 'login' | 'register') => void;
  onGuest: () => void;
  themeData: ThemeConfig;
}

export default function AuthScreen({
  showAuth,
  setShowAuth,
  authForm,
  setAuthForm,
  authError,
  onAuth,
  onGuest,
  themeData,
}: AuthScreenProps) {
  const { t } = useTranslation('en'); // Will be updated after user logs in

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center bg-gradient-to-br ${themeData.bg} p-4 relative overflow-hidden`}>
      {/* Animated background particles */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div
          animate={{ y: [0, -30, 0], x: [0, 15, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-10 text-4xl opacity-20"
        >✨</motion.div>
        <motion.div
          animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-1/4 right-10 text-3xl opacity-20"
        >🌟</motion.div>
        <motion.div
          animate={{ y: [0, -20, 0], x: [0, 8, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-1/3 left-20 text-3xl opacity-20"
        >🎈</motion.div>
        <motion.div
          animate={{ y: [0, 15, 0], x: [0, -12, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute top-1/2 right-20 text-2xl opacity-20"
        >🌈</motion.div>
        <motion.div
          animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
          transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="absolute bottom-20 right-10 text-3xl opacity-20"
        >🎨</motion.div>
        <motion.div
          animate={{ y: [0, 25, 0], x: [0, -8, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          className="absolute bottom-1/4 left-10 text-2xl opacity-20"
        >📸</motion.div>
      </div>

      {/* Bouncing magnifying glass */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-7xl mb-6 relative z-10 drop-shadow-lg"
        style={{ filter: 'drop-shadow(0 8px 20px var(--kid-shadow-color))' }}
      >🔍</motion.div>

      {/* App title with gradient */}
      <h1
        className="text-4xl font-extrabold mb-3 text-center font-fredoka relative z-10"
        style={{
          background: `linear-gradient(135deg, var(--kid-gradient-from), var(--kid-gradient-to))`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 4px 20px var(--kid-shadow-color)'
        }}
      >
        {t('appTitle')}
      </h1>
      <p className="text-gray-500 mb-10 text-center relative z-10 font-fredoka">{t('appSubtitle')}</p>

      <AnimatePresence mode="wait">
        {showAuth ? (
          <motion.div
            key={showAuth}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white/95 rounded-3xl shadow-2xl p-8 w-full max-w-sm border-4 backdrop-blur-sm relative z-10"
            style={{
              borderColor: `rgb(var(--kid-accent-rgb) / 0.3)`,
              boxShadow: `0 20px 60px var(--kid-shadow-color)`
            }}
          >
            <h2 className="text-2xl font-bold mb-6 text-center font-fredoka" style={{ color: 'var(--kid-accent-hex)' }}>
              {showAuth === 'login' ? t('welcomeBack') : t('joinTheFun')}
            </h2>

            {authError && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm mb-4 text-center font-fredoka"
                style={{ border: '2px solid rgb(239, 68, 68, 0.3)' }}
              >
                {authError}
              </motion.div>
            )}

            {showAuth === 'register' && (
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-600 mb-1.5 block font-fredoka">{t('username')}</label>
                <Input
                  placeholder="CoolKid123"
                  value={authForm.username}
                  onChange={e => setAuthForm(p => ({ ...p, username: e.target.value }))}
                  className="rounded-xl border-2 focus:border-orange-400 transition-colors font-fredoka py-5 text-base"
                  style={{ borderColor: 'rgb(var(--kid-accent-rgb) / 0.3)' }}
                />
              </div>
            )}

            <div className="mb-4">
              <label className="text-sm font-medium text-gray-600 mb-1.5 block font-fredoka">{t('email')}</label>
              <Input
                type="email"
                placeholder="kid@example.com"
                value={authForm.email}
                onChange={e => setAuthForm(p => ({ ...p, email: e.target.value }))}
                className="rounded-xl border-2 focus:border-orange-400 transition-colors font-fredoka py-5 text-base"
                style={{ borderColor: 'rgb(var(--kid-accent-rgb) / 0.3)' }}
              />
            </div>

            <div className="mb-6">
              <label className="text-sm font-medium text-gray-600 mb-1.5 block font-fredoka">{t('password')}</label>
              <Input
                type="password"
                placeholder="••••••"
                value={authForm.password}
                onChange={e => setAuthForm(p => ({ ...p, password: e.target.value }))}
                className="rounded-xl border-2 focus:border-orange-400 transition-colors font-fredoka py-5 text-base"
                style={{ borderColor: 'rgb(var(--kid-accent-rgb) / 0.3)' }}
              />
            </div>

            <Button
              onClick={() => onAuth(showAuth)}
              className="w-full font-bold text-lg rounded-2xl py-6 shadow-lg hover:shadow-xl transition-all font-fredoka"
              style={{
                background: `linear-gradient(135deg, var(--kid-gradient-from), var(--kid-gradient-to))`,
                color: 'white',
                boxShadow: `0 8px 30px var(--kid-shadow-color)`
              }}
            >
              {showAuth === 'login' ? t('login') : t('createAccount')}
            </Button>

            <p className="text-center text-sm text-gray-500 mt-4 font-fredoka">
              {showAuth === 'login' ? t('dontHaveAccount') : t('alreadyHaveAccount')}
              <button
                onClick={() => setShowAuth(showAuth === 'login' ? 'register' : 'login')}
                className="font-semibold hover:underline ml-1"
                style={{ color: 'var(--kid-accent-hex)' }}
              >
                {showAuth === 'login' ? t('register') : t('login')}
              </button>
            </p>

            <button
              onClick={() => setShowAuth(null)}
              className="w-full text-center text-sm text-gray-400 mt-3 hover:text-gray-600 font-fredoka"
            >
              {t('cancel')}
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="buttons"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-4 w-full max-w-sm relative z-10"
          >
            <Button
              onClick={() => setShowAuth('register')}
              size="lg"
              className="font-bold text-lg rounded-2xl py-6 shadow-xl hover:shadow-2xl transition-all font-fredoka"
              style={{
                background: `linear-gradient(135deg, var(--kid-gradient-from), var(--kid-gradient-to))`,
                color: 'white',
                boxShadow: `0 10px 40px var(--kid-shadow-color)`
              }}
            >
              🎉 {t('createAccount')}
            </Button>

            <Button
              onClick={() => setShowAuth('login')}
              size="lg"
              variant="outline"
              className="font-bold text-lg rounded-2xl py-6 border-2 hover:shadow-lg transition-all font-fredoka"
              style={{ borderColor: `rgb(var(--kid-accent-rgb) / 0.3)` }}
            >
              🔑 {t('login')}
            </Button>

            <Button
              onClick={onGuest}
              variant="ghost"
              className="text-gray-500 hover:text-gray-700 font-fredoka"
            >
              {t('continueAsGuest')}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
