'use client';

import { City } from '@/lib/types';
import { Lang, Currency, formatMoney, tr, cityName, countryName } from '@/lib/i18n';

interface Props {
  city: City | null;
  lang: Lang;
  currency: Currency;
  onClose: () => void;
}

function costTier(score: number, lang: Lang): { label: string; color: string } {
  if (score >= 8) return { label: tr('veryAffordable', lang), color: '#4ade80' };
  if (score >= 6) return { label: tr('affordable', lang), color: '#a3e635' };
  if (score >= 4) return { label: tr('moderate', lang), color: '#facc15' };
  if (score >= 2) return { label: tr('expensive', lang), color: '#fb923c' };
  return { label: tr('veryExpensive', lang), color: '#f87171' };
}

interface Row {
  label: string;
  value: number;
  note?: string;
}

export default function CityPanel({ city, lang, currency, onClose }: Props) {
  const visible = city !== null;
  const tier = city ? costTier(city.costScore, lang) : null;

  const housing: Row[] = city?.costs ? [
    { label: tr('rent1br', lang), value: city.costs.rent1br, note: tr('monthly', lang) },
    { label: tr('rent3br', lang), value: city.costs.rent3br, note: tr('monthly', lang) },
  ] : [];

  const food: Row[] = city?.costs ? [
    { label: tr('meal', lang), value: city.costs.meal },
    { label: tr('mealMid', lang), value: city.costs.mealMid },
    { label: tr('groceries', lang), value: city.costs.groceries },
  ] : [];

  const transport: Row[] = city?.costs ? [
    { label: tr('transportPass', lang), value: city.costs.transport },
  ] : [];

  const utilities: Row[] = city?.costs ? [
    { label: tr('utilitiesItem', lang), value: city.costs.utilities, note: tr('monthly85', lang) },
    { label: tr('internet', lang), value: city.costs.internet, note: tr('monthly', lang) },
  ] : [];

  const income: Row[] = city?.costs ? [
    { label: tr('salary', lang), value: city.costs.salary },
  ] : [];

  // Monthly cost per person: rent + utilities + internet + transport + groceries + 6 meals out
  const monthlySpend = city?.costs
    ? city.costs.rent1br
      + city.costs.utilities
      + city.costs.internet
      + city.costs.transport
      + city.costs.groceries
      + city.costs.meal * 6
    : null;

  const salaryRatio = monthlySpend !== null && city?.costs && city.costs.salary > 0
    ? Math.round((monthlySpend / city.costs.salary) * 100)
    : null;

  const remaining = monthlySpend !== null && city?.costs
    ? city.costs.salary - monthlySpend
    : null;

  return (
    <div
      className={`fixed right-0 top-0 h-full w-full sm:w-[420px] z-20 transition-transform duration-300 ease-out ${
        visible ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="h-full bg-slate-950/95 backdrop-blur-xl border-l border-slate-800/80 flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.6)]">
        <div className="flex items-start justify-between p-5 border-b border-slate-800/80 shrink-0">
          {city && tier && (
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl font-bold text-white leading-tight truncate">
                {cityName(city.slug, city.name, lang)}
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">{countryName(city.country, lang)}</p>
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
                  {tr('qualityOfLife', lang)}{' '}
                  <span className="text-slate-300 font-semibold">{Math.round(city.overallScore)}</span>
                  /100
                </span>
              </div>
            </div>
          )}

          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors ml-3 shrink-0 p-1.5 -m-1.5 rounded hover:bg-slate-800/50"
            aria-label={tr('close', lang)}
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto panel-scroll p-5 space-y-7">
          {!city?.costs && city && (
            <div className="text-sm text-slate-500 leading-relaxed">
              {tr('noData', lang)(cityName(city.slug, city.name, lang))}
            </div>
          )}

          {city?.costs && (
            <>
              {monthlySpend !== null && salaryRatio !== null && remaining !== null && (
                <div className="bg-gradient-to-br from-blue-950/60 to-slate-900/60 border border-blue-900/40 rounded-xl p-4">
                  <div className="text-xs text-blue-300/80 uppercase tracking-wider font-semibold mb-2">
                    {tr('monthlySpendTitle', lang)}
                  </div>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-3xl font-bold text-white tabular-nums">
                      {formatMoney(monthlySpend, currency, lang)}
                    </span>
                    <span className="text-xs text-slate-500">/ {tr('monthly', lang)}</span>
                  </div>

                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, salaryRatio)}%`,
                        background:
                          salaryRatio < 60
                            ? 'linear-gradient(90deg,#4ade80,#a3e635)'
                            : salaryRatio < 90
                            ? 'linear-gradient(90deg,#facc15,#fb923c)'
                            : 'linear-gradient(90deg,#fb923c,#f87171)',
                      }}
                    />
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">
                      <span className="text-white font-semibold tabular-nums">{salaryRatio}%</span>{' '}
                      {tr('ofSalary', lang)}
                    </span>
                    <span className="text-slate-400">
                      <span
                        className={`font-semibold tabular-nums ${
                          remaining > 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {remaining > 0 ? '+' : ''}{formatMoney(remaining, currency, lang)}
                      </span>{' '}
                      {tr('afterExpenses', lang)}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed mt-3 pt-3 border-t border-slate-800/60">
                    {tr('monthlySpendIncludes', lang)}
                  </p>
                </div>
              )}

              <Section title={tr('housing', lang)} rows={housing} currency={currency} lang={lang} />
              <Section title={tr('food', lang)} rows={food} currency={currency} lang={lang} />
              <Section title={tr('transport', lang)} rows={transport} currency={currency} lang={lang} />
              <Section title={tr('utilitiesTitle', lang)} rows={utilities} currency={currency} lang={lang} />
              <Section title={tr('income', lang)} rows={income} currency={currency} lang={lang} highlight />
            </>
          )}
        </div>

        <div className="shrink-0 px-5 py-3 border-t border-slate-800/80">
          <p className="text-[11px] text-slate-600 leading-relaxed">{tr('pricesNote', lang)}</p>
        </div>
      </div>
    </div>
  );
}

function Section({
  title, rows, currency, lang, highlight,
}: {
  title: string;
  rows: Row[];
  currency: Currency;
  lang: Lang;
  highlight?: boolean;
}) {
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
              {formatMoney(r.value, currency, lang)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
