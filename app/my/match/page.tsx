'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

const ANON_ID_KEY = 'aring_anon_user_id';

interface MyListing {
  id: string;
  brand: string | null;
  shape: string | null;
  detail: string | null;
  photo_url: string;
  status: 'open' | 'matched' | 'closed';
}

function statusLabel(s: string) {
  if (s === 'open') return '찾는 중';
  if (s === 'matched') return '매칭 완료';
  return '마감';
}

function statusColor(s: string) {
  if (s === 'open') return 'bg-green-100 text-green-700';
  if (s === 'matched') return 'bg-amber-100 text-amber-700';
  return 'bg-gray-100 text-gray-500';
}

export default function MyMatchPage() {
  const router = useRouter();
  const [listings, setListings] = useState<MyListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const userId = session?.user?.id ?? localStorage.getItem(ANON_ID_KEY) ?? '';
      if (!userId) { setLoading(false); return; }
      const { data } = await supabase!
        .from('listings')
        .select('id, brand, shape, detail, photo_url, status')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      const items = (data ?? []) as MyListing[];
      if (items.length === 1) {
        router.replace('/match/' + items[0].id);
        return;
      }
      setListings(items);
      setLoading(false);
    });
  }, [router]);

  if (loading) return (
    <div className='min-h-screen bg-white flex items-center justify-center'>
      <div className='w-6 h-6 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin' />
    </div>
  );

  if (listings.length === 0) return (
    <div className='min-h-screen bg-white'>
      <header className='sticky top-0 z-10 bg-white border-b border-gray-100'>
        <div className='flex items-center gap-3 px-4 h-14 max-w-lg mx-auto'>
          <button onClick={() => router.back()} className='p-1 -ml-1 text-gray-600'>
            <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><polyline points='15 18 9 12 15 6'/></svg>
          </button>
          <h1 className='text-base font-semibold text-gray-900'>내 귀걸이 매칭 현황</h1>
        </div>
      </header>
      <div className='flex flex-col items-center justify-center py-24 px-6 text-center'>
        <div className='w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4'>
          <svg width='28' height='28' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' className='text-gray-400'>
            <path d='M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z'/>
          </svg>
        </div>
        <p className='text-lg font-bold text-gray-800 mb-1'>아직 등록한 귀걸이가 없어요</p>
        <p className='text-sm text-gray-400 mb-6 leading-relaxed'>잃어버린 한 짝을 등록하면<br/>비슷한 짝을 찾아드려요</p>
        <button onClick={() => router.push('/register')} className='px-6 py-3 bg-gray-900 text-white rounded-full text-sm font-semibold hover:bg-gray-700 transition-colors'>
          한 짝 등록하기
        </button>
      </div>
    </div>
  );

  return (
    <div className='min-h-screen bg-white'>
      <header className='sticky top-0 z-10 bg-white border-b border-gray-100'>
        <div className='flex items-center gap-3 px-4 h-14 max-w-lg mx-auto'>
          <button onClick={() => router.back()} className='p-1 -ml-1 text-gray-600'>
            <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><polyline points='15 18 9 12 15 6'/></svg>
          </button>
          <h1 className='text-base font-semibold text-gray-900'>내 귀걸이 매칭 현황</h1>
        </div>
      </header>
      <div className='px-4 py-6 max-w-lg mx-auto'>
        <p className='text-xs text-gray-400 mb-4'>귀걸이를 선택하면 최신 매칭 결과를 확인할 수 있어요</p>
        <div className='flex flex-col gap-3'>
          {listings.map((item) => (
            <button key={item.id} onClick={() => router.push('/match/' + item.id)}
              className='flex items-center gap-4 p-4 border border-gray-100 rounded-2xl bg-white hover:bg-gray-50 transition-all text-left shadow-sm active:scale-[0.99]'>
              <div className='relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0'>
                {item.photo_url
                  ? <Image src={item.photo_url} alt={item.brand ?? ''} fill className='object-cover' />
                  : <div className='w-full h-full flex items-center justify-center text-gray-300 text-xs'>사진없음</div>
                }
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-semibold text-gray-900'>{item.brand ?? '브랜드 미상'}</p>
                <p className='text-xs text-gray-400 mt-0.5 line-clamp-1'>{[item.shape, item.detail].filter(Boolean).join(' · ')}</p>
                <span className={'inline-block mt-1.5 px-2 py-0.5 rounded-full text-xs font-medium ' + statusColor(item.status)}>
                  {statusLabel(item.status)}
                </span>
              </div>
              <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' className='text-gray-300 flex-shrink-0'>
                <polyline points='9 18 15 12 9 6'/>
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}