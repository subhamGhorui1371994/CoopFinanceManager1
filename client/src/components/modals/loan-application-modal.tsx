import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { MemberWithOrganization } from "@shared/schema";

const loanApplicationSchema = z.object({
  memberId: z.number(),
  amount: z.string().min(1, "Amount is required"),
  termMonths: z.number().min(1).max(100),
  interestRate: z.string().min(1, "Interest rate is required"),
  purpose: z.string().min(1, "Purpose is required"),
});

type LoanApplicationForm = z.infer<typeof loanApplicationSchema>;

interface LoanApplicationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoanApplicationModal({ open, onOpenChange }: LoanApplicationModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loanCalculation, setLoanCalculation] = useState({
    monthlyPayment: 0,
    totalInterest: 0,
    totalAmount: 0,
    firstPaymentDate: '',
  });

  const form = useForm<LoanApplicationForm>({
    resolver: zodResolver(loanApplicationSchema),
    defaultValues: {
      memberId: 0,
      amount: "",
      termMonths: 12,
      interestRate: "",
      purpose: "",
    },
  });

  const { data: members = [], isLoading: membersLoading } = useQuery<MemberWithOrganization[]>({
    queryKey: ["/api/members"],
    enabled: open,
  });

  const createLoanMutation = useMutation({
    mutationFn: async (data: LoanApplicationForm) => {
      return apiRequest("POST", "/api/loans", {
        ...data,
        amount: parseFloat(data.amount),
        interestRate: parseFloat(data.interestRate),
        status: "pending",
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Loan application created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/loans"] });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create loan application",
        variant: "destructive",
      });
    },
  });

  const calculateLoan = () => {
    const amount = parseFloat(form.watch("amount")) || 0;
    const term = form.watch("termMonths") || 0;
    const rate = parseFloat(form.watch("interestRate")) || 0;

    if (amount && term && rate) {
      const monthlyRate = rate / 100 / 12;
      const monthlyPayment = amount * (monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1);
      const totalAmount = monthlyPayment * term;
      const totalInterest = totalAmount - amount;
      
      const firstPaymentDate = new Date();
      firstPaymentDate.setMonth(firstPaymentDate.getMonth() + 1);

      setLoanCalculation({
        monthlyPayment,
        totalInterest,
        totalAmount,
        firstPaymentDate: firstPaymentDate.toLocaleDateString(),
      });
    }
  };

  const onSubmit = (data: LoanApplicationForm) => {
    createLoanMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Loan Application</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loan Amount</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <Input 
                          {...field} 
                          type="number" 
                          className="pl-8" 
                          placeholder="0.00"
                          min="100"
                          max="100000"
                          onChange={(e) => {
                            field.onChange(e);
                            setTimeout(calculateLoan, 100);
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="termMonths"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loan Term (Months)</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(parseInt(value));
                        setTimeout(calculateLoan, 100);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select term..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="12">12 months</SelectItem>
                        <SelectItem value="24">24 months</SelectItem>
                        <SelectItem value="36">36 months</SelectItem>
                        <SelectItem value="48">48 months</SelectItem>
                        <SelectItem value="60">60 months</SelectItem>
                        <SelectItem value="100">100 months (Max)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="interestRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interest Rate (%)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        placeholder="8.5"
                        min="1"
                        max="20"
                        step="0.1"
                        onChange={(e) => {
                          field.onChange(e);
                          setTimeout(calculateLoan, 100);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purpose of Loan</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      rows={3}
                      placeholder="Describe the purpose of this loan..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Loan Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Loan Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Payment:</span>
                  <span className="font-mono text-gray-900">
                    ${loanCalculation.monthlyPayment.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Interest:</span>
                  <span className="font-mono text-gray-900">
                    ${loanCalculation.totalInterest.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-mono text-gray-900">
                    ${loanCalculation.totalAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">First Payment Due:</span>
                  <span className="font-mono text-gray-900">
                    {loanCalculation.firstPaymentDate || '-'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createLoanMutation.isPending}>
                {createLoanMutation.isPending ? "Creating..." : "Create Loan Application"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
