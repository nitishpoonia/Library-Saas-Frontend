/**
 * Shapes of the backend's /admin/v1 responses (see the backend's
 * src/modules/admin/routes.ts). Dates arrive as ISO strings.
 */

export type SubscriptionStatus = "TRIALING" | "ACTIVE" | "PAST_DUE" | "EXPIRED" | "CANCELLED";

export type PageMeta = { page: number; limit: number; total: number; totalPages: number; hasNextPage: boolean };
export type Page<T> = { data: T[]; meta: PageMeta };

export type AdminProfile = { id: number; email: string; name: string };
export type LoginResult = { token: string; expiresAt: string; admin: AdminProfile };

export type JobRunStatus = "RUNNING" | "SUCCEEDED" | "FAILED";

export type Overview = {
  organizations: {
    byStatus: Partial<Record<SubscriptionStatus, number>>;
    suspended: number;
    signupsLast7Days: number;
    signupsLast30Days: number;
  };
  trialConversion: { trialsEnded: number; paid: number; rate: number | null };
  revenue: { mrrPaise: number; collectedLast30DaysPaise: number };
  ops: {
    lastDailyRun: { runDate: string; status: JobRunStatus; finishedAt: string | null; error: string | null } | null;
    failedNoticesLast7Days: number;
  };
};

export type Owner = { id: number; name: string; email: string | null; phone: string | null };

export type OrganizationRow = {
  id: number;
  owner: Owner;
  status: SubscriptionStatus;
  suspended: boolean;
  trialEndsAt: string;
  currentPeriodEnd: string | null;
  branches: number;
  billedBranches: number;
  createdAt: string;
  lastActiveAt: string | null;
};

export type BillingPaymentStatus = "CREATED" | "PAID";

export type OrganizationDetail = {
  id: number;
  owner: Owner & { createdAt: string };
  status: SubscriptionStatus;
  usable: boolean;
  suspended: boolean;
  suspendedAt: string | null;
  suspendReason: string | null;
  trialEndsAt: string;
  currentPeriodEnd: string | null;
  billedBranches: number;
  unpaidBranches: number;
  createdAt: string;
  activeOwnerSessions: number;
  branches: Array<{
    id: number;
    name: string;
    address: string;
    createdAt: string;
    seats: number;
    students: number;
    staff: number;
  }>;
  payments: Array<{
    id: number;
    kind: "PLAN" | "BRANCH_ADDON";
    plan: "MONTHLY" | "QUARTERLY" | "YEARLY" | null;
    branches: number;
    amountPaise: number;
    status: BillingPaymentStatus;
    razorpayOrderId: string;
    razorpayPaymentId: string | null;
    periodStart: string | null;
    periodEnd: string | null;
    createdAt: string;
    paidAt: string | null;
  }>;
  recentAdminActions: Array<{
    id: number;
    action: string;
    admin: string;
    reason: string | null;
    before: unknown;
    after: unknown;
    createdAt: string;
  }>;
};

export type Order = {
  id: number;
  organizationId: number;
  ownerName: string;
  kind: "PLAN" | "BRANCH_ADDON";
  plan: "MONTHLY" | "QUARTERLY" | "YEARLY" | null;
  branches: number;
  amountPaise: number;
  status: BillingPaymentStatus;
  razorpayOrderId: string;
  razorpayPaymentId: string | null;
  createdAt: string;
  paidAt: string | null;
};

export type JobRun = {
  id: number;
  name: string;
  runDate: string;
  status: JobRunStatus;
  stats: unknown;
  error: string | null;
  startedAt: string;
  finishedAt: string | null;
};

export type Notice = {
  id: number;
  library: { id: number; name: string; organizationId: number };
  type: string;
  channel: "PUSH" | "SMS" | "WHATSAPP";
  recipient: string;
  status: "SENT" | "FAILED" | "SKIPPED";
  error: string | null;
  createdAt: string;
};

export type AuditEntry = {
  id: number;
  action: string;
  targetType: string | null;
  targetId: number | null;
  before: unknown;
  after: unknown;
  reason: string | null;
  ip: string | null;
  createdAt: string;
  admin: { id: number; name: string; email: string };
};
