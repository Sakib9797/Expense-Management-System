
import { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ExpenseContext from '../../contexts/ExpenseContext';
import GroupContext from '../../contexts/GroupContext';
import Header from '../common/Header';
import { CreditCard, PlusCircle, ShoppingBag } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-animated relative overflow-hidden">
      {/* Floating blobs */}
      <div className="absolute top-20 -left-32 w-96 h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
      <div className="absolute top-60 -right-32 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob delay-2000" />

      <Header 
        showBackButton 
        onBack={() => navigate(`/group/${groupId}`)}
        showNotification
      />
      
      <div className="container mx-auto py-8 px-4 relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-center mb-6 opacity-0 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
              <CreditCard className="text-white" size={28} />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-8 text-center text-white opacity-0 animate-fade-in">Items Price List</h1>
          
          <div className="opacity-0 animate-slide-up delay-100">
            <div className="glass rounded-2xl p-6">
              {expenses.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/10 flex items-center justify-center">
                    <ShoppingBag className="text-white/40" size={28} />
                  </div>
                  <p className="text-white/50 mb-4">No expense items found. Create an expense profile to add items.</p>
                  <button
                    onClick={() => navigate(`/group/${groupId}/create-expense`)}
                    className="inline-flex items-center gap-2 bg-white/15 text-white px-5 py-2.5 rounded-xl hover:bg-white/25 transition text-sm font-medium border border-white/10"
                  >
                    <PlusCircle size={16} />
                    Create Expense Profile
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
                    <ShoppingBag size={20} className="text-white/60" />
                    Items
                  </h2>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-white/50 uppercase tracking-wider">
                            Item Name
                          </th>
                          <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-white/50 uppercase tracking-wider">
                            Category
                          </th>
                          <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-white/50 uppercase tracking-wider">
                            Price
                          </th>
                          <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-white/50 uppercase tracking-wider">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {expenses.map((expense) => (
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
                            <td className="px-5 py-4 whitespace-nowrap text-sm text-white/50">
                              {new Date(expense.date).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-6 border-t border-white/10 pt-4">
                    <div className="flex justify-between items-center px-5">
                      <span className="font-semibold text-white/70">Total</span>
                      <span className="font-bold text-xl text-emerald-300">
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
    </div>
  );
};

export default ItemsPriceList;
