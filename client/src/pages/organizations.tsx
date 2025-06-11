import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { OrganizationModal } from "@/components/modals/organization-modal";
import { Download, Plus, Building, GraduationCap, Eye, Edit, Trash2 } from "lucide-react";
import { Organization } from "@shared/schema";
import { format } from "date-fns";

export default function Organizations() {
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: organizations = [], isLoading } = useQuery<Organization[]>({
    queryKey: ["/api/organizations"],
  });

  const filteredOrganizations = organizations.filter((org) => {
    const matchesSearch = org.name.toLowerCase().includes(searchValue.toLowerCase());
    // For now, all organizations are active
    const matchesStatus = statusFilter === "all" || statusFilter === "active";
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      key: "name" as keyof Organization,
      label: "Organization",
      render: (value: string, org: Organization) => (
        <div className="flex items-center">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
            {org.name.toLowerCase().includes('high') || org.name.toLowerCase().includes('university') ? (
              <GraduationCap className="h-5 w-5 text-primary" />
            ) : (
              <Building className="h-5 w-5 text-primary" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">
              Created {format(new Date(org.createdAt), 'MMM dd, yyyy')}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "id" as keyof Organization,
      label: "Members",
      render: () => (
        <span className="text-sm font-mono text-gray-900">--</span>
      ),
    },
    {
      key: "id" as keyof Organization,
      label: "Active Loans",
      render: () => (
        <span className="text-sm font-mono text-gray-900">--</span>
      ),
    },
    {
      key: "id" as keyof Organization,
      label: "Total Contributions",
      render: () => (
        <span className="text-sm font-mono text-gray-900">--</span>
      ),
    },
    {
      key: "id" as keyof Organization,
      label: "Status",
      render: () => (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          Active
        </Badge>
      ),
    },
  ];

  const actions = (org: Organization) => (
    <div className="flex space-x-2">
      <Button variant="ghost" size="sm" className="p-1">
        <Eye className="h-4 w-4 text-gray-400 hover:text-primary" />
      </Button>
      <Button variant="ghost" size="sm" className="p-1">
        <Edit className="h-4 w-4 text-gray-400 hover:text-primary" />
      </Button>
      <Button variant="ghost" size="sm" className="p-1">
        <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-600" />
      </Button>
    </div>
  );

  return (
    <div className="p-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Organizations</h2>
          <p className="text-sm text-gray-500">Manage cooperative organizations</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Organization
          </Button>
        </div>
      </div>

      {/* Organizations Table */}
      <DataTable
        data={filteredOrganizations}
        columns={columns}
        searchPlaceholder="Search organizations..."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        filters={[
          {
            key: "status",
            label: "All Status",
            options: [
              { value: "all", label: "All Status" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ],
            value: statusFilter,
            onChange: setStatusFilter,
          },
        ]}
        actions={actions}
        isLoading={isLoading}
      />

      <OrganizationModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
      />
    </div>
  );
}
