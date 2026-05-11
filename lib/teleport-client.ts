import { CostCategory, QualityScore } from './types';

const BASE = 'https://api.teleport.org/api';
const TIMEOUT_MS = 6000;

function scoreColor(s: number): string {
  if (s >= 7) return '#22c55e';
  if (s >= 5) return '#eab308';
  if (s >= 3) return '#f97316';
  return '#ef4444';
}

async function fetchWithTimeout(url: string, ms: number): Promise<any | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export interface EnrichedData {
  summary: string;
  qualityScores: QualityScore[];
  costCategories: CostCategory[];
}

export async function fetchCityEnrichment(slug: string): Promise<EnrichedData | null> {
  const href = `${BASE}/urban_areas/slug:${slug}/`;
  const [scores, details] = await Promise.all([
    fetchWithTimeout(`${href}scores/`, TIMEOUT_MS),
    fetchWithTimeout(`${href}details/`, TIMEOUT_MS),
  ]);

  if (!scores && !details) return null;

  const qualityScores: QualityScore[] =
    scores?.categories?.map((c: { name: string; score_out_of_10: number }) => ({
      name: c.name,
      score: Math.round(c.score_out_of_10 * 10) / 10,
      color: scoreColor(c.score_out_of_10),
    })) ?? [];

  const wantedCats = new Set(['COST-OF-LIVING', 'HOUSING', 'COMMUTE']);
  const costCategories: CostCategory[] =
    details?.categories
      ?.filter((c: { id: string }) => wantedCats.has(c.id))
      .map((c: { id: string; label: string; data: { id: string; label: string; currency_dollar_value?: number; type: string }[] }) => ({
        id: c.id,
        label: c.label,
        items: c.data
          .filter((item) => item.type === 'currency' && item.currency_dollar_value != null)
          .map((item) => ({ id: item.id, label: item.label, value: item.currency_dollar_value ?? null })),
      }))
      .filter((c: CostCategory) => c.items.length > 0) ?? [];

  const rawSummary: string = scores?.summary ?? '';
  const summary = rawSummary.replace(/<[^>]*>/g, '').trim().slice(0, 350);

  return { summary, qualityScores, costCategories };
}
