
import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';
import { toast } from '../../components/ui/sonner';

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { forgotPassword } = useContext(AuthContext);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await forgotPassword(email);
      if (success) {
        setSubmitted(true);
        toast.success('Password reset instructions sent to your email!');
      } else {
        toast.error('Email not found');
      }
    } catch (error) {
      toast.error('An error occurred while processing your request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Forgot Password</h2>
        
        {submitted ? (
          <div className="text-center">
            <div className="mb-4 text-green-600 text-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>Reset instructions sent!</p>
            </div>
            
            <p className="mb-6 text-gray-600">
              We've sent password reset instructions to your email address. Please check your inbox.
            </p>
            
            <Link to="/login" className="text-blue-500 hover:underline">
              Return to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="email" className="block text-gray-700 mb-2">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter your email"
                required
              />
              <p className="mt-2 text-sm text-gray-500">
                Enter the email address associated with your account, and we'll send you instructions to reset your password.
              </p>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition duration-300 disabled:opacity-50"
            >
              {isLoading ? 'Sending...' : 'Send Reset Request'}
            </button>
            
            <div className="mt-6 text-center">
              <Link to="/login" className="text-blue-500 hover:underline">
                Back to login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
