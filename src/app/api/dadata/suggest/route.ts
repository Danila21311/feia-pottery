import { NextRequest, NextResponse } from 'next/server';
import { fetchWithTimeoutRetry } from '@/app/api/_lib/http';

interface DadataSuggestion {
  value: string;
  unrestricted_value: string;
}

export async function POST(request: NextRequest) {
  try {
    const token = process.env.DADATA_API_KEY;
    const secret = process.env.DADATA_SECRET_KEY;

    if (!token) {
      return NextResponse.json({ error: 'DADATA_API_KEY is missing' }, { status: 500 });
    }

    const { query, type } = await request.json();
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ suggestions: [] });
    }

    const endpoint =
      type === 'city'
        ? 'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address'
        : 'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address';

    const body =
      type === 'city'
        ? {
            query,
            from_bound: { value: 'city' },
            to_bound: { value: 'city' },
            count: 7,
          }
        : {
            query,
            count: 7,
          };

    const response = await fetchWithTimeoutRetry(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Token ${token}`,
        ...(secret ? { 'X-Secret': secret } : {}),
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    }, { timeoutMs: 9000, retries: 2, retryDelayMs: 350 });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json({ error: text }, { status: response.status });
    }

    const data = await response.json();
    const suggestions = ((data?.suggestions ?? []) as DadataSuggestion[]).map((item) => ({
      value: item.value,
      unrestrictedValue: item.unrestricted_value,
    }));

    return NextResponse.json({ suggestions });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected error' },
      { status: 500 }
    );
  }
}
