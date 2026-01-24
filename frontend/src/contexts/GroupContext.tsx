
import { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import AuthContext from './AuthContext';

export interface GroupMember {
  userId: string;
  email: string;
  fullName?: string;
  joinedAt: string;
}

export interface Group {
  id: string;
  name: string;
  size: number;
  description: string;
  code: string;
  createdBy: string;
  createdAt: string;
  members: GroupMember[];
}

interface GroupContextType {
  userGroups: Group[];
  createGroup: (groupData: Omit<Group, 'id' | 'code' | 'createdAt' | 'members'>) => Promise<Group | null>;
  joinGroup: (code: string) => Promise<boolean>;
  leaveGroup: (groupId: string) => Promise<boolean>;
  getGroupDetails: (groupId: string) => Group | null;
  fetchUserGroups: () => void;
}

export const GroupContext = createContext<GroupContextType>({
  userGroups: [],
  createGroup: async () => null,
  joinGroup: async () => false,
  leaveGroup: async () => false,
  getGroupDetails: () => null,
  fetchUserGroups: () => {},
});

interface GroupProviderProps {
  children: ReactNode;
}

export const GroupProvider = ({ children }: GroupProviderProps) => {
  const [userGroups, setUserGroups] = useState<Group[]>([]);
  const { user } = useContext(AuthContext);

  // Load user groups on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchUserGroups();
    } else {
      setUserGroups([]);
    }
  }, [user]);

  // Helper to generate a random 5-character code
  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Fetch user's groups
const fetchUserGroups = async () => {
  if (!user || !user.email) return;

  try {
    const res = await fetch(`http://127.0.0.1:5000/api/groups/user/${encodeURIComponent(user.email)}`);
    const data = await res.json();

    console.log('[fetchUserGroups] Response:', data); // helpful for debugging

    if (res.ok) {
      const parsedGroups = data.map((group: any) => ({
        id: group.id.toString(),
        name: group.name,
        description: group.description,
        code: group.code,
        createdBy: group.email,
        size: group.size,
        createdAt: '', // not provided by backend yet
        members: Array.isArray(group.members)
          ? group.members.map((m: any) => ({
              userId: m.userId?.toString(),
              email: m.email,
              fullName: m.fullName || '',
              joinedAt: m.joinedAt,
            }))
          : [],
      }));

      setUserGroups(parsedGroups);
    } else {
      console.error('[fetchUserGroups] Error:', data.message);
      setUserGroups([]);
    }
  } catch (error) {
    console.error('[fetchUserGroups] Failed:', error);
    setUserGroups([]);
  }
};


  // Create a new group
  const createGroup = async (groupData: Omit<Group, 'id' | 'code' | 'createdAt' | 'members'>): Promise<Group | null> => {
    if (!user || !user.email) return null;

    try {
      const res = await fetch('http://127.0.0.1:5000/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: groupData.name,
          description: groupData.description,
          size: groupData.size,
          email: user.email,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        // Refresh the groups list from backend
        await fetchUserGroups();
        return data.group || data;
      } else {
        console.error('Create group failed:', data.message);
        return null;
      }
    } catch (error) {
      console.error('Error creating group:', error);
      return null;
    }
  };

  // Join a group using code
  const joinGroup = async (code: string): Promise<boolean> => {
    if (!user || !user.email) return false;

    try {
      const res = await fetch('http://127.0.0.1:5000/api/groups/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, email: user.email }),
      });

      const data = await res.json();
      if (res.ok) {
        // Refresh group list from backend
        await fetchUserGroups();
        return true;
      } else {
        console.error('Join failed:', data.message);
        return false;
      }
    } catch (err) {
      console.error('Error during join request:', err);
      return false;
    }
  };

  // Leave a group
  const leaveGroup = async (groupId: string): Promise<boolean> => {
  if (!user) return false;

  try {
    const res = await fetch(`http://127.0.0.1:5000/api/groups/${groupId}/leave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email }),
    });

    const data = await res.json();
    if (res.ok) {
      await fetchUserGroups();
      return true;
    } else {
      console.error('Leave group failed:', data.message);
      return false;
    }
  } catch (err) {
    console.error('Error during leave request:', err);
    return false;
  }
};
  // Get details of a specific group
  const getGroupDetails = (groupId: string): Group | null => {
    return userGroups.find(g => g.id === groupId) || null;
  };

  return (
    <GroupContext.Provider
      value={{
        userGroups,
        createGroup,
        joinGroup,
        leaveGroup,
        getGroupDetails,
        fetchUserGroups,
      }}
    >
      {children}
    </GroupContext.Provider>
  );
};

export default GroupContext;
