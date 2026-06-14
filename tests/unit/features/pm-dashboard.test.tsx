import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/pm/dashboard',
}));

jest.mock('@/shared/auth/auth-provider', () => ({
  useAuth: () => ({
    initialized: true,
    session: null,
    user: null,
    devFlowUser: null,
    devFlowUserError: null,
    signIn: jest.fn(),
    signUp: jest.fn(),
    resetPassword: jest.fn(),
    updatePassword: jest.fn(),
    signOut: jest.fn(),
  }),
}));

jest.mock('@/shared/hooks/use-devflow-projects', () => ({
  useDevFlowProjects: () => ({
    projects: [],
    loading: false,
    error: null,
    refresh: jest.fn(),
  }),
  useDevFlowProjectOutputs: () => ({
    artifacts: [],
    timeline: [],
    loading: false,
    error: null,
    refresh: jest.fn(),
  }),
}));

jest.mock('@/shared/hooks/use-devflow-notifications', () => ({
  useDevFlowNotifications: () => ({
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
    refresh: jest.fn(),
  }),
}));

jest.mock('@/shared/components/ui', () => ({
  Button: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button onClick={onClick}>{children}</button>
  ),
  Card: ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
    <div style={style}>{children}</div>
  ),
  Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

jest.mock('@/shared/components/icons', () => ({
  IconArrowRight: () => <svg />,
  IconBell: () => <svg />,
  IconFolder: () => <svg />,
  IconRefresh: () => <svg />,
  IconUsers: () => <svg />,
  IconClock: () => <svg />,
}));

jest.mock('@/features/pm/shared/components/pm-page-header', () => ({
  PMPageHeader: ({ title, subtitle }: { title: string; subtitle?: string; actions?: React.ReactNode }) => (
    <div>
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </div>
  ),
}));

jest.mock('@/shared/components/backend-aware-route-state', () => ({
  BackendAwareRouteState: ({ title }: { title: string }) => <div>{title}</div>,
}));

import { PMDashboardView } from '@/features/pm/dashboard/views/pm-dashboard-view';

describe('PMDashboardView', () => {
  it('renders without crashing', () => {
    expect(() => render(<PMDashboardView />)).not.toThrow();
  });

  it('shows the PM dashboard heading', () => {
    render(<PMDashboardView />);
    expect(screen.getByText('Operations dashboard')).toBeInTheDocument();
  });

  it('shows the dashboard subtitle', () => {
    render(<PMDashboardView />);
    expect(
      screen.getByText('Backend projects, role-scoped notifications, and honest pending modules.'),
    ).toBeInTheDocument();
  });

  it('shows metric labels for visible projects, active projects, and notifications', () => {
    render(<PMDashboardView />);
    expect(screen.getByText('Visible projects')).toBeInTheDocument();
    expect(screen.getByText('Active projects')).toBeInTheDocument();
    expect(screen.getByText('Unread notifications')).toBeInTheDocument();
  });

  it('shows project count of 0 when no projects are returned', () => {
    render(<PMDashboardView />);
    // The metric card renders "0" for each count
    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBeGreaterThanOrEqual(1);
  });

  it('shows "No backend projects" message when project list is empty', () => {
    render(<PMDashboardView />);
    expect(
      screen.getByText('No backend projects are assigned to this PM account yet.'),
    ).toBeInTheDocument();
  });

  it('renders a Backend project queue section heading', () => {
    render(<PMDashboardView />);
    expect(screen.getByText('Backend project queue')).toBeInTheDocument();
  });
});
