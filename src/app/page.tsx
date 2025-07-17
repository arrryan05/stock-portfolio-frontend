'use client';

import React, { useEffect, useState } from 'react';
import {
  fetchPortfolio,
  fetchQuotes,
  fetchFundamentals,
} from '@/lib/api';
import { Stock, TableData } from '@/types/stock';
import GroupedPortfolioTable, {
  SectorGroup,
} from '@/components/GroupedPortfolioTable';

export default function HomePage() {
  const [portfolio, setPortfolio] = useState<Stock[]>([]);
  const [tableData, setTableData] = useState<TableData[]>([]);
  const [loading, setLoading] = useState(true);

  // 1) Load & seed
  useEffect(() => {
    fetchPortfolio()
      .then((stocks) => {
        setPortfolio(stocks);
        // initial zeroed tableData...
        const totalInv = stocks.reduce((sum, s) => sum + s.purchasePrice * s.qty, 0);
        const initial = stocks.map((s) => ({
          name: s.name,
          symbol: s.symbol,
          purchasePrice: s.purchasePrice,
          qty: s.qty,
          investment: s.purchasePrice * s.qty,
          portfolioPct: (s.purchasePrice * s.qty) / totalInv * 100,
          exchange: s.exchange,
          cmp: 0,
          presentValue: 0,
          gainLoss: 0,
          peRatio: 0,
          latestEarnings: 0,
          sector: s.sector,
        }));
        setTableData(initial);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // 2) Poll live data
  useEffect(() => {
    if (!portfolio.length) return;
    let canceled = false;

    const updateLive = async () => {
      const symbols = portfolio.map((s) => s.symbol);
      try {
        const [quotes, fundamentalsArr] = await Promise.all([
          fetchQuotes(symbols),
          Promise.all(symbols.map((sym) => fetchFundamentals(sym))),
        ]);
        if (canceled) return;

        const quoteMap = Object.fromEntries(quotes.map((q) => [q.symbol, q.cmp]));
        const fundMap = Object.fromEntries(fundamentalsArr.map((f) => [f.symbol, f]));

        const totalInv = portfolio.reduce((sum, s) => sum + s.purchasePrice * s.qty, 0);

        const updated = portfolio.map((s) => {
          const investment = s.purchasePrice * s.qty;
          const cmp = quoteMap[s.symbol] ?? 0;
          const presentValue = cmp * s.qty;
          const gainLoss = presentValue - investment;
          const { peRatio, latestEarnings } = fundMap[s.symbol] || { peRatio: 0, latestEarnings: 0 };

          return {
            name: s.name,
            symbol: s.symbol,
            purchasePrice: s.purchasePrice,
            qty: s.qty,
            investment,
            portfolioPct: (investment / totalInv) * 100,
            exchange: s.exchange,
            cmp,
            presentValue,
            gainLoss,
            peRatio,
            latestEarnings,
            sector: s.sector,
          };
        });

        console.log('Quote Map:', quoteMap);
        console.log('Fundamentals Map:', fundMap);

        setTableData(updated);
      } catch (err) {
        console.error('Live update error:', err);
      }
    };

    updateLive();
    const iv = setInterval(updateLive, 15_000);
    return () => {
      canceled = true;
      clearInterval(iv);
    };
  }, [portfolio]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading portfolio…</p>
      </div>
    );
  }

  // 3) Group by sector
  const sectorGroups: SectorGroup[] = [];

  tableData.forEach((row) => {
    const sectorName = row.sector ?? 'Uncategorized'; // handle potential undefined sector

    let group = sectorGroups.find((g) => g.sector === sectorName);
    if (!group) {
      group = {
        sector: sectorName,
        rows: [],
        totals: { investment: 0, presentValue: 0, gainLoss: 0 },
      };
      sectorGroups.push(group);
    }

    group.rows.push(row);
    group.totals.investment += row.investment ?? 0;
    group.totals.presentValue += row.presentValue ?? 0;
    group.totals.gainLoss += row.gainLoss ?? 0;
  });


  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">
        Portfolio Holdings by Sector
      </h1>
      <GroupedPortfolioTable groups={sectorGroups} />
    </main>
  );
}
