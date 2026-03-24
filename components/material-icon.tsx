import { cn } from "@/lib/utils";

type MaterialIconProps = {
  name: string;
  className?: string;
  filled?: boolean;
};

export function MaterialIcon({
  name,
  className,
  filled = false
}: MaterialIconProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("material-symbols-outlined", filled ? "icon-filled" : "", className)}
    >
      {name}
    </span>
  );
}
