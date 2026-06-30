"use client";
import { useState, useCallback } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { Upload, FileSpreadsheet, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import toast from "react-hot-toast";

const TARGET_FIELDS = [
  "name", "address", "city", "state", "zip", "phone", "website",
  "specialty", "ownerName", "benefitScore", "priority", "status", "(skip)"
];

export default function ImportClient() {
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [step, setStep] = useState<"upload" | "map" | "done">("upload");
  const [importing, setImporting] = useState(false);
  const [importedCount, setImportedCount] = useState(0);

  const autoMap = (cols: string[]) => {
    const map: Record<string, string> = {};
    const normalize = (s: string) => s.toLowerCase().replace(/[\s_-]/g, "");
    const fieldAliases: Record<string, string[]> = {
      name: ["name", "pharmacyname", "storename"],
      city: ["city"],
      state: ["state"],
      zip: ["zip", "zipcode", "postalcode"],
      phone: ["phone", "telephone", "tel"],
      website: ["website", "url", "web"],
      specialty: ["specialty", "type"],
      ownerName: ["owner", "ownername"],
      benefitScore: ["benefitscore", "score"],
      priority: ["priority"],
      status: ["status"],
      address: ["address", "streetaddress"],
    };
    cols.forEach((col) => {
      const norm = normalize(col);
      for (const [field, aliases] of Object.entries(fieldAliases)) {
        if (aliases.includes(norm)) { map[col] = field; break; }
      }
      if (!map[col]) map[col] = "(skip)";
    });
    return map;
  };

  const handleFile = useCallback((file: File) => {
    if (file.name.endsWith(".csv")) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const h = results.meta.fields || [];
          setHeaders(h);
          setRows(results.data as Record<string, string>[]);
          setMapping(autoMap(h));
          setStep("map");
        },
      });
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const wb = XLSX.read(e.target?.result, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: "" });
        const h = data.length > 0 ? Object.keys(data[0]) : [];
        setHeaders(h);
        setRows(data);
        setMapping(autoMap(h));
        setStep("map");
      };
      reader.readAsBinaryString(file);
    }
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const doImport = async () => {
    setImporting(true);
    const mapped = rows.map((row) => {
      const r: Record<string, string> = {};
      headers.forEach((h) => { if (mapping[h] && mapping[h] !== "(skip)") r[mapping[h]] = row[h]; });
      return r;
    });
    const res = await fetch("/api/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows: mapped }),
    });
    const { imported } = await res.json();
    setImportedCount(imported);
    setStep("done");
    toast.success(`Imported ${imported} pharmacies`);
    setImporting(false);
  };

  if (step === "done") {
    return (
      <div className="p-6 max-w-lg mx-auto mt-16 text-center">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-foreground">Import Complete!</h2>
        <p className="text-muted-foreground mt-2">{importedCount} pharmacies imported successfully.</p>
        <div className="flex gap-3 justify-center mt-6">
          <Button variant="outline" onClick={() => { setStep("upload"); setRows([]); setHeaders([]); }}>Import More</Button>
          <Button onClick={() => window.location.href = "/pharmacies"}>View Pharmacies</Button>
        </div>
      </div>
    );
  }

  if (step === "map") {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-1">Map Columns</h1>
        <p className="text-muted-foreground text-sm mb-6">{rows.length} rows found. Map your columns to fields.</p>

        <div className="bg-card border border-border rounded-xl overflow-hidden mb-6">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Your Column</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Preview</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Maps To</th>
              </tr>
            </thead>
            <tbody>
              {headers.map((h) => (
                <tr key={h} className="border-t border-border">
                  <td className="px-4 py-2 font-medium text-foreground">{h}</td>
                  <td className="px-4 py-2 text-muted-foreground text-xs">{rows[0]?.[h]?.slice(0, 40) || "—"}</td>
                  <td className="px-4 py-2">
                    <Select value={mapping[h] || "(skip)"} onValueChange={(v) => setMapping({ ...mapping, [h]: v || "(skip)" })}>
                      <SelectTrigger className="h-8 w-44"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {TARGET_FIELDS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setStep("upload")}>Back</Button>
          <Button onClick={doImport} disabled={importing}>{importing ? "Importing…" : `Import ${rows.length} Pharmacies`}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-1">Import Pharmacies</h1>
      <p className="text-muted-foreground text-sm mb-8">Upload a CSV or Excel file to bulk-import pharmacies.</p>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-border rounded-xl p-12 text-center hover:border-primary/50 hover:bg-muted/20 transition-all cursor-pointer"
        onClick={() => document.getElementById("file-input")?.click()}
      >
        <FileSpreadsheet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-foreground font-medium">Drop a CSV or Excel file here</p>
        <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
        <p className="text-xs text-muted-foreground mt-4">Supports .csv, .xlsx, .xls</p>
        <input
          id="file-input" type="file" accept=".csv,.xlsx,.xls" className="hidden"
          onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
        />
      </div>

      <div className="mt-6 bg-muted/30 rounded-xl p-4">
        <p className="text-sm font-medium text-foreground mb-2">Expected columns (optional):</p>
        <div className="flex flex-wrap gap-2">
          {["Name", "Address", "City", "State", "ZIP", "Phone", "Website", "Specialty", "Owner Name", "Benefit Score", "Priority"].map((f) => (
            <span key={f} className="text-xs bg-background border border-border rounded px-2 py-0.5 text-muted-foreground">{f}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
