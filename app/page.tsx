'use client';

import dynamic from 'next/dynamic';
import { useState, useCallback } from 'react';
import { City, CityDetail } from '@/lib/types';
import { fetchCityDetailClient } from '@/lib/teleport-client';
import CityPanel from '@/components/CityPanel';
import citiesData from '@/public/cities.json';

const GlobeScene = dynamic(() => import('@/components/GlobeScene'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-blue-500/60 border-t-transparent animate-spin" />
        <p className="text-slate-500 text-sm tracking-wide">Loading globe…</p>
      </div>
    </div>
  ),
});

const cities = citiesData as City[];

function Dot({ color }: { color: string }) {
  return (
    <span
      className="inline-block w-2 h-2 rounded-full shrink-0"
      style={{ background: color, boxShadow: `0 0 5px ${color}` }}
    />
  );
}

function Legend() {
  const items = [
    { color: '#4ade80', label: 'Very affordable' },
    { color: '#a3e635', label: 'Affordable' },
    { color: '#facc15', label: 'Moderate' },
    { color: '#fb923c', label: 'Expensive' },
    { color: '#f87171', label: 'Very expensive' },
  ];
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400">
      {items.map(({ color, label }) => (
        <div key={label} className="flex items-center gap-1.5">
          <Dot color={color} />
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

  const handleCitySelect = useCallback(async (city: City) => {
    if (selectedCity?.slug === city.slug) return;
    setSelectedCity(city);
    setCityDetail(null);
    setLoadingDetail(true);

    const detail = await fetchCityDetailClient(city.slug, {
      name: city.name,
      country: city.country,
      lat: city.lat,
      lng: city.lng,
      costScore: city.costScore,
      overallScore: city.overallScore,
    });

    setCityDetail(detail);
    setLoadingDetail(false);
  }, [selectedCity]);

  const handleClose = useCallback(() => {
    setSelectedCity(null);
    setCityDetail(null);
    setLoadingDetail(false);
  }, []);

  return (
    <main
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% 60%, #0d1b3e 0%, #050510 65%)' }}
    >
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 px-6 py-5 pointer-events-none select-none">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-white font-bold text-xl tracking-tight">
              Cost of Living Globe
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              {cities.length} cities · click any point
            </p>
          </div>
          <div className="hidden md:block">
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
      <div className="absolute bottom-5 left-4 md:hidden z-10 pointer-events-none">
        <Legend />
      </div>

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, transparent 45%, rgba(3,3,12,0.65) 100%)' }}
      />
    </main>
  );
}
