"use client";

import { useFormStatus } from "react-dom";

import { MaterialIcon } from "@/components/material-icon";

function LogoutButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="flex w-full items-center gap-4 px-4 py-3 text-left text-sm text-outline transition hover:bg-surface-container hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      <MaterialIcon
        className={pending ? "animate-spin text-[20px]" : "text-[20px]"}
        name={pending ? "progress_activity" : "logout"}
      />
      <span className="font-label">{pending ? "Logging Out..." : "Logout"}</span>
    </button>
  );
}

export function LogoutForm({ action }: { action: (formData: FormData) => void | Promise<void> }) {
  return (
    <form action={action}>
      <LogoutButton />
    </form>
  );
}

