import { cn, initials } from "@/lib/utils";

type PackShotProps = {
  name: string;
  categorySlug: string;
  className?: string;
  tone?: number;
};

const palettes = [
  {
    bg: "#e8eff9",
    body: "#0b63ce",
    deep: "#083b78",
    panel: "#f8fbff",
    ink: "#0a2d58",
    accent: "#8dbeff",
  },
  {
    bg: "#f3ece2",
    body: "#c99768",
    deep: "#86582f",
    panel: "#fffaf3",
    ink: "#54351b",
    accent: "#e7d2b8",
  },
  {
    bg: "#e9f0ea",
    body: "#347158",
    deep: "#1b4433",
    panel: "#f8fbf8",
    ink: "#173b2c",
    accent: "#9cc5b2",
  },
  {
    bg: "#efeaf2",
    body: "#634475",
    deep: "#3b2748",
    panel: "#fdfbff",
    ink: "#372442",
    accent: "#c9b2d5",
  },
  {
    bg: "#f5eae5",
    body: "#b5543d",
    deep: "#7a3222",
    panel: "#fff9f6",
    ink: "#642a1c",
    accent: "#e5b4a6",
  },
  {
    bg: "#e8ecef",
    body: "#22364c",
    deep: "#0a1a2f",
    panel: "#f9fbfc",
    ink: "#0a1a2f",
    accent: "#a9bccd",
  },
];

function kindFor(categorySlug: string) {
  if (categorySlug === "printed-labels") return "label";
  if (categorySlug === "shrink-sleeves") return "sleeve";
  if (categorySlug === "courier-bags") return "mailer";
  if (categorySlug === "corrugated-packaging") return "box";
  if (categorySlug === "laminated-rolls") return "roll";
  return "pouch";
}

