/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'yycagcepyldhkkozommp.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async headers() {
    // ─────────────────────────────────────────────────────────────
    // 전역 보안 헤더
    // - HSTS: HTTPS 강제 (1년, 서브도메인 포함, preload)
    // - X-Frame-Options DENY: clickjacking 방어 (admin 도용 방지)
    // - X-Content-Type-Options nosniff: MIME sniffing 차단
    // - Referrer-Policy: 외부 사이트로 풀 URL 누설 차단
    // - Permissions-Policy: 사용 안 하는 강력 권한 사전 차단
    // - CSP: Supabase Storage 이미지/Google Analytics/Gemini SDK 등 실사용 도메인만 허용
    //   ※ 'unsafe-inline'은 Next App Router 인라인 스크립트 필요 — nonce 도입 전까진 유지
    // ─────────────────────────────────────────────────────────────
    const supabaseHost = 'https://yycagcepyldhkkozommp.supabase.co';
    const csp = [
      "default-src 'self'",
      `img-src 'self' data: blob: ${supabaseHost} https://www.googletagmanager.com https://www.google-analytics.com`,
      "font-src 'self' data:",
      "style-src 'self' 'unsafe-inline'",
      `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com`,
      `connect-src 'self' ${supabaseHost} wss://yycagcepyldhkkozommp.supabase.co https://www.google-analytics.com https://generativelanguage.googleapis.com`,
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      'upgrade-insecure-requests',
    ].join('; ');

    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
          { key: 'Content-Security-Policy', value: csp },
        ],
      },
    ];
  },
};
export default nextConfig;
