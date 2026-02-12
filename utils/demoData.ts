
import { FinancialEntry, EntryType, AssetCategory, LiabilityCategory, BudgetEntry, IncomeEntry } from '../types';
import { generateMockHistory } from './calculations';

export const getDemoData = () => {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const year = 365 * day;

  const entries: FinancialEntry[] = [
    {
      id: 'demo-asset-1',
      type: EntryType.ASSET,
      category: AssetCategory.REAL_ESTATE,
      name: 'Downtown Apartment',
      value: 550000,
      originalValue: 420000,
      purchaseDate: now - (4 * year),
      updatedAt: now,
      isDepreciating: false
    },
    {
      id: 'demo-asset-2',
      type: EntryType.ASSET,
      category: AssetCategory.VEHICLES,
      name: 'Tesla Model Y',
      value: 38500,
      originalValue: 58000,
      purchaseDate: now - (2 * year),
      updatedAt: now,
      isDepreciating: true,
      depreciationRate: 15,
      depreciationMethod: 'DECLINING_BALANCE'
    },
    {
      id: 'demo-asset-3',
      type: EntryType.ASSET,
      category: AssetCategory.INVESTMENTS,
      name: 'S&P 500 ETF',
      value: 125000,
      updatedAt: now,
      performance: {
        return1Y: 12.4,
        return5Y: 68.2,
        returnMax: 145.5,
        history1Y: generateMockHistory(125000, 12.4, 12),
        history5Y: generateMockHistory(125000, 68.2, 24),
        historyMax: generateMockHistory(125000, 145.5, 36)
      }
    },
    {
      id: 'demo-asset-4',
      type: EntryType.ASSET,
      category: AssetCategory.CASH,
      name: 'Emergency Fund',
      value: 25000,
      updatedAt: now
    },
    {
      id: 'demo-liability-1',
      type: EntryType.LIABILITY,
      category: LiabilityCategory.MORTGAGE,
      name: 'Mortgage',
      value: 340000,
      originalValue: 380000,
      updatedAt: now,
      interestRate: 4.5,
      interestType: 'COMPOUND_MONTHLY',
      termYears: 22
    },
    {
      id: 'demo-liability-2',
      type: EntryType.LIABILITY,
      category: LiabilityCategory.STUDENT_LOAN,
      name: 'Grad School Loan',
      value: 45000,
      updatedAt: now,
      interestRate: 6.2,
      interestType: 'COMPOUND_MONTHLY',
      termYears: 8
    }
  ];

  const budgets: BudgetEntry[] = [
    { id: 'demo-budget-1', category: 'Housing', limit: 2800, spent: 2800 },
    { id: 'demo-budget-2', category: 'Groceries', limit: 600, spent: 450 },
    { id: 'demo-budget-3', category: 'Dining Out', limit: 300, spent: 210 },
    { id: 'demo-budget-4', category: 'Transport', limit: 400, spent: 120 }
  ];

  const income: IncomeEntry[] = [
    { id: 'demo-income-1', category: 'Salary', amount: 8200, allocatedCategory: 'Housing' },
    { id: 'demo-income-2', category: 'Investments', amount: 450 }
  ];

  return { entries, budgets, income };
};
