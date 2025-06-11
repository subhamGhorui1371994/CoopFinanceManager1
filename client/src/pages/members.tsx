import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { MemberModal } from "@/components/modals/member-modal";
import { ShieldX, Plus, User, Eye, Edit, UserCog } from "lucide-react";
import { MemberWithOrganization } from "@shared/schema";
import { format } from "date-fns";

export default function Members() {
  const [searchValue, setSearchValue] = useState("");
  const [organizationFilter, setOrganizationFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: members = [], isLoading } = useQuery<MemberWithOrganization[]>({
    queryKey: ["/api/members"],
  });

  const filteredMembers = members.filter((member) => {
    const matchesSearch = member.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchValue.toLowerCase());
    const matchesOrg = organizationFilter === "all" || 
                      (member.organization?.name === organizationFilter);
    const matchesRole = roleFilter === "all" ||
                       (roleFilter === "admin" && (member.isAdmin || member.isSuperAdmin)) ||
                       (roleFilter === "member" && !member.isAdmin && !member.isSuperAdmin);
    return matchesSearch && matchesOrg && matchesRole;
  });

  const uniqueOrganizations = Array.from(
    new Set(members.map(m => m.organization?.name).filter(Boolean))
  );

  const columns = [
    {
      key: "name" as keyof MemberWithOrganization,
      label: "Member",
      render: (value: string, member: MemberWithOrganization) => (
        <div className="flex items-center">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{member.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "organization" as keyof MemberWithOrganization,
      label: "Organization",
      render: (org: any) => (
        <span className="text-sm text-gray-900">
          {org?.name || 'No Organization'}
        </span>
      ),
    },
    {
      key: "isAdmin" as keyof MemberWithOrganization,
      label: "Role",
      render: (value: boolean, member: MemberWithOrganization) => {
        if (member.isSuperAdmin) {
          return <Badge className="bg-red-100 text-red-800">Super Admin</Badge>;
        }
        if (value) {
          return <Badge className="bg-blue-100 text-blue-800">Admin</Badge>;
        }
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Member</Badge>;
      },
    },
    {
      key: "id" as keyof MemberWithOrganization,
      label: "Active Loans",
      render: () => (
        <span className="text-sm font-mono text-gray-900">--</span>
      ),
    },
    {
      key: "id" as keyof MemberWithOrganization,
      label: "Contributions",
      render: () => (
        <div>
          <span className="text-sm font-mono text-green-600">--</span>
          <p className="text-xs text-gray-500">-- months paid</p>
        </div>
      ),
    },
    {
      key: "joinDate" as keyof MemberWithOrganization,
      label: "Join Date",
      render: (value: Date) => (
        <span className="text-sm text-gray-900">
          {format(new Date(value), 'MMM dd, yyyy')}
        </span>
      ),
    },
    {
      key: "isActive" as keyof MemberWithOrganization,
      label: "Status",
      render: (value: boolean) => (
        <Badge 
          variant="secondary" 
          className={value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
        >
          {value ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ];

  const actions = (member: MemberWithOrganization) => (
    <div className="flex space-x-2">
      <Button variant="ghost" size="sm" className="p-1" title="View Profile">
        <Eye className="h-4 w-4 text-gray-400 hover:text-primary" />
      </Button>
      <Button variant="ghost" size="sm" className="p-1" title="Edit Member">
        <Edit className="h-4 w-4 text-gray-400 hover:text-primary" />
      </Button>
      <Button variant="ghost" size="sm" className="p-1" title="Manage Permissions">
        <UserCog className="h-4 w-4 text-gray-400 hover:text-blue-600" />
      </Button>
    </div>
  );

  return (
    <div className="p-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Member Management</h2>
          <p className="text-sm text-gray-500">Manage cooperative members and permissions</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button variant="outline">
            <ShieldX className="mr-2 h-4 w-4" />
            Manage Permissions
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        </div>
      </div>

      {/* Member Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Members</p>
              <p className="text-2xl font-bold text-gray-900 font-mono">{members.length}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Members</p>
              <p className="text-2xl font-bold text-gray-900 font-mono">
                {members.filter(m => m.isActive).length}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <ShieldX className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">New This Month</p>
              <p className="text-2xl font-bold text-gray-900 font-mono">--</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Plus className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Admins</p>
              <p className="text-2xl font-bold text-gray-900 font-mono">
                {members.filter(m => m.isAdmin || m.isSuperAdmin).length}
              </p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <ShieldX className="h-5 w-5 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Members Table */}
      <DataTable
        data={filteredMembers}
        columns={columns}
        searchPlaceholder="Search members..."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        filters={[
          {
            key: "organization",
            label: "All Organizations",
            options: [
              { value: "all", label: "All Organizations" },
              ...uniqueOrganizations.map(org => ({ value: org!, label: org! })),
            ],
            value: organizationFilter,
            onChange: setOrganizationFilter,
          },
          {
            key: "role",
            label: "All Roles",
            options: [
              { value: "all", label: "All Roles" },
              { value: "member", label: "Member" },
              { value: "admin", label: "Admin" },
            ],
            value: roleFilter,
            onChange: setRoleFilter,
          },
        ]}
        actions={actions}
        isLoading={isLoading}
      />

      <MemberModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
      />
    </div>
  );
}
