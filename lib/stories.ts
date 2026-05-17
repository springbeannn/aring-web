// aring 브랜드 스토리 시리즈 — 라우팅·네비게이션 단일 진실
//
// status:
//   'ready'       — 본문 페이지가 존재하며 클릭 가능
//   'coming-soon' — 목록에는 보이지만 비활성, 본문 페이지 없음

export type StoryStatus = 'ready' | 'coming-soon';

export type Story = {
  slug: string;
  title: string;
  href: string;
  status: StoryStatus;
  index: number;
};

export const STORIES: Story[] = [
  {
    slug: 'about-story',
    index: 1,
    title: 'aring 브랜드 스토리 — 한 짝의 짝을 찾는 AI 매칭 서비스',
    href: '/about/story',
    status: 'ready',
  },
  {
    slug: 'why-register-first',
    index: 2,
    title: '귀걸이를 잃어버리면 먼저 aring에 등록하는 이유',
    href: '/about/story/why-register-first',
    status: 'ready',
  },
  {
    slug: 'cant-throw-away',
    index: 3,
    title: '한쪽만 남은 귀걸이는 왜 버리지 못할까',
    href: '/about/story/cant-throw-away',
    status: 'coming-soon',
  },
  {
    slug: 'moments-of-loss',
    index: 4,
    title: '사람들이 귀걸이를 잃어버리는 순간들',
    href: '/about/story/moments-of-loss',
    status: 'coming-soon',
  },
  {
    slug: 'how-ai-matches',
    index: 5,
    title: 'AI는 어떻게 비슷한 귀걸이를 찾을까',
    href: '/about/story/how-ai-matches',
    status: 'coming-soon',
  },
  {
    slug: 'reconnecting-objects',
    index: 6,
    title: '버려지는 물건을 다시 연결한다는 것',
    href: '/about/story/reconnecting-objects',
    status: 'coming-soon',
  },
  {
    slug: 'recommerce-experiment',
    index: 7,
    title: '귀걸이에서 시작된 리커머스 실험',
    href: '/about/story/recommerce-experiment',
    status: 'coming-soon',
  },
  {
    slug: 'prevent-losing-earrings',
    index: 8,
    title: '귀걸이 분실 방지 아이템',
    href: '/about/story/prevent-losing-earrings',
    status: 'coming-soon',
  },
];

export function getStoryBySlug(slug: string): Story | undefined {
  return STORIES.find((s) => s.slug === slug);
}
