"use client";

import { useState, useEffect, useTransition, type FormEvent } from "react";
import { Input, Button, Text } from "@valenor/design-system";
import { listTechPacksForCosting, getBOMItems, addBOMItem } from "@/features/costing/server/actions";

export default function ProductCostingPage() {
  const [techPacks, setTechPacks] = useState<any[]>([]);
  const [selectedTechPackId, setSelectedTechPackId] = useState<string>("");
  const [bomItems, setBomItems] = useState<any[]>([]);
  const [loadingTechPacks, setLoadingTechPacks] = useState(true);
  const [loadingBOM, setLoadingBOM] = useState(false);

  // Form state
  const [pending, startTransition] = useTransition();
  const [materialName, setMaterialName] = useState("");
  const [category, setCategory] = useState("Fabric");
  const [consumption, setConsumption] = useState("");
  const [unit, setUnit] = useState("meters");
  const [unitCost, setUnitCost] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadTPs() {
      try {
        const tps = await listTechPacksForCosting();
        setTechPacks(tps);
        if (tps.length > 0) {
          setSelectedTechPackId(tps[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingTechPacks(false);
      }
    }
    loadTPs();
  }, []);

  useEffect(() => {
    if (!selectedTechPackId) return;
    async function loadBOM() {
      setLoadingBOM(true);
      try {
        const items = await getBOMItems(selectedTechPackId);
        setBomItems(items);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingBOM(false);
      }
    }
    loadBOM();
  }, [selectedTechPackId]);

  const activeTechPack = techPacks.find((tp) => tp.id === selectedTechPackId);

  // Calculate total computed cost from BOM items
  const totalComputedCost = bomItems.reduce((acc, item) => {
    return acc + (Number(item.consumption) * Number(item.unit_cost));
  }, 0);

  const targetCost = activeTechPack ? Number(activeTechPack.target_cost) : 0;
  const variance = totalComputedCost - targetCost;

  function handleAddBOM(e: FormEvent) {
    e.preventDefault();
    if (!selectedTechPackId) return;

    startTransition(async () => {
      try {
        await addBOMItem({
          techPackId: selectedTechPackId,
          materialName,
          category,
          consumption: Number(consumption),
          unit,
          unitCost: Number(unitCost),
        });
        setMessage(`Added "${materialName}" successfully.`);
        setMaterialName("");
        setConsumption("");
        setUnitCost("");

        // Refresh BOM list
        const items = await getBOMItems(selectedTechPackId);
        setBomItems(items);
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "Failed to add BOM item.");
      }
    });
  }

  return (
    <div>
      <header className="mb-8 border-b border-border pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl mb-1 text-fg">Product Costing & BOM</h1>
          <p className="font-body text-sm text-fg-muted">Calculate bill of materials cost rollups and monitor target cost variances.</p>
        </div>

        {/* Tech Pack Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-fg-muted uppercase tracking-wider font-medium">Select Style:</label>
          <select 
            className="h-10 px-3 rounded border border-border bg-bg-raised text-fg text-xs font-medium"
            value={selectedTechPackId}
            onChange={(e) => setSelectedTechPackId(e.target.value)}
            disabled={loadingTechPacks}
          >
            {techPacks.map((tp) => (
              <option key={tp.id} value={tp.id}>
                {tp.style_code} — {tp.name}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Cost Summary Cards */}
      {activeTechPack && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-4 border border-border bg-bg-raised">
            <div className="text-xs text-fg-muted uppercase tracking-wider mb-1">Target Cost</div>
            <div className="text-xl font-mono font-bold text-fg">₹{targetCost.toFixed(2)}</div>
          </div>
          <div className="p-4 border border-border bg-bg-raised">
            <div className="text-xs text-fg-muted uppercase tracking-wider mb-1">Computed BOM Cost</div>
            <div className="text-xl font-mono font-bold text-fg">₹{totalComputedCost.toFixed(2)}</div>
          </div>
          <div className="p-4 border border-border bg-bg-raised">
            <div className="text-xs text-fg-muted uppercase tracking-wider mb-1">Cost Variance</div>
            <div className={`text-xl font-mono font-bold ${variance > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {variance > 0 ? `+₹${variance.toFixed(2)}` : `-₹${Math.abs(variance).toFixed(2)}`}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add BOM Item Form */}
        <div className="lg:col-span-1">
          <form onSubmit={handleAddBOM} className="flex flex-col gap-4 p-6 border border-border bg-bg-raised">
            <h2 className="text-sm font-semibold text-fg">Add Material / Trim</h2>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted">Material Name</label>
              <Input placeholder="e.g. Heavy Cotton Twill / YKK Zipper" value={materialName} onChange={(e) => setMaterialName(e.target.value)} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted">Category</label>
                <select 
                  className="h-10 px-3 rounded border border-border bg-bg text-fg text-xs"
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Fabric">Fabric</option>
                  <option value="Trim">Trim</option>
                  <option value="Hardware">Hardware</option>
                  <option value="Packaging">Packaging</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted">Unit</label>
                <select 
                  className="h-10 px-3 rounded border border-border bg-bg text-fg text-xs"
                  value={unit} 
                  onChange={(e) => setUnit(e.target.value)}
                >
                  <option value="meters">Meters</option>
                  <option value="pcs">Pieces</option>
                  <option value="kg">Kg</option>
                  <option value="rolls">Rolls</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted">Consumption</label>
                <Input type="number" step="0.001" placeholder="e.g. 1.25" value={consumption} onChange={(e) => setConsumption(e.target.value)} required />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted">Unit Cost (₹)</label>
                <Input type="number" step="0.01" placeholder="e.g. 450" value={unitCost} onChange={(e) => setUnitCost(e.target.value)} required />
              </div>
            </div>

            <Button type="submit" variant="primary" disabled={pending || !selectedTechPackId}>
              {pending ? "Adding Item..." : "Add to BOM"}
            </Button>

            {message && (
              <Text role="caption" as="p">
                {message}
              </Text>
            )}
          </form>
        </div>

        {/* BOM Items Table */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-semibold text-fg">Bill of Materials Breakdown ({bomItems.length})</h2>
          <div className="border border-border bg-bg-raised">
            <div className="grid grid-cols-5 p-3 border-b border-border bg-bg text-xs tracking-wider uppercase text-fg-muted font-medium">
              <div>Material</div>
              <div>Category</div>
              <div>Consumption</div>
              <div>Unit Cost</div>
              <div>Total</div>
            </div>
            {loadingBOM ? (
              <div className="p-6 text-xs text-fg-muted text-center font-body">Loading BOM items...</div>
            ) : bomItems.length === 0 ? (
              <div className="p-6 text-xs text-fg-muted text-center font-body">No materials added to this tech pack yet.</div>
            ) : (
              bomItems.map((item: any) => {
                const lineTotal = Number(item.consumption) * Number(item.unit_cost);
                return (
                  <div key={item.id} className="grid grid-cols-5 p-3 border-b border-border last:border-0 font-body text-xs items-center">
                    <div className="font-medium text-fg truncate pr-2">{item.material_name}</div>
                    <div className="text-fg-muted">{item.category}</div>
                    <div className="text-fg-muted">{item.consumption} {item.unit}</div>
                    <div className="text-fg-muted font-mono">₹{Number(item.unit_cost).toFixed(2)}</div>
                    <div className="text-fg font-mono font-semibold">₹{lineTotal.toFixed(2)}</div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}