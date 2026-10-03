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

export type MembershipStatus = "ACTIVE" | "OVERDUE" | "COMPLETED" | "CANCELLED";
export type PaymentMode = "CASH" | "UPI" | "CARD" | "BANK_TRANSFER";

export type Membership = {
  id: number;
  seatId: number;
  seatLabel?: string;
  startDate: string;
  endDate: string;
  /** "22:00-02:00" */
  timing: string;
  startTime: string;
  endTime: string;
  status: MembershipStatus;
  fee: number;
  amountPaid: number;
  pendingAmount: number;
  paymentStatus: "PAID" | "PENDING";
  daysRemaining: number;
  /** While OVERDUE: last day the seat is held. */
  graceEndsOn: string | null;
  graceDaysLeft: number | null;
  cancelReason: "NOT_RENEWED" | "REMOVED" | null;
  renewsId: number | null;
};

export type Payment = {
  id: number;
  membershipId: number;
  amount: number;
  mode: PaymentMode;
  paidAt: string;
  receiptNumber: string;
  notes: string | null;
  voided: boolean;
  voidedAt: string | null;
  voidReason: string | null;
};

export type StudentFlag = "OVERDUE" | "FEES_PENDING";

export type StudentListItem = {
  id: number;
  name: string;
  phone: string;
  archived: boolean;
  current: Membership | null;
  pendingAmount: number;
  flags: StudentFlag[];
};

export type StudentDetail = {
  id: number;
  name: string;
  phone: string;
  archived: boolean;
  createdAt: string;
  pendingAmount: number;
  current: Membership | null;
  memberships: Array<Membership & { payments: Payment[] }>;
};

export type Receipt = Payment & {
  libraryName: string;
  libraryAddress: string;
  studentName: string;
  studentPhone: string;
  seatLabel?: string;
  timing: string;
  periodStart: string;
  periodEnd: string;
  fee: number;
  totalPaid: number;
  pendingAmount: number;
};

export type SeatAvailability = { id: number; label: string; position: number; hasLocker: boolean; available: boolean };

export type Expense = {
  id: number;
  title: string;
  category: string;
  amount: number;
  spentOn: string;
  notes: string | null;
  createdAt: string;
};

export type Seat = { id: number; label: string; position: number; hasLocker: boolean };

export type StaffMember = {
  id: number;
  role: "MANAGER" | "STAFF";
  createdAt: string;
  user: { id: number; name: string; phone: string | null; email: string | null };
};

export type BillingPlan = "MONTHLY" | "QUARTERLY" | "YEARLY";

export type BillingSummary = {
  status: SubscriptionStatus;
  usable: boolean;
  trialEndsAt: string;
  currentPeriodEnd: string | null;
  branches: number;
  billedBranches: number;
  plans: Array<{ plan: BillingPlan; months: number; amountPaise: number }>;
  branchAddon: { amountPaise: number; until: string } | null;
  razorpayKeyId: string | null;
  history: Array<{
    id: number;
    kind: "PLAN" | "BRANCH_ADDON";
    plan: BillingPlan | null;
    branches: number;
    amountPaise: number;
    periodStart: string | null;
    periodEnd: string | null;
    paidAt: string | null;
  }>;
};

export type BillingOrder = {
  subscriptionPaymentId: number;
  orderId: string;
  amountPaise: number;
  currency: string;
  keyId: string;
};
