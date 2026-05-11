'use client';

import { Lang, Currency } from '@/lib/i18n';

interface Props {
  lang: Lang;
  currency: Currency;
  onLangChange: (l: Lang) => void;
  onCurrencyChange: (c: Currency) => void;
}

function Pill<T extends string>({
  value,
  active,
  onClick,
  label,
}: {
  value: T;
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
        active
          ? 'bg-slate-700/80 text-white shadow-sm'
          : 'text-slate-400 hover:text-slate-200'
      }`}
      aria-pressed={active}
      aria-label={`${value}: ${label}`}
    >
      {label}
    </button>
  );
}

export default function SettingsToggle({ lang, currency, onLangChange, onCurrencyChange }: Props) {
  return (
    <div className="flex items-center gap-2 pointer-events-auto">
      <div className="flex items-center bg-slate-900/70 backdrop-blur-md border border-slate-800 rounded-lg p-0.5">
        <Pill value="en" active={lang === 'en'} onClick={() => onLangChange('en')} label="EN" />
        <Pill value="ru" active={lang === 'ru'} onClick={() => onLangChange('ru')} label="RU" />
      </div>
      <div className="flex items-center bg-slate-900/70 backdrop-blur-md border border-slate-800 rounded-lg p-0.5">
        <Pill value="USD" active={currency === 'USD'} onClick={() => onCurrencyChange('USD')} label="$" />
        <Pill value="RUB" active={currency === 'RUB'} onClick={() => onCurrencyChange('RUB')} label="₽" />
      </div>
    </div>
  );
}
