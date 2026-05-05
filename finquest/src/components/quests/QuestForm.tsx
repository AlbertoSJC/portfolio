import { useQuestForm } from '@/hooks/useQuestForm';
import { Quest } from '@/domain/Quest';
import { FinancialCategory, QuestPriority } from '@/enums/finquestEnums';

interface QuestFormProps {
  onSubmit: (questData: {
    title: string;
    description: string;
    category: FinancialCategory;
    targetAmount: number;
    dueDate: Date;
    priority: QuestPriority;
  }) => void;
  onCancel?: () => void;
  initialData?: Quest;
  isLoading?: boolean;
}

export function QuestForm({
  onSubmit,
  onCancel,
  initialData,
  isLoading = false,
}: QuestFormProps) {
  const { formData, errors, handleChange, validateForm, resetForm } =
    useQuestForm(initialData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit({
      ...formData,
      dueDate: new Date(formData.dueDate),
    });

    resetForm();
  };

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <form className="quest-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="title">Quest Title</label>
        <input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="e.g., Save for Emergency Fund"
          className={`form-input ${errors.title ? 'input-error' : ''}`}
          disabled={isLoading}
        />
        {errors.title && <span className="error-message">{errors.title}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="What's this quest about?"
          className={`form-textarea ${errors.description ? 'input-error' : ''}`}
          rows={3}
          disabled={isLoading}
        />
        {errors.description && (
          <span className="error-message">{errors.description}</span>
        )}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => handleChange('category', e.target.value)}
            className="form-select"
            disabled={isLoading}
          >
            <option value="savings">Savings</option>
            <option value="investing">Investing</option>
            <option value="debt-payoff">Debt Payoff</option>
            <option value="budgeting">Budgeting</option>
            <option value="learning">Learning</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="priority">Priority</label>
          <select
            id="priority"
            value={formData.priority}
            onChange={(e) => handleChange('priority', e.target.value)}
            className="form-select"
            disabled={isLoading}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="targetAmount">Target Amount ($)</label>
          <input
            id="targetAmount"
            type="number"
            value={formData.targetAmount || ''}
            onChange={(e) => handleChange('targetAmount', parseFloat(e.target.value) || 0)}
            placeholder="1000"
            className={`form-input ${errors.targetAmount ? 'input-error' : ''}`}
            min="0"
            step="10"
            disabled={isLoading}
          />
          {errors.targetAmount && (
            <span className="error-message">{errors.targetAmount}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="dueDate">Due Date</label>
          <input
            id="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={(e) => handleChange('dueDate', e.target.value)}
            min={minDate}
            className={`form-input ${errors.dueDate ? 'input-error' : ''}`}
            disabled={isLoading}
          />
          {errors.dueDate && (
            <span className="error-message">{errors.dueDate}</span>
          )}
        </div>
      </div>

      <div className="form-actions">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading}
        >
          {isLoading ? 'Creating...' : 'Create Quest'}
        </button>
        {onCancel && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
