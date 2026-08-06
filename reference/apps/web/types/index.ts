import type { UserProfile } from '@ai-credit-bank/shared';

export type { UserProfile };

/** Authenticated dashboard user (same shape as the shared UserProfile). */
export type User = UserProfile;

export type SyncStatus = 'healthy' | 'stale' | 'error' | 'never';

export interface App {
  id: string;
  name: string;
  icon_url: string;
  sync_status: SyncStatus;
  credits: number;
  last_sync: string;
}

export interface CreditBucket {
  id: string;
  source_type: string;
  app_name: string;
  app_id?: string;
  remaining_balance: number;
  original_balance: number;
  soft_expiry: string;
  peak_restricted: boolean;
}

export interface Activity {
  type: string;
  message: string;
  app_name: string;
  timestamp: string;
  amount?: number;
}

export interface Stats {
  totalBalance: number;
  hasPolicies: boolean;
  hasProxyUsage: boolean;
}

export interface UsageData {
  labels: string[];
  used: number[];
  added: number[];
}

export type TimeRange = 'week' | 'month' | 'quarter';

export interface Policy {
  id: string;
  app_id: string;
  app_name: string;
  policy_name: string;
  rollover_percentage: number;
  max_rollover_cap: number | null;
  override_expiry_days: number | null;
  peak_restricted: boolean;
  allowed_hours: { start: number; end: number } | null;
  auto_convert_on_expiry: boolean;
  convert_to_app_id: string | null;
  conversion_rate: number | null;
  warn_at_percentage: number;
  notify_channels: string[];
  is_active: boolean;
}

/** Single source of truth for supported providers (used by modals and pages). */
export const PROVIDERS = [
  { id: 'openai', name: 'OpenAI', emoji: '🤖' },
  { id: 'claude', name: 'Claude', emoji: '🧠' },
  { id: 'midjourney', name: 'Midjourney', emoji: '🎨' },
  { id: 'replicate', name: 'Replicate', emoji: '⚡' },
] as const;

export type Provider = (typeof PROVIDERS)[number];
