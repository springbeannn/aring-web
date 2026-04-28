import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY not set' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const { imageBase64, mimeType } = await req.json();

    console.log('[aring] imageBase64 length:', imageBase64?.length);

    if (!imageBase64) {
      return NextResponse.json(
        { error: '이미지가 없습니다' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-lite',
    });

    const prompt = `
이 귀걸이(또는 장신구) 사진을 분석해서 아래 JSON 형식으로만 응답해줘.
다른 설명이나 마크다운 없이 JSON만 출력해.

{
  "shape": "형태를 한국어로 간결하게 (예: 서클 / 스터드 / 드롭 / 후프)",
  "material": "소재를 한국어로 간결하게 (예: 스털링 실버 + 진주, 골드 도금)",
  "detail": "구별되는 디테일을 한국어로 간결하게 (예: 6mm · 광택 마감, 체인 연결 · 미니멀)"
}
`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: imageBase64,
        },
      },
    ]);

    const text = result.response.text().trim();
    const cleaned = text.replace(/```json|```/g, '').trim();

    let analysis;

    try {
      analysis = JSON.parse(cleaned);
    } catch (parseError) {
      console.error('[aring] JSON parse error', cleaned);
      return NextResponse.json(
        { error: 'JSON 파싱 실패', raw: cleaned },
        { status: 500 }
      );
    }

    return NextResponse.json({ analysis });
  } catch (err: unknown) {
    console.error('[aring] analyze error', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: '분석 실패', detail: message },
      { status: 500 }
    );
  }
}
