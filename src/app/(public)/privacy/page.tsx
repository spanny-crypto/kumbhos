import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy'
};

// Static content — no user data is read to render this page, so it's a
// plain Server Component (no 'use client', no useApi). Every claim here is
// checked against actual code behavior (see the inline notes), not generic
// boilerplate — see docs/SECURITY.md for the underlying technical detail.
export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="heading-serif text-3xl text-paper-text">🔒 Privacy Policy</h1>
      <p className="mt-1 text-sm text-paper-muted">Last updated: this reflects the app as currently built, not a fixed legal filing date.</p>

      <div className="paper-card mt-4 space-y-2 border-risk-building/30 bg-risk-building/5 p-4 text-sm text-paper-text">
        <p className="font-semibold text-risk-building">⚠️ Read this first</p>
        <p className="text-paper-muted">
          This page is a good-faith, accurate description of what this prototype actually collects and does with data — it is not a substitute for review by
          a qualified lawyer, and it is not a certification of compliance with India's Digital Personal Data Protection Act, 2023 (&quot;DPDP Act&quot;) or
          any other law. Before this app handles real personal data in a live public deployment, the operator (not the software) is responsible for
          appointing a real Grievance Officer, confirming a valid legal basis for each data flow, and having this policy reviewed by counsel.
        </p>
      </div>

      <section className="mt-6 space-y-2">
        <h2 className="text-lg font-semibold text-paper-text">🗂️ What personal data this app collects</h2>
        <p className="text-sm text-paper-muted">Only two features collect information that identifies a person. Everything else (crowd maps, zone pressure, facility lists) is aggregate operational data, not personal data.</p>
        <ul className="ml-5 list-disc space-y-2 text-sm text-paper-text">
          <li>
            <strong>Lost &amp; Found reports</strong> — the report type, an approximate zone, a free-text description, and the contact information you enter
            so staff (or the person you're looking for) can reach you. This is a public feature: the open-case list, including the contact information field,
            is readable by anyone via the site's public API, the same way the on-page list is — there is no separate access control on that field. Don't put
            more contact detail in that field than you're comfortable being visible.
          </li>
          <li>
            <strong>ID Wristbands</strong> — the wearer's name, age, a guardian's name and phone number, an optional meeting-point zone, and any optional
            medical notes you write. This is deliberately public-by-design for the one person who has the specific printed code or QR image (see{' '}
            <a href="/wristband" className="text-brand-600 underline">
              /wristband
            </a>
            ) — that's the entire point of the feature: a stranger who finds the wearer needs to see it immediately, with no login. It is not searchable or
            listable by the public; only signed-in Command Centre staff can browse the full roster.
          </li>
          <li>
            <strong>Command Centre accounts</strong> — a small, fixed set of demo role accounts (see <code>docs/DEMO.md</code>), not real user sign-ups. A
            session cookie stores only a username, display name, and role.
          </li>
        </ul>
      </section>

      <section className="mt-6 space-y-2">
        <h2 className="text-lg font-semibold text-paper-text">📍 Location</h2>
        <p className="text-sm text-paper-text">
          &quot;Enable live tracking&quot; and the SOS &quot;Share Location&quot; button use your browser's own Geolocation API, gated behind the browser's
          native permission prompt. Your coordinates are read directly by your browser and are <strong>never sent to this app's servers</strong> — the only
          things that ever happen with them are shown on your own screen, or shared by you, explicitly, as a Google Maps link via your device's native share
          sheet or clipboard. Turning tracking off, or simply not granting permission, doesn't change how anything else in the app works.
        </p>
      </section>

      <section className="mt-6 space-y-2">
        <h2 className="text-lg font-semibold text-paper-text">🚫 What this app does not do</h2>
        <ul className="ml-5 list-disc space-y-1 text-sm text-paper-text">
          <li>No facial recognition, no biometric matching, no photo uploads for Lost &amp; Found or ID Wristbands.</li>
          <li>No analytics scripts, ad trackers, or third-party pixels of any kind.</li>
          <li>No selling, renting, or sharing of personal data with third parties for marketing purposes — ever.</li>
          <li>No cookies beyond the Command Centre staff session cookie and, optionally, your own browser's local storage for on-device preferences.</li>
        </ul>
      </section>

      <section className="mt-6 space-y-2">
        <h2 className="text-lg font-semibold text-paper-text">⚖️ Why we process this data (legal basis)</h2>
        <p className="text-sm text-paper-text">
          Every data flow above is initiated by you, voluntarily, for a specific stated purpose — reuniting a lost person or item, or making yourself
          reachable if you (or someone in your care) gets separated — which is the DPDP Act's &quot;consent&quot; basis. For an ID Wristband created for a
          child or a person who cannot consent for themselves, the guardian entering the data is the one giving consent on that person's behalf, consistent
          with the Act's requirement of verifiable parental/guardian consent for a child's or a person with disability's personal data.
        </p>
      </section>

      <section className="mt-6 space-y-2">
        <h2 className="text-lg font-semibold text-paper-text">🗄️ How data is stored</h2>
        <p className="text-sm text-paper-text">
          By default this app runs in demo mode: data lives only in server memory and is cleared on every restart. When connected to a real database
          (Supabase/Postgres), access is restricted by row-level security policies scoped to signed-in staff, and the database credentials that could bypass
          those policies are held only on the server — never in the code your browser downloads (see <code>docs/SECURITY.md</code>). We don't currently
          publish a fixed retention period; Command Centre staff can edit or delete Lost &amp; Found and Wristband records, and mark wristbands
          reunited/expired, as cases resolve.
        </p>
      </section>

      <section className="mt-6 space-y-2">
        <h2 className="text-lg font-semibold text-paper-text">🙋 Your rights</h2>
        <p className="text-sm text-paper-text">
          Under the DPDP Act you have the right to know what personal data of yours is held, to have it corrected, and to have it erased once its purpose is
          served. To exercise any of these for a Lost &amp; Found or Wristband record you submitted, contact the Command Centre in person at the event with
          the code/reference you were given — this prototype does not yet have a self-service request form.
        </p>
      </section>

      <section className="mt-6 space-y-2">
        <h2 className="text-lg font-semibold text-paper-text">📮 Grievance Officer</h2>
        <p className="text-sm text-paper-text">
          The DPDP Act requires a named contact for data-related grievances.{' '}
          <strong>This has not yet been designated for this deployment</strong> — the event operator must fill in a real name, role, and contact method here
          before this app is used to collect real personal data at a public event.
        </p>
      </section>

      <p className="mt-8 text-xs text-paper-faint">
        This prototype is not affiliated with any government authority. See also the{' '}
        <a href="/data-sources" className="underline hover:text-paper-muted">
          Data Sources
        </a>{' '}
        page for where operational (non-personal) data comes from.
      </p>
    </div>
  );
}
