export interface User {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
  sort_order: number;
}

export interface Wallpaper {
  id: number;
  title: string;
  description: string | null;
  cloudinary_id: string;
  cloudinary_url: string;
  category_id: number | null;
  category?: Category;
  tags: string[];
  width: number | null;
  height: number | null;
  is_featured: boolean;
  is_premium: boolean;
  download_count: number;
  created_at: string;
}

export interface Favorite {
  id: number;
  user_id: string;
  wallpaper_id: number;
  wallpaper?: Wallpaper;
  created_at: string;
}

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high';
export type TicketCategory = 'bug' | 'feature' | 'billing' | 'other';

export interface Ticket {
  id: number;
  user_id: string;
  subject: string;
  category: TicketCategory;
  status: TicketStatus;
  priority: TicketPriority;
  created_at: string;
  updated_at: string;
}

export interface TicketMessage {
  id: number;
  ticket_id: number;
  sender_id: string | null;
  sender_type: 'user' | 'admin';
  message: string;
  created_at: string;
}

export interface Download {
  id: number;
  user_id: string;
  wallpaper_id: number;
  created_at: string;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export type Language = 'en' | 'es' | 'fr' | 'hi' | 'ar';
