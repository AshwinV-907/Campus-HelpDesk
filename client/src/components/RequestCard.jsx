import React, { useState } from 'react';
import { 
  Wifi, 
  Tv, 
  CreditCard, 
  Cpu, 
  Building2, 
  HelpCircle,
  MapPin, 
  User, 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  History, 
  Trash2, 
  Check, 
  Clock, 
  AlertCircle,
  Loader2,
  ExternalLink
} from 'lucide-react';

const CATEGORY_ICONS = {
  'Wi-Fi & Network': Wifi,
  'Classroom Equipment': Tv,
  'ID Card & Access': CreditCard,
  'Lab Software & PC': Cpu,
  'Hostel & Facility': Building2,
  'Other': HelpCircle,
};

export const RequestCard = ({ 
  ticket, 
  onStatusChange, 
  onDeleteTicket,
  isUpdating 
}) => {
  const [showHistory, setShowHistory] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);

  const CategoryIcon = CATEGORY_ICONS[ticket.category] || HelpCircle;

  // Format date helper
  const formatDate = (dateString) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const getRelativeTime = (dateString) => {
    try {
      const now = new Date();
      const past = new Date(dateString);
      const diffMs = now - past;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      if (diffDays > 0) return `${diffDays}d ago`;
      if (diffHours > 0) return `${diffHours}h ago`;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins > 0) return `${diffMins}m ago`;
      return 'Just now';
    } catch {
      return 'Recently';
    }
  };

  const handleStatusSelect = async (newStatus) => {
    if (newStatus === ticket.status) {
      setStatusMenuOpen(false);
      return;
    }
    setStatusMenuOpen(false);
    await onStatusChange(ticket.ticketId, newStatus);
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ticket ${ticket.ticketId}?`)) {
      setIsDeleting(true);
      try {
        await onDeleteTicket(ticket.ticketId);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <article 
      className={`ticket-card status-border-${ticket.status.toLowerCase().replace(/\s+/g, '-')}`}
      id={`ticket-card-${ticket.ticketId}`}
    >
      {/* Top Meta Bar */}
      <div className="card-top-bar">
        <div className="id-and-category">
          <span className="ticket-id-tag">{ticket.ticketId}</span>
          <span className="ticket-category-badge">
            <CategoryIcon size={14} className="cat-icon" />
            <span>{ticket.category}</span>
          </span>
        </div>

        <div className="card-top-right">
          {/* Priority Badge */}
          <span className={`priority-badge priority-${(ticket.priority || 'medium').toLowerCase()}`}>
            {ticket.priority || 'Medium'}
          </span>

          {/* Delete Button */}
          <button
            type="button"
            className="card-delete-btn"
            onClick={handleDelete}
            disabled={isDeleting}
            title="Delete this ticket"
            aria-label={`Delete ticket ${ticket.ticketId}`}
          >
            {isDeleting ? <Loader2 size={14} className="spin-icon" /> : <Trash2 size={14} />}
          </button>
        </div>
      </div>

      {/* Main Title */}
      <h3 className="ticket-title">{ticket.title}</h3>

      {/* Description */}
      <p className="ticket-desc">{ticket.description}</p>

      {/* Location & Contact Meta Info */}
      <div className="ticket-details-box">
        <div className="detail-row">
          <MapPin size={15} className="detail-icon" />
          <span className="detail-location">{ticket.location}</span>
        </div>

        <div className="detail-row">
          <User size={15} className="detail-icon" />
          <span className="detail-contact">
            <strong>{ticket.contactName}</strong>
            {ticket.contactEmail && <span className="detail-email"> • {ticket.contactEmail}</span>}
            {ticket.contactPhone && <span className="detail-phone"> • {ticket.contactPhone}</span>}
          </span>
        </div>
      </div>

      {/* Card Footer: Timestamp & Interactive Status Controller */}
      <div className="card-footer">
        <div className="card-timestamp" title={formatDate(ticket.createdAt)}>
          <Calendar size={13} className="time-icon" />
          <span>{getRelativeTime(ticket.createdAt)}</span>
        </div>

        {/* Status Dropdown Pill */}
        <div className="status-dropdown-container">
          <button
            type="button"
            className={`status-pill-btn status-${ticket.status.toLowerCase().replace(/\s+/g, '-')}`}
            onClick={() => setStatusMenuOpen(!statusMenuOpen)}
            disabled={isUpdating}
            aria-haspopup="true"
            aria-expanded={statusMenuOpen}
            id={`btn-status-${ticket.ticketId}`}
          >
            {isUpdating ? (
              <Loader2 size={13} className="spin-icon" />
            ) : (
              <span className="status-dot"></span>
            )}
            <span className="status-text">{ticket.status}</span>
            <ChevronDown size={13} className={`chevron ${statusMenuOpen ? 'rotate' : ''}`} />
          </button>

          {statusMenuOpen && (
            <div className="status-popover-menu" role="menu">
              <span className="status-popover-label">Change Status:</span>
              {['Open', 'In Progress', 'Resolved'].map((st) => (
                <button
                  key={st}
                  type="button"
                  role="menuitem"
                  className={`status-option-btn status-${st.toLowerCase().replace(/\s+/g, '-')} ${
                    ticket.status === st ? 'is-active' : ''
                  }`}
                  onClick={() => handleStatusSelect(st)}
                >
                  <span className="status-dot"></span>
                  <span>{st}</span>
                  {ticket.status === st && <Check size={14} className="check-icon" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Audit History Toggle */}
      {ticket.statusHistory && ticket.statusHistory.length > 0 && (
        <div className="card-history-section">
          <button
            type="button"
            className="history-toggle-btn"
            onClick={() => setShowHistory(!showHistory)}
            aria-expanded={showHistory}
          >
            <History size={13} />
            <span>Activity Trail ({ticket.statusHistory.length})</span>
            {showHistory ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>

          {showHistory && (
            <div className="history-timeline">
              {ticket.statusHistory.map((item, idx) => (
                <div key={idx} className="timeline-item">
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <span className={`timeline-status status-text-${item.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {item.status}
                      </span>
                      <span className="timeline-date">{formatDate(item.timestamp)}</span>
                    </div>
                    {item.note && <p className="timeline-note">{item.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  );
};
