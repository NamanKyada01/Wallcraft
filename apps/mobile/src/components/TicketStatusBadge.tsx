import React from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from './ui/Badge';
import type { TicketStatus, TicketPriority } from '../types';
import { getStatusColor, getPriorityColor } from '../utils/helpers';

const STATUS_KEY: Record<TicketStatus, string> = {
  open: 'ticket.open',
  in_progress: 'ticket.inProgress',
  resolved: 'ticket.resolved',
  closed: 'ticket.closed',
};

const PRIORITY_KEY: Record<TicketPriority, string> = {
  low: 'ticket.low',
  medium: 'ticket.medium',
  high: 'ticket.high',
};

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  const { t } = useTranslation();
  return (
    <Badge label={t(STATUS_KEY[status])} color={getStatusColor(status)} />
  );
}

export function TicketPriorityBadge({ priority }: { priority: TicketPriority }) {
  const { t } = useTranslation();
  return (
    <Badge label={t(PRIORITY_KEY[priority])} color={getPriorityColor(priority)} />
  );
}
