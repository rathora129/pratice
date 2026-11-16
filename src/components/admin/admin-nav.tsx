"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
import {
  ArrowUpRight,
  Box,
  Layers,
  Logout,
  Mail,
  Pencil,
  Scroll,
  Users,
} from "@/components/icons";
import { logout } from "@/app/actions/auth";
import { cn } from "@/lib/utils";
import type { Permission } from "@/lib/rbac";

type NavItem = {
  label: string;
  href: string;
  icon: typeof Box;
  permission?: Permission;
};

const workspace: NavItem[] = [
  { label: "Overview", href: "/admin", icon: Box, permission: "dashboard:read" },
  { label: "Products", href: "/admin/products", icon: Layers, permission: "products:read" },
  { label: "Leads", href: "/admin/leads", icon: Mail, permission: "leads:read" },
  { label: "Customers", href: "/admin/customers", icon: Users, permission: "customers:read" },
  { label: "Website content", href: "/admin/content", icon: Pencil, permission: "content:read" },
];

const administration: NavItem[] = [
  { label: "Users & roles", href: "/admin/users", icon: Users, permission: "users:read" },
  { label: "Audit log", href: "/admin/audit", icon: Scroll, permission: "audit:read" },
];

export function AdminNav({
  userName,
  roleLabel,
  permissions,
}: {
  userName: string;
  roleLabel: string;
  permissions: Permission[];
}) {
  const pathname = usePathname();
  const allowed = (item: NavItem) =>
    !item.permission || permissions.includes(item.permission);
  const firstName = userName.split(/\s+/)[0];

  const renderItem = (item: NavItem) => {
    const active =
      item.href === "/admin"
        ? pathname === "/admin"
        : pathname.startsWith(item.href);
    const Icon = item.icon;

    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition",
          active
            ? "bg-white/10 text-white"
            : "text-white/55 hover:bg-white/5 hover:text-white",
        )}
      >
        <Icon className="h-4 w-4" />
        {item.label}
        {active && (
          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-400" />
        )}
      </Link>
    );
  };

  const visibleWorkspace = workspace.filter(allowed);
  const visibleAdmin = administration.filter(allowed);

  return (
    <aside className="hidden border-r border-white/10 bg-ink text-white lg:flex lg:h-screen lg:flex-col lg:sticky lg:top-0">
      <div className="border-b border-white/10 px-5 py-5">
        <Link href="/admin" aria-label="Admin home">
          <BrandMark inverted />
        </Link>
        <div className="mt-4 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
          <p className="truncate text-[12px] font-semibold text-white">
            {userName}
          </p>
          <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-brand-300">
            {roleLabel}
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5" aria-label="Admin">
        {visibleWorkspace.length > 0 && (
          <p className="px-3 pb-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/30">
            Workspace
          </p>
        )}
        {visibleWorkspace.map(renderItem)}

        {visibleAdmin.length > 0 && (
          <>
            <p className="px-3 pb-2 pt-5 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/30">
              Administration
            </p>
            {visibleAdmin.map(renderItem)}
          </>
        )}
      </nav>

      <div className="border-t border-white/10 p-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between rounded-xl px-3 py-2.5 text-[12px] text-white/55 transition hover:bg-white/5 hover:text-white"
        >
          View public site
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[12px] text-white/45 transition hover:bg-white/5 hover:text-white"
          >
            <Logout className="h-3.5 w-3.5" />
            Sign out {firstName ? `· ${firstName}` : ""}
          </button>
        </form>
        <p className="px-3 pt-2 text-[9px] leading-4 text-white/25">
          Permissions are enforced on the server for every action.
        </p>
      </div>
    </aside>
  );
}
