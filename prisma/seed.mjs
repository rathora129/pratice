import { randomBytes, scryptSync } from "node:crypto";
import { PrismaClient } from "@prisma/client";

process.env.DATABASE_URL = process.env.DATABASE_URL || "file:./dev.db";

const prisma = new PrismaClient();

const categories = [
  {
    slug: "stand-up-pouches",
    name: "Stand-Up Pouches",
    description:
      "Shelf-ready pouches with a stable base, high print coverage and optional zipper or window.",
    sortOrder: 1,
  },
  {
    slug: "centre-seal-pouches",
    name: "Pillow & Centre-Seal Pouches",
    description:
      "High-speed flow-wrap and centre-seal formats for snacks, powders, spices and bars.",
    sortOrder: 2,
  },
  {
    slug: "three-side-seal-pouches",
    name: "Three-Side Seal Pouches",
    description:
      "Compact sachets and sample packs with clean seals and strong shelf presence.",
    sortOrder: 3,
  },
  {
    slug: "laminated-rolls",
    name: "Laminated Rolls",
    description:
      "Printed and unprinted roll stock for form-fill-seal and flow-wrap lines.",
    sortOrder: 4,
  },
  {
    slug: "printed-labels",
    name: "Printed Labels",
    description:
      "Roll and sheet labels for bottles, jars and cartons, in short and long runs.",
    sortOrder: 5,
  },
  {
    slug: "shrink-sleeves",
    name: "Shrink Sleeves",
    description:
      "360-degree decoration and tamper evidence for bottles, jars and containers.",
    sortOrder: 6,
  },
  {
    slug: "courier-bags",
    name: "Courier Bags",
    description:
      "Tamper-proof mailers for e-commerce, samples and sensitive shipments.",
    sortOrder: 7,
  },
  {
    slug: "paper-packaging",
    name: "Paper Packaging",
    description:
      "Kraft and paper-based pouches and bags for a lower-plastic shelf story.",
    sortOrder: 8,
  },
  {
    slug: "corrugated-packaging",
    name: "Corrugated Packaging",
    description:
      "Transit and retail-ready corrugated formats, quoted to your specification.",
    sortOrder: 9,
  },
];

