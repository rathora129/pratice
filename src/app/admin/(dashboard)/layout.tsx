import Link from "next/link";
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
import { AdminNav } from "@/components/admin/admin-nav";
import { logout } from "@/app/actions/auth";
import { requireUser } from "@/lib/auth";
import { can, permissionsFor, roleLabel } from "@/lib/rbac";

export default async function AdminDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireUser();
  const permissions = permissionsFor(user.role);

  const mobileNav = [
    { label: "Overview", href: "/admin", icon: Box, show: true },
    { label: "Products", href: "/admin/products", icon: Layers, show: can(user.role, "products", "read") },
    { label: "Leads", href: "/admin/leads", icon: Mail, show: can(user.role, "leads", "read") },
    { label: "Customers", href: "/admin/customers", icon: Users, show: can(user.role, "customers", "read") },
    { label: "Content", href: "/admin/content", icon: Pencil, show: can(user.role, "content", "read") },
    { label: "Users", href: "/admin/users", icon: Users, show: can(user.role, "users", "read") },
    { label: "Audit", href: "/admin/audit", icon: Scroll, show: can(user.role, "audit", "read") },
  ].filter((item) => item.show);

  return (
    <div className="min-h-screen bg-[#f4f2ee] lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
      <AdminNav
        userName={user.name}
        roleLabel={roleLabel(user.role)}
        permissions={permissions}
      />

      <div className="min-w-0">
        <header className="sticky top-0 z-30 border-b border-ink/10 bg-[#f4f2ee]/90 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <Link href="/admin">
              <BrandMark />
            </Link>
            <div className="flex items-center gap-2">
              <span className="hidden text-[10px] font-semibold text-ink sm:inline">
                {user.name} · {roleLabel(user.role)}
              </span>
              <Link
                href="/"
                target="_blank"
                className="rounded-full border border-ink/15 bg-white px-3 py-1.5 text-[10px] font-semibold text-ink"
              >
                Site
              </Link>
              <form action={logout}>
                <button
                  type="submit"
                  className="grid h-8 w-8 place-items-center rounded-full border border-ink/15 bg-white text-ink-muted"
                  aria-label="Sign out"
                >
                  <Logout className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          </div>
          <nav
            className="flex gap-1 overflow-x-auto px-3 pb-3"
            aria-label="Admin mobile"
          >
            {mobileNav.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-ink/10 bg-white px-3 py-1.5 text-[11px] font-medium text-ink-muted"
                >
                  <Icon className="h-3 w-3" />
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/"
              target="_blank"
              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-ink px-3 py-1.5 text-[11px] font-medium text-white"
            >
              Public site
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </nav>
        </header>

        <main className="px-4 py-6 sm:px-7 sm:py-8 lg:px-9">{children}</main>
      </div>
    </div>
  );
}
