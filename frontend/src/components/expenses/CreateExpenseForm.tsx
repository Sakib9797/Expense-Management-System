
import { useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ExpenseContext from '../../contexts/ExpenseContext';
import AuthContext from '../../contexts/AuthContext';
import { toast } from '../../components/ui/sonner';
import Header from '../common/Header';
import { Receipt, Type, Tag, DollarSign, Calendar, Clock } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-animated relative overflow-hidden">
      {/* Floating blobs */}
      <div className="absolute top-20 -left-32 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
      <div className="absolute top-60 -right-32 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob delay-2000" />
      <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob delay-4000" />

      <Header 
        showBackButton 
        onBack={() => navigate(`/group/${groupId}`)}
        showNotification
      />
      
      <div className="container mx-auto py-8 px-4 relative z-10">
        <div className="max-w-2xl mx-auto opacity-0 animate-scale-in">
          <div className="glass rounded-2xl p-8 md:p-10">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                <Receipt className="text-white" size={28} />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-8 text-center text-white">Create Expense Profile</h1>
          
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-white/70 mb-1.5">Name</label>
                <div className="relative">
                  <Type className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/10 border border-white/10 text-white placeholder-white/30 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition"
                    placeholder="Enter expense name"
                    required
                  />
                </div>
              </div>
            
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-white/70 mb-1.5">Category</label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                  <input
                    id="category"
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white/10 border border-white/10 text-white placeholder-white/30 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition"
                    placeholder="Enter category"
                    required
                  />
                </div>
              </div>
            
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-white/70 mb-1.5">Price</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                  <input
                    id="price"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-white/10 border border-white/10 text-white placeholder-white/30 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition"
                    placeholder="Enter price"
                    required
                  />
                </div>
              </div>
            
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-white/70 mb-1.5">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                    <input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-white/10 border border-white/10 text-white placeholder-white/30 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition [color-scheme:dark]"
                      required
                    />
                  </div>
                </div>
              
                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-white/70 mb-1.5">Time</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                    <input
                      id="time"
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full bg-white/10 border border-white/10 text-white placeholder-white/30 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition [color-scheme:dark]"
                      required
                    />
                  </div>
                </div>
              </div>
            
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3.5 rounded-xl hover:from-blue-500 hover:to-cyan-500 transition-all duration-300 font-semibold shadow-lg shadow-blue-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Receipt size={18} />
                    Create Expense Profile
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

export default CreateExpenseForm;
