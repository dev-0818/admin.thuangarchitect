import { triggerBuild } from "@/lib/build";

export async function POST() {
  try {
    const result = await triggerBuild("manual");
    return Response.json(result);
  } catch (error) {
    return Response.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Gagal memicu rebuild."
      },
      { status: 500 }
    );
  }
}
