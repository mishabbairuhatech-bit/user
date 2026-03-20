import { Star } from 'lucide-react';

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }

  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const MailList = ({ mails, selectedMailId, onSelectMail, onToggleStar }) => {
  if (mails.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm py-20">
        No messages in this folder
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {mails.map((mail) => {
        const isSelected = selectedMailId === mail.id;

        return (
          <div
            key={mail.id}
            onClick={() => onSelectMail(mail)}
            className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 dark:border-[#1e1e1e] cursor-pointer transition-colors ${
              isSelected
                ? 'bg-primary-50 dark:bg-primary-900/10 border-l-2 !border-l-primary-600'
                : mail.read
                ? 'hover:bg-gray-50 dark:hover:bg-[#1a1a1a]'
                : 'bg-blue-50/40 dark:bg-blue-900/5 hover:bg-blue-50/70 dark:hover:bg-blue-900/10'
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
                !mail.read
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                  : 'bg-gray-100 dark:bg-[#2a2a2a] text-gray-500 dark:text-gray-400'
              }`}
            >
              {mail.avatar}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-sm truncate ${
                    !mail.read
                      ? 'font-semibold text-gray-900 dark:text-white'
                      : 'font-medium text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {mail.from}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                  {formatDate(mail.date)}
                </span>
              </div>

              <p
                className={`text-sm truncate mt-0.5 ${
                  !mail.read
                    ? 'font-medium text-gray-800 dark:text-gray-200'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {mail.subject}
              </p>

              <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">
                {mail.preview}
              </p>
            </div>

            {/* Star & unread dot */}
            <div className="flex flex-col items-center gap-1.5 flex-shrink-0 pt-0.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleStar(mail.id);
                }}
                className={`p-0.5 rounded transition-colors ${
                  mail.starred
                    ? 'text-yellow-500'
                    : 'text-gray-300 dark:text-gray-600 hover:text-yellow-500'
                }`}
              >
                <Star size={14} fill={mail.starred ? 'currentColor' : 'none'} />
              </button>

              {!mail.read && (
                <div className="w-2 h-2 rounded-full bg-primary-600" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MailList;
