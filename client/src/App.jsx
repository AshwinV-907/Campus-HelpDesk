import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { StatsOverview } from './components/StatsOverview';
import { FilterBar } from './components/FilterBar';
import { RequestCard } from './components/RequestCard';
import { RequestTable } from './components/RequestTable';
import { RequestModal } from './components/RequestModal';
import { ToastNotification } from './components/ToastNotification';
import { EmptyState } from './components/EmptyState';
import { 
  getTickets, 
  getStats, 
  createTicket, 
  updateTicketStatus, 
  deleteTicket, 
  checkHealth 
} from './services/api';
import { 
  Flame, 
  Wifi, 
  Tv, 
  CheckCircle2, 
  Plus, 
  Sparkles,
  Zap,
  Clock,
  ShieldAlert
} from 'lucide-react';
import './styles/App.css';

export function App() {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({ total: 0, open: 0, inProgress: 0, resolved: 0, byCategory: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState('');
  const [serverStatus, setServerStatus] = useState({ status: 'checking', storageMode: 'file-storage' });

  // Filters & Layout State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modal & Toast
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [updatingTicketId, setUpdatingTicketId] = useState(null);

  const showToast = (type, title, message) => {
    setToast({ type, title, message, id: Date.now() });
  };

  const formatCurrentTime = () => {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // Check health and fetch data
  const loadData = useCallback(async (isInitial = false, isManual = false) => {
    if (isInitial) setLoading(true);
    else setIsRefreshing(true);
    setError(null);

    try {
      // 1. Health check
      const health = await checkHealth();
      setServerStatus(health);

      // 2. Fetch tickets with active filters
      const [ticketsResponse, statsResponse] = await Promise.all([
        getTickets({
          q: searchQuery,
          category: selectedCategory,
          status: selectedStatus,
          priority: selectedPriority,
          sortBy,
        }),
        getStats(),
      ]);

      if (ticketsResponse && ticketsResponse.data) {
        setTickets(ticketsResponse.data);
      }
      if (statsResponse && statsResponse.stats) {
        setStats(statsResponse.stats);
      }

      const syncTime = formatCurrentTime();
      setLastSyncedAt(syncTime);

      if (isManual) {
        showToast(
          'success',
          'Server Synchronized',
          `Loaded ${ticketsResponse?.data?.length || 0} tickets at ${syncTime}.`
        );
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message || 'Failed to connect to backend server');
      setServerStatus({ status: 'offline' });
      if (isManual) {
        showToast('error', 'Sync Failed', err.message || 'Could not reach backend server.');
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [searchQuery, selectedCategory, selectedStatus, selectedPriority, sortBy]);

  // Initial load + background polling every 12s
  useEffect(() => {
    loadData(true, false);

    const timer = setInterval(() => {
      loadData(false, false);
    }, 12000);

    return () => clearInterval(timer);
  }, [loadData]);

  // Handle manual sync button click
  const handleManualSync = () => {
    loadData(false, true);
  };

  // Handle status update
  const handleStatusChange = async (ticketId, newStatus, customNote) => {
    setUpdatingTicketId(ticketId);
    
    // Find current ticket to revert if needed
    const oldTicket = tickets.find((t) => t.ticketId === ticketId);
    const oldStatus = oldTicket?.status;

    // Optimistic UI update
    setTickets((prev) =>
      prev.map((t) => (t.ticketId === ticketId ? { ...t, status: newStatus } : t))
    );

    try {
      const response = await updateTicketStatus(
        ticketId, 
        newStatus, 
        customNote || `Status changed to ${newStatus} via Operations Dashboard`
      );

      // Refresh stats in background
      const newStats = await getStats().catch(() => null);
      if (newStats?.stats) setStats(newStats.stats);
      setLastSyncedAt(formatCurrentTime());

      showToast(
        'success',
        'Status Updated',
        `Ticket ${ticketId} is now marked as ${newStatus}.`
      );
    } catch (err) {
      console.error('Failed to update status:', err);
      // Revert optimistic update
      if (oldStatus) {
        setTickets((prev) =>
          prev.map((t) => (t.ticketId === ticketId ? { ...t, status: oldStatus } : t))
        );
      }
      showToast('error', 'Update Failed', err.message || 'Could not update status.');
    } finally {
      setUpdatingTicketId(null);
    }
  };

  // Handle new ticket submission
  const handleCreateTicket = async (ticketData) => {
    const res = await createTicket(ticketData);
    if (res?.data) {
      // Prepend newly created ticket
      setTickets((prev) => [res.data, ...prev]);
      
      // Update stats
      const newStats = await getStats().catch(() => null);
      if (newStats?.stats) setStats(newStats.stats);
      setLastSyncedAt(formatCurrentTime());

      showToast(
        'success',
        'Incident Logged',
        `Ticket ${res.data.ticketId} recorded: "${res.data.title}"`
      );
    }
  };

  // Handle delete ticket
  const handleDeleteTicket = async (ticketId) => {
    try {
      await deleteTicket(ticketId);
      setTickets((prev) => prev.filter((t) => t.ticketId !== ticketId));
      
      // Update stats
      const newStats = await getStats().catch(() => null);
      if (newStats?.stats) setStats(newStats.stats);
      setLastSyncedAt(formatCurrentTime());

      showToast('info', 'Ticket Removed', `Ticket ${ticketId} has been deleted.`);
    } catch (err) {
      showToast('error', 'Deletion Error', err.message || 'Could not delete ticket.');
    }
  };

  // Quick filter helpers from hero
  const handleQuickFilter = (category, priority = 'All') => {
    setSelectedCategory(category);
    setSelectedPriority(priority);
    setSelectedStatus('All');
  };

  // Handle stat card click
  const handleStatusFilterFromCard = (statusKey) => {
    setSelectedStatus((prev) => (prev === statusKey ? 'All' : statusKey));
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedStatus('All');
    setSelectedPriority('All');
    setSortBy('newest');
  };

  return (
    <div className="app-layout">
      {/* Navbar */}
      <Navbar
        serverStatus={serverStatus}
        onOpenNewModal={() => setIsModalOpen(true)}
        onRefresh={handleManualSync}
        isRefreshing={isRefreshing}
        lastSyncedAt={lastSyncedAt}
        ticketCount={tickets.length}
      />

      {/* Main Container */}
      <main className="main-content">
        <div className="content-container">
          {/* Header Showcase Banner with Ambient Radial Glow */}
          <section className="dashboard-hero">
            <div className="hero-content-wrapper">
              <div className="hero-text-block">
                <div className="hero-badge-group">
                  <span className="hero-badge">Campus Operations Portal</span>
                  <span className="hero-live-pill">
                    <span className="live-pulsing-dot"></span>
                    Live Dispatch
                  </span>
                </div>

                <h2 className="hero-heading">Campus Helpdesk Operations Hub</h2>
                <p className="hero-subtext">
                  Centralized command center resolving campus incidents across Wi-Fi networks, classroom multimedia, ID card access, and laboratory equipment.
                </p>

                {/* Live SLA & Operations Metrics */}
                <div className="hero-meta-strip">
                  <div className="meta-strip-item">
                    <Clock size={14} className="meta-strip-icon" />
                    <span>Avg Triage: <strong>&lt; 15 mins</strong></span>
                  </div>
                  <div className="meta-strip-item">
                    <Zap size={14} className="meta-strip-icon text-amber" />
                    <span>Active Zones: <strong>6 Campus Wings</strong></span>
                  </div>
                  <div className="meta-strip-item">
                    <ShieldAlert size={14} className="meta-strip-icon text-blue" />
                    <span>Resolution SLA: <strong>98.4% On-Time</strong></span>
                  </div>
                </div>

                {/* Quick Action Shortcuts */}
                <div className="hero-quick-filters">
                  <span className="quick-filters-label">Quick Triage:</span>
                  <button 
                    type="button" 
                    className={`quick-filter-btn ${selectedPriority === 'Urgent' ? 'is-active' : ''}`}
                    onClick={() => handleQuickFilter('All', 'Urgent')}
                  >
                    <Flame size={13} className="quick-btn-icon text-rose" />
                    <span>Urgent Incidents</span>
                  </button>
                  <button 
                    type="button" 
                    className={`quick-filter-btn ${selectedCategory === 'Wi-Fi & Network' ? 'is-active' : ''}`}
                    onClick={() => handleQuickFilter('Wi-Fi & Network')}
                  >
                    <Wifi size={13} className="quick-btn-icon text-blue" />
                    <span>Wi-Fi Disruptions</span>
                  </button>
                  <button 
                    type="button" 
                    className={`quick-filter-btn ${selectedCategory === 'Classroom Equipment' ? 'is-active' : ''}`}
                    onClick={() => handleQuickFilter('Classroom Equipment')}
                  >
                    <Tv size={13} className="quick-btn-icon text-amber" />
                    <span>Classroom AV</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Statistics Overview Cards */}
          <StatsOverview
            stats={stats}
            activeStatusFilter={selectedStatus}
            onStatusFilterChange={handleStatusFilterFromCard}
          />

          {/* Search, Filter, Sort & View Controls */}
          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            selectedPriority={selectedPriority}
            onPriorityChange={setSelectedPriority}
            sortBy={sortBy}
            onSortChange={setSortBy}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onResetFilters={handleResetFilters}
            totalResults={tickets.length}
          />

          {/* Requests Content Area */}
          <section className="tickets-display-area" aria-label="Campus incident listings">
            {loading ? (
              <EmptyState type="loading" />
            ) : error ? (
              <EmptyState 
                type="error" 
                errorMessage={error} 
                onRetry={() => loadData(true, true)} 
              />
            ) : tickets.length === 0 ? (
              <EmptyState
                type={searchQuery || selectedCategory !== 'All' || selectedStatus !== 'All' || selectedPriority !== 'All' ? 'no-results' : 'all-clear'}
                onResetFilters={handleResetFilters}
                onOpenNewModal={() => setIsModalOpen(true)}
              />
            ) : viewMode === 'grid' ? (
              <div className="tickets-grid">
                {tickets.map((ticket) => (
                  <RequestCard
                    key={ticket.ticketId}
                    ticket={ticket}
                    onStatusChange={handleStatusChange}
                    onDeleteTicket={handleDeleteTicket}
                    isUpdating={updatingTicketId === ticket.ticketId}
                  />
                ))}
              </div>
            ) : (
              <RequestTable
                tickets={tickets}
                onStatusChange={handleStatusChange}
                onDeleteTicket={handleDeleteTicket}
                updatingTicketId={updatingTicketId}
              />
            )}
          </section>
        </div>
      </main>

      {/* Floating Action Button (Mobile only) */}
      <button
        type="button"
        className="btn-fab-mobile"
        onClick={() => setIsModalOpen(true)}
        aria-label="Submit new incident report"
        title="New Support Request"
      >
        <Plus size={22} strokeWidth={2.6} />
      </button>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-container">
          <p>© 2026 University IT & Infrastructure Support. Built for Vibe Coding Workshop Final Showcase.</p>
          <div className="footer-links">
            <span className="footer-pill">Node.js + Express API</span>
            <span className="footer-pill">React + Vite</span>
            <span className="footer-pill">Persistent JSON/MongoDB</span>
          </div>
        </div>
      </footer>

      {/* New Request Modal */}
      <RequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmitSuccess={handleCreateTicket}
      />

      {/* Toast Notification */}
      <ToastNotification
        toast={toast}
        onClose={() => setToast(null)}
      />
    </div>
  );
}

export default App;
