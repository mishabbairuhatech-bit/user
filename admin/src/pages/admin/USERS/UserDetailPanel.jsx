import { useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { Badge, Avatar, Spinner } from '@components/ui';
import api from '@services/api';
import API from '@services/endpoints';
import QUERY_KEY from '@services/queryKeys';

const UserDetailPanel = ({ userId, onClose }) => {
  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY.USERS_DETAIL, userId],
    queryFn: async () => {
      const res = await api.get(`${API.USERS_DETAIL}/${userId}`);
      return res.data;
    },
    enabled: !!userId,
  });

  const user = data?.data || data || {};

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || '-';

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-[#424242] flex-shrink-0">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">User Details</h3>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors"
        >
          <X size={16} className="text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-5 py-4">
        {/* Avatar + Name + Status */}
        <div className="flex items-center gap-3 mb-5">
          <Avatar src={user.avatar_url} name={fullName} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{fullName}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
          </div>
          <Badge variant={user.is_active ? 'success' : 'danger'} type="soft" size="sm" dot>
            {user.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        {/* Detail rows */}
        <div className="space-y-3.5">
          <Row label="Timezone" value={user.timezone || '-'} />
          <Row label="Language" value={user.language || '-'} />
          <Row label="Email Verified" value={
            <Badge variant={user.email_verified ? 'success' : 'warning'} type="soft" size="sm">
              {user.email_verified ? 'Verified' : 'Unverified'}
            </Badge>
          } />
          <Row label="MFA" value={
            <Badge variant={user.mfa_enabled ? 'success' : 'default'} type="soft" size="sm">
              {user.mfa_enabled ? (user.mfa_method === 'totp' ? 'TOTP' : 'Email') : 'Disabled'}
            </Badge>
          } />
          <Row label="Provider" value={
            <Badge variant={user.auth_provider === 'google' ? 'info' : 'default'} type="soft" size="sm">
              {user.auth_provider === 'google' ? 'Google' : 'Local'}
            </Badge>
          } />
          <Row label="Last Login" value={formatDate(user.last_login_at)} />
          <Row label="Created" value={formatDate(user.created_at)} />
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

export default UserDetailPanel;
