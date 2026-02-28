
import { Link } from 'react-router-dom';
import { Group } from '../../contexts/GroupContext';
import { Users, ArrowRight } from 'lucide-react';

interface GroupCardProps {
  group: Group;
}

const GroupCard: React.FC<GroupCardProps> = ({ group }) => {
  return (
    <Link to={`/group/${group.id}`} className="group block">
      <div className="glass rounded-2xl p-6 hover-lift transition-all duration-300 group-hover:bg-white/20 h-full">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-md">
            <Users className="text-white" size={18} />
          </div>
          <h3 className="text-lg font-bold text-white truncate">{group.name}</h3>
        </div>
        <div className="mb-3 flex items-center text-white/60 text-sm">
          <Users className="w-3.5 h-3.5 mr-1.5" />
          <span>
            {group.members?.length ?? 0} {group.members?.length === 1 ? 'member' : 'members'}
          </span>
        </div>
        <p className="text-white/50 text-sm line-clamp-2 mb-4">{group.description}</p>
        <div className="flex items-center justify-end text-white/40 group-hover:text-white/80 transition-colors text-sm font-medium">
          <span>Open</span>
          <ArrowRight className="ml-1 group-hover:translate-x-1 transition-transform" size={14} />
        </div>
      </div>
    </Link>
  );
};

export default GroupCard;
