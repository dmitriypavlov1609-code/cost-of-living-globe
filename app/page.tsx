'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect, useCallback } from 'react';
import { City, CityDetail } from '@/lib/types';
import CityPanel from '@/components/CityPanel';

const GlobeScene = dynamic(() => import('@/components/GlobeScene'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-slate-500 text-sm">Loading globe…</div>
    </div>
  ),
});

function Legend() {
  return (
    <div className="flex items-center gap-4 text-xs text-slate-400">
      {[
        { color: '#22c55e', label: 'Affordable' },
        { color: '#eab308', label: 'Moderate' },
        { color: '#f97316', label: 'Pricey' },
        { color: '#ef4444', label: 'Expensive' },
      ].map(({ color, label }) => (
        <div key={label} className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ background: color }}
          />
          {label}
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [cities, setCities] = useState<City[]>([]);
  const [loadingCities, setLoadingCities] = useState(true);
  const [citiesError, setCitiesError] = useState(false);

  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [cityDetail, setCityDetail] = useState<CityDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Fetch all cities on mount
  useEffect(() => {
    fetch('/api/cities')
      .then((r) => {
        if (!r.ok) throw new Error('API error');
        return r.json();
      })
      .then((data: City[]) => {
        setCities(data);
        setLoadingCities(false);
      })
      .catch(() => {
        setCitiesError(true);
        setLoadingCities(false);
      });
  }, []);

  const handleCitySelect = useCallback((city: City) => {
    if (selectedCity?.slug === city.slug) return;
    setSelectedCity(city);
    setCityDetail(null);
    setLoadingDetail(true);

    fetch(`/api/city/${encodeURIComponent(city.slug)}`)
      .then((r) => {
        if (!r.ok) throw new Error('not found');
        return r.json();
      })
      .then((data: CityDetail) => {
        setCityDetail(data);
        setLoadingDetail(false);
      })
      .catch(() => setLoadingDetail(false));
  }, [selectedCity]);

  const handleClose = useCallback(() => {
    setSelectedCity(null);
    setCityDetail(null);
    setLoadingDetail(false);
  }, []);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#08081e]">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 px-6 py-4 flex items-start justify-between pointer-events-none">
        <div>
          <h1 className="text-white font-semibold text-lg tracking-tight leading-none">
            Cost of Living Globe
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            {loadingCities
              ? 'Loading cities…'
              : citiesError
              ? 'Failed to load cities'
              : `${cities.length} cities · click any point`}
          </p>
        </div>

        <div className="hidden sm:block mt-1">
          <Legend />
        </div>
      </header>

      {/* Loading overlay */}
      {loadingCities && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-slate-400 text-sm">Fetching cities from Teleport…</p>
          <p className="text-slate-600 text-xs mt-1">First load may take ~20s</p>
        </div>
      )}

      {citiesError && !loadingCities && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="bg-slate-800 border border-slate-700 rounded-lg px-6 py-4 text-center">
            <p className="text-red-400 text-sm font-medium">Failed to load city data</p>
            <p className="text-slate-500 text-xs mt-1">Check your connection and reload</p>
          </div>
        </div>
      )}

      {/* Globe */}
      <GlobeScene
        cities={cities}
        selectedCity={selectedCity}
        onCitySelect={handleCitySelect}
      />

      {/* Side panel */}
      <CityPanel
        city={cityDetail}
        loading={loadingDetail}
        onClose={handleClose}
      />

      {/* Mobile legend */}
      <div className="absolute bottom-4 left-4 sm:hidden z-10 pointer-events-none">
        <Legend />
      </div>
    </main>
  );
}
