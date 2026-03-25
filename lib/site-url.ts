import { NextRequest } from "next/server";

export function buildPublicUrl(request: NextRequest, pathname: string) {
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost ?? request.headers.get("host");

  if (host) {
    const protocol =
      forwardedProto ??
      (host.includes("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");

    return new URL(pathname, `${protocol}://${host}`);
  }

  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return new URL(pathname, process.env.NEXT_PUBLIC_SITE_URL);
  }

  return new URL(pathname, request.url);
}
