import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  // 동적으로 조합되는 파스텔 bg 클래스 — purge 방지
  safelist: [
    'bg-aring-pastel-pink',
    'bg-aring-pastel-peach',
    'bg-aring-pastel-butter',
    'bg-aring-pastel-mint',
    'bg-aring-pastel-sky',
    'bg-aring-pastel-sage',
    'bg-aring-pastel-lavender',
    'bg-aring-pastel-cream',
    'bg-aring-pastel-aqua',
    'bg-aring-pastel-rose',
  ],
  theme: {
    extend: {
      colors: {
        aring: {
          // Brand primary — Muted Deep Green (텍스트·CTA 전용)
          green: {
            DEFAULT: '#2A4A3C',
            deep: '#1C3328',
            soft: '#4A6B5C',
            mute: '#7A9286',
            bg: '#EFF3F0',
            line: '#E5E5E5', // 더 중립적인 라인 (sage tint 제거)
          },
          // Soft Pastel Palette — 썸네일·장식 시스템 (40% 더 연한 v2, 10종)
          pastel: {
            pink: '#FEE8F1',
            peach: '#FFEFD9',
            butter: '#FFF7D6',
            mint: '#EDF8F6',
            sky: '#E3EFF7',
            sage: '#F5F3EA',
            lavender: '#F4EBF8',
            cream: '#FBF3EA',
            aqua: '#EBF6F8',
            rose: '#F8EAEA',
          },
          // 단일 강조 ('알림 dot' 같은 곳에서 쓰는 채도 한 단계 위 핑크)
          accent: '#F5A8C7',
          ink: {
            900: '#1E1B2E',
            700: '#2A2A3E',
            500: '#6B6B7E',
            300: '#B5B5C0',
            100: '#F3F3F5',
          },
          // ─── Toss-style 게시판 (cases) 전용 평면 키 ───
          black:           '#1A1A1A',
          olive:           '#6B7C45',
          'olive-light':   '#8FA05A',
          cream:           '#F5F2EC',
          'pastel-green':  '#D6E4C7',
          'pastel-blue':   '#D0DFF2',
          gray:            '#8A8A8A',
          'gray-light':    '#E8E5DE',
        },
      },
      fontFamily: {
        sans: [
          'Pretendard Variable',
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          'Apple SD Gothic Neo',
          'system-ui',
          'sans-serif',
        ],
      },
      boxShadow: {
        card: '0 8px 24px rgba(16,16,24,.06)',
        cta: '0 12px 28px rgba(28,51,40,.28)',
        phone: '0 30px 80px rgba(20,20,40,.12), 0 2px 6px rgba(20,20,40,.06)',
        chip: '0 2px 6px rgba(28,51,40,.12)',
      },
      backgroundImage: {
        // Hero/대형 장식 — 핑크→피치→버터→민트 4-stop pastel
        'aring-grad-pastel':
          'linear-gradient(135deg, #FBC8DC 0%, #FFD9B8 33%, #FFEFB5 66%, #C8E6C9 100%)',
        // 보조 — 핑크 → 세이지 (warm-cool 부드러운 전환)
        'aring-grad-rose':
          'linear-gradient(180deg, #FBC8DC 0%, #F0DDD2 50%, #D8E5C8 100%)',
        // 보조 — 스카이 → 민트 → 버터 (cool 시작)
        'aring-grad-sky':
          'linear-gradient(180deg, #C5DDF0 0%, #D8EAD0 50%, #FFEFB5 100%)',
        // Deep — Success Story 같은 정적 카드 (텍스트 흰색용)
        'aring-grad-green':
          'linear-gradient(135deg, #2A4A3C 0%, #1C3328 100%)',
      },
      borderRadius: {
        card: '22px',
        tile: '16px',
        pill: '999px',
      },
    },
  },
  plugins: [],
};

export default config;
