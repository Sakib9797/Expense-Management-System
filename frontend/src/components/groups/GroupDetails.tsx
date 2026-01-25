import { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GroupContext, { Group } from '../../contexts/GroupContext';
import AuthContext from '../../contexts/AuthContext';
import { toast } from '../../components/ui/sonner';
import Header from '../common/Header';
import GroupChat from './GroupChat';
import DirectMessages from './DirectMessages';
import { Users, MessageCircle, MessageSquare, Trash2, Crown } from 'lucide-react';

const GroupDetails = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const [group, setGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLeavingGroup, setIsLeavingGroup] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'members' | 'chat' | 'dm'>('members');
  
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
    
    const isOwner = group?.createdBy === user?.email;
    const confirmMessage = isOwner 
      ? 'As the owner, leaving will transfer ownership to the next member. Continue?' 
      : 'Are you sure you want to leave this group?';
    
    if (!confirm(confirmMessage)) return;
    
    setIsLeavingGroup(true);
    try {
      const success = await leaveGroup(groupId);
      if (success) {
        toast.success(isOwner ? 'Ownership transferred. You have left the group' : 'You have left the group');
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

  const handleRemoveMember = async (memberEmail: string, memberName: string) => {
    if (!groupId || !user) return;

    if (!confirm(`Are you sure you want to remove ${memberName} from the group?`)) {
      return;
    }

    setRemovingMemberId(group?.members.find(m => m.email === memberEmail)?.userId || null);

    try {
      const res = await fetch(`http://127.0.0.1:5000/api/group/${groupId}/members/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner_email: user.email,
          member_email: memberEmail
        })
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Member removed successfully');
        // Refresh group data
        const updatedGroup = getGroupDetails(groupId);
        setGroup(updatedGroup);
      } else {
        toast.error(data.message || 'Failed to remove member');
      }
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('An error occurred');
    } finally {
      setRemovingMemberId(null);
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
          
          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="border-b">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('members')}
                  className={`flex-1 px-6 py-4 text-center font-medium transition flex items-center justify-center gap-2 ${
                    activeTab === 'members'
                      ? 'border-b-2 border-purple-600 text-purple-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Users size={20} />
                  Members
                </button>
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex-1 px-6 py-4 text-center font-medium transition flex items-center justify-center gap-2 ${
                    activeTab === 'chat'
                      ? 'border-b-2 border-purple-600 text-purple-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <MessageCircle size={20} />
                  Group Chat
                </button>
                <button
                  onClick={() => setActiveTab('dm')}
                  className={`flex-1 px-6 py-4 text-center font-medium transition flex items-center justify-center gap-2 ${
                    activeTab === 'dm'
                      ? 'border-b-2 border-purple-600 text-purple-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <MessageSquare size={20} />
                  Direct Messages
                </button>
              </div>
            </div>

            <div className="p-6">
              {activeTab === 'members' && (
                <div>
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
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {group.members.map((member) => {
                          const isOwner = group.createdBy === member.email;
                          const isCurrentUser = member.email === user?.email;
                          const isUserOwner = group.createdBy === user?.email;

                          return (
                            <tr key={member.userId} className={isCurrentUser ? "bg-purple-50" : ""}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <div className="text-sm font-medium text-gray-900">
                                    {member.fullName || member.email.split('@')[0]}
                                    {isCurrentUser && (
                                      <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                                        You
                                      </span>
                                    )}
                                    {isOwner && (
                                      <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full inline-flex items-center gap-1">
                                        <Crown size={12} />
                                        Owner
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{member.email}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(member.joinedAt).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {isCurrentUser && isUserOwner ? (
                                  // Owner on their own row - show nothing
                                  null
                                ) : isCurrentUser ? (
                                  // Regular member on their own row - show Leave button
                                  <button
                                    onClick={handleLeaveGroup}
                                    disabled={isLeavingGroup}
                                    className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                  >
                                    <Trash2 size={16} />
                                    {isLeavingGroup ? 'Leaving...' : 'Leave'}
                                  </button>
                                ) : isUserOwner ? (
                                  // Owner viewing other members - show Remove button
                                  <button
                                    onClick={() => handleRemoveMember(member.email, member.fullName || member.email.split('@')[0])}
                                    disabled={removingMemberId === member.userId}
                                    className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                  >
                                    <Trash2 size={16} />
                                    {removingMemberId === member.userId ? 'Removing...' : 'Remove'}
                                  </button>
                                ) : null}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'chat' && (
                <div className="h-[600px]">
                  <GroupChat />
                </div>
              )}

              {activeTab === 'dm' && (
                <div className="h-[600px]">
                  <DirectMessages />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupDetails;

