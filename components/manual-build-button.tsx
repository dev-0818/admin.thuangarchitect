"use client";

import { useState, useTransition } from "react";

import { MaterialIcon } from "@/components/material-icon";

export function ManualBuildButton() {
  const [message, setMessage] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        className="primary-button"
        disabled={isPending}
        onClick={() => {
          startTransition(async () => {
            setMessage("");

            const response = await fetch("/api/trigger-build", {
              method: "POST"
            });

            const result = (await response.json()) as { message?: string };
            setMessage(result.message ?? "Permintaan rebuild terkirim.");
          });
        }}
        type="button"
      >
        <MaterialIcon
          className={isPending ? "animate-spin text-[18px]" : "text-[18px]"}
          filled={!isPending}
          name={isPending ? "progress_activity" : "bolt"}
        />
        {isPending ? "Memicu Rebuild..." : "Trigger Rebuild"}
      </button>
      {message ? (
        <p className="max-w-xs text-right text-[11px] text-outline">{message}</p>
      ) : null}
    </div>
  );
}
