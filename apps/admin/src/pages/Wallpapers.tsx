import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../api/supabase';

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env
  .VITE_CLOUDINARY_UPLOAD_PRESET as string;

async function uploadToCloudinary(file: File): Promise<{ url: string; id: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData },
  );
  if (!res.ok) throw new Error('Cloudinary upload failed');
  const json = await res.json();
  return { url: json.secure_url, id: json.public_id };
}

export function Wallpapers() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    category_id: '',
    tags: '',
    is_featured: false,
  });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: wallpapers, isLoading } = useQuery({
    queryKey: ['wallpapers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wallpapers')
        .select('*, category:categories(name, color)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await supabase.from('categories').select('*');
      return data ?? [];
    },
  });

  const deleteWallpaper = useMutation({
    mutationFn: async (id: number) => {
      await supabase.from('wallpapers').delete().eq('id', id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wallpapers'] }),
  });

  const toggleFeatured = useMutation({
    mutationFn: async (w: any) => {
      await supabase
        .from('wallpapers')
        .update({ is_featured: !w.is_featured })
        .eq('id', w.id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wallpapers'] }),
  });

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !form.title.trim()) return;
    try {
      setUploading(true);
      const { url, id } = await uploadToCloudinary(file);

      // Insert a temp image to get width/height
      const img = new Image();
      img.src = url;
      await new Promise((r) => (img.onload = r));

      const { error } = await supabase.from('wallpapers').insert({
        title: form.title.trim(),
        cloudinary_id: id,
        cloudinary_url: url,
        category_id: form.category_id ? Number(form.category_id) : null,
        tags: form.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        is_featured: form.is_featured,
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
      if (error) throw error;

      setIsModalOpen(false);
      setForm({ title: '', category_id: '', tags: '', is_featured: false });
      setFile(null);
      queryClient.invalidateQueries({ queryKey: ['wallpapers'] });
    } catch (err: any) {
      alert(err?.message ?? 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Wallpapers</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="rounded-xl bg-accent-primary px-4 py-2 text-sm font-semibold text-white hover:bg-accent-secondary"
        >
          + Upload
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-primary border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {(wallpapers ?? []).map((w) => (
            <div
              key={w.id}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-bg-card"
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  src={w.cloudinary_url}
                  alt={w.title}
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
                {w.is_featured && (
                  <span className="absolute left-2 top-2 rounded-full bg-accent-primary px-2 py-0.5 text-xs font-semibold text-white">
                    Featured
                  </span>
                )}
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition group-hover:opacity-100">
                  <button
                    onClick={() => toggleFeatured.mutate(w)}
                    className="rounded-lg bg-white/15 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/25"
                  >
                    {w.is_featured ? 'Unfeature' : 'Feature'}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${w.title}"?`))
                        deleteWallpaper.mutate(w.id);
                    }}
                    className="rounded-lg bg-status-error/80 px-3 py-1.5 text-xs font-medium text-white hover:bg-status-error"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-medium text-text-primary">
                  {w.title}
                </p>
                <p className="mt-0.5 text-xs text-text-tertiary">
                  {w.category?.name ?? 'Uncategorized'} · {w.download_count} downloads
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <form
            onSubmit={handleUpload}
            className="w-full max-w-md space-y-4 rounded-2xl border border-white/10 bg-bg-card p-6"
          >
            <h2 className="text-lg font-bold text-text-primary">Upload Wallpaper</h2>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                Image
              </label>
              <input
                type="file"
                accept="image/*"
                required
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="w-full rounded-xl border border-white/10 bg-bg-primary px-4 py-2.5 text-sm text-text-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-accent-primary file:px-3 file:py-1.5 file:text-white"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                Title
              </label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-bg-primary px-4 py-2.5 text-sm text-text-primary outline-none focus:border-accent-primary"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                Category
              </label>
              <select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-bg-primary px-4 py-2.5 text-sm text-text-primary outline-none focus:border-accent-primary"
              >
                <option value="">Uncategorized</option>
                {(categories ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                Tags (comma separated)
              </label>
              <input
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="nature, mountains, sunset"
                className="w-full rounded-xl border border-white/10 bg-bg-primary px-4 py-2.5 text-sm text-text-primary outline-none placeholder:text-text-tertiary focus:border-accent-primary"
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-text-secondary">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                className="h-4 w-4 accent-[#7C6EF6]"
              />
              Featured on home
            </label>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm font-medium text-text-secondary hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="flex-1 rounded-xl bg-accent-primary py-2.5 text-sm font-semibold text-white hover:bg-accent-secondary disabled:opacity-50"
              >
                {uploading ? 'Uploading…' : 'Upload'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
