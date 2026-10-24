import React, { useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  LayoutGrid, 
  Table as TableIcon,
  RotateCcw,
  ChevronDown,
  Flame,
  Filter
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Wi-Fi & Network',
  'Classroom Equipment',
  'ID Card & Access',
  'Lab Software & PC',
  'Hostel & Facility',
  'Other',
];

const STATUSES = ['All', 'Open', 'In Progress', 'Resolved'];
const PRIORITIES = ['All', 'Urgent', 'High', 'Medium', 'Low'];

export const FilterBar = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  selectedPriority,
  onPriorityChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  onResetFilters,
  totalResults,
}) => {
  const searchInputRef = useRef(null);

  // Keyboard shortcut '/' to quickly focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const hasActiveFilters = 
    searchQuery.trim() !== '' || 
    selectedCategory !== 'All' || 
    selectedStatus !== 'All' ||
    (selectedPriority && selectedPriority !== 'All') ||
    sortBy !== 'newest';

  return (
    <div className="filter-bar-root">
      <div className="filter-bar-main">
        {/* Search Input with Keyboard Shortcut hint */}
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            ref={searchInputRef}
            type="text"
            className="search-input"
            placeholder="Search by ticket ID, issue title, location, or name (Press '/' to search)..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            id="input-ticket-search"
            aria-label="Search campus support tickets"
          />
          {searchQuery ? (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => onSearchChange('')}
              title="Clear search"
              aria-label="Clear search text"
            >
              <X size={15} />
            </button>
          ) : (
            <kbd className="search-kbd-hint" title="Press / to search">/</kbd>
          )}
        </div>

        {/* Filters Group */}
        <div className="filter-controls-group">
          {/* Category Dropdown */}
          <div className="select-wrapper">
            <label htmlFor="filter-category" className="visually-hidden">Filter by Category</label>
            <select
              id="filter-category"
              className="filter-select"
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
            >
              <option value="All">All Categories</option>
              {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="select-arrow" />
          </div>

          {/* Status Dropdown */}
          <div className="select-wrapper">
            <label htmlFor="filter-status" className="visually-hidden">Filter by Status</label>
            <select
              id="filter-status"
              className="filter-select"
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
            >
              <option value="All">All Statuses</option>
              {STATUSES.filter((s) => s !== 'All').map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="select-arrow" />
          </div>

          {/* Priority Dropdown */}
          <div className="select-wrapper">
            <label htmlFor="filter-priority" className="visually-hidden">Filter by Urgency</label>
            <select
              id="filter-priority"
              className="filter-select"
              value={selectedPriority || 'All'}
              onChange={(e) => onPriorityChange(e.target.value)}
            >
              <option value="All">All Urgencies</option>
              {PRIORITIES.filter((p) => p !== 'All').map((pr) => (
                <option key={pr} value={pr}>
                  {pr} Priority
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="select-arrow" />
          </div>

          {/* Sort Dropdown */}
          <div className="select-wrapper">
            <label htmlFor="filter-sort" className="visually-hidden">Sort by</label>
            <select
              id="filter-sort"
              className="filter-select"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
            <ChevronDown size={14} className="select-arrow" />
          </div>

          {/* View Mode Toggle: Grid vs Table */}
          <div className="view-mode-toggle" role="group" aria-label="Layout view mode">
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => onViewModeChange('grid')}
              title="Card Grid View"
              aria-pressed={viewMode === 'grid'}
              id="view-grid-btn"
            >
              <LayoutGrid size={16} />
              <span className="view-mode-label">Grid</span>
            </button>
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => onViewModeChange('table')}
              title="Compact Table View"
              aria-pressed={viewMode === 'table'}
              id="view-table-btn"
            >
              <TableIcon size={16} />
              <span className="view-mode-label">Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* Results Count & Reset row */}
      <div className="filter-meta-row">
        <div className="filter-count-info">
          Showing <strong>{totalResults}</strong> {totalResults === 1 ? 'request' : 'requests'}
          {selectedCategory !== 'All' && <span className="active-filter-badge">Category: {selectedCategory}</span>}
          {selectedStatus !== 'All' && <span className="active-filter-badge">Status: {selectedStatus}</span>}
          {selectedPriority && selectedPriority !== 'All' && <span className="active-filter-badge">Priority: {selectedPriority}</span>}
          {searchQuery && <span className="active-filter-badge">Query: &quot;{searchQuery}&quot;</span>}
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            className="btn-reset-filters"
            onClick={onResetFilters}
            id="btn-reset-filters"
          >
            <RotateCcw size={13} />
            Reset All Filters
          </button>
        )}
      </div>
    </div>
  );
};
