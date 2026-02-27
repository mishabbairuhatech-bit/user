import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutGrid,
  ClipboardList,
  Calendar,
  BarChart3,
  Users,
  UsersRound,
  Settings,
  HelpCircle,
  PanelLeft,
  PanelRight,
  Palette,
  X,
} from 'lucide-react';
import { useAuth } from '@hooks';
import { Tooltip } from '@components/ui';

const menuItems = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutGrid },
  { name: 'Tasks', path: '/admin/tasks', icon: ClipboardList, badge: '12+' },
  { name: 'Calendar', path: '/admin/calendar', icon: Calendar },
  { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
  { name: 'Team', path: '/admin/team', icon: Users },
  { name: 'UI Components', path: '/admin/ui-components', icon: Palette },
];

const userItems = [
  { name: 'All Users', path: '/admin/users', icon: UsersRound },
];

const generalItems = [
  { name: 'Settings', path: '/admin/settings', icon: Settings },
  { name: 'Help', path: '/admin/help', icon: HelpCircle },
];

const Sidebar = ({ isCollapsed, onToggle, isMobile, isTablet, onCloseMobile }) => {
  const { logout, user } = useAuth();
  const [logoHovered, setLogoHovered] = useState(false);

  const handleMobileNavClick = () => {
    if (isMobile && onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <aside className={`h-full w-full flex flex-col transition-colors duration-300 ${isCollapsed ? 'bg-white dark:bg-[#121212]' : 'bg-white dark:bg-[#171717]'}`}>
      {/* Top — Logo & Toggle */}
      <div className={`group/top h-14 flex items-center flex-shrink-0 ${isCollapsed ? 'justify-center px-2' : 'justify-between px-4'}`}>
        {isCollapsed && isTablet ? (
          /* Tablet collapsed: just logo, no hover icon */
          <div className="w-9 h-9 flex items-center justify-center">
            <svg viewBox="0 0 40 40" className="w-8 h-8">
              <circle cx="20" cy="20" r="17" fill="none" className="stroke-primary-700" strokeWidth="2.5" />
              <circle cx="20" cy="20" r="9" fill="none" className="stroke-primary-700" strokeWidth="2.5" />
              <circle cx="20" cy="20" r="2.5" className="fill-primary-700" />
            </svg>
          </div>
        ) : isCollapsed ? (
          /* Desktop collapsed: logo on hover shows open icon */
          <Tooltip content="Open sidebar" position="right">
            <button
              onClick={onToggle}
              onMouseEnter={() => setLogoHovered(true)}
              onMouseLeave={() => setLogoHovered(false)}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors cursor-pointer"
            >
              {logoHovered ? (
                <PanelRight size={18} className="text-gray-500 dark:text-gray-400" />
              ) : (
                <svg viewBox="0 0 40 40" className="w-8 h-8">
                  <circle cx="20" cy="20" r="17" fill="none" className="stroke-primary-700" strokeWidth="2.5" />
                  <circle cx="20" cy="20" r="9" fill="none" className="stroke-primary-700" strokeWidth="2.5" />
                  <circle cx="20" cy="20" r="2.5" className="fill-primary-700" />
                </svg>
              )}
            </button>
          </Tooltip>
        ) : (
          /* Expanded: logo + name + collapse button on hover */
          <>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 relative flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 40 40" className="w-8 h-8">
                  <circle cx="20" cy="20" r="17" fill="none" className="stroke-primary-700" strokeWidth="2.5" />
                  <circle cx="20" cy="20" r="9" fill="none" className="stroke-primary-700" strokeWidth="2.5" />
                  <circle cx="20" cy="20" r="2.5" className="fill-primary-700" />
                </svg>
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Donezo</span>
            </div>

            {isMobile ? (
              <button
                onClick={onCloseMobile}
                className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            ) : (
              <Tooltip content="Close sidebar" position="right">
                <button
                  onClick={onToggle}
                  className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] rounded-lg transition-colors"
                >
                  <PanelLeft size={18} />
                </button>
              </Tooltip>
            )}
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 pt-2 overflow-y-auto scrollbar-hide">
        {/* Menu Section */}
        {!isCollapsed && (
          <div className="px-4 mb-2">
            <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Menu</span>
          </div>
        )}
        <ul className={`space-y-0.5 ${isCollapsed ? 'px-2 flex flex-col items-center' : 'px-2'} mb-4`}>
          {menuItems.map((item) => {
            const link = (
              <NavLink
                to={item.path}
                onClick={handleMobileNavClick}
                className={({ isActive }) =>
                  `flex items-center ${isCollapsed ? 'justify-center w-10 h-10' : 'gap-3 px-3 py-2 w-full'} rounded-lg transition-colors ${isActive
                    ? 'bg-gray-100 dark:bg-[#2a2a2a] text-primary-700 dark:text-primary-400 font-medium'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      size={18}
                      strokeWidth={isActive ? 2 : 1.5}
                      className="flex-shrink-0"
                    />
                    {!isCollapsed && (
                      <span className="text-sm flex-1">{item.name}</span>
                    )}
                    {!isCollapsed && item.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-primary-700 text-white rounded-full min-w-[24px] text-center">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );

            return (
              <li key={item.path}>
                {isCollapsed ? (
                  <Tooltip content={item.name} position="right">
                    {link}
                  </Tooltip>
                ) : (
                  link
                )}
              </li>
            );
          })}
        </ul>

        {/* Users Section */}
        {!isCollapsed && (
          <div className="px-4 mb-2">
            <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Users</span>
          </div>
        )}
        <ul className={`space-y-0.5 ${isCollapsed ? 'px-2 flex flex-col items-center' : 'px-2'} mb-4`}>
          {userItems.map((item) => {
            const link = (
              <NavLink
                to={item.path}
                onClick={handleMobileNavClick}
                className={({ isActive }) =>
                  `flex items-center ${isCollapsed ? 'justify-center w-10 h-10' : 'gap-3 px-3 py-2 w-full'} rounded-lg transition-colors ${isActive
                    ? 'bg-gray-100 dark:bg-[#2a2a2a] text-primary-700 dark:text-primary-400 font-medium'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      size={18}
                      strokeWidth={isActive ? 2 : 1.5}
                      className="flex-shrink-0"
                    />
                    {!isCollapsed && (
                      <span className="text-sm flex-1">{item.name}</span>
                    )}
                  </>
                )}
              </NavLink>
            );

            return (
              <li key={item.path}>
                {isCollapsed ? (
                  <Tooltip content={item.name} position="right">
                    {link}
                  </Tooltip>
                ) : (
                  link
                )}
              </li>
            );
          })}
        </ul>

        {/* General Section */}
        {!isCollapsed && (
          <div className="px-4 mb-2">
            <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">General</span>
          </div>
        )}
        <ul className={`space-y-0.5 ${isCollapsed ? 'px-2 flex flex-col items-center' : 'px-2'}`}>
          {generalItems.map((item) => {
            const link = (
              <NavLink
                to={item.path}
                onClick={handleMobileNavClick}
                className={({ isActive }) =>
                  `flex items-center ${isCollapsed ? 'justify-center w-10 h-10' : 'gap-3 px-3 py-2 w-full'} rounded-lg transition-colors ${isActive
                    ? 'bg-gray-100 dark:bg-[#2a2a2a] text-primary-700 dark:text-primary-400 font-medium'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon size={18} strokeWidth={isActive ? 2 : 1.5} className="flex-shrink-0" />
                    {!isCollapsed && <span className="text-sm">{item.name}</span>}
                  </>
                )}
              </NavLink>
            );

            return (
              <li key={item.path}>
                {isCollapsed ? (
                  <Tooltip content={item.name} position="right">
                    {link}
                  </Tooltip>
                ) : (
                  link
                )}
              </li>
            );
          })}

        </ul>
      </nav>

      {/* Bottom — User Profile */}
      <div className={`flex-shrink-0 border-t border-gray-100 dark:border-[#2a2a2a] ${isCollapsed ? 'p-2 flex justify-center' : 'p-3'}`}>
        {isCollapsed ? (
          <Tooltip content={user?.first_name || 'User'} position="right">
            <div className="w-8 h-8 rounded-full overflow-hidden">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'}
                alt={user?.first_name || 'User'}
                className="w-full h-full object-cover"
              />
            </div>
          </Tooltip>
        ) : (
          <div className="flex items-center gap-3 px-1">
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'}
                alt={user?.first_name || 'User'}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : 'User'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email || ''}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
