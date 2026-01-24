
import { Link } from 'react-router-dom';
import { Group } from '../../contexts/GroupContext';
import { Users } from 'lucide-react';

interface GroupCardProps {
  group: Group;
}

const GroupCard: React.FC<GroupCardProps> = ({ group }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <h3 className="text-xl font-semibold mb-2 text-purple-700">{group.name}</h3>
<div className="mb-4 flex items-center text-gray-600">
  <Users className="w-4 h-4 mr-1" />
  <span>
    {group.members?.length ?? 0} {group.members?.length === 1 ? 'member' : 'members'}
  </span>
</div>
      <p className="text-gray-600 mb-4 line-clamp-2">{group.description}</p>
      <div className="flex justify-end">
        <Link
          to={`/group/${group.id}/details`}
          className="text-purple-600 hover:text-purple-800 font-medium"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default GroupCard;
