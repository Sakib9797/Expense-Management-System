import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Check token validity on component mount or token change
  useEffect(() => {
    if (!token) {
      setMessage('Invalid or missing reset token.');
    }
  }, [token]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const response = await sendResetPasswordRequest();
      handleResponse(response);
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    }
  };

  // Validate form before submitting
  const validateForm = () => {
    if (!token) {
      setMessage('Invalid or missing reset token.');
      return false;
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return false;
    }

    return true;
  };

  // Send password reset request to the server
  const sendResetPasswordRequest = async () => {
    const res = await fetch('http://127.0.0.1:5000/api/reset-password', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        new_password: password,
      }),
    });
    return res.json();
  };

  // Handle response from server
  const handleResponse = (result: any) => {
    setMessage(result.message);
    setSuccess(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Reset Password</h2>
        
        {message && (
          <div className={`mb-4 p-3 rounded ${success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
