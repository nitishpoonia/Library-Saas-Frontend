/** Shapes returned by the backend's /v1 API. Keep in sync with the backend README. */

export type Role = "OWNER" | "MANAGER" | "STAFF";

export type AuthTokens = {
  userId: number;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

export type LibrarySummary = { id: number; name: string; address: string; role: Role };

export type SubscriptionStatus = "TRIALING" | "ACTIVE" | "PAST_DUE" | "EXPIRED" | "CANCELLED";

export type Me = {
  user: {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    notificationsEnabled: boolean;
  };
  organization: {
    id: number;
    subscriptionStatus: SubscriptionStatus;
    trialEndsAt: string;
    currentPeriodEnd: string | null;
    billedBranches: number;
  } | null;
  libraries: LibrarySummary[];
};

export type Library = {
  id: number;
  organizationId: number;
  name: string;
  address: string;
  timezone: string;
  gracePeriodDays: number;
  role: Role;
  seatCount: number;
  studentCount: number;
};

export type Dashboard = {
  library: { id: number; name: string };
  role: Role;
  today: string;
  seats: { total: number; inUse: number; free: number };
  students: { active: number; overdue: number; expiringSoon: number; withPendingFees: number };
  pendingFees: number;
  finance: { month: string; revenue: number; expenses: number; balance: number } | null;
  subscription: {
    status: SubscriptionStatus;
    usable: boolean;
    endsAt: string | null;
    daysRemaining: number;
  };
};

export type PageMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
};
