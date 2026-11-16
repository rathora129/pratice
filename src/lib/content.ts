import { prisma } from "@/lib/prisma";

export type SiteContent = Record<string, string>;

const fallbacks: SiteContent = {
  "hero.eyebrow": "Flexible packaging · Labels · Shrink sleeves",
  "hero.title": "Packaging that makes your brand impossible to ignore.",
  "hero.subtitle":
    "Custom pouches, labels and sleeves for food, FMCG, pharma and e-commerce brands — engineered for shelf impact and produced at scale.",
  "hero.primary_label": "Request a quote",
  "hero.secondary_label": "Explore the catalogue",
  "stats.years": "10+",
  "stats.projects": "1,200+",
  "stats.rating": "4.3/5",
  "stats.rating_label": "marketplace rating",
  "contact.phone": "+91 97170 23662",
  "contact.email": "info@starkpackmate.com",
  "contact.address":
    "A-39, Phase II, Mayapuri Industrial Area, New Delhi 110064",
  "contact.hours": "Mon–Sat · 10:00–18:30 IST",
  "home.about_title": "One accountable partner from artwork to dispatch.",
  "home.about_body":
    "Stark Packmate brings flexible packaging, labels and sleeves under one roof — so your brand can move from prototype to repeat production without juggling vendors.",
};

export async function getSiteContent(): Promise<SiteContent> {
  const rows = await prisma.contentBlock.findMany();
  const content = { ...fallbacks };

  for (const row of rows) {
    content[row.key] = row.value;
  }

  return content;
}

export const editableContentFields = [
  {
    key: "hero.eyebrow",
    label: "Hero eyebrow",
    type: "text" as const,
    hint: "Short line above the main headline.",
  },
  {
    key: "hero.title",
    label: "Hero headline",
    type: "textarea" as const,
    hint: "Keep it to one or two punchy lines.",
  },
  {
    key: "hero.subtitle",
    label: "Hero paragraph",
    type: "textarea" as const,
  },
  {
    key: "hero.primary_label",
    label: "Primary button label",
    type: "text" as const,
  },
  {
    key: "hero.secondary_label",
    label: "Secondary button label",
    type: "text" as const,
  },
  {
    key: "stats.years",
    label: "Stat — years",
    type: "text" as const,
  },
  {
    key: "stats.projects",
    label: "Stat — projects",
    type: "text" as const,
  },
  {
    key: "stats.rating",
    label: "Stat — rating",
    type: "text" as const,
  },
  {
    key: "stats.rating_label",
    label: "Stat — rating label",
    type: "text" as const,
  },
  {
    key: "home.about_title",
    label: "Home about headline",
    type: "textarea" as const,
  },
  {
    key: "home.about_body",
    label: "Home about paragraph",
    type: "textarea" as const,
  },
  {
    key: "contact.phone",
    label: "Contact phone",
    type: "text" as const,
  },
  {
    key: "contact.email",
    label: "Contact email",
    type: "text" as const,
  },
  {
    key: "contact.address",
    label: "Contact address",
    type: "textarea" as const,
  },
  {
    key: "contact.hours",
    label: "Business hours",
    type: "text" as const,
  },
];
