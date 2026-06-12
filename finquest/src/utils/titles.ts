import { Player } from '@/domain/Player';
import { FinancialCategory, QuestStatus } from '@/enums/finquestEnums';

interface TitleRule {
  title: string;
  minLevel: number;
  category?: FinancialCategory;
  minCategoryCompletions?: number;
}

const TITLE_RULES: TitleRule[] = [
  { title: 'Financial Legend', minLevel: 12 },
  { title: 'Wealth Architect', minLevel: 10 },
  { title: 'Debt Slayer', minLevel: 7, category: FinancialCategory.DebtPayoff, minCategoryCompletions: 2 },
  { title: 'Market Scout', minLevel: 5, category: FinancialCategory.Investing, minCategoryCompletions: 2 },
  { title: 'Budget Tactician', minLevel: 4, category: FinancialCategory.Budgeting, minCategoryCompletions: 2 },
  { title: 'Frugal Apprentice', minLevel: 3, category: FinancialCategory.Savings, minCategoryCompletions: 1 },
  { title: 'Money Scholar', minLevel: 3, category: FinancialCategory.Learning, minCategoryCompletions: 2 },
  { title: 'Seasoned Adventurer', minLevel: 3 },
  { title: 'Adventurer', minLevel: 1 },
];

export function getPlayerTitle(player: Player): string {
  const completedByCategory = (category: FinancialCategory) =>
    player.quests.filter((q) => q.status === QuestStatus.Completed && q.category === category).length;

  const matched = TITLE_RULES.find((rule) => {
    if (player.level < rule.minLevel) return false;
    if (rule.category && completedByCategory(rule.category) < (rule.minCategoryCompletions ?? 1)) return false;
    return true;
  });

  return matched?.title ?? 'Adventurer';
}
