import React from 'react';
import { 
  Wifi, 
  Tv, 
  CreditCard, 
  Cpu, 
  Building2, 
  HelpCircle,
  MapPin, 
  Trash2, 
  Calendar,
  ChevronDown
} from 'lucide-react';

const CATEGORY_ICONS = {
  'Wi-Fi & Network': Wifi,
  'Classroom Equipment': Tv,
  'ID Card & Access': CreditCard,
  'Lab Software & PC': Cpu,
  'Hostel & Facility': Building2,
  'Other': HelpCircle,
};

export const RequestTable = ({ 
  tickets, 
  onStatusChange, 
  onDeleteTicket,
  updatingTicketId 
}) => {
  const formatDate = (dateString) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="table-responsive-wrapper">
      <table className="tickets-table" id="tickets-data-table">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Category</th>
            <th scope="col">Issue Details</th>
            <th scope="col">Location</th>
            <th scope="col">Reported By</th>
            <th scope="col">Priority</th>
            <th scope="col">Status</th>
            <th scope="col">Submitted</th>
            <th scope="col" className="text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((t) => {
            const CategoryIcon = CATEGORY_ICONS[t.category] || HelpCircle;
            const isUpdating = updatingTicketId === t.ticketId;

            return (
              <tr key={t.ticketId} className={`table-row status-row-${t.status.toLowerCase().replace(/\s+/g, '-')}`}>
                <td className="cell-id">
                  <span className="table-id-tag">{t.ticketId}</span>
                </td>
                <td className="cell-category">
                  <div className="table-category-pill">
                    <CategoryIcon size={14} />
                    <span>{t.category}</span>
                  </div>
                </td>
                <td className="cell-details">
                  <div className="table-title-main">{t.title}</div>
                  <div className="table-desc-sub">{t.description.substring(0, 85)}{t.description.length > 85 ? '...' : ''}</div>
                </td>
                <td className="cell-location">
                  <div className="table-location">
                    <MapPin size={13} className="loc-icon" />
                    <span>{t.location}</span>
                  </div>
                </td>
                <td className="cell-contact">
                  <div className="table-contact-name">{t.contactName}</div>
                  {t.contactEmail && <div className="table-contact-sub">{t.contactEmail}</div>}
                </td>
                <td className="cell-priority">
                  <span className={`priority-badge priority-${(t.priority || 'medium').toLowerCase()}`}>
                    {t.priority || 'Medium'}
                  </span>
                </td>
                <td className="cell-status">
                  <div className="table-status-select-wrap">
                    <select
                      className={`table-status-select status-select-${t.status.toLowerCase().replace(/\s+/g, '-')}`}
                      value={t.status}
                      onChange={(e) => onStatusChange(t.ticketId, e.target.value)}
                      disabled={isUpdating}
                      aria-label={`Change status for ticket ${t.ticketId}`}
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                    <ChevronDown size={12} className="select-arrow" />
                  </div>
                </td>
                <td className="cell-date">
                  <span className="table-date">{formatDate(t.createdAt)}</span>
                </td>
                <td className="cell-action text-right">
                  <button
                    type="button"
                    className="table-delete-btn"
                    onClick={() => {
                      if (window.confirm(`Delete ticket ${t.ticketId}?`)) {
                        onDeleteTicket(t.ticketId);
                      }
                    }}
                    title="Delete ticket"
                    aria-label={`Delete ticket ${t.ticketId}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
