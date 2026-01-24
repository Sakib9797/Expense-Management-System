import { useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from '../ui/sonner';
import AuthContext from '../../contexts/AuthContext';
import Header from '../common/Header';

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
    <div className="min-h-screen bg-gray-50">
      <Header showBackButton onBack={() => navigate(`/group/${groupId}`)} />
      
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold mb-6 text-center">Set Spending Target</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="amount" className="block text-gray-700 mb-2 font-medium">
                Target Amount ($)
              </label>
              <input
                id="amount"
                type="number"
                step="0.01"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter target amount"
                required
              />
            </div>

            <div>
              <label htmlFor="period" className="block text-gray-700 mb-2 font-medium">
                Time Period
              </label>
              <select
                id="period"
                value={periodType}
                onChange={(e) => setPeriodType(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="day">Daily</option>
                <option value="week">Weekly</option>
                <option value="month">Monthly</option>
              </select>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> You'll receive notifications when you exceed your target 
                and a summary at the end of the period.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-purple-600 text-white py-3 rounded-md hover:bg-purple-700 transition duration-300 disabled:opacity-50"
            >
              {isLoading ? 'Setting Target...' : 'Set Target'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SetSpendingTarget;
