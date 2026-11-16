import { cn } from "@/lib/utils";

export function BrandMark({
  className,
  inverted = false,
}: {
  className?: string;
  inverted?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-[12px]",
          inverted ? "bg-white" : "bg-ink",
        )}
      >
        <span
          className={cn(
            "relative z-10 text-[13px] font-bold tracking-[-0.06em]",
            inverted ? "text-ink" : "text-white",
          )}
        >
          SP
        </span>
        <span className="absolute -bottom-2.5 -right-2.5 h-6 w-6 rounded-full bg-brand-500/80" />
        <span className="absolute -left-1 top-1 h-4 w-1 rounded-full bg-sand-300/80" />
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "text-[15px] font-semibold tracking-[-0.02em]",
            inverted ? "text-white" : "text-ink",
          )}
        >
          STARK
        </span>
        <span
          className={cn(
            "mt-1 text-[9px] font-semibold uppercase tracking-[0.24em]",
            inverted ? "text-white/55" : "text-ink-muted",
          )}
        >
          Packmate
        </span>
      </span>
    </span>
  );
}
