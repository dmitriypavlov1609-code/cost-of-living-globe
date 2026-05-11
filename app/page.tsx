'use client';

import dynamic from 'next/dynamic';
import { useState, useCallback } from 'react';
import { City } from '@/lib/types';
import { fetchCityEnrichment, EnrichedData } from '@/lib/teleport-client';
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

export default function Home() {
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [enrichment, setEnrichment] = useState<EnrichedData | null>(null);
  const [enrichmentLoading, setEnrichmentLoading] = useState(false);
  const [enrichmentFailed, setEnrichmentFailed] = useState(false);

  const handleCitySelect = useCallback(async (city: City) => {
    if (selectedCity?.slug === city.slug) return;
    setSelectedCity(city);
    setEnrichment(null);
    setEnrichmentFailed(false);
    setEnrichmentLoading(true);

    const data = await fetchCityEnrichment(city.slug);

    setEnrichment(data);
    setEnrichmentFailed(data === null);
    setEnrichmentLoading(false);
  }, [selectedCity]);

  const handleClose = useCallback(() => {
    setSelectedCity(null);
    setEnrichment(null);
    setEnrichmentLoading(false);
    setEnrichmentFailed(false);
  }, []);

  return (
    <main
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% 55%, #0e1a3a 0%, #050510 70%)' }}
    >
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

      <GlobeScene
        cities={cities}
        selectedCity={selectedCity}
        onCitySelect={handleCitySelect}
      />

      <CityPanel
        city={selectedCity}
        enrichment={enrichment}
        enrichmentLoading={enrichmentLoading}
        enrichmentFailed={enrichmentFailed}
        onClose={handleClose}
      />

      <div className="absolute bottom-5 left-4 md:hidden z-10 pointer-events-none">
        <Legend />
      </div>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, transparent 45%, rgba(3,3,12,0.7) 100%)' }}
      />
    </main>
  );
}
