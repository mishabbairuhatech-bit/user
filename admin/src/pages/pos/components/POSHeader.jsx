import { ArrowLeft, Pause, BarChart3, RotateCcw, Clock, Settings, Keyboard, User, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge, Button, Input } from '@components/ui';
import { useSettings } from '@hooks';

const POSHeader = ({
  searchQuery,
  onSearchChange,
  heldBillsCount,
  onHoldBillsClick,
  isHeldBillsActive = false,
  isReturnsActive = false,
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
        <Button
          variant="ghost"
          size="sm"
          icon={ArrowLeft}
          iconOnly
          onClick={() => navigate('/admin/dashboard')}
          className="shrink-0"
        />
      </div>

      {/* Right - Actions & Profile */}
      <div className="flex items-center gap-3 ml-4">
        {/* Existing Action Buttons */}
        <div className="flex items-center gap-1.5 pr-3 border-r border-gray-200 dark:border-[#2a2a2a]">
          {/* Returns */}
          <Button
            variant="ghost"
            size="sm"
            icon={RotateCcw}
            iconOnly
            onClick={onReturnsClick}
            title="Returns (F3)"
            className={isReturnsActive ? '!bg-primary-100 dark:!bg-primary-900/30 !text-primary-600 dark:!text-primary-400' : ''}
          />

          {/* Held Bills */}
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            onClick={onHoldBillsClick}
            title="Held Bills (F5)"
            className={`relative ${isHeldBillsActive ? '!bg-primary-100 dark:!bg-primary-900/30 !text-primary-600 dark:!text-primary-400' : ''}`}
          >
            <Pause size={16} />
            {heldBillsCount > 0 && (
              <Badge variant="danger" size="sm" className="absolute -top-1 -right-1 min-w-[14px] h-[14px] text-[9px] flex items-center justify-center shadow-sm">
                {heldBillsCount}
              </Badge>
            )}
          </Button>

          {/* Reports */}
          <Button
            variant="ghost"
            size="sm"
            icon={BarChart3}
            iconOnly
            onClick={onReportsClick}
            title="Reports (F4)"
          />

          {/* Keyboard Shortcuts */}
          <Button
            variant="ghost"
            size="sm"
            icon={Keyboard}
            iconOnly
            onClick={onKeyboardClick}
            title="Keyboard Shortcuts (F1 / ?)"
          />

          {/* Settings */}
          <Button
            variant="ghost"
            size="sm"
            icon={Settings}
            iconOnly
            onClick={openSettings}
            title="Settings"
          />
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
