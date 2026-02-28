import { useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from '../ui/sonner';
import AuthContext from '../../contexts/AuthContext';
import Header from '../common/Header';
import { Crosshair, DollarSign, Clock, Info } from 'lucide-react';

const SetSpendingTarget = () => {
  const { groupId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [targetAmount, setTargetAmount] = useState('');
  const [periodType, setPeriodType] = useState('month');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!targetAmount || parseFloat(targetAmount) <= 0) {
      toast.error('Please enter a valid target amount');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('http://127.0.0.1:5000/api/spending/targets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          group_id: parseInt(groupId || '0'),
          target_amount: parseFloat(targetAmount),
          period_type: periodType
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Spending target set successfully!');
        navigate(`/group/${groupId}`);
      } else {
        toast.error(data.message || 'Failed to set target');
      }
    } catch (error) {
      toast.error('An error occurred');
      console.error('Error setting target:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-animated relative overflow-hidden">
      {/* Floating blobs */}
      <div className="absolute top-20 -left-32 w-96 h-96 bg-amber-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
      <div className="absolute top-60 -right-32 w-96 h-96 bg-orange-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob delay-2000" />
      <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-rose-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob delay-4000" />

      <Header showBackButton onBack={() => navigate(`/group/${groupId}`)} />
      
      <div className="container mx-auto py-8 px-4 max-w-2xl relative z-10">
        <div className="opacity-0 animate-scale-in">
          <div className="glass rounded-2xl p-8">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                <Crosshair className="text-white" size={28} />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-8 text-center text-white">Set Spending Target</h1>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-white/70 mb-1.5">
                  Target Amount ($)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                  <input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full bg-white/10 border border-white/10 text-white placeholder-white/30 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-transparent transition"
                    placeholder="Enter target amount"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="period" className="block text-sm font-medium text-white/70 mb-1.5">
                  Time Period
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                  <select
                    id="period"
                    value={periodType}
                    onChange={(e) => setPeriodType(e.target.value)}
                    className="w-full bg-white/10 border border-white/10 text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-transparent transition appearance-none"
                  >
                    <option value="day" className="bg-gray-900 text-white">Daily</option>
                    <option value="week" className="bg-gray-900 text-white">Weekly</option>
                    <option value="month" className="bg-gray-900 text-white">Monthly</option>
                  </select>
                </div>
              </div>

              <div className="bg-amber-500/15 border border-amber-400/20 rounded-xl p-4 flex items-start gap-3">
                <Info className="text-amber-300 flex-shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-amber-200/80">
                  <strong className="text-amber-200">Note:</strong> You'll receive notifications when you exceed your target 
                  and a summary at the end of the period.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white py-3.5 rounded-xl hover:from-amber-500 hover:to-orange-500 transition-all duration-300 font-semibold shadow-lg shadow-amber-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Setting Target...
                  </>
                ) : (
                  <>
                    <Crosshair size={18} />
                    Set Target
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

export default SetSpendingTarget;
