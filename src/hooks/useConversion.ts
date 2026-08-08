import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { CreditBucket } from "@/lib/api";
import {
  appIdFromName,
  conversionApi,
  ConversionError,
  getConversionRate,
  getRateSource,
  MIN_CONVERSION,
  PLATFORM_FEE,
  type ConversionResult,
} from "@/lib/conversions";

export type ConversionStep = 1 | 2 | 3;

export interface ConversionFailure {
  message: string;
  available?: number;
  requested?: number;
}

export function useConversion({
  buckets,
  targetNames,
  initialBucketId,
  isOpen,
  onDone,
}: {
  buckets: CreditBucket[];
  targetNames: string[];
  initialBucketId?: string;
  isOpen: boolean;
  onDone?: () => void;
}) {
  const [step, setStep] = useState<ConversionStep>(1);
  const [bucketId, setBucketId] = useState<string | null>(null);
  const [targetApp, setTargetApp] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState<ConversionFailure | null>(null);

  const eligible = useMemo(() => buckets.filter((b) => b.remaining > 0), [buckets]);

  const reset = useCallback(() => {
    setStep(1);
    setAmount("");
    setResult(null);
    setError(null);
    setIsLoading(false);
    const preferred = initialBucketId && eligible.some((b) => b.id === initialBucketId) ? initialBucketId : null;
    setBucketId(preferred ?? (eligible.length === 1 ? eligible[0].id : null));
    setTargetApp(null);
  }, [eligible, initialBucketId]);

  useEffect(() => {
    if (isOpen) reset();
  }, [isOpen, reset]);

  const bucket = eligible.find((b) => b.id === bucketId) ?? null;
  const targets = useMemo(
    () => targetNames.filter((name) => !bucket || name !== bucket.appName),
    [targetNames, bucket],
  );

  const sourceId = bucket ? appIdFromName(bucket.appName) : undefined;
  const targetId = targetApp ? appIdFromName(targetApp) : undefined;
  const rate = getConversionRate(sourceId, targetId);
  const rateSource = getRateSource(sourceId, targetId);

  const numericAmount = Number(amount) || 0;
  const gross = numericAmount * rate;
  const fee = gross * PLATFORM_FEE;
  const net = gross - fee;

  const available = bucket?.remaining ?? 0;
  const exceeds = numericAmount > available;
  const amountValid = numericAmount > 0 && !exceeds;
  const belowMinimum = numericAmount > 0 && numericAmount < MIN_CONVERSION;

  const next = () => {
    if (step === 1) {
      if (!bucket) return toast.error("Select a source bucket to continue");
      if (!targetApp) return toast.error("Select a target app to continue");
      setStep(2);
      return;
    }
    if (step === 2) void execute();
  };

  const back = () => {
    if (step === 2) setStep(1);
    if (step === 3) {
      setResult(null);
      setError(null);
      setStep(2);
    }
  };

  const useMax = () => setAmount(available.toFixed(2));

  const execute = async () => {
    if (!bucket || !targetApp) return;
    if (!amountValid) {
      setError({ message: "Insufficient balance", available, requested: numericAmount });
      setStep(3);
      return;
    }
    if (belowMinimum) {
      toast.info(`Minimum conversion amount is ${MIN_CONVERSION} credits`);
      return;
    }
    setIsLoading(true);
    setError(null);
    toast.loading("Conversion initiated…", { id: "conversion" });
    try {
      const res = await conversionApi.execute({ bucket, targetAppName: targetApp, amount: numericAmount });
      setResult(res);
      setStep(3);
      toast.success(
        `Successfully converted ${res.amount.toFixed(2)} ${res.sourceAppName} → ${res.net.toFixed(2)} ${res.targetAppName} credits!`,
        { id: "conversion" },
      );
      onDone?.();
    } catch (e) {
      const failure: ConversionFailure =
        e instanceof ConversionError
          ? { message: e.message, available: e.available, requested: e.requested }
          : { message: e instanceof Error ? e.message : "Conversion failed" };
      setError(failure);
      setStep(3);
      toast.error(`Conversion failed: ${failure.message}`, { id: "conversion" });
    } finally {
      setIsLoading(false);
    }
  };

  const convertMore = () => {
    setResult(null);
    setError(null);
    setAmount("");
    setStep(1);
  };

  return {
    step,
    setStep,
    eligible,
    bucket,
    bucketId,
    setBucketId,
    targets,
    targetApp,
    setTargetApp,
    amount,
    setAmount,
    numericAmount,
    available,
    exceeds,
    amountValid,
    belowMinimum,
    rate,
    rateSource,
    gross,
    fee,
    net,
    isLoading,
    result,
    error,
    next,
    back,
    useMax,
    convertMore,
  };
}

export type ConversionController = ReturnType<typeof useConversion>;
