import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { isAuthenticated, getCurrentUser } from "@/lib/auth";

// Import pages
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Organizations from "@/pages/organizations";
import Members from "@/pages/members";
import Loans from "@/pages/loans";
import Repayments from "@/pages/repayments";
import Contributions from "@/pages/contributions";
import Reports from "@/pages/reports";
import NotFound from "@/pages/not-found";

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  if (!isAuthenticated()) {
    return <Redirect to="/login" />;
  }

  const currentUser = getCurrentUser();
  if (adminOnly && currentUser && !currentUser.isAdmin && !currentUser.isSuperAdmin) {
    return <Redirect to="/" />;
  }

  return <>{children}</>;
}

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

function Layout({ children, title, subtitle }: LayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={title} subtitle={subtitle} />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/login" component={Login} />
      
      {/* Protected routes */}
      <Route path="/">
        {() => (
          <ProtectedRoute>
            <Layout title="Dashboard" subtitle="Overview of your cooperative system">
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/organizations">
        {() => (
          <ProtectedRoute adminOnly>
            <Layout title="Organizations" subtitle="Manage cooperative organizations">
              <Organizations />
            </Layout>
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/members">
        {() => (
          <ProtectedRoute>
            <Layout title="Member Management" subtitle="Manage cooperative members and permissions">
              <Members />
            </Layout>
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/loans">
        {() => (
          <ProtectedRoute>
            <Layout title="Loan Management" subtitle="Manage member loans and applications">
              <Loans />
            </Layout>
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/repayments">
        {() => (
          <ProtectedRoute>
            <Layout title="Repayment Management" subtitle="Track and manage loan repayments">
              <Repayments />
            </Layout>
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/contributions">
        {() => (
          <ProtectedRoute>
            <Layout title="Monthly Contributions" subtitle="Track and manage member contributions">
              <Contributions />
            </Layout>
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/reports">
        {() => (
          <ProtectedRoute>
            <Layout title="Reports & Analytics" subtitle="Comprehensive financial reports and insights">
              <Reports />
            </Layout>
          </ProtectedRoute>
        )}
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
