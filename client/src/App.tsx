import { Switch, Route, Redirect } from "wouter";
import { AppShell, Burger, Group, Text, UnstyledButton, Stack, NavLink, Title, Container } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconBuilding, IconUsers, IconCoin, IconReceipt, IconPiggyBank, IconChartBar, IconLogout, IconSchool } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { useLocation } from "wouter";

// Import pages
import MantineLogin from "@/pages/mantine-login";
import Dashboard from "@/pages/dashboard";
import Organizations from "@/pages/organizations";
import Members from "@/pages/members";
import Loans from "@/pages/loans";
import Repayments from "@/pages/repayments";
import Contributions from "@/pages/contributions";
import Reports from "@/pages/reports";
import NotFound from "@/pages/not-found";

interface User {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
    role?: string;
    organizationId?: number;
    isAdmin?: boolean;
    isSuperAdmin?: boolean;
  };
}

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  // Temporary mock authentication - replace with actual Supabase when keys are provided
  const mockUser = { id: '1', email: 'admin@cooploan.com', user_metadata: { isAdmin: true, isSuperAdmin: true } };
  const isAuthenticated = true; // Temporary - will check actual auth state
  
  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  if (adminOnly && !mockUser.user_metadata?.isAdmin && !mockUser.user_metadata?.isSuperAdmin) {
    return <Redirect to="/" />;
  }

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/login" component={MantineLogin} />
      
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
