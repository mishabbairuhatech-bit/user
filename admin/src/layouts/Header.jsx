import { Bell, Mail, Settings, ChartNoAxesGantt, Store } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '@hooks';

const Header = ({ isMobile, onMenuClick }) => {
  const navigate = useNavigate();
  const { openSettings } = useSettings();

  return (
    <header className="h-12 flex items-center justify-between px-4 border-b border-gray-100 dark:border-[#2a2a2a] flex-shrink-0 transition-colors duration-300">
      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        {isMobile && (
          <button
            onClick={onMenuClick}
            className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] rounded-lg transition-colors"
          >
            <ChartNoAxesGantt size={20} strokeWidth={1.5} />
          </button>
        )}


      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        {/* POS Button */}
        <button
          onClick={() => navigate('/pos')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
        >
          <Store size={16} strokeWidth={1.5} />
          <span className="text-sm font-medium hidden sm:inline">POS</span>
        </button>

        <button className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] rounded-lg transition-colors">
          <Mail size={18} strokeWidth={1.5} />
        </button>

        <button className="relative p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] rounded-lg transition-colors">
          <Bell size={18} strokeWidth={1.5} />
        </button>

        <button
          onClick={openSettings}
          className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] rounded-lg transition-colors"
        >
          <Settings size={18} strokeWidth={1.5} />
        </button>

      </div>
    </header>
  );
};

export default Header;
