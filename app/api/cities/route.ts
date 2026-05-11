import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { fetchAllCities } from '@/lib/teleport';

const getCities = unstable_cache(fetchAllCities, ['cities'], {
  revalidate: 86400 * 7,
  tags: ['teleport'],
});

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cities = await getCities();
    return NextResponse.json(cities, {
      headers: { 'Cache-Control': 'public, s-maxage=604800, stale-while-revalidate=86400' },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch cities' }, { status: 500 });
  }
}
