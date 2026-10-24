import React from 'react';
import { 
  Search, 
  X, 
  Filter, 
  LayoutGrid, 
  Table as TableIcon,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown
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

export const FilterBar = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  onResetFilters,
  totalResults,
}) => {
  const hasActiveFilters = 
    searchQuery.trim() !== '' || 
    selectedCategory !== 'All' || 
    selectedStatus !== 'All' ||
    sortBy !== 'newest';

  return (
    <div className="filter-bar-root">
      <div className="filter-bar-main">
        {/* Search Input */}
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by ticket ID, issue title, location, or name..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            id="input-ticket-search"
            aria-label="Search campus support tickets"
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => onSearchChange('')}
              title="Clear search"
              aria-label="Clear search text"
            >
              <X size={15} />
            </button>
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
            Reset Filters
          </button>
        )}
      </div>
    </div>
  );
};
