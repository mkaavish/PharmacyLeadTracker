"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import toast from "react-hot-toast";

export default function AddPharmacyModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ name: "", city: "", state: "TX", phone: "", specialty: "General", priority: "Medium" });
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!form.name) { toast.error("Name is required"); return; }
    setLoading(true);
    const res = await fetch("/api/pharmacies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast.success("Pharmacy added");
      onCreated();
      onClose();
    } else {
      toast.error("Failed to add pharmacy");
    }
    setLoading(false);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Add Pharmacy</DialogTitle></DialogHeader>
        <div className="space-y-3 mt-2">
          <Input placeholder="Pharmacy Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            <Input placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
          </div>
          <Input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Select value={form.specialty} onValueChange={(v) => setForm({ ...form, specialty: v || "General" })}>
            <SelectTrigger><SelectValue placeholder="Specialty" /></SelectTrigger>
            <SelectContent>
              {["General", "Compounding", "Specialty", "Medical", "Long-Term Care"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v || "Medium" })}>
            <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={submit} disabled={loading}>{loading ? "Adding…" : "Add Pharmacy"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
