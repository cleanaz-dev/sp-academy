// app/api/grammar-check/route.ts
export async function POST(req: Request) {
  const { text, language } = await req.json();
  console.log("text lang:", language)
  // Map common language names to LanguageTool codes
  const languageMap: Record<string, string> = {
    french: "fr",
    english: "en-US",
    spanish: "es",
    german: "de-DE",
    portuguese: "pt-PT",
    italian: "it",
    dutch: "nl",
    polish: "pl",
    russian: "ru",
    chinese: "zh-CN",
    japanese: "ja",
    arabic: "ar",
  };

  const langCode = languageMap[language?.toLowerCase()] ?? "auto";

  const params = new URLSearchParams({
    text,
    language: langCode,
  });

  const response = await fetch("https://api.languagetool.org/v2/check", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  const rawText = await response.text();
  console.log("LanguageTool response:", rawText);

  if (!rawText) {
    return Response.json({ improved: text, corrections: [], hasErrors: false });
  }

  const data = JSON.parse(rawText);

  let improved = text;
  let offset = 0;
  for (const match of data.matches) {
    if (!match.replacements.length) continue;
    const best = match.replacements[0].value;
    const start = match.offset + offset;
    const end = start + match.length;
    improved = improved.slice(0, start) + best + improved.slice(end);
    offset += best.length - match.length;
  }

  return Response.json({
    improved,
    corrections: data.matches,
    hasErrors: data.matches.length > 0,
  });
}