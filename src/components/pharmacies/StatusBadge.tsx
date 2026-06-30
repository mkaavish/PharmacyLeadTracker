import { STATUS_COLORS, type PharmacyStatus } from "@/types/pharmacy";
import { cn } from "@/lib/utils";

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap", STATUS_COLORS[status as PharmacyStatus] || "bg-gray-100 text-gray-700")}>
      {status}
    </span>
  );
}
