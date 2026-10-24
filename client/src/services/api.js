/**
 * API Client for Campus Helpdesk
 * Connects to Express REST endpoints with dual-layer proxy & direct fallback
 */

const PROXY_API = '/api';
const DIRECT_API = 'http://localhost:5000/api';

const resilientFetch = async (endpoint, options = {}, timeoutMs = 6000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${PROXY_API}${endpoint}`, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok && res.status >= 500) {
      throw new Error(`Proxy error ${res.status}`);
    }
    return res;
  } catch (err) {
    clearTimeout(timer);
    // Fallback to direct Express backend at port 5000
    const directController = new AbortController();
    const directTimer = setTimeout(() => directController.abort(), timeoutMs);
    try {
      const directRes = await fetch(`${DIRECT_API}${endpoint}`, {
        ...options,
        signal: directController.signal,
      });
      clearTimeout(directTimer);
      return directRes;
    } catch (fallbackErr) {
      clearTimeout(directTimer);
      throw new Error(`Server connection failed: ${fallbackErr.message}`);
    }
  }
};

export const checkHealth = async () => {
  try {
    const res = await resilientFetch('/health', {}, 3000);
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

  const endpoint = `/tickets${params.toString() ? `?${params.toString()}` : ''}`;
  const res = await resilientFetch(endpoint);
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch tickets (${res.status})`);
  }
  
  return await res.json();
};

export const getStats = async () => {
  const res = await resilientFetch('/tickets/stats');
  if (!res.ok) {
    throw new Error(`Failed to fetch stats (${res.status})`);
  }
  return await res.json();
};

export const createTicket = async (ticketData) => {
  const res = await resilientFetch('/tickets', {
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
  const res = await resilientFetch(`/tickets/${encodeURIComponent(ticketId)}/status`, {
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
  const res = await resilientFetch(`/tickets/${encodeURIComponent(ticketId)}`, {
    method: 'DELETE',
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || `Failed to delete ticket (${res.status})`);
  }

  return data;
};
