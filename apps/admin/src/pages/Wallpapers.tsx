import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../api/supabase';

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string;

// Helper to build custom transformed Cloudinary URLs
export function buildCustomCloudinaryUrl(
  publicIdOrUrl: string,
  options: {
    width?: number;
    height?: number;
    crop?: 'fill' | 'fit' | 'limit' | 'scale' | 'thumb';
    quality?: 'auto' | 'auto:best' | 'auto:good' | 'auto:eco' | '100' | '90' | '80';
    format?: 'auto' | 'webp' | 'png' | 'jpg' | 'avif';
    effect?: string;
    gravity?: 'auto' | 'face' | 'center';
  } = {}
): string {
  // Extract public_id if full URL was provided
  let publicId = publicIdOrUrl;
  if (publicIdOrUrl.includes('/upload/')) {
    const parts = publicIdOrUrl.split('/upload/');
    const afterUpload = parts[1];
    // Remove existing transformation params if any (e.g. v123/ or w_100/v123/)
    const subParts = afterUpload.split('/');
    if (subParts.length > 1 && !subParts[0].startsWith('v')) {
      // It has prior transformation like w_400,c_fill
      publicId = subParts.slice(1).join('/');
    } else {
      publicId = afterUpload;
    }
  }

  const transforms: string[] = [];
  if (options.crop) transforms.push(`c_${options.crop}`);
  if (options.width) transforms.push(`w_${options.width}`);
  if (options.height) transforms.push(`h_${options.height}`);
  if (options.gravity) transforms.push(`g_${options.gravity}`);
  if (options.quality) transforms.push(`q_${options.quality}`);
  if (options.format) transforms.push(`f_${options.format}`);
  if (options.effect) transforms.push(`e_${options.effect}`);

  const transformStr = transforms.length > 0 ? transforms.join(',') + '/' : '';
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformStr}${publicId}`;
}

async function uploadToCloudinary(fileOrUrl: File | string): Promise<{ url: string; id: string }> {
  const formData = new FormData();
  formData.append('file', fileOrUrl);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET || 'wallcraft');
  
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData },
  );
  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson?.error?.message ?? 'Cloudinary upload failed');
  }
  const json = await res.json();
  return { url: json.secure_url, id: json.public_id };
}

export function Wallpapers() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLinkBuilderOpen, setIsLinkBuilderOpen] = useState(false);
  const [selectedWallpaperForLink, setSelectedWallpaperForLink] = useState<any>(null);

  // Upload Form State
  const [uploadType, setUploadType] = useState<'file' | 'url'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    category_id: '',
    tags: '',
    is_featured: false,
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');

  // Custom Link Builder Options State
  const [customOptions, setCustomOptions] = useState({
    preset: 'mobile_full',
    width: 1080,
    height: 2400,
    crop: 'fill' as 'fill' | 'fit' | 'limit' | 'scale' | 'thumb',
    quality: 'auto:best' as 'auto' | 'auto:best' | 'auto:good' | 'auto:eco' | '100' | '90' | '80',
    format: 'auto' as 'auto' | 'webp' | 'png' | 'jpg' | 'avif',
    effect: 'none',
  });
  const [copiedLink, setCopiedLink] = useState(false);

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
    if (uploadType === 'file' && !file) return;
    if (uploadType === 'url' && !imageUrl.trim()) return;
    if (!form.title.trim()) return;

    try {
      setUploading(true);
      setUploadProgress('Uploading to Cloudinary CDN…');
      
      const target = uploadType === 'file' ? file! : imageUrl.trim();
      const { url, id } = await uploadToCloudinary(target);

      setUploadProgress('Analyzing dimensions & saving metadata…');
      // Read dimensions
      const img = new Image();
      img.src = url;
      await new Promise((r) => {
        img.onload = r;
        img.onerror = r;
      });

      const width = img.naturalWidth || 1080;
      const height = img.naturalHeight || 1920;

      const { error } = await supabase.from('wallpapers').insert({
        title: form.title.trim(),
        description: form.description.trim() || null,
        cloudinary_id: id,
        cloudinary_url: url,
        category_id: form.category_id ? Number(form.category_id) : null,
        tags: form.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        is_featured: form.is_featured,
        width,
        height,
      });
      if (error) throw error;

      setIsModalOpen(false);
      setForm({ title: '', description: '', category_id: '', tags: '', is_featured: false });
      setFile(null);
      setImageUrl('');
      queryClient.invalidateQueries({ queryKey: ['wallpapers'] });
    } catch (err: any) {
      alert(err?.message ?? 'Upload failed. Please verify Cloudinary credentials in .env');
    } finally {
      setUploading(false);
      setUploadProgress('');
    }
  };

  // Preset handler for custom links
  const applyPreset = (preset: string) => {
    if (preset === 'mobile_full') {
      setCustomOptions({
        preset: 'mobile_full',
        width: 1080,
        height: 2400,
        crop: 'fill',
        quality: 'auto:best',
        format: 'auto',
        effect: 'none',
      });
    } else if (preset === 'thumbnail') {
      setCustomOptions({
        preset: 'thumbnail',
        width: 400,
        height: 600,
        crop: 'fill',
        quality: 'auto:good',
        format: 'webp',
        effect: 'none',
      });
    } else if (preset === 'square_avatar') {
      setCustomOptions({
        preset: 'square_avatar',
        width: 600,
        height: 600,
        crop: 'fill',
        quality: 'auto:best',
        format: 'auto',
        effect: 'none',
      });
    } else if (preset === '4k_uhd') {
      setCustomOptions({
        preset: '4k_uhd',
        width: 2160,
        height: 3840,
        crop: 'limit',
        quality: '100',
        format: 'auto',
        effect: 'none',
      });
    } else if (preset === 'blur_bg') {
      setCustomOptions({
        preset: 'blur_bg',
        width: 1080,
        height: 1920,
        crop: 'fill',
        quality: 'auto:eco',
        format: 'webp',
        effect: 'blur:800',
      });
    }
  };

  const generatedCustomUrl = useMemo(() => {
    if (!selectedWallpaperForLink) return '';
    return buildCustomCloudinaryUrl(selectedWallpaperForLink.cloudinary_url, {
      width: customOptions.width,
      height: customOptions.height,
      crop: customOptions.crop,
      quality: customOptions.quality,
      format: customOptions.format,
      effect: customOptions.effect !== 'none' ? customOptions.effect : undefined,
    });
  }, [selectedWallpaperForLink, customOptions]);

  const handleCopyLink = () => {
    if (!generatedCustomUrl) return;
    navigator.clipboard.writeText(generatedCustomUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Wallpapers</h1>
          <p className="text-sm text-text-tertiary mt-0.5">
            Manage Cloudinary wallpapers, generate custom transformed links & sync to mobile app API.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-accent-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent-primary/25 hover:bg-accent-secondary transition"
        >
          <span>+</span>
          <span>Upload Image</span>
        </button>
      </div>

      {/* Wallpaper Grid */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-primary border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {(wallpapers ?? []).map((w) => (
            <div
              key={w.id}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-bg-card transition hover:border-accent-primary/50 hover:shadow-xl hover:shadow-accent-primary/10"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-bg-primary">
                <img
                  src={buildCustomCloudinaryUrl(w.cloudinary_url, {
                    width: 400,
                    height: 550,
                    crop: 'fill',
                    quality: 'auto:good',
                    format: 'webp',
                  })}
                  alt={w.title}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  loading="lazy"
                />

                {w.is_featured && (
                  <span className="absolute left-2.5 top-2.5 rounded-full bg-accent-primary px-2.5 py-0.5 text-xs font-semibold text-white shadow-md">
                    Featured
                  </span>
                )}

                {/* Hover overlay actions */}
                <div className="absolute inset-0 flex flex-col justify-between bg-black/60 p-3 opacity-0 transition duration-200 group-hover:opacity-100">
                  <div className="flex justify-end gap-1.5">
                    <button
                      onClick={() => {
                        setSelectedWallpaperForLink(w);
                        setIsLinkBuilderOpen(true);
                      }}
                      title="Custom Link Generator"
                      className="rounded-lg bg-accent-primary/90 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-accent-primary"
                    >
                      🔗 Custom Link
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-1.5 pt-2">
                    <button
                      onClick={() => toggleFeatured.mutate(w)}
                      className="flex-1 rounded-lg bg-white/20 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-white/30"
                    >
                      {w.is_featured ? 'Unfeature' : 'Feature'}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${w.title}"?`)) deleteWallpaper.mutate(w.id);
                      }}
                      className="rounded-lg bg-status-error/80 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-status-error"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-3">
                <p className="truncate text-sm font-semibold text-text-primary">
                  {w.title}
                </p>
                <div className="mt-1 flex items-center justify-between text-xs text-text-tertiary">
                  <span>{w.category?.name ?? 'Uncategorized'}</span>
                  <span>↓ {w.download_count ?? 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal with Cloudinary Direct Upload */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleUpload}
            className="w-full max-w-lg space-y-4 rounded-3xl border border-white/10 bg-bg-card p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h2 className="text-lg font-bold text-text-primary">Upload to Cloudinary</h2>
                <p className="text-xs text-text-tertiary">
                  Upload high-res wallpaper image and sync across the mobile app.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-text-tertiary hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Source Tab: File or URL */}
            <div className="flex rounded-xl bg-bg-primary p-1 border border-white/5">
              <button
                type="button"
                onClick={() => setUploadType('file')}
                className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition ${
                  uploadType === 'file' ? 'bg-accent-primary text-white' : 'text-text-secondary'
                }`}
              >
                Local File
              </button>
              <button
                type="button"
                onClick={() => setUploadType('url')}
                className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition ${
                  uploadType === 'url' ? 'bg-accent-primary text-white' : 'text-text-secondary'
                }`}
              >
                Remote Image URL
              </button>
            </div>

            {uploadType === 'file' ? (
              <div>
                <label className="mb-1.5 block text-xs font-medium text-text-secondary">
                  Choose Image File
                </label>
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="w-full rounded-xl border border-white/10 bg-bg-primary px-4 py-2.5 text-xs text-text-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-accent-primary file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-accent-secondary"
                />
              </div>
            ) : (
              <div>
                <label className="mb-1.5 block text-xs font-medium text-text-secondary">
                  Direct Image Web URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-bg-primary px-4 py-2.5 text-sm text-text-primary outline-none focus:border-accent-primary"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-text-secondary">
                  Title *
                </label>
                <input
                  required
                  placeholder="e.g. Cyberpunk City 4K"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-bg-primary px-3.5 py-2 text-sm text-text-primary outline-none focus:border-accent-primary"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-text-secondary">
                  Category
                </label>
                <select
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-bg-primary px-3.5 py-2 text-sm text-text-primary outline-none focus:border-accent-primary"
                >
                  <option value="">Uncategorized</option>
                  {(categories ?? []).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">
                Tags (comma separated)
              </label>
              <input
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="nature, mountains, dark, 4k"
                className="w-full rounded-xl border border-white/10 bg-bg-primary px-3.5 py-2 text-sm text-text-primary outline-none placeholder:text-text-tertiary focus:border-accent-primary"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">
                Description (Optional)
              </label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description about the wallpaper..."
                className="w-full rounded-xl border border-white/10 bg-bg-primary px-3.5 py-2 text-sm text-text-primary outline-none placeholder:text-text-tertiary focus:border-accent-primary resize-none"
              />
            </div>

            <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                className="h-4 w-4 rounded accent-[#7C6EF6]"
              />
              Feature this wallpaper on the Home carousel
            </label>

            {uploadProgress ? (
              <div className="rounded-xl bg-accent-primary/10 border border-accent-primary/20 p-2.5 text-center text-xs font-medium text-accent-primary animate-pulse">
                {uploadProgress}
              </div>
            ) : null}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 rounded-xl border border-white/10 py-2.5 text-xs font-medium text-text-secondary hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="flex-1 rounded-xl bg-accent-primary py-2.5 text-xs font-semibold text-white shadow-md shadow-accent-primary/25 hover:bg-accent-secondary disabled:opacity-50 transition"
              >
                {uploading ? 'Uploading…' : 'Upload to Cloudinary'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Custom Link Generator Modal */}
      {isLinkBuilderOpen && selectedWallpaperForLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-2xl space-y-4 rounded-3xl border border-white/10 bg-bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h2 className="text-lg font-bold text-text-primary">
                  Cloudinary Custom Link Generator
                </h2>
                <p className="text-xs text-text-tertiary">
                  Generate optimized, custom-sized and transformed CDN URLs for "{selectedWallpaperForLink.title}"
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsLinkBuilderOpen(false)}
                className="text-text-tertiary hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Presets Bar */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-secondary">
                Quick Transformation Presets
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'mobile_full', label: '📱 Mobile 1080x2400' },
                  { id: 'thumbnail', label: '🖼️ Thumbnail 400x600' },
                  { id: 'square_avatar', label: '⬛ Square 600x600' },
                  { id: '4k_uhd', label: '🌟 4K UHD 2160x3840' },
                  { id: 'blur_bg', label: '🌫️ Blurred Backdrop' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => applyPreset(p.id)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                      customOptions.preset === p.id
                        ? 'bg-accent-primary text-white shadow-md'
                        : 'border border-white/10 bg-bg-primary text-text-secondary hover:bg-white/5'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Options Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-bg-primary/70 p-3.5 rounded-2xl border border-white/5">
              <div>
                <label className="text-[11px] font-medium text-text-tertiary block mb-1">
                  Width (px)
                </label>
                <input
                  type="number"
                  value={customOptions.width}
                  onChange={(e) =>
                    setCustomOptions({ ...customOptions, width: Number(e.target.value), preset: 'custom' })
                  }
                  className="w-full rounded-lg border border-white/10 bg-bg-card px-2.5 py-1.5 text-xs text-text-primary outline-none focus:border-accent-primary"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-text-tertiary block mb-1">
                  Height (px)
                </label>
                <input
                  type="number"
                  value={customOptions.height}
                  onChange={(e) =>
                    setCustomOptions({ ...customOptions, height: Number(e.target.value), preset: 'custom' })
                  }
                  className="w-full rounded-lg border border-white/10 bg-bg-card px-2.5 py-1.5 text-xs text-text-primary outline-none focus:border-accent-primary"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-text-tertiary block mb-1">
                  Crop Mode
                </label>
                <select
                  value={customOptions.crop}
                  onChange={(e) =>
                    setCustomOptions({ ...customOptions, crop: e.target.value as any, preset: 'custom' })
                  }
                  className="w-full rounded-lg border border-white/10 bg-bg-card px-2.5 py-1.5 text-xs text-text-primary outline-none focus:border-accent-primary"
                >
                  <option value="fill">fill (smart crop)</option>
                  <option value="fit">fit (preserve ratio)</option>
                  <option value="limit">limit (max bounds)</option>
                  <option value="scale">scale</option>
                  <option value="thumb">thumb</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-text-tertiary block mb-1">
                  Format
                </label>
                <select
                  value={customOptions.format}
                  onChange={(e) =>
                    setCustomOptions({ ...customOptions, format: e.target.value as any, preset: 'custom' })
                  }
                  className="w-full rounded-lg border border-white/10 bg-bg-card px-2.5 py-1.5 text-xs text-text-primary outline-none focus:border-accent-primary"
                >
                  <option value="auto">auto (best for client)</option>
                  <option value="webp">webp</option>
                  <option value="avif">avif</option>
                  <option value="jpg">jpg</option>
                  <option value="png">png</option>
                </select>
              </div>
            </div>

            {/* Generated URL output */}
            <div>
              <label className="text-xs font-semibold text-text-primary block mb-1.5">
                Generated Custom Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={generatedCustomUrl}
                  className="flex-1 rounded-xl border border-white/10 bg-bg-primary px-3.5 py-2 text-xs font-mono text-accent-secondary outline-none select-all"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="rounded-xl bg-accent-primary px-4 py-2 text-xs font-semibold text-white shadow hover:bg-accent-secondary transition"
                >
                  {copiedLink ? '✓ Copied!' : 'Copy Link'}
                </button>
              </div>
            </div>

            {/* Live Preview Box */}
            <div className="rounded-2xl border border-white/10 bg-bg-primary/50 p-3 flex items-center gap-4">
              <div className="h-28 w-20 overflow-hidden rounded-xl bg-black border border-white/10">
                <img
                  src={generatedCustomUrl}
                  alt="Custom transformation preview"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 text-xs text-text-secondary space-y-1">
                <p className="font-semibold text-text-primary">Live Transformed Preview</p>
                <p>Resolution: {customOptions.width} × {customOptions.height}px</p>
                <p>Crop: {customOptions.crop} · Quality: {customOptions.quality} · Format: {customOptions.format}</p>
                <p className="text-[11px] text-text-tertiary">
                  This custom link directly streams from Cloudinary edge CDN to the mobile app API.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsLinkBuilderOpen(false)}
                className="rounded-xl bg-white/10 px-5 py-2 text-xs font-semibold text-white hover:bg-white/20"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
