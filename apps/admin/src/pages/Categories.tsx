import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../api/supabase';

export function Categories() {
  const queryClient = useQueryClient();
  const [newCategory, setNewCategory] = useState({
    name: '',
    icon: '🖼️',
    color: '#7C6EF6',
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order');
      if (error) throw error;
      return data ?? [];
    },
  });

  const createCategory = useMutation({
    mutationFn: async () => {
      const slug = newCategory.name.toLowerCase().replace(/\s+/g, '-');
      await supabase.from('categories').insert({
        name: newCategory.name,
        slug,
        icon: newCategory.icon,
        color: newCategory.color,
      });
    },
    onSuccess: () => {
      setNewCategory({ name: '', icon: '🖼️', color: '#7C6EF6' });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const renameCategory = useMutation({
    mutationFn: async (category: { id: number; name: string }) => {
      await supabase
        .from('categories')
        .update({ name: category.name })
        .eq('id', category.id);
    },
    onSuccess: () => {
      setEditingId(null);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: number) => {
      await supabase.from('categories').delete().eq('id', id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-text-primary">Categories</h1>

      {/* Create form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (newCategory.name.trim()) createCategory.mutate();
        }}
        className="mb-8 flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-bg-card p-4"
      >
        <input
          value={newCategory.name}
          onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
          placeholder="New category name"
          className="min-w-48 flex-1 rounded-xl border border-white/10 bg-bg-primary px-4 py-2 text-sm text-text-primary outline-none placeholder:text-text-tertiary focus:border-accent-primary"
        />
        <input
          value={newCategory.icon}
          onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
          className="w-16 rounded-xl border border-white/10 bg-bg-primary px-3 py-2 text-center text-sm text-text-primary outline-none focus:border-accent-primary"
        />
        <input
          type="color"
          value={newCategory.color}
          onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
          className="h-10 w-14 cursor-pointer rounded-xl border border-white/10 bg-bg-primary"
        />
        <button
          type="submit"
          className="rounded-xl bg-accent-primary px-5 py-2 text-sm font-semibold text-white hover:bg-accent-secondary"
        >
          Add
        </button>
      </form>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(categories ?? []).map((cat) => (
          <div
            key={cat.id}
            className="flex items-center gap-4 rounded-2xl border border-white/10 bg-bg-card p-4"
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
              style={{ backgroundColor: `${cat.color}22` }}
            >
              {cat.icon}
            </div>
            <div className="min-w-0 flex-1">
              {editingId === cat.id ? (
                <input
                  autoFocus
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={() =>
                    editValue.trim() &&
                    renameCategory.mutate({ id: cat.id, name: editValue.trim() })
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && editValue.trim())
                      renameCategory.mutate({ id: cat.id, name: editValue.trim() });
                  }}
                  className="w-full rounded-lg border border-accent-primary bg-bg-primary px-2 py-1 text-sm text-text-primary outline-none"
                />
              ) : (
                <p
                  className="cursor-pointer truncate font-medium text-text-primary"
                  onClick={() => {
                    setEditingId(cat.id);
                    setEditValue(cat.name);
                  }}
                  title="Click to rename"
                >
                  {cat.name}
                </p>
              )}
              <p className="text-xs text-text-tertiary">/{cat.slug}</p>
            </div>
            <button
              onClick={() => {
                if (confirm(`Delete "${cat.name}"?`)) deleteCategory.mutate(cat.id);
              }}
              className="rounded-lg px-2 py-1 text-sm text-status-error hover:bg-status-error/10"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
