
import { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ExpenseContext, { ExpenseProfile } from '../../contexts/ExpenseContext';
import GroupContext from '../../contexts/GroupContext';
import Header from '../common/Header';

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
    <div className="min-h-screen bg-gray-50">
      <Header 
        showBackButton 
        onBack={() => navigate(`/group/${groupId}`)}
        showNotification
      />
      
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">Expense Profiles</h1>
          
          <div className="bg-gray-100 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Filter Expense Profiles</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount:</label>
                <input
                  type="number"
                  value={amountFilter}
                  onChange={(e) => setAmountFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter amount"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name:</label>
                <input
                  type="text"
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date:</label>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time:</label>
                <input
                  type="time"
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-end">
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
              >
                Reset
              </button>
              <button
                onClick={handleFilter}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Filter
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Filtered Expense Profiles</h2>
            
            {filteredExpenses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No expense profiles found. Try adjusting your filters or create a new expense profile.</p>
                <button
                  onClick={() => navigate(`/group/${groupId}/create-expense`)}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Create Expense Profile
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredExpenses.map((expense) => (
                      <tr key={expense.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {expense.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {expense.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {expense.price.toFixed(2)}
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
  );
};

export default ExpenseProfiles;
