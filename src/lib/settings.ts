/** Settings domain: profile, notifications, billing, team, API keys, exports. */

export interface Profile {
  name: string;
  email: string;
  username: string;
  bio: string;
  avatar: string | null;
  plan: "free" | "premium";
  joined: string;
}

export interface NotificationPrefs {
  email: {
    lowBalance: boolean;
    conversions: boolean;
    syncUpdates: boolean;
    marketing: boolean;
    security: boolean;
    updates: boolean;
  };
  push: {
    expiring: boolean;
    conversions: boolean;
    dailySummary: boolean;
    syncStatus: boolean;
  };
  sms: {
    criticalAlerts: boolean;
    phone: string;
    verified: boolean;
  };
}

export interface PaymentMethod {
  id: string;
  type: string;
  last4: string;
  expiry: string;
  primary: boolean;
}

export interface Invoice {
  id: string;
  date: string;
  amount: number;
  plan: string;
  status: "paid" | "failed" | "refunded";
}

export interface Billing {
  plan: "free" | "premium";
  price: number;
  nextBilling: string;
  cancelled: boolean;
  paymentMethods: PaymentMethod[];
  history: Invoice[];
}

export type TeamRole = "owner" | "admin" | "member" | "viewer";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  joined: string;
}

export interface PendingInvite {
  id: string;
  email: string;
  role: TeamRole;
  sent: string;
}

export interface TeamSettings {
  canInvite: boolean;
  canSeeBilling: boolean;
  canDelete: boolean;
  autoApprove: boolean;
}

export interface Team {
  members: TeamMember[];
  pending: PendingInvite[];
  settings: TeamSettings;
}

export type KeyPermission = "read" | "write" | "admin";

export interface ApiKey {
  id: string;
  name: string;
  tail: string;
  createdAt: string;
  lastUsed: string | null;
  expires: string;
  permissions: KeyPermission[];
}

export interface ExportFile {
  id: string;
  name: string;
  size: string;
  createdAt: string;
  format: string;
}

export const ROLE_INFO: Record<TeamRole, { label: string; description: string }> = {
  owner: { label: "Owner", description: "Full access, billing and account deletion" },
  admin: { label: "Admin", description: "Manage apps, credits and policies" },
  member: { label: "Member", description: "Use credits only" },
  viewer: { label: "Viewer", description: "Read-only access" },
};

export const PLANS = [
  {
    id: "free" as const,
    name: "Free",
    price: 0,
    rollover: "50%",
    policies: "2 max",
    team: "No",
    support: "Email",
    features: ["50% credit rollover", "2 policies", "Basic analytics", "Email support"],
  },
  {
    id: "premium" as const,
    name: "Premium",
    price: 5,
    rollover: "100%",
    policies: "Unlimited",
    team: "Yes (5)",
    support: "Priority",
    features: [
      "Unlimited rollover policies",
      "Priority proxy speed",
      "Advanced analytics",
      "Team member support (up to 5)",
    ],
  },
];

export const PASSWORD_RULES = [
  { id: "length", label: "At least 8 characters", test: (v: string) => v.length >= 8 },
  { id: "upper", label: "At least one uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { id: "number", label: "At least one number", test: (v: string) => /\d/.test(v) },
  {
    id: "special",
    label: "At least one special character",
    test: (v: string) => /[^A-Za-z0-9]/.test(v),
  },
];

const iso = (daysFromNow: number) => new Date(Date.now() + daysFromNow * 86_400_000).toISOString();

// ---------------------------------------------------------------- mock state

let profile: Profile = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  username: "adalovelace",
  bio: "AI enthusiast and developer",
  avatar: null,
  plan: "premium",
  joined: iso(-14),
};

let notifications: NotificationPrefs = {
  email: {
    lowBalance: true,
    conversions: true,
    syncUpdates: true,
    marketing: false,
    security: true,
    updates: false,
  },
  push: { expiring: true, conversions: true, dailySummary: false, syncStatus: true },
  sms: { criticalAlerts: false, phone: "+1 (555) 123-4567", verified: false },
};

