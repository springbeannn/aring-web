import { TopNav, BottomNav } from '@/components/Nav';

function CardSkeleton() {
  return (
    <div className="rounded-tile border border-aring-green-line bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="h-4 w-20 rounded-pill bg-aring-ink-100 animate-pulse" />
        <div className="h-3 w-14 rounded bg-aring-ink-100 animate-pulse" />
      </div>
      <div className="mt-3 h-5 w-3/4 rounded bg-aring-ink-100 animate-pulse" />
      <div className="mt-1.5 h-3 w-1/3 rounded bg-aring-ink-100 animate-pulse" />
      <div className="mt-3 space-y-2">
        <div className="h-3.5 w-2/3 rounded bg-aring-ink-100 animate-pulse" />
        <div className="h-3.5 w-1/2 rounded bg-aring-ink-100 animate-pulse" />
        <div className="h-3.5 w-1/3 rounded bg-aring-ink-100 animate-pulse" />
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <main className="min-h-screen flex justify-center bg-white">
      <div className="relative w-full max-w-[440px] bg-white overflow-hidden min-h-screen sm:my-6 sm:min-h-[900px] sm:rounded-[36px] sm:shadow-phone lg:max-w-[1200px] lg:my-0 lg:min-h-screen lg:rounded-none lg:shadow-none lg:overflow-visible">
        <div className="pb-28 lg:pb-10">
          <TopNav />
          <div className="px-5 lg:px-8 pt-3 lg:pt-7 pb-4">
            <div className="h-7 w-2/3 rounded bg-aring-ink-100 animate-pulse" />
            <div className="mt-2 h-3.5 w-3/4 rounded bg-aring-ink-100 animate-pulse" />
          </div>
          <div className="px-5 lg:px-8 pb-4 flex gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-8 w-20 rounded-pill bg-aring-ink-100 animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4 px-5 lg:px-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
        <BottomNav />
      </div>
    </main>
  );
}
