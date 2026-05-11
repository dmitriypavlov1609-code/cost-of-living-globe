'use client';

import { City } from '@/lib/types';
import { EnrichedData } from '@/lib/teleport-client';

interface Props {
  city: City | null;
  enrichment: EnrichedData | null;
  enrichmentLoading: boolean;
  enrichmentFailed: boolean;
  onClose: () => void;
}

function fmt(value: number | null): string {
  if (value == null) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function costTier(score: number): { label: string; color: string } {
  if (score >= 8) return { label: 'Very affordable', color: '#4ade80' };
  if (score >= 6) return { label: 'Affordable', color: '#a3e635' };
  if (score >= 4) return { label: 'Moderate', color: '#facc15' };
  if (score >= 2) return { label: 'Expensive', color: '#fb923c' };
  return { label: 'Very expensive', color: '#f87171' };
}

function ScoreBar({ score, color }: { score: number; color: string }) {
  const pct = Math.max(0, Math.min(100, (score / 10) * 100));
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs text-slate-400 w-7 text-right tabular-nums">{score}</span>
    </div>
  );
}

export default function CityPanel({
  city,
  enrichment,
  enrichmentLoading,
  enrichmentFailed,
  onClose,
}: Props) {
  const visible = city !== null;
  const tier = city ? costTier(city.costScore) : null;

  return (
    <div
      className={`fixed right-0 top-0 h-full w-full sm:w-[400px] z-20 transition-transform duration-300 ease-out ${
        visible ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="h-full bg-slate-950/95 backdrop-blur-xl border-l border-slate-800/80 flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.5)]">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-800/80 shrink-0">
          {city && tier && (
            <div className="min-w-0">
              <h2 className="text-2xl font-bold text-white leading-tight truncate">{city.name}</h2>
              <p className="text-sm text-slate-400 mt-0.5">{city.country}</p>
              <div className="mt-3 flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: tier.color, boxShadow: `0 0 8px ${tier.color}` }}
                />
                <span className="text-xs font-medium" style={{ color: tier.color }}>
                  {tier.label}
                </span>
                <span className="text-xs text-slate-600">·</span>
                <span className="text-xs text-slate-500">
                  Overall <span className="text-slate-300 font-semibold">{Math.round(city.overallScore)}</span>/100
                </span>
              </div>
            </div>
          )}

          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors ml-4 shrink-0 p-1 -m-1"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto panel-scroll p-5 space-y-6">
          {/* Loading enrichment */}
          {enrichmentLoading && (
            <div className="space-y-3">
              <div className="h-3 w-32 bg-slate-800 rounded animate-pulse" />
              <div className="space-y-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex justify-between gap-3">
                    <div className="h-3 flex-1 bg-slate-800/70 rounded animate-pulse" style={{ maxWidth: `${60 + i * 5}%` }} />
                    <div className="h-3 w-14 bg-slate-800 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          {enrichment?.summary && (
            <p className="text-sm text-slate-400 leading-relaxed">{enrichment.summary}</p>
          )}

          {/* Cost categories */}
          {enrichment?.costCategories.map((cat) => (
            <div key={cat.id}>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                {cat.label}
              </h3>
              <div className="space-y-2">
                {cat.items.slice(0, 8).map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-baseline gap-3 py-1.5 border-b border-slate-800/60 last:border-0"
                  >
                    <span className="text-sm text-slate-300 leading-snug">{item.label}</span>
                    <span className="text-sm font-semibold text-white shrink-0 tabular-nums">
                      {fmt(item.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Quality scores */}
          {enrichment && enrichment.qualityScores.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Quality of Life
              </h3>
              <div className="space-y-2.5">
                {enrichment.qualityScores.map((s) => (
                  <div key={s.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300">{s.name}</span>
                      <span style={{ color: s.color }} className="tabular-nums">{s.score}</span>
                    </div>
                    <ScoreBar score={s.score} color={s.color} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No-data fallback */}
          {!enrichmentLoading && !enrichment && enrichmentFailed && city && (
            <div className="space-y-4">
              <div className="text-xs text-slate-600 uppercase tracking-wider font-semibold">
                Coordinates
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
                  <div className="text-xs text-slate-500 mb-1">Latitude</div>
                  <div className="text-white font-mono">{city.lat.toFixed(4)}</div>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
                  <div className="text-xs text-slate-500 mb-1">Longitude</div>
                  <div className="text-white font-mono">{city.lng.toFixed(4)}</div>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mt-4">
                Detailed pricing data isn&apos;t available for this city right now.
                The affordability rating shown is based on cached cost-of-living index.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-5 py-3 border-t border-slate-800/80">
          <p className="text-xs text-slate-600">
            Cost-of-living index ·{' '}
            <a
              href={`https://teleport.org/cities/${city?.slug}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-slate-300 transition-colors"
            >
              More on Teleport →
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
