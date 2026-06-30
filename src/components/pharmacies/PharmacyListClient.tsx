"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
  Search, Plus, Download, Upload, SlidersHorizontal, Star, StarOff,
  Phone, Globe, MapPin, Link2, ArrowUpDown, ChevronLeft, ChevronRight,
  Check
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StatusBadge from "./StatusBadge";
import { PharmacyWithTags } from "@/types/pharmacy";
import { ALL_STATUSES, PRIORITY_COLORS } from "@/types/pharmacy";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import AddPharmacyModal from "./AddPharmacyModal";

const PAGE_SIZES = [25, 50, 100];

export default function PharmacyListClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [pharmacies, setPharmacies] = useState<PharmacyWithTags[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Filters
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [priority, setPriority] = useState(searchParams.get("priority") || "");
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [isFavorite, setIsFavorite] = useState(searchParams.get("isFavorite") || "");

  // Pagination & sorting
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [sortBy, setSortBy] = useState("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const fetchPharmacies = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      search, status, priority, city, isFavorite,
      sortBy, sortDir, page: String(page), pageSize: String(pageSize),
    });
    const res = await fetch(`/api/pharmacies?${params}`);
    const data = await res.json();
    setPharmacies(data.pharmacies);
    setTotal(data.total);
    setLoading(false);
  }, [search, status, priority, city, isFavorite, sortBy, sortDir, page, pageSize]);

  useEffect(() => {
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(fetchPharmacies, 300);
    return () => clearTimeout(searchTimeout.current);
  }, [fetchPharmacies]);

  const toggleFavorite = async (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const res = await fetch(`/api/pharmacies/${id}/favorite`, { method: "POST" });
    const { isFavorite: newVal } = await res.json();
    setPharmacies((prev) => prev.map((p) => p.id === id ? { ...p, isFavorite: newVal } : p));
    toast.success(newVal ? "Added to favorites" : "Removed from favorites");
  };

  const markContacted = async (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await fetch(`/api/pharmacies/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Contacted", contacted: true, firstContactDate: new Date().toISOString() }),
    });
    toast.success("Marked as contacted");
    fetchPharmacies();
  };

  const handleSort = (col: string) => {
    if (sortBy === col) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("asc"); }
    setPage(1);
  };

  const exportData = (format: "csv" | "xlsx") => {
    const params = new URLSearchParams({ format, status, priority });
    window.open(`/api/export?${params}`, "_blank");
  };

  const SortIcon = ({ col }: { col: string }) => (
    <ArrowUpDown className={cn("w-3 h-3 ml-1 inline", sortBy === col ? "text-primary" : "text-muted-foreground")} />
  );

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-foreground">Pharmacies</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{total} total</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => exportData("csv")}><Download className="w-4 h-4 mr-1" />CSV</Button>
            <Button variant="outline" size="sm" onClick={() => exportData("xlsx")}><Download className="w-4 h-4 mr-1" />Excel</Button>
            <Link href="/import"><Button variant="outline" size="sm"><Upload className="w-4 h-4 mr-1" />Import</Button></Link>
            <Button size="sm" onClick={() => setShowAddModal(true)}><Plus className="w-4 h-4 mr-1" />Add Pharmacy</Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search name, city, owner..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 h-9"
            />
          </div>

          <Select value={status || "all"} onValueChange={(v) => { setStatus(v === "all" ? "" : (v || "")); setPage(1); }}>
            <SelectTrigger className="w-44 h-9"><SelectValue placeholder="All Statuses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {ALL_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={priority || "all"} onValueChange={(v) => { setPriority(v === "all" ? "" : (v || "")); setPage(1); }}>
            <SelectTrigger className="w-36 h-9"><SelectValue placeholder="Priority" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant={isFavorite ? "default" : "outline"}
            size="sm"
            onClick={() => { setIsFavorite(isFavorite ? "" : "true"); setPage(1); }}
          >
            <Star className="w-4 h-4" />
          </Button>

          {(search || status || priority || city || isFavorite) && (
            <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setStatus(""); setPriority(""); setCity(""); setIsFavorite(""); setPage(1); }}>
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm z-10">
            <tr className="border-b border-border">
              <th className="w-8 px-3 py-3"></th>
              <th className="px-3 py-3 text-left font-semibold text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => handleSort("name")}>
                Name <SortIcon col="name" />
              </th>
              <th className="px-3 py-3 text-left font-semibold text-muted-foreground cursor-pointer hover:text-foreground hidden md:table-cell" onClick={() => handleSort("city")}>
                City <SortIcon col="city" />
              </th>
              <th className="px-3 py-3 text-left font-semibold text-muted-foreground hidden lg:table-cell">Specialty</th>
              <th className="px-3 py-3 text-left font-semibold text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => handleSort("status")}>
                Status <SortIcon col="status" />
              </th>
              <th className="px-3 py-3 text-left font-semibold text-muted-foreground cursor-pointer hover:text-foreground hidden xl:table-cell" onClick={() => handleSort("benefitScore")}>
                Score <SortIcon col="benefitScore" />
              </th>
              <th className="px-3 py-3 text-left font-semibold text-muted-foreground hidden xl:table-cell">Priority</th>
              <th className="px-3 py-3 text-left font-semibold text-muted-foreground cursor-pointer hover:text-foreground hidden 2xl:table-cell" onClick={() => handleSort("lastContactDate")}>
                Last Contact <SortIcon col="lastContactDate" />
              </th>
              <th className="px-3 py-3 text-left font-semibold text-muted-foreground cursor-pointer hover:text-foreground hidden 2xl:table-cell" onClick={() => handleSort("nextFollowUpDate")}>
                Next Follow-up <SortIcon col="nextFollowUpDate" />
              </th>
              <th className="px-3 py-3 text-right font-semibold text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <tr key={i} className="border-b border-border">
                  {Array.from({ length: 10 }).map((_, j) => (
                    <td key={j} className="px-3 py-3"><div className="h-4 bg-muted animate-pulse rounded" /></td>
                  ))}
                </tr>
              ))
            ) : pharmacies.length === 0 ? (
              <tr><td colSpan={10} className="text-center py-16 text-muted-foreground">No pharmacies found</td></tr>
            ) : (
              pharmacies.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-border hover:bg-muted/40 cursor-pointer transition-colors"
                  onClick={() => router.push(`/pharmacies/${p.id}`)}
                >
                  <td className="px-3 py-3">
                    <button onClick={(e) => toggleFavorite(p.id, e)} className="text-muted-foreground hover:text-yellow-500 transition-colors">
                      {p.isFavorite ? <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /> : <StarOff className="w-4 h-4" />}
                    </button>
                  </td>
                  <td className="px-3 py-3">
                    <div className="font-medium text-foreground">{p.name}</div>
                    {p.ownerName && <div className="text-xs text-muted-foreground">{p.ownerName}</div>}
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {p.tags.slice(0, 2).map((t) => (
                        <span key={t.tag.id} className="text-xs px-1.5 py-0 rounded-full border" style={{ borderColor: t.tag.color, color: t.tag.color }}>{t.tag.name}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground hidden md:table-cell">
                    {p.city}{p.state ? `, ${p.state}` : ""}
                  </td>
                  <td className="px-3 py-3 text-muted-foreground hidden lg:table-cell">{p.specialty || "—"}</td>
                  <td className="px-3 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-3 py-3 hidden xl:table-cell">
                    {p.benefitScore ? (
                      <span className={cn("font-bold text-sm", p.benefitScore >= 8 ? "text-green-600" : p.benefitScore >= 6 ? "text-yellow-600" : "text-muted-foreground")}>
                        {p.benefitScore}/10
                      </span>
                    ) : "—"}
                  </td>
                  <td className="px-3 py-3 hidden xl:table-cell">
                    {p.priority ? (
                      <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", PRIORITY_COLORS[p.priority as keyof typeof PRIORITY_COLORS])}>{p.priority}</span>
                    ) : "—"}
                  </td>
                  <td className="px-3 py-3 text-muted-foreground text-xs hidden 2xl:table-cell">
                    {p.lastContactDate ? format(new Date(p.lastContactDate), "MMM d, yyyy") : "—"}
                  </td>
                  <td className="px-3 py-3 text-xs hidden 2xl:table-cell">
                    {p.nextFollowUpDate ? (
                      <span className={cn(new Date(p.nextFollowUpDate) < new Date() ? "text-red-500 font-medium" : "text-muted-foreground")}>
                        {format(new Date(p.nextFollowUpDate), "MMM d, yyyy")}
                      </span>
                    ) : "—"}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1 justify-end" onClick={(e) => e.stopPropagation()}>
                      {p.phone && (
                        <a href={`tel:${p.phone}`} className="p-1.5 rounded hover:bg-muted transition-colors" title={p.phone}>
                          <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                        </a>
                      )}
                      {p.website && (
                        <a href={p.website.startsWith("http") ? p.website : `https://${p.website}`} target="_blank" rel="noreferrer" className="p-1.5 rounded hover:bg-muted transition-colors">
                          <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                        </a>
                      )}
                      {p.city && (
                        <a href={`https://maps.google.com/?q=${encodeURIComponent(`${p.name} ${p.address || ""} ${p.city}`)}`} target="_blank" rel="noreferrer" className="p-1.5 rounded hover:bg-muted transition-colors">
                          <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                        </a>
                      )}
                      {!p.contacted && (
                        <button onClick={(e) => markContacted(p.id, e)} className="p-1.5 rounded hover:bg-green-50 hover:text-green-600 text-muted-foreground transition-colors" title="Mark Contacted">
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-3 border-t border-border bg-card flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rows per page:</span>
          <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
            <SelectTrigger className="w-20 h-8"><SelectValue /></SelectTrigger>
            <SelectContent>
              {PAGE_SIZES.map((s) => <SelectItem key={s} value={String(s)}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <span className="text-sm text-muted-foreground">
          {Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)} of {total}
        </span>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {showAddModal && <AddPharmacyModal onClose={() => setShowAddModal(false)} onCreated={fetchPharmacies} />}
    </div>
  );
}
