import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/',
}));

jest.mock('next/link', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@/shared/api/devflow-api', () => ({
  createDevFlowInquiry: jest.fn().mockResolvedValue({ id: 'mock-id' }),
}));

import { MarketingHomeView } from '@/features/marketing/home/views/marketing-home-view';

describe('MarketingHomeView v2', () => {
  it('renders without crashing', () => {
    expect(() => render(<MarketingHomeView />)).not.toThrow();
  });

  it('shows the hero headline', () => {
    render(<MarketingHomeView />);
    expect(screen.getByText(/One prompt/i)).toBeInTheDocument();
  });

  it('shows the anatomy section headline', () => {
    render(<MarketingHomeView />);
    expect(screen.getByText(/One brief/i)).toBeInTheDocument();
  });

  it('shows the how it works section', () => {
    render(<MarketingHomeView />);
    expect(screen.getByText(/How it works/i)).toBeInTheDocument();
  });

  it('shows the FAQ section title', () => {
    render(<MarketingHomeView />);
    expect(screen.getByText(/Frequently asked/i)).toBeInTheDocument();
  });
});
