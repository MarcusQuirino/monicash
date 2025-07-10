export type Category = {
  id: number;
  name: string;
  color?: string;
  _count?: {
    expenses: number;
  };
};

export type Expense = {
  id: number;
  amount: string;
  date: string;
  description?: string;
  categoryId: number;
  category: Category;
  createdAt: string;
  updatedAt: string;
};

export type Income = {
  id: number;
  amount: string;
  date: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

export type Transaction = {
  id: number;
  amount: string;
  date: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  type: 'expense' | 'income';
  category?: Category; // Only for expenses
  categoryId?: number; // Only for expenses
};
