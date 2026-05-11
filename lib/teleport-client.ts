import { CityDetail, CostCategory, QualityScore } from './types';

const BASE = 'https://api.teleport.org/api';

function scoreColor(s: number): string {
  if (s >= 7) return '#22c55e';
  if (s >= 5) return '#eab308';
  if (s >= 3) return '#f97316';
  return '#ef4444';
}

export async function fetchCityDetailClient(
  slug: string,
  base: { name: string; country: string; lat: number; lng: number; costScore: number; overallScore: number },
): Promise<CityDetail | null> {
  try {
    const href = `${BASE}/urban_areas/slug:${slug}/`;
    const [scoresRes, detailsRes] = await Promise.allSettled([
      fetch(`${href}scores/`).then(r => r.ok ? r.json() : null),
      fetch(`${href}details/`).then(r => r.ok ? r.json() : null),
    ]);

    const scores = scoresRes.status === 'fulfilled' ? scoresRes.value : null;
    const details = detailsRes.status === 'fulfilled' ? detailsRes.value : null;

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
        })) ?? [];

    const rawSummary: string = scores?.summary ?? '';
    const summary = rawSummary.replace(/<[^>]*>/g, '').trim().slice(0, 350);

    return {
      ...base,
      slug,
      summary,
      qualityScores,
      costCategories,
    };
  } catch {
    return null;
  }
}
