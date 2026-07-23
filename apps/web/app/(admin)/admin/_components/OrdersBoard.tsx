"use client";

import { useState, useEffect } from "react";
import { supabaseClient } from "../../../../lib/auth/auth-client";

interface OrderRecord {
  id: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  currency: string;
  status: string;
  tracking_number: string | null;
  created_at: string;
}

export function OrdersBoard() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadOrders() {
    setLoading(true);
    const { data } = await supabaseClient
      .from("orders")
      .select("id, customer_name, customer_email, total_amount, currency, status, tracking_number, created_at")
      .order("created_at", { ascending: false });
    if (data) setOrders(data as any);
    setLoading(false);
  }

  useEffect(() => {
    loadOrders();
  }, []);

  const changeStatus = async (id: string, nextStatus: string) => {
    const { error } = await supabaseClient
      .from("orders")
      .update({ status: nextStatus })
      .eq("id", id);
    if (!error) loadOrders();
  };

  const addTracking = async (id: string) => {
    const tracking = prompt("ENTER CARRIER TRACKING ID SPECIFICATION:");
    if (!tracking) return;
    const { error } = await supabaseClient
      .from("orders")
      .update({ tracking_number: tracking, status: "shipped" })
      .eq("id", id);
    if (!error) loadOrders();
  };

  if (loading) {
    return <div className="font-mono text-xs text-fg-muted tracking-widest py-12 text-center">LOADING HOUSE SETTLEMENT LEDGERS...</div>;
  }

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden font-sans text-fg">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-theme pb-4 gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-accent-strong block">
            House Settlements
          </span>
          <h3 className="text-lg sm:text-xl font-light uppercase tracking-wider text-fg">
            Orders Board ({orders.length})
          </h3>
        </div>
        <button 
          onClick={loadOrders} 
          className="font-mono text-xs text-fg-muted hover:text-fg uppercase tracking-wider bg-bg border border-theme px-4 py-2 rounded-none transition-colors cursor-pointer w-full sm:w-auto text-center"
        >
          Refresh Orders
        </button>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block border border-theme bg-bg rounded-none overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-theme bg-bg-raised font-mono text-[10px] text-fg-muted uppercase tracking-[0.2em]">
                <th className="p-4 font-normal">Order Identity / Date</th>
                <th className="p-4 font-normal">Patron Profile</th>
                <th className="p-4 font-normal">Settlement Value</th>
                <th className="p-4 font-normal">Fulfillment State</th>
                <th className="p-4 font-normal text-right">Fulfillment Adjustments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme font-mono text-xs">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-fg-muted tracking-widest uppercase">
                    No settled orders registered in the active system trunk
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-bg-raised/50 transition-colors font-sans">
                    <td className="p-4 font-mono">
                      <div className="text-fg-muted text-[10px] truncate max-w-[140px]">{order.id.toUpperCase()}</div>
                      <div className="text-[9px] text-fg-subtle mt-1">{new Date(order.created_at).toLocaleDateString()}</div>
                    </td>
                    <td className="p-4 font-sans">
                      <div className="text-fg uppercase font-medium">{order.customer_name || "House Guest"}</div>
                      <div className="text-[10px] text-fg-muted mt-0.5 font-mono">{order.customer_email}</div>
                    </td>
                    <td className="p-4 font-mono text-fg font-medium">
                      {order.currency || "₹"} {Number(order.total_amount).toLocaleString()}
                    </td>
                    <td className="p-4 font-mono">
                      <span className={`px-2 py-0.5 text-[10px] uppercase border rounded-none ${
                        order.status === "delivered" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
                        order.status === "shipped" ? "bg-blue-500/10 border-blue-500/30 text-blue-400" :
                        order.status === "confirmed" ? "bg-accent-strong/10 border-accent-strong/30 text-accent-strong" :
                        order.status === "pending" ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                        "bg-bg-raised border-theme text-fg-muted"
                      }`}>
                        {order.status}
                      </span>
                      {order.tracking_number && (
                        <div className="text-[9px] text-fg-muted mt-1 block tracking-tight">TRK: {order.tracking_number}</div>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2 whitespace-nowrap">
                      {order.status === "pending" && (
                        <button onClick={() => changeStatus(order.id, "confirmed")} className="bg-fg text-bg px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider hover:opacity-90 font-mono cursor-pointer">
                          Confirm
                        </button>
                      )}
                      {order.status === "confirmed" && (
                        <button onClick={() => changeStatus(order.id, "packed")} className="border border-theme hover:border-fg text-fg px-3 py-1.5 text-[10px] uppercase tracking-wider font-mono cursor-pointer">
                          Pack Item
                        </button>
                      )}
                      {order.status === "packed" && (
                        <button onClick={() => addTracking(order.id)} className="border border-theme hover:border-fg text-blue-400 px-3 py-1.5 text-[10px] uppercase tracking-wider font-mono cursor-pointer">
                          Dispatch (Ship)
                        </button>
                      )}
                      {order.status === "shipped" && (
                        <button onClick={() => changeStatus(order.id, "delivered")} className="bg-emerald-600 text-white px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider hover:bg-emerald-500 font-mono cursor-pointer">
                          Mark Delivered
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card Stack View */}
      <div className="md:hidden space-y-4">
        {orders.length === 0 ? (
          <div className="py-16 text-center border border-theme bg-bg-raised/30">
            <p className="font-mono text-xs text-fg-muted uppercase tracking-wider">No settled orders registered</p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="border border-theme bg-bg-raised/40 p-4 space-y-4 font-sans">
              <div className="flex justify-between items-start">
                <div className="space-y-0.5">
                  <h4 className="font-medium text-sm text-fg uppercase">{order.customer_name || "House Guest"}</h4>
                  <p className="font-mono text-[10px] text-fg-muted">{order.customer_email}</p>
                </div>
                <span className={`px-2 py-0.5 text-[9px] uppercase border font-mono ${
                  order.status === "delivered" ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" :
                  order.status === "shipped" ? "bg-blue-500/15 border-blue-500/30 text-blue-400" :
                  "bg-amber-500/15 border-amber-500/20 text-amber-400"
                }`}>
                  {order.status}
                </span>
              </div>

              <div className="flex justify-between items-center font-mono text-xs pt-2 border-t border-theme/30">
                <div>
                  <span className="text-[10px] text-fg-subtle uppercase block">Settlement</span>
                  <span className="text-fg font-bold">{order.currency || "₹"} {Number(order.total_amount).toLocaleString()}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-fg-subtle uppercase block">Date</span>
                  <span className="text-fg-muted">{new Date(order.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {order.tracking_number && (
                <div className="text-[10px] font-mono text-fg-muted bg-bg p-2 border border-theme/30">
                  Tracking ID: {order.tracking_number}
                </div>
              )}

              <div className="pt-2 border-t border-theme/30 flex items-center justify-end gap-2">
                {order.status === "pending" && (
                  <button onClick={() => changeStatus(order.id, "confirmed")} className="w-full bg-fg text-bg py-2 text-[10px] uppercase font-bold tracking-wider font-mono cursor-pointer">
                    Confirm Order
                  </button>
                )}
                {order.status === "confirmed" && (
                  <button onClick={() => changeStatus(order.id, "packed")} className="w-full border border-theme text-fg py-2 text-[10px] uppercase font-mono cursor-pointer">
                    Pack Item
                  </button>
                )}
                {order.status === "packed" && (
                  <button onClick={() => addTracking(order.id)} className="w-full border border-theme text-blue-400 py-2 text-[10px] uppercase font-mono cursor-pointer">
                    Dispatch (Ship)
                  </button>
                )}
                {order.status === "shipped" && (
                  <button onClick={() => changeStatus(order.id, "delivered")} className="w-full bg-emerald-600 text-white py-2 text-[10px] uppercase font-bold font-mono cursor-pointer">
                    Mark Delivered
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}