export interface Transaction {
  id: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  description: string;
  date: Date;
  tags?: string[];
  recurring?: boolean;
  recurringFrequency?: 'weekly' | 'monthly' | 'yearly';
  notes?: string;
  receiptUrl?: string;
  taxDeductible?: boolean;
  currency?: string;
  exchangeRate?: number;
}

export interface CategorySummary {
  category: string;
  amount: number;
  count: number;
  trend?: number;
  avgAmount?: number;
}

export interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  balance: number;
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  period: 'monthly' | 'yearly';
  spent: number;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date;
  category: string;
  trackIncome?: boolean;
  milestones?: Milestone[];
  type?: 'emergency' | 'vacation' | 'house' | 'car' | 'custom';
}

export interface Milestone {
  id: string;
  name: string;
  amount: number;
  completed: boolean;
  completedDate?: Date;
}

export interface RecurringTransaction {
  id: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  description: string;
  frequency: 'weekly' | 'monthly' | 'yearly';
  nextDate: Date;
  active: boolean;
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: Date;
  category: string;
  recurring: boolean;
  frequency?: 'monthly' | 'yearly';
  paid: boolean;
  notes?: string;
}

export interface SpendingLimit {
  id: string;
  category: string;
  amount: number;
  period: 'weekly' | 'monthly';
  spent: number;
  notifications: boolean;
}

export interface FinancialHealthMetrics {
  score: number;
  savingsRate: number;
  expenseRatio: number;
  emergencyFundMonths: number;
  debtToIncomeRatio: number;
  recommendations: string[];
}

export interface TransactionTemplate {
  id: string;
  name: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  description: string;
}

export interface Asset {
  id: string;
  name: string;
  value: number;
  type: 'cash' | 'investment' | 'property' | 'other';
  lastUpdated: Date;
}

export interface Liability {
  id: string;
  name: string;
  amount: number;
  type: 'credit_card' | 'loan' | 'mortgage' | 'other';
  interestRate?: number;
  minimumPayment?: number;
  lastUpdated: Date;
}

export interface NetWorthEntry {
  date: Date;
  assets: number;
  liabilities: number;
  netWorth: number;
}