import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import GroupContext from '../../contexts/GroupContext';
import AuthContext from '../../contexts/AuthContext';
import { toast } from '../../components/ui/sonner';
import Header from '../common/Header';
import { Users, Copy, ArrowRight, FileText, Hash, Mail, Type } from 'lucide-react';

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
          email: user.email,
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
    <div className="min-h-screen bg-gradient-animated relative overflow-hidden">
      {/* Floating blobs */}
      <div className="absolute top-20 -left-32 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
      <div className="absolute top-60 -right-32 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob delay-2000" />
      <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob delay-4000" />

      <Header showBackButton onBack={() => navigate('/')} />
      <div className="container mx-auto py-8 px-4 relative z-10">
        <div className="max-w-2xl mx-auto opacity-0 animate-scale-in">
          <div className="glass rounded-2xl p-8 md:p-10">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <Users className="text-white" size={28} />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-8 text-center text-white">Create Group</h1>

            {groupCode ? (
              <div className="text-center opacity-0 animate-fade-in">
                <div className="bg-emerald-500/20 border border-emerald-400/30 rounded-2xl p-8 mb-6">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-emerald-500/30 flex items-center justify-center">
                    <Users className="text-emerald-300" size={24} />
                  </div>
                  <h2 className="text-xl font-bold mb-4 text-white">Group Created!</h2>
                  <p className="text-white/60 mb-3">Your group code:</p>
                  <div className="bg-white/10 border border-white/10 p-4 rounded-xl font-mono text-2xl text-white tracking-widest flex items-center justify-center gap-3">
                    {groupCode}
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(groupCode);
                        toast.success('Code copied!');
                      }}
                      className="text-white/50 hover:text-white transition"
                    >
                      <Copy size={20} />
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/groups')}
                  className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl transition border border-white/20 font-medium"
                >
                  Go to My Groups
                  <ArrowRight size={18} />
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-white/70 mb-1.5">Group Name</label>
                  <div className="relative">
                    <Type className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white/10 border border-white/10 text-white placeholder-white/30 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-transparent transition"
                      placeholder="Enter group name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="size" className="block text-sm font-medium text-white/70 mb-1.5">Group Size</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                    <input
                      id="size"
                      type="number"
                      min="1"
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                      className="w-full bg-white/10 border border-white/10 text-white placeholder-white/30 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-transparent transition"
                      placeholder="Max members"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">Your Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      readOnly
                      className="w-full bg-white/5 border border-white/5 text-white/50 pl-10 pr-4 py-3 rounded-xl cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-white/70 mb-1.5">Group Description</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 text-white/30" size={18} />
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full bg-white/10 border border-white/10 text-white placeholder-white/30 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-transparent transition resize-none"
                      placeholder="What's this group about?"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3.5 rounded-xl hover:from-purple-500 hover:to-indigo-500 transition-all duration-300 font-semibold shadow-lg shadow-purple-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Users size={18} />
                      Create Group
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupForm;
