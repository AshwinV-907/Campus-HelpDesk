import React from 'react';
import { 
  ShieldCheck, 
  Plus, 
  RotateCw, 
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const Navbar = ({ 
  serverStatus, 
  onOpenNewModal, 
  onRefresh, 
  isRefreshing,
  lastSyncedAt,
  ticketCount 
}) => {
  return (
    <header className="navbar-root">
      <div className="navbar-container">
        {/* Left: Branding */}
        <div className="navbar-brand">
          <div className="brand-icon-wrapper">
            <ShieldCheck className="brand-icon" size={26} />
          </div>
          <div className="brand-text">
            <div className="brand-title-row">
              <h1 className="brand-title">CAMPUS HELPDESK</h1>
              <span className="brand-badge">OPS CENTER</span>
            </div>
            <p className="brand-subtitle">
              IT, Classroom Equipment & Facility Resolution Hub
            </p>
          </div>
        </div>

        {/* Right: Actions & Server Indicator */}
        <div className="navbar-actions">
          {/* Live System Indicator */}
          <div 
            className={`server-status-pill ${serverStatus.status === 'online' ? 'online' : 'offline'}`}
            title={serverStatus.status === 'online' ? `API: Online | Storage: ${serverStatus.storageMode?.toUpperCase() || 'PERSISTENT'}` : 'Server connection lost. Retrying...'}
          >
            <span className="status-dot"></span>
            <span className="status-label">
              {serverStatus.status === 'online' ? (
                <>
                  <span className="status-text-main">Connected</span>
                  <span className="status-text-sub">({serverStatus.storageMode || 'live'})</span>
                </>
              ) : (
                'Connecting...'
              )}
            </span>
          </div>

          {/* Sync Button with last synced time */}
          <button 
            type="button"
            className="btn-secondary btn-icon"
            onClick={onRefresh}
            disabled={isRefreshing}
            title={lastSyncedAt ? `Last synced: ${lastSyncedAt}. Click to refresh.` : 'Sync data with server'}
            aria-label="Synchronize data with server"
            id="btn-sync-server"
          >
            <RotateCw size={16} className={isRefreshing ? 'spin-icon' : ''} />
            <span className="btn-text-desktop">
              {isRefreshing ? 'Syncing...' : lastSyncedAt ? `Synced ${lastSyncedAt}` : 'Sync'}
            </span>
          </button>

          {/* New Request Button */}
          <button 
            type="button"
            className="btn-primary"
            onClick={onOpenNewModal}
            id="btn-new-request"
          >
            <Plus size={18} strokeWidth={2.4} />
            <span>New Request</span>
          </button>
        </div>
      </div>
    </header>
  );
};
