import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as Blob | null;
    const referenceText = formData.get("transcript") as string;
    const language = (formData.get("language") as string) || "fr-FR";

    if (!audioFile || !referenceText) {
      return NextResponse.json(
        { error: "Audio and transcript are required" },
        { status: 400 }
      );
    }

    const speechKey = process.env.AZURE_SPEECH_KEY;
    const speechRegion = process.env.AZURE_SPEECH_REGION;

    if (!speechKey || !speechRegion) {
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

    // 3. Detect the MIME type from the incoming blob (defaults to audio/webm; codecs=opus)
    const contentType = audioFile.type || "audio/webm; codecs=opus";

    // 4. Send directly to Azure STT REST endpoint
    const url = `https://${speechRegion}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=${language}&format=detailed`;

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

    if (!azureResponse.ok) {
      const errorText = await azureResponse.text();
      console.error("❌ Azure API error response:", errorText);
      return NextResponse.json(
        { error: `Azure error (${azureResponse.status}): ${errorText}` },
        { status: azureResponse.status }
      );
    }

    const data = await azureResponse.json();

    // 5. Check if recognition succeeded
    if (data.RecognitionStatus !== "Success" && data.RecognitionStatus !== "NoMatch") {
      console.warn("⚠️ Azure STT status:", data.RecognitionStatus);
    }

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
    console.error("❌ Azure Pronunciation Assessment Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}