// 목업 데이터 — Supabase 연결 후 fetcher로 교체 예정
// 모든 상품/매칭 데이터는 한 짝만 남은 귀걸이를 가정합니다 (side: L | R)

export type MatchCard = {
  id: string;
  brand: string;
  name: string;
  similarity: number; // 0-100
  region: string;
  leftEmoji: string;
  rightEmoji: string;
  leftTone: ThumbTone;
  rightTone: ThumbTone;
  leftImage: string;
  rightImage: string;
};

export type RecentItem = {
  id: string;
  brand: string;
  name: string;
  price: number;
  likes: number;
  side: 'L' | 'R';
  emoji: string;
  tone: ThumbTone;
  story?: string; // "3년간 보관" 같은 한줄 스토리
  image: string; // 실사 이미지 URL (Unsplash 핫링크)
};

// Pastel design system — 2026-04-25 update
// 기존 'peach'|'peri'|'mix'|'green' 폐기 → 6-tone pastel
export type ThumbTone = 'pink' | 'peach' | 'butter' | 'mint' | 'sky' | 'sage';

export type SuccessStory = {
  badge: string;
  text: string;
  user: string;
  metrics: { label: string; value: string }[];
};

// Unsplash hotlink helper — w/q 파라미터로 사이즈/품질 통제
const u = (id: string, w = 400) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;

export const todayMatches: MatchCard[] = [
  {
    id: 'm1',
    brand: 'CHANEL',
    name: 'CC 클래식 드롭',
    similarity: 97,
    region: '서울 · 강남구',
    leftEmoji: '◆',
    rightEmoji: '◆',
    leftTone: 'pink',
    rightTone: 'pink',
    leftImage: u('1611591437281-460bfbe1220a'),
    rightImage: u('1611652022419-a9419f74343d'),
  },
  {
    id: 'm2',
    brand: 'DIOR',
    name: '트라이벌 펄',
    similarity: 92,
    region: '서울 · 성동구',
    leftEmoji: '○',
    rightEmoji: '○',
    leftTone: 'butter',
    rightTone: 'butter',
    leftImage: u('1599643477877-530eb83abc8e'),
    rightImage: u('1605100804763-247f67b3557e'),
  },
  {
    id: 'm3',
    brand: 'TIFFANY & CO.',
    name: 'T1 서클 미니',
    similarity: 88,
    region: '경기 · 성남시',
    leftEmoji: '◯',
    rightEmoji: '◯',
    leftTone: 'sky',
    rightTone: 'sky',
    leftImage: u('1535632787350-4e68ef0ac584'),
    rightImage: u('1561591876-5cba85b78c6f'),
  },
  {
    id: 'm4',
    brand: 'CELINE',
    name: '트리옹프 스터드',
    similarity: 85,
    region: '서울 · 마포구',
    leftEmoji: '✦',
    rightEmoji: '✦',
    leftTone: 'mint',
    rightTone: 'mint',
    leftImage: u('1606760227091-3dd870d97f1d'),
    rightImage: u('1602173574767-37ac01994b2a'),
  },
];

export const recentItems: RecentItem[] = [
  {
    id: 'r1',
    brand: 'SWAROVSKI',
    name: '밀레니아 드롭',
    price: 48000,
    likes: 23,
    side: 'L',
    emoji: '◆',
    tone: 'pink',
    story: '2년간 한 짝만 보관',
    image: u('1611591437281-460bfbe1220a', 600),
  },
  {
    id: 'r2',
    brand: 'AGMES',
    name: '실버 후프 M',
    price: 72000,
    likes: 41,
    side: 'R',
    emoji: '◯',
    tone: 'sky',
    story: '미사용 · 박스 보관',
    image: u('1605100804763-247f67b3557e', 600),
  },
  {
    id: 'r3',
    brand: 'MIU MIU',
    name: '크리스탈 하트',
    price: 55000,
    likes: 18,
    side: 'R',
    emoji: '♡',
    tone: 'peach',
    story: '여행 중 한쪽 분실',
    image: u('1611652022419-a9419f74343d', 600),
  },
  {
    id: 'r4',
    brand: 'NUMBERING',
    name: '#521 펄 드롭',
    price: 38000,
    likes: 12,
    side: 'L',
    emoji: '○',
    tone: 'mint',
    story: '클래식 라인',
    image: u('1599643477877-530eb83abc8e', 600),
  },
];

export const brands = [
  '전체',
  'CHANEL',
  'DIOR',
  'CELINE',
  'TIFFANY',
  'SWAROVSKI',
  'AGMES',
  'MIU MIU',
  'NUMBERING',
];

export const successStory: SuccessStory = {
  badge: 'SUCCESS STORY',
  text: '3년 전 잃어버린 티파니 T1, 다른 도시 사용자에게서 정확히 같은 짝을 찾았어요. 사진 한 장으로 시작된 매칭이 진짜 짝이 됐어요.',
  user: '— 지현 (서울 · 30대)',
  metrics: [
    { label: '매칭 소요', value: '48H' },
    { label: 'AI 유사도', value: '96%' },
    { label: '수수료', value: '₩0' },
  ],
};

// helpers
export function formatKRW(n: number): string {
  return `₩${n.toLocaleString('ko-KR')}`;
}

export function thumbBg(tone: ThumbTone): string {
  switch (tone) {
    case 'pink':
      return 'linear-gradient(135deg,#FCE2EC,#FBC8DC)';
    case 'peach':
      return 'linear-gradient(135deg,#FFEAD3,#FFD9B8)';
    case 'butter':
      return 'linear-gradient(135deg,#FFF6CF,#FFEFB5)';
    case 'mint':
      return 'linear-gradient(135deg,#DEEFDF,#C8E6C9)';
    case 'sky':
      return 'linear-gradient(135deg,#DDEBF6,#C5DDF0)';
    case 'sage':
      return 'linear-gradient(135deg,#E5EDD8,#D8E5C8)';
  }
}
