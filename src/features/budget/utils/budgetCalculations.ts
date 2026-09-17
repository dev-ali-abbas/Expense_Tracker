export interface BudgetStatus {
  hasBudget: boolean;
  budgetPaise: number;
  spentPaise: number;
  remainingPaise: number;
  overBudgetPaise: number;
  percentage: number;
  isOverBudget: boolean;
  isNearBudget: boolean; // >= 80% of budget spent
}

/**
 * Computes budget status according to PRD Section 27.
 * Example:
 *  Budget = 50,000, Spent = 42,850 -> Remaining = 7,150 (Near budget)
 *  Budget = 50,000, Spent = 52,400 -> Over budget = 2,400
 */
export function calculateBudgetStatus(
  spentPaise: number,
  budgetPaise: number | null
): BudgetStatus {
  if (!budgetPaise || budgetPaise <= 0) {
    return {
      hasBudget: false,
      budgetPaise: 0,
      spentPaise,
      remainingPaise: 0,
      overBudgetPaise: 0,
      percentage: 0,
      isOverBudget: false,
      isNearBudget: false,
    };
  }

  const percentage = Math.round((spentPaise / budgetPaise) * 100);
  const isOverBudget = spentPaise > budgetPaise;
  const isNearBudget = !isOverBudget && percentage >= 80;

  const remainingPaise = isOverBudget ? 0 : budgetPaise - spentPaise;
  const overBudgetPaise = isOverBudget ? spentPaise - budgetPaise : 0;

  return {
    hasBudget: true,
    budgetPaise,
    spentPaise,
    remainingPaise,
    overBudgetPaise,
    percentage,
    isOverBudget,
    isNearBudget,
  };
}
