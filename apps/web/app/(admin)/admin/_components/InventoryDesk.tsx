"use client";

import { useState, useEffect } from "react";
import { supabaseClient } from "../../../../lib/auth/auth-client";

interface InventoryRecord {
  id: string;
  product_id: string;
  allocated_stock: number;
  reserved_stock: number;
  sold_units: number;
  incoming_stock: number;
  products: { title: string } | null;
}

export function InventoryDesk() {
  const [stocks, setStocks] = useState<InventoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Quick edit buffers
  const [editAllocated, setEditAllocated] = useState("");
  const [editIncoming, setEditIncoming] = useState("");

  async function loadInventory() {
    setLoading(true);
    const { data } = await supabaseClient
      .from("inventory_allocations")
      .select("id, product_id, allocated_stock, reserved_stock, sold_units, incoming_stock, products(title)")
      .order("updated_at", { ascending: false });
    if (data) setStocks(data as any);
    setLoading(false);
  }

  useEffect(() => {
    loadInventory();
  }, []);

  const handleEditInit = (row: InventoryRecord) => {
    setEditingId(row.id);
    setEditAllocated(row.allocated_stock.toString());
    setEditIncoming(row.incoming_stock.toString());
  };

  const handleSaveOverride = async (id: string) => {
    const { error } = await supabaseClient
      .from("inventory_allocations")
      .update({
        allocated_stock: parseInt(editAllocated) || 0,
        incoming_stock: parseInt(editIncoming) || 0,
        updated_at: new Date().toISOString()
      })
      .eq("id", id);

    if (!error) {
      setEditingId(null);
      loadInventory();
    }
  };

  if (loading) {
    return <div className="font-mono text-xs text-fg-muted tracking-widest py-12 text-center">SYNCHRONIZING INVENTORY ALLOCATIONS...</div>;
  }

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden font-sans text-fg">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-theme pb-4 gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-accent-strong block">
            Logistical Engine Index
          </span>
          <h3 className="text-lg sm:text-xl font-light uppercase tracking-wider text-fg">
            Inventory Allocation Desk ({stocks.length})
          </h3>
        </div>
        <button 
          onClick={loadInventory} 
          className="font-mono text-xs text-fg-muted hover:text-fg uppercase tracking-wider bg-bg border border-theme px-4 py-2 rounded-none transition-colors cursor-pointer w-full sm:w-auto text-center"
        >
          Refresh Inventory
        </button>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block border border-theme bg-bg rounded-none overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-theme bg-bg-raised font-mono text-[10px] text-fg-muted uppercase tracking-[0.2em]">
                <th className="p-4 font-normal">Garment Identity</th>
                <th className="p-4 font-normal">Available Allocation</th>
                <th className="p-4 font-normal">Active Holds (Reserved)</th>
                <th className="p-4 font-normal">Pieces Sold</th>
                <th className="p-4 font-normal">Incoming Stock</th>
                <th className="p-4 font-normal text-right">Adjustments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme font-mono text-xs">
              {stocks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-fg-muted tracking-widest uppercase">
                    No stock allocations detected in logistical engine index
                  </td>
                </tr>
              ) : (
                stocks.map((row) => {
                  const totalPieces = row.allocated_stock + row.reserved_stock + row.sold_units;
                  const isEditing = editingId === row.id;

                  return (
                    <tr key={row.id} className="hover:bg-bg-raised/50 transition-colors font-sans">
                      <td className="p-4 font-medium uppercase text-fg tracking-wide font-sans">
                        {row.products?.title || "Untagged Garment Asset"}
                        <div className="text-[10px] text-fg-muted font-normal tracking-tight normal-case mt-0.5 font-mono">Total Registered Pool: {totalPieces} Units</div>
                      </td>
                      <td className="p-4 font-mono">
                        {isEditing ? (
                          <input 
                            type="number" 
                            value={editAllocated} 
                            onChange={(e) => setEditAllocated(e.target.value)} 
                            className="w-20 bg-bg border border-theme text-fg px-2 py-1.5 focus:outline-none focus:border-fg font-mono text-xs text-center rounded-none"
                          />
                        ) : (
                          <span className={`font-semibold ${row.allocated_stock <= 5 ? "text-amber-500" : "text-fg"}`}>
                            {row.allocated_stock} Units
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-fg-muted font-mono">
                        {row.reserved_stock} Units
                      </td>
                      <td className="p-4 text-emerald-400 font-medium font-mono">
                        {row.sold_units} Units
                      </td>
                      <td className="p-4 font-mono">
                        {isEditing ? (
                          <input 
                            type="number" 
                            value={editIncoming} 
                            onChange={(e) => setEditIncoming(e.target.value)} 
                            className="w-20 bg-bg border border-theme text-fg px-2 py-1.5 focus:outline-none focus:border-fg font-mono text-xs text-center rounded-none"
                          />
                        ) : (
                          <span className="text-fg-muted">{row.incoming_stock} Units</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {isEditing ? (
                          <div className="space-x-2">
                            <button onClick={() => handleSaveOverride(row.id)} className="bg-fg text-bg px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider hover:opacity-90 cursor-pointer font-mono">
                              Save
                            </button>
                            <button onClick={() => setEditingId(null)} className="text-fg-muted hover:text-fg px-1 text-[10px] uppercase tracking-wider cursor-pointer font-mono">
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => handleEditInit(row)} className="border border-theme hover:border-fg text-fg-muted hover:text-fg px-3 py-1.5 text-[10px] uppercase tracking-wider transition-colors cursor-pointer font-mono">
                            Audit Stock
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card Stack View */}
      <div className="md:hidden space-y-4">
        {stocks.length === 0 ? (
          <div className="py-16 text-center border border-theme bg-bg-raised/30">
            <p className="font-mono text-xs text-fg-muted uppercase tracking-wider">No stock allocations detected</p>
          </div>
        ) : (
          stocks.map((row) => {
            const totalPieces = row.allocated_stock + row.reserved_stock + row.sold_units;
            const isEditing = editingId === row.id;

            return (
              <div key={row.id} className="border border-theme bg-bg-raised/40 p-4 space-y-4 font-sans">
                <div className="space-y-1">
                  <h4 className="font-medium text-sm text-fg uppercase">{row.products?.title || "Untagged Garment Asset"}</h4>
                  <p className="font-mono text-[10px] text-fg-muted">Total Registered Pool: {totalPieces} Units</p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-xs border-t border-theme/30">
                  <div>
                    <span className="text-[10px] text-fg-subtle uppercase block">Available</span>
                    {isEditing ? (
                      <input 
                        type="number" 
                        value={editAllocated} 
                        onChange={(e) => setEditAllocated(e.target.value)} 
                        className="w-full mt-1 bg-bg border border-theme text-fg px-2 py-1 text-xs rounded-none"
                      />
                    ) : (
                      <span className={row.allocated_stock <= 5 ? "text-amber-500 font-bold" : "text-fg"}>{row.allocated_stock} Units</span>
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] text-fg-subtle uppercase block">Reserved</span>
                    <span className="text-fg-muted">{row.reserved_stock} Units</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-fg-subtle uppercase block">Sold</span>
                    <span className="text-emerald-400 font-medium">{row.sold_units} Units</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-fg-subtle uppercase block">Incoming</span>
                    {isEditing ? (
                      <input 
                        type="number" 
                        value={editIncoming} 
                        onChange={(e) => setEditIncoming(e.target.value)} 
                        className="w-full mt-1 bg-bg border border-theme text-fg px-2 py-1 text-xs rounded-none"
                      />
                    ) : (
                      <span className="text-fg-muted">{row.incoming_stock} Units</span>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-theme/30 flex items-center justify-end gap-2">
                  {isEditing ? (
                    <>
                      <button onClick={() => handleSaveOverride(row.id)} className="flex-1 bg-fg text-bg py-2 text-[10px] uppercase font-bold tracking-wider font-mono cursor-pointer">
                        Save Changes
                      </button>
                      <button onClick={() => setEditingId(null)} className="px-4 py-2 border border-theme text-fg-muted hover:text-fg text-[10px] uppercase font-mono cursor-pointer">
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button onClick={() => handleEditInit(row)} className="w-full border border-theme hover:border-fg text-fg py-2 text-[10px] uppercase tracking-wider font-mono cursor-pointer">
                      Audit & Override Stock
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}