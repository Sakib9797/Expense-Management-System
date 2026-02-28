import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import { Mail, ArrowLeft, KeyRound } from 'lucide-react';

const forgotPassword = async (email: string): Promise<void> => {
  try {
    const res = await fetch('http://127.0.0.1:5000/api/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const contentType = res.headers.get('content-type');
    let data: any = {};

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
    <div className="min-h-screen bg-gradient-animated relative overflow-hidden flex items-center justify-center">
      {/* Background blobs */}
      <div className="absolute top-0 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob delay-2000" />

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="glass rounded-2xl p-8 opacity-0 animate-scale-in">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white mx-auto mb-6">
            <KeyRound size={26} />
          </div>

          <h1 className="text-2xl font-bold text-white text-center mb-2">Forgot Password</h1>
          <p className="text-white/50 text-sm text-center mb-8">
            Enter your email and we'll send you a reset link.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-white/70 text-sm font-medium mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-white text-purple-700 py-3 rounded-xl font-bold hover:bg-purple-50 transition-all shadow-lg hover:shadow-xl"
            >
              <Mail size={18} />
              Send Reset Link
            </button>
          </form>

          <Link
            to="/login"
            className="mt-6 flex items-center justify-center gap-1.5 text-white/50 hover:text-white/80 text-sm transition"
          >
            <ArrowLeft size={14} />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
