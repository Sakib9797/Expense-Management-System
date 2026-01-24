
import { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GroupContext, { Group } from '../../contexts/GroupContext';
import AuthContext from '../../contexts/AuthContext';
import { toast } from '../../components/ui/sonner';
import Header from '../common/Header';

const GroupDetails = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const [group, setGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLeavingGroup, setIsLeavingGroup] = useState(false);
  
  const { getGroupDetails, leaveGroup } = useContext(GroupContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (groupId) {
      const groupData = getGroupDetails(groupId);
      setGroup(groupData);
      setIsLoading(false);
    }
  }, [groupId, getGroupDetails]);

  const handleLeaveGroup = async () => {
    if (!groupId) return;
    
    setIsLeavingGroup(true);
    try {
      const success = await leaveGroup(groupId);
      if (success) {
        toast.success('You have left the group');
        navigate('/groups');
      } else {
        toast.error('Failed to leave the group');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsLeavingGroup(false);
    }
  };

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
      />
      
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold">{group.name}</h1>
            <div className="flex">
              <button
                onClick={() => navigate(`/group/${group.id}`)}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 mr-2"
              >
                Group Home
              </button>
              {group.members.some(m => m.email === user?.email) && (
  <button
    onClick={handleLeaveGroup}
    disabled={isLeavingGroup}
    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 disabled:opacity-50"
  >
    {isLeavingGroup ? 'Leaving...' : 'Leave Group'}
  </button>
)}

            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold mb-2">Group Code</h2>
            <div className="bg-gray-100 p-3 rounded flex items-center justify-between">
              <span className="font-mono font-medium">{group.code}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(group.code);
                  toast.success('Code copied to clipboard!');
                }}
                className="text-blue-600 hover:text-blue-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Share this code with others to allow them to join your group
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Group Members ({group.members.length})</h2>
            
            <div className="overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {group.members.map((member) => (
                    <tr key={member.userId} className={member.userId === user?.id ? "bg-purple-50" : ""}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {member.fullName || "Anonymous"}
                          {member.userId === user?.id && (
                            <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                              You
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{member.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(member.joinedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupDetails;
