
import { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ExpenseContext from '../../contexts/ExpenseContext';
import GroupContext from '../../contexts/GroupContext';
import Header from '../common/Header';

const ItemsPriceList = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const [group, setGroup] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  
  const { getGroupExpenses } = useContext(ExpenseContext);
  const { getGroupDetails } = useContext(GroupContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (groupId) {
      const groupData = getGroupDetails(groupId);
      setGroup(groupData);
      
      const expenseData = getGroupExpenses(groupId);
      setExpenses(expenseData);
    }
  }, [groupId, getGroupDetails, getGroupExpenses]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        showBackButton 
        onBack={() => navigate(`/group/${groupId}`)}
        showNotification
      />
      
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">Items Price List</h1>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            {expenses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No expense items found. Create an expense profile to add items.</p>
                <button
                  onClick={() => navigate(`/group/${groupId}/create-expense`)}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Create Expense Profile
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-semibold mb-4">Items</h2>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Item Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {expenses.map((expense) => (
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(expense.date).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total:</span>
                    <span className="font-bold text-lg">
                      ${expenses.reduce((sum, expense) => sum + expense.price, 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemsPriceList;
