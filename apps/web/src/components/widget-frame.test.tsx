import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { WidgetFrame } from './widget-frame';

describe('WidgetFrame', () => {
  it('renders ready content', () => {
    render(
      <WidgetFrame
        detail="Ready detail"
        eyebrow="Ready"
        focus="summary"
        metric="12"
        state="ready"
        stats={[
          {
            label: 'Healthy',
            value: '12',
            detail: 'Providers online',
            tone: 'success',
          },
        ]}
        title="Signal"
      >
        <p>Live content</p>
      </WidgetFrame>,
    );

    expect(screen.getByText('Signal')).toBeInTheDocument();
    expect(screen.getByText('Live content')).toBeInTheDocument();
  });

  it('renders fallback copy for loading widgets', () => {
    render(
      <WidgetFrame
        detail="Pending detail"
        eyebrow="Loading"
        focus="summary"
        state="loading"
        title="Sync"
      />,
    );

    expect(screen.getByText('Syncing')).toBeInTheDocument();
    expect(screen.getByText(/preparing this widget/i)).toBeInTheDocument();
  });

  it('renders error fallback copy for failed widgets', () => {
    render(
      <WidgetFrame
        detail="Failure detail"
        eyebrow="Error"
        focus="summary"
        state="error"
        title="Adapter sync"
      />,
    );

    expect(screen.getByText('Needs attention')).toBeInTheDocument();
    expect(screen.getByText(/did not complete cleanly/i)).toBeInTheDocument();
  });

  it('renders widget actions and focus controls', async () => {
    const user = userEvent.setup();
    const onFocusChange = vi.fn();
    const onRefresh = vi.fn();

    render(
      <WidgetFrame
        detail="Ready detail"
        eyebrow="Ready"
        focus="summary"
        items={[
          {
            label: 'GitHub sync',
            value: 'now',
            detail: 'Workflow data refreshed.',
            tone: 'success',
          },
        ]}
        navigationHref="/devops"
        onFocusChange={onFocusChange}
        onRefresh={onRefresh}
        state="ready"
        title="Signal"
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Refresh' }));
    expect(onRefresh).toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Configure' }));
    await user.click(
      screen.getByRole('button', {
        name: /attention prioritize warnings and degraded items first/i,
      }),
    );
    expect(onFocusChange).toHaveBeenCalledWith('attention');
  });
});
