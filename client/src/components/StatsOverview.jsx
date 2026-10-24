import React from 'react';
import { 
  ClipboardList, 
  AlertCircle, 
  Clock, 
  CheckCircle2,
  TrendingUp,
  ArrowUpRight
} from 'lucide-react';

export const StatsOverview = ({ stats, activeStatusFilter, onStatusFilterChange }) => {
  const { total = 0, open = 0, inProgress = 0, resolved = 0 } = stats || {};

  const statCards = [
    {
      id: 'All',
      title: 'Total Requests',
      value: total,
      subtext: 'Across all campus zones',
      icon: ClipboardList,
      cardClass: 'stat-total',
      colorVar: 'var(--navy-700)',
    },
    {
      id: 'Open',
      title: 'Open / Unassigned',
      value: open,
      subtext: open === 1 ? '1 pending review' : `${open} pending review`,
      icon: AlertCircle,
      cardClass: 'stat-open',
      colorVar: 'var(--status-open-text)',
    },
    {
      id: 'In Progress',
      title: 'In Progress',
      value: inProgress,
      subtext: inProgress === 1 ? '1 being serviced' : `${inProgress} being serviced`,
      icon: Clock,
      cardClass: 'stat-progress',
      colorVar: 'var(--status-progress-text)',
    },
    {
      id: 'Resolved',
      title: 'Resolved',
      value: resolved,
      subtext: total > 0 ? `${Math.round((resolved / total) * 100)}% resolution rate` : '0% resolved',
      icon: CheckCircle2,
      cardClass: 'stat-resolved',
      colorVar: 'var(--status-resolved-text)',
    },
  ];

  return (
    <section className="stats-section" aria-label="Incident Summary Statistics">
      <div className="stats-grid">
        {statCards.map((card) => {
          const Icon = card.icon;
          const isSelected = activeStatusFilter === card.id || (card.id === 'All' && activeStatusFilter === 'All');

          return (
            <button
              key={card.id}
              type="button"
              className={`stat-card ${card.cardClass} ${isSelected ? 'is-selected' : ''}`}
              onClick={() => onStatusFilterChange(card.id)}
              aria-pressed={isSelected}
              id={`stat-card-${card.id.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className="stat-header">
                <span className="stat-title">{card.title}</span>
                <div className="stat-icon-badge">
                  <Icon size={20} />
                </div>
              </div>
              <div className="stat-body">
                <span className="stat-value">{card.value}</span>
              </div>
              <div className="stat-footer">
                <span className="stat-subtext">{card.subtext}</span>
                <span className="stat-action-indicator">
                  Filter <ArrowUpRight size={13} />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
