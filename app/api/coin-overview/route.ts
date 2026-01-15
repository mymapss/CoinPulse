import { fetcher } from '@/lib/coingecko.actions';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [coin, ohlcData] = await Promise.all([
      fetcher<CoinDetailsData>('coins/bitcoin', {
        localization: false,
        tickers: false,
        market_data: true,
        community_data: false,
        developer_data: false,
        sparkline: false,
      }),
      fetcher<OHLCData[]>('coins/bitcoin/ohlc', {
        vs_currency: 'usd',
        days: '1',
      }),
    ]);

    return NextResponse.json({ coin, ohlcData });
  } catch (error) {
    console.error('Error fetching coin overview:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coin data' },
      { status: 500 }
    );
  }
}