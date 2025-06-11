import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LoanApplicationModal } from "@/components/modals/loan-application-modal";
import { StatCard } from "@/components/ui/stat-card";
import { Filter, Plus, HandHeart, CheckCircle, Clock, AlertTriangle, Eye, DollarSign, Bell } from "lucide-react";
import { LoanWithMember } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function Loans() {
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: loans = [], isLoading } = useQuery<LoanWithMember[]>({
    queryKey: ["/api/loans"],
  });

  const updateLoanStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest("PATCH", `/api/loans/${id}/status`, { status });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Loan status updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/loans"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update loan status",
        variant: "destructive",
      });
    },
  });

  const filteredLoans = loans.filter((loan) => {
    const matchesSearch = 
      loan.member.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      loan.id.toString().includes(searchValue);
    const matchesStatus = statusFilter === "all" || loan.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const loanStats = {
    total: loans.length,
    active: loans.filter(l => l.status === 'active').length,
    pending: loans.filter(l => l.status === 'pending').length,
    overdue: loans.filter(l => l.status === 'overdue').length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
      case 'rejected':
        return <Badge className="bg-gray-100 text-gray-800">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const calculateProgress = (loan: LoanWithMember) => {
    const remaining = parseFloat(loan.remainingBalance);
    const total = parseFloat(loan.amount);
    return Math.round(((total - remaining) / total) * 100);
  };

  const columns = [
    {
      key: "id" as keyof LoanWithMember,
      label: "Loan ID",
      render: (value: number) => (
        <span className="text-sm font-mono text-primary">#LN{value.toString().padStart(6, '0')}</span>
      ),
    },
    {
      key: "member" as keyof LoanWithMember,
      label: "Member",
      render: (member: any) => (
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
            <span className="text-gray-500 text-xs font-medium">
              {member.name.split(' ').map((n: string) => n[0]).join('')}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{member.name}</p>
            <p className="text-xs text-gray-500">{member.organization?.name || 'No Organization'}</p>
          </div>
        </div>
      ),
    },
    {
      key: "amount" as keyof LoanWithMember,
      label: "Amount",
      render: (value: string) => (
        <span className="text-sm font-mono text-gray-900">${parseFloat(value).toLocaleString()}</span>
      ),
    },
    {
      key: "termMonths" as keyof LoanWithMember,
      label: "Term",
      render: (value: number) => (
        <span className="text-sm text-gray-900">{value} months</span>
      ),
    },
    {
      key: "interestRate" as keyof LoanWithMember,
      label: "Interest Rate",
      render: (value: string) => (
        <span className="text-sm font-mono text-gray-900">{value}%</span>
      ),
    },
    {
      key: "remainingBalance" as keyof LoanWithMember,
      label: "Remaining",
      render: (value: string, loan: LoanWithMember) => {
        const progress = calculateProgress(loan);
        const remaining = parseFloat(value);
        return (
          <div>
            <span className={`text-sm font-mono ${remaining > 0 ? 'text-gray-900' : 'text-green-600'}`}>
              ${remaining.toLocaleString()}
            </span>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
              <div 
                className="bg-primary h-1.5 rounded-full" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        );
      },
    },
    {
      key: "status" as keyof LoanWithMember,
      label: "Status",
      render: (value: string) => getStatusBadge(value),
    },
  ];

  const actions = (loan: LoanWithMember) => (
    <div className="flex space-x-2">
      <Button variant="ghost" size="sm" className="p-1" title="View Details">
        <Eye className="h-4 w-4 text-gray-400 hover:text-primary" />
      </Button>
      {loan.status === 'pending' && (
        <>
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-1" 
            title="Approve Loan"
            onClick={() => updateLoanStatusMutation.mutate({ id: loan.id, status: 'active' })}
          >
            <CheckCircle className="h-4 w-4 text-gray-400 hover:text-green-600" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-1" 
            title="Reject Loan"
            onClick={() => updateLoanStatusMutation.mutate({ id: loan.id, status: 'rejected' })}
          >
            <AlertTriangle className="h-4 w-4 text-gray-400 hover:text-red-600" />
          </Button>
        </>
      )}
      {loan.status === 'active' && (
        <Button variant="ghost" size="sm" className="p-1" title="Record Payment">
          <DollarSign className="h-4 w-4 text-gray-400 hover:text-green-600" />
        </Button>
      )}
      <Button variant="ghost" size="sm" className="p-1" title="Send Reminder">
        <Bell className="h-4 w-4 text-gray-400 hover:text-yellow-600" />
      </Button>
    </div>
  );

  return (
    <div className="p-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Loan Management</h2>
          <p className="text-sm text-gray-500">Manage member loans and applications</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button onClick={() => setShowApplicationModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Loan Application
          </Button>
        </div>
      </div>

      {/* Loan Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Loans"
          value={loanStats.total}
          icon={HandHeart}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
        />
        
        <StatCard
          title="Active Loans"
          value={loanStats.active}
          icon={CheckCircle}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
        />
        
        <StatCard
          title="Pending Applications"
          value={loanStats.pending}
          icon={Clock}
          iconColor="text-yellow-600"
          iconBgColor="bg-yellow-100"
        />
        
        <StatCard
          title="Overdue Payments"
          value={loanStats.overdue}
          icon={AlertTriangle}
          iconColor="text-red-600"
          iconBgColor="bg-red-100"
        />
      </div>

      {/* Loans Table */}
      <DataTable
        data={filteredLoans}
        columns={columns}
        searchPlaceholder="Search loans..."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        filters={[
          {
            key: "status",
            label: "All Status",
            options: [
              { value: "all", label: "All Status" },
              { value: "active", label: "Active" },
              { value: "pending", label: "Pending" },
              { value: "completed", label: "Completed" },
              { value: "overdue", label: "Overdue" },
              { value: "rejected", label: "Rejected" },
            ],
            value: statusFilter,
            onChange: setStatusFilter,
          },
        ]}
        actions={actions}
        isLoading={isLoading}
      />

      <LoanApplicationModal
        open={showApplicationModal}
        onOpenChange={setShowApplicationModal}
      />
    </div>
  );
}
