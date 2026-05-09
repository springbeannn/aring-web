'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import Image from 'next/image';

const ANON_ID_KEY = 'aring_anon_user_id';

interface MyListing {
  id: string;
  title: string | null;
  brand: string | null;
  photo_url: string | null;
  status: string;
}

function IconChevronRight() {
  return (
    <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
      <polyline points='9 18 15 12 9 6'/>
    </svg>
  );
}

function statusLabel(status: string) {
  if (status === 'open') return '찾는 중';
  if (status === 'matched') return '매칭 완료';
  if (status === 'closed') return '마감';
  return status;
}

function statusColor(status: string) {
  if (status === 'open') return 'bg-green-100 text-green-700';
  if (status === 'matched') return 'bg-amber-100 text-amber-700';
  return 'bg-gray-100 text-gray-500';
}

export default function SearchPhotoPage() {
  const router = useRouter();
  const [listings, setListings] = useState<MyListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      let userId = session?.user?.id ?? '';
      if (!userId) {
        userId = localStorage.getItem(ANON_ID_KEY) ?? '';
      }
      if (!userId) { setLoading(false); return; }

      const { data } = await supabase
        .from('listings')
        .select('id, title, brand, photo_url, status')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      setListings(data ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className='min-h-screen bg-white'>
      <header className='sticky top-0 z-10 bg-white border-b border-gray-100'>
        <div className='flex items-center gap-3 px-4 h-14 max-w-lg mx-auto'>
          <button onClick={() => router.back()} className='p-1 -ml-1 text-gray-600 hover:text-gray-900' aria-label='뒤로'>
            <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
              <polyline points='15 18 9 12 15 6'/>
            </svg>
          </button>
          <h1 className='text-base font-semibold text-gray-900'>내 귀걸이 매칭 현황</h1>
        </div>
      </header>

      <div className='max-w-lg mx-auto px-4 py-6'>
        {loading && (
          <div className='flex justify-center py-20'>
            <div className='w-6 h-6 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin' />
          </div>
        )}

        {!loading && listings.length === 0 && (
          <div className='flex flex-col items-center justify-center py-20 text-center'>
            <p className='text-base font-semibold text-gray-700 mb-1'>등록한 귀걸이가 없어요</p>
            <p className='text-sm text-gray-400 mb-6'>한 짝 귀걸이를 등록하면 짝을 찾아드려요.</p>
            <button onClick={() => router.push('/register')} className='px-6 py-3 bg-gray-900 text-white rounded-full text-sm font-semibold hover:bg-gray-700 transition-colors'>
              한 짝 등록하기
            </button>
          </div>
        )}

        {!loading && listings.length > 0 && (
          <div>
            <p className='text-sm text-gray-400 mb-4'>귀걸이를 선택하면 최신 매칭 결과를 볼 수 있어요.</p>
            <div className='flex flex-col gap-3'>
              {listings.map((item) => (
                <button
                  key={item.id}
                  onClick={() => router.push('/match/' + item.id)}
                  className='flex items-center gap-4 p-4 border border-gray-100 rounded-2xl bg-white hover:bg-gray-50 hover:border-gray-200 transition-all text-left shadow-sm'
                >
                  <div className='relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0'>
                    {item.photo_url ? (
                      <Image src={item.photo_url} alt={item.title ?? '귀걸이'} fill className='object-cover' />
                    ) : (
                      <div className='w-full h-full flex items-center justify-center text-gray-300 text-xs'>사진 없음</div>
                    )}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-semibold text-gray-900 line-clamp-1'>{item.title ?? '귀걸이'}</p>
                    {item.brand && <p className='text-xs text-gray-400 mt-0.5'>{item.brand}</p>}
                    <span className={'inline-block mt-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ' + statusColor(item.status)}>
                      {statusLabel(item.status)}
                    </span>
                  </div>
                  <div className='text-gray-300 flex-shrink-0'>
                    <IconChevronRight />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}