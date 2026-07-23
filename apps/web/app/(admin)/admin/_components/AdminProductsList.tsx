"use client";

import { useState, useEffect } from "react";
import { supabaseClient } from "@/lib/auth/auth-client";
import { EditProductModal } from "./EditProductModal";
import Image from "next/image";

interface Product {
  id: string;
  title: string;
  price: number;
  member_price?: number;
  collection_id?: string;
  images: string[];
  craft_notes?: string;
  material?: string;
  construction?: string;
  details?: string;
  weight_g?: number;
  fit_profile?: string;
  care_guide?: string;
  currency?: string;
}

export function AdminProductsList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const [prodRes, colRes] = await Promise.all([
      supabaseClient.from("products").select("*").order("created_at", { ascending: false }),
      supabaseClient.from("collections").select("id, title")
    ]);

    if (prodRes.data) setProducts(prodRes.data);
    if (colRes.data) setCollections(colRes.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this garment record?")) return;
    const { error } = await supabaseClient.from("products").delete().eq("id", id);
    if (error) {
      alert(`Error deleting: ${error.message}`);
    } else {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center font-mono text-xs text-fg-muted uppercase tracking-widest">
        Loading catalog archive records...
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left font-sans text-fg w-full max-w-full overflow-x-hidden">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-theme pb-4 gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-accent-strong block">
            Inventory Ledger
          </span>
          <h3 className="text-lg sm:text-xl font-light uppercase tracking-wider text-fg">
            Catalog Archive Management ({products.length})
          </h3>
        </div>
        <button 
          onClick={fetchData} 
          className="font-mono text-xs text-fg-muted hover:text-fg uppercase tracking-wider bg-bg border border-theme px-4 py-2 rounded-none transition-colors cursor-pointer w-full sm:w-auto text-center"
        >
          Refresh List
        </button>
      </div>

      {products.length === 0 ? (
        <div className="py-16 text-center border border-theme bg-bg-raised/30">
          <p className="font-mono text-xs text-fg-muted uppercase tracking-wider">No products found in the database.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View (Hidden on Mobile) */}
          <div className="hidden md:block border border-theme bg-bg rounded-none overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-theme bg-bg-raised font-mono text-[10px] text-fg-muted uppercase tracking-wider">
                    <th className="p-4">Piece</th>
                    <th className="p-4">Title</th>
                    <th className="p-4">Retail Price</th>
                    <th className="p-4">Member Price</th>
                    <th className="p-4">Fit Profile</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme text-sm">
                  {products.map((product) => {
                    const imageList = Array.isArray(product.images) ? product.images : [];
                    const thumb = imageList.find((img: string) => !img.endsWith('.mp4')) || imageList[0];
                    const currencySymbol = product.currency === 'NPR' ? 'Rs. ' : product.currency === 'INR' || !product.currency ? '₹' : '$';

                    return (
                      <tr key={product.id} className="hover:bg-bg-raised/50 transition-colors">
                        <td className="p-4 w-16">
                          <div className="relative w-10 h-12 bg-bg-subtle rounded-none overflow-hidden flex items-center justify-center border border-theme">
                            {thumb ? (
                              <Image src={thumb} alt={product.title} fill className="object-cover" />
                            ) : (
                              <span className="text-[9px] text-fg-muted font-mono">N/A</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 font-medium text-fg">{product.title}</td>
                        <td className="p-4 font-mono text-xs text-fg">
                          {product.price ? `${currencySymbol}${product.price.toLocaleString()}` : "—"}
                        </td>
                        <td className="p-4 font-mono text-xs text-accent-strong">
                          {product.member_price ? `${currencySymbol}${product.member_price.toLocaleString()}` : <span className="text-fg-subtle">Not set</span>}
                        </td>
                        <td className="p-4 font-mono text-xs text-fg-muted">{product.fit_profile || "—"}</td>
                        <td className="p-4 text-right space-x-3 whitespace-nowrap">
                          <button
                            onClick={() => setEditingProduct(product)}
                            className="font-mono text-xs text-fg hover:underline uppercase tracking-wider bg-bg-subtle border border-theme px-3 py-1.5 rounded-none cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="font-mono text-xs text-red-400 hover:underline uppercase tracking-wider bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-none cursor-pointer"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card Stack View (Visible on Mobile only) */}
          <div className="md:hidden space-y-4">
            {products.map((product) => {
              const imageList = Array.isArray(product.images) ? product.images : [];
              const thumb = imageList.find((img: string) => !img.endsWith('.mp4')) || imageList[0];
              const currencySymbol = product.currency === 'NPR' ? 'Rs. ' : product.currency === 'INR' || !product.currency ? '₹' : '$';

              return (
                <div key={product.id} className="border border-theme bg-bg-raised/40 p-4 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="relative w-14 h-16 bg-bg-subtle overflow-hidden flex-shrink-0 border border-theme">
                      {thumb ? (
                        <Image src={thumb} alt={product.title} fill className="object-cover" />
                      ) : (
                        <span className="text-[9px] text-fg-muted font-mono flex items-center justify-center h-full">N/A</span>
                      )}
                    </div>
                    <div className="space-y-1 flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-fg truncate">{product.title}</h4>
                      <p className="font-mono text-xs text-fg-muted">Fit: {product.fit_profile || "Standard"}</p>
                      <div className="flex items-center gap-4 pt-1 font-mono text-xs">
                        <div>
                          <span className="text-fg-subtle text-[10px] block uppercase">Retail</span>
                          <span className="text-fg">{product.price ? `${currencySymbol}${product.price.toLocaleString()}` : "—"}</span>
                        </div>
                        <div>
                          <span className="text-fg-subtle text-[10px] block uppercase">Member</span>
                          <span className="text-accent-strong">{product.member_price ? `${currencySymbol}${product.member_price.toLocaleString()}` : "—"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-theme/30">
                    <button
                      onClick={() => setEditingProduct(product)}
                      className="flex-1 font-mono text-xs text-center py-2 bg-bg border border-theme text-fg uppercase tracking-wider active:bg-bg-raised"
                    >
                      Edit Record
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="flex-1 font-mono text-xs text-center py-2 bg-red-500/10 border border-red-500/20 text-red-400 uppercase tracking-wider active:bg-red-500/20"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Edit Modal Component Render */}
      {editingProduct && (
        <EditProductModal 
          product={editingProduct} 
          collections={collections} 
          onClose={() => setEditingProduct(null)} 
          onUpdated={fetchData} 
        />
      )}
    </div>
  );
}