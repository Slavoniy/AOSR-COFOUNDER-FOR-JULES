import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, UserCheck } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';

interface AuthViewProps {
  onLogin: (e: React.FormEvent) => Promise<void>;
  onRegister: (e: React.FormEvent) => Promise<void>;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLogin, onRegister }) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  return (
    <motion.div
      key="auth"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl mt-12"
    >
      <div className="flex bg-slate-100 p-1 rounded-xl mb-8">
        <button
          onClick={() => setAuthMode('login')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${authMode === 'login' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Вход
        </button>
        <button
          onClick={() => setAuthMode('register')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${authMode === 'register' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Регистрация
        </button>
      </div>

      <div className="text-center space-y-4 mb-8">
        <div className="inline-flex p-3 bg-blue-50 rounded-2xl text-blue-600">
          {authMode === 'login' ? <Lock className="w-8 h-8" /> : <UserCheck className="w-8 h-8" />}
        </div>
        <h2 className="text-2xl font-bold text-slate-900">
          {authMode === 'login' ? 'Вход в систему' : 'Создать аккаунт'}
        </h2>
        <p className="text-slate-500">
          {authMode === 'login' ? 'Введите данные для доступа к вашим проектам' : 'Начните автоматизировать ИД прямо сейчас'}
        </p>
      </div>

      <form onSubmit={authMode === 'login' ? onLogin : onRegister} className="space-y-4">
        {authMode === 'register' && (
          <Input
            name="name"
            label="Имя и Фамилия"
            type="text"
            placeholder="Иван Иванов"
            required
          />
        )}
        <Input
          name="email"
          label="Email"
          type="email"
          defaultValue={authMode === 'login' ? "ivan@stroydoc.ai" : ""}
          placeholder="name@company.com"
          required
        />
        <Input
          name="password"
          label="Пароль"
          type="password"
          defaultValue={authMode === 'login' ? "password123" : ""}
          placeholder="••••••••"
          required
        />
        <Button
          type="submit"
          className="w-full"
        >
          {authMode === 'login' ? 'Войти' : 'Зарегистрироваться'}
        </Button>
      </form>
    </motion.div>
  );
};
