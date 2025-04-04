export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
  TRANSFER = 'transfer'
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category?: string;
  date: Date | string;
  note?: string;
  isRecurring: boolean;
  paymentMethod?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface CreateTransactionDto {
  description: string;
  amount: number;
  type: TransactionType;
  category?: string;
  date: Date | string;
  note?: string;
  isRecurring?: boolean;
  paymentMethod?: string;
}

export interface UpdateTransactionDto extends Partial<CreateTransactionDto> {}

export interface FilterTransactionDto {
  startDate?: string;
  endDate?: string;
  type?: TransactionType;
  category?: string;
  minAmount?: number;
  maxAmount?: number;
  searchTerm?: string;
}

export interface TransactionAnalytics {
  total: number;
  average: number;
  categories: CategoryTotal[];
}

export interface CategoryTotal {
  category: string;
  total: number;
  percentage: number;
} 