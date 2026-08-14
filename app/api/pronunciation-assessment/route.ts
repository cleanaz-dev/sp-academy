import { NextResponse } from "next/server";

// Helper to convert any format ("French", "fr", "fr-fr") to Azure standard locale ("fr-FR")
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
  console.log("🚀 [Azure Pronunciation] Request received");

  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as Blob | null;
    const referenceText = formData.get("transcript") as string;
    const rawLanguage = (formData.get("language") as string) || "fr-FR";
    const language = normalizeAzureLocale(rawLanguage);

    console.log("📋 [Azure Pronunciation] Details:", {
      referenceText,
      rawLanguage,
      normalizedLanguage: language,
      audioFileSize: audioFile?.size,
      audioFileType: audioFile?.type,
    });

    if (!audioFile || !referenceText) {
      console.error("❌ Missing audio or transcript");
      return NextResponse.json(
        { error: "Audio and transcript are required" },
        { status: 400 }
      );
    }

    const speechKey = process.env.AZURE_SPEECH_KEY;
    const speechRegion = process.env.AZURE_SPEECH_REGION;

    if (!speechKey || !speechRegion) {
      console.error("❌ Missing AZURE_SPEECH_KEY or AZURE_SPEECH_REGION in .env");
      return NextResponse.json(
        { error: "Azure Speech credentials not configured" },
        { status: 500 }
      );
    }

    // 1. Build the Pronunciation Assessment Config header
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

    // 2. Read the audio bytes directly
    const audioBuffer = await audioFile.arrayBuffer();

    // 3. Azure short-audio REST format
    // For WebM from browser MediaRecorder:
    let contentType = "audio/webm; codecs=opus";
    if (audioFile.type && audioFile.type.includes("mp4")) {
      contentType = "audio/mp4";
    }

    // 4. Send to Azure STT REST endpoint
    const url = `https://${speechRegion}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=${language}&format=detailed`;
    console.log("🌐 Calling Azure URL:", url);

    const azureResponse = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": contentType,
        "Ocp-Apim-Subscription-Key": speechKey,
        "Pronunciation-Assessment": pronAssessmentHeader,
      },
      body: audioBuffer,
    });

    console.log("📡 Azure Status Code:", azureResponse.status);

    if (!azureResponse.ok) {
      const errorText = await azureResponse.text();
      console.error("❌ Azure API Error Body:", errorText);
      return NextResponse.json(
        { error: `Azure error (${azureResponse.status}): ${errorText}` },
        { status: azureResponse.status }
      );
    }

    const data = await azureResponse.json();
    console.log("✅ Azure Raw Response:", JSON.stringify(data, null, 2));

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

    console.log("🎯 Parsed Assessment to return:", assessment);
    return NextResponse.json(assessment);
  } catch (error: any) {
    console.error("❌ Uncaught Azure Pronunciation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}