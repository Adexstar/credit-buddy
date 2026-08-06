export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  planType: 'free' | 'premium' | 'enterprise';
}

export interface CreditBucket {
  id: string;
  userId: string;
  appId: string;
  remainingBalance: number;
  sourceType: string;
  softExpiry?: string;
}

export interface AppConnection {
  id: string;
  appId: string;
  userId: string;
  isActive: boolean;
}
