"use client";

import { useState, useEffect, useTransition, type FormEvent } from "react";
import { Input, Button, Text } from "@valenor/design-system";
import { listQCInspections, createQCInspection } from "@/features/qc/server/actions";

export default function QualityCheckPage() {
  const [inspections, setInspections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [pending, startTransition] = useTransition();
  const [batchCode, setBatchCode] = useState("");
  const [styleCode, setStyleCode] = useState("");
  const [inspectorName, setInspectorName] = useState("");
  const [totalInspected, setTotalInspected] = useState("");
  const [passedUnits, setPassedUnits] = useState("");
  const [failedUnits, setFailedUnits] = useState("");
  const [defectCategory, setDefectCategory] = useState("None");
  const [status, setStatus] = useState("Passed");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const fetchInspectionsList = async () => {
    try {
      const data = await listQCInspections();
      setInspections(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspectionsList();
  }, []);

  function handleCreate(e: FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        await createQCInspection({
          batchCode,
          styleCode,
          inspectorName,
          totalInspected: Number(totalInspected),
          passedUnits: Number(passedUnits),
          failedUnits: Number(failedUnits),
          defectCategory,
          status,
          notes: notes || undefined,
        });
        setMessage(`Successfully recorded QC for batch "${batchCode}"`);
        setBatchCode("");
        setStyleCode("");
        setInspectorName("");
        setTotalInspected("");
        setPassedUnits("");
        setFailedUnits("");
        setDefectCategory("None");
        setStatus("Passed");
        setNotes("");
        fetchInspectionsList();
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "Failed to record QC inspection.");
      }
    });
  }

  return (
    <div>
      <header className="mb-8 border-b border-border pb-4">
        <h1 className="font-display text-2xl mb-1 text-fg">Quality Check (QC) Workbench</h1>
        <p className="font-body text-sm text-fg-muted">Log received factory stock audits, pass/fail inspection criteria, and defect tracking.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Inspection Form */}
        <div className="lg:col-span-1">
          <form onSubmit={handleCreate} className="flex flex-col gap-4 p-6 border border-border bg-bg-raised">
            <h2 className="text-sm font-semibold text-fg">Log Inspection Audit</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted">Batch Code</label>
                <Input placeholder="e.g. BAT-01" value={batchCode} onChange={(e) => setBatchCode(e.target.value)} required />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted">Style Code</label>
                <Input placeholder="e.g. VN-SS26-01" value={styleCode} onChange={(e) => setStyleCode(e.target.value)} required />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted">Inspector Name</label>
              <Input placeholder="e.g. Amit Sharma" value={inspectorName} onChange={(e) => setInspectorName(e.target.value)} required />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted">Total Checked</label>
                <Input type="number" placeholder="100" value={totalInspected} onChange={(e) => setTotalInspected(e.target.value)} required />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted">Passed</label>
                <Input type="number" placeholder="95" value={passedUnits} onChange={(e) => setPassedUnits(e.target.value)} required />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted">Failed</label>
                <Input type="number" placeholder="5" value={failedUnits} onChange={(e) => setFailedUnits(e.target.value)} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted">Primary Defect Category</label>
                <select 
                  className="h-10 px-3 rounded border border-border bg-bg text-fg text-xs"
                  value={defectCategory} 
                  onChange={(e) => setDefectCategory(e.target.value)}
                >
                  <option value="None">None</option>
                  <option value="Fabric Flaw">Fabric Flaw</option>
                  <option value="Stitching Error">Stitching Error</option>
                  <option value="Sizing Deviation">Sizing Deviation</option>
                  <option value="Hardware Failure">Hardware Failure</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted">Audit Status</label>
                <select 
                  className="h-10 px-3 rounded border border-border bg-bg text-fg text-xs"
                  value={status} 
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="Passed">Passed</option>
                  <option value="Conditional Pass">Conditional Pass</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted">Inspector Notes (Optional)</label>
              <Input placeholder="e.g. Minor thread cleanup needed on hemline." value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>

            <Button type="submit" variant="primary" disabled={pending}>
              {pending ? "Logging Audit..." : "Save Inspection Record"}
            </Button>

            {message && (
              <Text role="caption" as="p">
                {message}
              </Text>
            )}
          </form>
        </div>

        {/* Inspections Table */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-semibold text-fg">Inspection History ({inspections.length})</h2>
          <div className="border border-border bg-bg-raised overflow-x-auto">
            <div className="grid grid-cols-5 p-3 border-b border-border bg-bg text-xs tracking-wider uppercase text-fg-muted font-medium min-w-[600px]">
              <div>Batch / Style</div>
              <div>Inspector</div>
              <div>Pass / Total</div>
              <div>Defect Class</div>
              <div>Status</div>
            </div>
            {loading ? (
              <div className="p-6 text-xs text-fg-muted text-center font-body">Loading QC records...</div>
            ) : inspections.length === 0 ? (
              <div className="p-6 text-xs text-fg-muted text-center font-body">No quality check records logged yet.</div>
            ) : (
              inspections.map((qc: any) => (
                <div key={qc.id} className="grid grid-cols-5 p-3 border-b border-border last:border-0 font-body text-xs items-center min-w-[600px]">
                  <div className="truncate pr-2">
                    <div className="font-medium text-fg">{qc.batch_code}</div>
                    <div className="text-fg-muted text-[10px] font-mono">{qc.style_code}</div>
                  </div>
                  <div className="text-fg-muted">{qc.inspector_name}</div>
                  <div className="text-fg font-mono">
                    <span className="text-emerald-400 font-semibold">{qc.passed_units}</span> / {qc.total_inspected} pcs
                  </div>
                  <div className="text-fg-muted truncate pr-2">{qc.defect_category}</div>
                  <div>
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-semibold ${
                      qc.status === 'Passed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      qc.status === 'Conditional Pass' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {qc.status}
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