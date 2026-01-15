'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';
import { CoinOverviewFallback } from './fallback';
import CandlestickChart from '@/components/CandlestickChart';

const CoinOverview = () => {
  const [coin, setCoin] = useState<CoinDetailsData | null>(null);
  const [coinOHLCData, setCoinOHLCData] = useState<OHLCData[] | null>(null);
  const [liveInterval, setLiveInterval] = useState<'1s' | '1m'>('1s');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/coin-overview');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setCoin(data.coin);
        setCoinOHLCData(data.ohlcData);
      } catch (err) {
        console.error('Error fetching coin overview:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading || !coin || !coinOHLCData) return <CoinOverviewFallback />;
  if (error) return <CoinOverviewFallback />;

  return (
    <div id="coin-overview">
      <CandlestickChart 
        data={coinOHLCData} 
        coinId="bitcoin" 
        liveInterval={liveInterval} 
        setLiveInterval={setLiveInterval}
      >
        <div className="header pt-2">
          <Image src={coin.image.large} alt={coin.name} width={56} height={56} />
          <div className="info">
            <p>
              {coin.name} / {coin.symbol.toUpperCase()}
            </p>
            <h1>{formatCurrency(coin.market_data.current_price.usd)}</h1>
          </div>
        </div>
      </CandlestickChart>
    </div>
  );
};

export default CoinOverview;