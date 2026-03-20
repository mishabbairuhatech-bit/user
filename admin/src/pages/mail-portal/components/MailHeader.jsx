import { useState, useEffect } from 'react';
import { ArrowLeft, Settings, RefreshCw, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button, Tooltip } from '@components/ui';
import { useSettings } from '@hooks';

const MailHeader = ({ searchQuery, onSearchChange, onRefresh }) => {
  const navigate = useNavigate();
  const { openSettings } = useSettings();

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const currentDate = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <header className="h-12 flex items-center justify-between px-4 bg-white dark:bg-[#121212] border-b border-gray-100 dark:border-[#2a2a2a] shrink-0">
      {/* Left */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Tooltip content="Back" position="bottom">
          <Button
            variant="ghost"
            size="sm"
            icon={ArrowLeft}
            iconOnly
            onClick={() => navigate('/admin/dashboard')}
            className="shrink-0"
          />
        </Tooltip>
        <span className="font-bold text-sm text-gray-900 dark:text-white hidden sm:inline shrink-0">Mail</span>
        <div className="hidden md:flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 ml-2 shrink-0">
          <span>{currentDate}</span>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <span className="font-mono">{currentTime}</span>
        </div>
      </div>

      {/* Center - Search */}
      <div className="flex-1 max-w-md mx-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search mail..."
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-gray-100 dark:bg-[#1a1a1a] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg border border-transparent focus:border-primary-500 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5">
        <Tooltip content="Refresh" position="bottom">
          <Button
            variant="ghost"
            size="sm"
            icon={RefreshCw}
            iconOnly
            onClick={onRefresh}
          />
        </Tooltip>

        <Tooltip content="Settings" position="bottom">
          <Button
            variant="ghost"
            size="sm"
            icon={Settings}
            iconOnly
            onClick={openSettings}
          />
        </Tooltip>
      </div>
    </header>
  );
};

export default MailHeader;
