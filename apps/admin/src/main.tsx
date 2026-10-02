import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import { ApiError } from "./api/client";
import { AppShell } from "./components/AppShell";
import { AuditPage } from "./features/audit/AuditPage";
import { LoginPage } from "./features/auth/LoginPage";
import { OrdersPage } from "./features/billing/OrdersPage";
import { OpsPage } from "./features/ops/OpsPage";
import { AccountPage } from "./features/organizations/AccountPage";
import { AccountsPage } from "./features/organizations/AccountsPage";
import { OverviewPage } from "./features/overview/OverviewPage";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // Retrying a 4xx (wrong id, expired session) can't help; retry network blips once.
      retry: (count, error) => !(error instanceof ApiError && error.status >= 400 && error.status < 500) && count < 1,
    },
  },
});

const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    element: <AppShell />,
    children: [
      { path: "/", element: <OverviewPage /> },
      { path: "/accounts", element: <AccountsPage /> },
      { path: "/accounts/:id", element: <AccountPage /> },
      { path: "/billing", element: <OrdersPage /> },
      { path: "/ops", element: <OpsPage /> },
      { path: "/audit", element: <AuditPage /> },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
