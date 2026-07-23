"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Input, Button, Text } from "@valenor/design-system";
import { createFabric, listFabrics } from "@/features/fabrics/server/actions";
import { useEffect } from "react";

function FabricForm({ onFabricCreated }: { onFabricCreated: () => void }) {
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [supplier, setSupplier] = useState("");
  const [gsm, setGsm] = useState("");
  const [composition, setComposition] = useState("");
  const [costPerMeter, setCostPerMeter] = useState("");
  const [swatchImageUrl, setSwatchImageUrl] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      try {
        await createFabric({
          name,
          supplier,
          gsm: Number(gsm),
          composition,
          costPerMeter: Number(costPerMeter),
          swatchImageUrl: swatchImageUrl || undefined,
        });
        setMessage(`Successfully added "${name}"`);
        setName("");
        setSupplier("");
        setGsm("");
        setComposition("");
        setCostPerMeter("");
        setSwatchImageUrl("");
        onFabricCreated();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Failed to create fabric.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6 border border-border bg-bg-raised">
      <h2 className="text-sm font-semibold text-fg">Add New Fabric</h2>
      
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted">Fabric Name</label>
        <Input placeholder="e.g. Heavyweight Cotton Twill" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted">Supplier</label>
        <Input placeholder="e.g. Apex Textiles" value={supplier} onChange={(e) => setSupplier(e.target.value)} required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted">GSM</label>
          <Input type="number" placeholder="e.g. 280" value={gsm} onChange={(e) => setGsm(e.target.value)} required />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted">Cost per Meter (₹)</label>
          <Input type="number" step="0.01" placeholder="e.g. 450" value={costPerMeter} onChange={(e) => setCostPerMeter(e.target.value)} required />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted">Composition</label>
        <Input placeholder="e.g. 100% Cotton" value={composition} onChange={(e) => setComposition(e.target.value)} required />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted">Swatch Image URL (Optional)</label>
        <Input placeholder="https://..." value={swatchImageUrl} onChange={(e) => setSwatchImageUrl(e.target.value)} />
      </div>

      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? "Adding Fabric..." : "Save Fabric"}
      </Button>

      {message && (
        <Text role="caption" as="p">
          {message}
        </Text>
      )}
    </form>
  );
}

export default function FabricsAdminPage() {
  const [fabrics, setFabrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFabricsList = async () => {
    try {
      const data = await listFabrics();
      setFabrics(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFabricsList();
  }, []);

  return (
    <div>
      <header className="mb-8 border-b border-border pb-4">
        <h1 className="font-display text-2xl mb-1 text-fg">Fabric Library</h1>
        <p className="font-body text-sm text-fg-muted">Manage raw materials, GSM, composition, and costings.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <FabricForm onFabricCreated={fetchFabricsList} />
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-semibold text-fg">Existing Fabrics ({fabrics.length})</h2>
          <div className="border border-border bg-bg-raised">
            <div className="grid grid-cols-4 p-3 border-b border-border bg-bg text-xs tracking-wider uppercase text-fg-muted font-medium">
              <div>Name</div>
              <div>Supplier</div>
              <div>GSM</div>
              <div>Cost / Meter</div>
            </div>
            {loading ? (
              <div className="p-6 text-xs text-fg-muted text-center font-body">Loading fabrics...</div>
            ) : fabrics.length === 0 ? (
              <div className="p-6 text-xs text-fg-muted text-center font-body">No fabrics recorded yet.</div>
            ) : (
              fabrics.map((fabric: any) => (
                <div key={fabric.id} className="grid grid-cols-4 p-3 border-b border-border last:border-0 font-body text-xs items-center">
                  <div className="font-medium text-fg truncate pr-2">{fabric.name}</div>
                  <div className="text-fg-muted truncate pr-2">{fabric.supplier}</div>
                  <div className="text-fg-muted">{fabric.gsm} GSM</div>
                  <div className="text-fg font-mono">₹{fabric.cost_per_meter ?? fabric.costPerMeter}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}