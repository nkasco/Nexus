import { fireEvent, render, screen } from '@testing-library/react';
import { LoginPanel } from './login-panel';

describe('LoginPanel', () => {
  it('submits typed credentials', () => {
    const onSubmit = vi.fn();

    const { container } = render(
      <LoginPanel apiHealthy isSubmitting={false} onSubmit={onSubmit} />,
    );

    const usernameInput = container.querySelector(
      'input[name="username"]',
    ) as HTMLInputElement;
    const passwordInput = container.querySelector(
      'input[name="password"]',
    ) as HTMLInputElement;
    const form = container.querySelector('form');

    fireEvent.change(usernameInput, {
      target: { value: 'operator' },
    });
    fireEvent.change(passwordInput, {
      target: { value: 'super-secret' },
    });
    fireEvent.submit(form!);

    expect(onSubmit).toHaveBeenCalledWith({
      username: 'operator',
      password: 'super-secret',
    });

    expect(screen.getByText('Enter the dashboard')).toBeInTheDocument();
  });

  it('exposes native login semantics and surfaces submission or error state', () => {
    render(
      <LoginPanel
        apiHealthy={false}
        errorMessage="Invalid credentials"
        isSubmitting
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByLabelText('Username')).toHaveAttribute(
      'autocomplete',
      'username',
    );
    expect(screen.getByLabelText('Password')).toHaveAttribute(
      'autocomplete',
      'current-password',
    );
    expect(screen.getByRole('button', { name: 'Signing in...' })).toBeDisabled();
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    expect(screen.getByText('API unavailable')).toBeInTheDocument();
  });
});
