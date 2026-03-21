import { fireEvent, render, screen } from '@testing-library/react';
import { LoginPanel } from './login-panel';

describe('LoginPanel', () => {
  it('submits typed credentials', () => {
    const onSubmit = vi.fn();

    render(<LoginPanel apiHealthy isSubmitting={false} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'operator' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'super-secret' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(onSubmit).toHaveBeenCalledWith({
      username: 'operator',
      password: 'super-secret',
    });
  });
});
