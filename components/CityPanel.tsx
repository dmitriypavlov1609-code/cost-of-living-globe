'use client';

import { CityDetail } from '@/lib/types';

interface Props {
  city: CityDetail | null;
  loading: boolean;
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

function ScoreBar({ score, color }: { score: number; color: string }) {
  const pct = (score / 10) * 100;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs text-slate-400 w-6 text-right">{score}</span>
    </div>
  );
}

export default function CityPanel({ city, loading, onClose }: Props) {
  const visible = loading || city !== null;

  return (
    <div
      className={`fixed right-0 top-0 h-full w-full sm:w-96 z-20 transition-transform duration-300 ease-out ${
        visible ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="h-full bg-slate-900/95 backdrop-blur-md border-l border-slate-700/50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-700/50 shrink-0">
          {loading ? (
            <div className="space-y-2">
              <div className="h-6 w-40 bg-slate-700 rounded animate-pulse" />
              <div className="h-4 w-24 bg-slate-700/60 rounded animate-pulse" />
            </div>
          ) : city ? (
            <div>
              <h2 className="text-xl font-semibold text-white leading-tight">{city.name}</h2>
              <p className="text-sm text-slate-400 mt-0.5">{city.country}</p>
              {city.overallScore > 0 && (
                <p className="text-xs text-slate-500 mt-1">
                  Teleport score:{' '}
                  <span className="text-slate-300 font-medium">
                    {Math.round(city.overallScore)}/100
                  </span>
                </p>
              )}
            </div>
          ) : null}

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors ml-4 mt-0.5 shrink-0"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M15 5L5 15M5 5l10 10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto panel-scroll p-5 space-y-6">
          {loading && (
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-32 bg-slate-700 rounded animate-pulse" />
                  <div className="h-3 w-full bg-slate-700/60 rounded animate-pulse" />
                  <div className="h-3 w-3/4 bg-slate-700/40 rounded animate-pulse" />
                </div>
              ))}
            </div>
          )}

          {!loading && city && (
            <>
              {city.summary && (
                <p className="text-sm text-slate-400 leading-relaxed">{city.summary}</p>
              )}

              {/* Cost categories */}
              {city.costCategories.map((cat) => (
                <div key={cat.id}>
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                    {cat.label}
                  </h3>
                  <div className="space-y-2">
                    {cat.items.slice(0, 8).map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center py-1.5 border-b border-slate-800/80 last:border-0"
                      >
                        <span className="text-sm text-slate-300 pr-4 leading-tight">
                          {item.label}
                        </span>
                        <span className="text-sm font-medium text-white shrink-0">
                          {fmt(item.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Quality scores */}
              {city.qualityScores.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                    Quality of Life
                  </h3>
                  <div className="space-y-2.5">
                    {city.qualityScores.map((s) => (
                      <div key={s.name}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-300">{s.name}</span>
                          <span style={{ color: s.color }}>{s.score}</span>
                        </div>
                        <ScoreBar score={s.score} color={s.color} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-5 py-3 border-t border-slate-700/50">
          <p className="text-xs text-slate-600">
            Data:{' '}
            <a
              href="https://developers.teleport.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-slate-400 transition-colors"
            >
              Teleport API
            </a>
            {' · '}Updated weekly
          </p>
        </div>
      </div>
    </div>
  );
}
