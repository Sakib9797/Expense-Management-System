import { useState, useContext, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from '../ui/sonner';
import AuthContext from '../../contexts/AuthContext';
import Header from '../common/Header';
import { Brain, Sparkles, DollarSign, Tag, FileText, PlusCircle } from 'lucide-react';

interface MLPrediction {
  predicted_category: string;
  confidence: number;
  all_probabilities: Record<string, number>;
}

const AddExpense = () => {
  const { groupId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ML smart categorisation state
  const [mlPrediction, setMlPrediction] = useState<MLPrediction | null>(null);
  const [mlLoading, setMlLoading] = useState(false);
  const [userOverrodeCategory, setUserOverrodeCategory] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const categories = [
    'food',
    'transportation',
    'entertainment',
    'utilities',
    'shopping',
    'health',
    'education',
    'other'
  ];

  // Debounced ML prediction as user types description
  const predictCategory = useCallback(async (text: string) => {
    if (!text || text.trim().length < 3) {
      setMlPrediction(null);
      return;
    }
    setMlLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:5000/api/ml/predict-category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: text,
          email: user?.email,
          group_id: groupId ? parseInt(groupId) : undefined,
        }),
      });
      if (res.ok) {
        const data: MLPrediction = await res.json();
        setMlPrediction(data);
        if (!userOverrodeCategory && data.confidence >= 0.35) {
          setCategory(data.predicted_category);
        }
      }
    } catch {
      // Silently fail — ML is a nice-to-have
    } finally {
      setMlLoading(false);
    }
  }, [user, groupId, userOverrodeCategory]);

  const handleDescriptionChange = (text: string) => {
    setDescription(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => predictCategory(text), 500);
  };

  const handleCategoryChange = (val: string) => {
    setCategory(val);
    setUserOverrodeCategory(true);
  };

  const applyMlSuggestion = () => {
    if (mlPrediction) {
      setCategory(mlPrediction.predicted_category);
      setUserOverrodeCategory(false);
      toast.success(`Category set to ${mlPrediction.predicted_category} by AI`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('http://127.0.0.1:5000/api/spending/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          group_id: parseInt(groupId || '0'),
          amount: parseFloat(amount),
          category: category,
          description: description,
          expense_date: new Date().toISOString()
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Expense added successfully!');
        
        console.log('Response data:', data);
        console.log('Notifications:', data.notifications);
        
        if (data.notifications && data.notifications.length > 0) {
          data.notifications.forEach((notif: any) => {
            const message = typeof notif === 'string' ? notif : notif.message;
            console.log('Showing notification:', notif.type, message);
            if (notif.type === 'exceeded') {
              toast.error(message, { duration: 8000 });
            } else if (notif.type === 'warning_90') {
              toast.warning(message, { duration: 6000 });
            } else if (notif.type === 'warning_80') {
              toast.info(message, { duration: 5000 });
            } else if (notif.type === 'insight') {
              toast.success(`📊 ${message}`, { duration: 7000 });
            } else {
              toast.info(message, { duration: 5000 });
            }
          });
        } else {
          console.log('No notifications in response');
        }
        
        navigate(`/group/${groupId}/spending`);
      } else {
        toast.error(data.message || 'Failed to add expense');
      }
    } catch (error) {
      toast.error('An error occurred');
      console.error('Error adding expense:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-animated relative overflow-hidden">
      {/* Floating blobs */}
      <div className="absolute top-20 -left-32 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
      <div className="absolute top-60 -right-32 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob delay-2000" />
      <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob delay-4000" />

      <Header showBackButton onBack={() => navigate(`/group/${groupId}`)} />
      
      <div className="container mx-auto py-8 px-4 max-w-2xl relative z-10">
        <div className="opacity-0 animate-scale-in">
          <div className="glass rounded-2xl p-8">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <PlusCircle className="text-white" size={28} />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-8 text-center text-white">Add Expense</h1>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-white/70 mb-1.5">
                  Amount ($)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                  <input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-white/10 border border-white/10 text-white placeholder-white/30 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-transparent transition"
                    placeholder="Enter amount"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-white/70 mb-1.5">
                  Category
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full bg-white/10 border border-white/10 text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-transparent transition capitalize appearance-none"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat} className="bg-gray-900 text-white capitalize">
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* ML Category Suggestion */}
                {mlPrediction && mlPrediction.predicted_category !== category && (
                  <div className="mt-2.5 bg-purple-500/20 border border-purple-400/20 rounded-xl p-3 flex items-center gap-3">
                    <Brain className="text-purple-300 flex-shrink-0" size={20} />
                    <div className="flex-1 text-sm">
                      <span className="text-purple-200 font-medium">AI suggests: </span>
                      <span className="font-bold capitalize text-white">
                        {mlPrediction.predicted_category}
                      </span>
                      <span className="text-purple-300/60 ml-1">
                        ({(mlPrediction.confidence * 100).toFixed(0)}% confidence)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={applyMlSuggestion}
                      className="text-xs bg-purple-500/40 text-purple-100 px-3 py-1.5 rounded-lg hover:bg-purple-500/60 transition flex items-center gap-1 border border-purple-400/20"
                    >
                      <Sparkles size={12} /> Apply
                    </button>
                  </div>
                )}
                {mlLoading && (
                  <p className="mt-1.5 text-xs text-purple-300/60 flex items-center gap-1">
                    <Brain size={12} className="animate-pulse" /> Analyzing description…
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-white/70 mb-1.5">
                  Description (Optional — AI will suggest a category)
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 text-white/30" size={18} />
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => handleDescriptionChange(e.target.value)}
                    className="w-full bg-white/10 border border-white/10 text-white placeholder-white/30 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-transparent transition resize-none"
                    placeholder="e.g. Uber ride to airport, Grocery shopping at Walmart..."
                    rows={3}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3.5 rounded-xl hover:from-purple-500 hover:to-indigo-500 transition-all duration-300 font-semibold shadow-lg shadow-purple-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Adding Expense...
                  </>
                ) : (
                  <>
                    <PlusCircle size={18} />
                    Add Expense
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddExpense;
