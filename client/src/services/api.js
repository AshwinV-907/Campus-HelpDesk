/**
 * API Client for Campus Helpdesk
 * Connects directly to Express REST endpoints with resilient error handling
 */

const API_BASE = '/api';

export const checkHealth = async () => {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error(`Health check returned status ${res.status}`);
    return await res.json();
  } catch (error) {
    return { status: 'offline', error: error.message };
  }
};

export const getTickets = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.q) params.append('q', filters.q);
  if (filters.category && filters.category !== 'All') params.append('category', filters.category);
  if (filters.status && filters.status !== 'All') params.append('status', filters.status);
  if (filters.sortBy) params.append('sortBy', filters.sortBy);

  const url = `${API_BASE}/tickets${params.toString() ? `?${params.toString()}` : ''}`;
  const res = await fetch(url);
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch tickets (${res.status})`);
  }
  
  return await res.json();
};

export const getStats = async () => {
  const res = await fetch(`${API_BASE}/tickets/stats`);
  if (!res.ok) {
    throw new Error(`Failed to fetch stats (${res.status})`);
  }
  return await res.json();
};

export const createTicket = async (ticketData) => {
  const res = await fetch(`${API_BASE}/tickets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(ticketData),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.message || 'Validation error');
    err.errors = data.errors || [data.message];
    throw err;
  }

  return data;
};

export const updateTicketStatus = async (ticketId, status, note = '') => {
  const res = await fetch(`${API_BASE}/tickets/${encodeURIComponent(ticketId)}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status, note }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || `Failed to update ticket status (${res.status})`);
  }

  return data;
};

export const deleteTicket = async (ticketId) => {
  const res = await fetch(`${API_BASE}/tickets/${encodeURIComponent(ticketId)}`, {
    method: 'DELETE',
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || `Failed to delete ticket (${res.status})`);
  }

  return data;
};
