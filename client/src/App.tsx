import { Switch, Route, Redirect } from "wouter";
import { AppShell, Burger, Group, Text, NavLink, Title, Container } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconBuilding, IconUsers, IconCoin, IconReceipt, IconWallet, IconChartBar, IconDashboard } from '@tabler/icons-react';
import { useLocation } from "wouter";

// Import pages
import MantineLogin from "./pages/mantine-login";
import Dashboard from "./pages/dashboard";
import Organizations from "./pages/organizations";
import Members from "./pages/members";
import Loans from "./pages/loans";
import Repayments from "./pages/repayments";
import Contributions from "./pages/contributions";
import Reports from "./pages/reports";
import NotFound from "./pages/not-found";

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

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

function Layout({ children, title }: LayoutProps) {
  const [opened, { toggle }] = useDisclosure();
  const [location, setLocation] = useLocation();

  const navigationItems = [
    { icon: IconDashboard, label: 'Dashboard', path: '/' },
    { icon: IconBuilding, label: 'Organizations', path: '/organizations' },
    { icon: IconUsers, label: 'Members', path: '/members' },
    { icon: IconCoin, label: 'Loans', path: '/loans' },
    { icon: IconReceipt, label: 'Repayments', path: '/repayments' },
    { icon: IconWallet, label: 'Contributions', path: '/contributions' },
    { icon: IconChartBar, label: 'Reports', path: '/reports' },
  ];

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 250, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <Title order={3}>CoopLoan Management</Title>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        {navigationItems.map((item) => (
          <NavLink
            key={item.path}
            href={item.path}
            label={item.label}
            leftSection={<item.icon size="1rem" />}
            active={location === item.path}
            onClick={() => setLocation(item.path)}
          />
        ))}
      </AppShell.Navbar>

      <AppShell.Main>
        <Container size="xl">
          <Title order={2} mb="md">{title}</Title>
          {children}
        </Container>
      </AppShell.Main>
    </AppShell>
  );
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
            <Layout title="Dashboard">
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/organizations">
        {() => (
          <ProtectedRoute adminOnly>
            <Layout title="Organizations">
              <Organizations />
            </Layout>
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/members">
        {() => (
          <ProtectedRoute>
            <Layout title="Member Management">
              <Members />
            </Layout>
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/loans">
        {() => (
          <ProtectedRoute>
            <Layout title="Loan Management">
              <Loans />
            </Layout>
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/repayments">
        {() => (
          <ProtectedRoute>
            <Layout title="Repayment Management">
              <Repayments />
            </Layout>
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/contributions">
        {() => (
          <ProtectedRoute>
            <Layout title="Monthly Contributions">
              <Contributions />
            </Layout>
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/reports">
        {() => (
          <ProtectedRoute>
            <Layout title="Reports & Analytics">
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
  return <Router />;
}

export default App;