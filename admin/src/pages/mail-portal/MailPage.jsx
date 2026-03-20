import { useState, useMemo, useEffect } from 'react';
import { useSettings } from '@hooks';
import { demoMails, folders } from './data/mailData';
import MailHeader from './components/MailHeader';
import MailSidebar from './components/MailSidebar';
import MailList from './components/MailList';
import MailDetail from './components/MailDetail';
import ComposeMail from './components/ComposeMail';

const MailPage = () => {
  const { settings } = useSettings();
  const isMailLeft = settings.mailSidebarPosition === 'left';
  const [mails, setMails] = useState(demoMails);
  const [activeFolder, setActiveFolder] = useState('inbox');
  const [selectedMail, setSelectedMail] = useState(null);
  const [isComposing, setIsComposing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mark mail as read when selected
  const handleSelectMail = (mail) => {
    setSelectedMail(mail);
    setIsComposing(false);
    if (!mail.read) {
      setMails((prev) =>
        prev.map((m) => (m.id === mail.id ? { ...m, read: true } : m))
      );
    }
  };

  const handleFolderChange = (folderId) => {
    setActiveFolder(folderId);
    setSelectedMail(null);
    setIsComposing(false);
  };

  const handleBack = () => {
    setSelectedMail(null);
    setIsComposing(false);
  };

  const handleCompose = () => {
    setSelectedMail(null);
    setIsComposing(true);
  };

  const handleToggleStar = (id) => {
    setMails((prev) =>
      prev.map((m) => (m.id === id ? { ...m, starred: !m.starred } : m))
    );
    // Update selected mail if it's the one being toggled
    if (selectedMail?.id === id) {
      setSelectedMail((prev) => (prev ? { ...prev, starred: !prev.starred } : prev));
    }
  };

  const handleDelete = (id) => {
    setMails((prev) =>
      prev.map((m) => (m.id === id ? { ...m, folder: 'trash' } : m))
    );
    setSelectedMail(null);
  };

  const handleSend = (mailData) => {
    const newMail = {
      id: Date.now(),
      from: 'You',
      email: 'me@example.com',
      to: mailData.to,
      subject: mailData.subject,
      preview: mailData.body.substring(0, 100),
      body: mailData.body,
      date: new Date().toISOString(),
      read: true,
      starred: false,
      folder: 'sent',
      avatar: 'ME',
      labels: [],
    };
    setMails((prev) => [newMail, ...prev]);
  };

  const handleRefresh = () => {
    setMails(demoMails);
    setSelectedMail(null);
  };

  // Filter mails
  const filteredMails = useMemo(() => {
    let filtered = mails;

    if (activeFolder === 'starred') {
      filtered = filtered.filter((m) => m.starred);
    } else {
      filtered = filtered.filter((m) => m.folder === activeFolder);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.subject.toLowerCase().includes(q) ||
          m.from.toLowerCase().includes(q) ||
          m.preview.toLowerCase().includes(q)
      );
    }

    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [mails, activeFolder, searchQuery]);

  // Mail counts
  const mailCounts = useMemo(() => ({
    inbox: mails.filter((m) => m.folder === 'inbox').length,
    sent: mails.filter((m) => m.folder === 'sent').length,
    draft: mails.filter((m) => m.folder === 'draft').length,
    starred: mails.filter((m) => m.starred).length,
    trash: mails.filter((m) => m.folder === 'trash').length,
    unread: mails.filter((m) => m.folder === 'inbox' && !m.read).length,
  }), [mails]);

  // On mobile: show list OR detail, not both
  const showListOnMobile = isMobile && !selectedMail && !isComposing;
  const showDetailOnMobile = isMobile && (selectedMail || isComposing);

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-[#0a0a0a]">
      {/* Header */}
      <MailHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onRefresh={handleRefresh}
      />

      {/* Body */}
      <div className={`flex-1 flex overflow-hidden ${!isMailLeft ? 'flex-row-reverse' : ''}`}>
        {/* Sidebar - Desktop only */}
        <div className={`w-56 ${isMailLeft ? 'border-r' : 'border-l'} border-gray-200 dark:border-[#2a2a2a] shrink-0 hidden md:block`}>
          <MailSidebar
            folders={folders}
            mailCounts={mailCounts}
            activeFolder={activeFolder}
            onFolderChange={handleFolderChange}
            onCompose={handleCompose}
          />
        </div>

        {/* Mobile folder tabs */}
        {isMobile && !selectedMail && !isComposing && (
          <div className="absolute top-12 left-0 right-0 z-10 flex items-center gap-1 px-3 py-2 bg-white dark:bg-[#121212] border-b border-gray-100 dark:border-[#2a2a2a] overflow-x-auto">
            <button
              onClick={handleCompose}
              className="px-3 py-1 text-xs font-medium rounded-full bg-primary-600 text-white shrink-0"
            >
              + Compose
            </button>
            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => handleFolderChange(folder.id)}
                className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors shrink-0 ${
                  activeFolder === folder.id
                    ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2a2a2a]'
                }`}
              >
                {folder.name}
                {folder.id === 'inbox' && mailCounts.unread > 0 && (
                  <span className="ml-1">({mailCounts.unread})</span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Mail List */}
        <div
          className={`${isMailLeft ? 'border-r' : 'border-l'} border-gray-200 dark:border-[#2a2a2a] flex flex-col bg-white dark:bg-[#121212] ${
            isMobile
              ? showListOnMobile
                ? 'flex-1 pt-10'
                : 'hidden'
              : 'w-[360px] lg:w-[400px] shrink-0'
          }`}
        >
          {/* Folder title - Desktop */}
          <div className="hidden md:flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-[#1e1e1e]">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
              {activeFolder === 'draft' ? 'Drafts' : activeFolder}
            </h3>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {filteredMails.length} {filteredMails.length === 1 ? 'message' : 'messages'}
            </span>
          </div>

          <MailList
            mails={filteredMails}
            selectedMailId={selectedMail?.id}
            onSelectMail={handleSelectMail}
            onToggleStar={handleToggleStar}
          />
        </div>

        {/* Detail / Compose / Empty panel */}
        <div
          className={`flex-1 flex flex-col ${
            isMobile
              ? showDetailOnMobile
                ? 'flex'
                : 'hidden'
              : ''
          }`}
        >
          {isComposing ? (
            <ComposeMail onBack={handleBack} onSend={handleSend} />
          ) : selectedMail ? (
            <MailDetail
              mail={selectedMail}
              onBack={handleBack}
              onToggleStar={handleToggleStar}
              onDelete={handleDelete}
            />
          ) : (
            !isMobile && (
              <div className="flex-1 flex items-center justify-center bg-white dark:bg-[#121212]">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Select a message to read</p>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default MailPage;
