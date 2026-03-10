# SmartMarket AI - Backend API Documentation

This document describes the FastAPI backend endpoints for the SmartMarket AI application.

**Base URL:** `http://localhost:8000`

---

## Table of Contents

1. [Health Check](#1-get-health)
2. [Get News](#2-get-newsticker)
3. [Get Sentiment](#3-get-sentimentticker)
4. [Get Technical](#4-get-technicalticker)
5. [Get Prediction](#5-get-predictticker)
6. [Get Research](#6-get-researchticker)
7. [Scan Market](#7-post-scan)
8. [Get Index](#8-get-index)

---

## 1. GET /health

Health-check endpoint to verify the server is running and the model is loaded.

### Query Parameters

None.

### Example Request

```bash
curl http://localhost:8000/health
```

```python
import requests
r = requests.get("http://localhost:8000/health")
print(r.json())
```

### Response Output

```json
{
  "status": "ok",
  "model_loaded": true
}
```

---

## 2. GET /news/{ticker}

Fetch raw company-specific and macro RSS news for a ticker.

### Path Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `ticker` | string | NSE symbol with `.NS` suffix | `RELIANCE.NS`, `TCS.NS` |

### Example Request

```bash
curl http://localhost:8000/news/RELIANCE.NS
```

```python
import requests
r = requests.get("http://localhost:8000/news/RELIANCE.NS")
print(r.json())
```

### Response Output

```json
{
  "ticker": "RELIANCE.NS",
  "company_news": [
    { "title": "string", "link": "string" },
    ...
  ],
  "macro_news": [
    { "title": "string", "link": "string" },
    ...
  ]
}
```

---

## 3. GET /sentiment/{ticker}

Compute weighted FinBERT sentiment for a ticker.
- Formula: `(company_sentiment × 0.7) + (macro_sentiment × 0.3)`

### Path Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `ticker` | string | NSE symbol with `.NS` suffix | `TCS.NS` |

### Example Request

```bash
curl http://localhost:8000/sentiment/TCS.NS
```

```python
import requests
r = requests.get("http://localhost:8000/sentiment/TCS.NS")
print(r.json())
```

### Response Output

```json
{
  "ticker": "TCS.NS",
  "company_sentiment": 0.12,
  "macro_sentiment": -0.05,
  "weighted_sentiment": 0.07
}
```

---

## 4. GET /technical/{ticker}

Return the latest technical indicators for a ticker.

### Path Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `ticker` | string | NSE symbol with `.NS` suffix | `INFY.NS` |

### Example Request

```bash
curl http://localhost:8000/technical/INFY.NS
```

```python
import requests
r = requests.get("http://localhost:8000/technical/INFY.NS")
print(r.json())
```

### Response Output

```json
{
  "ticker": "INFY.NS",
  "close": 1452.3,
  "rsi": 58.2,
  "macd": 12.1,
  "macd_signal": 10.5,
  "ma50": 1420.0,
  "ma200": 1380.0,
  "volume_ma": 8200000,
  "daily_return": 0.0034,
  "trend": "UPTREND"
}
```

### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `close` | float | Latest closing price |
| `rsi` | float | Relative Strength Index (14-period) |
| `macd` | float | MACD line value |
| `macd_signal` | float | MACD signal line |
| `ma50` | float | 50-day moving average |
| `ma200` | float | 200-day moving average |
| `volume_ma` | float | Average trading volume |
| `daily_return` | float | Daily return percentage |
| `trend` | string | `"UPTREND"` or `"DOWNTREND"` based on MA50 vs MA200 |

---

## 5. GET /predict/{ticker}

Run the RandomForest ML model and return a bullish probability combined with live FinBERT sentiment.

### Path Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `ticker` | string | NSE symbol with `.NS` suffix | `HDFCBANK.NS` |

### Example Request

```bash
curl http://localhost:8000/predict/HDFCBANK.NS
```

```python
import requests
r = requests.get("http://localhost:8000/predict/HDFCBANK.NS")
print(r.json())
```

### Response Output

```json
{
  "ticker": "HDFCBANK.NS",
  "bullish_probability": 0.72,
  "signal": "BULLISH SWING",
  "weighted_sentiment": 0.08
}
```

### Signal Values

| Probability | Signal |
|-------------|--------|
| `> 0.6` | `BULLISH SWING` |
| `0.4 - 0.6` | `SIDEWAYS` |
| `< 0.4` | `BEARISH SWING` |

---

## 6. GET /research/{ticker}

Full deep-research report for a single stock: technicals + FinBERT news sentiment + ML signal + swing-trade plan.

### Path Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `ticker` | string | NSE symbol with `.NS` suffix | `SBIN.NS` |

### Example Request

```bash
curl http://localhost:8000/research/SBIN.NS
```

```python
import requests
r = requests.get("http://localhost:8000/research/SBIN.NS")
print(r.json())
```

### Response Output

```json
{
  "ticker": "SBIN.NS",
  "technical": {
    "trend": "UPTREND",
    "rsi": 61.2,
    "volatility": "1.4%"
  },
  "news_analysis": {
    "company_specific": [
      { "title": "string", "snippet": "string", "link": "string" }
    ],
    "market_macro": [
      { "title": "string", "link": "string" }
    ]
  },
  "ai_probability": {
    "bullish_probability": "68.0%",
    "signal": "BULLISH SWING"
  },
  "swing_plan": {
    "entry": 812.5,
    "stoploss": 788.1,
    "target": 853.1
  }
}
```

### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `technical.trend` | string | Market trend direction |
| `technical.rsi` | float | RSI value |
| `technical.volatility` | string | Price volatility percentage (e.g., "1.4%") |
| `news_analysis.company_specific` | array | Company-specific news items |
| `news_analysis.market_macro` | array | Market/macro news items |
| `ai_probability.bullish_probability` | string | ML-predicted probability (e.g., "68.0%") |
| `ai_probability.signal` | string | Trading signal |
| `swing_plan.entry` | float | Recommended entry price |
| `swing_plan.stoploss` | float | Stop-loss price |
| `swing_plan.target` | float | Target price |

---

## 7. POST /scan

Scan an entire NSE index, rank all stocks by bullish probability, and return the top N bullish and bearish picks.

### Request Body (JSON)

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `index_name` | string | Yes | `NIFTY 50` | NSE index name (e.g., `NIFTY 50`, `NIFTY 100`, `NIFTY 500`) |
| `limit` | integer | No | `null` | Process only first N stocks (optional) |
| `top_n` | integer | No | `10` | Number of results to return per side |

### Example Request

```bash
curl -X POST http://localhost:8000/scan \
  -H "Content-Type: application/json" \
  -d '{"index_name": "NIFTY 50", "limit": 20, "top_n": 5}'
```

```python
import requests
payload = {
    "index_name": "NIFTY 50",
    "limit": 20,
    "top_n": 5
}
r = requests.post("http://localhost:8000/scan", json=payload)
print(r.json())
```

### Response Output

```json
{
  "scan_details": {
    "index": "NIFTY 50",
    "stocks_scanned": 48
  },
  "top_most_bullish_stocks": [
    { "stock": "RELIANCE.NS", "bullish_probability": "78%" },
    ...
  ],
  "top_most_bearish_stocks": [
    { "stock": "HDFCBANK.NS", "bearish_strength": "65%" },
    ...
  ]
}
```

### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `scan_details.index` | string | The index name scanned |
| `scan_details.stocks_scanned` | integer | Number of stocks successfully scanned |
| `top_most_bullish_stocks` | array | List of top bullish stocks |
| `top_most_bullish_stocks.stock` | string | Stock ticker symbol |
| `top_most_bullish_stocks.bullish_probability` | string | Bullish probability percentage (e.g., "78%") |
| `top_most_bearish_stocks` | array | List of top bearish stocks |
| `top_most_bearish_stocks.stock` | string | Stock ticker symbol |
| `top_most_bearish_stocks.bearish_strength` | string | Bearish strength percentage (e.g., "65%") |

---

## 8. GET /index

Return the list of ticker symbols in a given NSE index.

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `index_name` | string | No | `NIFTY 50` | NSE index name (URL-encode space as `%20` or `+`) |

### Example Request

```bash
curl "http://localhost:8000/index?index_name=NIFTY%2050"
```

```python
import requests
r = requests.get("http://localhost:8000/index", params={"index_name": "NIFTY 100"})
print(r.json())
```

### Response Output

```json
{
  "index": "NIFTY 50",
  "count": 50,
  "symbols": [
    "RELIANCE.NS",
    "TCS.NS",
    "HDFCBANK.NS",
    ...
  ]
}
```

---

## Common Error Responses

### 400 Bad Request
```json
{
  "detail": "Missing Origin header. CORS requests must specify an Origin."
}
```

### 422 Unprocessable Entity
```json
{
  "detail": "Not enough historical data for this ticker."
}
```

### 500 Internal Server Error
```json
{
  "detail": "Error message describing the issue"
}
```

---

## Notes

- All endpoints require an `Origin` or `Referer` header (CORS enforcement).
- Ticker symbols must include the `.NS` suffix (e.g., `RELIANCE.NS`, not `RELIANCE`).
- The backend uses FinBERT for sentiment analysis and RandomForest for price prediction.
- Technical indicators require at least 200 days of historical data.
