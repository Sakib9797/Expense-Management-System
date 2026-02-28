import { useState, useContext, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';
import Header from '../common/Header';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import {
  Brain, TrendingUp, TrendingDown, AlertTriangle,
  Activity, Sparkles, ArrowRight, RefreshCw, Minus,
} from 'lucide-react';

/* ------- types ------- */
interface Anomaly {
  expense_id: number;
  amount: number;
  category: string;
  description: string;
  expense_date: string;
  anomaly_score: number;
  reason: string;
}

interface ForecastWeek {
  week: string;
  week_start: string;
  predicted_total: number;
  lower_bound: number;
  upper_bound: number;
}

interface HistoricalWeek {
  week: string;
  total: number;
}

interface ForecastData {
  historical: HistoricalWeek[];
  forecast: ForecastWeek[];
  trend: 'increasing' | 'decreasing' | 'stable';
  monthly_estimate: number;
  model_info?: {
    type: string;
    slope: number;
    intercept: number;
    residual_std: number;
    data_points: number;
  };
}

interface DashboardData {
  anomalies: Anomaly[];
  anomaly_count: number;
  forecast: ForecastData;
}

/* ------- component ------- */

const MLDashboard = () => {
  const { groupId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user?.email || !groupId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `http://127.0.0.1:5000/api/ml/dashboard/${encodeURIComponent(user.email)}/${groupId}`
      );
      if (!res.ok) throw new Error('Failed to fetch ML data');
      const json: DashboardData = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message ?? 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [user, groupId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ---------- chart data helpers ---------- */

  const chartData = (() => {
    if (!data?.forecast) return [];
    const hist = (data.forecast.historical || []).map((h) => ({
      label: h.week.replace(/^\d{4}-/, ''),
      actual: h.total,
      predicted: null as number | null,
      lower: null as number | null,
      upper: null as number | null,
    }));
    const fore = (data.forecast.forecast || []).map((f) => ({
      label: f.week_start,
      actual: null as number | null,
      predicted: f.predicted_total,
      lower: f.lower_bound,
      upper: f.upper_bound,
    }));
    return [...hist, ...fore];
  })();

  const trendIcon = (trend?: string) => {
    if (trend === 'increasing') return <TrendingUp className="text-red-400" size={22} />;
    if (trend === 'decreasing') return <TrendingDown className="text-green-400" size={22} />;
    return <Minus className="text-white/40" size={22} />;
  };

  const trendColor = (trend?: string) => {
    if (trend === 'increasing') return 'text-red-400';
    if (trend === 'decreasing') return 'text-green-400';
    return 'text-white/60';
  };

  /* ---------- render ---------- */

  const renderBlobs = () => (
    <>
      <div className="absolute top-20 -left-32 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
      <div className="absolute top-60 -right-32 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob delay-2000" />
      <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-fuchsia-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob delay-4000" />
    </>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-animated relative overflow-hidden">
        {renderBlobs()}
        <Header showBackButton onBack={() => navigate(`/group/${groupId}/spending`)} />
        <div className="flex items-center justify-center py-32 relative z-10">
          <RefreshCw className="animate-spin text-purple-300 mr-3" />
          <span className="text-white/60 text-lg">Loading AI insights…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-animated relative overflow-hidden">
      {renderBlobs()}
      <Header showBackButton onBack={() => navigate(`/group/${groupId}/spending`)} />

      <div className="container mx-auto py-8 px-4 max-w-6xl relative z-10">
        {/* Title bar */}
        <div className="flex justify-between items-center mb-8 opacity-0 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Brain className="text-white" size={24} />
            </div>
            <h1 className="text-3xl font-bold text-white">AI / ML Insights</h1>
          </div>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-500 hover:to-indigo-500 transition-all duration-300 shadow-lg shadow-purple-500/25"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-400/20 text-red-200 rounded-xl p-4 mb-6">
            {error}
          </div>
        )}

        {/* ============ FORECASTING SECTION ============ */}
        <section className="mb-10 opacity-0 animate-slide-up delay-200">
          <div className="glass rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Activity size={24} />
                Spending Forecast
                <span className="text-sm font-normal opacity-80 ml-2">
                  Linear Regression Model
                </span>
              </h2>
            </div>

            <div className="p-6">
              {chartData.length === 0 ? (
                <p className="text-white/50 text-center py-12">
                  Add more expenses to enable forecasting (need at least 3 data points).
                </p>
              ) : (
                <>
                  {/* Summary cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-purple-500/15 border border-purple-400/20 rounded-xl p-4">
                      <p className="text-sm text-purple-300 mb-1">Monthly Estimate</p>
                      <p className="text-2xl font-bold text-white">
                        ${data?.forecast?.monthly_estimate?.toFixed(2) ?? '—'}
                      </p>
                    </div>
                    <div className="bg-purple-500/15 border border-purple-400/20 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm text-purple-300">Trend</p>
                        {trendIcon(data?.forecast?.trend)}
                      </div>
                      <p className={`text-2xl font-bold capitalize ${trendColor(data?.forecast?.trend)}`}>
                        {data?.forecast?.trend ?? '—'}
                      </p>
                    </div>
                    <div className="bg-purple-500/15 border border-purple-400/20 rounded-xl p-4">
                      <p className="text-sm text-purple-300 mb-1">Model Data Points</p>
                      <p className="text-2xl font-bold text-white">
                        {data?.forecast?.model_info?.data_points ?? 0} weeks
                      </p>
                    </div>
                  </div>

                  {/* Chart — white bg for readability */}
                  <div className="bg-white/95 rounded-xl p-4">
                    <ResponsiveContainer width="100%" height={340}>
                      <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} tickFormatter={(v: number) => `$${v}`} />
                        <Tooltip
                          formatter={(value: number, name: string) => [
                            `$${value?.toFixed(2) ?? '—'}`,
                            name === 'actual' ? 'Actual' : name === 'predicted' ? 'Predicted' : name,
                          ]}
                        />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="actual"
                          stroke="#7c3aed"
                          fill="url(#colorActual)"
                          strokeWidth={2}
                          connectNulls={false}
                          name="Actual"
                          dot={{ r: 4 }}
                        />
                        <Area
                          type="monotone"
                          dataKey="predicted"
                          stroke="#f59e0b"
                          fill="url(#colorPred)"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          connectNulls={false}
                          name="Predicted"
                          dot={{ r: 4 }}
                        />
                        <Area
                          type="monotone"
                          dataKey="upper"
                          stroke="transparent"
                          fill="#f59e0b"
                          fillOpacity={0.08}
                          connectNulls={false}
                          name="Upper Bound"
                        />
                        <Area
                          type="monotone"
                          dataKey="lower"
                          stroke="transparent"
                          fill="transparent"
                          connectNulls={false}
                          name="Lower Bound"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* ============ ANOMALY DETECTION SECTION ============ */}
        <section className="mb-10 opacity-0 animate-slide-up delay-400">
          <div className="glass rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-orange-500 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <AlertTriangle size={24} />
                Anomaly Detection
                <span className="text-sm font-normal opacity-80 ml-2">
                  Isolation Forest Model
                </span>
                {data && data.anomaly_count > 0 && (
                  <span className="ml-auto bg-white/20 backdrop-blur-sm text-white text-sm font-bold px-3 py-1 rounded-full">
                    {data.anomaly_count} found
                  </span>
                )}
              </h2>
            </div>

            <div className="p-6">
              {!data || data.anomaly_count === 0 ? (
                <div className="text-center py-12">
                  <Sparkles className="mx-auto text-emerald-400 mb-3" size={40} />
                  <p className="text-white text-lg font-medium">No anomalies detected!</p>
                  <p className="text-white/40 text-sm mt-1">
                    Your spending patterns look normal. Keep it up!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.anomalies.map((a) => (
                    <div
                      key={a.expense_id}
                      className="border-l-4 border-red-400 bg-red-500/15 rounded-r-xl p-4 flex items-start gap-4"
                    >
                      <AlertTriangle className="text-red-400 flex-shrink-0 mt-1" size={22} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg font-bold text-red-300">
                            ${a.amount.toFixed(2)}
                          </span>
                          <span className="text-sm bg-red-500/30 text-red-200 px-2 py-0.5 rounded-lg capitalize">
                            {a.category}
                          </span>
                          <span className="text-xs text-white/30 ml-auto">
                            Score: {a.anomaly_score.toFixed(3)}
                          </span>
                        </div>
                        <p className="text-white/70">{a.reason}</p>
                        {a.description && (
                          <p className="text-sm text-white/40 mt-1">"{a.description}"</p>
                        )}
                        <p className="text-xs text-white/30 mt-1">
                          {new Date(a.expense_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ============ MODEL INFO SECTION ============ */}
        {data?.forecast?.model_info && (
          <section className="mb-10 opacity-0 animate-slide-up delay-600">
            <div className="glass rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-slate-600 to-slate-800 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Brain size={24} />
                  Model Information
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-white/10 border border-white/10 rounded-xl p-3">
                    <p className="text-xs text-white/40">Forecast Model</p>
                    <p className="font-bold text-white">{data.forecast.model_info.type}</p>
                  </div>
                  <div className="bg-white/10 border border-white/10 rounded-xl p-3">
                    <p className="text-xs text-white/40">Weekly Trend (slope)</p>
                    <p className="font-bold text-white">${data.forecast.model_info.slope.toFixed(2)}/week</p>
                  </div>
                  <div className="bg-white/10 border border-white/10 rounded-xl p-3">
                    <p className="text-xs text-white/40">Residual Std Dev</p>
                    <p className="font-bold text-white">${data.forecast.model_info.residual_std.toFixed(2)}</p>
                  </div>
                  <div className="bg-white/10 border border-white/10 rounded-xl p-3">
                    <p className="text-xs text-white/40">Anomaly Model</p>
                    <p className="font-bold text-white">Isolation Forest</p>
                  </div>
                  <div className="bg-white/10 border border-white/10 rounded-xl p-3">
                    <p className="text-xs text-white/40">Categoriser</p>
                    <p className="font-bold text-white">TF-IDF + LogReg</p>
                  </div>
                  <div className="bg-white/10 border border-white/10 rounded-xl p-3">
                    <p className="text-xs text-white/40">Training Data</p>
                    <p className="font-bold text-white">{data.forecast.model_info.data_points} weeks</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Back link */}
        <div className="text-center opacity-0 animate-fade-in delay-800">
          <Link
            to={`/group/${groupId}/spending`}
            className="text-purple-300 hover:text-purple-100 font-medium inline-flex items-center gap-1 transition"
          >
            <ArrowRight size={16} className="rotate-180" />
            Back to Spending Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MLDashboard;
