"use client";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Activity } from "lucide-react";

interface ActivityItem {
  id: number;
  action: string;
  detail: string | null;
  createdAt: string;
  pharmacy: { id: number; name: string };
}

export default function RecentActivityFeed({ activities }: { activities: ActivityItem[] }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-4 h-4 text-muted-foreground" />
        <h3 className="font-semibold text-sm text-foreground">Recent Activity</h3>
      </div>
      {activities.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">No activity yet</p>
      ) : (
        <div className="space-y-3">
          {activities.map((a) => (
            <div key={a.id} className="flex items-start gap-3 text-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
              <div className="flex-1 min-w-0">
                <Link href={`/pharmacies/${a.pharmacy.id}`} className="font-medium text-foreground hover:text-primary truncate block">
                  {a.pharmacy.name}
                </Link>
                <p className="text-muted-foreground text-xs">{a.action}{a.detail ? ` — ${a.detail}` : ""}</p>
                <p className="text-xs text-muted-foreground/60 mt-0.5">{formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
