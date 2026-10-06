import type { ReactNode } from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import type { GroupSummary } from '@/lib/api/groups';
import { IndexedGroupCard } from './IndexedGroupCard';
import { GroupLedger } from './GroupLedger';
import { Activity } from '@/pages/app/Activity';

const fixture = vi.hoisted(() => ({ amount: '' }));
vi.mock('@/components/motion', () => ({
  Stagger: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  StaggerItem: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
vi.mock('@/lib/api/hooks', () => {
  const page = (items: unknown[]) => ({
    data: { pages: [{ items }] },
    isPending: false,
    isError: false,
    isSuccess: true,
    hasNextPage: false,
    isFetchingNextPage: false,
  });
  return {
    useGroupContributions: () =>
      page([
        {
          eventIdentity: 'contribution',
          member: 'GABC',
          round: 1,
          amount: fixture.amount,
          txHash: 'tx1',
        },
      ]),
    useGroupPayouts: () =>
      page([
        {
          eventIdentity: 'payout',
          recipient: 'GABC',
          round: 1,
          recipientAmount: fixture.amount,
          txHash: 'tx2',
        },
      ]),
    useMe: () => ({ isSuccess: true, data: { walletAddress: 'GABC' } }),
    useMyActivity: () =>
      page([
        {
          eventIdentity: 'event',
          name: 'contribution',
          payload: { amount: fixture.amount },
          ledger: 123,
          contractId: 'CABC',
          txHash: 'tx3',
        },
      ]),
    useNotifications: () => page([]),
    useMarkNotificationRead: () => ({ isPending: false }),
  };
});

const group: GroupSummary = {
  contractId: 'CABC',
  factoryContractId: 'CFACTORY',
  groupId: 1,
  creator: 'GABC',
  token: 'CUSDC',
  contributionAmount: '0',
  memberCapacity: 3,
  createdLedger: 1,
  status: 'open',
  memberCount: 1,
  currentRound: 0,
  completedRounds: 0,
  contributedTotal: '0',
  paidOutTotal: '0',
  feeTotal: '0',
  lastEventLedger: 1,
};

function render(children: ReactNode) {
  return renderToString(<MemoryRouter>{children}</MemoryRouter>);
}

describe('indexed monetary rows', () => {
  it.each(['12.5', '', 'abc'])(
    'keeps real card, ledger and activity rows readable for %j',
    (amount) => {
      fixture.amount = amount;
      const card = render(<IndexedGroupCard group={{ ...group, contributionAmount: amount }} />);
      expect(card).toContain('Amount unavailable');
      expect(card).toContain('/app/groups/CABC');
      const ledger = render(<GroupLedger groupContractId="CABC" viewer={undefined} />);
      expect(ledger.match(/Amount unavailable/g)).toHaveLength(2);
      expect(ledger).toContain('/app/transactions/tx1');
      expect(ledger).toContain('/app/transactions/tx2');
      const activity = render(<Activity />);
      expect(activity).toContain('Amount unavailable');
      expect(activity).toContain('/app/transactions/tx3');
      expect(activity).toContain('Chain activity');
      for (const html of [card, ledger, activity]) expect(html).not.toContain('0 USDC');
    },
  );
});
