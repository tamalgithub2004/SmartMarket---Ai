import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { Zap, Activity, Newspaper, ArrowUpRight, Search, Bell, User, ChevronLeft, Mail, Shield, CreditCard, TrendingUp, BarChart3, Loader2 } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { scanMarket, getTechnical, getPredict, getResearch, formatTicker, formatSymbol } from './services/api';

// --- COMPONENTS ---

const Dashboard = () => {
  const [stocks, setStocks] = useState([]);
  const [selected, setSelected] = useState(null);
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        setLoading(true);
        const response = await scanMarket({ index_name: 'NIFTY 50', top_n: 10 });
        const bullishStocks = response.data.top_most_bullish_stocks.map(s => ({
          symbol: formatSymbol(s.stock),
          prob: s.bullish_probability
        }));
        const bearishStocks = response.data.top_most_bearish_stocks.map(s => ({
          symbol: formatSymbol(s.stock),
          prob: `-${s.bearish_strength}`
        }));
        const allStocks = [...bullishStocks, ...bearishStocks];
        setStocks(allStocks);
        if (allStocks.length > 0) {
          setSelected(allStocks[0].symbol);
        }
      } catch (err) {
        console.error('Error fetching stocks:', err);
        setError('Failed to load stocks');
      } finally {
        setLoading(false);
      }
    };
    fetchStocks();
  }, []);

  useEffect(() => {
    const fetchStockData = async () => {
      if (!selected) return;
      try {
        setLoading(true);
        const ticker = formatTicker(selected);
        const [predictRes, techRes] = await Promise.all([
          getPredict(ticker),
          getTechnical(ticker)
        ]);
        
        const pred = predictRes.data;
        const tech = techRes.data;
        
        setStockData({
          symbol: selected,
          price: tech.close.toLocaleString('en-IN'),
          prob: `${Math.round(pred.bullish_probability * 100)}%`,
          color: pred.bullish_probability > 0.6 ? 'text-emerald-400' : pred.bullish_probability < 0.4 ? 'text-rose-400' : 'text-amber-400',
          rsi: tech.rsi,
          macd: tech.macd > tech.macd_signal ? 'Bullish' : tech.macd < tech.macd_signal ? 'Bearish' : 'Neutral',
          ma50: tech.ma50.toLocaleString('en-IN'),
          trend: tech.trend,
          signal: pred.signal,
          sentiment: pred.weighted_sentiment
        });
      } catch (err) {
        console.error('Error fetching stock data:', err);
        setError('Failed to load stock data');
      } finally {
        setLoading(false);
      }
    };
    fetchStockData();
  }, [selected]);

  if (loading && stocks.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (error && stocks.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <p className="text-rose-400 font-bold mb-2">{error}</p>
          <p className="text-slate-400 text-sm">Make sure the backend server is running on port 8000</p>
        </div>
      </div>
    );
  }

  const currentStock = stockData || { symbol: selected, price: '---', prob: '---', color: 'text-slate-400', rsi: '---', macd: '---', ma50: '---', trend: '---', signal: '---', sentiment: 0 };

  return (
    <div className="grid grid-cols-12 gap-6 p-6 max-w-[1600px] mx-auto">
      {/* Sidebar Scanner */}
      <aside className="col-span-12 lg:col-span-3 bg-[#161A1E] rounded-2xl border border-slate-800 p-5 shadow-2xl">
        <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-6 px-2">Live AI Scanner</h3>
        <div className="space-y-1">
          {stocks.map((s) => (
            <div key={s.symbol} onClick={() => setSelected(s.symbol)} 
              className={`flex justify-between items-center p-3 rounded-xl cursor-pointer transition-all ${selected === s.symbol ? 'bg-cyan-500/10 border border-cyan-500/30' : 'hover:bg-slate-800/50 border border-transparent'}`}>
              <span className="font-bold text-sm">{s.symbol}</span>
              <span className={`font-mono font-bold ${s.prob.startsWith('-') ? 'text-rose-400' : parseInt(s.prob) > 60 ? 'text-emerald-400' : 'text-amber-400'}`}>{s.prob}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Analytics */}
      <main className="col-span-12 lg:col-span-6 space-y-6">
        {loading && stocks.length > 0 ? (
          <div className="bg-[#161A1E] rounded-3xl border border-slate-800 p-8 shadow-2xl h-[500px] flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          </div>
        ) : (
        <div className="bg-[#161A1E] rounded-3xl border border-slate-800 p-8 shadow-2xl relative overflow-hidden">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h2 onClick={() => navigate(`/research/${currentStock.symbol}`)} className="hover:cursor-pointer text-4xl font-black italic">{currentStock.symbol}</h2>
              <span className="text-emerald-400 text-sm font-bold flex items-center gap-1 mt-1"><ArrowUpRight size={16}/> {currentStock.trend}</span>
            </div>
            <div className="text-right">
              <p className="text-4xl font-mono font-black">₹{currentStock.price}</p>
            </div>
          </div>

          <div className="bg-slate-900/50 rounded-2xl p-6 flex flex-col items-center justify-center mb-8 border border-slate-800">
             <div className="text-4xl font-black text-cyan-400 mb-1">{currentStock.prob}</div>
             <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Bullish Probability</p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="text-center"><p className="text-[10px] text-slate-500 font-bold uppercase">RSI (14)</p><p className={`font-bold ${Number(currentStock.rsi) > 70 ? 'text-rose-400' : Number(currentStock.rsi) > 50 ? 'text-cyan-400' : Number(currentStock.rsi) < 30 ? 'text-emerald-400' : 'text-amber-400'}`}>{currentStock.rsi}</p></div>
            <div className="text-center"><p className="text-[10px] text-slate-500 font-bold uppercase">MACD</p><p className={`font-bold ${currentStock.macd === 'Bullish' ? 'text-emerald-400' : currentStock.macd === 'Bearish' ? 'text-rose-400' : 'text-amber-400'}`}>{currentStock.macd}</p></div>
            <div className="text-center"><p className="text-[10px] text-slate-500 font-bold uppercase">MA50</p><p className="font-bold">₹{currentStock.ma50}</p></div>
          </div>

          <div className="h-40 w-full">
            <ResponsiveContainer><AreaChart data={stockData ? [
              {p: Number(stockData.price.replace(/,/g, '')) * 0.95},
              {p: Number(stockData.price.replace(/,/g, '')) * 0.97},
              {p: Number(stockData.price.replace(/,/g, '')) * 0.98},
              {p: Number(stockData.price.replace(/,/g, '')) * 0.99},
              {p: Number(stockData.price.replace(/,/g, '')) * 1.0},
              {p: Number(stockData.price.replace(/,/g, ''))}
            ] : []}><Area type="monotone" dataKey="p" stroke="#06B6D4" fill="rgba(6, 182, 212, 0.1)" strokeWidth={3} /></AreaChart></ResponsiveContainer>
          </div>
          
          <button onClick={() => navigate(`/research/${currentStock.symbol}`)} className="w-full mt-6 py-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400 font-bold text-sm hover:bg-cyan-500/20 transition-all flex items-center justify-center gap-2">
            <BarChart3 size={16} /> View Full Research
          </button>
        </div>
        )}
      </main>

      {/* News Stream */}
      <aside className="col-span-12 lg:col-span-3 bg-[#161A1E] rounded-2xl border border-slate-800 p-5 shadow-2xl h-fit">
        <h3 className="flex items-center gap-2 text-slate-500 font-black text-[10px] uppercase tracking-widest mb-6"><Newspaper size={14}/> Sentiment Stream</h3>
        <div className="space-y-6">
          <div className="border-l-2 border-emerald-500 pl-4"><p className="text-xs font-bold mb-1">SIGNAL</p><p className="text-[11px] text-slate-400 italic">{currentStock.signal}</p></div>
          <div className="border-l-2 border-cyan-500 pl-4"><p className="text-xs font-bold mb-1">SENTIMENT</p><p className="text-[11px] text-slate-400 italic">{currentStock.sentiment !== undefined && currentStock.sentiment !== null ? Number(currentStock.sentiment).toFixed(4) : '---'}</p></div>
        </div>
      </aside>
    </div>
  );
};

const ProfilePage = () => {
  const navigate = useNavigate();
  return (
    <div className="max-w-2xl mx-auto mt-10 p-8 bg-[#161A1E] rounded-3xl border border-slate-800 shadow-2xl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-cyan-400 text-sm font-bold mb-8 hover:opacity-70"><ChevronLeft size={16}/> Back to Dashboard</button>
      
      <div className="flex items-center gap-6 mb-10 pb-10 border-b border-slate-800">
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-3xl font-black">NF</div>
        <div>
          <h2 className="text-3xl font-black">Nida Fatma</h2>
          <p className="text-slate-500 font-medium">Pro Analyst Member</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-4 p-4 bg-slate-900 rounded-xl border border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer">
          <Mail className="text-cyan-400" size={20}/><div className="flex-1"><p className="text-[10px] text-slate-500 font-bold uppercase">Email</p><p className="font-bold">nida.fatma@example.com</p></div>
        </div>
        <div className="flex items-center gap-4 p-4 bg-slate-900 rounded-xl border border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer">
          <Shield className="text-cyan-400" size={20}/><div className="flex-1"><p className="text-[10px] text-slate-500 font-bold uppercase">Account Status</p><p className="font-bold text-emerald-400">Verified Professional</p></div>
        </div>
        <div className="flex items-center gap-4 p-4 bg-slate-900 rounded-xl border border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer">
          <CreditCard className="text-cyan-400" size={20}/><div className="flex-1"><p className="text-[10px] text-slate-500 font-bold uppercase">Subscription</p><p className="font-bold">Enterprise AI Plan</p></div>
        </div>
      </div>
    </div>
  );
};

const ResearchPage = () => {
  const { stockName } = useParams();
  const navigate = useNavigate();
  const [researchData, setResearchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResearch = async () => {
      if (!stockName) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const ticker = formatTicker(stockName.toUpperCase());
        console.log('Fetching research for:', ticker);
        const response = await getResearch(ticker);
        console.log('Research response:', response.data);
        setResearchData(response.data);
      } catch (err) {
        console.error('Error fetching research:', err);
        const errorMessage = err.response?.data?.detail || err.message || 'Failed to load research data';
        setError(errorMessage);
        setResearchData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchResearch();
  }, [stockName]);

  console.log('ResearchPage state:', { loading, error, researchData });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0E11] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0B0E11] p-6">
        <div className="max-w-2xl mx-auto mt-10 p-8 bg-[#161A1E] rounded-3xl border border-slate-800 shadow-2xl text-center">
          <h2 className="text-2xl font-black text-rose-400 mb-4">Error</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <button onClick={() => navigate('/')} className="text-cyan-400 font-bold hover:underline">← Back to Dashboard</button>
        </div>
      </div>
    );
  }

  if (!researchData) {
    return (
      <div className="min-h-screen bg-[#0B0E11] p-6">
        <div className="max-w-2xl mx-auto mt-10 p-8 bg-[#161A1E] rounded-3xl border border-slate-800 shadow-2xl text-center">
          <h2 className="text-2xl font-black text-rose-400 mb-4">Stock Not Found</h2>
          <p className="text-slate-400 mb-6">The stock "{stockName}" is not available.</p>
          <button onClick={() => navigate('/')} className="text-cyan-400 font-bold hover:underline">← Back to Dashboard</button>
        </div>
      </div>
    );
  }

  const technical = researchData?.technical || {};
  const news_analysis = researchData?.news_analysis || {};
  const ai_probability = researchData?.ai_probability || {};
  const swing_plan = researchData?.swing_plan || {};

  return (
    <div className="min-h-screen bg-[#0B0E11] p-6">
      <div className="max-w-[1600px] mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-cyan-400 text-sm font-bold mb-2 hover:opacity-70">
          <ChevronLeft size={16}/> Back
        </button>

        <main className="col-span-12 lg:col-span-8 space-y-6">
        <div className="bg-[#161A1E] rounded-3xl border border-slate-800 p-8 shadow-2xl">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-4xl font-black italic">{stockName.toUpperCase()}</h2>
              <span className="text-emerald-400 text-sm font-bold flex items-center gap-1 mt-1"><ArrowUpRight size={16}/> {technical?.trend}</span>
            </div>
          </div>

          <div className="bg-slate-900/50 rounded-2xl p-6 flex flex-col items-center justify-center mb-8 border border-slate-800">
             <div className="text-4xl font-black text-cyan-400 mb-1">{ai_probability?.bullish_probability}</div>
             <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Bullish Probability</p>
          </div>

          <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-4">Technical Analysis</h3>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="text-center p-4 bg-slate-900 rounded-xl border border-slate-800">
              <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">RSI (14)</p>
              <p className={`text-2xl font-bold ${Number(technical?.rsi) > 70 ? 'text-rose-400' : Number(technical?.rsi) > 50 ? 'text-cyan-400' : Number(technical?.rsi) < 30 ? 'text-emerald-400' : 'text-amber-400'}`}>{technical?.rsi}</p>
              <p className="text-[10px] text-slate-500 mt-1">{Number(technical?.rsi) > 70 ? 'Overbought' : Number(technical?.rsi) < 30 ? 'Oversold' : 'Neutral'}</p>
            </div>
            <div className="text-center p-4 bg-slate-900 rounded-xl border border-slate-800">
              <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">Volatility</p>
              <p className="text-2xl font-bold text-amber-400">{technical?.volatility}</p>
              <p className="text-[10px] text-slate-500 mt-1">Price Volatility</p>
            </div>
            <div className="text-center p-4 bg-slate-900 rounded-xl border border-slate-800">
              <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">Signal</p>
              <p className={`text-2xl font-bold ${ai_probability?.signal === 'BULLISH SWING' ? 'text-emerald-400' : ai_probability?.signal === 'BEARISH SWING' ? 'text-rose-400' : 'text-amber-400'}`}>{ai_probability?.signal}</p>
              <p className="text-[10px] text-slate-500 mt-1">AI Signal</p>
            </div>
          </div>

          <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-4">Swing Trade Plan</h3>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="text-center p-4 bg-slate-900 rounded-xl border border-cyan-500/30">
              <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">Entry</p>
              <p className="text-2xl font-bold text-cyan-400">₹{swing_plan?.entry}</p>
            </div>
            <div className="text-center p-4 bg-slate-900 rounded-xl border border-rose-500/30">
              <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">Stoploss</p>
              <p className="text-2xl font-bold text-rose-400">₹{swing_plan?.stoploss}</p>
            </div>
            <div className="text-center p-4 bg-slate-900 rounded-xl border border-emerald-500/30">
              <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">Target</p>
              <p className="text-2xl font-bold text-emerald-400">₹{swing_plan?.target}</p>
            </div>
          </div>
        </div>
      </main>

      <aside className="col-span-12 lg:col-span-4 space-y-6">
        <div className="bg-[#161A1E] rounded-2xl border border-slate-800 p-5 shadow-2xl">
          <h3 className="flex items-center gap-2 text-slate-500 font-black text-[10px] uppercase tracking-widest mb-6"><TrendingUp size={14}/> Key Levels</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-slate-900 rounded-xl">
              <span className="text-slate-400 text-sm">Support 1</span>
              <span className="text-emerald-400 font-bold">₹{Math.round(swing_plan?.entry * 0.95)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-900 rounded-xl">
              <span className="text-slate-400 text-sm">Support 2</span>
              <span className="text-emerald-400 font-bold">₹{swing_plan?.stoploss}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-900 rounded-xl">
              <span className="text-slate-400 text-sm">Resistance 1</span>
              <span className="text-rose-400 font-bold">₹{swing_plan?.target}</span>
            </div>
          </div>
        </div>

        <div className="bg-[#161A1E] rounded-2xl border border-slate-800 p-5 shadow-2xl h-fit">
          <h3 className="flex items-center gap-2 text-slate-500 font-black text-[10px] uppercase tracking-widest mb-6"><Newspaper size={14}/> Sentiment Stream</h3>
          <div className="space-y-4">
            {news_analysis?.company_specific?.slice(0, 3).map((news, idx) => (
              <div key={idx} className="border-l-2 border-emerald-500 pl-4">
                <p className="text-xs font-bold mb-1 truncate">{news.title}</p>
                <p className="text-[11px] text-slate-400 italic truncate">{news.snippet}</p>
              </div>
            ))}
            {news_analysis?.market_macro?.slice(0, 2).map((news, idx) => (
              <div key={idx} className="border-l-2 border-cyan-500 pl-4">
                <p className="text-xs font-bold mb-1 truncate">{news.title}</p>
              </div>
            ))}
          </div>
        </div>
      </aside>
      </div>
    </div>
  );
};

// --- APP WRAPPER ---
export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0B0E11] text-slate-200">
        <nav className="flex w-full justify-start items-center px-8 py-4 border-b border-slate-800 bg-[#0B0E11]/80 backdrop-blur-md sticky top-0 z-50">
          <Link to="/" className="flex w-full items-center justify-start gap-2">
            <Zap size={24} className="text-cyan-400 fill-cyan-400" />
            <h1 className="text-xl block font-black tracking-tight">SMARTMARKET <span className="text-cyan-400">AI</span></h1>
          </Link>
          <div className="flex gap-4 w-fit items-center">
            <Link to="/research/RELIANCE" className="p-2 hover:bg-slate-800 rounded-full transition-all text-slate-400 hover:text-cyan-400">
              <BarChart3 size={24} />
            </Link>
            <Link to="/profile" className="p-2 hover:bg-slate-800 rounded-full transition-all text-slate-400 hover:text-cyan-400">
              <User size={24} />
            </Link>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/research/:stockName" element={<ResearchPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}