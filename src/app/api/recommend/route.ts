import { NextResponse } from "next/server";

interface WeatherData {
  temp: string;
  condition: string;
  humidity: string;
}

async function fetchWeather(): Promise<WeatherData> {
  try {
    const res = await fetch("https://wttr.in/Seoul?format=j1", {
      signal: AbortSignal.timeout(5000),
    });
    const data = await res.json();
    const current = data.current_condition[0];
    return {
      temp: `${current.temp_C}°C`,
      condition: current.weatherDesc[0].value,
      humidity: `${current.humidity}%`,
    };
  } catch {
    return { temp: "알 수 없음", condition: "알 수 없음", humidity: "알 수 없음" };
  }
}

function getSeason(month: number): string {
  if (month >= 3 && month <= 5) return "봄";
  if (month >= 6 && month <= 8) return "여름";
  if (month >= 9 && month <= 11) return "가을";
  return "겨울";
}

function getDayOfWeek(day: number): string {
  return ["일", "월", "화", "수", "목", "금", "토"][day] + "요일";
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY not configured");
    }

    const body = await request.json().catch(() => ({}));
    const existingMenus: string[] = body.existingMenus ?? [];

    const weather = await fetchWeather();
    const now = new Date();
    const season = getSeason(now.getMonth() + 1);
    const dayOfWeek = getDayOfWeek(now.getDay());

    const existingMenuText =
      existingMenus.length > 0
        ? `\n현재 제안된 메뉴: ${existingMenus.join(", ")}`
        : "";

    const prompt = `당신은 점심 메뉴 추천 전문가입니다.
다음 조건을 고려해서 점심 메뉴 3개를 추천해주세요.

조건:
- 날씨: ${weather.condition}, 기온: ${weather.temp}, 습도: ${weather.humidity}
- 계절: ${season}
- 요일: ${dayOfWeek}${existingMenuText}

규칙:
- 이미 제안된 메뉴와 겹치지 않게 추천
- 각 메뉴마다 추천 이유를 날씨/계절과 연결해서 한 줄로 설명
- JSON 형식으로만 응답

응답 형식:
{
  "weather_summary": "오늘 날씨 한 줄 요약",
  "recommendations": [
    { "menu": "메뉴명", "reason": "추천 이유" },
    { "menu": "메뉴명", "reason": "추천 이유" },
    { "menu": "메뉴명", "reason": "추천 이유" }
  ]
}`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.8,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!res.ok) {
      throw new Error(`Gemini API error: ${res.status}`);
    }

    const data = await res.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      return NextResponse.json(
        { error: "AI 응답이 비어있습니다." },
        { status: 500 }
      );
    }

    const result = JSON.parse(content);
    return NextResponse.json(result);
  } catch (error) {
    console.error("AI 추천 실패:", error);
    return NextResponse.json(
      { error: "AI 추천에 실패했습니다." },
      { status: 500 }
    );
  }
}
