'use client';

import dynamic from 'next/dynamic';
import { useState, useCallback, useEffect } from 'react';
import { City } from '@/lib/types';
import { Lang, Currency, tr } from '@/lib/i18n';
import CityPanel from '@/components/CityPanel';
import SettingsToggle from '@/components/SettingsToggle';
import citiesData from '@/public/cities.json';

const GlobeScene = dynamic(() => import('@/components/GlobeScene'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-blue-500/60 border-t-transparent animate-spin" />
        <p className="text-slate-500 text-sm tracking-wide">Loading…</p>
      </div>
    </div>
  ),
});

const cities = citiesData as City[];

function Legend({ lang }: { lang: Lang }) {
  const items = [
    { color: '#4ade80', label: tr('veryAffordable', lang) },
    { color: '#a3e635', label: tr('affordable', lang) },
    { color: '#facc15', label: tr('moderate', lang) },
    { color: '#fb923c', label: tr('expensive', lang) },
    { color: '#f87171', label: tr('veryExpensive', lang) },
  ];
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-400">
      {items.map(({ color, label }) => (
        <div key={label} className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: color, boxShadow: `0 0 5px ${color}` }}
          />
          {label}
        </div>
      ))}
    </div>
  );
}

function detectInitialLang(): Lang {
  if (typeof window === 'undefined') return 'en';
  const saved = window.localStorage.getItem('lang');
  if (saved === 'en' || saved === 'ru') return saved;
  return navigator.language?.toLowerCase().startsWith('ru') ? 'ru' : 'en';
}

function detectInitialCurrency(): Currency {
  if (typeof window === 'undefined') return 'USD';
  const saved = window.localStorage.getItem('currency');
  if (saved === 'USD' || saved === 'RUB') return saved;
  return navigator.language?.toLowerCase().startsWith('ru') ? 'RUB' : 'USD';
}

export default function Home() {
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [lang, setLang] = useState<Lang>('en');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLang(detectInitialLang());
    setCurrency(detectInitialCurrency());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) window.localStorage.setItem('lang', lang);
  }, [lang, mounted]);

  useEffect(() => {
    if (mounted) window.localStorage.setItem('currency', currency);
  }, [currency, mounted]);

  const handleCitySelect = useCallback((city: City) => {
    setSelectedCity(city);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedCity(null);
  }, []);

  return (
    <main
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% 55%, #0e1a3a 0%, #050510 70%)' }}
    >
      <header className="absolute top-0 left-0 right-0 z-10 px-6 py-5 select-none">
        <div className="flex items-start justify-between gap-4">
          <div className="pointer-events-none">
            <h1 className="text-white font-bold text-xl tracking-tight">
              {tr('title', lang)}
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              {tr('subtitle', lang)(cities.length)}
            </p>
          </div>
          <SettingsToggle
            lang={lang}
            currency={currency}
            onLangChange={setLang}
            onCurrencyChange={setCurrency}
          />
        </div>
        <div className="hidden md:flex justify-end mt-3 pointer-events-none">
          <Legend lang={lang} />
        </div>
      </header>

      <GlobeScene
        cities={cities}
        selectedCity={selectedCity}
        onCitySelect={handleCitySelect}
        lang={lang}
      />

      <CityPanel
        city={selectedCity}
        lang={lang}
        currency={currency}
        onClose={handleClose}
      />

      <div className="absolute bottom-5 left-4 md:hidden z-10 pointer-events-none">
        <Legend lang={lang} />
      </div>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, transparent 45%, rgba(3,3,12,0.7) 100%)' }}
      />
    </main>
  );
}
