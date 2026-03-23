import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, ChevronRight, ChevronDown, Trash2 } from 'lucide-react';
import api from '@/services/api';
import API from '@/services/endpoints';
import QUERY_KEY from '@/services/queryKeys';
import { Button, Input, Modal, Spinner, PageHeader, ConfirmModal } from '@components/ui';

const CategoryNode = ({ cat, level = 0, onEdit, onAddChild, onDelete }) => {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = cat.children && cat.children.length > 0;

  return (
    <div>
      <div className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
        style={{ paddingLeft: `${level * 24 + 12}px` }}>
        {hasChildren ? (
          <button onClick={() => setExpanded(!expanded)} className="text-gray-400">
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        ) : <span className="w-4" />}
        <span className="text-sm text-gray-900 dark:text-white flex-1">{cat.name}</span>
        {cat.description && <span className="text-xs text-gray-400 truncate max-w-[200px]">{cat.description}</span>}
        <button onClick={() => onAddChild(cat)} className="p-1 text-gray-400 hover:text-primary-600"><Plus size={14} /></button>
        <button onClick={() => onEdit(cat)} className="p-1 text-gray-400 hover:text-gray-600"><Edit2 size={14} /></button>
        <button onClick={() => onDelete(cat)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
      </div>
      {expanded && hasChildren && cat.children.map((child) => (
        <CategoryNode key={child.id} cat={child} level={level + 1} onEdit={onEdit} onAddChild={onAddChild} onDelete={onDelete} />
      ))}
    </div>
  );
};

const CategoriesPage = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [deletingCat, setDeletingCat] = useState(null);
  const [parentCat, setParentCat] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });

  const { data: categories, isLoading } = useQuery({
    queryKey: [QUERY_KEY.CATEGORIES],
    queryFn: () => api.get(API.CATEGORIES).then((r) => r.data.data),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => editingCat
      ? api.put(`${API.CATEGORIES}/${editingCat.id}`, data)
      : api.post(API.CATEGORIES, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: [QUERY_KEY.CATEGORIES] }); setShowModal(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`${API.CATEGORIES}/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: [QUERY_KEY.CATEGORIES] }); setShowDeleteModal(false); },
  });

  const handleAdd = () => { setEditingCat(null); setParentCat(null); setForm({ name: '', description: '' }); setShowModal(true); };
  const handleAddChild = (parent) => { setEditingCat(null); setParentCat(parent); setForm({ name: '', description: '' }); setShowModal(true); };
  const handleEdit = (cat) => { setEditingCat(cat); setParentCat(null); setForm({ name: cat.name, description: cat.description || '' }); setShowModal(true); };
  const handleDelete = (cat) => { setDeletingCat(cat); setShowDeleteModal(true); };

  return (
    <div className="space-y-6">
      <PageHeader title="Categories" subtitle="Organize products into categories"
        actions={<Button size="sm" onClick={handleAdd}><Plus size={16} className="mr-1" /> Add Category</Button>} />

      {isLoading ? <div className="flex justify-center py-20"><Spinner size="lg" /></div> : (
        <div className="bg-white dark:bg-[#171717] rounded-xl border border-gray-200 dark:border-[#2a2a2a] p-4">
          {(categories || []).length === 0
            ? <p className="text-center py-10 text-sm text-gray-400">No categories yet. Create one to get started.</p>
            : (categories || []).map((cat) => (
              <CategoryNode key={cat.id} cat={cat} onEdit={handleEdit} onAddChild={handleAddChild} onDelete={handleDelete} />
            ))
          }
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingCat ? 'Edit Category' : 'Add Category'} size="sm">
        <div className="space-y-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Electronics" />
          <Input label="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          {parentCat && <p className="text-sm text-gray-500">Parent: <strong>{parentCat.name}</strong></p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate({ ...form, parent_id: parentCat?.id })} loading={saveMutation.isPending}>
              {editingCat ? 'Update' : 'Create'}
            </Button>
          </div>
          {saveMutation.isError && <p className="text-sm text-red-600">{saveMutation.error?.response?.data?.message || 'Failed.'}</p>}
        </div>
      </Modal>

      <ConfirmModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}
        onConfirm={() => deleteMutation.mutate(deletingCat?.id)} title="Delete Category"
        message={`Delete "${deletingCat?.name}"? This cannot be undone.`} variant="danger" confirmText="Delete"
        loading={deleteMutation.isPending} />
    </div>
  );
};

export default CategoriesPage;
