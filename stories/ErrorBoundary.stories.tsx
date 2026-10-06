import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { IndexedAmount } from '../src/components/IndexedAmount';

const meta = {
  title: 'Recovery/Render failures',
  component: ErrorBoundary,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ErrorBoundary>;

export default meta;
type Story = StoryObj<typeof meta>;

function Broken(): ReactNode {
  throw new Error('Synthetic render failure');
}

/** Caught by the real boundary, rather than rendering the fallback directly. */
export const RenderFailure: Story = { args: { children: <Broken /> } };

/** Synthetic indexer fixtures only: no chain, account or signing request. */
export const MalformedAmounts: Story = {
  args: {
    children: (
      <section className="mx-auto max-w-3xl space-y-3 p-6">
        <h1 className="text-xl font-semibold">Synthetic indexed amount examples</h1>
        <p>Invalid values are unavailable, never zero. Valid values retain exact precision.</p>
        <ul className="space-y-3">
          {['12.5', '', 'abc', '9007199254740993', '0'].map((value) => (
            <li key={value} className="flex flex-wrap gap-4">
              <code>{JSON.stringify(value)}</code>
              <IndexedAmount value={value} />
            </li>
          ))}
        </ul>
      </section>
    ),
  },
};
