import { useEffect, useState, useRef } from 'react';
import { useContext } from 'react';
import { Bell, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';

const Header = ({ showBackButton = false, onBack }: { showBackButton?: boolean; onBack?: () => void }) => {
  const { user, logout } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.email) return;

      try {
        const res = await fetch(`http://127.0.0.1:5000/api/notifications/${encodeURIComponent(user.email)}`);
        const data = await res.json();
        
        // Handle both array and object responses
        if (Array.isArray(data)) {
          setNotifications(data);
        } else if (data.notifications && Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
        } else {
          console.error('Unexpected notifications format:', data);
          setNotifications([]);
        }
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
        setNotifications([]);
      }
    };

    fetchNotifications();
  }, [user]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-purple-700 text-white p-4 flex justify-between items-center">
      <div className="flex items-center">
        {showBackButton && (
          <button 
            onClick={onBack} 
            className="mr-4 p-2 rounded-full hover:bg-purple-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>
        )}

        <Link to="/" className="flex items-center">
          <div className="bg-white text-purple-700 rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg">
            {user ? user.email.charAt(0).toUpperCase() : 'U'}
          </div>
        </Link>
      </div>

      <nav className="hidden md:flex items-center space-x-6">
        {user ? (
          <>
            <Link to="/create-group" className="hover:text-purple-200">Create Group</Link>
            <Link to="/join-group" className="hover:text-purple-200">Join Group</Link>
            <Link to="/groups" className="hover:text-purple-200">Groups</Link>
            <Link to="/about" className="hover:text-purple-200">About</Link>
            <Link to="/contact" className="hover:text-purple-200">Contact</Link>
          </>
        ) : (
          <>
            <Link to="/about" className="hover:text-purple-200">About</Link>
            <Link to="/contact" className="hover:text-purple-200">Contact</Link>
          </>
        )}
      </nav>

      <div className="flex items-center space-x-4">
{user && (
  <div className="relative" ref={notificationRef}>
    <button 
      onClick={() => setShowNotifications(!showNotifications)}
      className="p-2 rounded-full hover:bg-purple-600 relative"
    >
      <Bell size={20} />
      {notifications.length > 0 && (
        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
      )}
    </button>

    {showNotifications && (
      <div className="absolute right-0 mt-2 w-64 bg-white text-black rounded-md shadow-lg py-1 z-10 max-h-60 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-4 py-2 text-sm text-gray-500">No new notifications</div>
        ) : (
          notifications.map((n) => (
            <div key={n.id} className="px-4 py-2 text-sm text-gray-700 border-b last:border-none">
              {n.message}
              <div className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</div>
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
              className="p-2 rounded-full hover:bg-purple-600"
            >
              <User size={20} />
            </button>
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                <Link 
                  to="/profile" 
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setShowUserMenu(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
