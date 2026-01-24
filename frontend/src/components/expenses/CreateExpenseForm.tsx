
import { useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ExpenseContext from '../../contexts/ExpenseContext';
import AuthContext from '../../contexts/AuthContext';
import { toast } from '../../components/ui/sonner';
import Header from '../common/Header';

const CreateExpenseForm = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { createExpenseProfile } = useContext(ExpenseContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !category || !price || !date || !time) {
      toast.error('Please fill all fields');
      return;
    }

    if (!groupId || !user) {
      toast.error('Missing group ID or user information');
      return;
    }

    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      toast.error('Price must be a valid number greater than 0');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await createExpenseProfile({
        groupId,
        name,
        category,
        price: priceValue,
        date,
        time,
        createdBy: user.id,
      });

      if (result) {
        toast.success('Expense profile created successfully!');
        navigate(`/group/${groupId}/expense-profiles`);
      } else {
        toast.error('Failed to create expense profile');
      }
    } catch (error) {
      toast.error('An error occurred while creating the expense profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        showBackButton 
        onBack={() => navigate(`/group/${groupId}`)}
        showNotification
      />
      
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-8 text-center">Create Expense Profile</h1>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Name:</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter expense name"
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="category" className="block text-gray-700 font-medium mb-2">Category:</label>
              <input
                id="category"
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter category"
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="price" className="block text-gray-700 font-medium mb-2">Price:</label>
              <input
                id="price"
                type="number"
                min="0.01"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter price"
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="date" className="block text-gray-700 font-medium mb-2">Date:</label>
              <div className="relative">
                <input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <label htmlFor="time" className="block text-gray-700 font-medium mb-2">Time:</label>
              <div className="relative">
                <input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 transition-colors font-medium disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Expense Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateExpenseForm;
