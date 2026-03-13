import React from 'react';
import { motion } from 'motion/react';
import { HardHat, FileSpreadsheet, FileText, Zap } from 'lucide-react';

interface HomeViewProps {
  onLogin: () => void;
  onRegister: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onLogin, onRegister }) => {
  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-200">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <HardHat className="w-7 h-7 text-blue-600" />
            <span className="text-xl">StroyDoc AI</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={onLogin}
              className="text-slate-600 hover:text-blue-600 font-medium px-4 py-2 transition-colors rounded-lg hover:bg-slate-100/50"
            >
              Вход
            </button>
            <button
              onClick={onRegister}
              className="bg-blue-600 text-white px-5 py-2 rounded-xl font-medium hover:bg-blue-700 transition-all shadow-sm hover:shadow active:scale-95"
            >
              Регистрация
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[500px] bg-blue-400/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute top-40 right-0 w-[400px] h-[400px] bg-indigo-400/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-left space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              AI Кофаундер для стройки
            </div>

            <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              Автоматизация исполнительной <br className="hidden lg:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                документации с помощью ИИ
              </span>
            </h1>

            <p className="text-xl text-slate-600 leading-relaxed max-w-lg">
              Загружайте сметы из Excel, а нейросеть сама сформирует АОСР, журналы работ и ведомости за секунды. Без рутины и ошибок.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={onRegister}
                className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 active:scale-95 flex items-center justify-center gap-2"
              >
                Начать бесплатно
                <Zap className="w-5 h-5" />
              </button>
              <button
                onClick={scrollToFeatures}
                className="bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95"
              >
                Как это работает
              </button>
            </div>
          </motion.div>

          {/* Visual Placeholder (Abstract Dashboard Mockup) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative w-full aspect-square md:aspect-video lg:aspect-square max-w-lg mx-auto"
          >
            {/* Main Mockup Container */}
            <div className="absolute inset-0 bg-white rounded-3xl border border-slate-200/60 shadow-2xl overflow-hidden flex flex-col">
              {/* Fake Window Controls */}
              <div className="h-10 border-b border-slate-100 flex items-center px-4 gap-1.5 bg-slate-50/50">
                <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                <div className="w-3 h-3 rounded-full bg-slate-200"></div>
              </div>

              <div className="flex-1 p-6 relative bg-slate-50/30">
                {/* Skeleton UI elements */}
                <div className="space-y-4">
                  <div className="h-8 w-1/3 bg-slate-200/50 rounded-lg animate-pulse" />

                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-24 bg-white rounded-xl border border-slate-100 shadow-sm p-4 space-y-2">
                       <div className="h-4 w-8 bg-blue-100 rounded" />
                       <div className="h-3 w-1/2 bg-slate-100 rounded" />
                    </div>
                    <div className="h-24 bg-white rounded-xl border border-slate-100 shadow-sm p-4 space-y-2">
                       <div className="h-4 w-8 bg-indigo-100 rounded" />
                       <div className="h-3 w-1/2 bg-slate-100 rounded" />
                    </div>
                    <div className="h-24 bg-white rounded-xl border border-slate-100 shadow-sm p-4 space-y-2">
                       <div className="h-4 w-8 bg-purple-100 rounded" />
                       <div className="h-3 w-1/2 bg-slate-100 rounded" />
                    </div>
                  </div>

                  <div className="h-32 bg-white rounded-xl border border-slate-100 shadow-sm p-4 space-y-3 mt-4">
                    <div className="h-4 w-1/4 bg-slate-200/50 rounded" />
                    <div className="space-y-2">
                      <div className="h-2 w-full bg-slate-100 rounded" />
                      <div className="h-2 w-5/6 bg-slate-100 rounded" />
                      <div className="h-2 w-4/6 bg-slate-100 rounded" />
                    </div>
                  </div>
                </div>

                {/* Floating Elements (Glow/Cards) */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -right-6 -bottom-6 bg-white p-4 rounded-2xl border border-slate-100 shadow-xl w-48 flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800">АОСР Готов</div>
                    <div className="text-xs text-slate-500">только что</div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Decoration Elements behind the mockup */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 blur-2xl rounded-3xl -z-10" />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Как StroyDoc AI меняет работу инженера ПТО
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Мы используем передовые модели ИИ, чтобы избавить вас от рутины при составлении исполнительной документации.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-colors group">
              <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-blue-600">
                <FileSpreadsheet className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Умный парсинг смет</h3>
              <p className="text-slate-600 leading-relaxed">
                ИИ автоматически распознает любые форматы Excel-смет, извлекает наименования работ, объемы и единицы измерения, не требуя жестких шаблонов.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors group">
              <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-indigo-600">
                <FileText className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Генерация АОСР</h3>
              <p className="text-slate-600 leading-relaxed">
                Мгновенное формирование Актов освидетельствования скрытых работ (АОСР) строго по ГОСТ и Приказу №344/пр в формате Word (.docx).
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-purple-200 hover:bg-purple-50/30 transition-colors group">
              <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-purple-600">
                <Zap className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Экономия времени</h3>
              <p className="text-slate-600 leading-relaxed">
                Сократите время на бумажную работу до 80%. Освободите часы работы инженеров для контроля качества на стройплощадке.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-50 border-t border-slate-200/60 text-center text-slate-500 text-sm">
        <p>© {new Date().getFullYear()} StroyDoc AI. Все права защищены.</p>
      </footer>
    </div>
  );
};
