'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import Globe, { GlobeMethods } from 'react-globe.gl';
import { City } from '@/lib/types';

interface Props {
  cities: City[];
  selectedCity: City | null;
  onCitySelect: (city: City) => void;
}

function costColor(score: number): string {
  if (score >= 8) return 'rgba(74,222,128,0.95)';
  if (score >= 6) return 'rgba(163,230,53,0.9)';
  if (score >= 4) return 'rgba(250,204,21,0.9)';
  if (score >= 2) return 'rgba(251,146,60,0.9)';
  return 'rgba(248,113,113,0.95)';
}

function pointLabel(city: City): string {
  const color = costColor(city.costScore);
  const tier = city.costScore >= 8 ? 'Very affordable' : city.costScore >= 6 ? 'Affordable' : city.costScore >= 4 ? 'Moderate' : city.costScore >= 2 ? 'Expensive' : 'Very expensive';
  return `<div style="background:rgba(4,4,20,0.95);border:1px solid rgba(148,163,184,0.25);border-radius:10px;padding:10px 14px;font-family:-apple-system,sans-serif;pointer-events:none;box-shadow:0 4px 24px rgba(0,0,0,0.5);">
    <div style="color:#f1f5f9;font-weight:700;font-size:14px;letter-spacing:0.01em;">${city.name}</div>
    <div style="color:#64748b;font-size:11px;margin-top:2px;">${city.country}</div>
    <div style="margin-top:6px;display:flex;align-items:center;gap:6px;">
      <span style="width:8px;height:8px;border-radius:50%;background:${color};display:inline-block;box-shadow:0 0 6px ${color};"></span>
      <span style="color:${color};font-size:11px;font-weight:600;">${tier}</span>
    </div>
  </div>`;
}

export default function GlobeScene({ cities, selectedCity, onCitySelect }: Props) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 800, h: 600 });

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setDims({ w: containerRef.current.clientWidth, h: containerRef.current.clientHeight });
      }
    };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      if (!globeRef.current) return;
      const ctrl = globeRef.current.controls() as any;
      ctrl.autoRotate = true;
      ctrl.autoRotateSpeed = 0.4;
      ctrl.enableDamping = true;
      ctrl.dampingFactor = 0.08;
      (globeRef.current as any).pointOfView({ altitude: 2.0 });
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!globeRef.current || !selectedCity) return;
    (globeRef.current as any).pointOfView(
      { lat: selectedCity.lat, lng: selectedCity.lng, altitude: 1.6 }, 1000
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
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        atmosphereColor="rgba(100,140,255,1)"
        atmosphereAltitude={0.2}
        pointsData={cities}
        pointLat="lat"
        pointLng="lng"
        pointColor={(d: object) => costColor((d as City).costScore)}
        pointAltitude={(d: object) => selectedCity?.slug === (d as City).slug ? 0.08 : 0.015}
        pointRadius={(d: object) => selectedCity?.slug === (d as City).slug ? 0.7 : 0.42}
        pointLabel={(d: object) => pointLabel(d as City)}
        pointsMerge={false}
        onPointClick={(point: object) => onCitySelect(point as City)}
        onPointHover={handleHover}
      />
    </div>
  );
}
