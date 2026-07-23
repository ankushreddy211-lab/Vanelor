"use client";

import { useState, useEffect } from "react";
import { supabaseClient } from "../../../../lib/auth/auth-client";

export function CollectionForm() {
  const [chapters, setChapters] = useState<{ id: string; title: string }[]>([]);
  const [selectedChapter, setSelectedChapter] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isHidden, setIsHidden] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [log, setLog] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fetch available parent chapters dynamically for mapping allocations
  useEffect(() => {
    async function loadChapters() {
      const { data } = await supabaseClient
        .from("chapters")
        .select("id, title")
        .order("created_at", { ascending: false });
      if (data) setChapters(data);
    }
    loadChapters();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setLog(null);

    try {
      const { error } = await supabaseClient.from("collections").insert([
        {
          title,
          description,
          chapter_id: selectedChapter || null,
          is_hidden: isHidden,
        },
      ]);

      if (error) throw error;

      setLog({ type: "success", text: "Design collection capsule linked safely to target chapter volume." });
      setTitle("");
      setDescription("");
      setSelectedChapter("");
      setIsHidden(false);
    } catch (err: any) {
      setLog({ type: "error", text: err.message || "Failed to commit collection allocation structural rows." });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto text-left font-sans text-fg w-full max-w-full">
      {log && (
        <div className={`p-4 border font-mono text-xs tracking-wider ${
          log.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-amber-500/10 border-amber-500/20 text-amber-500"
        }`}>
          [{log.type.toUpperCase()}] {log.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Parent Chapter Mapping Selector */}
        <div className="space-y-2">
          <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-fg-muted">01 / Parent Chapter Assignment</label>
          <select
            value={selectedChapter}
            onChange={(e) => setSelectedChapter(e.target.value)}
            className="w-full bg-bg border border-theme p-[14px] text-xs font-mono text-fg focus:outline-none focus:border-fg cursor-pointer uppercase tracking-wider"
          >
            <option value="">STANDALONE CAPSULE (NO CHAPTER)</option>
            {chapters.map((ch) => (
              <option key={ch.id} value={ch.id}>{ch.title.toUpperCase()}</option>
            ))}
          </select>
        </div>

        {/* Collection Title */}
        <div className="space-y-2">
          <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-fg-muted">02 / Collection Capsule Name</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-bg border border-theme px-4 py-3.5 text-sm uppercase tracking-wider text-fg focus:outline-none focus:border-fg"
            placeholder="e.g., OVERSHIRTS or LINEN ENSEMBLES"
          />
        </div>
      </div>

      <div className="space-y-2 group">
        <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-fg-muted">03 / Capsule Concept / Description</label>
        <textarea
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-bg border border-theme p-4 text-sm text-fg focus:outline-none focus:border-fg resize-none leading-relaxed"
          placeholder="Define the textural parameters, silhouettes, and targeted garment utility groupings for this design structure..."
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <input
          type="checkbox"
          id="isHidden"
          checked={isHidden}
          onChange={(e) => setIsHidden(e.target.checked)}
          className="accent-fg h-4 w-4 bg-bg border-theme rounded-none cursor-pointer"
        />
        <label htmlFor="isHidden" className="text-xs font-mono uppercase tracking-wider text-fg-muted cursor-pointer select-none">
          Keep collection private / hide from storefront navigation nodes
        </label>
      </div>

      <button
        type="submit"
        disabled={processing}
        className="w-full bg-fg text-bg py-4 text-xs font-mono uppercase tracking-[0.25em] transition-colors hover:opacity-90 disabled:opacity-40 cursor-pointer"
      >
        {processing ? "LINKING CAPSULE NODES..." : "GENERATE DESIGN CAPSULE IN INDEX"}
      </button>
    </form>
  );
}