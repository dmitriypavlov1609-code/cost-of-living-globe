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
  if (score >= 7) return 'rgba(34,197,94,0.9)';
  if (score >= 5) return 'rgba(234,179,8,0.9)';
  if (score >= 3) return 'rgba(249,115,22,0.9)';
  return 'rgba(239,68,68,0.9)';
}

function pointLabel(city: City): string {
  return `
    <div style="
      background:rgba(8,8,30,0.92);
      border:1px solid rgba(100,116,139,0.4);
      border-radius:8px;
      padding:8px 12px;
      font-family:-apple-system,sans-serif;
      pointer-events:none;
    ">
      <div style="color:#f1f5f9;font-weight:600;font-size:14px;">${city.name}</div>
      <div style="color:#94a3b8;font-size:12px;margin-top:2px;">${city.country}</div>
    </div>
  `;
}

export default function GlobeScene({ cities, selectedCity, onCitySelect }: Props) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 800, h: 600 });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setDims({
          w: containerRef.current.clientWidth,
          h: containerRef.current.clientHeight,
        });
      }
    };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Globe mounts synchronously — init controls on next frame
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      if (!globeRef.current) return;
      const ctrl = globeRef.current.controls() as any;
      ctrl.autoRotate = true;
      ctrl.autoRotateSpeed = 0.35;
      ctrl.enableDamping = true;
      ctrl.dampingFactor = 0.1;
      (globeRef.current as any).pointOfView({ altitude: 2.2 });
      setReady(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  // Fly to selected city
  useEffect(() => {
    if (!globeRef.current || !selectedCity || !ready) return;
    (globeRef.current as any).pointOfView(
      { lat: selectedCity.lat, lng: selectedCity.lng, altitude: 1.8 },
      800,
    );
    (globeRef.current.controls() as any).autoRotate = false;
  }, [selectedCity, ready]);

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
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        atmosphereColor="#3b82f6"
        atmosphereAltitude={0.18}
        pointsData={cities}
        pointLat="lat"
        pointLng="lng"
        pointColor={(d: object) => costColor((d as City).costScore)}
        pointAltitude={(d: object) =>
          selectedCity?.slug === (d as City).slug ? 0.06 : 0.012
        }
        pointRadius={(d: object) =>
          selectedCity?.slug === (d as City).slug ? 0.6 : 0.38
        }
        pointLabel={(d: object) => pointLabel(d as City)}
        pointsMerge={false}
        onPointClick={(point: object) => onCitySelect(point as City)}
        onPointHover={handleHover}
      />
    </div>
  );
}
