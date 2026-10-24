import React from 'react';
import { 
  SearchX, 
  CheckCircle, 
  AlertTriangle, 
  RotateCcw, 
  Plus, 
  Loader2 
} from 'lucide-react';

export const EmptyState = ({ 
  type = 'no-results', 
  onResetFilters, 
  onOpenNewModal, 
  onRetry,
  errorMessage 
}) => {
  if (type === 'loading') {
    return (
      <div className="empty-state-card" role="status">
        <div className="empty-state-icon-wrap is-spinning">
          <Loader2 size={36} className="spin-icon" />
        </div>
        <h3 className="empty-state-title">Synchronizing Campus Tickets...</h3>
        <p className="empty-state-desc">Fetching latest incident data from university helpdesk database.</p>
      </div>
    );
  }

  if (type === 'error') {
    return (
      <div className="empty-state-card is-error" role="alert">
        <div className="empty-state-icon-wrap error-icon">
          <AlertTriangle size={36} />
        </div>
        <h3 className="empty-state-title">Connection Disrupted</h3>
        <p className="empty-state-desc">{errorMessage || 'Could not communicate with the backend API service.'}</p>
        {onRetry && (
          <button type="button" className="btn-primary" onClick={onRetry}>
            <RotateCcw size={16} />
            <span>Retry Server Sync</span>
          </button>
        )}
      </div>
    );
  }

  if (type === 'no-results') {
    return (
      <div className="empty-state-card">
        <div className="empty-state-icon-wrap">
          <SearchX size={36} />
        </div>
        <h3 className="empty-state-title">No Incident Reports Match Your Filters</h3>
        <p className="empty-state-desc">
          Try adjusting your search query, selecting different categories, or resetting active filters.
        </p>
        <div className="empty-state-actions">
          {onResetFilters && (
            <button type="button" className="btn-secondary" onClick={onResetFilters}>
              <RotateCcw size={15} />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // All clear / zero tickets
  return (
    <div className="empty-state-card is-all-clear">
      <div className="empty-state-icon-wrap success-icon">
        <CheckCircle size={36} />
      </div>
      <h3 className="empty-state-title">No Open Campus Incidents</h3>
      <p className="empty-state-desc">
        All Wi-Fi routers, classrooms, and facilities are currently operating normally without pending issues.
      </p>
      {onOpenNewModal && (
        <button type="button" className="btn-primary" onClick={onOpenNewModal}>
          <Plus size={16} />
          <span>Report an Issue</span>
        </button>
      )}
    </div>
  );
};
