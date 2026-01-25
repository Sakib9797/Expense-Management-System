import { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from '../ui/sonner';
import AuthContext from '../../contexts/AuthContext';
import Header from '../common/Header';

const AddExpense = () => {
  const { groupId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
        
        // Show notifications if any
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
    <div className="min-h-screen bg-gray-50">
      <Header showBackButton onBack={() => navigate(`/group/${groupId}`)} />
      
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold mb-6 text-center">Add Expense</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="amount" className="block text-gray-700 mb-2 font-medium">
                Amount ($)
              </label>
              <input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter amount"
                required
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-gray-700 mb-2 font-medium">
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 capitalize"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat} className="capitalize">
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="description" className="block text-gray-700 mb-2 font-medium">
                Description (Optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Add a description..."
                rows={3}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-purple-600 text-white py-3 rounded-md hover:bg-purple-700 transition duration-300 disabled:opacity-50"
            >
              {isLoading ? 'Adding Expense...' : 'Add Expense'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddExpense;
