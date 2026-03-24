import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { hasSupabaseBrowserEnv } from "@/lib/supabase/config";

type CookieStore = Awaited<ReturnType<typeof cookies>>;
type CookieOptions = Parameters<CookieStore["set"]>[2];
type CookieToSet = {
  name: string;
  value: string;
  options?: CookieOptions;
};

export async function getSupabaseServerClient() {
  if (!hasSupabaseBrowserEnv()) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        }
      }
    }
  );
}
