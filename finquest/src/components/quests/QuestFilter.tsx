import { QuestStatus, QuestPriority, FinancialCategory } from '@/enums/finquestEnums';

interface QuestFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: QuestStatus | 'all';
  onStatusChange: (value: QuestStatus | 'all') => void;
  priorityFilter: QuestPriority | 'all';
  onPriorityChange: (value: QuestPriority | 'all') => void;
  categoryFilter: FinancialCategory | 'all';
  onCategoryChange: (value: FinancialCategory | 'all') => void;
  sortBy: 'dueDate' | 'priority' | 'progress';
  onSortChange: (value: 'dueDate' | 'priority' | 'progress') => void;
}

export function QuestFilter({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  categoryFilter,
  onCategoryChange,
  sortBy,
  onSortChange,
}: QuestFilterProps) {
  return (
    <div className="quest-filters">
      <div className="filter-group">
        <input
          type="text"
          placeholder="Search quests..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="filter-input"
        />
      </div>

      <div className="filter-group">
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value as QuestStatus | 'all')}
          className="filter-select"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <div className="filter-group">
        <select
          value={priorityFilter}
          onChange={(e) => onPriorityChange(e.target.value as QuestPriority | 'all')}
          className="filter-select"
        >
          <option value="all">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <div className="filter-group">
        <select
          value={categoryFilter}
          onChange={(e) => onCategoryChange(e.target.value as FinancialCategory | 'all')}
          className="filter-select"
        >
          <option value="all">All Categories</option>
          <option value="savings">Savings</option>
          <option value="investing">Investing</option>
          <option value="debt-payoff">Debt Payoff</option>
          <option value="budgeting">Budgeting</option>
          <option value="learning">Learning</option>
        </select>
      </div>

      <div className="filter-group">
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as 'dueDate' | 'priority' | 'progress')}
          className="filter-select"
        >
          <option value="dueDate">Sort by Due Date</option>
          <option value="priority">Sort by Priority</option>
          <option value="progress">Sort by Progress</option>
        </select>
      </div>
    </div>
  );
}
