import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Plus } from 'lucide-react';
import { PageHeader, Table, Badge, Input, Button, SplitterLayout } from '@components/ui';
import { useToast } from '@components/ui/Toast';
import usePermission from '@/hooks/usePermission';
import api from '@services/api';
import API from '@services/endpoints';
import QUERY_KEY from '@services/queryKeys';
import BankAccountDetailPanel from './components/BankAccountDetailPanel';
import BankAccountCreateForm from './components/BankAccountCreateForm';

const BankAccountsPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { hasPermission } = usePermission();

  const canCreate = hasPermission('banking:create');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortColumn, setSortColumn] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkScreen = () => setIsDesktop(window.innerWidth >= 1280);
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY.BANK_ACCOUNTS, page, pageSize, debouncedSearch, sortColumn, sortDirection],
    queryFn: async () => {
      const params = {
        page,
        limit: pageSize,
        sort_by: sortColumn,
        sort_order: sortDirection.toUpperCase(),
      };
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      const res = await api.get(API.BANK_ACCOUNTS, { params });
      return res.data;
    },
    keepPreviousData: true,
  });

  const accounts = data?.data?.items || data?.items || [];
  const meta = data?.data?.meta || data?.meta || {};

  const formatCurrency = (val) => `₹${parseFloat(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  const handleSort = (key, direction) => {
    setSortColumn(key);
    setSortDirection(direction);
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setPage(1);
  };

  const handleRowClick = (row) => {
    if (isDesktop) {
      setShowCreateForm(false);
      setSelectedAccountId(selectedAccountId === row.id ? null : row.id);
    } else {
      navigate(`/admin/banking/accounts/${row.id}`);
    }
  };

  const handleAddAccount = () => {
    if (!canCreate) return;
    if (isDesktop) {
      setSelectedAccountId(null);
      setShowCreateForm(true);
    } else {
      navigate('/admin/banking/accounts/create');
    }
  };

  const columns = [
    {
      key: 'account_name',
      header: 'Account Name',
      width: '200px',
      sortable: true,
      render: (val) => (
        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{val || '-'}</span>
      ),
    },
    {
      key: 'bank_name',
      header: 'Bank',
      width: '160px',
      render: (val) => val || <span className="text-gray-400">-</span>,
    },
    {
      key: 'account_type',
      header: 'Type',
      width: '120px',
      render: (val) => (
        <Badge variant="info" type="soft" size="sm">
          {val ? val.charAt(0).toUpperCase() + val.slice(1) : '-'}
        </Badge>
      ),
    },
    {
      key: 'current_balance',
      header: 'Balance',
      width: '160px',
      sortable: true,
      render: (val) => (
        <span className="text-sm font-mono text-gray-900 dark:text-white">{formatCurrency(val)}</span>
      ),
    },
    {
      key: 'is_default',
      header: 'Default',
      width: '100px',
      render: (val) =>
        val ? (
          <Badge variant="success" type="soft" size="sm">
            Default
          </Badge>
        ) : null,
    },
    {
      key: 'created_at',
      header: 'Created',
      width: '160px',
      sortable: true,
      render: (val) => (
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {val
            ? new Date(val).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : '-'}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-80px)] lg:h-[calc(100vh-96px)]">
      <PageHeader
        title="Bank Accounts"
        subtitle="Manage bank, cash, and wallet accounts"
        breadcrumb={{ items: [{ label: 'Banking' }, { label: 'Accounts' }] }}
        sticky
      >
        {canCreate && (
          <Button size="sm" prefixIcon={Plus} onClick={handleAddAccount}>Add Account</Button>
        )}
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-shrink-0">
        <div className="w-full sm:w-80">
          <Input
            prefixIcon={Search}
            placeholder="Search by account name or bank..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            size="md"
          />
        </div>
      </div>

      {/* Table + Detail Panel */}
      <div className="overflow-hidden flex flex-1 min-h-0">
        <SplitterLayout
          initialRightWidth={380}
          minRightWidth={300}
          maxRightWidth={600}
          className="bg-transparent dark:bg-transparent"
          leftPanel={
            <Table
              columns={columns}
              data={accounts}
              loading={isLoading}
              emptyMessage="No bank accounts found"
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={handleSort}
              onRowClick={handleRowClick}
              activeRowId={selectedAccountId}
              showPagination
              currentPage={page}
              totalPages={meta.total_pages || 1}
              onPageChange={setPage}
              pageSize={pageSize}
              onPageSizeChange={handlePageSizeChange}
              pageSizeOptions={[10, 20, 50, 100]}
            />
          }
          rightPanel={
            (showCreateForm && isDesktop && canCreate) ? (
              <div className="h-full bg-white dark:bg-[#121212] rounded-2xl border border-gray-100 dark:border-[#424242] shadow-sm overflow-hidden">
                <BankAccountCreateForm onClose={() => setShowCreateForm(false)} />
              </div>
            ) : (!showCreateForm && selectedAccountId && isDesktop) ? (
              <div className="h-full bg-white dark:bg-[#121212] rounded-2xl border border-gray-100 dark:border-[#424242] shadow-sm overflow-hidden">
                <BankAccountDetailPanel
                  accountId={selectedAccountId}
                  onClose={() => setSelectedAccountId(null)}
                />
              </div>
            ) : null
          }
        />
      </div>
    </div>
  );
};

export default BankAccountsPage;
