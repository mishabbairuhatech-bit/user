import { useNavigate } from 'react-router-dom';
import { X, Maximize2, Ruler } from 'lucide-react';
import { Badge } from '@components/ui';

const UnitDetailPanel = ({ unit, onClose }) => {
  const navigate = useNavigate();
  const formatDate = (val) => {
    if (!val) return '-';
    return new Date(val).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-[#424242] flex-shrink-0">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Unit Details</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate(`/admin/inventory/units/${unit.id}`)}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors"
            title="Expand"
          >
            <Maximize2 size={14} className="text-gray-500" />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors"
            title="Close"
          >
            <X size={16} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-5 py-4">
        {/* Icon + Name + Status */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary-100 dark:bg-[#1a1a1a]">
            <Ruler size={20} className="text-primary-600 dark:text-primary-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{unit.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate font-mono">{unit.short_name}</p>
          </div>
          <Badge variant={unit.is_active !== false ? 'success' : 'danger'} type="soft" size="sm" dot>
            {unit.is_active !== false ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        {/* Detail rows */}
        <div className="space-y-3.5">
          <Row label="Name" value={unit.name} />
          <Row label="Short Name" value={unit.short_name} />
          <Row label="Status" value={
            <Badge variant={unit.is_active !== false ? 'success' : 'danger'} type="soft" size="sm">
              {unit.is_active !== false ? 'Active' : 'Inactive'}
            </Badge>
          } />
          <Row label="Created" value={formatDate(unit.created_at)} />
          <Row label="Updated" value={formatDate(unit.updated_at)} />
        </div>
      </div>
    </div>
  );
};

const Row = ({ label, value }) => (
  <div className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-[#2a2a2a] last:border-0">
    <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
    <span className="text-xs text-gray-900 dark:text-white text-right truncate ml-4">
      {typeof value === 'string' ? value : value}
    </span>
  </div>
);

export default UnitDetailPanel;
