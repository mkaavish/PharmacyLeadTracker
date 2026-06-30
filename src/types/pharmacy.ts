export type PharmacyStatus =
  | "Not Contacted"
  | "Contacted"
  | "Awaiting Response"
  | "Interested"
  | "Follow-up Scheduled"
  | "Demo Scheduled"
  | "Pilot Started"
  | "Pilot Completed"
  | "Customer"
  | "Lost";

export const STATUS_COLORS: Record<PharmacyStatus, string> = {
  "Not Contacted": "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  "Contacted": "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  "Awaiting Response": "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  "Interested": "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  "Follow-up Scheduled": "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  "Demo Scheduled": "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  "Pilot Started": "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300",
  "Pilot Completed": "bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300",
  "Customer": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  "Lost": "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

export const ALL_STATUSES: PharmacyStatus[] = [
  "Not Contacted",
  "Contacted",
  "Awaiting Response",
  "Interested",
  "Follow-up Scheduled",
  "Demo Scheduled",
  "Pilot Started",
  "Pilot Completed",
  "Customer",
  "Lost",
];

export const PRIORITY_COLORS = {
  High: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  Medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  Low: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

export type Priority = "High" | "Medium" | "Low";

export interface PharmacyWithTags {
  id: number;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  phone: string | null;
  website: string | null;
  specialty: string | null;
  numLocations: number | null;
  ownerName: string | null;
  pharmacistInCharge: string | null;
  ownerEmail: string | null;
  linkedin: string | null;
  benefitScore: number | null;
  priority: string | null;
  estimatedSize: string | null;
  status: string;
  contacted: boolean;
  firstContactDate: string | null;
  lastContactDate: string | null;
  nextFollowUpDate: string | null;
  preferredContactMethod: string | null;
  decisionMaker: string | null;
  probabilityOfClosing: number | null;
  expectedMonthlyValue: number | null;
  lifetimeValue: number | null;
  source: string | null;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
  tags: { tag: { id: number; name: string; color: string } }[];
  _count?: { notes: number; tasks: number };
}
