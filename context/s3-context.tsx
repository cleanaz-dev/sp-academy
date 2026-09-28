// @/context/s3-context.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getPresignedUrls } from "@/app/actions/s3";

interface S3ContextType {
  urlCache: Record<string, string>;
  resolveKeys: (keys: string[]) => Promise<void>;
}

const S3Context = createContext<S3ContextType | null>(null);

export function S3Provider({ children }: { children: ReactNode }) {
  const [urlCache, setUrlCache] = useState<Record<string, string>>({});

  const resolveKeys = async (keys: string[]) => {
    // Filter out keys we already have in cache or empty keys
    const missingKeys = keys.filter((key) => key && !urlCache[key]);
    
    if (missingKeys.length === 0) return; // Everything is cached!

    // Fetch only the missing keys
    const newUrls = await getPresignedUrls(missingKeys);

    // Update the cache
    setUrlCache((prev) => ({ ...prev, ...newUrls }));
  };

  return (
    <S3Context.Provider value={{ urlCache, resolveKeys }}>
      {children}
    </S3Context.Provider>
  );
}

// Custom Hook to use inside your Step Components
export function useS3Media(keys: (string | undefined)[]) {
  const context = useContext(S3Context);
  if (!context) throw new Error("useS3Media must be used within an S3Provider");

  const [isLoading, setIsLoading] = useState(true);

  // Clean the input array of undefined/nulls
  const validKeys = keys.filter(Boolean) as string[];

  useEffect(() => {
    let isMounted = true;
    
    setIsLoading(true);
    context.resolveKeys(validKeys).then(() => {
      if (isMounted) setIsLoading(false);
    });

    return () => { isMounted = false; };
  }, [JSON.stringify(validKeys)]); // Re-run if the requested keys change

  // Return the resolved URLs in the exact order they were requested
  const resolvedUrls = keys.map(key => (key ? context.urlCache[key] || "" : ""));

  return {
    urls: resolvedUrls,
    isLoading
  };
}