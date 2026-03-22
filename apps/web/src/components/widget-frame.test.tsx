import { fireEvent, render, screen } from '@testing-library/react';
import { WidgetFrame } from './widget-frame';

describe('WidgetFrame', () => {
  it('renders ready content', () => {
    const { container } = render(
      <WidgetFrame
        detail="Ready detail"
        eyebrow="Ready"
        focus="summary"
        metric="12"
        state="ready"
        updatedLabel="just now"
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

    expect(screen.getAllByText('Signal').length).toBeGreaterThan(0);
    expect(screen.getByText('Ready detail')).toBeInTheDocument();
    expect(screen.getByText('Snapshot')).toBeInTheDocument();
    expect(screen.getByText(/Updated just now/i)).toBeInTheDocument();
    expect(screen.getByText('Live content')).toBeInTheDocument();
    expect(container.querySelector('article')).toHaveClass(
      'surface-card',
      'p-3.5',
      'min-h-[248px]',
    );
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

    fireEvent.click(screen.getByText('Refresh'));
    expect(onRefresh).toHaveBeenCalled();

    fireEvent.click(screen.getByText('Configure'));
    fireEvent.click(screen.getByText('attention'));
    expect(onFocusChange).toHaveBeenCalledWith('attention');
    expect(screen.getByText('Recent detail')).toBeInTheDocument();
  });
});
