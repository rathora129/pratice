export const roleKeys = [
  "super_admin",
  "business_owner",
  "website_manager",
  "marketing_manager",
  "sales_manager",
  "sales_executive",
  "production_manager",
  "production_operator",
  "inventory_manager",
  "procurement_manager",
  "quality_manager",
  "accounts_manager",
  "finance_executive",
  "customer_support",
  "customer_portal_user",
] as const;

export type Role = (typeof roleKeys)[number];

export const actionKeys = [
  "read",
  "create",
  "update",
  "delete",
  "approve",
  "publish",
  "export",
  "assign",
  "configure",
] as const;

export type Action = (typeof actionKeys)[number];

export const moduleKeys = [
  "dashboard",
  "products",
  "content",
  "leads",
  "customers",
  "users",
  "audit",
] as const;

export type Module = (typeof moduleKeys)[number];

export type Permission = `${Module}:${Action}`;

const roleLabels: Record<Role, string> = {
  super_admin: "Super Admin",
  business_owner: "Business Owner",
  website_manager: "Website Manager",
  marketing_manager: "Marketing Manager",
  sales_manager: "Sales Manager",
  sales_executive: "Sales Executive",
  production_manager: "Production Manager",
  production_operator: "Production Operator",
  inventory_manager: "Inventory Manager",
  procurement_manager: "Procurement Manager",
  quality_manager: "Quality Manager",
  accounts_manager: "Accounts Manager",
  finance_executive: "Finance Executive",
  customer_support: "Customer Support",
  customer_portal_user: "Customer Portal User",
};

const roleDescriptions: Record<Role, string> = {
  super_admin: "Full platform access, including users and audit.",
  business_owner: "Full commercial access across products, CRM, content and reporting.",
  website_manager: "Publishes the catalogue and the public website.",
  marketing_manager: "Campaign content plus read access to enquiries.",
  sales_manager: "Owns the CRM pipeline, assignments and customer master.",
  sales_executive: "Works assigned enquiries and customer records.",
  production_manager: "Read access to product specifications for the floor.",
  production_operator: "Read-only product specifications.",
  inventory_manager: "Read-only product specifications for stock planning.",
  procurement_manager: "Read-only product specifications for buying.",
  quality_manager: "Read access to specifications and the audit trail.",
  accounts_manager: "Reads customers, leads and exports for billing.",
  finance_executive: "Read-only customer records for collections.",
  customer_support: "Works enquiries and reads customer records.",
  customer_portal_user: "Reserved for the customer portal, not the admin workspace.",
};

function permissions(...values: Permission[]) {
  return values;
}

const matrix: Record<Role, Permission[]> = {
  super_admin: moduleKeys.flatMap((module) =>
    actionKeys.map((action) => `${module}:${action}` as Permission),
  ),
  business_owner: moduleKeys.flatMap((module) =>
    actionKeys.map((action) => `${module}:${action}` as Permission),
  ),
  website_manager: permissions(
    "dashboard:read",
    "products:read",
    "products:update",
    "products:publish",
    "content:read",
    "content:create",
    "content:update",
    "content:publish",
    "content:configure",
    "audit:read",
  ),
  marketing_manager: permissions(
    "dashboard:read",
    "products:read",
    "content:read",
    "content:create",
    "content:update",
    "content:publish",
    "leads:read",
    "leads:create",
    "leads:update",
    "leads:export",
    "customers:read",
  ),
  sales_manager: permissions(
    "dashboard:read",
    "products:read",
    "leads:read",
    "leads:create",
    "leads:update",
    "leads:assign",
    "leads:export",
    "customers:read",
    "customers:create",
    "customers:update",
    "customers:export",
    "audit:read",
  ),
  sales_executive: permissions(
    "dashboard:read",
    "products:read",
    "leads:read",
    "leads:create",
    "leads:update",
    "customers:read",
    "customers:create",
    "customers:update",
  ),
  production_manager: permissions(
    "dashboard:read",
    "products:read",
    "audit:read",
  ),
  production_operator: permissions("dashboard:read", "products:read"),
  inventory_manager: permissions("dashboard:read", "products:read"),
  procurement_manager: permissions("dashboard:read", "products:read"),
  quality_manager: permissions(
    "dashboard:read",
    "products:read",
    "audit:read",
  ),
  accounts_manager: permissions(
    "dashboard:read",
    "leads:read",
    "leads:export",
    "customers:read",
    "customers:export",
    "audit:read",
  ),
  finance_executive: permissions("dashboard:read", "customers:read"),
  customer_support: permissions(
    "dashboard:read",
    "leads:read",
    "leads:update",
    "customers:read",
  ),
  customer_portal_user: permissions(),
};

export function isRole(value: string): value is Role {
  return (roleKeys as readonly string[]).includes(value);
}

export function roleLabel(role: string) {
  return isRole(role) ? roleLabels[role] : role;
}

export function roleDescription(role: string) {
  return isRole(role) ? roleDescriptions[role] : "";
}

export function permissionsFor(role: string): Permission[] {
  return isRole(role) ? matrix[role] : [];
}

export function can(role: string, module: Module, action: Action) {
  if (!isRole(role)) return false;
  return matrix[role].includes(`${module}:${action}`);
}

export function canAny(role: string, checks: Array<[Module, Action]>) {
  return checks.some(([module, action]) => can(role, module, action));
}

export const assignableRoles: Role[] = [
  "super_admin",
  "business_owner",
  "sales_manager",
  "sales_executive",
  "customer_support",
];
