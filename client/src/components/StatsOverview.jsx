import React from 'react';
import { 
  ClipboardList, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  ArrowUpRight,
  TrendingUp,
  Percent
} from 'lucide-react';

export const StatsOverview = ({ stats, activeStatusFilter, onStatusFilterChange }) => {
  const { total = 0, open = 0, inProgress = 0, resolved = 0 } = stats || {};

  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
  const inProgressRate = total > 0 ? Math.round((inProgress / total) * 100) : 0;
  const openRate = total > 0 ? Math.round((open / total) * 100) : 0;

  const statCards = [
    {
      id: 'All',
      title: 'Total Requests',
      value: total,
      subtext: 'Across all campus zones',
      icon: ClipboardList,
      cardClass: 'stat-total',
      rate: null,
    },
    {
      id: 'Open',
      title: 'Open / Unassigned',
      value: open,
      subtext: open === 1 ? '1 needs attention' : `${open} need attention`,
      icon: AlertCircle,
      cardClass: 'stat-open',
      rate: openRate,
      rateColor: '#F59E0B',
    },
    {
      id: 'In Progress',
      title: 'In Progress',
      value: inProgress,
      subtext: inProgress === 1 ? '1 active ticket' : `${inProgress} active tickets`,
      icon: Clock,
      cardClass: 'stat-progress',
      rate: inProgressRate,
      rateColor: '#3B82F6',
    },
    {
      id: 'Resolved',
      title: 'Resolved',
      value: resolved,
      subtext: `${resolutionRate}% resolved`,
      icon: CheckCircle2,
      cardClass: 'stat-resolved',
      rate: resolutionRate,
      rateColor: '#10B981',
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
                  <Icon size={19} />
                </div>
              </div>

              <div className="stat-body">
                <span className="stat-value">{card.value}</span>
                {card.rate !== null && (
                  <span className="stat-rate-pill" style={{ borderColor: `${card.rateColor}40`, color: card.rateColor }}>
                    {card.rate}%
                  </span>
                )}
              </div>

              {/* Miniature Progress Indicator bar for metrics */}
              {card.rate !== null && (
                <div className="stat-progress-bar-wrap" aria-hidden="true">
                  <div 
                    className="stat-progress-bar-fill" 
                    style={{ width: `${card.rate}%`, backgroundColor: card.rateColor }}
                  />
                </div>
              )}

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
