import { useQuery } from "@tanstack/react-query";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Users, DollarSign, TrendingUp, CheckCircle, Clock, AlertTriangle } from "lucide-react";

interface Statistics {
  totalOrganizations: number;
  totalMembers: number;
  activeLoans: number;
  totalProfit: number;
  activeLoanAmount: number;
  pendingApplications: number;
  overduePayments: number;
}

export default function Dashboard() {
  const { data: statistics, isLoading } = useQuery<Statistics>({
    queryKey: ["/api/statistics"],
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <p className="text-gray-500">Failed to load statistics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Organizations"
          value={statistics.totalOrganizations}
          icon={Building}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
          change="+2.5%"
          changeType="positive"
        />
        
        <StatCard
          title="Active Members"
          value={statistics.totalMembers.toLocaleString()}
          icon={Users}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
          change="+12.3%"
          changeType="positive"
        />
        
        <StatCard
          title="Active Loans"
          value={`$${statistics.activeLoanAmount.toLocaleString()}`}
          icon={DollarSign}
          iconColor="text-yellow-600"
          iconBgColor="bg-yellow-100"
          change="+8.1%"
          changeType="positive"
        />
        
        <StatCard
          title="Total Profit"
          value={`$${statistics.totalProfit.toLocaleString()}`}
          icon={TrendingUp}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
          change="+15.2%"
          changeType="positive"
        />
      </div>

      {/* Additional Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Active Loans"
          value={statistics.activeLoans}
          icon={CheckCircle}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
          subtitle="Currently active"
        />
        
        <StatCard
          title="Pending Applications"
          value={statistics.pendingApplications}
          icon={Clock}
          iconColor="text-yellow-600"
          iconBgColor="bg-yellow-100"
          subtitle="Awaiting approval"
        />
        
        <StatCard
          title="Overdue Payments"
          value={statistics.overduePayments}
          icon={AlertTriangle}
          iconColor="text-red-600"
          iconBgColor="bg-red-100"
          subtitle="Require attention"
        />
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Loan Overview Chart Placeholder */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Loan Overview</CardTitle>
              <select className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-primary focus:border-primary">
                <option>Last 6 months</option>
                <option>Last 12 months</option>
                <option>This year</option>
              </select>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Chart Component Integration</p>
                  <p className="text-sm text-gray-400">Loan disbursements vs repayments</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">New member registered</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">Loan application submitted</p>
                  <p className="text-xs text-gray-500">5 hours ago</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Building className="h-4 w-4 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">Organization updated</p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">Payment reminder sent</p>
                  <p className="text-xs text-gray-500">2 days ago</p>
                </div>
              </div>
            </div>
            
            <button className="w-full mt-4 text-sm text-primary hover:text-primary/80 font-medium">
              View all activities
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
