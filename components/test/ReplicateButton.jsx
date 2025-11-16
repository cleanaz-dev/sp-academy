"use client";
import { useState } from "react";
import { Button } from "../old-ui/button";

export default function ReplicateButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleReplicatePost = async () => {
    setIsLoading(true);

    try {
      const prompt =
        "Avatar (headshot, above the neck) of character based on the title Doctor Visit";
      const model = "black-forest-labs/flux-schnell";

      // Send prompt to api/replicate
      const response = await fetch("/api/replicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, model }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from server");
      }

      const data = await response.json();
      console.log("Replicate response:", data);

      // You can handle the response data here, like setting a state for the result
    } catch (error) {
      console.error("Error replicating post:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleReplicatePost} disabled={isLoading}>
      {isLoading ? "Replicating..." : "Replicate POST"}
    </Button>
  );
}
