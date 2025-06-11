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
import { Plus, Receipt, DollarSign, Calendar, TrendingUp } from "lucide-react";
import { RepaymentWithLoan, LoanWithMember } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const repaymentSchema = z.object({
  loanId: z.number(),
  amount: z.string().min(1, "Amount is required"),
  paymentMonth: z.string().min(1, "Payment month is required"),
});

type RepaymentForm = z.infer<typeof repaymentSchema>;

export default function Repayments() {
  const [searchValue, setSearchValue] = useState("");
  const [showRecordModal, setShowRecordModal] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<RepaymentForm>({
    resolver: zodResolver(repaymentSchema),
    defaultValues: {
      loanId: 0,
      amount: "",
      paymentMonth: new Date().toISOString().slice(0, 7), // YYYY-MM format
    },
  });

  const { data: repayments = [], isLoading: repaymentsLoading } = useQuery<RepaymentWithLoan[]>({
    queryKey: ["/api/repayments"],
  });

  const { data: activeLoans = [], isLoading: loansLoading } = useQuery<LoanWithMember[]>({
    queryKey: ["/api/loans"],
    select: (data) => data.filter(loan => loan.status === 'active'),
  });

  const createRepaymentMutation = useMutation({
    mutationFn: async (data: RepaymentForm) => {
      return apiRequest("POST", "/api/repayments", {
        ...data,
        amount: parseFloat(data.amount),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Repayment recorded successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/repayments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/loans"] });
      setShowRecordModal(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to record repayment",
        variant: "destructive",
      });
    },
  });

  const filteredRepayments = repayments.filter((repayment) => {
    const matchesSearch = 
      repayment.loan.member.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      repayment.loan.id.toString().includes(searchValue);
    return matchesSearch;
  });

  const repaymentStats = {
    totalPayments: repayments.length,
    totalAmount: repayments.reduce((sum, r) => sum + parseFloat(r.amount), 0),
    thisMonth: repayments.filter(r => r.paymentMonth === new Date().toISOString().slice(0, 7)).length,
    avgPayment: repayments.length > 0 ? repayments.reduce((sum, r) => sum + parseFloat(r.amount), 0) / repayments.length : 0,
  };

  const onSubmit = (data: RepaymentForm) => {
    createRepaymentMutation.mutate(data);
  };

  const columns = [
    {
      key: "id" as keyof RepaymentWithLoan,
      label: "Payment ID",
      render: (value: number) => (
        <span className="text-sm font-mono text-primary">#RP{value.toString().padStart(6, '0')}</span>
      ),
    },
    {
      key: "loan" as keyof RepaymentWithLoan,
      label: "Loan & Member",
      render: (loan: any) => (
        <div>
          <p className="text-sm font-medium text-gray-900">
            Loan #LN{loan.id.toString().padStart(6, '0')}
          </p>
          <p className="text-xs text-gray-500">{loan.member.name}</p>
        </div>
      ),
    },
    {
      key: "amount" as keyof RepaymentWithLoan,
      label: "Amount",
      render: (value: string) => (
        <span className="text-sm font-mono text-gray-900">${parseFloat(value).toLocaleString()}</span>
      ),
    },
    {
      key: "paymentMonth" as keyof RepaymentWithLoan,
      label: "Payment Month",
      render: (value: string) => (
        <span className="text-sm text-gray-900">
          {format(new Date(value + '-01'), 'MMM yyyy')}
        </span>
      ),
    },
    {
      key: "paidAt" as keyof RepaymentWithLoan,
      label: "Paid At",
      render: (value: Date) => (
        <span className="text-sm text-gray-900">
          {format(new Date(value), 'MMM dd, yyyy')}
        </span>
      ),
    },
    {
      key: "loan" as keyof RepaymentWithLoan,
      label: "Organization",
      render: (loan: any) => (
        <span className="text-sm text-gray-900">
          {loan.member.organization?.name || 'No Organization'}
        </span>
      ),
    },
    {
      key: "id" as keyof RepaymentWithLoan,
      label: "Status",
      render: () => (
        <Badge className="bg-green-100 text-green-800">Completed</Badge>
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Repayment Management</h2>
          <p className="text-sm text-gray-500">Track and manage loan repayments</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button onClick={() => setShowRecordModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Record Payment
          </Button>
        </div>
      </div>

      {/* Repayment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Payments"
          value={repaymentStats.totalPayments}
          icon={Receipt}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
        />
        
        <StatCard
          title="Total Amount"
          value={`$${repaymentStats.totalAmount.toLocaleString()}`}
          icon={DollarSign}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
        />
        
        <StatCard
          title="This Month"
          value={repaymentStats.thisMonth}
          icon={Calendar}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
        />
        
        <StatCard
          title="Average Payment"
          value={`$${repaymentStats.avgPayment.toLocaleString()}`}
          icon={TrendingUp}
          iconColor="text-yellow-600"
          iconBgColor="bg-yellow-100"
        />
      </div>

      {/* Repayments Table */}
      <DataTable
        data={filteredRepayments}
        columns={columns}
        searchPlaceholder="Search repayments..."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        isLoading={repaymentsLoading}
      />

      {/* Record Payment Modal */}
      <Dialog open={showRecordModal} onOpenChange={setShowRecordModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="loanId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loan</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      disabled={loansLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select loan..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {activeLoans.map((loan) => (
                          <SelectItem key={loan.id} value={loan.id.toString()}>
                            #LN{loan.id.toString().padStart(6, '0')} - {loan.member.name} 
                            (${parseFloat(loan.remainingBalance).toLocaleString()} remaining)
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
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Amount</FormLabel>
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

              <FormField
                control={form.control}
                name="paymentMonth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Month</FormLabel>
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

              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <Button type="button" variant="outline" onClick={() => setShowRecordModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createRepaymentMutation.isPending}>
                  {createRepaymentMutation.isPending ? "Recording..." : "Record Payment"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
