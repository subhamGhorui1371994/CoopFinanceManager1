import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileBarChart, 
  Download, 
  Building, 
  Users, 
  DollarSign, 
  TrendingUp,
  PieChart,
  Calendar,
  Target
} from "lucide-react";
import { 
  Organization, 
  MemberWithOrganization, 
  LoanWithMember, 
  RepaymentWithLoan, 
  MonthlyContribution 
} from "@shared/schema";

export default function Reports() {
  const { data: organizations = [] } = useQuery<Organization[]>({
    queryKey: ["/api/organizations"],
  });

  const { data: members = [] } = useQuery<MemberWithOrganization[]>({
    queryKey: ["/api/members"],
  });

  const { data: loans = [] } = useQuery<LoanWithMember[]>({
    queryKey: ["/api/loans"],
  });

  const { data: repayments = [] } = useQuery<RepaymentWithLoan[]>({
    queryKey: ["/api/repayments"],
  });

  const { data: contributions = [] } = useQuery<MonthlyContribution[]>({
    queryKey: ["/api/contributions"],
  });

  // Calculate comprehensive statistics
  const reportStats = {
    totalOrganizations: organizations.length,
    totalMembers: members.length,
    activeMembers: members.filter(m => m.isActive).length,
    totalLoans: loans.length,
    activeLoans: loans.filter(l => l.status === 'active').length,
    totalLoanAmount: loans.reduce((sum, l) => sum + parseFloat(l.amount), 0),
    activeLoanAmount: loans.filter(l => l.status === 'active').reduce((sum, l) => sum + parseFloat(l.amount), 0),
    totalRepayments: repayments.length,
    totalRepaymentAmount: repayments.reduce((sum, r) => sum + parseFloat(r.amount), 0),
    totalContributions: contributions.length,
    totalContributionAmount: contributions.reduce((sum, c) => sum + parseFloat(c.amountPaid), 0),
    avgLoanAmount: loans.length > 0 ? loans.reduce((sum, l) => sum + parseFloat(l.amount), 0) / loans.length : 0,
    repaymentRate: loans.length > 0 ? (repayments.length / loans.length) * 100 : 0,
  };

  // Organization-wise breakdown
  const orgBreakdown = organizations.map(org => {
    const orgMembers = members.filter(m => m.organizationId === org.id);
    const orgLoans = loans.filter(l => orgMembers.some(m => m.id === l.memberId));
    const orgRepayments = repayments.filter(r => orgLoans.some(l => l.id === r.loanId));
    const orgContributions = contributions.filter(c => orgMembers.some(m => m.id === c.memberId));

    return {
      organization: org,
      memberCount: orgMembers.length,
      loanCount: orgLoans.length,
      totalLoanAmount: orgLoans.reduce((sum, l) => sum + parseFloat(l.amount), 0),
      repaymentCount: orgRepayments.length,
      totalRepaymentAmount: orgRepayments.reduce((sum, r) => sum + parseFloat(r.amount), 0),
      contributionCount: orgContributions.length,
      totalContributionAmount: orgContributions.reduce((sum, c) => sum + parseFloat(c.amountPaid), 0),
    };
  });

  // Monthly trends (last 6 months)
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return date.toISOString().slice(0, 7);
  }).reverse();

  const monthlyTrends = last6Months.map(month => {
    const monthRepayments = repayments.filter(r => r.paymentMonth === month);
    const monthContributions = contributions.filter(c => c.month === month);
    
    return {
      month,
      repayments: monthRepayments.length,
      repaymentAmount: monthRepayments.reduce((sum, r) => sum + parseFloat(r.amount), 0),
      contributions: monthContributions.length,
      contributionAmount: monthContributions.reduce((sum, c) => sum + parseFloat(c.amountPaid), 0),
    };
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Reports & Analytics</h2>
          <p className="text-sm text-gray-500">Comprehensive financial reports and insights</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Select defaultValue="all">
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Organizations"
          value={reportStats.totalOrganizations}
          icon={Building}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
        />
        
        <StatCard
          title="Active Members"
          value={`${reportStats.activeMembers}/${reportStats.totalMembers}`}
          icon={Users}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
        />
        
        <StatCard
          title="Total Loan Portfolio"
          value={`$${reportStats.totalLoanAmount.toLocaleString()}`}
          icon={DollarSign}
          iconColor="text-yellow-600"
          iconBgColor="bg-yellow-100"
        />
        
        <StatCard
          title="Collection Rate"
          value={`${reportStats.repaymentRate.toFixed(1)}%`}
          icon={Target}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
        />
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="mr-2 h-5 w-5" />
              Financial Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-600">Total Loans Disbursed</span>
                <span className="text-lg font-bold text-gray-900">
                  ${reportStats.totalLoanAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-600">Total Repayments</span>
                <span className="text-lg font-bold text-green-600">
                  ${reportStats.totalRepaymentAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-600">Total Contributions</span>
                <span className="text-lg font-bold text-blue-600">
                  ${reportStats.totalContributionAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-600">Outstanding Amount</span>
                <span className="text-lg font-bold text-yellow-600">
                  ${(reportStats.activeLoanAmount - reportStats.totalRepaymentAmount).toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Loan Portfolio Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average Loan Amount</span>
                <span className="font-mono text-gray-900">
                  ${reportStats.avgLoanAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Loans</span>
                <span className="font-mono text-gray-900">{reportStats.activeLoans}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Completed Loans</span>
                <span className="font-mono text-gray-900">
                  {loans.filter(l => l.status === 'completed').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pending Applications</span>
                <span className="font-mono text-yellow-600">
                  {loans.filter(l => l.status === 'pending').length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Organization-wise Breakdown */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="mr-2 h-5 w-5" />
            Organization-wise Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Organization</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Members</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Loans</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Loan Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Repayments</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Contributions</th>
                </tr>
              </thead>
              <tbody>
                {orgBreakdown.map((org, index) => (
                  <tr key={org.organization.id} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {org.organization.name}
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-900">{org.memberCount}</td>
                    <td className="py-3 px-4 font-mono text-gray-900">{org.loanCount}</td>
                    <td className="py-3 px-4 font-mono text-gray-900">
                      ${org.totalLoanAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono text-green-600">
                      ${org.totalRepaymentAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono text-blue-600">
                      ${org.totalContributionAmount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Monthly Trends (Last 6 Months)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyTrends.map((trend) => (
              <div key={trend.month} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-gray-900">
                    {new Date(trend.month + '-01').toLocaleDateString('en-US', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </h4>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Repayments:</span>
                    <p className="font-mono font-medium">{trend.repayments}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Repayment Amount:</span>
                    <p className="font-mono font-medium text-green-600">
                      ${trend.repaymentAmount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Contributions:</span>
                    <p className="font-mono font-medium">{trend.contributions}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Contribution Amount:</span>
                    <p className="font-mono font-medium text-blue-600">
                      ${trend.contributionAmount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
