'use client';

import { City } from '@/lib/types';

interface Props {
  city: City | null;
  onClose: () => void;
}

function fmt(value: number): string {
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

interface Row {
  label: string;
  value: number;
  note?: string;
}

export default function CityPanel({ city, onClose }: Props) {
  const visible = city !== null;
  const tier = city ? costTier(city.costScore) : null;

  const housing: Row[] = city?.costs ? [
    { label: 'Apartment (1 bedroom) in centre', value: city.costs.rent1br, note: 'monthly' },
    { label: 'Apartment (3 bedrooms) in centre', value: city.costs.rent3br, note: 'monthly' },
  ] : [];

  const food: Row[] = city?.costs ? [
    { label: 'Meal at inexpensive restaurant', value: city.costs.meal },
    { label: 'Dinner for 2 at mid-range restaurant', value: city.costs.mealMid },
    { label: 'Monthly groceries (single person)', value: city.costs.groceries },
  ] : [];

  const transport: Row[] = city?.costs ? [
    { label: 'Monthly public transport pass', value: city.costs.transport },
  ] : [];

  const utilities: Row[] = city?.costs ? [
    { label: 'Utilities (water, electricity, heating)', value: city.costs.utilities, note: 'monthly, 85m²' },
    { label: 'Internet (60+ Mbps unlimited)', value: city.costs.internet, note: 'monthly' },
  ] : [];

  const income: Row[] = city?.costs ? [
    { label: 'Average net monthly salary', value: city.costs.salary },
  ] : [];

  // Quick metric: months of rent on avg salary
  const affordabilityRatio = city?.costs && city.costs.salary > 0
    ? Math.round((city.costs.rent1br / city.costs.salary) * 100)
    : null;

  return (
    <div
      className={`fixed right-0 top-0 h-full w-full sm:w-[420px] z-20 transition-transform duration-300 ease-out ${
        visible ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="h-full bg-slate-950/95 backdrop-blur-xl border-l border-slate-800/80 flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.6)]">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-800/80 shrink-0">
          {city && tier && (
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl font-bold text-white leading-tight truncate">{city.name}</h2>
              <p className="text-sm text-slate-400 mt-0.5">{city.country}</p>
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <span
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    background: `${tier.color}1a`,
                    color: tier.color,
                    border: `1px solid ${tier.color}33`,
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: tier.color }} />
                  {tier.label}
                </span>
                <span className="text-xs text-slate-500">
                  Quality of life <span className="text-slate-300 font-semibold">{Math.round(city.overallScore)}</span>/100
                </span>
              </div>
            </div>
          )}

          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors ml-3 shrink-0 p-1.5 -m-1.5 rounded hover:bg-slate-800/50"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto panel-scroll p-5 space-y-7">
          {!city?.costs && city && (
            <div className="text-sm text-slate-500 leading-relaxed">
              Detailed pricing isn&apos;t available for {city.name} yet. The affordability score reflects the cached cost-of-living index.
            </div>
          )}

          {city?.costs && (
            <>
              {affordabilityRatio !== null && (
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                  <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">
                    Rent-to-income ratio
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-white tabular-nums">{affordabilityRatio}%</span>
                    <span className="text-xs text-slate-500">of avg salary goes to 1BR rent</span>
                  </div>
                </div>
              )}

              <Section title="Housing" rows={housing} />
              <Section title="Food & Groceries" rows={food} />
              <Section title="Transport" rows={transport} />
              <Section title="Utilities & Internet" rows={utilities} />
              <Section title="Income" rows={income} highlight />
            </>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-5 py-3 border-t border-slate-800/80">
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Prices in USD. Indicative averages — actual costs vary by neighborhood and lifestyle.
          </p>
        </div>
      </div>
    </div>
  );
}

function Section({ title, rows, highlight }: { title: string; rows: Row[]; highlight?: boolean }) {
  if (rows.length === 0) return null;
  return (
    <div>
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">{title}</h3>
      <div className="space-y-2.5">
        {rows.map((r, i) => (
          <div
            key={i}
            className={`flex justify-between items-baseline gap-3 py-1.5 ${
              i < rows.length - 1 ? 'border-b border-slate-800/60' : ''
            }`}
          >
            <div className="min-w-0">
              <div className="text-sm text-slate-300 leading-snug">{r.label}</div>
              {r.note && <div className="text-[11px] text-slate-600 mt-0.5">{r.note}</div>}
            </div>
            <span
              className={`text-sm font-semibold shrink-0 tabular-nums ${
                highlight ? 'text-emerald-400' : 'text-white'
              }`}
            >
              {fmt(r.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
