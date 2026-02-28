import { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import Header from '../components/common/Header';
import {
  Brain, BarChart3, Shield, Users, Sparkles,
  TrendingUp, Wallet, ArrowRight, ChevronRight,
} from 'lucide-react';

const Welcome = () => {
  const { user } = useContext(AuthContext);

  /* ---------- Unauthenticated landing ---------- */
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-animated relative overflow-hidden">
        {/* Floating background blobs */}
        <div className="absolute top-0 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob delay-2000" />
        <div className="absolute bottom-10 left-1/3 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob delay-4000" />

        {/* Navbar */}
        <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5">
          <div className="flex items-center gap-2 opacity-0 animate-fade-in">
            <Wallet className="text-white" size={28} />
            <span className="text-white font-bold text-xl tracking-tight">ExpenseAI</span>
          </div>
          <div className="flex items-center gap-3 opacity-0 animate-fade-in delay-200">
            <Link to="/about" className="text-white/80 hover:text-white text-sm font-medium transition">About</Link>
            <Link to="/contact" className="text-white/80 hover:text-white text-sm font-medium transition">Contact</Link>
            <Link
              to="/login"
              className="ml-2 bg-white/10 backdrop-blur text-white border border-white/20 px-5 py-2 rounded-full text-sm font-semibold hover:bg-white/20 transition"
            >
              Log In
            </Link>
            <Link
              to="/register"
              className="bg-white text-purple-700 px-5 py-2 rounded-full text-sm font-semibold hover:bg-purple-50 transition shadow-lg"
            >
              Sign Up
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-16 pb-24 md:pt-28 md:pb-36">
          <div className="opacity-0 animate-scale-in">
            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6">
              <Sparkles size={14} className="text-yellow-300" />
              Powered by Machine Learning
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-white leading-tight tracking-tight opacity-0 animate-slide-up delay-200">
            Smart Expense
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 via-pink-200 to-purple-200">
              Management
            </span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-white/75 max-w-2xl opacity-0 animate-fade-in delay-400">
            Track spending, detect anomalies with AI, forecast budgets, and
            collaborate with your team — all in one beautiful app.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 opacity-0 animate-fade-in delay-600">
            <Link
              to="/register"
              className="group flex items-center gap-2 bg-white text-purple-700 px-8 py-3.5 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
            >
              Get Started Free
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 text-white px-8 py-3.5 rounded-full font-bold text-lg hover:bg-white/20 transition"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Feature cards */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <Brain size={28} />,
                title: 'AI Categorization',
                desc: 'Type a description and our NLP model auto-classifies your expense into the right category.',
                color: 'from-purple-500 to-indigo-600',
                delay: 'delay-100',
              },
              {
                icon: <Shield size={28} />,
                title: 'Anomaly Detection',
                desc: 'Isolation Forest ML model flags unusual transactions so you always stay in control.',
                color: 'from-red-500 to-orange-500',
                delay: 'delay-300',
              },
              {
                icon: <TrendingUp size={28} />,
                title: 'Spending Forecast',
                desc: 'Linear Regression predicts your future weekly spend with confidence intervals.',
                color: 'from-emerald-500 to-teal-500',
                delay: 'delay-500',
              },
            ].map((f, i) => (
              <div
                key={i}
                className={`group glass rounded-2xl p-6 hover-lift cursor-default opacity-0 animate-slide-up ${f.delay}`}
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} text-white mb-4 group-hover:scale-110 transition-transform`}>
                  {f.icon}
                </div>
                <h3 className="text-white text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Additional features grid */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 pb-32">
          <h2 className="text-center text-white text-2xl md:text-3xl font-bold mb-10 opacity-0 animate-fade-in delay-500">
            Everything you need to manage expenses
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <Users size={22} />, label: 'Group Collaboration' },
              { icon: <BarChart3 size={22} />, label: 'Spending Analytics' },
              { icon: <Wallet size={22} />, label: 'Budget Targets' },
              { icon: <Sparkles size={22} />, label: 'Smart Insights' },
            ].map((item, i) => (
              <div
                key={i}
                className="glass-dark rounded-xl p-4 text-center hover-lift opacity-0 animate-fade-in delay-700"
              >
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 text-white mb-2">
                  {item.icon}
                </div>
                <p className="text-white/80 text-sm font-medium">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="relative z-10 border-t border-white/10 py-6 text-center text-white/50 text-sm">
          &copy; {new Date().getFullYear()} ExpenseAI &mdash; Built with React, Flask &amp; scikit-learn
        </footer>
      </div>
    );
  }

  /* ---------- Authenticated dashboard welcome ---------- */
  const displayName = user.fullName || user.email.split('@')[0];

  return (
    <div className="min-h-screen bg-gradient-animated relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob delay-2000" />

      <Header />

      <div className="relative z-10 container mx-auto py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          {/* Greeting */}
          <div className="opacity-0 animate-scale-in">
            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6">
              <Sparkles size={14} className="text-yellow-300" />
              Welcome back!
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight opacity-0 animate-slide-up delay-200">
            Hello,{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 via-pink-200 to-purple-200">
              {displayName}
            </span>
          </h1>

          <p className="mt-4 text-lg text-white/70 opacity-0 animate-fade-in delay-400">
            Ready to manage your expenses? Jump into a group or create a new one.
          </p>

          {/* Quick action cards */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                to: '/groups',
                icon: <Users size={24} />,
                title: 'My Groups',
                desc: 'View your groups',
                gradient: 'from-purple-500 to-indigo-600',
                delay: 'delay-300',
              },
              {
                to: '/join-group',
                icon: <ChevronRight size={24} />,
                title: 'Join Group',
                desc: 'Enter a group code',
                gradient: 'from-pink-500 to-rose-500',
                delay: 'delay-400',
              },
              {
                to: '/create-group',
                icon: <Sparkles size={24} />,
                title: 'Create Group',
                desc: 'Start a new group',
                gradient: 'from-emerald-500 to-teal-500',
                delay: 'delay-500',
              },
            ].map((card, i) => (
              <Link
                key={i}
                to={card.to}
                className={`group glass rounded-2xl p-6 text-left hover-lift opacity-0 animate-slide-up ${card.delay}`}
              >
                <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br ${card.gradient} text-white mb-3 group-hover:scale-110 transition-transform`}>
                  {card.icon}
                </div>
                <h3 className="text-white font-bold text-lg">{card.title}</h3>
                <p className="text-white/50 text-sm mt-1">{card.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-0 w-full border-t border-white/10 py-4 text-center text-white/40 text-sm">
        &copy; {new Date().getFullYear()} ExpenseAI
      </footer>
    </div>
  );
};

export default Welcome;
