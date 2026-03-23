import { useState } from 'react';
import { Button, Modal, Input, Select, Spinner } from '@components/ui';

/**
 * SessionManager — handles POS session open/close UI.
 * Renders a modal to open a session if none is active,
 * and provides a close session dialog.
 */
const SessionOpenModal = ({ isOpen, onClose, terminals, onOpen, loading }) => {
  const [terminalId, setTerminalId] = useState('');
  const [openingCash, setOpeningCash] = useState(0);

  const handleOpen = async () => {
    await onOpen({ terminal_id: terminalId, opening_cash: parseFloat(openingCash) || 0 });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Open POS Session" size="sm">
      <div className="space-y-4">
        <Select
          label="Terminal"
          value={terminalId}
          onChange={(e) => setTerminalId(e.target.value)}
          options={[
            { value: '', label: 'Select terminal...' },
            ...(terminals || []).map((t) => ({ value: t.id, label: t.name })),
          ]}
        />
        <Input
          label="Opening Cash (₹)"
          type="number"
          step="0.01"
          value={openingCash}
          onChange={(e) => setOpeningCash(e.target.value)}
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleOpen} loading={loading} disabled={!terminalId}>Open Session</Button>
        </div>
      </div>
    </Modal>
  );
};

const SessionCloseModal = ({ isOpen, onClose, session, onCloseSession, loading }) => {
  const [closingCash, setClosingCash] = useState(0);

  const handleClose = async () => {
    await onCloseSession({ sessionId: session?.id, closing_cash: parseFloat(closingCash) || 0 });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Close POS Session" size="sm">
      <div className="space-y-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p>Terminal: <strong>{session?.terminal?.name || '—'}</strong></p>
          <p>Opened: <strong>{session?.opened_at ? new Date(session.opened_at).toLocaleString() : '—'}</strong></p>
          <p>Opening Cash: <strong>₹{parseFloat(session?.opening_cash || 0).toFixed(2)}</strong></p>
        </div>
        <Input
          label="Closing Cash Count (₹)"
          type="number"
          step="0.01"
          value={closingCash}
          onChange={(e) => setClosingCash(e.target.value)}
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="danger" onClick={handleClose} loading={loading}>Close Session</Button>
        </div>
      </div>
    </Modal>
  );
};

const NoSessionScreen = ({ terminals, onOpen, loading }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center">
      <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.15c0 .415.336.75.75.75z" />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No Active Session</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Open a POS session to start billing</p>
      <Button onClick={() => setShowModal(true)}>Open Session</Button>

      <SessionOpenModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        terminals={terminals}
        onOpen={onOpen}
        loading={loading}
      />
    </div>
  );
};

export { SessionOpenModal, SessionCloseModal, NoSessionScreen };
