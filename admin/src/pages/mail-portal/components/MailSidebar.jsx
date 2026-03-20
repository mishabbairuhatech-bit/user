import { Inbox, Send, FileEdit, Star, Trash2, Plus } from 'lucide-react';
import { Button } from '@components/ui';
import { useSettings } from '@hooks';

const iconMap = { Inbox, Send, FileEdit, Star, Trash2 };

const MailSidebar = ({ folders, mailCounts, activeFolder, onFolderChange, onCompose }) => {
  const { settings } = useSettings();
  const isFull = settings.borderRadius === 'full';

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-[#121212]">
      {/* Compose */}
      <div className="p-3">
        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={onCompose}
          className="!w-full"
        >
          Compose
        </Button>
      </div>

      {/* Folders */}
      <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
        {folders.map((folder) => {
          const Icon = iconMap[folder.icon];
          const isActive = activeFolder === folder.id;
          const count = mailCounts[folder.id] || 0;
          const unreadCount = folder.id === 'inbox' ? mailCounts.unread : 0;

          return (
            <button
              key={folder.id}
              onClick={() => onFolderChange(folder.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors ${isFull ? 'rounded-full' : 'rounded-lg'} ${
                isActive
                  ? 'bg-gray-100 dark:bg-[#1e1e1e] text-primary-700 dark:text-primary-400 font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1a1a1a]'
              }`}
            >
              {Icon && <Icon size={18} />}
              <span className="flex-1 text-left">{folder.name}</span>
              {count > 0 && (
                <span
                  className={`text-[11px] w-6 h-6 flex items-center justify-center font-medium ${isFull ? 'rounded-full' : 'rounded-md'} ${
                    isActive
                      ? 'bg-gray-200 dark:bg-[#2a2a2a] text-primary-700 dark:text-primary-400'
                      : unreadCount > 0 && folder.id === 'inbox'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-[#2a2a2a] text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {folder.id === 'inbox' && unreadCount > 0 ? unreadCount : count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default MailSidebar;
