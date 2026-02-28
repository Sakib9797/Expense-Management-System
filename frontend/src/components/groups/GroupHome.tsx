
import { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import GroupContext, { Group } from '../../contexts/GroupContext';
import { toast } from '../../components/ui/sonner';
import Header from '../common/Header';
import { BarChart3, Brain, PlusCircle, FileText, CreditCard, ArrowRight, Info } from 'lucide-react';

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

  const actionCards = [
    {
      to: `/group/${group.id}/spending`,
      icon: BarChart3,
      label: 'Spending & Insights',
      gradient: 'from-orange-500 to-amber-500',
      iconBg: 'bg-orange-400/30',
    },
    {
      to: `/group/${group.id}/ml-insights`,
      icon: Brain,
      label: 'AI / ML Insights',
      gradient: 'from-indigo-500 to-violet-500',
      iconBg: 'bg-indigo-400/30',
    },
    {
      to: `/group/${group.id}/create-expense`,
      icon: PlusCircle,
      label: 'Create Expense Profile',
      gradient: 'from-blue-500 to-cyan-500',
      iconBg: 'bg-blue-400/30',
    },
    {
      to: `/group/${group.id}/expense-profiles`,
      icon: FileText,
      label: 'Expense Profiles',
      gradient: 'from-purple-500 to-fuchsia-500',
      iconBg: 'bg-purple-400/30',
    },
    {
      to: `/group/${group.id}/items`,
      icon: CreditCard,
      label: 'Items Price',
      gradient: 'from-emerald-500 to-teal-500',
      iconBg: 'bg-emerald-400/30',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-animated relative overflow-hidden">
      {/* Floating blobs */}
      <div className="absolute top-20 -left-32 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
      <div className="absolute top-40 -right-32 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob delay-2000" />
      <div className="absolute -bottom-20 left-1/2 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob delay-4000" />

      <Header 
        showBackButton 
        onBack={() => navigate('/groups')}
        showNotification
      />
      
      <div className="container mx-auto py-8 px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Group info card */}
          <div className="opacity-0 animate-fade-in">
            <div className="glass rounded-2xl p-6 mb-8 hover-lift">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{group.name}</h1>
                  <p className="text-white/70 text-lg">{group.description}</p>
                </div>
                <Link
                  to={`/group/${group.id}/details`}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition border border-white/10"
                >
                  <Info size={18} />
                  <span className="font-medium">Details</span>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Action cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {actionCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.to}
                  to={card.to}
                  className={`opacity-0 animate-slide-up delay-${(index + 1) * 100} group`}
                >
                  <div className="glass rounded-2xl p-6 text-center hover-lift h-full flex flex-col items-center justify-center transition-all duration-300 group-hover:bg-white/20">
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="text-white" size={28} />
                    </div>
                    <span className="font-semibold text-white text-sm">{card.label}</span>
                    <ArrowRight className="text-white/0 group-hover:text-white/60 mt-2 transition-all duration-300 transform group-hover:translate-x-1" size={16} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupHome;
