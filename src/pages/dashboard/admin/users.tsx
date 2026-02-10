import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, X } from "lucide-react";

// --- Interfaces and Data (No changes needed here) ---

interface Permission {
  view: boolean;
  add: boolean;
  edit: boolean;
  approve: boolean;
  delete: boolean;
}

interface RolePermissions {
  SuperAdmin: Permission;
  Admin: Permission;
  Member: Permission;
  Agent: Permission;
}

interface Resource {
  name: string;
  permissions: RolePermissions;
}

const initialResources: Resource[] = [
  {
    name: "Products",
    permissions: {
      SuperAdmin: { view: true, add: true, edit: true, approve: true, delete: true },
      Admin: { view: true, add: true, edit: true, approve: false, delete: false },
      Member: { view: true, add: false, edit: false, approve: false, delete: false },
      Agent: { view: true, add: true, edit: false, approve: false, delete: false }
    }
  },
  {
    name: "Customers",
    permissions: {
      SuperAdmin: { view: true, add: false, edit: false, approve: false, delete: false },
      Admin: { view: true, add: false, edit: false, approve: false, delete: false },
      Member: { view: true, add: false, edit: false, approve: false, delete: false },
      Agent: { view: true, add: false, edit: false, approve: false, delete: false }
    }
  },
  {
    name: "Categories",
    permissions: {
      SuperAdmin: { view: true, add: true, edit: true, approve: true, delete: true },
      Admin: { view: true, add: true, edit: true, approve: false, delete: false },
      Member: { view: true, add: false, edit: false, approve: false, delete: false },
      Agent: { view: true, add: false, edit: false, approve: false, delete: false }
    }
  },
  {
    name: "Attributes",
    permissions: {
      SuperAdmin: { view: true, add: true, edit: true, approve: true, delete: true },
      Admin: { view: true, add: true, edit: true, approve: false, delete: false },
      Member: { view: true, add: false, edit: false, approve: false, delete: false },
      Agent: { view: true, add: false, edit: false, approve: false, delete: false }
    }
  },
  {
    name: "Regions",
    permissions: {
      SuperAdmin: { view: true, add: true, edit: true, approve: true, delete: true },
      Admin: { view: true, add: true, edit: true, approve: false, delete: false },
      Member: { view: true, add: false, edit: false, approve: false, delete: false },
      Agent: { view: true, add: false, edit: false, approve: false, delete: false }
    }
  }
];

const roles = ["SuperAdmin", "Admin", "Member", "Agent"] as const;
const permissions = ["View", "Add", "Edit", "Approve", "Delete"] as const;
type PermissionType = "view" | "add" | "edit" | "approve" | "delete";

