import Replicate from "replicate";

// Initialize the Replicate client
export const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});