const products = [
  {
    code: "SP-SUP-001",
    slug: "stand-up-pouch",
    name: "Stand-Up Pouch",
    category: "stand-up-pouches",
    featured: true,
    application: "Spices, dry fruits, snacks, coffee, personal care",
    description:
      "A shelf-ready stand-up format with a stable base and generous print area. Available with zipper, window and matte or gloss finishes. Share your fill weight, barrier requirement and artwork to receive a costed proposal.",
    seoTitle: "Custom Stand-Up Pouches | Stark Packmate",
    seoDescription:
      "Stand-up pouches in multiple sizes with zipper, window and custom print options. Request a specification and quotation from Stark Packmate.",
    variants: [
      {
        sku: "SP-SUP-240320",
        name: "240 × 320 + 120 mm",
        widthMm: 240,
        heightMm: 320,
        gussetMm: 120,
        material: "Structure on request",
        printingMethod: "Digital / rotogravure",
        finish: "Matte / gloss",
        closure: "Zipper / plain",
        uom: "Piece",
      },
      {
        sku: "SP-SUP-190265",
        name: "190 × 265 + 110 mm",
        widthMm: 190,
        heightMm: 265,
        gussetMm: 110,
        material: "Structure on request",
        printingMethod: "Digital / rotogravure",
        finish: "Matte / gloss",
        closure: "Zipper / plain",
        uom: "Piece",
      },
      {
        sku: "SP-SUP-160240",
        name: "160 × 240 + 90 mm",
        widthMm: 160,
        heightMm: 240,
        gussetMm: 90,
        material: "Structure on request",
        printingMethod: "Digital / rotogravure",
        finish: "Matte / gloss",
        closure: "Zipper / plain",
        uom: "Piece",
      },
      {
        sku: "SP-SUP-130210",
        name: "130 × 210 + 80 mm · with window",
        widthMm: 130,
        heightMm: 210,
        gussetMm: 80,
        material: "Structure on request",
        printingMethod: "Digital / rotogravure",
        finish: "Matte",
        closure: "Zipper",
        uom: "Piece",
      },
    ],
  },
  {
    code: "SP-CSP-001",
    slug: "three-side-seal-pouch",
    name: "Three-Side Seal Pouch",
    category: "three-side-seal-pouches",
    featured: true,
    application: "Samples, spices, powders, single-serve formats",
    description:
      "A compact three-side seal sachet with clean edges and a wide print area. Suitable for samples, single-serve products and trial packs. Final dimensions, film structure and MOQ are confirmed at costing.",
    seoTitle: "Three-Side Seal Pouches | Stark Packmate",
    seoDescription:
      "Custom three-side seal pouches and sachets for samples, spices and powders. Request a quotation from Stark Packmate.",
    variants: [
      {
        sku: "SP-TSS-125175",
        name: "125 × 175 mm",
        widthMm: 125,
        heightMm: 175,
        material: "Structure on request",
        printingMethod: "Digital / rotogravure",
        finish: "Matte / gloss",
        closure: "Three-side seal",
        uom: "Piece",
      },
    ],
  },
  {
    code: "SP-PIL-001",
    slug: "rotogravure-printed-pillow-pouch",
    name: "Rotogravure Printed Pillow Pouch",
    category: "centre-seal-pouches",
    featured: true,
    application: "Snacks, namkeen, powders, granules",
    description:
      "A centre-seal pillow pouch for high-speed filling lines, printed by rotogravure for consistent brand colour across long runs. Quoted by weight on your confirmed film structure and artwork.",
    seoTitle: "Rotogravure Printed Pillow Pouches | Stark Packmate",
    seoDescription:
      "Rotogravure printed pillow pouches on transparent film for snacks and powders. Request pricing from Stark Packmate.",
    variants: [
      {
        sku: "SP-PIL-250G",
        name: "250 g · transparent film",
        material: "Transparent film",
        printingMethod: "Rotogravure",
        finish: "Gloss",
        closure: "Centre seal",
        uom: "Kg",
      },
    ],
  },
  {
    code: "SP-BAR-001",
    slug: "digital-printed-bar-pouch",
    name: "Digital Printed Bar Pouch",
    category: "centre-seal-pouches",
    featured: true,
    application: "Nutrition bars, snacks, sample sachets",
    description:
      "A BOPP centre-seal bar pouch for short runs and quick artwork changes. Digital print keeps setup light and turnaround fast for launch quantities.",
    seoTitle: "Digital Printed Bar Pouches | Stark Packmate",
    seoDescription:
      "Digitally printed BOPP bar pouches for nutrition bars and snacks. Request a quote from Stark Packmate.",
    variants: [
      {
        sku: "SP-BAR-50G",
        name: "50 g · BOPP",
        material: "BOPP",
        printingMethod: "Digital",
        finish: "Gloss / matte",
        closure: "Centre seal",
        uom: "Piece",
      },
    ],
  },
  {
    code: "SP-SPC-001",
    slug: "rotogravure-printed-spice-pouch",
    name: "Rotogravure Printed Spice Pouch",
    category: "centre-seal-pouches",
    featured: false,
    application: "Spices, masala, seasonings",
    description:
      "A metalised centre-seal spice pouch printed by rotogravure for rich colour and consistent repeat runs. Structure options are confirmed against your shelf-life and filling-line requirements.",
    seoTitle: "Rotogravure Printed Spice Pouches | Stark Packmate",
    seoDescription:
      "Rotogravure printed metalised spice pouches with centre seal. Request a quote from Stark Packmate.",
    variants: [
      {
        sku: "SP-SPC-200G",
        name: "200 g · metalised film",
        material: "Metalised film",
        printingMethod: "Rotogravure",
        finish: "Gloss",
        closure: "Centre seal",
        uom: "Piece",
      },
    ],
  },
  {
    code: "SP-CUR-001",
    slug: "tamper-proof-courier-bag",
    name: "Tamper-Proof Courier Bag",
    category: "courier-bags",
    featured: true,
    application: "E-commerce, samples, document mailers",
    description:
      "A LDPE tamper-proof mailer with a strong adhesive seal, available plain or printed. Sized for apparel, samples and e-commerce shipments.",
    seoTitle: "Tamper-Proof Courier Bags | Stark Packmate",
    seoDescription:
      "LDPE tamper-proof courier bags in 8 × 10 in and 10 × 14 in sizes. Request a quote from Stark Packmate.",
    variants: [
      {
        sku: "SP-CUR-0810",
        name: "8 × 10 in",
        widthMm: 203,
        heightMm: 254,
        material: "LDPE",
        printingMethod: "Plain / printed",
        closure: "Tamper-proof adhesive",
        uom: "Piece",
      },
      {
        sku: "SP-CUR-1014",
        name: "10 × 14 in",
        widthMm: 254,
        heightMm: 356,
        material: "LDPE",
        printingMethod: "Plain / printed",
        closure: "Tamper-proof adhesive",
        uom: "Piece",
      },
    ],
  },
  {
    code: "SP-LBL-001",
    slug: "digital-printed-labels",
    name: "Digital Printed Labels",
    category: "printed-labels",
    featured: true,
    application: "Bottles, jars, cartons, dry fruits, personal care",
    description:
      "Digital roll labels for bottles, jars and cartons in short and medium runs. Share the container, adhesive requirement and artwork to receive a matched quote.",
    seoTitle: "Digital Printed Labels for Bottles & Jars | Stark Packmate",
    seoDescription:
      "Custom digital printed labels for perfume bottles, dry fruits and FMCG packs. Request a quote from Stark Packmate.",
    variants: [
      {
        sku: "SP-LBL-PERF",
        name: "Perfume bottle label · roll",
        material: "PP / paper",
        printingMethod: "Digital",
        finish: "Gloss / matte",
        closure: "Self-adhesive",
        uom: "Piece",
      },
      {
        sku: "SP-LBL-DRY",
        name: "Dry fruits label · roll",
        material: "PP",
        printingMethod: "Digital",
        finish: "Gloss",
        closure: "Permanent adhesive",
        uom: "Piece",
      },
    ],
  },
  {
    code: "SP-SHR-001",
    slug: "shrink-sleeve",
    name: "Shrink Sleeve",
    category: "shrink-sleeves",
    featured: false,
    application: "Beverages, dairy, personal care, tamper evidence",
    description:
      "A 360-degree shrink sleeve for full-wrap decoration and tamper evidence. Supplied to your container profile; artwork and shrink validation are confirmed before production.",
    seoTitle: "Custom Shrink Sleeves | Stark Packmate",
    seoDescription:
      "Full-wrap shrink sleeves for beverages, dairy and personal care. Request a specification and quote from Stark Packmate.",
    variants: [
      {
        sku: "SP-SHR-CUSTOM",
        name: "Custom circumference & height",
        material: "Shrink film",
        printingMethod: "Rotogravure / digital",
        finish: "Gloss / matte",
        closure: "Full-wrap sleeve",
        uom: "Piece",
      },
    ],
  },
  {
    code: "SP-ROL-001",
    slug: "printed-laminated-roll",
    name: "Printed Laminated Roll",
    category: "laminated-rolls",
    featured: false,
    application: "Form-fill-seal, flow-wrap, sachet lines",
    description:
      "Printed laminated roll stock for your form-fill-seal or flow-wrap line. Supplied to your width, repeat and core requirement, with the film structure confirmed during costing.",
    seoTitle: "Printed Laminated Rolls | Stark Packmate",
    seoDescription:
      "Custom printed laminated rolls for FFS and flow-wrap lines. Request a quotation from Stark Packmate.",
    variants: [
      {
        sku: "SP-ROL-CUSTOM",
        name: "Custom width, repeat and core",
        material: "Multi-layer structure on request",
        printingMethod: "Rotogravure",
        finish: "Gloss / matte",
        closure: "Roll stock",
        uom: "Kg",
      },
    ],
  },
  {
    code: "SP-PPR-001",
    slug: "paper-stand-up-pouch",
    name: "Paper Stand-Up Pouch",
    category: "paper-packaging",
    featured: false,
    application: "Coffee, tea, dry fruits, gifting",
    description:
      "A paper-based stand-up pouch with a matte surface for a warmer shelf story. Available unprinted or custom printed, with structure and barrier options confirmed at costing.",
    seoTitle: "Paper Stand-Up Pouches | Stark Packmate",
    seoDescription:
      "Paper-based stand-up pouches for coffee, tea, dry fruits and gifting. Request a quote from Stark Packmate.",
    variants: [
      {
        sku: "SP-PPR-250G",
        name: "250 g · kraft",
        material: "Paper / kraft",
        printingMethod: "Unprinted / custom",
        finish: "Matte",
        closure: "Zipper / plain",
        uom: "Kg",
      },
    ],
  },
];

