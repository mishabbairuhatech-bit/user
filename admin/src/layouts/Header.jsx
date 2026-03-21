import { Bell, Mail, Settings, ChartNoAxesGantt, Store } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button, Tooltip } from '@components/ui';
import { useSettings } from '@hooks';
import usePermission from '@/hooks/usePermission';

const Header = ({ isMobile, onMenuClick }) => {
  const navigate = useNavigate();
  const { openSettings } = useSettings();
  const { hasPermission } = usePermission();

  return (
    <header className="h-12 flex items-center justify-between px-4 border-b border-gray-100 dark:border-[#2a2a2a] flex-shrink-0 transition-colors duration-300">
      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        {isMobile && (
          <Tooltip content="Menu" position="bottom">
            <Button
              variant="ghost"
              size="sm"
              icon={ChartNoAxesGantt}
              iconOnly
              onClick={onMenuClick}
            />
          </Tooltip>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5">
        {hasPermission('pos:access') && (
          <Tooltip content="POS" position="bottom">
            <Button
              variant="ghost"
              size="sm"
              icon={Store}
              iconOnly
              onClick={() => navigate('/pos')}
            />
          </Tooltip>
        )}

        {hasPermission('mail:access') && (
          <Tooltip content="Mail" position="bottom">
            <Button
              variant="ghost"
              size="sm"
              icon={Mail}
              iconOnly
              onClick={() => navigate('/mail')}
            />
          </Tooltip>
        )}

        {hasPermission('notifications:read') && (
          <Tooltip content="Notifications" position="bottom">
            <Button
              variant="ghost"
              size="sm"
              icon={Bell}
              iconOnly
            />
          </Tooltip>
        )}

        {hasPermission('settings:read') && (
          <Tooltip content="Settings" position="bottom">
            <Button
              variant="ghost"
              size="sm"
              icon={Settings}
              iconOnly
              onClick={openSettings}
            />
          </Tooltip>
        )}
      </div>
    </header>
  );
};

export default Header;
