export type AdminRole = "SUPER_ADMIN" | "ADMIN" | "ASSOCIATE" | "AGENT";

export const ADMIN_ROLES: AdminRole[] = ["SUPER_ADMIN", "ADMIN", "ASSOCIATE", "AGENT"];

// Sidebar items each role can see (by title)
const superAdminPermissions = [
  "Home", "Jobs", "Orders", "Shop App", "Registers", "Analytics",
];

const adminPermissions = [
  "Home", "Jobs", "Orders", "Shop App", "Registers",
  // No "Analytics"
];

const associatePermissions = [
  "Home", "Jobs", "Orders", "Shop App", "Registers",
];

const agentPermissions = [
  "Home", "Jobs", "Orders", "Shop App", "Registers",
];

export const rolePermissions: Record<AdminRole, string[]> = {
  SUPER_ADMIN: superAdminPermissions,
  ADMIN: adminPermissions,
  ASSOCIATE: associatePermissions,
  AGENT: agentPermissions,
};

// Routes each role is blocked from accessing (used for direct URL protection)
export const roleBlockedRoutes: Record<AdminRole, string[]> = {
  SUPER_ADMIN: [],
  ADMIN: ["/dashboard/admin/analytics"],
  ASSOCIATE: ["/dashboard/admin/analytics"],
  AGENT: ["/dashboard/admin/analytics"],
};

export function getAdminRole(user: { userType?: string; adminRole?: string } | null): AdminRole | null {
  if (!user) return null;
  if (user.userType !== "ADMIN") return null;
  const role = (user.adminRole || "SUPER_ADMIN").toUpperCase() as AdminRole;
  return ADMIN_ROLES.includes(role) ? role : null;
}
