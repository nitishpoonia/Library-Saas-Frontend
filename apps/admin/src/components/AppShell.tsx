import clsx from "clsx";
import { useSyncExternalStore } from "react";
import { NavLink, Navigate, Outlet, useLocation } from "react-router";
import { logout } from "../api/admin";
import { readSession, subscribeSession } from "../api/client";

/** The logged-in admin, re-rendering on login and logout. */
export function useSession() {
  return useSyncExternalStore(subscribeSession, readSession, () => null);
}

const NAV = [
  { to: "/", label: "Overview", end: true },
  { to: "/accounts", label: "Accounts" },
  { to: "/billing", label: "Payments" },
  { to: "/ops", label: "Daily job and texts" },
  { to: "/audit", label: "Audit log" },
];

/** Sidebar layout for every page after login. Sends anyone without a session to /login. */
export function AppShell() {
  const session = useSession();
  const location = useLocation();
  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  return (
    <div className="min-h-screen md:grid md:grid-cols-[232px_1fr]">
      <aside className="border-b border-line bg-surface md:min-h-screen md:border-r md:border-b-0">
        <div className="flex items-center justify-between px-5 py-4 md:block">
          <p className="font-display text-base font-semibold">Library SaaS admin</p>
          <p className="hidden text-xs text-quiet md:mt-0.5 md:block">{session.admin.email}</p>
          <button className="text-sm text-quiet hover:text-ink md:hidden" onClick={() => void logout()}>
            Log out
          </button>
        </div>
        <nav aria-label="Main" className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:pb-0">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                clsx(
                  "rounded-md px-3 py-2 text-sm whitespace-nowrap",
                  isActive ? "bg-brand-soft font-medium text-brand-strong" : "text-quiet hover:bg-paper hover:text-ink",
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden px-3 pt-6 md:block">
          <button className="rounded-md px-3 py-2 text-sm text-quiet hover:bg-paper hover:text-ink" onClick={() => void logout()}>
            Log out
          </button>
        </div>
      </aside>
      <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-10">
        <Outlet />
      </main>
    </div>
  );
}
