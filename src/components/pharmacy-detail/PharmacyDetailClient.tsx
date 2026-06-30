"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format, formatDistanceToNow } from "date-fns";
import {
  ArrowLeft, Star, StarOff, Phone, Globe, MapPin, Link2, Edit3, Check,
  Plus, Trash2, CalendarCheck, Play, ExternalLink, ClipboardList
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StatusBadge from "@/components/pharmacies/StatusBadge";
import { ALL_STATUSES, PRIORITY_COLORS } from "@/types/pharmacy";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface Note { id: number; content: string; createdAt: string; updatedAt: string }
interface Task { id: number; type: string; title: string; dueDate: string | null; completed: boolean; priority: string }
interface ActivityLog { id: number; action: string; detail: string | null; createdAt: string }

export default function PharmacyDetailClient({ id }: { id: number }) {
  const router = useRouter();
  const [pharmacy, setPharmacy] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editField, setEditField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  // Notes
  const [noteContent, setNoteContent] = useState("");
  const [editNoteId, setEditNoteId] = useState<number | null>(null);
  const [editNoteContent, setEditNoteContent] = useState("");

  // Tasks
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({ type: "Call", title: "", dueDate: "", priority: "Medium" });

  const fetchPharmacy = useCallback(async () => {
    const res = await fetch(`/api/pharmacies/${id}`);
    if (res.ok) { setPharmacy(await res.json()); }
    setLoading(false);
  }, [id]);

  useEffect(() => { fetchPharmacy(); }, [fetchPharmacy]);

  const updateField = async (field: string, value: any) => {
    setSaving(true);
    const res = await fetch(`/api/pharmacies/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    if (res.ok) {
      const updated = await res.json();
      setPharmacy((prev: any) => ({ ...prev, ...updated }));
      toast.success("Saved");
    } else toast.error("Failed to save");
    setSaving(false);
    setEditField(null);
  };

  const startEdit = (field: string, value: any) => { setEditField(field); setEditValue(value || ""); };

  const addNote = async () => {
    if (!noteContent.trim()) return;
    const res = await fetch(`/api/pharmacies/${id}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: noteContent }),
    });
    if (res.ok) {
      const note = await res.json();
      setPharmacy((prev: any) => ({ ...prev, notes: [note, ...prev.notes] }));
      setNoteContent("");
      toast.success("Note added");
    }
  };

  const deleteNote = async (noteId: number) => {
    await fetch(`/api/pharmacies/${id}/notes`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ noteId }),
    });
    setPharmacy((prev: any) => ({ ...prev, notes: prev.notes.filter((n: Note) => n.id !== noteId) }));
  };

  const saveEditNote = async () => {
    if (!editNoteId) return;
    const res = await fetch(`/api/pharmacies/${id}/notes`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ noteId: editNoteId, content: editNoteContent }),
    });
    if (res.ok) {
      const note = await res.json();
      setPharmacy((prev: any) => ({ ...prev, notes: prev.notes.map((n: Note) => n.id === editNoteId ? note : n) }));
      setEditNoteId(null);
    }
  };

  const addTask = async () => {
    if (!newTask.title) return;
    const res = await fetch(`/api/pharmacies/${id}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newTask, dueDate: newTask.dueDate || null }),
    });
    if (res.ok) {
      const task = await res.json();
      setPharmacy((prev: any) => ({ ...prev, tasks: [...prev.tasks, task] }));
      setNewTask({ type: "Call", title: "", dueDate: "", priority: "Medium" });
      setShowAddTask(false);
      toast.success("Task added");
    }
  };

  const toggleTask = async (taskId: number, completed: boolean) => {
    await fetch(`/api/pharmacies/${id}/tasks`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, completed: !completed }),
    });
    setPharmacy((prev: any) => ({ ...prev, tasks: prev.tasks.map((t: Task) => t.id === taskId ? { ...t, completed: !t.completed } : t) }));
  };

  const deleteTask = async (taskId: number) => {
    await fetch(`/api/pharmacies/${id}/tasks`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId }),
    });
    setPharmacy((prev: any) => ({ ...prev, tasks: prev.tasks.filter((t: Task) => t.id !== taskId) }));
  };

  const toggleFavorite = async () => {
    const res = await fetch(`/api/pharmacies/${id}/favorite`, { method: "POST" });
    const { isFavorite } = await res.json();
    setPharmacy((prev: any) => ({ ...prev, isFavorite }));
  };

  const quickAction = async (action: string) => {
    const updates: Record<string, any> = {
      "contacted": { status: "Contacted", contacted: true, firstContactDate: new Date().toISOString() },
      "follow-up": { status: "Follow-up Scheduled", nextFollowUpDate: new Date(Date.now() + 7 * 86400000).toISOString() },
      "pilot": { status: "Pilot Started" },
    };
    await fetch(`/api/pharmacies/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates[action]),
    });
    toast.success(`${action === "contacted" ? "Marked Contacted" : action === "follow-up" ? "Follow-up Scheduled" : "Pilot Started"}!`);
    fetchPharmacy();
  };

  if (loading) return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  if (!pharmacy) return <div className="p-6 text-muted-foreground">Pharmacy not found</div>;

  const EditableField = ({ field, label, value, type = "text" }: { field: string; label: string; value: any; type?: string }) => (
    <div className="flex items-start gap-2 group">
      <div className="flex-1">
        <label className="text-xs text-muted-foreground font-medium">{label}</label>
        {editField === field ? (
          <div className="flex gap-1 mt-0.5">
            <Input autoFocus type={type} value={editValue} onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") updateField(field, editValue); if (e.key === "Escape") setEditField(null); }}
              className="h-7 text-sm" />
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => updateField(field, editValue)}><Check className="w-3 h-3" /></Button>
          </div>
        ) : (
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-sm text-foreground">{value || <span className="text-muted-foreground italic">—</span>}</span>
            <button onClick={() => startEdit(field, value)} className="opacity-0 group-hover:opacity-100 transition-opacity">
              <Edit3 className="w-3 h-3 text-muted-foreground" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full max-w-screen-xl mx-auto">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-card">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="w-4 h-4" /></Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-foreground">{pharmacy.name}</h1>
                <button onClick={toggleFavorite}>
                  {pharmacy.isFavorite ? <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" /> : <StarOff className="w-5 h-5 text-muted-foreground hover:text-yellow-400" />}
                </button>
              </div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <StatusBadge status={pharmacy.status} />
                {pharmacy.city && <span className="text-xs text-muted-foreground">{pharmacy.city}, {pharmacy.state}</span>}
                {pharmacy.specialty && <span className="text-xs text-muted-foreground">· {pharmacy.specialty}</span>}
                {pharmacy.benefitScore && <span className="text-xs font-medium text-indigo-600">Score: {pharmacy.benefitScore}/10</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {pharmacy.phone && <a href={`tel:${pharmacy.phone}`} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><Phone className="w-4 h-4" />{pharmacy.phone}</a>}
            {pharmacy.website && <a href={pharmacy.website.startsWith("http") ? pharmacy.website : `https://${pharmacy.website}`} target="_blank" rel="noreferrer" className="p-1.5 rounded hover:bg-muted"><Globe className="w-4 h-4 text-muted-foreground" /></a>}
            {pharmacy.city && <a href={`https://maps.google.com/?q=${encodeURIComponent(`${pharmacy.name} ${pharmacy.address || ""} ${pharmacy.city}`)}`} target="_blank" rel="noreferrer" className="p-1.5 rounded hover:bg-muted"><MapPin className="w-4 h-4 text-muted-foreground" /></a>}
            {pharmacy.linkedin && <a href={pharmacy.linkedin} target="_blank" rel="noreferrer" className="p-1.5 rounded hover:bg-muted"><Link2 className="w-4 h-4 text-muted-foreground" /></a>}
            <Button size="sm" variant="outline" onClick={() => quickAction("contacted")}>✓ Contacted</Button>
            <Button size="sm" variant="outline" onClick={() => quickAction("follow-up")}><CalendarCheck className="w-4 h-4 mr-1" />Follow-up</Button>
            <Button size="sm" onClick={() => quickAction("pilot")}><Play className="w-4 h-4 mr-1" />Start Pilot</Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-auto p-6">
        <Tabs defaultValue="overview">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="notes">Notes ({pharmacy.notes?.length || 0})</TabsTrigger>
            <TabsTrigger value="tasks">Tasks ({pharmacy.tasks?.filter((t: Task) => !t.completed).length || 0})</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          {/* OVERVIEW */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Basic Info */}
              <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                <h3 className="font-semibold text-sm text-foreground">Basic Information</h3>
                <EditableField field="name" label="Pharmacy Name" value={pharmacy.name} />
                <EditableField field="address" label="Address" value={pharmacy.address} />
                <EditableField field="city" label="City" value={pharmacy.city} />
                <EditableField field="state" label="State" value={pharmacy.state} />
                <EditableField field="zip" label="ZIP" value={pharmacy.zip} />
                <EditableField field="specialty" label="Specialty" value={pharmacy.specialty} />
                <EditableField field="numLocations" label="# Locations" value={pharmacy.numLocations} type="number" />
                <EditableField field="estimatedSize" label="Estimated Size" value={pharmacy.estimatedSize} />
              </div>

              {/* Contact Info */}
              <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                <h3 className="font-semibold text-sm text-foreground">Contact Information</h3>
                <EditableField field="ownerName" label="Owner Name" value={pharmacy.ownerName} />
                <EditableField field="pharmacistInCharge" label="Pharmacist in Charge" value={pharmacy.pharmacistInCharge} />
                <EditableField field="ownerEmail" label="Owner Email" value={pharmacy.ownerEmail} />
                <EditableField field="phone" label="Phone" value={pharmacy.phone} />
                <EditableField field="website" label="Website" value={pharmacy.website} />
                <EditableField field="linkedin" label="LinkedIn" value={pharmacy.linkedin} />
              </div>

              {/* Sales Info */}
              <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                <h3 className="font-semibold text-sm text-foreground">Sales Information</h3>
                <div>
                  <label className="text-xs text-muted-foreground font-medium">Status</label>
                  <Select value={pharmacy.status} onValueChange={(v) => updateField("status", v)}>
                    <SelectTrigger className="h-8 text-sm mt-0.5"><SelectValue /></SelectTrigger>
                    <SelectContent>{ALL_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-medium">Priority</label>
                  <Select value={pharmacy.priority || "Medium"} onValueChange={(v) => updateField("priority", v)}>
                    <SelectTrigger className="h-8 text-sm mt-0.5"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="High">High</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="Low">Low</SelectItem></SelectContent>
                  </Select>
                </div>
                <EditableField field="benefitScore" label="Benefit Score (1-10)" value={pharmacy.benefitScore} type="number" />
                <EditableField field="probabilityOfClosing" label="Close Probability %" value={pharmacy.probabilityOfClosing} type="number" />
                <EditableField field="expectedMonthlyValue" label="Expected Monthly Value ($)" value={pharmacy.expectedMonthlyValue} type="number" />
                <EditableField field="decisionMaker" label="Decision Maker" value={pharmacy.decisionMaker} />
                <EditableField field="source" label="Source" value={pharmacy.source} />
                <div>
                  <label className="text-xs text-muted-foreground font-medium">Next Follow-up</label>
                  {editField === "nextFollowUpDate" ? (
                    <div className="flex gap-1 mt-0.5">
                      <Input type="date" value={editValue} onChange={(e) => setEditValue(e.target.value)} className="h-7 text-sm" />
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => updateField("nextFollowUpDate", editValue ? new Date(editValue).toISOString() : null)}><Check className="w-3 h-3" /></Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 mt-0.5 group">
                      <span className="text-sm text-foreground">{pharmacy.nextFollowUpDate ? format(new Date(pharmacy.nextFollowUpDate), "MMM d, yyyy") : <span className="text-muted-foreground italic">—</span>}</span>
                      <button onClick={() => startEdit("nextFollowUpDate", pharmacy.nextFollowUpDate ? format(new Date(pharmacy.nextFollowUpDate), "yyyy-MM-dd") : "")} className="opacity-0 group-hover:opacity-100"><Edit3 className="w-3 h-3 text-muted-foreground" /></button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tags */}
            {pharmacy.tags?.length > 0 && (
              <div className="mt-4 bg-card border border-border rounded-xl p-4">
                <h3 className="font-semibold text-sm text-foreground mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {pharmacy.tags.map((t: any) => (
                    <span key={t.tag.id} className="px-2.5 py-1 rounded-full text-sm border font-medium" style={{ borderColor: t.tag.color, color: t.tag.color }}>
                      {t.tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* NOTES */}
          <TabsContent value="notes">
            <div className="max-w-2xl space-y-4">
              <div className="bg-card border border-border rounded-xl p-4">
                <Textarea
                  placeholder="Add a note… (e.g. 'Met owner today — they use PioneerRx and have inventory issues')"
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  rows={3}
                  className="resize-none text-sm"
                  onKeyDown={(e) => { if (e.key === "Enter" && e.metaKey) addNote(); }}
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-muted-foreground">⌘↵ to save</span>
                  <Button size="sm" onClick={addNote} disabled={!noteContent.trim()}>Add Note</Button>
                </div>
              </div>

              {pharmacy.notes?.map((note: Note) => (
                <div key={note.id} className="bg-card border border-border rounded-xl p-4">
                  {editNoteId === note.id ? (
                    <div className="space-y-2">
                      <Textarea value={editNoteContent} onChange={(e) => setEditNoteContent(e.target.value)} rows={3} className="resize-none text-sm" />
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="ghost" onClick={() => setEditNoteId(null)}>Cancel</Button>
                        <Button size="sm" onClick={saveEditNote}>Save</Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-foreground whitespace-pre-wrap">{note.content}</p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(note.createdAt), "MMM d, yyyy 'at' h:mm a")}
                          {note.updatedAt !== note.createdAt && " (edited)"}
                        </div>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => { setEditNoteId(note.id); setEditNoteContent(note.content); }}><Edit3 className="w-3 h-3" /></Button>
                          <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => deleteNote(note.id)}><Trash2 className="w-3 h-3" /></Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}

              {pharmacy.notes?.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">No notes yet. Add your first note above.</div>
              )}
            </div>
          </TabsContent>

          {/* TASKS */}
          <TabsContent value="tasks">
            <div className="max-w-2xl space-y-3">
              <Button size="sm" onClick={() => setShowAddTask(!showAddTask)}><Plus className="w-4 h-4 mr-1" />Add Task</Button>

              {showAddTask && (
                <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <Select value={newTask.type} onValueChange={(v) => setNewTask({ ...newTask, type: v || "Call" })}>
                      <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["Call", "Email", "Visit", "LinkedIn Message", "Reminder"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select value={newTask.priority} onValueChange={(v) => setNewTask({ ...newTask, priority: v || "Medium" })}>
                      <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="High">High</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="Low">Low</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <Input placeholder="Task description" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} />
                  <Input type="date" value={newTask.dueDate} onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })} className="h-8" />
                  <div className="flex gap-2 justify-end">
                    <Button size="sm" variant="ghost" onClick={() => setShowAddTask(false)}>Cancel</Button>
                    <Button size="sm" onClick={addTask}>Add Task</Button>
                  </div>
                </div>
              )}

              {pharmacy.tasks?.map((task: Task) => (
                <div key={task.id} className={cn("bg-card border border-border rounded-xl p-4 flex items-start gap-3", task.completed && "opacity-60")}>
                  <button onClick={() => toggleTask(task.id, task.completed)} className={cn("w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors", task.completed ? "bg-primary border-primary" : "border-border hover:border-primary")}>
                    {task.completed && <Check className="w-3 h-3 text-primary-foreground" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">{task.type}</span>
                      <span className={cn("text-xs px-1.5 py-0 rounded-full font-medium", PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS])}>{task.priority}</span>
                    </div>
                    <p className={cn("text-sm font-medium text-foreground mt-1", task.completed && "line-through")}>{task.title}</p>
                    {task.dueDate && <p className={cn("text-xs mt-1", new Date(task.dueDate) < new Date() && !task.completed ? "text-red-500 font-medium" : "text-muted-foreground")}>Due {format(new Date(task.dueDate), "MMM d, yyyy")}</p>}
                  </div>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive shrink-0" onClick={() => deleteTask(task.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              ))}

              {pharmacy.tasks?.length === 0 && !showAddTask && (
                <div className="text-center py-8 text-muted-foreground text-sm">No tasks yet.</div>
              )}
            </div>
          </TabsContent>

          {/* ACTIVITY */}
          <TabsContent value="activity">
            <div className="max-w-2xl">
              {pharmacy.activityLogs?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">No activity yet.</div>
              ) : (
                <div className="space-y-1">
                  {pharmacy.activityLogs?.map((log: ActivityLog, i: number) => (
                    <div key={log.id} className="flex items-start gap-3 py-3 border-b border-border last:border-0">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium text-foreground">{log.action}</span>
                          <span className="text-xs text-muted-foreground shrink-0">{formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}</span>
                        </div>
                        {log.detail && <p className="text-xs text-muted-foreground mt-0.5">{log.detail}</p>}
                        <p className="text-xs text-muted-foreground/60 mt-0.5">{format(new Date(log.createdAt), "MMM d, yyyy 'at' h:mm a")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
