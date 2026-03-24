"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { MaterialIcon } from "@/components/material-icon";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type LoginFormProps = {
  unauthorized?: boolean;
};

export function LoginForm({ unauthorized = false }: LoginFormProps) {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [email, setEmail] = useState(
    process.env.NEXT_PUBLIC_SITE_URL ? "" : "admin@thuangarchitect.com"
  );
  const [message, setMessage] = useState<string>(
    unauthorized ? "Email ini tidak masuk whitelist admin." : ""
  );
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) {
        return;
      }

      if (data.session?.user?.email) {
        router.replace("/dashboard");
        router.refresh();
      }
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session?.user?.email) {
        router.replace("/dashboard");
        router.refresh();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  return (
    <section className="w-full max-w-md">
      <div className="glass-panel relative overflow-hidden rounded-sm border border-outline-variant/10 p-10 shadow-ambient">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-secondary to-transparent" />

        <div className="mb-10">
          <h2 className="font-headline text-xl font-semibold text-on-surface-variant">
            Secure Entry
          </h2>
          <p className="mt-2 text-sm text-outline">
            Minta magic link untuk masuk ke dashboard studio.
          </p>
        </div>

        <form
          className="space-y-8"
          onSubmit={(event) => {
            event.preventDefault();

            startTransition(async () => {
              setMessage("");

              if (!supabase) {
                setMessage("Isi env Supabase dulu agar magic link bisa aktif.");
                return;
              }

              const redirectTo = `${window.location.origin}/auth/callback`;

              const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                  emailRedirectTo: redirectTo
                }
              });

              if (error) {
                setMessage(error.message);
                return;
              }

              setMessage(
                "Magic link terkirim. Kalau email masih mendarat di login, app akan otomatis terus ke dashboard setelah session terbentuk."
              );
            });
          }}
        >
          <div>
            <label
              className="mb-3 block text-[10px] font-bold uppercase tracking-[0.34em] text-secondary"
              htmlFor="email"
            >
              Architect Identity
            </label>
            <input
              className="field-input text-base"
              id="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@thuangarchitect.com"
              type="email"
              value={email}
            />
          </div>

          <button className="primary-button w-full" disabled={isPending || !email} type="submit">
            <MaterialIcon className="text-[18px]" name="arrow_forward" />
            {isPending ? "Sending..." : "Send Magic Link"}
          </button>
        </form>

        <div className="mt-10 border-t border-outline-variant/20 pt-6 text-[11px] text-outline">
          {message ||
            "Akses dibatasi untuk satu admin. Session dan route protection mengikuti Supabase SSR."}
        </div>
      </div>
    </section>
  );
}
