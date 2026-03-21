import { useState, useRef, useEffect } from 'react';
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
  CircleDollarSign,
  Paintbrush,
  ChevronRight,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@hooks';
import usePermission from '@/hooks/usePermission';
import { Tooltip, Dropdown, ConfirmModal } from '@components/ui';

const allMenuItems = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutGrid, permission: 'dashboard:view' },
  { name: 'UI Components', path: '/admin/ui-components', icon: Palette },
];

const allUserItems = [
  { name: 'All Users', path: '/admin/users', icon: UsersRound, permission: 'users:read' },
];

const allRoleItems = [
  { name: 'Roles & Permissions', path: '/admin/roles', icon: ShieldCheck, permission: 'roles:read' },
];

const allGeneralItems = [
  { name: 'Settings', path: '/admin/settings', icon: Settings, permission: 'settings:read' },
  { name: 'Help', path: '/admin/help', icon: HelpCircle },
];

const Sidebar = ({ isCollapsed, onToggle, isMobile, isTablet, onCloseMobile }) => {
  const { logout, user } = useAuth();
  const { hasPermission } = usePermission();

  // Filter items based on permissions
  const filterByPermission = (items) =>
    items.filter((item) => !item.permission || hasPermission(item.permission));

  const menuItems = filterByPermission(allMenuItems);
  const userItems = filterByPermission(allUserItems);
  const roleItems = filterByPermission(allRoleItems);
  const generalItems = filterByPermission(allGeneralItems);
  const [logoHovered, setLogoHovered] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMobileNavClick = () => {
    if (isMobile && onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <aside className={`h-full w-full flex flex-col transition-colors duration-300 ${isCollapsed ? 'bg-white dark:bg-[#121212]' : 'bg-white dark:bg-[#171717]'}`}>
      {/* Top — Logo & Toggle */}
      <div className={`group/top h-12 flex items-center flex-shrink-0 ${isCollapsed ? 'justify-center px-0.5' : 'justify-between px-4'}`}>
        {isCollapsed && isTablet ? (
          /* Tablet collapsed: just logo, no hover icon */
          <div className="w-8 h-8 flex items-center justify-center">
            <svg viewBox="0 0 40 40" className="w-7 h-7">
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
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors cursor-pointer"
            >
              {logoHovered ? (
                <PanelRight size={18} className="text-gray-500 dark:text-gray-400" />
              ) : (
                <svg viewBox="0 0 40 40" className="w-7 h-7">
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
        <ul className={`space-y-0.5 ${isCollapsed ? 'px-0.5 flex flex-col items-center' : 'px-2'} mb-4`}>
          {menuItems.map((item) => {
            const link = (
              <NavLink
                to={item.path}
                onClick={handleMobileNavClick}
                className={({ isActive }) =>
                  `flex items-center ${isCollapsed ? 'justify-center w-8 h-8' : 'gap-3 px-3 py-2 w-full'} rounded-lg transition-colors ${isActive
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
        {userItems.length > 0 && (<>
          {!isCollapsed && (
            <div className="px-4 mb-2">
              <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Users</span>
            </div>
          )}
          <ul className={`space-y-0.5 ${isCollapsed ? 'px-0.5 flex flex-col items-center' : 'px-2'} mb-4`}>
            {userItems.map((item) => {
              const link = (
                <NavLink
                  to={item.path}
                  onClick={handleMobileNavClick}
                  className={({ isActive }) =>
                    `flex items-center ${isCollapsed ? 'justify-center w-8 h-8' : 'gap-3 px-3 py-2 w-full'} rounded-lg transition-colors ${isActive
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
        </>)}

        {/* Role Management Section */}
        {roleItems.length > 0 && (<>
          {!isCollapsed && (
            <div className="px-4 mb-2">
              <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Role Management</span>
            </div>
          )}
          <ul className={`space-y-0.5 ${isCollapsed ? 'px-0.5 flex flex-col items-center' : 'px-2'} mb-4`}>
            {roleItems.map((item) => {
              const link = (
                <NavLink
                  to={item.path}
                  onClick={handleMobileNavClick}
                  className={({ isActive }) =>
                    `flex items-center ${isCollapsed ? 'justify-center w-8 h-8' : 'gap-3 px-3 py-2 w-full'} rounded-lg transition-colors ${isActive
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
        </>)}

        {/* General Section */}
        {!isCollapsed && (
          <div className="px-4 mb-2">
            <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">General</span>
          </div>
        )}
        <ul className={`space-y-0.5 ${isCollapsed ? 'px-0.5 flex flex-col items-center' : 'px-2'}`}>
          {generalItems.map((item) => {
            const link = (
              <NavLink
                to={item.path}
                onClick={handleMobileNavClick}
                className={({ isActive }) =>
                  `flex items-center ${isCollapsed ? 'justify-center w-8 h-8' : 'gap-3 px-3 py-2 w-full'} rounded-lg transition-colors ${isActive
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
      <div className={`flex-shrink-0 ${isCollapsed ? 'px-0.5 py-2 flex justify-center' : 'py-1 px-2'}`}>
        {isCollapsed ? (
          <div ref={userMenuRef} className="relative">
            <div
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="w-7 h-7 rounded-full overflow-hidden cursor-pointer bg-primary-700 flex items-center justify-center text-white text-[10px] font-medium hover:ring-2 hover:ring-primary-500 transition-all"
            >
              {user?.first_name ? user.first_name.charAt(0).toUpperCase() : 'M'}
            </div>

            {/* Dropdown Menu for Collapsed State */}
            {userMenuOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-64 py-1 bg-white dark:bg-[#121212] border border-gray-200 dark:border-[#424242] rounded-xl shadow-lg z-50">
                {/* User Info Header */}
                <div className="px-4 py-3 border-b border-gray-200 dark:border-[#424242] flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary-700 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                    {user?.first_name ? user.first_name.charAt(0).toUpperCase() : 'M'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                      {user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : 'mishab'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      @{user?.username || 'mishabbairuhatech'}
                    </p>
                  </div>
                </div>

                {/* Menu Items */}
                <button
                  onClick={() => setUserMenuOpen(false)}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left text-gray-700 dark:text-[rgba(255,255,255,0.85)] hover:bg-gray-100 dark:hover:bg-[#2a2a2a]"
                >
                  <CircleDollarSign className="w-4 h-4" />

                </button>
                <button
                  onClick={() => setUserMenuOpen(false)}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left text-gray-700 dark:text-[rgba(255,255,255,0.85)] hover:bg-gray-100 dark:hover:bg-[#2a2a2a]"
                >
                  <Paintbrush className="w-4 h-4" />
                  Keyboard shortcuts
                </button>
                <button
                  onClick={() => setUserMenuOpen(false)}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left text-gray-700 dark:text-[rgba(255,255,255,0.85)] hover:bg-gray-100 dark:hover:bg-[#2a2a2a]"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span className="flex-1">Help</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <div className="my-1 border-t border-gray-200 dark:border-[#424242]" />

                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    setShowLogoutModal(true);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <LogOut className="w-4 h-4" />
                  Log out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div
            ref={userMenuRef}
            className="relative w-full"
          >
            <div
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 bg-primary-700 flex items-center justify-center text-white text-sm font-medium">
                {user?.first_name ? user.first_name.charAt(0).toUpperCase() : 'M'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                  {user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : 'mishab'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  @{user?.username || 'mishabbairuhatech'}
                </p>
              </div>
            </div>

            {/* Dropdown Menu */}
            {userMenuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 py-1 bg-white dark:bg-[#121212] border border-gray-200 dark:border-[#424242] rounded-xl shadow-lg z-50">
                {/* User Info Header */}
                <div className="px-4 py-3 border-b border-gray-200 dark:border-[#424242] flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary-700 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                    {user?.first_name ? user.first_name.charAt(0).toUpperCase() : 'M'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                      {user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : 'mishab'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      @{user?.username || 'mishabbairuhatech'}
                    </p>
                  </div>
                </div>

                {/* Menu Items */}
                <button
                  onClick={() => setUserMenuOpen(false)}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left text-gray-700 dark:text-[rgba(255,255,255,0.85)] hover:bg-gray-100 dark:hover:bg-[#2a2a2a]"
                >
                  <CircleDollarSign className="w-4 h-4" />
                  Terms and policy
                </button>
                <button
                  onClick={() => setUserMenuOpen(false)}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left text-gray-700 dark:text-[rgba(255,255,255,0.85)] hover:bg-gray-100 dark:hover:bg-[#2a2a2a]"
                >
                  <Paintbrush className="w-4 h-4" />
                  Keyboard shortcuts
                </button>
                <button
                  onClick={() => setUserMenuOpen(false)}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left text-gray-700 dark:text-[rgba(255,255,255,0.85)] hover:bg-gray-100 dark:hover:bg-[#2a2a2a]"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                <button
                  onClick={() => setUserMenuOpen(false)}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left text-gray-700 dark:text-[rgba(255,255,255,0.85)] hover:bg-gray-100 dark:hover:bg-[#2a2a2a]"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span className="flex-1">Help</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <div className="my-1 border-t border-gray-200 dark:border-[#424242]" />

                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    setShowLogoutModal(true);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <LogOut className="w-4 h-4" />
                  Log out
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => !logoutLoading && setShowLogoutModal(false)}
        onConfirm={async () => {
          setLogoutLoading(true);
          await logout();
          setLogoutLoading(false);
          setShowLogoutModal(false);
        }}
        title="Log Out"
        message="Are you sure you want to log out?"
        variant="danger"
        confirmText="Log Out"
        loading={logoutLoading}
      />
    </aside>
  );
};

export default Sidebar;
