import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight, Check } from "@/components/icons";
import { updateContent } from "@/app/actions/content";
import { requirePermission } from "@/lib/auth";
import { editableContentFields, getSiteContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Website content",
};

type SearchParams = Promise<{ saved?: string; error?: string }>;

const groups = [
  {
    title: "Hero",
    description: "The first screen on the public homepage.",
    keys: [
      "hero.eyebrow",
      "hero.title",
      "hero.subtitle",
      "hero.primary_label",
      "hero.secondary_label",
    ],
  },
  {
    title: "Proof points",
    description: "Numbers shown under the hero. Keep claims verifiable.",
    keys: ["stats.years", "stats.projects", "stats.rating", "stats.rating_label"],
  },
  {
    title: "Home about",
    description: "The positioning block on the homepage.",
    keys: ["home.about_title", "home.about_body"],
  },
  {
    title: "Contact details",
    description: "Used on the contact page, footer and quote form sidebar.",
    keys: [
      "contact.phone",
      "contact.email",
      "contact.address",
      "contact.hours",
    ],
  },
];

export default async function AdminContentPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requirePermission("content", "update");

  const [{ saved, error }, content] = await Promise.all([
    searchParams,
    getSiteContent(),
  ]);

  const fields = new Map(
    editableContentFields.map((field) => [field.key, field]),
  );

  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Website</p>
          <h1 className="mt-1.5 text-3xl font-semibold tracking-[-0.04em] text-ink">
            Content editor
          </h1>
          <p className="mt-2 max-w-2xl text-[13px] leading-6 text-ink-muted">
            Edit the homepage hero, proof points, about block and contact
            details. Saving publishes straight to the live public pages.
          </p>
        </div>
        <Link
          href="/"
          target="_blank"
          className="btn-primary py-2.5"
        >
          View live homepage
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {saved && (
        <p className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[12px] font-medium text-emerald-800">
          <Check className="h-4 w-4" />
          Content published. The public homepage and shared header/footer were
          revalidated.
        </p>
      )}

      {error === "required" && (
        <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] text-amber-900">
          The hero headline and paragraph cannot be blank.
        </p>
      )}

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <form action={updateContent} className="space-y-5">
          {groups.map((group) => (
            <section key={group.title} className="admin-card">
              <div className="border-b border-ink/10 pb-4">
                <h2 className="text-sm font-semibold text-ink">{group.title}</h2>
                <p className="mt-0.5 text-[11px] text-ink-muted">
                  {group.description}
                </p>
              </div>

              <div className="mt-5 space-y-4">
                {group.keys.map((key) => {
                  const field = fields.get(key);
                  if (!field) return null;

                  return (
                    <div key={key}>
                      <label className="field-label" htmlFor={key}>
                        {field.label}
                      </label>
                      {field.type === "textarea" ? (
                        <textarea
                          id={key}
                          name={key}
                          className="textarea"
                          defaultValue={content[key]}
                          required={
                            key === "hero.title" || key === "hero.subtitle"
                          }
                        />
                      ) : (
                        <input
                          id={key}
                          name={key}
                          className="input"
                          defaultValue={content[key]}
                          required={
                            key === "hero.title" || key === "hero.subtitle"
                          }
                        />
                      )}
                      {field.hint && <p className="hint">{field.hint}</p>}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}

          <div className="flex justify-end">
            <button type="submit" className="btn-brand">
              Publish content
            </button>
          </div>
        </form>

        <aside className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-soft">
            <div className="border-b border-ink/10 px-5 py-4">
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-ink/40">
                Live preview
              </p>
              <p className="mt-1 text-[11px] text-ink-muted">
                Current saved content, not unsaved edits.
              </p>
            </div>
            <div className="relative overflow-hidden bg-cream p-5">
              <div className="absolute inset-0 bg-grid opacity-30" />
              <div className="relative">
                <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-brand-700">
                  {content["hero.eyebrow"]}
                </p>
                <p className="mt-2 text-xl font-semibold leading-[1.12] tracking-[-0.035em] text-ink">
                  {content["hero.title"]}
                </p>
                <p className="mt-2 line-clamp-4 text-[11px] leading-5 text-ink-muted">
                  {content["hero.subtitle"]}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-ink px-3 py-2 text-[9px] font-semibold text-white">
                    {content["hero.primary_label"]}
                  </span>
                  <span className="rounded-full border border-ink/15 bg-white px-3 py-2 text-[9px] font-semibold text-ink">
                    {content["hero.secondary_label"]}
                  </span>
                </div>
                <div className="mt-5 grid grid-cols-3 gap-2 border-t border-ink/10 pt-3">
                  {[
                    ["Years", content["stats.years"]],
                    ["Projects", content["stats.projects"]],
                    ["Rating", content["stats.rating"]],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-sm font-semibold text-ink">{value}</p>
                      <p className="text-[8px] uppercase tracking-[0.1em] text-ink/40">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="admin-card">
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-ink/40">
              Publish behaviour
            </p>
            <ul className="mt-3 space-y-2.5">
              {[
                "Saving updates the database immediately.",
                "Homepage, header and footer paths are revalidated.",
                "Open the public site to verify the change.",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-[11px] leading-5 text-ink-muted"
                >
                  <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-ink/10 bg-ink p-5 text-white">
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-brand-300">
              Beyond this slice
            </p>
            <p className="mt-2 text-[11px] leading-5 text-white/55">
              Section-level page building, scheduled publishing, previews and
              revision history are specified in the Phase 2 backlog. This editor
              intentionally covers the homepage content wired in this preview.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
