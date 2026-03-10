import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Origin': 'http://localhost:5173'
  }
});

/**
 * Health-check endpoint
 * @returns {Promise<{status: string, model_loaded: boolean}>}
 */
export const getHealth = () => api.get('/health');

/**
 * Get list of ticker symbols in a given NSE index
 * @param {string} [indexName='NIFTY 50']
 * @returns {Promise<{index: string, count: number, symbols: string[]}>}
 */
export const getIndex = (indexName = 'NIFTY 50') => 
  api.get('/index', { params: { index_name: indexName } });

/**
 * Scan an entire NSE index
 * @param {{index_name: string, limit?: number, top_n: number}} data
 * @returns {Promise<{scan_details: {index: string, stocks_scanned: number}, top_most_bullish_stocks: {stock: string, bullish_probability: string}[], top_most_bearish_stocks: {stock: string, bearish_strength: string}[]}>}
 */
export const scanMarket = (data) => api.post('/scan', data);

/**
 * Fetch raw company-specific and macro RSS news for a ticker
 * @param {string} ticker
 * @returns {Promise<{ticker: string, company_news: {title: string, link: string}[], macro_news: {title: string, link: string}[]}>}
 */
export const getNews = (ticker) => api.get(`/news/${ticker}`);

/**
 * Compute weighted FinBERT sentiment for a ticker
 * @param {string} ticker
 * @returns {Promise<{ticker: string, company_sentiment: number, macro_sentiment: number, weighted_sentiment: number}>}
 */
export const getSentiment = (ticker) => api.get(`/sentiment/${ticker}`);

/**
 * Return the latest technical indicators for a ticker
 * @param {string} ticker
 * @returns {Promise<{ticker: string, close: number, rsi: number, macd: number, macd_signal: number, ma50: number, ma200: number, volume_ma: number, daily_return: number, trend: string}>}
 */
export const getTechnical = (ticker) => api.get(`/technical/${ticker}`);

/**
 * Run the RandomForest ML model and return a bullish probability
 * @param {string} ticker
 * @returns {Promise<{ticker: string, bullish_probability: number, signal: string, weighted_sentiment: number}>}
 */
export const getPredict = (ticker) => api.get(`/predict/${ticker}`);

/**
 * Full deep-research report for a single stock
 * @param {string} ticker
 * @returns {Promise<{ticker: string, technical: {trend: string, rsi: number, volatility: string}, news_analysis: {company_specific: {title: string, snippet: string, link: string}[], market_macro: {title: string, link: string}[]}, ai_probability: {bullish_probability: string, signal: string}, swing_plan: {entry: number, stoploss: number, target: number}>}
 */
export const getResearch = (ticker) => api.get(`/research/${ticker}`);

/**
 * Format ticker symbol with .NS suffix
 * @param {string} symbol
 * @returns {string}
 */
export const formatTicker = (symbol) => {
  if (symbol.includes('.NS')) return symbol;
  return `${symbol}.NS`;
};

/**
 * Remove .NS suffix from ticker
 * @param {string} ticker
 * @returns {string}
 */
export const formatSymbol = (ticker) => {
  return ticker.replace('.NS', '');
};
