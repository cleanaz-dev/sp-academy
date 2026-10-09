import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextResponse } from "next/server";

const handler = toNextJsHandler(auth);

export const POST = handler.POST;

export async function GET(req: Request) {
  const res = await handler.GET(req);
  const url = new URL(req.url);

  const isGoogleCallback = url.pathname.startsWith("/api/auth/callback/");

  if (isGoogleCallback && res.status === 403) {
    let message = "";
    try {
      const body = await res.clone().json();
      message = body?.message ?? "";
    } catch {}

    if (message.includes("SUBSCRIPTION_REQUIRED")) {
      const redirect = NextResponse.redirect(
        new URL("/sign-in?error=subscription_required", url.origin),
        302
      );

      // Keep any cookies Better Auth set or cleared (e.g. OAuth state)
      res.headers
        .getSetCookie()
        .forEach((c) => redirect.headers.append("set-cookie", c));

      return redirect;
    }
  }

  return res;
}