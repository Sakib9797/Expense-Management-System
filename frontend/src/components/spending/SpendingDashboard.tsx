import { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from '../ui/sonner';
import AuthContext from '../../contexts/AuthContext';
import Header from '../common/Header';
import { TrendingUp, TrendingDown, DollarSign, Target, Trash2 } from 'lucide-react';

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
      // Fetch insights
      const insightsRes = await fetch(
        `http://127.0.0.1:5000/api/spending/insights/${encodeURIComponent(user.email)}/${groupId}`
      );
      const insightsData = await insightsRes.json();
      setInsights(insightsData.all_insights || []);

      // Fetch summary
      const summaryRes = await fetch(
        `http://127.0.0.1:5000/api/spending/summary/${encodeURIComponent(user.email)}/${groupId}`
      );
      const summaryData = await summaryRes.json();
      setSummary(summaryData);

      // Fetch expenses
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

    if (!confirm('Are you sure you want to delete this spending target?')) {
      return;
    }

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
        fetchData(); // Refresh data
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

    if (!confirm('Are you sure you want to delete this expense?')) {
      return;
    }

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
        fetchData(); // Refresh data
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
      <div className="min-h-screen bg-gray-50">
        <Header showBackButton onBack={() => navigate(`/group/${groupId}`)} />
        <div className="container mx-auto py-8 px-4">
          <p className="text-center text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showBackButton onBack={() => navigate(`/group/${groupId}`)} />
      
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Spending Dashboard</h1>
          <div className="space-x-3">
            <Link
              to={`/group/${groupId}/add-expense`}
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
            >
              Add Expense
            </Link>
            <Link
              to={`/group/${groupId}/set-target`}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Set Target
            </Link>
          </div>
        </div>

        {/* Spending Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600">Today</h3>
              <DollarSign className="text-blue-500" size={24} />
            </div>
            <p className="text-3xl font-bold">${summary?.day_total?.toFixed(2) || '0.00'}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600">This Week</h3>
              <DollarSign className="text-green-500" size={24} />
            </div>
            <p className="text-3xl font-bold">${summary?.week_total?.toFixed(2) || '0.00'}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600">This Month</h3>
              <DollarSign className="text-purple-500" size={24} />
            </div>
            <p className="text-3xl font-bold">${summary?.month_total?.toFixed(2) || '0.00'}</p>
          </div>
        </div>

        {/* Active Target */}
        {summary?.active_target && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Target className="text-green-600 mr-2" size={24} />
                <h2 className="text-xl font-bold">Active Target</h2>
              </div>
              <button
                onClick={handleDeleteTarget}
                className="flex items-center text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-md transition"
                title="Delete Target"
              >
                <Trash2 size={18} className="mr-1" />
                Remove Target
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Target Amount</p>
                <p className="text-2xl font-bold text-green-600">
                  ${summary.active_target.target_amount?.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Period</p>
                <p className="text-xl font-semibold capitalize">
                  {summary.active_target.period_type}ly
                </p>
              </div>
            </div>
          </div>
        )}

        {/* AI-Lite Insights */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <TrendingUp className="mr-2 text-purple-600" size={28} />
            Spending Insights
          </h2>
          
          {insights.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No insights available yet. Add more expenses to generate insights!
            </p>
          ) : (
            <div className="space-y-4">
              {insights.map((insight) => (
                <div
                  key={insight.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    insight.insight_type === 'overspending' ? 'border-red-500 bg-red-50' :
                    insight.insight_type === 'saving' ? 'border-green-500 bg-green-50' :
                    insight.insight_type === 'category_increase' ? 'border-orange-500 bg-orange-50' :
                    'border-blue-500 bg-blue-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{insight.message}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(insight.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {insight.insight_type === 'overspending' || insight.insight_type === 'category_increase' ? (
                      <TrendingUp className="text-red-500 ml-2" size={20} />
                    ) : (
                      <TrendingDown className="text-green-500 ml-2" size={20} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        {summary?.categories && summary.categories.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Spending by Category</h2>
            <div className="space-y-3">
              {summary.categories.map((cat, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="font-medium capitalize">{cat.category}</span>
                  <span className="text-lg font-bold text-purple-600">
                    ${cat.total.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Expenses */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Recent Expenses</h2>
          {expenses.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No expenses yet. Add your first expense!</p>
          ) : (
            <div className="space-y-3">
              {expenses.slice(0, 10).map((expense) => (
                <div key={expense.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-lg">${expense.amount.toFixed(2)}</span>
                      <span className="text-sm text-gray-500 capitalize bg-gray-100 px-2 py-1 rounded">
                        {expense.category}
                      </span>
                    </div>
                    {expense.description && (
                      <p className="text-sm text-gray-600 mt-1">{expense.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(expense.expense_date).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteExpense(expense.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-md transition"
                    title="Delete Expense"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpendingDashboard;
