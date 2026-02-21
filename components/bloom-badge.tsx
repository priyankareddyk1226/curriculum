import { type BloomLevel, BLOOM_COLORS } from "@/lib/curriculum-schema"
import { cn } from "@/lib/utils"

interface BloomBadgeProps {
  level: BloomLevel
  className?: string
}

export function BloomBadge({ level, className }: BloomBadgeProps) {
  const colors = BLOOM_COLORS[level]
  if (!colors) return null

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        colors.bg,
        colors.text,
        colors.border,
        className
      )}
    >
      {level}
    </span>
  )
}
