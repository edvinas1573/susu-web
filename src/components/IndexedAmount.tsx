import { formatBaseUnits } from '@/lib/susu/amounts';

/** A missing/malformed indexed amount is not a zero or a chain-confirmed balance. */
export function IndexedAmount({ value }: { value: unknown }) {
  const amount = formatBaseUnits(value);
  return amount === undefined ? (
    <span role="status" className="text-amber-800 dark:text-amber-200">
      Amount unavailable
    </span>
  ) : (
    <span className="font-mono">{amount} USDC</span>
  );
}
