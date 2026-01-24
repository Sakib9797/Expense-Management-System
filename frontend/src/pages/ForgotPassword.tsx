import { useState } from 'react';
import { toast } from '@/components/ui/sonner';

const forgotPassword = async (email: string): Promise<void> => {
  try {
    const res = await fetch('http://127.0.0.1:5000/api/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const contentType = res.headers.get('content-type');
    let data: any = {};

    // Only parse JSON if the response is JSON
    if (contentType && contentType.includes('application/json')) {
      data = await res.json();
    } else {
      const text = await res.text();
      throw new Error(`Unexpected response: ${text}`);
    }

    if (!res.ok) {
      throw new Error(data.message || 'Failed to send reset email');
    }

    toast.success(data.message || 'Reset link sent to your email');
  } catch (err: any) {
    console.error('Forgot password error:', err.message || err);
    toast.error('An error occurred while sending reset email');
  }
};

export default function ForgotPassword() {
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      toast.error('Please enter a valid email');
      return;
    }
    await forgotPassword(email);
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-xl font-semibold mb-4">Forgot Password</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Send Reset Link
        </button>
      </form>
    </div>
  );
}
