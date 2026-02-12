
export enum EntryType {
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY'
}

export enum AssetCategory {
  CASH = 'Cash & Bank',
  INVESTMENTS = 'Investments',
  REAL_ESTATE = 'Real Estate',
  RETIREMENT = 'Retirement',
  VEHICLES = 'Vehicles',
  OTHER_ASSET = 'Other Assets'
}

export enum LiabilityCategory {
  MORTGAGE = 'Mortgage',
  STUDENT_LOAN = 'Student Loans',
  AUTO_LOAN = 'Auto Loans',
  CREDIT_CARD = 'Credit Cards',
  PERSONAL_LOAN = 'Personal Loans',
  OTHER_LIABILITY = 'Other Liabilities'
}

export interface InvestmentPerformance {
  return1Y: number;
  return5Y?: number;
  returnMax?: number;
  history1Y: number[];
  history5Y?: number[];
  historyMax?: number[];
}

export interface FinancialEntry {
  id: string;
  type: EntryType;
  category: string;
  name: string;
  value: number;
  updatedAt: number;
  // Interest & Amortization Fields (Liability)
  interestRate?: number; // Annual Percentage
  interestType?: 'SIMPLE' | 'COMPOUND_MONTHLY' | 'COMPOUND_ANNUALLY';
  termYears?: number; // Remaining term in years
  // Depreciation Fields (Asset)
  isDepreciating?: boolean;
  originalValue?: number;
  purchaseDate?: number;
  depreciationRate?: number; // Annual Percentage
  depreciationMethod?: 'STRAIGHT_LINE' | 'DECLINING_BALANCE' | 'SUM_OF_YEARS_DIGITS';
  // Investment Performance Fields (Asset)
  performance?: InvestmentPerformance;
}

export interface BudgetEntry {
  id: string;
  category: string;
  limit: number;
  spent: number;
}

export interface IncomeEntry {
  id: string;
  category: string;
  amount: number;
  allocatedCategory?: string;
}

export interface NetWorthData {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
}

export interface AIAnalysisResult {
  summary: string;
  suggestions: string[];
  riskAssessment: 'Low' | 'Medium' | 'High';
}

export interface AmortizationRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export type SubscriptionPlan = 'FREE' | 'MONTHLY' | 'YEARLY';

export interface UserSubscription {
  plan: SubscriptionPlan;
  status: 'ACTIVE' | 'TRIAL' | 'EXPIRED';
  startDate: number; // Timestamp
  trialEndsAt?: number; // Timestamp if in trial
}
