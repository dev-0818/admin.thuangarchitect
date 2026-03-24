const BUILD_COOLDOWN_MS = 30_000;

let lastTriggeredAt = 0;

export async function triggerBuild(reason: string) {
  const hookUrl = process.env.NETLIFY_BUILD_HOOK_URL;
  const now = Date.now();

  if (!hookUrl) {
    return {
      ok: false,
      skipped: true,
      message: "NETLIFY_BUILD_HOOK_URL belum diisi."
    };
  }

  if (now - lastTriggeredAt < BUILD_COOLDOWN_MS) {
    return {
      ok: false,
      skipped: true,
      message: "Rebuild masih dalam cooldown 30 detik."
    };
  }

  const response = await fetch(hookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-trigger-reason": reason
    }
  });

  if (!response.ok) {
    throw new Error(`Gagal memicu rebuild (${response.status})`);
  }

  lastTriggeredAt = now;

  return {
    ok: true,
    skipped: false,
    message: "Rebuild berhasil dipicu. Website akan terupdate dalam ~1-2 menit."
  };
}
