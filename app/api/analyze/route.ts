import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: '이미지가 없습니다' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
이 귀걸이(또는 장신구) 사진을 분석해서 아래 JSON 형식으로만 응답해줘.
다른 설명이나 마크다운 없이 JSON만 출력해.

{
  "shape": "형태를 한국어로 간결하게 (예: 서클 / 스터드, 드롭 / 후프)",
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
    const analysis = JSON.parse(cleaned);

    return NextResponse.json({ analysis });
  } catch (err) {
    console.error('[aring] analyze error', err);
    return NextResponse.json({ error: '분석 실패' }, { status: 500 });
  }
}