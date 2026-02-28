import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { GroupProvider } from "./contexts/GroupContext";
import { ExpenseProvider } from "./contexts/ExpenseContext";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

// Group Components
import CreateGroupForm from "./components/groups/CreateGroupForm";
import JoinGroupForm from "./components/groups/JoinGroupForm";
import GroupsList from "./components/groups/GroupsList";
import GroupDetails from "./components/groups/GroupDetails";
import GroupHome from "./components/groups/GroupHome";

// Expense Components
import CreateExpenseForm from "./components/expenses/CreateExpenseForm";
import ExpenseProfiles from "./components/expenses/ExpenseProfiles";
import ItemsPriceList from "./components/expenses/ItemsPriceList";

// Spending Components
import SpendingDashboard from "./components/spending/SpendingDashboard";
import AddExpense from "./components/spending/AddExpense";
import SetSpendingTarget from "./components/spending/SetSpendingTarget";
import MLDashboard from "./components/spending/MLDashboard";

// Protected Route
import ProtectedRoute from "./components/common/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <GroupProvider>
          <ExpenseProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />

                  {/* Protected Routes */}
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/create-group" element={<ProtectedRoute><CreateGroupForm /></ProtectedRoute>} />
                  <Route path="/join-group" element={<ProtectedRoute><JoinGroupForm /></ProtectedRoute>} />
                  <Route path="/groups" element={<ProtectedRoute><GroupsList /></ProtectedRoute>} />
                  <Route path="/group/:groupId" element={<ProtectedRoute><GroupHome /></ProtectedRoute>} />
                  <Route path="/group/:groupId/details" element={<ProtectedRoute><GroupDetails /></ProtectedRoute>} />
                  <Route path="/group/:groupId/create-expense" element={<ProtectedRoute><CreateExpenseForm /></ProtectedRoute>} />
                  <Route path="/group/:groupId/expense-profiles" element={<ProtectedRoute><ExpenseProfiles /></ProtectedRoute>} />
                  <Route path="/group/:groupId/items" element={<ProtectedRoute><ItemsPriceList /></ProtectedRoute>} />
                  
                  {/* Spending Routes */}
                  <Route path="/group/:groupId/spending" element={<ProtectedRoute><SpendingDashboard /></ProtectedRoute>} />
                  <Route path="/group/:groupId/add-expense" element={<ProtectedRoute><AddExpense /></ProtectedRoute>} />
                  <Route path="/group/:groupId/set-target" element={<ProtectedRoute><SetSpendingTarget /></ProtectedRoute>} />
                  <Route path="/group/:groupId/ml-insights" element={<ProtectedRoute><MLDashboard /></ProtectedRoute>} />

                  {/* 404 Route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </ExpenseProvider>
        </GroupProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
