import type { ReactNode } from "react";

import { MaterialIcon } from "@/components/material-icon";

type PageLoadingShellProps = {
  currentPath: "/dashboard" | "/projects" | "/settings";
  eyebrow: string;
  title: ReactNode;
  description?: string;
  children: ReactNode;
};

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/projects", label: "Projects", icon: "architecture" },
  { href: "/settings", label: "Settings", icon: "settings" }
] as const;

export function PageLoadingShell({
  currentPath,
  eyebrow,
  title,
  description,
  children
}: PageLoadingShellProps) {
  return (
    <div className="min-h-screen bg-background text-on-background">
      <aside className="fixed left-0 top-0 hidden h-screen w-72 flex-col bg-surface-container-lowest px-6 py-8 lg:flex">
        <div className="mb-12">
          <p className="font-headline text-xl font-bold tracking-tight text-primary">Studio Admin</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.3em] text-outline">
            thuangarchitect.com
          </p>
        </div>

        <nav className="flex-1 space-y-2">
          {navigation.map((item) => {
            const isActive = currentPath === item.href;

            return (
              <div
                className={
                  isActive
                    ? "flex items-center gap-4 border-l-[3px] border-secondary bg-surface-container px-4 py-3 text-sm text-primary"
                    : "flex items-center gap-4 px-4 py-3 text-sm text-outline"
                }
                key={item.href}
              >
                <MaterialIcon className="text-[20px]" name={item.icon} />
                <span className="font-label">{item.label}</span>
              </div>
            );
          })}
        </nav>

        <div className="mt-10 border-t border-outline-variant/10 pt-8">
          <div className="mb-6 px-4">
            <p className="text-xs font-semibold text-primary">Valentine Christella</p>
            <div className="mt-2 h-4 w-40 skeleton-block" />
          </div>
          <div className="flex items-center gap-4 px-4 py-3 text-left text-sm text-outline">
            <MaterialIcon className="animate-spin text-[20px]" name="progress_activity" />
            <span className="font-label">Loading...</span>
          </div>
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
              <div className="h-12 w-44 skeleton-block" />
              <div className="h-12 w-44 skeleton-block" />
            </div>
          </div>
        </header>

        <div className="px-6 py-10 md:px-10 xl:px-12 xl:py-12">{children}</div>
      </main>
    </div>
  );
}
