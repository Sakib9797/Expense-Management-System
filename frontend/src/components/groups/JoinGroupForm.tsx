import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import GroupContext from '../../contexts/GroupContext';
import { toast } from '../../components/ui/sonner';
import Header from '../common/Header';
import { Search, Users } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-purple">
      <Header showBackButton onBack={() => navigate('/')} />

      <div className="container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center text-white">Join a Group</h1>

          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Join with Code</h2>
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                value={groupCode}
                onChange={(e) => setGroupCode(e.target.value.toUpperCase())}
                className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter group code"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-md transition-colors"
              >
                <Users className="mr-2 h-5 w-5" />
                <span>Join Group</span>
              </button>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Search Groups</h2>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchQuery(value);
                  fetchMatchingGroups(value);
                }}
                className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Search by group name..."
              />

              {searchResults.length > 0 && (
                <ul className="absolute z-10 bg-white border w-full mt-1 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {searchResults.map((group) => (
                    <li
                      key={group.id}
                      className="px-4 py-2 text-sm text-gray-800 border-b last:border-none"
                    >
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
  );
};

export default JoinGroupForm;
