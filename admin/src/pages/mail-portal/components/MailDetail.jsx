import { ArrowLeft, Star, Reply, Forward, Trash2, Archive } from 'lucide-react';

const formatFullDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString([], {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const MailDetail = ({ mail, onBack, onToggleStar, onDelete }) => {
  if (!mail) return null;

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#121212]">
      {/* Toolbar */}
      <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-gray-100 dark:border-[#2a2a2a] shrink-0">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors md:hidden"
        >
          <ArrowLeft size={18} className="text-gray-500 dark:text-gray-400" />
        </button>

        <div className="flex-1" />

        <button
          onClick={() => onToggleStar(mail.id)}
          className={`p-1.5 rounded-lg transition-colors ${
            mail.starred ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'
          }`}
        >
          <Star size={18} fill={mail.starred ? 'currentColor' : 'none'} />
        </button>

        <button className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors">
          <Archive size={18} />
        </button>

        <button
          onClick={() => {
            onDelete(mail.id);
            onBack();
          }}
          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-6">
          {/* Subject */}
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            {mail.subject}
          </h1>

          {/* Sender */}
          <div className="flex items-start gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary-600/15 dark:bg-primary-500/15 flex items-center justify-center text-sm font-semibold text-primary-700 dark:text-primary-400 flex-shrink-0">
              {mail.avatar}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {mail.from}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  &lt;{mail.email}&gt;
                </span>
              </div>
              {mail.to && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  To: {mail.to}
                </p>
              )}
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {formatFullDate(mail.date)}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="border-b border-gray-100 dark:border-[#2a2a2a] mb-6" />

          {/* Body */}
          <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
            {mail.body}
          </div>

          {/* Labels */}
          {mail.labels && mail.labels.length > 0 && (
            <div className="flex gap-1.5 mt-8">
              {mail.labels.map((label) => (
                <span
                  key={label}
                  className="text-xs px-2.5 py-1 rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-500 dark:text-gray-400 capitalize"
                >
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reply bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-100 dark:border-[#2a2a2a] shrink-0">
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#333] rounded-lg hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
          <Reply size={16} />
          Reply
        </button>
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#333] rounded-lg hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
          <Forward size={16} />
          Forward
        </button>
      </div>
    </div>
  );
};

export default MailDetail;
