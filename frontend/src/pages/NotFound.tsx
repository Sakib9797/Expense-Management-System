import { useLocation, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { Home, AlertTriangle } from 'lucide-react';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-animated relative overflow-hidden flex items-center justify-center">
      {/* Background blobs */}
      <div className="absolute top-0 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob delay-2000" />

      <div className="relative z-10 text-center px-6">
        <div className="opacity-0 animate-scale-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur border border-white/20 mb-6">
            <AlertTriangle size={36} className="text-yellow-300" />
          </div>
        </div>
        <h1 className="text-8xl md:text-9xl font-extrabold text-white opacity-0 animate-slide-up delay-200">
          404
        </h1>
        <p className="mt-4 text-xl text-white/60 opacity-0 animate-fade-in delay-400">
          Oops! This page doesn't exist.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 bg-white text-purple-700 px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all opacity-0 animate-fade-in delay-600"
        >
          <Home size={18} />
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