let billing: Billing = {
  plan: "premium",
  price: 5,
  nextBilling: iso(17),
  cancelled: false,
  paymentMethods: [
    { id: "pm_1", type: "Visa", last4: "4242", expiry: "12/2026", primary: true },
  ],
  history: [
    { id: "in_3", date: iso(-3), amount: 5, plan: "Premium", status: "paid" },
    { id: "in_2", date: iso(-33), amount: 5, plan: "Premium", status: "paid" },
    { id: "in_1", date: iso(-63), amount: 0, plan: "Free", status: "paid" },
  ],
};

let team: Team = {
  members: [
    { id: "1", name: "Ada Lovelace", email: "ada@example.com", role: "owner", joined: iso(-14) },
    { id: "2", name: "Alan Turing", email: "alan@example.com", role: "admin", joined: iso(-10) },
    { id: "3", name: "Grace Hopper", email: "grace@example.com", role: "member", joined: iso(-6) },
    { id: "4", name: "Katherine J.", email: "katherine@example.com", role: "viewer", joined: iso(-2) },
  ],
  pending: [
    { id: "pi_1", email: "amy@example.com", role: "member", sent: iso(-2) },
    { id: "pi_2", email: "bob@example.com", role: "admin", sent: iso(-1) },
  ],
  settings: { canInvite: true, canSeeBilling: true, canDelete: false, autoApprove: true },
};

let apiKeys: ApiKey[] = [
  {
    id: "key_1",
    name: "Production",
    tail: "a91f",
    createdAt: iso(-6),
    lastUsed: iso(-0.2),
    expires: "never",
    permissions: ["read", "write"],
  },
  {
    id: "key_2",
    name: "Development",
    tail: "7c3d",
    createdAt: iso(-2),
    lastUsed: null,
    expires: "90d",
    permissions: ["read"],
  },
];

let exports: ExportFile[] = [
  { id: "ex_1", name: "credits_export.csv", size: "2.3 MB", createdAt: iso(-1), format: "CSV" },
  { id: "ex_2", name: "usage_export.csv", size: "1.1 MB", createdAt: iso(-2), format: "CSV" },
  { id: "ex_3", name: "conversions_export.csv", size: "456 KB", createdAt: iso(-5), format: "CSV" },
];

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

function randomToken(length: number) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  const bytes = new Uint32Array(length);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < length; i += 1) out += chars[bytes[i]! % chars.length];
  return out;
}

