import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import GroupContext from '../../contexts/GroupContext';
import { toast } from '../../components/ui/sonner';
import Header from '../common/Header';
import { Search, Users, UserPlus, Key } from 'lucide-react';
import AuthContext from '@/contexts/AuthContext';

const JoinGroupForm = () => {
  const [groupCode, setGroupCode] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const { user } = useContext(AuthContext);
  const { joinGroup } = useContext(GroupContext);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!groupCode) {
      toast.error('Please enter a group code');
      return;
    }

    setIsLoading(true);

    try {
      const success = await joinGroup(groupCode.toUpperCase());
      if (success) {
        toast.success('Successfully joined the group!');
        navigate('/groups');
      } else {
        toast.error('Invalid group code or you are already a member');
      }
    } catch (error) {
      toast.error('An error occurred while joining the group');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMatchingGroups = async (query: string) => {
    if (!query || !user?.email) {
      setSearchResults([]);
      return;
    }

    try {
      const res = await fetch(
        `http://127.0.0.1:5000/api/groups/search?query=${encodeURIComponent(query)}&email=${encodeURIComponent(user.email)}`
      );
      const data = await res.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-animated relative overflow-hidden">
      {/* Floating blobs */}
      <div className="absolute top-20 -left-32 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
      <div className="absolute top-60 -right-32 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob delay-2000" />
      <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob delay-4000" />

      <Header showBackButton onBack={() => navigate('/')} />

      <div className="container mx-auto py-8 px-4 relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-center mb-6 opacity-0 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <UserPlus className="text-white" size={28} />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-8 text-center text-white opacity-0 animate-fade-in">Join a Group</h1>

          {/* Join with Code */}
          <div className="opacity-0 animate-slide-up delay-100">
            <div className="glass rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Key className="text-white/60" size={20} />
                <h2 className="text-lg font-semibold text-white">Join with Code</h2>
              </div>
              <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-grow">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                  <input
                    type="text"
                    value={groupCode}
                    onChange={(e) => setGroupCode(e.target.value.toUpperCase())}
                    className="w-full bg-white/10 border border-white/10 text-white placeholder-white/30 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-transparent transition font-mono tracking-wider"
                    placeholder="Enter group code"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-purple-500 hover:to-indigo-500 transition-all font-medium shadow-lg shadow-purple-500/25 disabled:opacity-50"
                >
                  <Users size={18} />
                  <span>{isLoading ? 'Joining...' : 'Join Group'}</span>
                </button>
              </form>
            </div>
          </div>

          {/* Search Groups */}
          <div className="opacity-0 animate-slide-up delay-200">
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Search className="text-white/60" size={20} />
                <h2 className="text-lg font-semibold text-white">Search Groups</h2>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchQuery(value);
                    fetchMatchingGroups(value);
                  }}
                  className="w-full bg-white/10 border border-white/10 text-white placeholder-white/30 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-transparent transition"
                  placeholder="Search by group name..."
                />

                {searchResults.length > 0 && (
                  <ul className="absolute z-10 bg-gray-900/95 backdrop-blur-lg border border-white/10 w-full mt-2 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                    {searchResults.map((group) => (
                      <li
                        key={group.id}
                        className="px-4 py-3 text-sm text-white/80 border-b border-white/5 last:border-none hover:bg-white/10 transition cursor-pointer flex items-center gap-2"
                      >
                        <Users className="text-purple-400" size={14} />
                        {group.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinGroupForm;
