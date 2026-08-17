import { supabase } from './supabase';
import type { Ticket, TicketMessage, TicketStatus, TicketPriority, TicketCategory } from '../types';

export const ticketService = {
  async getAll(userId: string): Promise<Ticket[]> {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async getById(id: number): Promise<Ticket | null> {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(
    userId: string,
    subject: string,
    category: TicketCategory,
    priority: TicketPriority,
  ): Promise<Ticket> {
    const { data, error } = await supabase
      .from('tickets')
      .insert({
        user_id: userId,
        subject,
        category,
        priority,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateStatus(id: number, status: TicketStatus): Promise<Ticket> {
    const { data, error } = await supabase
      .from('tickets')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getMessages(ticketId: number): Promise<TicketMessage[]> {
    const { data, error } = await supabase
      .from('ticket_messages')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data ?? [];
  },

  async sendMessage(
    ticketId: number,
    senderId: string,
    senderType: 'user' | 'admin',
    message: string,
  ): Promise<TicketMessage> {
    const { data, error } = await supabase
      .from('ticket_messages')
      .insert({
        ticket_id: ticketId,
        sender_id: senderId,
        sender_type: senderType,
        message,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};
