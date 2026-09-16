// A game component that throws must not take the phone (or the TV) down with it. A Reload
// button, because the usual cause is a page from an older build (see net/build.ts).
import { Component } from 'react';
import type { ErrorInfo, JSX, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** TV variant renders larger text. */
  surface?: 'tv' | 'controller';
}

interface State {
  error: Error | null;
}

export class GameErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[partybox] game component crashed', error, info.componentStack);
  }

  override render(): ReactNode {
    if (!this.state.error) return this.props.children;
    return (
      <div role="alert" style={{ padding: 'var(--pb-space-6)', textAlign: 'center' }}>
        <p style={{ fontWeight: 800 }}>This game hit a snag.</p>
        <p className="pb-muted pb-caption">{this.state.error.message}</p>
        <button
          type="button"
          onClick={() => location.reload()}
          style={{
            marginTop: 'var(--pb-space-4)',
            padding: 'var(--pb-space-2) var(--pb-space-5)',
            borderRadius: 'var(--pb-radius)',
            background: 'var(--pb-accent)',
            color: 'var(--pb-on-accent)',
            fontWeight: 800,
          }}
        >
          Reload
        </button>
      </div>
    ) as JSX.Element;
  }
}
