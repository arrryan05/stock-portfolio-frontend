import axios from 'axios';
import { retry } from './retry';
import { Stock } from '@/types/stock';
import { Quote } from '@/types/quote';
import { Fundamentals } from '@/types/fundamentals';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;

export function fetchPortfolio(): Promise<Stock[]> {
  return retry(() =>
    axios.get<Stock[]>(`${API_BASE}/api/portfolio`).then((r) => r.data)
  );
}

export function fetchQuotes(symbols: string[]): Promise<Quote[]> {
  return retry(() =>
    axios
      .get<Quote[]>(`${API_BASE}/api/quote`, { params: { symbols: symbols.join(',') } })
      .then((r) => r.data)
  );
}

export function fetchFundamentals(symbol: string): Promise<Fundamentals> {
  return retry(() =>
    axios.get<Fundamentals>(`${API_BASE}/api/fundamentals/${symbol}`).then((r) => r.data)
  );
}
