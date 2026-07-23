"use client";

import { useState } from "react";
import { supabaseClient } from "../../../../lib/auth/auth-client";

export function ChapterForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [status, setStatus] = useState("draft");
  const [countdownActive, setCountdownActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [log, setLog] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setLog(null);

    try {
      let heroImageUrl = "";

      if (file) {
        const fileExt = file.name.split(".").pop();
        const filePath = `chapters/${crypto.randomUUID()}.${fileExt}`;
        
        const { error: uploadError } = await supabaseClient.storage
          .from("product-images")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabaseClient.storage.from("product-images").getPublicUrl(filePath);
        if (data?.publicUrl) heroImageUrl = data.publicUrl;
      }

      const { error: dbError } = await supabaseClient.from("chapters").insert([
        {
          title,
          description,
          release_date: releaseDate ? new Date(releaseDate).toISOString() : null,
          status,
          countdown_active: countdownActive,
          hero_image: heroImageUrl,
        },
      ]);

      if (dbError) throw dbError;

      setLog({ type: "success", text: "Chapter successfully cataloged into Valenor index." });
      setTitle("");
      setDescription("");
      setReleaseDate("");
      setStatus("draft");
      setCountdownActive(false);
      setFile(null);
    } catch (err: any) {
      setLog({ type: "error", text: err.message || "Failed to commit chapter profile." });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handlePublish} className="space-y-6 max-w-3xl mx-auto text-left font-sans text-fg w-full max-w-full">
      {log && (
        <div className={`p-4 border font-mono text-xs tracking-wider ${
          log.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-amber-500/10 border-amber-500/20 text-amber-500"
        }`}>
          [{log.type.toUpperCase()}] {log.text}
        </div>
      )}

      <div className="space-y-2 group">
        <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-fg-muted">01 / Volume Title</label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-bg border border-theme px-4 py-3.5 text-sm uppercase tracking-wider text-fg focus:outline-none focus:border-fg"
          placeholder="e.g., CHAPTER IV / ALTERED SILHOUETTES"
        />
      </div>

      <div className="space-y-2 group">
        <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-fg-muted">02 / Editorial Narrative</label>
        <textarea
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-bg border border-theme p-4 text-sm text-fg focus:outline-none focus:border-fg resize-none leading-relaxed"
          placeholder="Craft the thematic concepts, inspiration parameters, and artistic direction behind this volume..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-fg-muted">03 / Launch Timeline</label>
          <input
            type="datetime-local"
            value={releaseDate}
            onChange={(e) => setReleaseDate(e.target.value)}
            className="w-full bg-bg border border-theme p-3 text-xs font-mono text-fg focus:outline-none focus:border-fg"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-fg-muted">04 / Lifecycle Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full bg-bg border border-theme p-[14px] text-xs font-mono text-fg focus:outline-none focus:border-fg cursor-pointer uppercase tracking-wider"
          >
            <option value="draft">Draft (Private)</option>
            <option value="scheduled">Scheduled</option>
            <option value="live">Live (Public Drop)</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-fg-muted">05 / Hero Drop Asset</label>
          <div className="relative border border-theme bg-bg p-3 text-center">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <span className="text-xs text-fg-muted font-mono block truncate">
              {file ? file.name.toUpperCase() : "UPLOAD GRAPHIC IMAGE"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <input
          type="checkbox"
          id="countdown"
          checked={countdownActive}
          onChange={(e) => setCountdownActive(e.target.checked)}
          className="accent-fg h-4 w-4 bg-bg border-theme rounded-none cursor-pointer"
        />
        <label htmlFor="countdown" className="text-xs font-mono uppercase tracking-wider text-fg-muted cursor-pointer select-none">
          Deploy live countdown clock interface context across storefront
        </label>
      </div>

      <button
        type="submit"
        disabled={processing}
        className="w-full bg-fg text-bg py-4 text-xs font-mono uppercase tracking-[0.25em] transition-colors hover:opacity-90 disabled:opacity-40 cursor-pointer"
      >
        {processing ? "COMMITTING VOLUME ASSETS..." : "INITIALIZE BRAND CHAPTER VOLUME"}
      </button>
    </form>
  );
}