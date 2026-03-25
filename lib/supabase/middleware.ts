import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { hasSupabaseBrowserEnv } from "@/lib/supabase/config";

type ResponseCookies = NextResponse["cookies"];
type CookieOptions = Parameters<ResponseCookies["set"]>[2];
type CookieToSet = {
  name: string;
  value: string;
  options?: CookieOptions;
};

type UpdateSessionResult = {
  response: NextResponse;
  user: { email?: string | null } | null;
};

function clearAuthCookies(request: NextRequest, response: NextResponse) {
  request.cookies
    .getAll()
    .filter((cookie) => cookie.name.includes("auth-token"))
    .forEach((cookie) => {
      request.cookies.set(cookie.name, "");
      response.cookies.set(cookie.name, "", {
        maxAge: 0,
        path: "/"
      });
    });
}

export async function updateSession(request: NextRequest) {
  if (!hasSupabaseBrowserEnv()) {
    return {
      response: NextResponse.next({ request }),
      user: null
    } satisfies UpdateSessionResult;
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers
    }
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({
            request
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        }
      }
    }
  );

  try {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    return {
      response,
      user
    } satisfies UpdateSessionResult;
  } catch {
    clearAuthCookies(request, response);

    return {
      response,
      user: null
    } satisfies UpdateSessionResult;
  }
}
