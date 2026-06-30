"use client";
import Link from "next/link";
import { format, isToday, isTomorrow, isPast } from "date-fns";
import { CalendarClock } from "lucide-react";
import StatusBadge from "@/components/pharmacies/StatusBadge";
import { cn } from "@/lib/utils";

interface FollowUp {
  id: number;
  name: string;
  city: string | null;
  status: string;
  nextFollowUpDate: string;
  phone: string | null;
}

function dateLabel(d: Date) {
  if (isPast(d) && !isToday(d)) return <span className="text-red-500 font-medium">Overdue</span>;
  if (isToday(d)) return <span className="text-orange-500 font-medium">Today</span>;
  if (isTomorrow(d)) return <span className="text-yellow-500 font-medium">Tomorrow</span>;
  return <span className="text-muted-foreground">{format(d, "MMM d")}</span>;
}

export default function UpcomingFollowUps({ followUps }: { followUps: FollowUp[] }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <CalendarClock className="w-4 h-4 text-muted-foreground" />
        <h3 className="font-semibold text-sm text-foreground">Upcoming Follow-ups</h3>
      </div>
      {followUps.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">No upcoming follow-ups</p>
      ) : (
        <div className="space-y-2">
          {followUps.map((f) => {
            const d = new Date(f.nextFollowUpDate);
            return (
              <Link
                key={f.id}
                href={`/pharmacies/${f.id}`}
                className={cn(
                  "flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors",
                  isPast(d) && !isToday(d) && "bg-red-50/50 dark:bg-red-950/20"
                )}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{f.name}</p>
                  <p className="text-xs text-muted-foreground">{f.city}</p>
                </div>
                <div className="text-right shrink-0">
                  <StatusBadge status={f.status} />
                  <p className="text-xs mt-1">{dateLabel(d)}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
