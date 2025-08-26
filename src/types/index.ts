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
}

export interface CategorySummary {
  category: string;
  amount: number;
  count: number;
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
  userId?: string;
}

export interface User {
  id: string;
  email: string;
  created_at: string;
}