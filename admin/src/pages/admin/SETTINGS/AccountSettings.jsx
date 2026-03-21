import { useAuth } from '@hooks';
import { Mail, User, Calendar, Shield } from 'lucide-react';

const AccountSettings = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-2">
      {/* Profile Section */}
      <div className="py-2">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-primary-700 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
            {user?.first_name ? user.first_name.charAt(0).toUpperCase() : 'U'}
          </div>

          {/* User Info */}
          <div className="flex-1 h-10 flex flex-col justify-center">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              {user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : 'User'}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              @{user?.username || 'username'}
            </p>
          </div>
        </div>
      </div>

      <div className="h-px bg-gray-100 dark:bg-[#2a2a2a]" />

      {/* Email */}
      <div className="flex items-center gap-3 py-2">
        <Mail size={16} className="text-gray-400 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Email</h4>
          <p className="text-sm text-gray-900 dark:text-white">
            {user?.email || 'email@example.com'}
          </p>
        </div>
      </div>

      <div className="h-px bg-gray-100 dark:bg-[#2a2a2a]" />

      {/* Username */}
      <div className="flex items-center gap-3 py-2">
        <User size={16} className="text-gray-400 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Username</h4>
          <p className="text-sm text-gray-900 dark:text-white">
            @{user?.username || 'username'}
          </p>
        </div>
      </div>

      <div className="h-px bg-gray-100 dark:bg-[#2a2a2a]" />

      {/* Role */}
      <div className="flex items-center gap-3 py-2">
        <Shield size={16} className="text-gray-400 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Role</h4>
          <p className="text-sm text-gray-900 dark:text-white capitalize">
            {user?.role?.name || 'User'}
          </p>
        </div>
      </div>

      <div className="h-px bg-gray-100 dark:bg-[#2a2a2a]" />

      {/* Member Since */}
      <div className="flex items-center gap-3 py-2">
        <Calendar size={16} className="text-gray-400 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Member since</h4>
          <p className="text-sm text-gray-900 dark:text-white">
            {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric'
            }) : 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
