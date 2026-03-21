import { render, screen } from '@testing-library/react';
import { AppShell } from './app-shell';

describe('AppShell', () => {
  it('renders the phase 0 foundation content', () => {
    render(<AppShell />);

    expect(screen.getByText('Control Center')).toBeInTheDocument();
    expect(screen.getByText('Monorepo bootstrap complete')).toBeInTheDocument();
    expect(screen.getByText('NestJS + Prisma + SQLite')).toBeInTheDocument();
  });
});
