export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  occupation: string;
  balance: number;
  tier: number;
  account_number: string;
  created_at: string;
}

export interface Transaction {
  id: number;
  user_id: number;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  category: string;
  timestamp: string;
}

export interface Saving {
  id: number;
  user_id: number;
  title: string;
  target_amount: number;
  current_amount: number;
  status: 'active' | 'matured';
  created_at: string;
}
