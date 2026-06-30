"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Building2, BarChart3, Upload, Star, Moon, Sun, Pill, Calculator } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/pharmacies", icon: Building2, label: "Pharmacies" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/pricing", icon: Calculator, label: "Pricing Calc" },
  { href: "/import", icon: Upload, label: "Import" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();

  return (
    <aside className="w-16 lg:w-56 flex flex-col bg-card border-r border-border shrink-0">
      <div className="h-16 flex items-center px-4 border-b border-border gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <Pill className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="hidden lg:block font-bold text-sm text-foreground">RxPredict</span>
      </div>

      <nav className="flex-1 py-4 flex flex-col gap-1 px-2">
        {NAV.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-2 py-2 rounded-lg text-sm font-medium transition-colors",
              pathname === href || (href !== "/" && pathname.startsWith(href))
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="w-5 h-5 shrink-0" />
            <span className="hidden lg:block">{label}</span>
          </Link>
        ))}

        <div className="mt-2 border-t border-border pt-2">
          <Link
            href="/pharmacies?isFavorite=true"
            className={cn(
              "flex items-center gap-3 px-2 py-2 rounded-lg text-sm font-medium transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Star className="w-5 h-5 shrink-0 text-yellow-500" />
            <span className="hidden lg:block">Favorites</span>
          </Link>
        </div>
      </nav>

      <div className="p-2 border-t border-border">
        <button
          onClick={toggle}
          className="w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          {theme === "dark" ? <Sun className="w-5 h-5 shrink-0" /> : <Moon className="w-5 h-5 shrink-0" />}
          <span className="hidden lg:block">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
        </button>
      </div>
    </aside>
  );
}
