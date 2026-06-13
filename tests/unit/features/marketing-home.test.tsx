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

// Mock the API so ContactCloser does not make network calls
jest.mock('@/shared/api/devflow-api', () => ({
  createDevFlowInquiry: jest.fn().mockResolvedValue({ id: 'mock-id' }),
}));

jest.mock('@/shared/components/ui', () => ({
  Button: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button onClick={onClick}>{children}</button>
  ),
  Card: ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
    <div style={style}>{children}</div>
  ),
  Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  Logo: () => <span>Alphaexplora</span>,
  Field: ({ children, label }: { children: React.ReactNode; label?: string }) => (
    <div>
      {label && <label>{label}</label>}
      {children}
    </div>
  ),
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
  Textarea: (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea {...props} />,
}));

jest.mock('@/shared/components/icons', () => ({
  IconArrowRight: () => <svg />,
  IconArrowUpRight: () => <svg />,
  IconCheck: () => <svg />,
  IconCheckCircle: () => <svg />,
  IconChevronDown: () => <svg />,
  IconGitBranch: () => <svg />,
  IconGitHub: () => <svg />,
  IconLinkedIn: () => <svg />,
  IconMail: () => <svg />,
  IconMapPin: () => <svg />,
  IconPhone: () => <svg />,
  IconRocket: () => <svg />,
  IconStar: () => <svg />,
  IconTwitter: () => <svg />,
  IconUser: () => <svg />,
  IconZap: () => <svg />,
}));

import { MarketingHomeView } from '@/features/marketing/home/views/marketing-home-view';

describe('MarketingHomeView', () => {
  it('renders without crashing', () => {
    expect(() => render(<MarketingHomeView />)).not.toThrow();
  });

  it('shows the main hero heading text', () => {
    render(<MarketingHomeView />);
    // "Build Production-Ready" appears as HeroWords split spans
    expect(screen.getByText('Build')).toBeInTheDocument();
    expect(screen.getByText('Production-Ready')).toBeInTheDocument();
  });

  it('shows the "Apps Instantly" gradient text', () => {
    render(<MarketingHomeView />);
    expect(screen.getByText('Apps')).toBeInTheDocument();
    expect(screen.getByText('Instantly')).toBeInTheDocument();
  });

  it('shows the enterprise IT solutions eyebrow badge', () => {
    render(<MarketingHomeView />);
    expect(screen.getByText('Enterprise IT Solutions for Philippine MSMEs')).toBeInTheDocument();
  });

  it('shows the "Start Building" CTA button', () => {
    render(<MarketingHomeView />);
    expect(screen.getByText('Start Building')).toBeInTheDocument();
  });

  it('shows feature card titles', () => {
    render(<MarketingHomeView />);
    expect(screen.getByText('Rapid Development')).toBeInTheDocument();
    expect(screen.getByText('Automated CI/CD')).toBeInTheDocument();
    expect(screen.getByText('Expert-Led Delivery')).toBeInTheDocument();
  });

  it('shows the "How it works" section', () => {
    render(<MarketingHomeView />);
    expect(screen.getByText('Submit Inquiry')).toBeInTheDocument();
    expect(screen.getByText('Discovery & Approval')).toBeInTheDocument();
  });

  it('shows the Alphaexplora company name in the logo', () => {
    render(<MarketingHomeView />);
    // The Logo mock renders "Alphaexplora" — verify brand is present
    const logos = screen.getAllByText('Alphaexplora');
    expect(logos.length).toBeGreaterThanOrEqual(1);
  });

  it('shows the client outcomes section', () => {
    render(<MarketingHomeView />);
    expect(screen.getByText(/Built for/)).toBeInTheDocument();
    expect(screen.getByText(/Filipino businesses/)).toBeInTheDocument();
  });

  it('shows the "Common questions" FAQ heading', () => {
    render(<MarketingHomeView />);
    expect(screen.getByText('Common questions')).toBeInTheDocument();
  });

  it('shows the "Trusted by Philippine MSMEs scaling fast" section', () => {
    render(<MarketingHomeView />);
    expect(screen.getByText('Trusted by Philippine MSMEs scaling fast')).toBeInTheDocument();
  });
});
