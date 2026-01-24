
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import GroupContext from '../../contexts/GroupContext';
import GroupCard from './GroupCard';
import Header from '../common/Header';

const GroupsList = () => {
  const { userGroups } = useContext(GroupContext);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        showBackButton 
        onBack={() => window.history.back()}
      />
      
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Your Groups</h1>
        
        {userGroups.length === 0 ? (
          <div className="text-center py-12">
            <div className="mb-4">
              <Users className="h-16 w-16 mx-auto text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">No Groups Yet</h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              You haven't joined any groups yet. Create a new group or join an existing one to get started.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/create-group"
                className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700"
              >
                Create a Group
              </Link>
              <Link
                to="/join-group"
                className="bg-gray-200 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300"
              >
                Join a Group
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userGroups.map(group => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupsList;

function Users(props: { className: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

