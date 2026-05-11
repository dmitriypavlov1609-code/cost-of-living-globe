'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import Globe, { GlobeMethods } from 'react-globe.gl';
import { City } from '@/lib/types';
import { Lang, tr, cityName, countryName } from '@/lib/i18n';

interface Props {
  cities: City[];
  selectedCity: City | null;
  onCitySelect: (city: City) => void;
  lang: Lang;
}

function costColor(score: number): string {
  if (score >= 8) return 'rgba(74,222,128,0.95)';
  if (score >= 6) return 'rgba(163,230,53,0.9)';
  if (score >= 4) return 'rgba(250,204,21,0.9)';
  if (score >= 2) return 'rgba(251,146,60,0.9)';
  return 'rgba(248,113,113,0.95)';
}

function scoreTierLabel(score: number, lang: Lang): string {
  if (score >= 8) return tr('veryAffordable', lang);
  if (score >= 6) return tr('affordable', lang);
  if (score >= 4) return tr('moderate', lang);
  if (score >= 2) return tr('expensive', lang);
  return tr('veryExpensive', lang);
}

function pointLabel(city: City, lang: Lang): string {
  const color = costColor(city.costScore);
  const name = cityName(city.slug, city.name, lang);
  const country = countryName(city.country, lang);
  return `<div style="background:rgba(4,4,20,0.96);border:1px solid rgba(148,163,184,0.2);border-radius:10px;padding:10px 14px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;pointer-events:none;box-shadow:0 8px 32px rgba(0,0,0,0.6);">
    <div style="color:#f1f5f9;font-weight:700;font-size:14px;">${name}</div>
    <div style="color:#475569;font-size:11px;margin-top:2px;">${country}</div>
    <div style="margin-top:7px;display:flex;align-items:center;gap:6px;">
      <span style="width:7px;height:7px;border-radius:50%;background:${color};display:inline-block;flex-shrink:0;box-shadow:0 0 8px ${color};"></span>
      <span style="color:${color};font-size:11px;font-weight:600;">${scoreTierLabel(city.costScore, lang)}</span>
    </div>
  </div>`;
}

export default function GlobeScene({ cities, selectedCity, onCitySelect, lang }: Props) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 800, h: 600 });

  useEffect(() => {
    const update = () => {
      if (!containerRef.current) return;
      setDims({ w: containerRef.current.clientWidth, h: containerRef.current.clientHeight });
    };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      if (!globeRef.current) return;
      const renderer = (globeRef.current as any).renderer?.();
      if (renderer) renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      const ctrl = globeRef.current.controls() as any;
      ctrl.autoRotate = true;
      ctrl.autoRotateSpeed = 0.35;
      ctrl.enableDamping = true;
      ctrl.dampingFactor = 0.07;
      ctrl.minDistance = 200;
      (globeRef.current as any).pointOfView({ altitude: 1.9 });
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!globeRef.current || !selectedCity) return;
    (globeRef.current as any).pointOfView(
      { lat: selectedCity.lat, lng: selectedCity.lng, altitude: 1.5 }, 900,
    );
    (globeRef.current.controls() as any).autoRotate = false;
  }, [selectedCity]);

  const handleHover = useCallback((point: object | null) => {
    if (!globeRef.current) return;
    (globeRef.current.controls() as any).autoRotate = !point && !selectedCity;
  }, [selectedCity]);

  return (
    <div ref={containerRef} className="absolute inset-0">
      <Globe
        ref={globeRef}
        width={dims.w}
        height={dims.h}
        backgroundColor="rgba(0,0,0,0)"
        backgroundImageUrl="/night-sky.png"
        globeImageUrl="/earth-blue-marble.jpg"
        bumpImageUrl="/earth-topology.png"
        atmosphereColor="rgba(80,120,255,1)"
        atmosphereAltitude={0.22}
        pointsData={cities}
        pointLat="lat"
        pointLng="lng"
        pointColor={(d: object) => costColor((d as City).costScore)}
        pointAltitude={(d: object) => selectedCity?.slug === (d as City).slug ? 0.1 : 0.015}
        pointRadius={(d: object) => selectedCity?.slug === (d as City).slug ? 0.65 : 0.4}
        pointLabel={(d: object) => pointLabel(d as City, lang)}
        pointsMerge={false}
        onPointClick={(point: object) => onCitySelect(point as City)}
        onPointHover={handleHover}
      />
    </div>
  );
}
