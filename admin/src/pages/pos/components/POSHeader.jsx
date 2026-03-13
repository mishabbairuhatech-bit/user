import { ArrowLeft, Pause, BarChart3, RotateCcw, Clock, Settings, Keyboard, User, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge, Input } from '@components/ui';
import { useSettings } from '@hooks';

const POSHeader = ({
  searchQuery,
  onSearchChange,
  heldBillsCount,
  onHoldBillsClick,
  onReportsClick,
  onReturnsClick,
  onKeyboardClick,
}) => {
  const navigate = useNavigate();
  const { openSettings } = useSettings();

  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const currentDate = new Date().toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <header className="h-14 flex items-center justify-between px-6 bg-white dark:bg-[#121212] border-b border-gray-100 dark:border-[#2a2a2a] shrink-0">
      {/* Left - Back Button */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="flex flex-col items-center justify-center w-8 h-8 bg-gray-50 dark:bg-[#1e1e1e] hover:bg-gray-100 dark:hover:bg-[#2a2a2a] text-gray-500 dark:text-gray-400 rounded-lg transition-colors shrink-0"
        >
          <ArrowLeft size={18} />
        </button>
      </div>

      {/* Right - Actions & Profile */}
      <div className="flex items-center gap-3 ml-4">
        {/* Existing Action Buttons */}
        <div className="flex items-center gap-1.5 pr-3 border-r border-gray-200 dark:border-[#2a2a2a]">
          {/* Returns */}
          <button
            onClick={onReturnsClick}
            className="flex items-center justify-center w-8 h-8 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors"
            title="Returns (F3)"
          >
            <RotateCcw size={16} />
          </button>

          {/* Held Bills */}
          <button
            onClick={onHoldBillsClick}
            className="relative flex items-center justify-center w-8 h-8 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors"
            title="Held Bills (F5)"
          >
            <Pause size={16} />
            {heldBillsCount > 0 && (
              <Badge variant="danger" size="sm" className="absolute -top-1 -right-1 min-w-[14px] h-[14px] text-[9px] flex items-center justify-center shadow-sm">
                {heldBillsCount}
              </Badge>
            )}
          </button>

          {/* Reports */}
          <button
            onClick={onReportsClick}
            className="flex items-center justify-center w-8 h-8 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors"
            title="Reports (F4)"
          >
            <BarChart3 size={16} />
          </button>

          {/* Keyboard Shortcuts */}
          <button
            onClick={onKeyboardClick}
            className="flex items-center justify-center w-8 h-8 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors"
            title="Keyboard Shortcuts (F1 / ?)"
          >
            <Keyboard size={16} />
          </button>

          {/* Settings */}
          <button
            onClick={openSettings}
            className="flex items-center justify-center w-8 h-8 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors"
            title="Settings"
          >
            <Settings size={16} />
          </button>
        </div>

        {/* User Profile */}
        <button className="flex items-center gap-2 pl-1 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg overflow-hidden shrink-0 border border-orange-200 dark:border-orange-800">
            <img 
              src="https://api.dicebear.com/7.x/notionists/svg?seed=Antonella&backgroundColor=ffedd5" 
              alt="Cashier"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="hidden md:flex flex-col items-start pr-1">
            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium leading-none mb-0.5">Cashier</span>
            <span className="text-xs font-bold text-gray-900 dark:text-white leading-none">Antonella</span>
          </div>
          <ChevronDown size={14} className="text-gray-400" />
        </button>
      </div>
    </header>
  );
};

export default POSHeader;
