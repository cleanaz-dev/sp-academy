import { NextResponse } from "next/server";
import { getAzureSpeechToken } from "@/app/actions/azure-speech"; // <-- Adjust path to wherever your file is located

function normalizeAzureLocale(lang: string = "fr-FR"): string {
  const clean = lang.toLowerCase().trim();
  const map: Record<string, string> = {
    french: "fr-FR",
    fr: "fr-FR",
    "fr-fr": "fr-FR",
    spanish: "es-ES",
    es: "es-ES",
    "es-es": "es-ES",
    english: "en-US",
    en: "en-US",
    "en-us": "en-US",
    german: "de-DE",
    de: "de-DE",
    italian: "it-IT",
    it: "it-IT",
    japanese: "ja-JP",
    ja: "ja-JP",
    chinese: "zh-CN",
    zh: "zh-CN",
  };
  return map[clean] || lang;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as Blob | null;
    const referenceText = formData.get("transcript") as string;
    const rawLanguage = (formData.get("language") as string) || "fr-FR";
    const language = normalizeAzureLocale(rawLanguage);

    if (!audioFile || !referenceText) {
      return NextResponse.json(
        { error: "Audio and transcript are required" },
        { status: 400 }
      );
    }

    const speechRegion =
      process.env.AZURE_SPEECH_REGION ||
      process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION ||
      "canadacentral";

    // 1. Obtain Azure Access Token using your server function
    let accessToken: string;
    try {
      accessToken = await getAzureSpeechToken();
    } catch (err: any) {
      console.error("❌ Failed to get Azure token via helper:", err);
      return NextResponse.json(
        { error: `Auth failed: ${err.message}` },
        { status: 401 }
      );
    }

    // 2. Build Pronunciation Assessment Header
    const pronConfig = {
      ReferenceText: referenceText,
      GradingSystem: "HundredMark",
      Granularity: "Word",
      Dimension: "Comprehensive",
      EnableMiscue: "True",
      EnableProsodyAssessment: "True",
    };

    const pronAssessmentHeader = Buffer.from(
      JSON.stringify(pronConfig)
    ).toString("base64");

    // 3. Audio payload setup
    const audioBuffer = await audioFile.arrayBuffer();
    let contentType = "audio/webm; codecs=opus";
    if (audioFile.type && audioFile.type.includes("mp4")) {
      contentType = "audio/mp4";
    }

    // 4. Send to Speech STT using Bearer Token
    const url = `https://${speechRegion}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=${language}&format=detailed`;

    const azureResponse = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": contentType,
        Authorization: `Bearer ${accessToken}`,
        "Pronunciation-Assessment": pronAssessmentHeader,
      },
      body: audioBuffer,
    });

    if (!azureResponse.ok) {
      const errorText = await azureResponse.text();
      console.error("❌ Azure Speech STT Error:", errorText);
      return NextResponse.json(
        { error: `Azure error (${azureResponse.status}): ${errorText}` },
        { status: azureResponse.status }
      );
    }

    const data = await azureResponse.json();
    console.log("✅ Azure Result:", JSON.stringify(data, null, 2));

    const nBest = data.NBest?.[0];
    const pronData = nBest?.PronAssessment || {};

    const assessment = {
      score: Math.round(pronData.PronScore ?? nBest?.PronScore ?? 0),
      accuracyScore: Math.round(pronData.AccuracyScore ?? nBest?.AccuracyScore ?? 0),
      fluencyScore: Math.round(pronData.FluencyScore ?? nBest?.FluencyScore ?? 0),
      completenessScore: Math.round(pronData.CompletenessScore ?? nBest?.CompletenessScore ?? 0),
      prosodyScore: pronData.ProsodyScore ? Math.round(pronData.ProsodyScore) : undefined,
      words:
        nBest?.Words?.map((w: any) => ({
          word: w.Word,
          accuracyScore: Math.round(
            w.PronAssessment?.AccuracyScore ?? w.AccuracyScore ?? 0
          ),
          errorType: w.PronAssessment?.ErrorType ?? "None",
          phonemes: w.Phonemes?.map((p: any) => ({
            phoneme: p.Phoneme,
            accuracyScore: Math.round(
              p.PronAssessment?.AccuracyScore ?? p.AccuracyScore ?? 0
            ),
          })),
        })) || [],
    };

    return NextResponse.json(assessment);
  } catch (error: any) {
    console.error("❌ Route error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}