import { useState, useEffect, useCallback } from 'react';
import type { Ticket, TicketMessage } from '../types';
import { ticketService } from '../services/ticket.service';

export function useTickets(userId: string | undefined) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const data = await ticketService.getAll(userId);
      setTickets(data);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  return { tickets, loading, refresh: fetchTickets };
}

export function useTicketMessages(ticketId: number) {
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const data = await ticketService.getMessages(ticketId);
      setMessages(data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return { messages, loading, refresh: fetchMessages };
}
