import { createAuthClient } from "better-auth/react";
import { usernameClient, inferAdditionalFields, adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000", // <-- ADD THIS
  plugins: [
    adminClient(),
    usernameClient(),
    inferAdditionalFields({
      user: {
        firstName: { type: "string" },
        lastName: { type: "string" },
      },
    }),
  ],
});