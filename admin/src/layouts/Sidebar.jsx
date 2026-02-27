import { NavLink } from 'react-router-dom';
import {
  LayoutGrid,
  ClipboardList,
  Calendar,
  BarChart3,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Palette,
  X,
} from 'lucide-react';
import { useAuth } from '@hooks';

const menuItems = [
  {
    name: 'Dashboard',
    path: '/admin/dashboard',
    icon: LayoutGrid
  },
  {
    name: 'Tasks',
    path: '/admin/tasks',
    icon: ClipboardList,
    badge: '12+'
  },
  {
    name: 'Calendar',
    path: '/admin/calendar',
    icon: Calendar
  },
  {
    name: 'Analytics',
    path: '/admin/analytics',
    icon: BarChart3
  },
  {
    name: 'Team',
    path: '/admin/team',
    icon: Users
  },
  {
    name: 'UI Components',
    path: '/admin/ui-components',
    icon: Palette
  },
];

const generalItems = [
  {
    name: 'Settings',
    path: '/admin/settings',
    icon: Settings
  },
  {
    name: 'Help',
    path: '/admin/help',
    icon: HelpCircle
  },
];

const Sidebar = ({ isCollapsed, onToggle, isMobile, isTablet, onCloseMobile }) => {
  const { logout } = useAuth();

  // Handle navigation click on mobile - close the sidebar
  const handleMobileNavClick = () => {
    if (isMobile && onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <aside className={`h-full w-full bg-[#f6f6f6] dark:bg-[#1e1e1e] flex flex-col transition-all duration-300`}>
      {/* Logo */}
      <div className={`h-[72px] flex items-center ${isCollapsed ? 'justify-center px-2' : 'justify-between px-6'} pt-2 flex-shrink-0`}>
        <div className="flex items-center gap-2.5">
          {/* Donezo logo - concentric circles */}
          <div className="w-9 h-9 relative flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 40 40" className="w-9 h-9">
              <circle cx="20" cy="20" r="17" fill="none" className="stroke-primary-700" strokeWidth="2.5" />
              <circle cx="20" cy="20" r="9" fill="none" className="stroke-primary-700" strokeWidth="2.5" />
              <circle cx="20" cy="20" r="2.5" className="fill-primary-700" />
            </svg>
          </div>
          {!isCollapsed && (
            <span className="text-[22px] font-bold text-gray-900 dark:text-white tracking-tight">Donezo</span>
          )}
        </div>
        {/* Close button for mobile */}
        {isMobile && !isCollapsed && (
          <button
            onClick={onCloseMobile}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            <X size={20} strokeWidth={1.75} />
          </button>
        )}
      </div>

      {/* Navigation - Scrollable */}
      <nav className="flex-1 pt-4 overflow-y-auto scrollbar-hide">
        {/* Menu Section */}
        <div className={`${isCollapsed ? 'px-2' : 'px-6'} mb-3`}>
          {!isCollapsed && (
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.08em]">Menu</span>
          )}
        </div>
        <ul className={`space-y-1 ${isCollapsed ? 'px-1.5 flex flex-col items-center' : 'px-3'} mb-6`}>
          {menuItems.map((item) => (
            <li key={item.path} className={isCollapsed ? 'w-full flex justify-center' : ''}>
              <NavLink
                to={item.path}
                onClick={handleMobileNavClick}
                className={({ isActive }) =>
                  `flex items-center ${isCollapsed ? 'justify-center w-10 h-10' : 'justify-between px-3 py-2.5'} rounded-xl transition-all duration-200 relative group ${
                    isActive
                      ? 'text-gray-900 dark:text-white font-medium bg-white dark:bg-gray-700 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50'
                  }`
                }
                title={isCollapsed ? item.name : ''}
              >
                {({ isActive }) => (
                  <>
                    {/* Active indicator */}
                    {!isCollapsed && isActive && (
                      <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-[6px] h-8 bg-primary-700 rounded-r-full"></div>
                    )}
                    <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                      <item.icon
                        size={isCollapsed ? 18 : 20}
                        strokeWidth={isActive ? 2 : 1.75}
                        className={isActive ? 'text-primary-700' : 'text-gray-500 dark:text-gray-400'}
                        fill={isActive ? 'currentColor' : 'none'}
                      />
                      {!isCollapsed && (
                        <span className={`text-[15px] ${isActive ? 'font-semibold' : ''}`}>{item.name}</span>
                      )}
                    </div>
                    {!isCollapsed && item.badge && (
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-primary-700 text-white rounded-full min-w-[28px] text-center">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* General Section */}
        <div className={`${isCollapsed ? 'px-2' : 'px-6'} mb-3`}>
          {!isCollapsed && (
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.08em]">General</span>
          )}
        </div>
        <ul className={`space-y-1 ${isCollapsed ? 'px-1.5 flex flex-col items-center' : 'px-3'}`}>
          {generalItems.map((item) => (
            <li key={item.path} className={isCollapsed ? 'w-full flex justify-center' : ''}>
              <NavLink
                to={item.path}
                onClick={handleMobileNavClick}
                className={({ isActive }) =>
                  `flex items-center ${isCollapsed ? 'justify-center w-10 h-10' : 'gap-3 px-3 py-2.5'} rounded-xl transition-all duration-200 relative ${
                    isActive
                      ? 'text-gray-900 dark:text-white font-medium bg-white dark:bg-gray-700 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50'
                  }`
                }
                title={isCollapsed ? item.name : ''}
              >
                {({ isActive }) => (
                  <>
                    {!isCollapsed && isActive && (
                      <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-[6px] h-8 bg-primary-700 rounded-r-full"></div>
                    )}
                    <item.icon
                      size={isCollapsed ? 18 : 20}
                      strokeWidth={isActive ? 2 : 1.75}
                      className={isActive ? 'text-primary-700' : 'text-gray-500 dark:text-gray-400'}
                      fill={isActive ? 'currentColor' : 'none'}
                    />
                    {!isCollapsed && (
                      <span className={`text-[15px] ${isActive ? 'font-semibold' : ''}`}>{item.name}</span>
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
          {/* Logout */}
          <li className={isCollapsed ? 'w-full flex justify-center' : ''}>
            <button
              onClick={logout}
              className={`flex items-center ${isCollapsed ? 'justify-center w-10 h-10' : 'gap-3 px-3 py-2.5 w-full'} rounded-xl text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all duration-200`}
              title={isCollapsed ? 'Logout' : ''}
            >
              <LogOut size={isCollapsed ? 18 : 20} strokeWidth={1.75} className="text-gray-500 dark:text-gray-400" />
              {!isCollapsed && <span className="text-[15px]">Logout</span>}
            </button>
          </li>
        </ul>
      </nav>

      {/* Toggle Button - Hidden on mobile and tablet */}
      {!isMobile && !isTablet && (
        <div className={`p-3 flex-shrink-0 ${isCollapsed ? 'flex justify-center' : ''}`}>
          <button
            onClick={onToggle}
            className={`group flex items-center justify-center ${isCollapsed ? 'w-10 h-10' : 'w-full py-2.5 px-4'} bg-white dark:bg-gray-700 hover:bg-primary-50 dark:hover:bg-gray-600 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md border border-gray-100 dark:border-[#424242]`}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight size={18} className="text-gray-500 dark:text-gray-400 group-hover:text-primary-600 transition-colors" />
            ) : (
              <div className="flex items-center justify-between w-full">
                <span className="text-[13px] text-gray-600 dark:text-gray-300 group-hover:text-primary-700 dark:group-hover:text-primary-400 font-medium transition-colors">Collapse</span>
                <div className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-gray-600 group-hover:bg-primary-100 dark:group-hover:bg-primary-900 flex items-center justify-center transition-colors">
                  <ChevronLeft size={14} className="text-gray-500 dark:text-gray-400 group-hover:text-primary-600 transition-colors" />
                </div>
              </div>
            )}
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
