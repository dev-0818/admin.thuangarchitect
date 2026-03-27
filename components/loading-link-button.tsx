"use client";

import type { ReactNode } from "react";
import { useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";

import { MaterialIcon } from "@/components/material-icon";
import { cn } from "@/lib/utils";

type LoadingLinkButtonProps = {
  href: string;
  children: ReactNode;
  className?: string;
  icon?: string;
  loadingLabel?: string;
  active?: boolean;
  variant?: "button" | "nav";
};

export function LoadingLinkButton({
  href,
  children,
  className,
  icon,
  loadingLabel,
  active = false,
  variant = "button"
}: LoadingLinkButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      className={cn(
        variant === "nav" ? "w-full justify-start text-left" : "",
        className,
        isPending ? "cursor-progress" : ""
      )}
      disabled={isPending}
      onClick={() => {
        if (active && pathname === href) {
          return;
        }

        window.dispatchEvent(
          new CustomEvent("app:navigation-start", {
            detail: { href }
          })
        );

        startTransition(() => {
          router.push(href);
        });
      }}
      type="button"
    >
      {variant === "nav" || icon ? (
        <MaterialIcon
          className={cn(
            variant === "nav" ? "text-[20px]" : "text-[18px]",
            isPending ? "animate-spin" : ""
          )}
          name={isPending ? "progress_activity" : (icon ?? "arrow_forward")}
        />
      ) : null}
      {variant === "nav" ? children : isPending ? loadingLabel ?? "Loading..." : children}
    </button>
  );
}
