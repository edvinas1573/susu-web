import { Component, type ReactNode } from 'react';
import { Button, Notice, Page } from './ui';

/** No raw exception text: responses can contain private account details. */
export function RenderErrorNotice() {
  return (
    <Page>
      <Notice tone="danger" title="This page could not be displayed">
        <p>
          Some data could not be read. Reload the page to try again, or use the navigation to open
          another page. This error does not confirm whether a transaction succeeded or failed.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Button onClick={() => window.location.reload()}>Reload page</Button>
          <a href="/" className="font-medium underline underline-offset-2">
            Return home
          </a>
        </div>
      </Notice>
    </Page>
  );
}

/** Last resort for provider or shell failures; route errors stay inside the shell. */
export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  override state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  override render() {
    return this.state.failed ? <RenderErrorNotice /> : this.props.children;
  }
}
