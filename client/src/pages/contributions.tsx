import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatCard } from "@/components/ui/stat-card";
import { Plus, PiggyBank, DollarSign, Calendar, Users } from "lucide-react";
import { MonthlyContribution, MemberWithOrganization } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const contributionSchema = z.object({
  memberId: z.number(),
  month: z.string().min(1, "Month is required"),
  amountPaid: z.string().min(1, "Amount is required"),
});

type ContributionForm = z.infer<typeof contributionSchema>;

export default function Contributions() {
  const [searchValue, setSearchValue] = useState("");
  const [monthFilter, setMonthFilter] = useState("all");
  const [showRecordModal, setShowRecordModal] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ContributionForm>({
    resolver: zodResolver(contributionSchema),
    defaultValues: {
      memberId: 0,
      month: new Date().toISOString().slice(0, 7), // YYYY-MM format
      amountPaid: "",
    },
  });

  const { data: contributions = [], isLoading: contributionsLoading } = useQuery<MonthlyContribution[]>({
    queryKey: ["/api/contributions"],
  });

  const { data: members = [], isLoading: membersLoading } = useQuery<MemberWithOrganization[]>({
    queryKey: ["/api/members"],
    select: (data) => data.filter(member => member.isActive),
  });

  const createContributionMutation = useMutation({
    mutationFn: async (data: ContributionForm) => {
      return apiRequest("POST", "/api/contributions", {
        ...data,
        amountPaid: parseFloat(data.amountPaid),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Contribution recorded successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/contributions"] });
      setShowRecordModal(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to record contribution",
        variant: "destructive",
      });
    },
  });

  const filteredContributions = contributions.filter((contribution) => {
    const member = members.find(m => m.id === contribution.memberId);
    const matchesSearch = member?.name.toLowerCase().includes(searchValue.toLowerCase()) || false;
    const matchesMonth = monthFilter === "all" || contribution.month === monthFilter;
    return matchesSearch && matchesMonth;
  });

  const contributionStats = {
    totalContributions: contributions.length,
    totalAmount: contributions.reduce((sum, c) => sum + parseFloat(c.amountPaid), 0),
    thisMonth: contributions.filter(c => c.month === new Date().toISOString().slice(0, 7)).length,
    avgContribution: contributions.length > 0 ? contributions.reduce((sum, c) => sum + parseFloat(c.amountPaid), 0) / contributions.length : 0,
  };

  const uniqueMonths = Array.from(new Set(contributions.map(c => c.month))).sort().reverse();

  const onSubmit = (data: ContributionForm) => {
    createContributionMutation.mutate(data);
  };

  const columns = [
    {
      key: "id" as keyof MonthlyContribution,
      label: "Contribution ID",
      render: (value: number) => (
        <span className="text-sm font-mono text-primary">#CT{value.toString().padStart(6, '0')}</span>
      ),
    },
    {
      key: "memberId" as keyof MonthlyContribution,
      label: "Member",
      render: (memberId: number) => {
        const member = members.find(m => m.id === memberId);
        return (
          <div>
            <p className="text-sm font-medium text-gray-900">{member?.name || 'Unknown Member'}</p>
            <p className="text-xs text-gray-500">{member?.organization?.name || 'No Organization'}</p>
          </div>
        );
      },
    },
    {
      key: "month" as keyof MonthlyContribution,
      label: "Month",
      render: (value: string) => (
        <span className="text-sm text-gray-900">
          {format(new Date(value + '-01'), 'MMM yyyy')}
        </span>
      ),
    },
    {
      key: "amountPaid" as keyof MonthlyContribution,
      label: "Amount",
      render: (value: string) => (
        <span className="text-sm font-mono text-gray-900">${parseFloat(value).toLocaleString()}</span>
      ),
    },
    {
      key: "paidAt" as keyof MonthlyContribution,
      label: "Paid At",
      render: (value: Date) => (
        <span className="text-sm text-gray-900">
          {format(new Date(value), 'MMM dd, yyyy')}
        </span>
      ),
    },
    {
      key: "id" as keyof MonthlyContribution,
      label: "Status",
      render: () => (
        <Badge className="bg-green-100 text-green-800">Paid</Badge>
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Monthly Contributions</h2>
          <p className="text-sm text-gray-500">Track and manage member contributions</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button onClick={() => setShowRecordModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Record Contribution
          </Button>
        </div>
      </div>

      {/* Contribution Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Contributions"
          value={contributionStats.totalContributions}
          icon={PiggyBank}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
        />
        
        <StatCard
          title="Total Amount"
          value={`$${contributionStats.totalAmount.toLocaleString()}`}
          icon={DollarSign}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
        />
        
        <StatCard
          title="This Month"
          value={contributionStats.thisMonth}
          icon={Calendar}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
        />
        
        <StatCard
          title="Average Amount"
          value={`$${contributionStats.avgContribution.toLocaleString()}`}
          icon={Users}
          iconColor="text-yellow-600"
          iconBgColor="bg-yellow-100"
        />
      </div>

      {/* Contributions Table */}
      <DataTable
        data={filteredContributions}
        columns={columns}
        searchPlaceholder="Search contributions..."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        filters={[
          {
            key: "month",
            label: "All Months",
            options: [
              { value: "all", label: "All Months" },
              ...uniqueMonths.map(month => ({
                value: month,
                label: format(new Date(month + '-01'), 'MMM yyyy')
              })),
            ],
            value: monthFilter,
            onChange: setMonthFilter,
          },
        ]}
        isLoading={contributionsLoading}
      />

      {/* Record Contribution Modal */}
      <Dialog open={showRecordModal} onOpenChange={setShowRecordModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Contribution</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="memberId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Member</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      disabled={membersLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select member..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {members.map((member) => (
                          <SelectItem key={member.id} value={member.id.toString()}>
                            {member.name} - {member.organization?.name || 'No Organization'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="month"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contribution Month</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="month"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amountPaid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <Input 
                          {...field} 
                          type="number" 
                          className="pl-8" 
                          placeholder="0.00"
                          min="0.01"
                          step="0.01"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <Button type="button" variant="outline" onClick={() => setShowRecordModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createContributionMutation.isPending}>
                  {createContributionMutation.isPending ? "Recording..." : "Record Contribution"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
