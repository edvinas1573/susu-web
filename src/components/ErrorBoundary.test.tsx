// @vitest-environment jsdom
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ErrorBoundary } from './ErrorBoundary';
import { IndexedAmount } from './IndexedAmount';

vi.mock('@/lib/auth/context', () => ({
  useAuth: () => ({ status: 'authenticated', user: undefined, signOut: vi.fn() }),
}));
vi.mock('@/components/WalletButton', () => ({
  WalletButton: () => <button>Connect wallet</button>,
}));
vi.mock('@/components/motion', () => ({
  PageTransition: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
vi.mock('@/pages/app/Groups', () => ({
  Groups: () => {
    throw new Error('private account value');
  },
}));
vi.mock('@/pages/app/Dashboard', () => ({ Dashboard: () => <h1>Overview content</h1> }));

let root: Root;
let container: HTMLDivElement;

beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  // Expected React/router diagnostics, never an assertion about an empty console.
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  vi.stubEnv('VITE_APP_URL', 'http://localhost:5173');
  vi.stubEnv('VITE_SUPABASE_URL', 'https://placeholder.supabase.co');
  vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'placeholder-anon-key');
  vi.stubEnv('VITE_STELLAR_NETWORK', 'testnet');
  vi.stubEnv('VITE_STELLAR_RPC_URL', 'https://soroban-testnet.stellar.org');
  vi.stubEnv('VITE_FACTORY_CONTRACT_ID', '');
  vi.stubEnv('VITE_USDC_CONTRACT_ID', '');
  vi.stubEnv('VITE_EXPLORER_BASE_URL', 'https://stellar.expert/explorer/testnet');
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe('render failure recovery', () => {
  it('catches a render exception at the root with usable recovery controls and no exception text', async () => {
    function Broken(): ReactNode {
      throw new Error('private account value');
    }
    await act(async () =>
      root.render(
        <ErrorBoundary>
          <Broken />
        </ErrorBoundary>,
      ),
    );
    expect(container.querySelector('[role="alert"]')?.textContent).toContain(
      'could not be displayed',
    );
    expect(container.textContent).not.toContain('private account value');
    expect(container.querySelector('button')?.textContent).toBe('Reload page');
    expect(container.querySelector('a')?.getAttribute('href')).toBe('/');
    expect(container.textContent).toContain(
      'does not confirm whether a transaction succeeded or failed',
    );
  });

  it('renders healthy children normally', async () => {
    await act(async () =>
      root.render(
        <ErrorBoundary>
          <p>Healthy page</p>
        </ErrorBoundary>,
      ),
    );
    expect(container.textContent).toBe('Healthy page');
  });

  it('keeps the actual app shell mounted after a leaf throws and recovers through navigation', async () => {
    window.history.replaceState(null, '', '/app/groups');
    // Exercise the production route definitions, not a test-only copy of the tree.
    const { Router } = await import('@/routes/router');
    await act(async () =>
      root.render(
        <ErrorBoundary>
          <Router />
        </ErrorBoundary>,
      ),
    );
    const nav = container.querySelector('nav[aria-label="Application"]');
    expect(nav).not.toBeNull();
    expect(nav?.textContent).toContain('Connect wallet');
    expect(nav?.textContent).toContain('Sign out');
    expect(container.querySelector('main [role="alert"]')).not.toBeNull();
    expect(container.textContent).not.toContain('private account value');
    const overview = nav?.querySelector<HTMLAnchorElement>('a[href="/app"]');
    expect(overview).not.toBeNull();
    await act(async () =>
      overview?.dispatchEvent(new MouseEvent('click', { bubbles: true, button: 0 })),
    );
    expect(container.textContent).toContain('Overview content');
    expect(container.querySelector('[role="alert"]')).toBeNull();
    expect(container.querySelector('nav')).toBe(nav);
    const groups = nav?.querySelector<HTMLAnchorElement>('a[href="/app/groups"]');
    await act(async () =>
      groups?.dispatchEvent(new MouseEvent('click', { bubbles: true, button: 0 })),
    );
    expect(container.querySelector('main [role="alert"]')).not.toBeNull();
    expect(container.querySelector('nav')).toBe(nav);
  }, 30_000);

  it.each(['12.5', '', 'abc'])(
    'shows malformed amount %j inline beside healthy values',
    async (value) => {
      await act(async () =>
        root.render(
          <ErrorBoundary>
            <IndexedAmount value={value} />
            <IndexedAmount value="9007199254740993" />
            <IndexedAmount value="0" />
          </ErrorBoundary>,
        ),
      );
      expect(container.querySelector('[role="status"]')?.textContent).toBe('Amount unavailable');
      expect(container.textContent).toContain('900719925.4740993 USDC');
      expect(container.textContent).toContain('0 USDC');
      expect(container.querySelector('[role="alert"]')).toBeNull();
    },
  );
});
