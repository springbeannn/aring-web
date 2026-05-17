import type { LostItem } from '@/lib/lost112/types';
import { LostItemCard } from './LostItemCard';

export function LostFoundGrid({ items }: { items: LostItem[] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4 px-5 lg:px-8">
      {items.map((it) => (
        <LostItemCard key={it.id} item={it} />
      ))}
    </div>
  );
}