export const settingsApi = {
  async getAll() {
    await wait(220);
    return {
      profile: clone(profile),
      notifications: clone(notifications),
      billing: clone(billing),
      team: clone(team),
      apiKeys: clone(apiKeys),
      exports: clone(exports),
    };
  },

  async updateProfile(patch: Partial<Profile>) {
    await wait(400);
    if (patch.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(patch.email)) {
      throw new Error("Invalid email address");
    }
    profile = { ...profile, ...patch };
    return clone(profile);
  },

  async uploadAvatar(dataUrl: string) {
    await wait(700);
    profile = { ...profile, avatar: dataUrl };
    return clone(profile);
  },

  async changePassword(current: string, next: string) {
    await wait(600);
    if (current.length < 4) throw new Error("Invalid password");
    if (PASSWORD_RULES.some((r) => !r.test(next))) throw new Error("Password too weak");
    return true;
  },

  async updateNotifications(next: NotificationPrefs) {
    await wait(400);
    notifications = clone(next);
    return clone(notifications);
  },

  async verifyPhone() {
    await wait(700);
    notifications = { ...notifications, sms: { ...notifications.sms, verified: true } };
    return clone(notifications);
  },

  async changePlan(plan: "free" | "premium") {
    await wait(600);
    const price = PLANS.find((p) => p.id === plan)?.price ?? 0;
    billing = { ...billing, plan, price, cancelled: false, nextBilling: iso(30) };
    profile = { ...profile, plan };
    return clone(billing);
  },

  async cancelSubscription() {
    await wait(500);
    billing = { ...billing, cancelled: true };
    return clone(billing);
  },

  async addPaymentMethod(input: { type: string; last4: string; expiry: string }) {
    await wait(500);
    const method: PaymentMethod = { id: `pm_${randomToken(6)}`, ...input, primary: false };
    billing = { ...billing, paymentMethods: [...billing.paymentMethods, method] };
    return clone(billing);
  },

  async removePaymentMethod(id: string) {
    await wait(350);
    billing = { ...billing, paymentMethods: billing.paymentMethods.filter((m) => m.id !== id) };
    return clone(billing);
  },

  async inviteMember(email: string, role: TeamRole) {
    await wait(500);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("Invalid email address");
    if (team.members.some((m) => m.email === email) || team.pending.some((p) => p.email === email)) {
      throw new Error("Email already registered");
    }
    team = {
      ...team,
      pending: [...team.pending, { id: `pi_${randomToken(6)}`, email, role, sent: new Date().toISOString() }],
    };
    return clone(team);
  },

  async updateMemberRole(id: string, role: TeamRole) {
    await wait(350);
    team = { ...team, members: team.members.map((m) => (m.id === id ? { ...m, role } : m)) };
    return clone(team);
  },

  async removeMember(id: string) {
    await wait(350);
    team = { ...team, members: team.members.filter((m) => m.id !== id) };
    return clone(team);
  },

  async resendInvite(id: string) {
    await wait(350);
    team = {
      ...team,
      pending: team.pending.map((p) => (p.id === id ? { ...p, sent: new Date().toISOString() } : p)),
    };
    return clone(team);
  },

  async cancelInvite(id: string) {
    await wait(300);
    team = { ...team, pending: team.pending.filter((p) => p.id !== id) };
    return clone(team);
  },

  async updateTeamSettings(next: TeamSettings) {
    await wait(350);
    team = { ...team, settings: { ...next } };
    return clone(team);
  },

  async createApiKey(input: { name: string; permissions: KeyPermission[]; expires: string }) {
    await wait(600);
    if (!input.name.trim()) throw new Error("Key name is required");
    const secret = `acb_live_${randomToken(32)}`;
    const key: ApiKey = {
      id: `key_${randomToken(6)}`,
      name: input.name.trim(),
      tail: secret.slice(-4),
      createdAt: new Date().toISOString(),
      lastUsed: null,
      expires: input.expires,
      permissions: input.permissions,
    };
    apiKeys = [key, ...apiKeys];
    return { key, secret, keys: clone(apiKeys) };
  },

  async revokeApiKey(id: string) {
    await wait(350);
    apiKeys = apiKeys.filter((k) => k.id !== id);
    return clone(apiKeys);
  },

  async rotateApiKey(id: string) {
    await wait(500);
    const secret = `acb_live_${randomToken(32)}`;
    apiKeys = apiKeys.map((k) =>
      k.id === id ? { ...k, tail: secret.slice(-4), createdAt: new Date().toISOString(), lastUsed: null } : k,
    );
    return { secret, keys: clone(apiKeys) };
  },

  async createExport(config: { dataType: string; format: string }) {
    await wait(900);
    const file: ExportFile = {
      id: `ex_${randomToken(6)}`,
      name: `${config.dataType.toLowerCase().replace(/\s+/g, "_")}_export.${config.format.toLowerCase()}`,
      size: `${(Math.random() * 3 + 0.2).toFixed(1)} MB`,
      createdAt: new Date().toISOString(),
      format: config.format,
    };
    exports = [file, ...exports];
    return clone(exports);
  },

  async clearExports() {
    await wait(300);
    exports = [];
    return clone(exports);
  },

  async requestGdprExport() {
    await wait(800);
    return true;
  },

  async clearAllData() {
    await wait(800);
    return true;
  },

  async disconnectAllApps() {
    await wait(800);
    return true;
  },

  async deleteAccount(password: string) {
    await wait(900);
    if (password.length < 4) throw new Error("Invalid password");
    return true;
  },
};

export const API_USAGE = { last30Days: 1234, rateLimit: "100 requests per minute" };
