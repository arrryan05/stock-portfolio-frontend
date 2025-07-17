export interface Stock {
  name: string;
  symbol: string;
  purchasePrice: number;
  qty: number;
  exchange: 'NSE' | 'BSE' | 'NASDAQ' | 'NYSE';
  sector: string;
}


export interface TableData {
  name: string;            
  symbol: string;          
  purchasePrice: number;
  qty: number;
  investment: number;
  portfolioPct: number;
  exchange: string;
  sector: string ;
  cmp?: number;            
  presentValue?: number;
  gainLoss?: number;
  peRatio?: number;
  latestEarnings?: number;
}