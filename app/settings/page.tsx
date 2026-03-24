import { AdminShell } from "@/components/admin-shell";
import { saveSettingsAction } from "@/app/actions";
import { getSettings } from "@/lib/data";
import { formatTimestamp } from "@/lib/utils";

type SettingsPageProps = {
  searchParams?: {
    saved?: string;
    build?: string;
    error?: string;
  };
};

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const settings = await getSettings();

  return (
    <AdminShell
      currentPath="/settings"
      description="Edit identitas studio, kontak publik, social links, dan konten ringkas yang akan ikut masuk ke hasil static build website."
      eyebrow="Site Settings"
      title={
        <>
          Core <span className="text-primary-container">Identity</span>
        </>
      }
    >
      {searchParams?.saved ? (
        <div className="mb-8 rounded-sm border-l-4 border-secondary bg-surface-container-high p-5 text-sm text-on-surface">
          {decodeURIComponent(searchParams.build ?? "Settings saved.")}
        </div>
      ) : null}
      {searchParams?.error === "validation" ? (
        <div className="mb-8 rounded-sm border-l-4 border-error bg-surface-container-high p-5 text-sm text-error">
          Pastikan semua URL dan email valid sebelum menyimpan.
        </div>
      ) : null}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section className="section-card">
          <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-secondary">
            Last Updated
          </p>
          <h2 className="mt-3 font-headline text-3xl font-black tracking-tight text-primary">
            {settings.siteTitle}
          </h2>
          <p className="mt-6 text-sm leading-7 text-on-surface-variant">{settings.bio}</p>
          <div className="mt-8 rounded-sm bg-surface-container-high p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-outline">
              Infrastructure
            </p>
            <p className="mt-3 text-sm text-on-surface-variant">
              Rebuild terakhir tercatat pada {formatTimestamp(settings.updatedAt)}.
            </p>
          </div>
        </section>

        <form action={saveSettingsAction} className="section-card space-y-7">
          <div>
            <label className="mb-3 block text-[11px] font-bold uppercase tracking-[0.32em] text-outline">
              Studio / Brand Name
            </label>
            <input className="field-input" defaultValue={settings.siteTitle} name="siteTitle" />
          </div>

          <div>
            <label className="mb-3 block text-[11px] font-bold uppercase tracking-[0.32em] text-outline">
              Tagline
            </label>
            <input className="field-input" defaultValue={settings.tagline} name="tagline" />
          </div>

          <div>
            <label className="mb-3 block text-[11px] font-bold uppercase tracking-[0.32em] text-outline">
              Studio Bio
            </label>
            <textarea className="field-textarea min-h-36" defaultValue={settings.bio} name="bio" />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-3 block text-[11px] font-bold uppercase tracking-[0.32em] text-outline">
                Email
              </label>
              <input className="field-input" defaultValue={settings.email} name="email" type="email" />
            </div>

            <div>
              <label className="mb-3 block text-[11px] font-bold uppercase tracking-[0.32em] text-outline">
                Phone / WhatsApp
              </label>
              <input className="field-input" defaultValue={settings.phone} name="phone" />
            </div>
          </div>

          <div>
            <label className="mb-3 block text-[11px] font-bold uppercase tracking-[0.32em] text-outline">
              Instagram URL
            </label>
            <input
              className="field-input"
              defaultValue={settings.instagramUrl}
              name="instagramUrl"
              type="url"
            />
          </div>

          <div>
            <label className="mb-3 block text-[11px] font-bold uppercase tracking-[0.32em] text-outline">
              WhatsApp URL
            </label>
            <input
              className="field-input"
              defaultValue={settings.whatsappUrl}
              name="whatsappUrl"
              type="url"
            />
          </div>

          <div>
            <label className="mb-3 block text-[11px] font-bold uppercase tracking-[0.32em] text-outline">
              Google Maps URL
            </label>
            <input
              className="field-input"
              defaultValue={settings.googleMapsUrl}
              name="googleMapsUrl"
              type="url"
            />
          </div>

          <button className="primary-button w-full" type="submit">
            Save Settings
          </button>
        </form>
      </div>
    </AdminShell>
  );
}
