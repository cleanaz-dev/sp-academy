import Replicate from "replicate";

// Initialize the Replicate client
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export const createAiAvatar = async (
  title,
  gender = "neutral",
  role = "avatar"
) => {
  console.log(
    `Starting createAiAvatar with title: ${title}, gender: ${gender}, and role: ${role}`
  );

  try {
    // Constructing the prompt
    const prompt =
      gender === "male"
        ? `Male avatar headshot, zoomed in with neutral expression, clean background with a dynamic ${title}, photorealistic style, dressed as a ${role}.`
        : gender === "female"
        ? `Female avatar headshot, zoomed in with neutral expression, clean background with a dynamic ${title}, photorealistic style, dressed as a ${role}.`
        : `AI avatar headshot, zoomed in with neutral expression, clean background with a dynamic ${title}, photorealistic style, dressed as a ${role}.`;

    // Generate image using Replicate
    const prediction = await replicate.predictions.create({
      model: "black-forest-labs/flux-schnell",
      input: {
        aspect_ratio: "1:1",
        cfg: 3.5,
        output_format: "webp",
        output_quality: 90,
        prompt: prompt,
        prompt_strength: 0.85,
        steps: 35,
      },
    });

    const finishedPrediction = await replicate.wait(prediction);

    if (!finishedPrediction?.output?.[0]) {
      throw new Error("No output received from Replicate");
    }

    const replicateImageUrl = finishedPrediction.output[0];
    console.log("Replicate image URL:", replicateImageUrl);

    // Determine API URL for upload
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const uploadUrl = `${apiUrl}/api/conversation/upload-avatar-image`;

    // Upload to S3
    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageUrl: replicateImageUrl,
      }),
    });

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed with status: ${uploadResponse.status}`);
    }

    const uploadResult = await uploadResponse.json();
    console.log("Upload result:", uploadResult);

    if (!uploadResult.success || !uploadResult.imageUrl) {
      throw new Error(uploadResult.error || "Failed to get upload URL");
    }

    return uploadResult.imageUrl;
  } catch (error) {
    console.error("Error in createAiAvatar:", {
      message: error.message,
      stack: error.stack,
      title,
      gender,
      role,
    });
    throw new Error(`Avatar creation failed: ${error.message}`);
  }
};

export const uploadImage = async (imageUrl) => {
  try {
    // Determine API URL for upload
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const uploadUrl = `${apiUrl}/api/conversation/upload-achievement-badge`;

    // Upload to S3
    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageUrl: imageUrl,
      }),
    });

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed with status: ${uploadResponse.status}`);
    }

    const uploadResult = await uploadResponse.json();
    console.log("Upload result:", uploadResult);

    if (!uploadResult.success || !uploadResult.imageUrl) {
      throw new Error(uploadResult.error || "Failed to get upload URL");
    }

    return uploadResult.imageUrl;
  } catch (error) {
    console.error("Error in uploadImage:", {
      message: error.message,
      stack: error.stack,
    });
    throw new Error(`Image upload failed: ${error.message}`);
  }
};

export const createAchievementBadges = async (achievement) => {
  

  const { name, description, category: {name: categoryName} } = achievement;
  console.log("name:", name, "description:", description, "categoryName:", categoryName);

  try {
    // Constructing the prompt
    const prompt = `A vibrant, illustrative badge titled "${name}" from the "${categoryName}" category. This badge is awarded for: ${description}. The design should feature symbols or elements that represent the essence of the achievement, like a checkmark, a calendar, or a progress bar. The style should be modern, friendly, and approachable with a color palette that conveys both accomplishment and encouragement. The badge should have a polished look, perfect for display on a website’s achievement section, with clear, recognizable design elements that highlight the user’s commitment.
    Rule: No small text.`;

  

    // Generate image using Replicate
    const prediction = await replicate.predictions.create({
      model: "black-forest-labs/flux-schnell",
      input: {
        aspect_ratio: "1:1",
        cfg: 3.5,
        output_format: "webp",
        output_quality: 90,
        num_outputs: 4,
        prompt: prompt,
        prompt_strength: 0.85,
        steps: 35,
        num_inference_steps: 4 

      },
    });

    const finishedPrediction = await replicate.wait(prediction);

    if (!finishedPrediction?.output?.length) {
      throw new Error("No output received from Replicate");
    }

    const replicateImageUrls = finishedPrediction.output;
    console.log("Replicate image URLs:", replicateImageUrls);

    return replicateImageUrls;
  } catch (error) {
    console.error("Error in createAchievementBadges:", {
      message: error.message,
      stack: error.stack,
      achievement,
    });
    throw new Error(`Achievement badge creation failed: ${error.message}`);
  }
};


export const createImagesForLecture = async (imagePrompt) => {
  console.log("Running createImagesForLecture with prompt:", imagePrompt);
  try {
    const prediction = await replicate.predictions.create({
      model: "recraft-ai/recraft-v3",
      input: {
        prompt: imagePrompt, // Use the passed prompt
        size: "1024x1024",
        style: "digital_illustration"
      },
    });

    const finishedPrediction = await replicate.wait(prediction);
    console.log("Finished prediction:", finishedPrediction);

    // Ensure output exists and extract the image URL
    const replicateImageUrl = finishedPrediction.output; 

    if (!replicateImageUrl) {
      throw new Error("No output received from Replicate");
    }

    console.log("Replicate image URL:", replicateImageUrl);
    return replicateImageUrl;
  } catch (error) {
    console.error("Error in createImagesForLecture:", {
      message: error.message,
      stack: error.stack,
      imagePrompt,
    });
    throw new Error(`Image creation failed: ${error.message}`);
  }
};

export const createMainImageForLecture = async (imagePrompt) => {
  console.log("Running createMainImageForLecture with prompt:", imagePrompt);
  try {
    const prediction = await replicate.predictions.create({
      model: "recraft-ai/recraft-v3",
      input: {
        prompt: `Course named: ${imagePrompt} create professional cover image that will be shown a website next to course information. [do not create any glasses]`, // Use the passed prompt
        size: "1365x1024",
        style: "digital_illustration"
      },
    });
    const finishedPrediction = await replicate.wait(prediction);
    console.log("Finished prediction:", finishedPrediction);
    // Ensure output exists and extract the image URL
    const replicateImageUrl = finishedPrediction.output;
    if (!replicateImageUrl) {
      throw new Error("No output received from Replicate");
    }
    console.log("Replicate image URL:", replicateImageUrl);
    return replicateImageUrl;
    } catch (error) {
      console.error("Error in createMainImageForLecture:", {
        message: error.message,
        stack: error.stack,
        imagePrompt,
      });
      throw new Error(`Image creation failed: ${error.message}`);
    
    }
}