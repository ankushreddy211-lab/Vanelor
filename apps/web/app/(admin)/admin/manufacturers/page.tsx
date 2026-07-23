"use client";

import { useState, useEffect, useTransition, type FormEvent } from "react";
import { Input, Button, Text } from "@valenor/design-system";
import { listManufacturers, createManufacturer } from "@/features/manufacturers/server/actions";

export default function ManufacturersPage() {
  const [manufacturers, setManufacturers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [specialization, setSpecialization] = useState("Woven & Denim");
  const [leadTimeDays, setLeadTimeDays] = useState("");
  const [moq, setMoq] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("Active");
  const [message, setMessage] = useState<string | null>(null);

  const fetchManufacturersList = async () => {
    try {
      const data = await listManufacturers();
      setManufacturers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManufacturersList();
  }, []);

  function handleCreate(e: FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        await createManufacturer({
          name,
          code,
          specialization,
          leadTimeDays: Number(leadTimeDays),
          moq: Number(moq),
          contactPerson,
          email,
          phone,
          status,
        });
        setMessage(`Successfully registered "${name}"`);
        setName("");
        setCode("");
        setLeadTimeDays("");
        setMoq("");
        setContactPerson("");
        setEmail("");
        setPhone("");
        setStatus("Active");
        fetchManufacturersList();
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "Failed to register manufacturer.");
      }
    });
  }

  return (
    <div>
      <header className="mb-8 border-b border-border pb-4">
        <h1 className="font-display text-2xl mb-1 text-fg">Manufacturers & Partner Directory</h1>
        <p className="font-body text-sm text-fg-muted">Manage factory partners, production lead times, minimum order quantities, and contacts.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Registration Form */}
        <div className="lg:col-span-1">
          <form onSubmit={handleCreate} className="flex flex-col gap-4 p-6 border border-border bg-bg-raised">
            <h2 className="text-sm font-semibold text-fg">Add Factory Partner</h2>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted">Factory Name</label>
              <Input placeholder="e.g. Apex Garment Exports" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted">Factory Code</label>
                <Input placeholder="e.g. FAC-APX" value={code} onChange={(e) => setCode(e.target.value)} required />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted">Specialization</label>
                <select 
                  className="h-10 px-3 rounded border border-border bg-bg text-fg text-xs"
                  value={specialization} 
                  onChange={(e) => setSpecialization(e.target.value)}
                >
                  <option value="Woven & Denim">Woven & Denim</option>
                  <option value="Knitwear">Knitwear</option>
                  <option value="Outerwear">Outerwear</option>
                  <option value="Activewear">Activewear</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted">Lead Time (Days)</label>
                <Input type="number" placeholder="e.g. 45" value={leadTimeDays} onChange={(e) => setLeadTimeDays(e.target.value)} required />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted">MOQ (Units)</label>
                <Input type="number" placeholder="e.g. 500" value={moq} onChange={(e) => setMoq(e.target.value)} required />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted">Contact Person</label>
              <Input placeholder="e.g. Rajesh Kumar" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted">Email</label>
                <Input type="email" placeholder="rajesh@apex.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted">Phone</label>
                <Input placeholder="+91 98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted">Status</label>
              <select 
                className="h-10 px-3 rounded border border-border bg-bg text-fg text-xs"
                value={status} 
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Active">Active</option>
                <option value="Onboarding">Onboarding</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <Button type="submit" variant="primary" disabled={pending}>
              {pending ? "Registering..." : "Save Manufacturer"}
            </Button>

            {message && (
              <Text role="caption" as="p">
                {message}
              </Text>
            )}
          </form>
        </div>

        {/* Manufacturers Table */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-semibold text-fg">Active Partners ({manufacturers.length})</h2>
          <div className="border border-border bg-bg-raised overflow-x-auto">
            <div className="grid grid-cols-5 p-3 border-b border-border bg-bg text-xs tracking-wider uppercase text-fg-muted font-medium min-w-[600px]">
              <div>Partner / Code</div>
              <div>Specialization</div>
              <div>Lead Time / MOQ</div>
              <div>Contact</div>
              <div>Status</div>
            </div>
            {loading ? (
              <div className="p-6 text-xs text-fg-muted text-center font-body">Loading manufacturers...</div>
            ) : manufacturers.length === 0 ? (
              <div className="p-6 text-xs text-fg-muted text-center font-body">No manufacturer partners registered yet.</div>
            ) : (
              manufacturers.map((m: any) => (
                <div key={m.id} className="grid grid-cols-5 p-3 border-b border-border last:border-0 font-body text-xs items-center min-w-[600px]">
                  <div className="truncate pr-2">
                    <div className="font-medium text-fg">{m.name}</div>
                    <div className="text-fg-muted text-[10px] font-mono">{m.code}</div>
                  </div>
                  <div className="text-fg-muted">{m.specialization}</div>
                  <div className="text-fg-muted">
                    <div>{m.lead_time_days} Days</div>
                    <div className="text-[10px]">MOQ: {m.moq} pcs</div>
                  </div>
                  <div className="text-fg-muted truncate pr-2">
                    <div className="text-fg">{m.contact_person}</div>
                    <div className="text-[10px]">{m.email}</div>
                  </div>
                  <div>
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-semibold ${
                      m.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      m.status === 'Onboarding' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                    }`}>
                      {m.status}
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