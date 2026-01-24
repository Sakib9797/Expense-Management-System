
import { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import AuthContext from './AuthContext';

export interface ExpenseProfile {
  id: string;
  groupId: string;
  name: string;
  category: string;
  price: number;
  date: string;
  time: string;
  createdBy: string;
  createdAt: string;
}

interface ExpenseContextType {
  expenses: ExpenseProfile[];
  createExpenseProfile: (expense: Omit<ExpenseProfile, 'id' | 'createdAt'>) => Promise<ExpenseProfile | null>;
  getGroupExpenses: (groupId: string) => ExpenseProfile[];
  filterExpenses: (groupId: string, filters: {
    name?: string;
    amount?: number;
    date?: string;
    time?: string;
  }) => ExpenseProfile[];
}

export const ExpenseContext = createContext<ExpenseContextType>({
  expenses: [],
  createExpenseProfile: async () => null,
  getGroupExpenses: () => [],
  filterExpenses: () => [],
});

interface ExpenseProviderProps {
  children: ReactNode;
}

export const ExpenseProvider = ({ children }: ExpenseProviderProps) => {
  const [expenses, setExpenses] = useState<ExpenseProfile[]>([]);
  const { user } = useContext(AuthContext);

  // Load expenses on mount and when user changes
  useEffect(() => {
    if (user) {
      loadExpenses();
    } else {
      setExpenses([]);
    }
  }, [user]);

  const loadExpenses = () => {
    try {
      const storedExpenses = JSON.parse(localStorage.getItem('expenses') || '[]');
      setExpenses(storedExpenses);
    } catch (error) {
      console.error('Error loading expenses:', error);
      setExpenses([]);
    }
  };

  const createExpenseProfile = async (expense: Omit<ExpenseProfile, 'id' | 'createdAt'>): Promise<ExpenseProfile | null> => {
    if (!user) return null;

    try {
      const newExpense: ExpenseProfile = {
        id: `expense_${Date.now()}`,
        ...expense,
        createdAt: new Date().toISOString(),
      };

      const updatedExpenses = [...expenses, newExpense];
      setExpenses(updatedExpenses);
      localStorage.setItem('expenses', JSON.stringify(updatedExpenses));

      return newExpense;
    } catch (error) {
      console.error('Error creating expense profile:', error);
      return null;
    }
  };

  const getGroupExpenses = (groupId: string): ExpenseProfile[] => {
    return expenses.filter(expense => expense.groupId === groupId);
  };

  const filterExpenses = (groupId: string, filters: {
    name?: string;
    amount?: number;
    date?: string;
    time?: string;
  }): ExpenseProfile[] => {
    return expenses.filter(expense => {
      if (expense.groupId !== groupId) return false;
      
      if (filters.name && !expense.name.toLowerCase().includes(filters.name.toLowerCase())) return false;
      if (filters.amount && expense.price !== filters.amount) return false;
      if (filters.date && expense.date !== filters.date) return false;
      if (filters.time && expense.time !== filters.time) return false;
      
      return true;
    });
  };

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        createExpenseProfile,
        getGroupExpenses,
        filterExpenses,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export default ExpenseContext;
