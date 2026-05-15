import { ImageResponse } from 'next/og'

export const alt = 'aring — 한 짝의 짝을 찾다'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// 한글 글리프 렌더링을 위해 Pretendard Bold OTF 로드 (실패 시 기본 폰트로 fallback)
async function loadPretendardBold(): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(
      'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/public/static/Pretendard-Bold.otf',
      { cache: 'force-cache' },
    )
    if (!res.ok) return null
    return await res.arrayBuffer()
  } catch {
    return null
  }
}

export default async function OpenGraphImage() {
  const fontData = await loadPretendardBold()

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #2A4A3C 0%, #1C3328 100%)',
          padding: '80px',
          color: 'white',
          fontFamily: fontData ? 'Pretendard' : undefined,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: 44,
            opacity: 0.8,
            letterSpacing: -1,
          }}
        >
          aring
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 132,
            fontWeight: 800,
            marginTop: 28,
            letterSpacing: -5,
            lineHeight: 1,
          }}
        >
          한 짝의 짝
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 36,
            marginTop: 44,
            opacity: 0.88,
            maxWidth: 980,
            lineHeight: 1.4,
          }}
        >
          잃어버린 귀걸이의 짝, AI가 찾아드립니다
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 64,
            left: 80,
            fontSize: 24,
            opacity: 0.55,
            letterSpacing: 0.5,
          }}
        >
          aring.app
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fontData
        ? [{ name: 'Pretendard', data: fontData, style: 'normal', weight: 700 }]
        : undefined,
    },
  )
}
