"use client";

import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

import { saveSettingsAction } from "@/app/actions";
import { MaterialIcon } from "@/components/material-icon";
import { SiteSettings } from "@/lib/types";
import { buildWhatsAppUrlFromPhone, cn } from "@/lib/utils";

type SettingsFormProps = {
  settings: SiteSettings;
};

function SubmitSettingsButton() {
  const { pending } = useFormStatus();

  return (
    <button className="primary-button w-full" disabled={pending} type="submit">
      <MaterialIcon
        className={cn("text-[18px]", pending ? "animate-spin" : "")}
        name={pending ? "progress_activity" : "save"}
      />
      {pending ? "Saving Settings..." : "Save Settings"}
    </button>
  );
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const [phone, setPhone] = useState(settings.phone);
  const whatsappUrl = useMemo(() => buildWhatsAppUrlFromPhone(phone), [phone]);

  return (
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
          <input
            className="field-input"
            name="phone"
            onChange={(event) => setPhone(event.target.value)}
            value={phone}
          />
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
          className="field-input text-outline"
          name="whatsappUrlPreview"
          readOnly
          type="url"
          value={whatsappUrl}
        />
        <p className="mt-2 text-xs text-outline">
          URL dibuat otomatis dari nomor HP dengan format WhatsApp API.
        </p>
      </div>

      <SubmitSettingsButton />
    </form>
  );
}
