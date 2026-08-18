import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../api/supabase';
import { StatusPill } from '../components/DataTable';

const STATUSES = ['open', 'in_progress', 'resolved', 'closed'];

export function TicketDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [reply, setReply] = useState('');

  const { data: ticket } = useQuery({
    queryKey: ['ticket', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tickets')
        .select('*, profile:profiles(full_name, username, email)')
        .eq('id', Number(id))
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: messages } = useQuery({
    queryKey: ['ticket-messages', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ticket_messages')
        .select('*')
        .eq('ticket_id', Number(id))
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const sendReply = useMutation({
    mutationFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      await supabase.from('ticket_messages').insert({
        ticket_id: Number(id),
        sender_id: userData.user?.id,
        sender_type: 'admin',
        message: reply.trim(),
      });
      // Bump ticket updated_at
      await supabase
        .from('tickets')
        .update({ status: 'in_progress', updated_at: new Date().toISOString() })
        .eq('id', Number(id));
    },
    onSuccess: () => {
      setReply('');
      queryClient.invalidateQueries({ queryKey: ['ticket-messages', id] });
      queryClient.invalidateQueries({ queryKey: ['ticket', id] });
    },
  });

  const changeStatus = useMutation({
    mutationFn: async (status: string) => {
      await supabase
        .from('tickets')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', Number(id));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ticket', id] }),
  });

  if (!ticket) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to="/tickets"
        className="mb-4 inline-block text-sm text-text-secondary hover:text-text-primary"
      >
        ← Back to tickets
      </Link>

      {/* Ticket header */}
      <div className="mb-6 rounded-2xl border border-white/10 bg-bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-text-primary">{ticket.subject}</h1>
            <p className="mt-1 text-sm text-text-tertiary">
              From: {ticket.profile?.full_name || ticket.profile?.username || 'Unknown'}
              {ticket.profile?.email ? ` · ${ticket.profile.email}` : ''}
            </p>
          </div>
          <StatusPill status={ticket.status} />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-text-tertiary">Change status:</span>
          {STATUSES.map((status) => (
            <button
              key={status}
              onClick={() => changeStatus.mutate(status)}
              disabled={ticket.status === status}
              className={`rounded-full px-3 py-1 text-xs font-semibold capitalize transition ${
                ticket.status === status
                  ? 'bg-accent-primary text-white'
                  : 'bg-bg-elevated text-text-secondary hover:text-text-primary'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation */}
      <div className="mb-6 space-y-3">
        {(messages ?? []).map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.sender_type === 'admin'
                  ? 'bg-accent-primary text-white'
                  : 'border border-white/10 bg-bg-card text-text-primary'
              }`}
            >
              <p className="mb-1 text-xs font-semibold opacity-70">
                {message.sender_type === 'admin' ? 'Support' : 'User'}
              </p>
              <p className="text-sm leading-5">{message.message}</p>
              <p className="mt-1 text-xs opacity-50">
                {new Date(message.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
        {(messages ?? []).length === 0 && (
          <p className="py-8 text-center text-sm text-text-tertiary">
            No messages yet
          </p>
        )}
      </div>

      {/* Reply box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (reply.trim()) sendReply.mutate();
        }}
        className="rounded-2xl border border-white/10 bg-bg-card p-4"
      >
        <textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Type your reply as Support…"
          rows={3}
          className="w-full resize-none rounded-xl border border-white/10 bg-bg-primary px-4 py-3 text-sm text-text-primary outline-none placeholder:text-text-tertiary focus:border-accent-primary"
        />
        <div className="mt-3 flex justify-end">
          <button
            type="submit"
            disabled={sendReply.isPending || !reply.trim()}
            className="rounded-xl bg-accent-primary px-5 py-2 text-sm font-semibold text-white hover:bg-accent-secondary disabled:opacity-50"
          >
            {sendReply.isPending ? 'Sending…' : 'Send Reply'}
          </button>
        </div>
      </form>
    </div>
  );
}