const PermissionIcon = ({ allowed }: { allowed: boolean }) => {
  if (allowed) {
    return (
      <div className="w-8 h-8 rounded bg-green-100 flex items-center justify-center">
        <Check className="w-4 h-4 text-green-600" />
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded bg-red-100 flex items-center justify-center">
      <X className="w-4 h-4 text-red-600" />
    </div>
  );
};

// --- Main Component ---
export default function UsersAdmin() {
  const [activeRoles, setActiveRoles] = useState<string[]>(["SuperAdmin", "Admin", "Member", "Agent"]);
  const [resourceFilter, setResourceFilter] = useState("");

  // State for the simulation section
  const [simulateRole, setSimulateRole] = useState<keyof RolePermissions>("SuperAdmin");
  const [simulateResource, setSimulateResource] = useState("Products");
  const [simulationResult, setSimulationResult] = useState<boolean | null>(null);
  const [lastCheck, setLastCheck] = useState("");

  const toggleRole = (role: string) => {
    setActiveRoles(prev =>
      prev.includes(role)
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const filteredResources = initialResources.filter(resource =>
    resource.name.toLowerCase().includes(resourceFilter.toLowerCase())
  );

  // --- NEW: Function to handle the permission check ---
  const handlePermissionCheck = (permission: typeof permissions[number]) => {
    const permissionKey = permission.toLowerCase() as PermissionType;

    const resourceData = initialResources.find(
      (r) => r.name.toLowerCase() === simulateResource.toLowerCase()
    );

    if (resourceData) {
      const isAllowed = resourceData.permissions[simulateRole][permissionKey];
      setSimulationResult(isAllowed);
      setLastCheck(`Can ${simulateRole} ${permission} ${simulateResource}?`);
    } else {
      setSimulationResult(false); // Default to not allowed if resource not found
    }
  };

  return (
    <div className="bg-background p-8 rounded-xl shadow-sm border border-border">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        {/* ... (no changes here) ... */}
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-medium text-foreground">ShopApp — User Management / RBAC</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-sm text-foreground">Allowed</span>
            </div>
            <div className="flex items-center gap-2">
              <X className="w-4 h-4 text-red-600" />
              <span className="text-sm text-foreground">Denied</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Copy RBAC JSON</Button>
          <Button variant="outline" size="sm">Download RBAC JSON</Button>
        </div>
      </div>

      {/* Role Filters */}
      <div className="flex items-center gap-4 mb-6">
        <span className="text-sm text-muted-foreground">Show roles:</span>
        {roles.map(role => (
          <Button
            key={role}
            variant={activeRoles.includes(role) ? "default" : "outline"}
            size="sm"
            onClick={() => toggleRole(role)}
            className="text-sm"
          >
            {role}
          </Button>
        ))}
        <span className="text-sm text-muted-foreground ml-4">Filter resources:</span>
        <Input
          placeholder="e.g. prod, cat, reg..."
          value={resourceFilter}
          onChange={(e) => setResourceFilter(e.target.value)}
          className="w-48"
        />
      </div>

      {/* Permissions Table (No changes here, just fixed the type assertion) */}
      <div className="border border-border rounded-lg overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* ... thead ... */}
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-4 font-medium text-sm text-foreground border-r border-border">Resource</th>
                {activeRoles.map(role => (
                  <th key={role} className="text-center p-4 font-medium text-sm text-foreground border-r border-border" colSpan={5}>
                    {role}
                  </th>
                ))}
              </tr>
              <tr className="bg-muted border-t border-border">
                <td className="p-4 border-r border-border"></td>
                {activeRoles.map(role => (
                  <React.Fragment key={role}>
                    {permissions.map(permission => (
                      <td key={`${role}-${permission}`} className="text-center p-2 text-xs text-muted-foreground border-r border-border">
                        {permission}
                      </td>
                    ))}
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredResources.map((resource, index) => (
                <tr key={resource.name} className={index % 2 === 0 ? "bg-background" : "bg-muted/30"}>
                  <td className="p-4 font-medium text-sm text-foreground border-r border-border">{resource.name}</td>
                  {activeRoles.map(role => (
                    <React.Fragment key={role}>
                      <td className="text-center p-2 border-r border-border"><PermissionIcon allowed={resource.permissions[role as keyof RolePermissions].view} /></td>
                      <td className="text-center p-2 border-r border-border"><PermissionIcon allowed={resource.permissions[role as keyof RolePermissions].add} /></td>
                      <td className="text-center p-2 border-r border-border"><PermissionIcon allowed={resource.permissions[role as keyof RolePermissions].edit} /></td>
                      <td className="text-center p-2 border-r border-border"><PermissionIcon allowed={resource.permissions[role as keyof RolePermissions].approve} /></td>
                      <td className="text-center p-2 border-r border-border"><PermissionIcon allowed={resource.permissions[role as keyof ].delete} /></td>
                    </React.Fragment>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- GUARDS SECTION (MAJOR CHANGES HERE) --- */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium text-foreground">Guards</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-foreground">Simulate as role:</span>
            <Select value={simulateRole} onValueChange={(value) => setSimulateRole(value as keyof RolePermissions)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roles.map(role => <SelectItem key={role} value={role}>{role}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <span className="text-sm text-foreground">Resource:</span>
            <Select value={simulateResource} onValueChange={setSimulateResource}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {initialResources.map(res => (
                  <SelectItem key={res.name} value={res.name}>{res.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            {permissions.map(permission => (
              <Button
                key={permission}
                variant="outline"
                size="sm"
                onClick={() => handlePermissionCheck(permission)} // ADDED: onClick handler
              >
                Check {permission}
              </Button>
            ))}
          </div>

          {/* ADDED: Display for the simulation result */}
          {simulationResult !== null && (
            <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
              <span className="text-sm font-mono">{lastCheck}</span>
              <PermissionIcon allowed={simulationResult} />
              <span className={`font-semibold text-sm ${simulationResult ? 'text-green-600' : 'text-red-600'}`}>
                {simulationResult ? 'Allowed' : 'Denied'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
    
  );
}