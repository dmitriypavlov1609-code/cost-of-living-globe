import { City, CityDetail, CostCategory, QualityScore } from './types';

const BASE = 'https://api.teleport.org/api';
const REVALIDATE = 86400 * 7; // 7 days

async function get(url: string) {
  const res = await fetch(url, { next: { revalidate: REVALIDATE } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

function slugFromHref(href: string): string {
  return href.match(/slug:([^/]+)/)?.[1] ?? '';
}

function scoreColor(score: number): string {
  if (score >= 7) return '#22c55e';
  if (score >= 5) return '#eab308';
  if (score >= 3) return '#f97316';
  return '#ef4444';
}

async function fetchCityBasic(href: string): Promise<City | null> {
  try {
    const [ua, scores] = await Promise.all([
      get(href),
      get(`${href}scores/`).catch(() => null),
    ]);

    const lat = ua.bounding_box?.latlon?.latitude;
    const lng = ua.bounding_box?.latlon?.longitude;
    if (!lat || !lng) return null;

    const parts = (ua.full_name || ua.name || '').split(', ');
    const country = parts[parts.length - 1] ?? '';

    const costScore =
      scores?.categories?.find((c: { name: string }) => c.name === 'Cost of Living')
        ?.score_out_of_10 ?? 5;
    const overallScore = scores?.teleport_city_score ?? 50;

    return {
      slug: slugFromHref(href),
      name: ua.name,
      lat,
      lng,
      country,
      costScore,
      overallScore,
    };
  } catch {
    return null;
  }
}

export async function fetchAllCities(): Promise<City[]> {
  const list = await get(`${BASE}/urban_areas/`);
  const hrefs: string[] = list._links['ua:item'].map((i: { href: string }) => i.href);

  const cities: City[] = [];
  const batchSize = 15;

  for (let i = 0; i < hrefs.length; i += batchSize) {
    const batch = hrefs.slice(i, i + batchSize);
    const results = await Promise.allSettled(batch.map(fetchCityBasic));
    results.forEach((r) => {
      if (r.status === 'fulfilled' && r.value) cities.push(r.value);
    });
  }

  return cities;
}

export async function fetchCityDetail(slug: string): Promise<CityDetail | null> {
  try {
    const href = `${BASE}/urban_areas/slug:${slug}/`;
    const [ua, scores, details] = await Promise.all([
      get(href),
      get(`${href}scores/`).catch(() => null),
      get(`${href}details/`).catch(() => null),
    ]);

    const lat = ua.bounding_box?.latlon?.latitude ?? 0;
    const lng = ua.bounding_box?.latlon?.longitude ?? 0;
    const parts = (ua.full_name || ua.name || '').split(', ');
    const country = parts[parts.length - 1] ?? '';

    const costScore =
      scores?.categories?.find((c: { name: string }) => c.name === 'Cost of Living')
        ?.score_out_of_10 ?? 5;
    const overallScore = scores?.teleport_city_score ?? 50;

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
            .map((item) => ({
              id: item.id,
              label: item.label,
              value: item.currency_dollar_value ?? null,
            })),
        })) ?? [];

    const rawSummary: string = scores?.summary ?? '';
    const summary = rawSummary.replace(/<[^>]*>/g, '').trim().slice(0, 350);

    return {
      slug,
      name: ua.name,
      lat,
      lng,
      country,
      costScore,
      overallScore,
      summary,
      qualityScores,
      costCategories,
    };
  } catch (e) {
    console.error('fetchCityDetail error:', e);
    return null;
  }
}
