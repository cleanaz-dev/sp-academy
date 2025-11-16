"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/old-ui/button";
import { toast } from "sonner";

export default function TestButton() {
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const handleButtonClick = async () => {
    try {
      // set loading state to true
      setText("");
      setLoading(true);
      // Call the API route and handle the response
      const response = await fetch("/api/lessons/lecture/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Solar System",
          topic: "Planets and their moons",
          level: "Grade 5",
          subject: "Science",
          focusArea: "Distance from the sun and days compared to Earth Days",
        }),
      });

      if (!response.ok) {
        toast.error("Failed to fetch data");
      }

      const data = await response.json();
      setText(data.responseText);

      toast.success("Data fetched successfully");
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button variant="outline" onClick={handleButtonClick}>
        {loading ? "Testing..." : "Test API Route"}
      </Button>

      <div>{text && <p className="text-xs">{text}</p>}</div>
    </div>
  );
}
