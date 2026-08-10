"use server";

export async function getAzureSpeechToken() {
  const speechKey = process.env.AZURE_SPEECH_KEY;
  const speechRegion = process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION;

  if (!speechKey || !speechRegion) {
    throw new Error("Azure Speech credentials are not configured on the server.");
  }

  try {
    // We hit the Azure token endpoint to trade our secret key for a temporary token
    const response = await fetch(
      `https://${speechRegion}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
      {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": speechKey,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        // In Next.js, we don't want to aggressively cache this token since it expires
        cache: "no-store", 
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch token: ${response.statusText}`);
    }

    const token = await response.text();
    return token;
  } catch (error) {
    console.error("Error fetching Azure token:", error);
    throw new Error("Could not generate speech token");
  }
}