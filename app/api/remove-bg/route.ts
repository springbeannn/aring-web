import { NextRequest, NextResponse } from 'next/server';

// remove.bg는 5~15초 걸릴 수 있어 타임아웃 여유 확보
export const runtime = 'nodejs';
export const maxDuration = 30;

// ────────────────────────────────────────────────────────────
// POST /api/remove-bg
// FormData('image_file': File) → PNG 바이너리 반환
//
// 클라이언트는 res.blob() 으로 받아 사용.
// 에러 시 상태 코드와 JSON 메시지 반환 → 클라이언트는 fallback 처리.
// ────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const apiKey = process.env.REMOVE_BG_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'REMOVE_BG_API_KEY 환경변수가 설정되지 않았습니다.' },
      { status: 500 },
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'multipart/form-data 가 아닙니다.' }, { status: 400 });
  }

  const file = formData.get('image_file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'image_file 필드(File)가 필요합니다.' }, { status: 400 });
  }

  // remove.bg upstream 호출
  const upstream = new FormData();
  upstream.append('image_file', file, file.name || 'upload.jpg');
  upstream.append('size', 'auto');     // 입력 사이즈 보존 (max 25MP)
  upstream.append('format', 'png');    // 투명도 유지

  let upstreamRes: Response;
  try {
    upstreamRes = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: { 'X-Api-Key': apiKey },
      body: upstream,
    });
  } catch (e) {
    return NextResponse.json(
      { error: 'remove.bg 서버 연결 실패', detail: String(e) },
      { status: 502 },
    );
  }

  if (!upstreamRes.ok) {
    // 402 결제 한도, 429 rate limit, 4xx 입력 오류 → 클라이언트가 fallback
    let detail: unknown = null;
    try {
      detail = await upstreamRes.json();
    } catch {
      detail = await upstreamRes.text().catch(() => null);
    }
    return NextResponse.json(
      { error: 'remove.bg 처리 실패', status: upstreamRes.status, detail },
      { status: upstreamRes.status },
    );
  }

  const buffer = await upstreamRes.arrayBuffer();
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'no-store',
      // remove.bg가 반환하는 크레딧 헤더를 그대로 전달 (디버깅용)
      ...(upstreamRes.headers.get('x-credits-charged')
        ? { 'X-Credits-Charged': upstreamRes.headers.get('x-credits-charged')! }
        : {}),
    },
  });
}
