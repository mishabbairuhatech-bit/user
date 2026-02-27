import { Bell, Search, Mail, Settings, ChartNoAxesGantt } from 'lucide-react';
import { useAuth, useSettings } from '@hooks';

const Header = ({ isMobile, onMenuClick }) => {
  const { user } = useAuth();
  const { openSettings } = useSettings();

  return (
    <header className="h-[60px] lg:h-[72px] bg-[#f6f6f6] dark:bg-[#1e1e1e] flex items-center justify-between px-3 lg:px-6 transition-colors duration-300">
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={onMenuClick}
          className="p-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 bg-white dark:bg-gray-700 rounded-full transition-colors mr-2"
        >
          <ChartNoAxesGantt size={22} strokeWidth={1.75} />
        </button>
      )}

      {/* Search - Hidden on mobile */}
      <div className="hidden md:flex items-center flex-1 max-w-[380px]">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} strokeWidth={2} />
          <input
            type="text"
            placeholder="Search task"
            className="w-full pl-11 pr-20 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-[#424242] rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm text-gray-600 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-1.5 bg-gray-100 dark:bg-gray-600 rounded-lg">
            <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">&#8984;</span>
            <span className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold">F</span>
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-1">
        {/* Mail */}
        <button className="relative p-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 bg-white dark:bg-gray-700 rounded-full transition-colors">
          <Mail size={20} strokeWidth={1.5} />
        </button>

        {/* Notifications */}
        <button className="relative p-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 bg-white dark:bg-gray-700 rounded-full transition-colors">
          <Bell size={20} strokeWidth={1.5} />
        </button>

        {/* Settings */}
        <button
          onClick={openSettings}
          className="relative p-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 bg-white dark:bg-gray-700 rounded-full transition-colors"
        >
          <Settings size={20} strokeWidth={1.5} />
        </button>

        {/* Divider */}
        <div className="w-px h-10 bg-gray-300 dark:bg-gray-600 mx-4"></div>

        {/* User Profile with colored ring */}
        <div className="flex items-center gap-3">
          {/* Avatar with pink/peach ring matching the image */}
          <div className="relative">
            <div className="w-11 h-11 rounded-full p-[2px] bg-gradient-to-br from-[#f8b4b4] via-[#fcd5ce] to-[#f8b4b4]">
              <img
                src={user?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"}
                alt={user?.name || 'User'}
                className="w-full h-full rounded-full object-cover border-2 border-white dark:border-gray-800"
              />
            </div>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">{user?.name || 'Totok Michael'}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email || 'tmichael20@mail.com'}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
