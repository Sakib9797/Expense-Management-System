
import { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import GroupContext, { Group } from '../../contexts/GroupContext';
import { toast } from '../../components/ui/sonner';
import Header from '../common/Header';

const GroupHome = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const [group, setGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const { getGroupDetails } = useContext(GroupContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (groupId) {
      const groupData = getGroupDetails(groupId);
      setGroup(groupData);
      setIsLoading(false);
    }
  }, [groupId, getGroupDetails]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header showBackButton onBack={() => navigate('/groups')} />
        <div className="container mx-auto py-12 px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Group not found</h2>
          <p className="mb-6">This group may have been deleted or you don't have access to it.</p>
          <button
            onClick={() => navigate('/groups')}
            className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700"
          >
            Back to Groups
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        showBackButton 
        onBack={() => navigate('/groups')}
        showNotification
      />
      
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h1 className="text-2xl font-bold mb-2">{group.name}</h1>
            <p className="text-gray-600 mb-4">{group.description}</p>
            <div className="flex justify-end">
              <Link
                to={`/group/${group.id}/details`}
                className="text-purple-600 hover:text-purple-800 font-medium"
              >
                View Group Details
              </Link>
            </div>
          </div>
          
          <div className="flex flex-col items-center py-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl w-full">
              <Link
                to={`/group/${group.id}/spending`}
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg p-6 text-center shadow-md transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="font-medium">Spending & Insights</span>
              </Link>
              
              <Link
                to={`/group/${group.id}/create-expense`}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg p-6 text-center shadow-md transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <span className="font-medium">Create Expense Profile</span>
              </Link>
              
              <Link
                to={`/group/${group.id}/expense-profiles`}
                className="bg-purple-500 hover:bg-purple-600 text-white rounded-lg p-6 text-center shadow-md transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="font-medium">Expense Profiles</span>
              </Link>
              
              <Link
                to={`/group/${group.id}/items`}
                className="bg-green-500 hover:bg-green-600 text-white rounded-lg p-6 text-center shadow-md transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span className="font-medium">Items Price</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupHome;
