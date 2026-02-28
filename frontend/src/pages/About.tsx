import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import { Brain, Users, BarChart3, Shield, Sparkles, Target, TrendingUp, Wallet } from 'lucide-react';

const About = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Users size={24} />,
      title: 'Group Collaboration',
      desc: 'Create or join groups based on shared projects, trips, or households.',
      gradient: 'from-purple-500 to-indigo-600',
    },
    {
      icon: <Wallet size={24} />,
      title: 'Expense Tracking',
      desc: 'Log expenses with items, prices, and categories in a clean interface.',
      gradient: 'from-pink-500 to-rose-500',
    },
    {
      icon: <Brain size={24} />,
      title: 'AI Categorization',
      desc: 'NLP model auto-classifies expenses using TF-IDF + Logistic Regression.',
      gradient: 'from-amber-500 to-orange-500',
    },
    {
      icon: <Shield size={24} />,
      title: 'Anomaly Detection',
      desc: 'Isolation Forest flags unusual transactions with severity scores.',
      gradient: 'from-red-500 to-rose-600',
    },
    {
      icon: <TrendingUp size={24} />,
      title: 'Spending Forecast',
      desc: 'Linear Regression predicts weekly spend with 95% confidence intervals.',
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      icon: <Target size={24} />,
      title: 'Budget Targets',
      desc: 'Set spending limits and get alerts when you approach or exceed them.',
      gradient: 'from-cyan-500 to-blue-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-animated relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 -right-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob" />
      <div className="absolute bottom-20 -left-20 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob delay-2000" />

      <Header showBackButton onBack={() => navigate('/')} />

      <div className="relative z-10 container mx-auto py-16 px-4">
        {/* Hero text */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="opacity-0 animate-scale-in">
            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6">
              <Sparkles size={14} className="text-yellow-300" />
              About ExpenseAI
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight opacity-0 animate-slide-up delay-200">
            Smart finances,{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 via-pink-200 to-purple-200">
              powered by AI
            </span>
          </h1>
          <p className="mt-5 text-lg text-white/65 max-w-2xl mx-auto opacity-0 animate-fade-in delay-400">
            ExpenseAI combines collaborative expense management with machine learning to give you
            intelligent insights, anomaly detection, and spending forecasts — all in real time.
          </p>
        </div>

        {/* Feature grid */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((f, i) => (
            <div
              key={i}
              className={`group glass rounded-2xl p-6 hover-lift opacity-0 animate-slide-up delay-${(i + 2) * 100}`}
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} text-white mb-4 group-hover:scale-110 transition-transform`}>
                {f.icon}
              </div>
              <h3 className="text-white text-lg font-bold mb-2">{f.title}</h3>
              <p className="text-white/55 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div className="max-w-4xl mx-auto glass rounded-2xl p-8 opacity-0 animate-fade-in delay-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '3', label: 'ML Models' },
              { value: '8', label: 'Categories' },
              { value: '25+', label: 'API Endpoints' },
              { value: '∞', label: 'Possibilities' },
            ].map((s, i) => (
              <div key={i}>
                <div className="text-3xl md:text-4xl font-extrabold text-white">{s.value}</div>
                <div className="text-white/50 text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Mission */}
        <p className="text-center text-white/40 text-sm mt-12 italic opacity-0 animate-fade-in delay-700">
          Built with React, Flask, scikit-learn &amp; Tailwind CSS — a portfolio project for AI/ML engineering.
        </p>
      </div>
    </div>
  );
};

export default About;
