import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Users, HardHat, Briefcase, ShieldCheck, AlertCircle } from 'lucide-react';

interface PersonaViewProps {
  onBack: () => void;
}

const PERSONAS = [
  {
    role: "Инженер ПТО",
    type: "«Офисный воин»",
    quote: "«Я трачу 80% времени на Ctrl+C / Ctrl+V, вместо того чтобы реально проверять объемы.»",
    icon: <Users className="w-6 h-6" />,
    color: "bg-blue-600",
    bgColor: "bg-blue-100",
    pains: [
      "Рутинное заполнение сотен актов вручную",
      "Ошибки в номерах сертификатов и ГОСТах",
      "Постоянные правки от технадзора"
    ],
    jtbd: "Когда я получаю смету, я хочу быстро сформировать пакет ИД, чтобы успеть сдать его к концу месяца и не сидеть до ночи.",
    solution: "Авто-генерация АОСР из сметы + база материалов."
  },
  {
    role: "Прораб / Мастер",
    type: "«Полевой командир»",
    quote: "«Мне некогда писать журналы, у меня бетон стынет и кран стоит.»",
    icon: <HardHat className="w-6 h-6" />,
    color: "bg-emerald-600",
    bgColor: "bg-emerald-100",
    pains: [
      "Необходимость вести бумажный ОЖР на морозе",
      "Потеря фотофиксации скрытых работ",
      "Конфликты с ПТО из-за невовремя сданных данных"
    ],
    jtbd: "Когда работа выполнена, я хочу зафиксировать её в телефоне за 1 минуту, чтобы данные сразу ушли в ПТО.",
    solution: "Мобильное приложение для ОЖР и фотофиксации."
  },
  {
    role: "Директор / Нач. ПТО",
    type: "«Стратег»",
    quote: "«Я не понимаю реальный прогресс на объектах, пока не увижу подписанные акты.»",
    icon: <Briefcase className="w-6 h-6" />,
    color: "bg-slate-800",
    bgColor: "bg-slate-200",
    pains: [
      "Кассовые разрывы из-за задержек в сдаче ИД",
      "Низкая маржинальность из-за раздутого штата ПТО",
      "Риски штрафов от ГСН"
    ],
    jtbd: "Я хочу видеть дашборд готовности документов по всем объектам, чтобы вовремя получать оплату от заказчика.",
    solution: "Аналитика прогресса и контроль сроков сдачи ИД."
  },
  {
    role: "Инспектор ГСН",
    type: "«Контролер»",
    quote: "«Я не хочу копаться в пыльных папках на объекте, мне нужны актуальные данные онлайн.»",
    icon: <ShieldCheck className="w-6 h-6" />,
    color: "bg-rose-600",
    bgColor: "bg-rose-100",
    pains: [
      "Сложность проверки скрытых работ постфактум",
      "Недостоверность данных в бумажных журналах",
      "Огромные затраты времени на выезды"
    ],
    jtbd: "Когда я провожу проверку, я хочу иметь удаленный доступ к цифровому ОЖР и фотофиксации, чтобы подтвердить качество работ.",
    solution: "Личный кабинет инспектора с доступом к ИД и фото."
  }
];

export const PersonaView: React.FC<PersonaViewProps> = ({ onBack }) => {
  return (
    <motion.div
      key="persona"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-6xl w-full space-y-8 mt-8"
    >
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Назад к выбору вектора
      </button>

      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-slate-900">Портрет ЦА и боли</h2>
        <p className="text-slate-600">Глубокое погружение в потребности тех, кто строит и оформляет документы.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PERSONAS.map((persona, index) => (
          <div key={index} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
            <div className={`p-6 ${persona.color} text-white`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white/20 rounded-2xl">
                  {persona.icon}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{persona.role}</h3>
                  <p className="text-white/80 text-xs">{persona.type}</p>
                </div>
              </div>
              <div className="text-sm italic opacity-90">{persona.quote}</div>
            </div>
            <div className="p-6 space-y-6 flex-1">
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Боли:</h4>
                <ul className="space-y-2">
                  {persona.pains.map((pain, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      {pain}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Задачи (JTBD):</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{persona.jtbd}</p>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <div className={`text-xs font-bold mb-2`} style={{ color: persona.color.replace('bg-', 'text-') }}>Наше решение:</div>
                <div className="text-xs text-slate-500">{persona.solution}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
