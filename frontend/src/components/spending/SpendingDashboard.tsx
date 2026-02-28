import { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from '../ui/sonner';
import AuthContext from '../../contexts/AuthContext';
import Header from '../common/Header';
import { TrendingUp, TrendingDown, DollarSign, Target, Trash2, Brain, PlusCircle, Crosshair, BarChart3 } from 'lucide-react';

interface Insight {
  id: number;
  message: string;
  insight_type: string;
  percentage?: number;
  category?: string;
  created_at: string;
}

interface Summary {
  month_total: number;
  week_total: number;
  day_total: number;
  active_target: any;
  categories: Array<{ category: string; total: number }>;
}

interface Expense {
  id: number;
  amount: number;
  category: string;
  description: string;
  expense_date: string;
  created_at: string;
}

const SpendingDashboard = () => {
  const { groupId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [insights, setInsights] = useState<Insight[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [groupId]);

  const fetchData = async () => {
    if (!user || !groupId) return;

    try {
      const insightsRes = await fetch(
        `http://127.0.0.1:5000/api/spending/insights/${encodeURIComponent(user.email)}/${groupId}`
      );
      const insightsData = await insightsRes.json();
      setInsights(insightsData.all_insights || []);

      const summaryRes = await fetch(
        `http://127.0.0.1:5000/api/spending/summary/${encodeURIComponent(user.email)}/${groupId}`
      );
      const summaryData = await summaryRes.json();
      setSummary(summaryData);

      const expensesRes = await fetch(
        `http://127.0.0.1:5000/api/spending/expenses/${encodeURIComponent(user.email)}/${groupId}`
      );
      const expensesData = await expensesRes.json();
      setExpenses(expensesData.expenses || []);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTarget = async () => {
    if (!user || !summary?.active_target) return;
    if (!confirm('Are you sure you want to delete this spending target?')) return;

    try {
      const res = await fetch(
        `http://127.0.0.1:5000/api/spending/targets/${summary.active_target.id}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email })
        }
      );

      if (res.ok) {
        toast.success('Spending target deleted successfully');
        fetchData();
      } else {
        toast.error('Failed to delete target');
      }
    } catch (error) {
      console.error('Error deleting target:', error);
      toast.error('An error occurred');
    }
  };

  const handleDeleteExpense = async (expenseId: number) => {
    if (!user) return;
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
      const res = await fetch(
        `http://127.0.0.1:5000/api/spending/expenses/${expenseId}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email })
        }
      );

      if (res.ok) {
        toast.success('Expense deleted successfully');
        fetchData();
      } else {
        toast.error('Failed to delete expense');
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('An error occurred');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-animated flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  const summaryCards = [
    { label: 'Today', value: summary?.day_total, color: 'from-blue-500 to-cyan-500', icon: DollarSign },
    { label: 'This Week', value: summary?.week_total, color: 'from-emerald-500 to-teal-500', icon: DollarSign },
    { label: 'This Month', value: summary?.month_total, color: 'from-purple-500 to-fuchsia-500', icon: DollarSign },
  ];

  return (
    <div className="min-h-screen bg-gradient-animated relative overflow-hidden">
      {/* Floating blobs */}
      <div className="absolute top-20 -left-32 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
      <div className="absolute top-60 -right-32 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob delay-2000" />
      <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob delay-4000" />

      <Header showBackButton onBack={() => navigate(`/group/${groupId}`)} />
      
      <div className="container mx-auto py-8 px-4 max-w-6xl relative z-10">
        {/* Title bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 opacity-0 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg">
              <BarChart3 className="text-white" size={24} />
            </div>
            <h1 className="text-3xl font-bold text-white">Spending Dashboard</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to={`/group/${groupId}/ml-insights`}
              className="inline-flex items-center gap-2 bg-indigo-500/30 hover:bg-indigo-500/50 text-indigo-200 px-4 py-2 rounded-xl transition border border-indigo-400/20 text-sm font-medium"
            >
              <Brain size={16} />
              AI Insights
            </Link>
            <Link
              to={`/group/${groupId}/add-expense`}
              className="inline-flex items-center gap-2 bg-purple-500/30 hover:bg-purple-500/50 text-purple-200 px-4 py-2 rounded-xl transition border border-purple-400/20 text-sm font-medium"
            >
              <PlusCircle size={16} />
              Add Expense
            </Link>
            <Link
              to={`/group/${groupId}/set-target`}
              className="inline-flex items-center gap-2 bg-emerald-500/30 hover:bg-emerald-500/50 text-emerald-200 px-4 py-2 rounded-xl transition border border-emerald-400/20 text-sm font-medium"
            >
              <Crosshair size={16} />
              Set Target
            </Link>
          </div>
        </div>

        {/* Spending Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {summaryCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className={`opacity-0 animate-slide-up delay-${(index + 1) * 100}`}>
                <div className="glass rounded-2xl p-6 hover-lift">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white/60 text-sm font-medium">{card.label}</h3>
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center shadow-md`}>
                      <Icon className="text-white" size={18} />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white">${card.value?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Active Target */}
        {summary?.active_target && (
          <div className="opacity-0 animate-slide-up delay-400">
            <div className="glass rounded-2xl p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md">
                    <Target className="text-white" size={18} />
                  </div>
                  <h2 className="text-xl font-bold text-white">Active Target</h2>
                </div>
                <button
                  onClick={handleDeleteTarget}
                  className="flex items-center text-red-300 hover:text-red-200 bg-red-500/20 hover:bg-red-500/30 px-3 py-2 rounded-xl transition text-sm border border-red-400/20"
                >
                  <Trash2 size={14} className="mr-1.5" />
                  Remove
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <p className="text-white/50 text-sm mb-1">Target Amount</p>
                  <p className="text-2xl font-bold text-emerald-300">
                    ${summary.active_target.target_amount?.toFixed(2)}
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <p className="text-white/50 text-sm mb-1">Period</p>
                  <p className="text-xl font-semibold capitalize text-white">
                    {summary.active_target.period_type}ly
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI-Lite Insights */}
        <div className="opacity-0 animate-slide-up delay-500">
          <div className="glass rounded-2xl p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center text-white gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center shadow-md">
                <TrendingUp className="text-white" size={18} />
              </div>
              Spending Insights
            </h2>
            
            {insights.length === 0 ? (
              <p className="text-white/40 text-center py-8">
                No insights available yet. Add more expenses to generate insights!
              </p>
            ) : (
              <div className="space-y-3">
                {insights.map((insight) => (
                  <div
                    key={insight.id}
                    className={`p-4 rounded-xl border ${
                      insight.insight_type === 'overspending' ? 'border-red-400/20 bg-red-500/10' :
                      insight.insight_type === 'saving' ? 'border-emerald-400/20 bg-emerald-500/10' :
                      insight.insight_type === 'category_increase' ? 'border-orange-400/20 bg-orange-500/10' :
                      'border-blue-400/20 bg-blue-500/10'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-white">{insight.message}</p>
                        <p className="text-sm text-white/40 mt-1">
                          {new Date(insight.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {insight.insight_type === 'overspending' || insight.insight_type === 'category_increase' ? (
                        <TrendingUp className="text-red-400 ml-2 flex-shrink-0" size={20} />
                      ) : (
                        <TrendingDown className="text-emerald-400 ml-2 flex-shrink-0" size={20} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        {summary?.categories && summary.categories.length > 0 && (
          <div className="opacity-0 animate-slide-up delay-600">
            <div className="glass rounded-2xl p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4 text-white">Spending by Category</h2>
              <div className="space-y-3">
                {summary.categories.map((cat, index) => {
                  const maxTotal = Math.max(...summary.categories.map(c => c.total));
                  const percentage = maxTotal > 0 ? (cat.total / maxTotal) * 100 : 0;
                  return (
                    <div key={index} className="flex items-center gap-4">
                      <span className="font-medium capitalize text-white/80 w-32 truncate">{cat.category}</span>
                      <div className="flex-1 bg-white/10 rounded-full h-3 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-lg font-bold text-purple-300 w-24 text-right">
                        ${cat.total.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Recent Expenses */}
        <div className="opacity-0 animate-slide-up delay-700">
          <div className="glass rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-4 text-white">Recent Expenses</h2>
            {expenses.length === 0 ? (
              <p className="text-white/40 text-center py-8">No expenses yet. Add your first expense!</p>
            ) : (
              <div className="space-y-2">
                {expenses.slice(0, 10).map((expense) => (
                  <div key={expense.id} className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg text-white">${expense.amount.toFixed(2)}</span>
                        <span className="text-xs text-white/50 capitalize bg-white/10 px-2.5 py-1 rounded-lg">
                          {expense.category}
                        </span>
                      </div>
                      {expense.description && (
                        <p className="text-sm text-white/50 mt-1">{expense.description}</p>
                      )}
                      <p className="text-xs text-white/30 mt-1">
                        {new Date(expense.expense_date).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteExpense(expense.id)}
                      className="text-red-300 hover:text-red-200 bg-red-500/15 hover:bg-red-500/30 p-2 rounded-xl transition"
                      title="Delete Expense"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpendingDashboard;
