"use client";

import { useState, useTransition, type FormEvent, useEffect } from "react";
import { Input, Button, Text } from "@valenor/design-system";
import { createTechPack, listTechPacks } from "@/features/tech-packs/server/actions";

function TechPackForm({ onTechPackCreated }: { onTechPackCreated: () => void }) {
  const [pending, startTransition] = useTransition();
  const [styleCode, setStyleCode] = useState("");
  const [name, setName] = useState("");
  const [season, setSeason] = useState("");
  const [targetCost, setTargetCost] = useState("");
  const [status, setStatus] = useState("Draft");
  const [cadSketchUrl, setCadSketchUrl] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      try {
        await createTechPack({
          styleCode,
          name,
          season,
          targetCost: Number(targetCost),
          cadSketchUrl: cadSketchUrl || undefined,
          status,
        });
        setMessage(`Successfully created tech pack "${styleCode}"`);
        setStyleCode("");
        setName("");
        setSeason("");
        setTargetCost("");
        setStatus("Draft");
        setCadSketchUrl("");
        onTechPackCreated();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Failed to create tech pack.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6 border border-border bg-bg-raised">
      <h2 className="text-sm font-semibold text-fg">Create New Tech Pack</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted">Style Code</label>
          <Input placeholder="e.g. VN-SS26-01" value={styleCode} onChange={(e) => setStyleCode(e.target.value)} required />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted">Season</label>
          <Input placeholder="e.g. SS26" value={season} onChange={(e) => setSeason(e.target.value)} required />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted">Garment Name</label>
        <Input placeholder="e.g. Oversized Heavyweight Hoodie" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted">Target Cost (₹)</label>
          <Input type="number" step="0.01" placeholder="e.g. 1200" value={targetCost} onChange={(e) => setTargetCost(e.target.value)} required />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted">Status</label>
          <select 
            className="h-10 px-3 rounded border border-border bg-bg text-fg text-xs"
            value={status} 
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="Draft">Draft</option>
            <option value="In Review">In Review</option>
            <option value="Approved">Approved</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted">CAD Sketch URL (Optional)</label>
        <Input placeholder="https://..." value={cadSketchUrl} onChange={(e) => setCadSketchUrl(e.target.value)} />
      </div>

      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? "Creating Tech Pack..." : "Save Tech Pack"}
      </Button>

      {message && (
        <Text role="caption" as="p">
          {message}
        </Text>
      )}
    </form>
  );
}

export default function TechPacksAdminPage() {
  const [techPacks, setTechPacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTechPacksList = async () => {
    try {
      const data = await listTechPacks();
      setTechPacks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechPacksList();
  }, []);

  return (
    <div>
      <header className="mb-8 border-b border-border pb-4">
        <h1 className="font-display text-2xl mb-1 text-fg">Tech Packs</h1>
        <p className="font-body text-sm text-fg-muted">Manage garment specifications, style codes, seasons, and target costings.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <TechPackForm onTechPackCreated={fetchTechPacksList} />
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-semibold text-fg">Existing Tech Packs ({techPacks.length})</h2>
          <div className="border border-border bg-bg-raised">
            <div className="grid grid-cols-4 p-3 border-b border-border bg-bg text-xs tracking-wider uppercase text-fg-muted font-medium">
              <div>Style / Name</div>
              <div>Season</div>
              <div>Target Cost</div>
              <div>Status</div>
            </div>
            {loading ? (
              <div className="p-6 text-xs text-fg-muted text-center font-body">Loading tech packs...</div>
            ) : techPacks.length === 0 ? (
              <div className="p-6 text-xs text-fg-muted text-center font-body">No tech packs recorded yet.</div>
            ) : (
              techPacks.map((tp: any) => (
                <div key={tp.id} className="grid grid-cols-4 p-3 border-b border-border last:border-0 font-body text-xs items-center">
                  <div className="truncate pr-2">
                    <div className="font-medium text-fg">{tp.style_code}</div>
                    <div className="text-fg-muted text-[10px]">{tp.name}</div>
                  </div>
                  <div className="text-fg-muted">{tp.season}</div>
                  <div className="text-fg font-mono">₹{tp.target_cost ?? tp.targetCost}</div>
                  <div>
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-semibold ${
                      tp.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      tp.status === 'In Review' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                    }`}>
                      {tp.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}