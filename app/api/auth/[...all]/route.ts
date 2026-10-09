import { auth } from "@/lib/auth"; // Adjust this path if your auth.ts is elsewhere
import { toNextJsHandler } from "better-auth/next-js"; // If using Next.js specific wrapper

// Better Auth handles all GET and POST requests to /api/auth/*
export const { GET, POST } = toNextJsHandler(auth);

// Or if you are using standard web standards without the Next.js wrapper:
// export const GET = auth.handler;
// export const POST = auth.handler;