import { NextRequest, NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { fetchCityDetail } from '@/lib/teleport';

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } },
) {
  const { slug } = params;

  const getCity = unstable_cache(
    () => fetchCityDetail(slug),
    [`city-${slug}`],
    { revalidate: 86400 * 7, tags: ['teleport'] },
  );

  try {
    const city = await getCity();
    if (!city) {
      return NextResponse.json({ error: 'City not found' }, { status: 404 });
    }
    return NextResponse.json(city, {
      headers: { 'Cache-Control': 'public, s-maxage=604800, stale-while-revalidate=86400' },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch city' }, { status: 500 });
  }
}
