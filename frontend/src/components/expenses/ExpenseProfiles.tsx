
import { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ExpenseContext, { ExpenseProfile } from '../../contexts/ExpenseContext';
import GroupContext from '../../contexts/GroupContext';
import Header from '../common/Header';
import { Filter, RotateCcw, Search, PlusCircle, FileText, DollarSign, Tag } from 'lucide-react';

const ExpenseProfiles = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const [group, setGroup] = useState<any>(null);
  const [expenses, setExpenses] = useState<ExpenseProfile[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<ExpenseProfile[]>([]);
  
  // Filter state
  const [nameFilter, setNameFilter] = useState('');
  const [amountFilter, setAmountFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [timeFilter, setTimeFilter] = useState('');
  
  const { getGroupExpenses, filterExpenses } = useContext(ExpenseContext);
  const { getGroupDetails } = useContext(GroupContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (groupId) {
      const groupData = getGroupDetails(groupId);
      setGroup(groupData);
      
      const expenseData = getGroupExpenses(groupId);
      setExpenses(expenseData);
      setFilteredExpenses(expenseData);
    }
  }, [groupId, getGroupDetails, getGroupExpenses]);

  const handleFilter = () => {
    const filters: any = {};
    
    if (nameFilter) filters.name = nameFilter;
    if (amountFilter) filters.amount = parseFloat(amountFilter);
    if (dateFilter) filters.date = dateFilter;
    if (timeFilter) filters.time = timeFilter;
    
    if (Object.keys(filters).length > 0) {
      const result = filterExpenses(groupId || '', filters);
      setFilteredExpenses(result);
    } else {
      setFilteredExpenses(expenses);
    }
  };

  const resetFilters = () => {
    setNameFilter('');
    setAmountFilter('');
    setDateFilter('');
    setTimeFilter('');
    setFilteredExpenses(expenses);
  };

  return (
    <div className="min-h-screen bg-gradient-animated relative overflow-hidden">
      {/* Floating blobs */}
      <div className="absolute top-20 -left-32 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
      <div className="absolute top-60 -right-32 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob delay-2000" />

      <Header 
        showBackButton 
        onBack={() => navigate(`/group/${groupId}`)}
        showNotification
      />
      
      <div className="container mx-auto py-8 px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-6 opacity-0 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center shadow-lg">
              <FileText className="text-white" size={28} />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-8 text-center text-white opacity-0 animate-fade-in">Expense Profiles</h1>
          
          {/* Filter card */}
          <div className="opacity-0 animate-slide-up delay-100">
            <div className="glass rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="text-white/60" size={20} />
                <h2 className="text-lg font-semibold text-white">Filter Expense Profiles</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1">Amount</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                    <input
                      type="number"
                      value={amountFilter}
                      onChange={(e) => setAmountFilter(e.target.value)}
                      className="w-full bg-white/10 border border-white/10 text-white placeholder-white/30 pl-9 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition text-sm"
                      placeholder="Enter amount"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1">Name</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                    <input
                      type="text"
                      value={nameFilter}
                      onChange={(e) => setNameFilter(e.target.value)}
                      className="w-full bg-white/10 border border-white/10 text-white placeholder-white/30 pl-9 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition text-sm"
                      placeholder="Enter name"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1">Date</label>
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full bg-white/10 border border-white/10 text-white placeholder-white/30 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition text-sm [color-scheme:dark]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1">Time</label>
                  <input
                    type="time"
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value)}
                    className="w-full bg-white/10 border border-white/10 text-white placeholder-white/30 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition text-sm [color-scheme:dark]"
                  />
                </div>
              </div>
              
              <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-end">
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center justify-center gap-2 bg-white/10 text-white/70 px-4 py-2.5 rounded-xl hover:bg-white/20 transition text-sm font-medium border border-white/10"
                >
                  <RotateCcw size={14} />
                  Reset
                </button>
                <button
                  onClick={handleFilter}
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white px-5 py-2.5 rounded-xl hover:from-purple-500 hover:to-fuchsia-500 transition text-sm font-medium shadow-lg shadow-purple-500/25"
                >
                  <Filter size={14} />
                  Filter
                </button>
              </div>
            </div>
          </div>
          
          {/* Results */}
          <div className="opacity-0 animate-slide-up delay-200">
            <div className="glass rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4 text-white">Filtered Expense Profiles</h2>
              
              {filteredExpenses.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/10 flex items-center justify-center">
                    <FileText className="text-white/40" size={28} />
                  </div>
                  <p className="text-white/50 mb-4">No expense profiles found. Try adjusting your filters or create a new one.</p>
                  <button
                    onClick={() => navigate(`/group/${groupId}/create-expense`)}
                    className="inline-flex items-center gap-2 bg-white/15 text-white px-5 py-2.5 rounded-xl hover:bg-white/25 transition text-sm font-medium border border-white/10"
                  >
                    <PlusCircle size={16} />
                    Create Expense Profile
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-white/50 uppercase tracking-wider">
                          Name
                        </th>
                        <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-white/50 uppercase tracking-wider">
                          Category
                        </th>
                        <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-white/50 uppercase tracking-wider">
                          Price
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExpenses.map((expense, index) => (
                        <tr key={expense.id} className="border-b border-white/5 hover:bg-white/5 transition">
                          <td className="px-5 py-4 whitespace-nowrap text-sm font-medium text-white">
                            {expense.name}
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className="text-sm bg-white/10 text-white/70 px-2.5 py-1 rounded-lg capitalize">
                              {expense.category}
                            </span>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap text-sm text-emerald-300 font-semibold">
                            ${expense.price.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseProfiles;
