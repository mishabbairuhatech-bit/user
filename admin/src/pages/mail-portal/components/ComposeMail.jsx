import { useState } from 'react';
import { ArrowLeft, Send, X } from 'lucide-react';

const ComposeMail = ({ onBack, onSend }) => {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const handleSend = () => {
    onSend({ to, subject, body });
    onBack();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#121212]">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 dark:border-[#2a2a2a] shrink-0">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors"
        >
          <ArrowLeft size={18} className="text-gray-500 dark:text-gray-400" />
        </button>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">New Message</h3>
        <div className="flex-1" />
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Form */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center border-b border-gray-100 dark:border-[#1e1e1e]">
          <label className="px-4 text-sm text-gray-500 dark:text-gray-400 w-20 shrink-0">To</label>
          <input
            type="email"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="recipient@example.com"
            className="flex-1 px-2 py-2.5 text-sm bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center border-b border-gray-100 dark:border-[#1e1e1e]">
          <label className="px-4 text-sm text-gray-500 dark:text-gray-400 w-20 shrink-0">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Email subject"
            className="flex-1 px-2 py-2.5 text-sm bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none"
          />
        </div>

        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your message..."
          className="flex-1 px-4 py-3 text-sm bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none resize-none"
        />
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-100 dark:border-[#2a2a2a] shrink-0">
        <button
          onClick={handleSend}
          disabled={!to || !subject}
          className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
        >
          <Send size={16} />
          Send
        </button>
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] rounded-lg transition-colors"
        >
          Discard
        </button>
      </div>
    </div>
  );
};

export default ComposeMail;
