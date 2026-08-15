import { mockBuckets, type CreditBucket } from "./mock-data";
import { api } from "./api";
import { activePlatformFee } from "./tiers";

/** Default fee; the effective fee depends on the active plan tier. */
export const PLATFORM_FEE = 0.1;
export const MIN_CONVERSION = 10;
export const TARGET_EXPIRY_DAYS = 90;

const RATES: Record<string, number> = {
  openai_to_claude: 0.85,
  claude_to_openai: 1.15,
  openai_to_midjourney: 0.02,
  midjourney_to_openai: 45.0,
  openai_to_replicate: 0.75,
  replicate_to_openai: 1.2,
  claude_to_replicate: 0.88,
  replicate_to_claude: 1.1,
  midjourney_to_claude: 0.018,
  claude_to_midjourney: 55.0,
};

export type RateSource = "Market rate" | "Policy rate" | "Fixed rate";

export function appIdFromName(name: string) {
  return name.toLowerCase().replace(/[^a-z]/g, "");
}

export function getConversionRate(sourceAppId?: string, targetAppId?: string): number {
  if (!sourceAppId || !targetAppId) return 0;
  const key = `${sourceAppId}_to_${targetAppId}`;
  const reverse = `${targetAppId}_to_${sourceAppId}`;
  if (RATES[key]) return RATES[key];
  if (RATES[reverse]) return 1 / RATES[reverse];
  return 0.7;
}

export function getRateSource(sourceAppId?: string, targetAppId?: string): RateSource {
  if (!sourceAppId || !targetAppId) return "Market rate";
  const key = `${sourceAppId}_to_${targetAppId}`;
  if (RATES[key]) return "Market rate";
  if (RATES[`${targetAppId}_to_${sourceAppId}`]) return "Policy rate";
  return "Fixed rate";
}

export interface ConversionQuote {
  rate: number;
  rateSource: RateSource;
  gross: number;
  fee: number;
  net: number;
  expiry: string;
  updatedAt: string;
}

export function quote(amount: number, sourceAppId: string, targetAppId: string): ConversionQuote {
  const rate = getConversionRate(sourceAppId, targetAppId);
  const gross = amount * rate;
  const fee = gross * activePlatformFee();
  return {
    rate,
    rateSource: getRateSource(sourceAppId, targetAppId),
    gross,
    fee,
    net: gross - fee,
    expiry: new Date(Date.now() + TARGET_EXPIRY_DAYS * 86400_000).toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export interface ConversionResult extends ConversionQuote {
  id: string;
  sourceAppName: string;
  sourceType: string;
  targetAppName: string;
  amount: number;
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function conversionId() {
  const d = new Date();
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `#CONV-${stamp}-${rand}`;
}

export interface ExecuteInput {
  bucket: CreditBucket;
  targetAppName: string;
  amount: number;
}

export const conversionApi = {
  async getRates(): Promise<Record<string, number>> {
    await wait(120);
    return { ...RATES };
  },

  async preview({ bucket, targetAppName, amount }: ExecuteInput): Promise<ConversionQuote> {
    await wait(400);
    return quote(amount, appIdFromName(bucket.appName), appIdFromName(targetAppName));
  },

  async execute({ bucket, targetAppName, amount }: ExecuteInput): Promise<ConversionResult> {
    await wait(900);
    const live = mockBuckets.find((b) => b.id === bucket.id);
    const available = live?.remaining ?? 0;
    if (amount > available + 1e-9) {
      throw new ConversionError("Not enough balance in source bucket", available, amount);
    }
    const q = quote(amount, appIdFromName(bucket.appName), appIdFromName(targetAppName));
    if (live) live.remaining = Number((live.remaining - amount).toFixed(2));

    const existing = mockBuckets.find((b) => b.appName === targetAppName && b.sourceType === "Converted");
    if (existing) {
      existing.remaining = Number((existing.remaining + q.net).toFixed(2));
      existing.original = Number((existing.original + q.net).toFixed(2));
      existing.softExpiry = q.expiry;
    } else {
      mockBuckets.push({
        id: `b-conv-${Date.now()}`,
        sourceType: "Converted",
        appName: targetAppName,
        remaining: Number(q.net.toFixed(2)),
        original: Number(q.net.toFixed(2)),
        softExpiry: q.expiry,
        peakRestricted: false,
      });
    }

    const result: ConversionResult = {
      ...q,
      id: conversionId(),
      sourceAppName: bucket.appName,
      sourceType: bucket.sourceType,
      targetAppName,
      amount,
    };

    api.addActivity({
      id: `act-conv-${Date.now()}`,
      kind: "conversion",
      message: `Converted ${amount.toFixed(2)} ${bucket.appName} credits into ${q.net.toFixed(2)} ${targetAppName} credits`,
      appName: targetAppName,
      timestamp: new Date().toISOString(),
      amount: Number(q.net.toFixed(2)),
    });

    history.unshift(result);
    return result;
  },

  async getHistory(): Promise<ConversionResult[]> {
    await wait(120);
    return [...history];
  },
};

const history: ConversionResult[] = [];

export class ConversionError extends Error {
  available: number;
  requested: number;
  constructor(message: string, available: number, requested: number) {
    super(message);
    this.name = "ConversionError";
    this.available = available;
    this.requested = requested;
  }
}
