
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import GroupContext from '../../contexts/GroupContext';
import GroupCard from './GroupCard';
import Header from '../common/Header';
import { Users, PlusCircle, UserPlus } from 'lucide-react';

const GroupsList = () => {
  const { userGroups } = useContext(GroupContext);

  return (
    <div className="min-h-screen bg-gradient-animated relative overflow-hidden">
      {/* Floating blobs */}
      <div className="absolute top-20 -left-32 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
      <div className="absolute top-60 -right-32 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob delay-2000" />
      <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob delay-4000" />

      <Header 
        showBackButton 
        onBack={() => window.history.back()}
      />
      
      <div className="container mx-auto py-8 px-4 relative z-10">
        <h1 className="text-4xl font-bold mb-8 text-center text-white opacity-0 animate-fade-in">Your Groups</h1>
        
        {userGroups.length === 0 ? (
          <div className="text-center py-16 opacity-0 animate-fade-in delay-200">
            <div className="glass rounded-2xl p-12 max-w-md mx-auto">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <Users className="text-white" size={36} />
              </div>
              <h2 className="text-2xl font-bold mb-3 text-white">No Groups Yet</h2>
              <p className="text-white/60 mb-8 max-w-sm mx-auto">
                You haven't joined any groups yet. Create a new group or join an existing one to get started.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/create-group"
                  className="inline-flex items-center justify-center gap-2 bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl hover:bg-white/30 transition border border-white/20 font-medium"
                >
                  <PlusCircle size={18} />
                  Create a Group
                </Link>
                <Link
                  to="/join-group"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white/80 px-6 py-3 rounded-xl hover:bg-white/20 transition border border-white/10 font-medium"
                >
                  <UserPlus size={18} />
                  Join a Group
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userGroups.map((group, index) => (
              <div key={group.id} className={`opacity-0 animate-slide-up delay-${Math.min((index + 1) * 100, 700)}`}>
                <GroupCard group={group} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupsList;

