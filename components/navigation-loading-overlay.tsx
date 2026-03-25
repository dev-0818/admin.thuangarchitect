"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

import { PageLoadingShell } from "@/components/page-loading-shell";

function resolveTargetPath(href: string): "/dashboard" | "/projects" | "/settings" {
  if (href.startsWith("/settings")) {
    return "/settings";
  }

  if (href.startsWith("/projects")) {
    return "/projects";
  }

  return "/dashboard";
}

function OverlayContent({ currentPath }: { currentPath: "/dashboard" | "/projects" | "/settings" }) {
  if (currentPath === "/dashboard") {
    return (
      <>
        <section className="mb-12 grid gap-4 xl:grid-cols-12">
          <div className="section-card xl:col-span-4"><div className="h-40 w-full skeleton-block" /></div>
          <div className="section-card xl:col-span-3"><div className="h-40 w-full skeleton-block" /></div>
          <div className="section-card xl:col-span-2"><div className="h-40 w-full skeleton-block" /></div>
          <div className="section-card xl:col-span-3"><div className="h-40 w-full skeleton-block" /></div>
        </section>
        <section className="section-card space-y-4">
          <div className="h-10 w-64 skeleton-block" />
          <div className="h-28 w-full skeleton-block" />
          <div className="h-28 w-full skeleton-block" />
          <div className="h-28 w-full skeleton-block" />
        </section>
      </>
    );
  }

  if (currentPath === "/settings") {
    return (
      <div className="grid gap-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section className="section-card">
          <div className="h-72 w-full skeleton-block" />
        </section>
        <section className="section-card">
          <div className="h-[32rem] w-full skeleton-block" />
        </section>
      </div>
    );
  }

  return (
    <>
      <section className="space-y-6">
        <div className="h-10 w-52 skeleton-block" />
        <div className="h-24 w-full skeleton-block" />
        <div className="h-24 w-full skeleton-block" />
        <div className="h-24 w-full skeleton-block" />
      </section>
      <section className="mt-12 space-y-6">
        <div className="h-10 w-52 skeleton-block" />
        <div className="h-24 w-full skeleton-block" />
        <div className="h-24 w-full skeleton-block" />
      </section>
    </>
  );
}

export function NavigationLoadingOverlay() {
  const pathname = usePathname();
  const [targetHref, setTargetHref] = useState<string | null>(null);

  useEffect(() => {
    setTargetHref(null);
  }, [pathname]);

  useEffect(() => {
    const handleStart = (event: Event) => {
      const detail = (event as CustomEvent<{ href?: string }>).detail;
      if (!detail?.href) {
        return;
      }

      setTargetHref(detail.href);
    };

    window.addEventListener("app:navigation-start", handleStart as EventListener);

    return () => {
      window.removeEventListener("app:navigation-start", handleStart as EventListener);
    };
  }, []);

  const currentPath = useMemo(() => resolveTargetPath(targetHref ?? pathname), [pathname, targetHref]);

  if (!targetHref) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] bg-background">
      <PageLoadingShell
        currentPath={currentPath}
        description={
          currentPath === "/dashboard"
            ? "Overview cepat untuk seluruh project portfolio, status publish, dan sinkronisasi rebuild website publik."
            : currentPath === "/settings"
              ? "Edit identitas studio, kontak publik, social links, dan konten ringkas yang akan ikut masuk ke hasil static build website."
              : "Kelola seluruh project per kategori, ubah status publish, dan simpan urutan tampilan untuk website publik."
        }
        eyebrow={
          currentPath === "/dashboard"
            ? "Architecture Portfolio Admin"
            : currentPath === "/settings"
              ? "Site Settings"
              : "Project Management"
        }
        title={
          currentPath === "/dashboard" ? (
            <>
              Dashboard <span className="text-primary-container">Overview</span>
            </>
          ) : currentPath === "/settings" ? (
            <>
              Core <span className="text-primary-container">Identity</span>
            </>
          ) : (
            <>
              Project <span className="text-primary-container">Archive</span>
            </>
          )
        }
      >
        <OverlayContent currentPath={currentPath} />
      </PageLoadingShell>
    </div>
  );
}
