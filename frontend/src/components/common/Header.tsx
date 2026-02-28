import { useEffect, useState, useRef, useContext } from 'react';
import { Bell, User, ChevronLeft, Wallet, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';

const Header = ({ showBackButton = false, onBack }: { showBackButton?: boolean; onBack?: () => void }) => {
  const { user, logout } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.email) return;
      try {
        const res = await fetch(`http://127.0.0.1:5000/api/notifications/${encodeURIComponent(user.email)}`);
        const data = await res.json();
        if (Array.isArray(data)) setNotifications(data);
        else if (data.notifications && Array.isArray(data.notifications)) setNotifications(data.notifications);
        else setNotifications([]);
      } catch {
        setNotifications([]);
      }
    };
    fetchNotifications();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) setShowUserMenu(false);
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) setShowNotifications(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = user
    ? [
        { to: '/create-group', label: 'Create Group' },
        { to: '/join-group', label: 'Join Group' },
        { to: '/groups', label: 'Groups' },
        { to: '/about', label: 'About' },
        { to: '/contact', label: 'Contact' },
      ]
    : [
        { to: '/about', label: 'About' },
        { to: '/contact', label: 'Contact' },
      ];

  return (
    <header className="relative z-50 glass border-b border-white/10">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-6 py-3">
        {/* Left — back + logo */}
        <div className="flex items-center gap-2">
          {showBackButton && (
            <button
              onClick={onBack}
              className="p-2 rounded-full hover:bg-white/10 transition text-white"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center shadow">
              <Wallet size={16} className="text-white" />
            </div>
            <span className="text-white font-bold text-lg hidden sm:inline tracking-tight">ExpenseAI</span>
          </Link>
        </div>

        {/* Center — desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-white/70 hover:text-white text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-white/10 transition"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right — notifications + user + mobile toggle */}
        <div className="flex items-center gap-2">
          {user && (
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-full hover:bg-white/10 transition text-white relative"
              >
                <Bell size={18} />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 glass-dark rounded-xl shadow-2xl py-1 z-50 max-h-60 overflow-y-auto border border-white/10">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-white/50">No new notifications</div>
                  ) : (
                    notifications.map((n: any) => (
                      <div key={n.id} className="px-4 py-3 text-sm text-white/80 border-b border-white/5 last:border-none">
                        {n.message}
                        <div className="text-xs text-white/30 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {user && (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow hover:scale-105 transition-transform"
              >
                {(user.fullName || user.email).charAt(0).toUpperCase()}
              </button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-44 glass-dark rounded-xl shadow-2xl py-1 z-50 border border-white/10">
                  <Link
                    to="/profile"
                    className="block px-4 py-2.5 text-sm text-white/80 hover:bg-white/10 transition"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                    }}
                    className="block w-full text-left px-4 py-2.5 text-sm text-red-300 hover:bg-white/10 transition"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-full hover:bg-white/10 transition text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile nav overlay */}
      {mobileOpen && (
        <div className="md:hidden glass-dark border-t border-white/10 py-4 px-6 flex flex-col gap-2 animate-fade-in">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-white/80 hover:text-white py-2 text-sm font-medium"
              onClick={() => setMobileOpen(false)}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
};

export default Header;
