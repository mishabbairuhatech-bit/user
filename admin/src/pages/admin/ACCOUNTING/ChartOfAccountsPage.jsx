import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronRight, ChevronDown, Plus, Edit2 } from 'lucide-react';
import api from '@services/api';
import API from '@services/endpoints';
import QUERY_KEY from '@services/queryKeys';
import { Button, Input, Modal, Select, Spinner, Badge, PageHeader, Card } from '@components/ui';
import { useToast } from '@components/ui/Toast';

const GroupNode = ({ group, level = 0, onEdit, onAddChild, expandedGroups, toggleGroup }) => {
  const isExpanded = expandedGroups.has(group.id);
  const hasChildren = group.children && group.children.length > 0;

  return (
    <div>
      <div
        className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-[#2a2a2a] cursor-pointer transition-colors"
        style={{ paddingLeft: `${level * 24 + 12}px` }}
        onClick={() => hasChildren && toggleGroup(group.id)}
      >
        {hasChildren ? (
          isExpanded ? <ChevronDown size={16} className="text-gray-400 flex-shrink-0" /> : <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
        ) : (
          <span className="w-4 flex-shrink-0" />
        )}

        <span className="text-sm font-medium text-gray-900 dark:text-white flex-1">{group.name}</span>

        <Badge variant={
          group.nature === 'assets' ? 'info' :
          group.nature === 'liabilities' ? 'warning' :
          group.nature === 'income' ? 'success' :
          group.nature === 'expense' ? 'danger' : 'default'
        } type="soft" size="sm">
          {group.nature}
        </Badge>

        {!group.is_system && (
          <button onClick={(e) => { e.stopPropagation(); onEdit(group); }} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <Edit2 size={14} />
          </button>
        )}

        <button onClick={(e) => { e.stopPropagation(); onAddChild(group); }} className="p-1 text-gray-400 hover:text-primary-600">
          <Plus size={14} />
        </button>
      </div>

      {isExpanded && hasChildren && (
        <div>
          {group.children.map((child) => (
            <GroupNode
              key={child.id}
              group={child}
              level={level + 1}
              onEdit={onEdit}
              onAddChild={onAddChild}
              expandedGroups={expandedGroups}
              toggleGroup={toggleGroup}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ChartOfAccountsPage = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [expandedGroups, setExpandedGroups] = useState(new Set());
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showLedgerModal, setShowLedgerModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [parentGroup, setParentGroup] = useState(null);
  const [groupForm, setGroupForm] = useState({ name: '', nature: 'assets', parent_id: '' });
  const [ledgerForm, setLedgerForm] = useState({ name: '', code: '', group_id: '', opening_balance: 0, opening_balance_type: 'debit', description: '' });

  const { data: groups, isLoading: groupsLoading } = useQuery({
    queryKey: [QUERY_KEY.ACCOUNT_GROUPS],
    queryFn: async () => {
      const res = await api.get(API.ACCOUNT_GROUPS);
      return res.data.data;
    },
  });

  const { data: ledgerData, isLoading: ledgersLoading } = useQuery({
    queryKey: [QUERY_KEY.LEDGER_ACCOUNTS],
    queryFn: async () => {
      const res = await api.get(API.LEDGER_ACCOUNTS, { params: { limit: 100 } });
      return res.data.data;
    },
  });

  const createGroupMutation = useMutation({
    mutationFn: (data) => api.post(API.ACCOUNT_GROUPS, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.ACCOUNT_GROUPS] });
      toast.success('Account group created successfully');
      setShowGroupModal(false);
      setGroupForm({ name: '', nature: 'assets', parent_id: '' });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create group');
    },
  });

  const createLedgerMutation = useMutation({
    mutationFn: (data) => api.post(API.LEDGER_ACCOUNTS, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.LEDGER_ACCOUNTS] });
      toast.success('Ledger account created successfully');
      setShowLedgerModal(false);
      setLedgerForm({ name: '', code: '', group_id: '', opening_balance: 0, opening_balance_type: 'debit', description: '' });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create ledger');
    },
  });

  const toggleGroup = (id) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleAddChild = (parent) => {
    setParentGroup(parent);
    setGroupForm({ name: '', nature: parent.nature, parent_id: parent.id });
    setShowGroupModal(true);
  };

  const handleEditGroup = (group) => {
    setEditingGroup(group);
    setGroupForm({ name: group.name, nature: group.nature, parent_id: group.parent_id || '' });
    setShowGroupModal(true);
  };

  const handleOpenLedgerModal = () => {
    setLedgerForm({ name: '', code: '', group_id: '', opening_balance: 0, opening_balance_type: 'debit', description: '' });
    setShowLedgerModal(true);
  };

  if (groupsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  const ledgers = ledgerData?.items || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chart of Accounts"
        subtitle="Manage account groups and ledger accounts"
        breadcrumb={{ items: [{ label: 'Accounting' }, { label: 'Chart of Accounts' }] }}
        sticky
      >
        <div className="flex gap-2">
          <Button variant="outline" size="sm" prefixIcon={Plus} onClick={() => { setEditingGroup(null); setParentGroup(null); setGroupForm({ name: '', nature: 'assets', parent_id: '' }); setShowGroupModal(true); }}>
            Add Group
          </Button>
          <Button size="sm" prefixIcon={Plus} onClick={handleOpenLedgerModal}>
            Add Ledger
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Groups Tree */}
        <Card>
          <Card.Body>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Account Groups</h3>
            <div className="space-y-0.5">
              {(groups || []).map((group) => (
                <GroupNode
                  key={group.id}
                  group={group}
                  onEdit={handleEditGroup}
                  onAddChild={handleAddChild}
                  expandedGroups={expandedGroups}
                  toggleGroup={toggleGroup}
                />
              ))}
            </div>
          </Card.Body>
        </Card>

        {/* Ledger Accounts List */}
        <Card>
          <Card.Body>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Ledger Accounts ({ledgers.length})</h3>
            {ledgersLoading ? (
              <Spinner />
            ) : (
              <div className="space-y-1 max-h-[600px] overflow-y-auto">
                {ledgers.map((ledger) => (
                  <div key={ledger.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-[#2a2a2a]">
                    <div>
                      <span className="text-sm text-gray-900 dark:text-white">{ledger.name}</span>
                      {ledger.code && <span className="text-xs text-gray-400 ml-2">({ledger.code})</span>}
                      <p className="text-xs text-gray-500">{ledger.group?.name}</p>
                    </div>
                    {ledger.is_system && <Badge variant="default" type="soft" size="sm">System</Badge>}
                  </div>
                ))}
              </div>
            )}
          </Card.Body>
        </Card>
      </div>

      {/* Add/Edit Group Modal */}
      <Modal isOpen={showGroupModal} onClose={() => setShowGroupModal(false)} title={editingGroup ? 'Edit Account Group' : 'Add Account Group'} size="sm">
        <div className="space-y-4">
          <Input label="Group Name" value={groupForm.name} onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })} placeholder="e.g. Current Assets" />
          <Select label="Nature" value={groupForm.nature} onChange={(val) => setGroupForm({ ...groupForm, nature: val })} options={[
            { value: 'assets', label: 'Assets' },
            { value: 'liabilities', label: 'Liabilities' },
            { value: 'income', label: 'Income' },
            { value: 'expense', label: 'Expense' },
            { value: 'equity', label: 'Equity' },
          ]} />
          {parentGroup && <p className="text-sm text-gray-500">Parent: <strong>{parentGroup.name}</strong></p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowGroupModal(false)}>Cancel</Button>
            <Button onClick={() => createGroupMutation.mutate(groupForm)} loading={createGroupMutation.isPending}>
              {editingGroup ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Ledger Modal */}
      <Modal isOpen={showLedgerModal} onClose={() => setShowLedgerModal(false)} title="Add Ledger Account" size="md">
        <div className="space-y-4">
          <Input label="Account Name" value={ledgerForm.name} onChange={(e) => setLedgerForm({ ...ledgerForm, name: e.target.value })} placeholder="e.g. SBI Current Account" />
          <Input label="Account Code (optional)" value={ledgerForm.code} onChange={(e) => setLedgerForm({ ...ledgerForm, code: e.target.value })} placeholder="e.g. ACC-001" />
          <Select label="Account Group" value={ledgerForm.group_id} onChange={(val) => setLedgerForm({ ...ledgerForm, group_id: val })} options={[
            { value: '', label: 'Select a group...' },
            ...(groups || []).flatMap((g) => [
              { value: g.id, label: g.name },
              ...(g.children || []).map((c) => ({ value: c.id, label: `  ${c.name}` })),
            ]),
          ]} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Opening Balance" type="number" value={ledgerForm.opening_balance} onChange={(e) => setLedgerForm({ ...ledgerForm, opening_balance: parseFloat(e.target.value) || 0 })} />
            <Select label="Balance Type" value={ledgerForm.opening_balance_type} onChange={(val) => setLedgerForm({ ...ledgerForm, opening_balance_type: val })} options={[
              { value: 'debit', label: 'Debit' },
              { value: 'credit', label: 'Credit' },
            ]} />
          </div>
          <Input label="Description (optional)" value={ledgerForm.description} onChange={(e) => setLedgerForm({ ...ledgerForm, description: e.target.value })} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowLedgerModal(false)}>Cancel</Button>
            <Button onClick={() => createLedgerMutation.mutate(ledgerForm)} loading={createLedgerMutation.isPending}>Create</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ChartOfAccountsPage;
