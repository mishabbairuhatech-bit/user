import { ArrowLeft, Pause, BarChart3, RotateCcw, Clock, Settings, Keyboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@components/ui';
import { useSettings } from '@hooks';

const POSHeader = ({
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
    <header className="h-10 flex items-center justify-between px-3 bg-white dark:bg-[#121212] border-b border-gray-200 dark:border-[#2a2a2a]">
      {/* Left - Back button */}
      <div className="flex items-center">
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="flex items-center gap-1.5 px-2 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] rounded-lg transition-colors"
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline text-xs font-medium">Back</span>
        </button>
      </div>

      {/* Center - Date/Time */}
      <div className="hidden lg:flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
        <Clock size={12} />
        <span className="text-xs">{currentDate} | {currentTime}</span>
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-1">
        {/* Returns */}
        <button
          onClick={onReturnsClick}
          className="flex items-center gap-1.5 px-2 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] rounded-lg transition-colors"
        >
          <RotateCcw size={14} />
          <span className="hidden sm:inline text-xs">Returns</span>
        </button>

        {/* Held Bills */}
        <button
          onClick={onHoldBillsClick}
          className="relative flex items-center gap-1.5 px-2 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] rounded-lg transition-colors"
        >
          <Pause size={14} />
          <span className="hidden sm:inline text-xs">Held</span>
          {heldBillsCount > 0 && (
            <Badge variant="danger" size="sm" className="absolute -top-1 -right-1 min-w-[16px] h-4 text-[10px] flex items-center justify-center">
              {heldBillsCount}
            </Badge>
          )}
        </button>

        {/* Reports */}
        <button
          onClick={onReportsClick}
          className="flex items-center gap-1.5 px-2 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] rounded-lg transition-colors"
        >
          <BarChart3 size={14} />
          <span className="hidden sm:inline text-xs">Reports</span>
        </button>

        {/* Keyboard Shortcuts */}
        <button
          onClick={onKeyboardClick}
          className="flex items-center gap-1.5 px-2 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] rounded-lg transition-colors"
          title="Keyboard Shortcuts (F1)"
        >
          <Keyboard size={14} />
        </button>

        {/* Settings */}
        <button
          onClick={openSettings}
          className="flex items-center gap-1.5 px-2 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] rounded-lg transition-colors"
        >
          <Settings size={14} />
        </button>
      </div>
    </header>
  );
};

export default POSHeader;
