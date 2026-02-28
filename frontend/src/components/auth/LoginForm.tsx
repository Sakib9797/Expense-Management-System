import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from '../../components/ui/sonner';
import AuthContext from '../../contexts/AuthContext';
import { LogIn, Mail, Lock, Wallet, Sparkles } from 'lucide-react';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        toast.success('Login successful!');
        navigate('/');
      } else {
        toast.error('Invalid email or password');
      }
    } catch (error) {
      toast.error('An error occurred while logging in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-animated relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob delay-2000" />

      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center relative z-10 p-12">
        <div className="max-w-md opacity-0 animate-fade-in-left">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Wallet className="text-white" size={28} />
            </div>
            <span className="text-white font-bold text-2xl">ExpenseAI</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white leading-tight mb-4">
            Welcome back to
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-pink-200">
              smart expense tracking
            </span>
          </h1>
          <p className="text-white/60 text-lg">
            AI-powered categorization, anomaly detection, and spending forecasts — all at your fingertips.
          </p>
          <div className="mt-8 flex items-center gap-2 text-white/40 text-sm">
            <Sparkles size={14} />
            <span>Powered by scikit-learn &amp; TF-IDF</span>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center relative z-10 p-6">
        <div className="w-full max-w-md glass rounded-2xl p-8 opacity-0 animate-fade-in-right delay-200">
          <div className="lg:hidden flex items-center gap-2 mb-6 justify-center">
            <Wallet className="text-white" size={24} />
            <span className="text-white font-bold text-xl">ExpenseAI</span>
          </div>

          <h2 className="text-2xl font-bold text-white mb-1">Sign in</h2>
          <p className="text-white/50 text-sm mb-8">Enter your credentials to continue</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-white/70 text-sm font-medium mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-transparent transition"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-white/70 text-sm font-medium mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-transparent transition"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Link to="/forgot-password" className="text-sm text-purple-300 hover:text-purple-200 transition">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-white text-purple-700 py-3 rounded-xl font-bold hover:bg-purple-50 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {isLoading ? (
                <span className="animate-pulse">Signing in…</span>
              ) : (
                <>
                  <LogIn size={18} />
                  Sign In
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-white/50 text-sm">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-purple-300 hover:text-purple-200 font-medium transition">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
