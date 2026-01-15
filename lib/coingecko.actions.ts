'use server';

import qs from 'query-string';

const BASE_URL = process.env.COINGECKO_BASE_URL;
const API_KEY = process.env.COINGECKO_API_KEY;

if (!BASE_URL) throw new Error('Could not get base url');

export async function fetcher<T>(
  endpoint: string,
  params?: QueryParams,
  revalidate = 60,
): Promise<T> {
  const queryParams = API_KEY 
    ? { ...params, x_cg_demo_api_key: API_KEY }
    : params;

  const url = qs.stringifyUrl(
    {
      url: `${BASE_URL}/${endpoint}`,
      query: queryParams,
    },
    { skipEmptyString: true, skipNull: true },
  );

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    } as Record<string, string>,
    next: { revalidate },
  });

  if (!response.ok) {
    let errorBody: any = {};
    let errorText = '';
    
    try {
      errorText = await response.text();
      errorBody = JSON.parse(errorText);
    } catch (e) {
      errorBody = { error: errorText || response.statusText };
    }

    // Better error logging
    const safeUrl = API_KEY ? url.replace(API_KEY, '***') : url;
    console.error('CoinGecko API Error:', {
      status: response.status,
      statusText: response.statusText,
      endpoint,
      url: safeUrl,
      errorBody: JSON.stringify(errorBody, null, 2),
    });

    // Extract error message from various possible formats
    const errorMessage = 
      errorBody?.error || 
      errorBody?.status?.error_message || 
      errorBody?.message ||
      JSON.stringify(errorBody) ||
      response.statusText;

    throw new Error(`API Error: ${response.status}: ${errorMessage}`);
  }

  return response.json();
}

export async function getPools(
  id: string,
  network?: string | null,
  contractAddress?: string | null,
): Promise<PoolData> {
  const fallback: PoolData = {
    id: '',
    address: '',
    name: '',
    network: '',
  };

  if (network && contractAddress) {
    try {
      const poolData = await fetcher<{ data: PoolData[] }>(
        `onchain/networks/${network}/tokens/${contractAddress}/pools`,
      );

      return poolData.data?.[0] ?? fallback;
    } catch (error) {
      console.log(error);
      return fallback;
    }
  }

  try {
    const poolData = await fetcher<{ data: PoolData[] }>('onchain/search/pools', { query: id });

    return poolData.data?.[0] ?? fallback;
  } catch {
    return fallback;
  }
}