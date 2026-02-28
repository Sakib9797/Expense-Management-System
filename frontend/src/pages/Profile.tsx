import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import { toast } from '../components/ui/sonner';
import Header from '../components/common/Header';
import { Save, User, Phone, FileText, Sparkles } from 'lucide-react';

const Profile = () => {
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bio, setBio] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { user, updateProfile } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setGender(user.gender || '');
      setPhoneNumber(user.phoneNumber || '');
      setBio(user.bio || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      const success = await updateProfile({ fullName, gender, phoneNumber, bio });
      if (success) {
        toast.success('Profile updated successfully');
      } else {
        toast.error('Failed to update profile');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  const initials = (user.fullName || user.email).slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-animated relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob delay-2000" />

      <Header showBackButton onBack={() => navigate('/')} />

      <div className="relative z-10 container mx-auto py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Avatar + heading */}
          <div className="text-center mb-10">
            <div className="opacity-0 animate-scale-in">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-indigo-600 text-white text-2xl font-bold shadow-lg mb-4">
                {initials}
              </div>
            </div>
            <h1 className="text-3xl font-extrabold text-white opacity-0 animate-slide-up delay-200">
              Edit Profile
            </h1>
            <p className="text-white/50 text-sm mt-1 opacity-0 animate-fade-in delay-300">{user.email}</p>
          </div>

          {/* Form card */}
          <div className="glass rounded-2xl p-8 opacity-0 animate-slide-up delay-400">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-white/70 text-sm font-medium mb-1.5">Email (read-only)</label>
                <input
                  id="email"
                  type="email"
                  value={user.email}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white/50 cursor-not-allowed"
                  readOnly
                  disabled
                />
              </div>

              <div>
                <label htmlFor="fullName" className="block text-white/70 text-sm font-medium mb-1.5">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition"
                    placeholder="Your full name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="gender" className="block text-white/70 text-sm font-medium mb-1.5">Gender</label>
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition appearance-none"
                >
                  <option value="" className="bg-gray-800">Select gender</option>
                  <option value="male" className="bg-gray-800">Male</option>
                  <option value="female" className="bg-gray-800">Female</option>
                  <option value="other" className="bg-gray-800">Other</option>
                  <option value="prefer-not-to-say" className="bg-gray-800">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label htmlFor="phoneNumber" className="block text-white/70 text-sm font-medium mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    id="phoneNumber"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="bio" className="block text-white/70 text-sm font-medium mb-1.5">Bio</label>
                <div className="relative">
                  <FileText size={16} className="absolute left-3 top-3 text-white/40" />
                  <textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition resize-none"
                    rows={3}
                    placeholder="Tell us a bit about yourself"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-white text-purple-700 py-3 rounded-xl font-bold hover:bg-purple-50 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="animate-pulse">Saving…</span>
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
