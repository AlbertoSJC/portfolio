import { QuestStatus, QuestPriority, FinancialCategory } from '@/enums/finquestEnums';

/**
 * Represents a single financial quest/goal
 */
export class Quest {
  id: string;
  title: string;
  description: string;
  category: FinancialCategory;
  status: QuestStatus;
  priority: QuestPriority;
  targetAmount: number;
  currentAmount: number;
  dueDate: Date;
  createdAt: Date;
  completedAt?: Date;
  rewards: {
    experience: number;
    coins: number;
  };

  constructor(data: {
    id: string;
    title: string;
    description: string;
    category: FinancialCategory;
    targetAmount: number;
    dueDate: Date;
    priority?: QuestPriority;
    rewards?: { experience: number; coins: number };
  }) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.category = data.category;
    this.status = QuestStatus.Active;
    this.priority = data.priority || QuestPriority.Medium;
    this.targetAmount = data.targetAmount;
    this.currentAmount = 0;
    this.dueDate = data.dueDate;
    this.createdAt = new Date();
    this.rewards = data.rewards || { experience: 100, coins: 50 };
  }

  /**
   * Get quest progress as a percentage
   */
  getProgressPercentage(): number {
    return Math.round((this.currentAmount / this.targetAmount) * 100);
  }

  /**
   * Check if quest is overdue
   */
  isOverdue(): boolean {
    return this.status === QuestStatus.Active && new Date() > this.dueDate;
  }

  /**
   * Update current progress
   */
  updateProgress(amount: number): void {
    this.currentAmount = Math.min(amount, this.targetAmount);
    if (this.currentAmount >= this.targetAmount) {
      this.completeQuest();
    }
  }

  /**
   * Mark quest as completed
   */
  completeQuest(): void {
    this.status = QuestStatus.Completed;
    this.completedAt = new Date();
  }

  /**
   * Mark quest as failed
   */
  failQuest(): void {
    this.status = QuestStatus.Failed;
  }
}
