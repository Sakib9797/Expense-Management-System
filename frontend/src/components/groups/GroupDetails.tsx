import { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GroupContext, { Group } from '../../contexts/GroupContext';
import AuthContext from '../../contexts/AuthContext';
import { toast } from '../../components/ui/sonner';
import Header from '../common/Header';
import GroupChat from './GroupChat';
import DirectMessages from './DirectMessages';
import { Users, MessageCircle, MessageSquare, Trash2, Crown, Copy, Home } from 'lucide-react';

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
      <div className="min-h-screen bg-gradient-animated flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gradient-animated relative overflow-hidden">
        <div className="absolute top-20 -left-32 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" />
        <Header showBackButton onBack={() => navigate('/groups')} />
        <div className="container mx-auto py-12 px-4 text-center relative z-10">
          <h2 className="text-2xl font-bold mb-4 text-white">Group not found</h2>
          <p className="mb-6 text-white/70">This group may have been deleted or you don't have access to it.</p>
          <button
            onClick={() => navigate('/groups')}
            className="bg-white/20 backdrop-blur-sm text-white px-6 py-2 rounded-lg hover:bg-white/30 transition border border-white/20"
          >
            Back to Groups
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: 'members' as const, label: 'Members', icon: Users },
    { key: 'chat' as const, label: 'Group Chat', icon: MessageCircle },
    { key: 'dm' as const, label: 'Direct Messages', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-gradient-animated relative overflow-hidden">
      {/* Floating blobs */}
      <div className="absolute top-20 -left-32 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
      <div className="absolute top-60 -right-32 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob delay-2000" />
      <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob delay-4000" />

      <Header 
        showBackButton 
        onBack={() => navigate('/groups')}
      />
      
      <div className="container mx-auto py-8 px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header card */}
          <div className="opacity-0 animate-fade-in">
            <div className="glass rounded-2xl p-6 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h1 className="text-2xl font-bold text-white">{group.name}</h1>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/group/${group.id}`)}
                  className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white px-4 py-2 rounded-xl transition border border-white/10 text-sm font-medium"
                >
                  <Home size={16} />
                  Group Home
                </button>
                {group.members.some(m => m.email === user?.email) && (
                  <button
                    onClick={handleLeaveGroup}
                    disabled={isLeavingGroup}
                    className="inline-flex items-center gap-2 bg-red-500/30 hover:bg-red-500/50 text-red-200 px-4 py-2 rounded-xl transition border border-red-400/20 text-sm font-medium disabled:opacity-50"
                  >
                    {isLeavingGroup ? 'Leaving...' : 'Leave Group'}
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Group Code card */}
          <div className="opacity-0 animate-slide-up delay-100">
            <div className="glass rounded-2xl p-6 mb-6">
              <h2 className="text-lg font-semibold mb-3 text-white">Group Code</h2>
              <div className="bg-white/10 rounded-xl p-3 flex items-center justify-between border border-white/10">
                <span className="font-mono font-bold text-white text-lg tracking-wider">{group.code}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(group.code);
                    toast.success('Code copied to clipboard!');
                  }}
                  className="text-white/60 hover:text-white transition p-2 rounded-lg hover:bg-white/10"
                >
                  <Copy size={18} />
                </button>
              </div>
              <p className="mt-2.5 text-sm text-white/50">
                Share this code with others to allow them to join your group
              </p>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="opacity-0 animate-slide-up delay-200">
            <div className="glass rounded-2xl overflow-hidden">
              <div className="border-b border-white/10">
                <div className="flex">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex-1 px-4 py-4 text-center font-medium transition flex items-center justify-center gap-2 text-sm ${
                          activeTab === tab.key
                            ? 'border-b-2 border-white text-white bg-white/10'
                            : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                        }`}
                      >
                        <Icon size={18} />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-6">
                {activeTab === 'members' && (
                  <div>
                    <h2 className="text-lg font-semibold mb-4 text-white">Group Members ({group.members.length})</h2>
                    <div className="space-y-2">
                      {group.members.map((member) => {
                        const isOwner = group.createdBy === member.email;
                        const isCurrentUser = member.email === user?.email;
                        const isUserOwner = group.createdBy === user?.email;

                        return (
                          <div
                            key={member.userId}
                            className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl transition ${
                              isCurrentUser ? 'bg-white/15 border border-white/20' : 'bg-white/5 border border-white/5 hover:bg-white/10'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                {(member.fullName || member.email.split('@')[0]).charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-white font-medium">
                                    {member.fullName || member.email.split('@')[0]}
                                  </span>
                                  {isCurrentUser && (
                                    <span className="text-xs bg-purple-500/30 text-purple-200 px-2 py-0.5 rounded-full border border-purple-400/20">
                                      You
                                    </span>
                                  )}
                                  {isOwner && (
                                    <span className="text-xs bg-amber-500/30 text-amber-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1 border border-amber-400/20">
                                      <Crown size={10} />
                                      Owner
                                    </span>
                                  )}
                                </div>
                                <p className="text-white/40 text-sm">{member.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 mt-2 sm:mt-0">
                              <span className="text-white/30 text-xs">
                                Joined {new Date(member.joinedAt).toLocaleDateString()}
                              </span>
                              {isCurrentUser && isUserOwner ? null : isCurrentUser ? (
                                <button
                                  onClick={handleLeaveGroup}
                                  disabled={isLeavingGroup}
                                  className="text-red-300 hover:text-red-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm bg-red-500/20 px-3 py-1.5 rounded-lg hover:bg-red-500/30 transition"
                                >
                                  <Trash2 size={14} />
                                  {isLeavingGroup ? 'Leaving...' : 'Leave'}
                                </button>
                              ) : isUserOwner ? (
                                <button
                                  onClick={() => handleRemoveMember(member.email, member.fullName || member.email.split('@')[0])}
                                  disabled={removingMemberId === member.userId}
                                  className="text-red-300 hover:text-red-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm bg-red-500/20 px-3 py-1.5 rounded-lg hover:bg-red-500/30 transition"
                                >
                                  <Trash2 size={14} />
                                  {removingMemberId === member.userId ? 'Removing...' : 'Remove'}
                                </button>
                              ) : null}
                            </div>
                          </div>
                        );
                      })}
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
    </div>
  );
};

export default GroupDetails;