function defaultTone(name: string) {
  return [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % palettes.length;
}

export function PackShot({ name, categorySlug, className, tone }: PackShotProps) {
  const requestedTone = tone === undefined ? defaultTone(name) : tone;
  const palette = palettes[Math.abs(requestedTone) % palettes.length];
  const kind = kindFor(categorySlug);
  const mark = initials(name) || "SP";

  return (
    <div
      className={cn("relative isolate overflow-hidden", className)}
      style={{ backgroundColor: palette.bg }}
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div
        className="absolute -right-10 -top-12 h-40 w-40 rounded-full opacity-40 blur-2xl"
        style={{ backgroundColor: palette.accent }}
      />
      <div
        className="absolute -bottom-16 -left-10 h-48 w-48 rounded-full opacity-25 blur-2xl"
        style={{ backgroundColor: palette.body }}
      />
      <div className="absolute bottom-[7%] left-1/2 h-[7%] w-[58%] -translate-x-1/2 rounded-[50%] bg-ink/20 blur-md" />

      {kind === "pouch" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="absolute aspect-[0.64] h-[64%] translate-x-4 rotate-[7deg] rounded-[10px_10px_18px_18px] opacity-35"
            style={{
              background: `linear-gradient(155deg, ${palette.accent}, ${palette.body})`,
            }}
          />
          <div
            className="relative aspect-[0.64] h-[72%] -rotate-3 rounded-[9px_9px_20px_20px]"
            style={{
              background: `linear-gradient(150deg, ${palette.body} 0%, ${palette.deep} 100%)`,
              boxShadow: "0 28px 45px -20px rgba(10, 26, 47, 0.65)",
            }}
          >
            <div className="absolute inset-x-0 top-0 h-[8%] rounded-t-[9px] border-b border-white/25 bg-white/20">
              <div className="absolute left-1/2 top-0 h-[62%] w-[18%] -translate-x-1/2 border-x border-b border-white/35" />
            </div>
            <div className="absolute right-[8%] top-[3%] h-[2px] w-[14%] bg-white/45" />
            <div
              className="absolute inset-x-[9%] bottom-[15%] top-[15%] flex flex-col justify-between overflow-hidden rounded-[5px] px-[10%] py-[9%]"
              style={{ backgroundColor: palette.panel }}
            >
              <div>
                <p
                  className="text-[7px] font-semibold uppercase leading-none tracking-[0.18em]"
                  style={{ color: palette.ink }}
                >
                  Stark Packmate
                </p>
                <p
                  className="mt-1.5 line-clamp-2 text-[10px] font-bold uppercase leading-[1.15] tracking-[-0.01em]"
                  style={{ color: palette.ink }}
                >
                  {name}
                </p>
              </div>
              <div>
                <div className="h-[3px] w-[62%] rounded-full" style={{ backgroundColor: palette.body }} />
                <div className="mt-1 h-[2px] w-[42%] rounded-full opacity-40" style={{ backgroundColor: palette.ink }} />
              </div>
              <div
                className="flex h-[22%] items-center justify-center rounded-[3px] text-[8px] font-bold tracking-[0.08em]"
                style={{ backgroundColor: palette.ink, color: palette.panel }}
              >
                {mark}
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-[13%] rounded-b-[20px] bg-black/15" />
            <div className="absolute bottom-[3%] left-1/2 h-[4px] w-[54%] -translate-x-1/2 rounded-full bg-white/20 blur-[1px]" />
            <div className="absolute inset-y-[12%] left-[9%] w-[2px] rounded-full bg-white/20" />
          </div>
        </div>
      )}

      {kind === "label" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="absolute bottom-[12%] right-[14%] h-[34%] w-[34%] rounded-full border-[7px] border-white/55"
            style={{
              background: `repeating-radial-gradient(circle, ${palette.bg}, ${palette.bg} 3px, rgba(255,255,255,.5) 4px, rgba(255,255,255,.5) 5px)`,
              boxShadow: "0 20px 35px -18px rgba(10,26,47,.5)",
            }}
          />
          <div className="relative h-[38%] w-[66%] -rotate-6 overflow-hidden rounded-md bg-white shadow-[0_26px_45px_-20px_rgba(10,26,47,.55)]">
            <div className="h-[42%] p-[6%]" style={{ backgroundColor: palette.body }}>
              <p className="text-[7px] font-semibold uppercase tracking-[0.2em] text-white/80">
                Stark Packmate
              </p>
              <p className="mt-1 line-clamp-1 text-[11px] font-bold leading-tight text-white">{name}</p>
            </div>
            <div className="flex h-[58%] flex-col justify-between p-[6%]">
              <div>
                <div className="h-[3px] w-[40%] rounded-full" style={{ backgroundColor: palette.ink }} />
                <div className="mt-1.5 h-[2px] w-[72%] rounded-full bg-ink/20" />
                <div className="mt-1 h-[2px] w-[58%] rounded-full bg-ink/20" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[7px] font-semibold uppercase tracking-[0.14em] text-ink/50">
                  {mark}
                </span>
                <span
                  className="rounded-full px-2 py-[2px] text-[6px] font-bold uppercase tracking-wider text-white"
                  style={{ backgroundColor: palette.body }}
                >
                  Label
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {kind === "sleeve" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative h-[74%] w-[32%]">
            <div className="absolute left-1/2 top-0 h-[20%] w-[38%] -translate-x-1/2 rounded-t-md bg-white/45" />
            <div
              className="absolute inset-x-0 bottom-0 top-[12%] rounded-[26px_26px_16px_16px] border border-white/30 bg-white/20"
              style={{ boxShadow: "inset 0 0 30px rgba(255,255,255,.45)" }}
            >
              <div
                className="absolute inset-x-0 top-[34%] h-[36%] overflow-hidden rounded-[2px] px-[12%] py-[10%]"
                style={{ background: `linear-gradient(155deg, ${palette.body}, ${palette.deep})` }}
              >
                <p className="text-[6px] font-semibold uppercase tracking-[0.18em] text-white/70">
                  Shrink sleeve
                </p>
                <p className="mt-1 line-clamp-2 text-[9px] font-bold uppercase leading-tight text-white">
                  {name}
                </p>
                <div className="mt-2 h-[2px] w-[50%] rounded-full bg-white/50" />
              </div>
              <div className="absolute inset-x-[14%] bottom-[8%] h-[2px] rounded-full bg-white/50" />
            </div>
          </div>
        </div>
      )}

      {kind === "mailer" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative h-[64%] w-[58%] -rotate-3">
            <div
              className="absolute inset-0 rounded-[6px]"
              style={{
                background: `linear-gradient(155deg, ${palette.body}, ${palette.deep})`,
                boxShadow: "0 24px 38px -18px rgba(10,26,47,.55)",
              }}
            >
              <div className="absolute inset-x-0 top-0 h-[18%] rounded-t-[6px] border-b border-white/25 bg-white/15" />
              <div className="absolute inset-x-[9%] top-[28%] rounded bg-white/95 p-[7%]">
                <p className="text-[6px] font-semibold uppercase tracking-[0.18em]" style={{ color: palette.ink }}>
                  Stark Packmate
                </p>
                <p className="mt-1 text-[9px] font-bold uppercase leading-tight" style={{ color: palette.ink }}>
                  {name}
                </p>
                <div className="mt-2 h-[2px] w-[55%] rounded-full" style={{ backgroundColor: palette.body }} />
              </div>
              <div className="absolute inset-x-[9%] bottom-[10%] flex items-center justify-between">
                <span className="text-[6px] font-semibold uppercase tracking-[0.14em] text-white/65">
                  Tamper-proof seal
                </span>
                <span className="h-3 w-3 rounded-full border border-white/50" />
              </div>
            </div>
          </div>
        </div>
      )}

      {kind === "box" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative h-[55%] w-[62%]">
            <div
              className="absolute left-0 top-[18%] h-[72%] w-[64%] rounded-sm"
              style={{ background: palette.body, boxShadow: "0 24px 40px -18px rgba(10,26,47,.55)" }}
            >
              <div className="absolute inset-x-0 top-[18%] h-[2px] bg-white/30" />
              <div className="absolute inset-x-[12%] top-[38%] rounded-sm bg-white/90 p-[8%]">
                <p className="text-[6px] font-bold uppercase tracking-[0.16em]" style={{ color: palette.ink }}>
                  Stark Packmate
                </p>
                <p className="mt-1 text-[8px] font-semibold uppercase leading-tight" style={{ color: palette.ink }}>
                  {name}
                </p>
              </div>
            </div>
            <div
              className="absolute right-0 top-[8%] h-[72%] w-[34%]"
              style={{
                background: palette.deep,
                clipPath: "polygon(0 12%, 100% 0, 100% 88%, 0 100%)",
              }}
            />
            <div
              className="absolute left-[3%] right-[3%] top-0 h-[20%]"
              style={{
                background: palette.accent,
                clipPath: "polygon(10% 100%, 0 20%, 72% 0, 100% 60%, 90% 100%)",
                opacity: 0.75,
              }}
            />
          </div>
        </div>
      )}

      {kind === "roll" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative h-[48%] w-[68%] -rotate-6">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `linear-gradient(180deg, ${palette.body}, ${palette.deep})`,
                boxShadow: "0 26px 40px -18px rgba(10,26,47,.55)",
              }}
            >
              <div className="absolute inset-y-0 left-[13%] w-[2px] bg-white/25" />
              <div className="absolute inset-y-0 right-[13%] w-[2px] bg-white/25" />
              <div className="absolute inset-x-[20%] top-[24%] rounded-sm bg-white/90 px-[7%] py-[5%]">
                <p className="text-[6px] font-bold uppercase tracking-[0.16em]" style={{ color: palette.ink }}>
                  Stark Packmate
                </p>
                <p className="mt-1 line-clamp-1 text-[8px] font-semibold uppercase" style={{ color: palette.ink }}>
                  {name}
                </p>
              </div>
              <div className="absolute bottom-[18%] left-[22%] right-[22%] h-[3px] rounded-full bg-white/35" />
            </div>
            <div className="absolute -right-2 top-1/2 h-[74%] w-[18%] -translate-y-1/2 rounded-full bg-white/50 blur-[1px]" />
          </div>
        </div>
      )}
    </div>
  );
}
