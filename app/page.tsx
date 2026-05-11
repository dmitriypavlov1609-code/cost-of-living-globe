'use client';

import dynamic from 'next/dynamic';
import { useState, useCallback } from 'react';
import { City, CityDetail } from '@/lib/types';
import CityPanel from '@/components/CityPanel';
import citiesData from '@/public/cities.json';

const GlobeScene = dynamic(() => import('@/components/GlobeScene'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        <p className="text-slate-500 text-sm">Rendering globe…</p>
      </div>
    </div>
  ),
});

const cities = citiesData as City[];

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400">
      {[
        { color: '#4ade80', label: 'Very affordable' },
        { color: '#a3e635', label: 'Affordable' },
        { color: '#facc15', label: 'Moderate' },
        { color: '#fb923c', label: 'Expensive' },
        { color: '#f87171', label: 'Very expensive' },
      ].map(({ color, label }) => (
        <div key={label} className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color, boxShadow: `0 0 5px ${color}` }} />
          {label}
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [cityDetail, setCityDetail] = useState<CityDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const handleCitySelect = useCallback((city: City) => {
    if (selectedCity?.slug === city.slug) return;
    setSelectedCity(city);
    setCityDetail(null);
    setLoadingDetail(true);

    fetch(`/api/city/${encodeURIComponent(city.slug)}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data: CityDetail) => { setCityDetail(data); setLoadingDetail(false); })
      .catch(() => setLoadingDetail(false));
  }, [selectedCity]);

  const handleClose = useCallback(() => {
    setSelectedCity(null);
    setCityDetail(null);
    setLoadingDetail(false);
  }, []);

  return (
    <main className="relative w-screen h-screen overflow-hidden" style={{ background: 'radial-gradient(ellipse at center, #0d1b3e 0%, #04040f 70%)' }}>

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 px-6 py-5 pointer-events-none">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-white font-bold text-xl tracking-tight leading-none">
              Cost of Living Globe
            </h1>
            <p className="text-slate-500 text-xs mt-1.5">
              {cities.length} cities · click any point for details
            </p>
          </div>
          <div className="hidden sm:block">
            <Legend />
          </div>
        </div>
      </header>

      {/* Globe */}
      <GlobeScene
        cities={cities}
        selectedCity={selectedCity}
        onCitySelect={handleCitySelect}
      />

      {/* City detail panel */}
      <CityPanel
        city={cityDetail}
        loading={loadingDetail}
        onClose={handleClose}
      />

      {/* Mobile legend */}
      <div className="absolute bottom-5 left-4 sm:hidden z-10 pointer-events-none">
        <Legend />
      </div>

      {/* Subtle vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 50%, rgba(4,4,15,0.6) 100%)' }} />
    </main>
  );
}
