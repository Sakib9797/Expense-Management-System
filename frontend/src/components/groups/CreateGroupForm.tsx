import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import GroupContext from '../../contexts/GroupContext';
import AuthContext from '../../contexts/AuthContext';
import { toast } from '../../components/ui/sonner';
import Header from '../common/Header';

const CreateGroupForm = () => {
  const [name, setName] = useState('');
  const [size, setSize] = useState('');
  const [description, setDescription] = useState('');
  const [groupCode, setGroupCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const createGroup = async (groupData: {
    name: string;
    size: number;
    description: string;
  }): Promise<{ id: number; code: string } | null> => {
    if (!user) return null;

    try {
      const res = await fetch('http://127.0.0.1:5000/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...groupData,
          email: user.email, // from login
        }),
      });

      const data = await res.json();
      if (res.ok) {
        return data;
      } else {
        console.error('Backend error:', data.error || data.message);
        return null;
      }
    } catch (error) {
      console.error('Create group failed:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !size || !description) {
      toast.error('Please fill all fields');
      return;
    }

    const sizeNum = parseInt(size);
    if (isNaN(sizeNum) || sizeNum <= 0) {
      toast.error('Group size must be a number greater than 0');
      return;
    }

    setIsLoading(true);

    try {
      const result = await createGroup({
        name,
        size: sizeNum,
        description,
      });

      if (result) {
        setGroupCode(result.code);
        toast.success('Group created successfully!');
      } else {
        toast.error('Failed to create group');
      }
    } catch {
      toast.error('An error occurred while creating the group');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-purple">
      <Header showBackButton onBack={() => navigate('/')} />
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6 md:p-8">
          <h1 className="text-3xl font-bold mb-8 text-center">Create Group</h1>

          {groupCode ? (
            <div className="text-center">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Group Created!</h2>
                <p>Your group code:</p>
                <div className="bg-gray-100 p-4 rounded-md mt-2 font-mono text-2xl">{groupCode}</div>
              </div>
              <button
                onClick={() => navigate('/groups')}
                className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700"
              >
                Go to My Groups
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Group Name</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border px-3 py-2 rounded-md"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="size" className="block text-sm font-medium text-gray-700">Group Size</label>
                <input
                  id="size"
                  type="number"
                  min="1"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="w-full border px-3 py-2 rounded-md"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Your Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  readOnly
                  className="w-full border px-3 py-2 rounded-md bg-gray-100"
                />
              </div>

              <div className="mb-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Group Description</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full border px-3 py-2 rounded-md"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-purple-700 text-white py-2 rounded-md hover:bg-purple-800"
              >
                {isLoading ? 'Creating...' : 'Create Group'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateGroupForm;
