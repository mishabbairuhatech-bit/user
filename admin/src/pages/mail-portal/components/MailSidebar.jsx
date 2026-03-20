import { Inbox, Send, FileEdit, Star, Trash2, Plus } from 'lucide-react';

const iconMap = { Inbox, Send, FileEdit, Star, Trash2 };

const MailSidebar = ({ folders, mailCounts, activeFolder, onFolderChange, onCompose }) => {
  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-[#121212]">
      {/* Compose */}
      <div className="p-3">
        <button
          onClick={onCompose}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus size={16} />
          Compose
        </button>
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
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1a1a1a]'
              }`}
            >
              {Icon && <Icon size={18} />}
              <span className="flex-1 text-left">{folder.name}</span>
              {count > 0 && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-400'
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
