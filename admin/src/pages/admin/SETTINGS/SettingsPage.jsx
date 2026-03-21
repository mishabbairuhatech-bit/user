import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Bell,
  Shield,
  UserCircle,
} from 'lucide-react';
import { PageHeader } from '@components/ui';
import usePermission from '@/hooks/usePermission';
import SecuritySettings from './SecuritySettings';
import AccountSettings from './AccountSettings';

const allSettingsTabs = [
  { id: 'notifications', label: 'Notifications', icon: Bell, permission: 'settings:notifications' },
  { id: 'security', label: 'Security', icon: Shield, permission: 'settings:security' },
  { id: 'account', label: 'Account', icon: UserCircle, permission: 'settings:account' },
];

const SettingsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { hasPermission } = usePermission();

  // Filter tabs based on permissions
  const settingsTabs = useMemo(
    () => allSettingsTabs.filter((tab) => !tab.permission || hasPermission(tab.permission)),
    [hasPermission],
  );

  const validTabIds = settingsTabs.map((t) => t.id);
  const tabParam = searchParams.get('tab');
  const activeTab = validTabIds.includes(tabParam) ? tabParam : validTabIds[0] || 'notifications';

  const canUpdate = hasPermission('settings:update');

  const setActiveTab = useCallback((tabId) => {
    setSearchParams({ tab: tabId }, { replace: true });
  }, [setSearchParams]);

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 120px)' }}>
      <PageHeader
        title="Settings"
        subtitle="Manage your account settings and preferences"
        breadcrumb={{
          items: [{ label: 'Settings', href: '/admin/settings' }],
        }}
      />

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0 mt-6">
        {/* Mobile Top Tabs */}
        <div className="md:hidden border-b border-gray-200 dark:border-[#2a2a2a] overflow-x-auto mb-4 flex-shrink-0">
          <div className="flex gap-1 p-2 min-w-max">
            {settingsTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${activeTab === tab.id
                    ? 'bg-gray-100 dark:bg-[#2a2a2a] text-gray-900 dark:text-white font-medium'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1a1a1a]'
                    }`}
                >
                  <Icon size={16} />
                  <span className="text-xs">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Desktop Left Sidebar Navigation */}
        <div className="hidden md:block w-64 flex-shrink-0 overflow-y-auto">
          <div className="py-4 space-y-1">
            {settingsTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition-colors ${activeTab === tab.id
                    ? 'bg-gray-100 dark:bg-[#2a2a2a] text-gray-900 dark:text-white font-medium'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1a1a1a]'
                    }`}
                >
                  <Icon size={18} />
                  <span className="text-sm">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide md:mx-4 pb-6">
          <div>
            {activeTab === 'notifications' && (
              <div className="text-center">
                <Bell size={48} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Notifications Settings
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Configure your notification preferences
                </p>
              </div>
            )}

            {activeTab === 'security' && <SecuritySettings readOnly={!canUpdate} />}

            {activeTab === 'account' && <AccountSettings readOnly={!canUpdate} />}

          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
