import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
  className?: string;
};

export function EmptyState({ icon: Icon, eyebrow, title, description, className }: EmptyStateProps) {
  return (
    <article className={cn("overflow-hidden rounded-lg border border-dashed bg-card p-6", className)}>
      <div className="mb-5 h-1 w-24 rounded-full bg-gradient-to-r from-primary via-secondary to-accent" />
      <div className="flex flex-col gap-5 md:flex-row md:items-start">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-md border bg-background text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{eyebrow}</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-normal">{title}</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">{description}</p>
        </div>
      </div>
    </article>
  );
}
