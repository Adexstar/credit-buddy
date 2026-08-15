import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { policyApi, scopeLabel, type Policy, type PolicyType } from "@/lib/policies";
import { settingsApi } from "@/lib/settings";
import { canCreatePolicy, maxPolicies, type PlanTier } from "@/lib/tiers";

interface PolicyContextValue {
  policies: Policy[];
  filtered: Policy[];
  loading: boolean;
  tier: PlanTier;
  activeCount: number;
  policyLimit: number;
  atLimit: boolean;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  filterType: PolicyType | "all";
  setFilterType: (v: PolicyType | "all") => void;
  selectedPolicy: Policy | null;
  setSelectedPolicy: (p: Policy | null) => void;
  isEditorOpen: boolean;
  openEditor: (policy?: Policy | null) => void;
  closeEditor: () => void;
  isSimulatorOpen: boolean;
  openSimulator: (policy: Policy) => void;
  closeSimulator: () => void;
  pendingDelete: Policy | null;
  requestDelete: (policy: Policy | null) => void;
  createPolicy: (data: Policy) => Promise<void>;
  updatePolicy: (id: string, data: Policy) => Promise<void>;
  deletePolicy: (id: string) => Promise<void>;
  togglePolicy: (id: string) => Promise<void>;
  reorderPolicies: (order: string[]) => Promise<void>;
}

const PolicyContext = createContext<PolicyContextValue | null>(null);

export function PolicyProvider({ children }: { children: ReactNode }) {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<PolicyType | "all">("all");
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [isEditorOpen, setEditorOpen] = useState(false);
  const [isSimulatorOpen, setSimulatorOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Policy | null>(null);
  const [tier, setTier] = useState<PlanTier>("free");

  useEffect(() => {
    let cancelled = false;
    void settingsApi.getAll().then((data) => {
      if (!cancelled) setTier(data.profile.plan);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const refresh = useCallback(async () => {
    const list = await policyApi.getAll();
    setPolicies(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return policies.filter((p) => {
      const typeMatch = filterType === "all" || p.type === filterType;
      if (!typeMatch) return false;
      if (!q) return true;
      return `${p.name} ${scopeLabel(p.scope)}`.toLowerCase().includes(q);
    });
  }, [policies, searchQuery, filterType]);

  const createPolicy = useCallback(
    async (data: Policy) => {
      if (data.isActive && !canCreatePolicy(tier, policies.filter((p) => p.isActive).length)) {
        throw new Error(`Active policy limit reached (${maxPolicies(tier)}). Upgrade your plan to add more.`);
      }
      await policyApi.create(data);
      await refresh();
      toast.success("Policy created successfully");
    },
    [refresh, tier, policies],
  );

  const updatePolicy = useCallback(
    async (id: string, data: Policy) => {
      await policyApi.update(id, data);
      await refresh();
      toast.success("Policy updated successfully");
    },
    [refresh],
  );

  const deletePolicy = useCallback(
    async (id: string) => {
      const removed = policies.find((p) => p.id === id);
      await policyApi.remove(id);
      await refresh();
      toast.success(`Deleted ${removed?.name ?? "policy"}`);
    },
    [policies, refresh],
  );

  const togglePolicy = useCallback(
    async (id: string) => {
      const policy = policies.find((p) => p.id === id);
      if (!policy) return;
      const next = !policy.isActive;
      if (next && !canCreatePolicy(tier, policies.filter((p) => p.isActive).length)) {
        toast.error(`Active policy limit reached (${maxPolicies(tier)}). Upgrade your plan to activate more.`);
        return;
      }
      setPolicies((prev) => prev.map((p) => (p.id === id ? { ...p, isActive: next } : p)));
      try {
        await policyApi.toggle(id, next);
        toast.success(`${policy.name} is now ${next ? "Active" : "Inactive"}`, {
          action: {
            label: "Undo",
            onClick: () => {
              setPolicies((prev) => prev.map((p) => (p.id === id ? { ...p, isActive: !next } : p)));
              void policyApi.toggle(id, !next);
            },
          },
        });
      } catch (error) {
        setPolicies((prev) => prev.map((p) => (p.id === id ? { ...p, isActive: !next } : p)));
        toast.error(`Failed to save policy: ${(error as Error).message}`);
      }
    },
    [policies, tier],
  );

  const reorderPolicies = useCallback(async (order: string[]) => {
    setPolicies((prev) => [...prev].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id)));
    await policyApi.reorder(order);
  }, []);

  const activeCount = policies.filter((p) => p.isActive).length;
  const policyLimit = maxPolicies(tier);
  const atLimit = !canCreatePolicy(tier, activeCount);

  const value: PolicyContextValue = {
    policies,
    filtered,
    loading,
    tier,
    activeCount,
    policyLimit,
    atLimit,
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    selectedPolicy,
    setSelectedPolicy,
    isEditorOpen,
    openEditor: (policy = null) => {
      setSelectedPolicy(policy);
      setEditorOpen(true);
    },
    closeEditor: () => {
      setEditorOpen(false);
      setSelectedPolicy(null);
    },
    isSimulatorOpen,
    openSimulator: (policy) => {
      setSelectedPolicy(policy);
      setSimulatorOpen(true);
    },
    closeSimulator: () => setSimulatorOpen(false),
    pendingDelete,
    requestDelete: setPendingDelete,
    createPolicy,
    updatePolicy,
    deletePolicy,
    togglePolicy,
    reorderPolicies,
  };

  return <PolicyContext.Provider value={value}>{children}</PolicyContext.Provider>;
}

export function usePolicies() {
  const ctx = useContext(PolicyContext);
  if (!ctx) throw new Error("usePolicies must be used inside PolicyProvider");
  return ctx;
}
