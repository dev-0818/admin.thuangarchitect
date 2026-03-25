import type { ReactNode } from "react";

import { signOutAction } from "@/app/actions";
import { LoadingLinkButton } from "@/components/loading-link-button";
import { NavigationLoadingOverlay } from "@/components/navigation-loading-overlay";
import { LogoutForm } from "@/components/logout-form";
import { ManualBuildButton } from "@/components/manual-build-button";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

type AdminShellProps = {
  currentPath: "/dashboard" | "/projects" | "/settings";
  eyebrow: string;
  title: ReactNode;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
};

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/projects", label: "Projects", icon: "architecture" },
  { href: "/settings", label: "Settings", icon: "settings" }
] as const;

export async function AdminShell({
  currentPath,
  eyebrow,
  title,
  description,
  children,
  actions
}: AdminShellProps) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = (await supabase?.auth.getUser()) ?? { data: { user: null } };
  const userEmail = user?.email ?? process.env.ADMIN_EMAIL ?? "";

  return (
    <div className="min-h-screen bg-background text-on-background">
      <NavigationLoadingOverlay />
      <aside className="fixed left-0 top-0 hidden h-screen w-72 flex-col bg-surface-container-lowest px-6 py-8 lg:flex">
        <div className="mb-12">
          <p className="font-headline text-xl font-bold tracking-tight text-primary">
            Studio Admin
          </p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.3em] text-outline">
            thuangarchitect.com
          </p>
        </div>

        <nav className="flex-1 space-y-2">
          {navigation.map((item) => {
            const isActive = currentPath === item.href;

            return (
              <LoadingLinkButton
                active={isActive}
                className={cn(
                  "flex w-full items-center gap-4 px-4 py-3 text-sm transition",
                  isActive
                    ? "border-l-[3px] border-secondary bg-surface-container text-primary"
                    : "text-outline hover:bg-surface-container hover:text-primary"
                )}
                href={item.href}
                icon={item.icon}
                key={item.href}
                loadingLabel="Opening..."
                variant="nav"
              >
                <span className="font-label">{item.label}</span>
              </LoadingLinkButton>
            );
          })}
        </nav>

        <div className="mt-10 border-t border-outline-variant/10 pt-8">
          <div className="mb-6 px-4">
            <p className="text-xs font-semibold text-primary">Valentine Christella</p>
            <p className="mt-2 break-all text-xs text-outline">{userEmail}</p>
          </div>
          <LogoutForm action={signOutAction as unknown as (formData: FormData) => Promise<void>} />
        </div>
      </aside>

      <main className="min-h-screen lg:ml-72">
        <header className="sticky top-0 z-30 border-b border-outline-variant/10 bg-background/75 px-6 py-5 backdrop-blur-xl md:px-10 xl:px-12">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.36em] text-secondary">
                {eyebrow}
              </p>
              <h1 className="font-headline text-4xl font-black tracking-tight text-on-surface md:text-5xl">
                {title}
              </h1>
              {description ? (
                <p className="mt-4 max-w-2xl text-sm leading-7 text-on-surface-variant">
                  {description}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col items-start gap-4 xl:items-end">
              {actions}
              <ManualBuildButton />
            </div>
          </div>
        </header>

        <div className="px-6 py-10 md:px-10 xl:px-12 xl:py-12">{children}</div>
      </main>
    </div>
  );
}
