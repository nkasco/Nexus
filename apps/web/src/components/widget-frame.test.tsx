import { render, screen } from '@testing-library/react';
import { WidgetFrame } from './widget-frame';

describe('WidgetFrame', () => {
  it('renders ready content', () => {
    render(
      <WidgetFrame
        detail="Ready detail"
        eyebrow="Ready"
        metric="12"
        state="ready"
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
        state="loading"
        title="Sync"
      />,
    );

    expect(screen.getByText('Syncing')).toBeInTheDocument();
    expect(screen.getByText(/preparing this widget/i)).toBeInTheDocument();
  });
});