const content = {
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

const demoUsers = [
  { name: "Aarav Mehta", email: "owner@starkpackmate.com", role: "business_owner" },
  { name: "Ishita Verma", email: "website@starkpackmate.com", role: "website_manager" },
  { name: "Rohan Kapoor", email: "salesmanager@starkpackmate.com", role: "sales_manager" },
  { name: "Neha Singh", email: "sales@starkpackmate.com", role: "sales_executive" },
  { name: "Karan Joshi", email: "accounts@starkpackmate.com", role: "accounts_manager" },
  { name: "Priya Nair", email: "production@starkpackmate.com", role: "production_manager" },
  { name: "Vikram Shah", email: "admin@starkpackmate.com", role: "super_admin" },
];

function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `scrypt:${salt.toString("hex")}:${hash.toString("hex")}`;
}

async function seedUsers() {
  const password = process.env.DEMO_PASSWORD || "Packmate@2026";

  for (const user of demoUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: { name: user.name, role: user.role, status: "active" },
      create: {
        name: user.name,
        email: user.email,
        role: user.role,
        status: "active",
        passwordHash: hashPassword(password),
      },
    });
  }

  console.log(`Seeded ${demoUsers.length} demo users.`);
}

async function main() {
  const existingProducts = await prisma.product.count();

  if (existingProducts === 0) {
    for (const category of categories) {
      await prisma.category.upsert({
        where: { slug: category.slug },
        update: category,
        create: category,
      });
    }

    for (const product of products) {
      const category = await prisma.category.findUniqueOrThrow({
        where: { slug: product.category },
      });

      await prisma.product.create({
        data: {
          code: product.code,
          slug: product.slug,
          name: product.name,
          categoryId: category.id,
          description: product.description,
          application: product.application,
          featured: product.featured,
          status: "published",
          seoTitle: product.seoTitle,
          seoDescription: product.seoDescription,
          variants: {
            create: product.variants.map((variant) => ({
              ...variant,
              status: "active",
            })),
          },
        },
      });
    }

    console.log(`Seeded ${categories.length} categories and ${products.length} products.`);
  } else {
    console.log("Catalogue already contains products — seed skipped.");
  }

  for (const [key, value] of Object.entries(content)) {
    await prisma.contentBlock.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  console.log("Content blocks ready.");

  await seedUsers();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
