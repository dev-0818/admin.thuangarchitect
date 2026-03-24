import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  published: boolean;
};

export function StatusBadge({ published }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "pill",
        published
          ? "bg-secondary/10 text-secondary"
          : "bg-primary-container/20 text-primary"
      )}
    >
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          published ? "bg-secondary" : "bg-primary"
        )}
      />
      {published ? "Published" : "Draft"}
    </span>
  );
}
