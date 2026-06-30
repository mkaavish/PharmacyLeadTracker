import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color?: string;
  subtitle?: string;
  onClick?: () => void;
}

export default function KpiCard({ title, value, icon: Icon, color = "text-primary", subtitle, onClick }: KpiCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-card border border-border rounded-xl p-4 flex items-start gap-4",
        onClick && "cursor-pointer hover:border-primary/50 hover:shadow-sm transition-all"
      )}
    >
      <div className={cn("p-2.5 rounded-lg bg-muted", color.replace("text-", "bg-").replace("-600", "-100").replace("-500", "-100"))}>
        <Icon className={cn("w-5 h-5", color)} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}
