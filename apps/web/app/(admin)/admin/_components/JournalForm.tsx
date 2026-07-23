"use client";

import { useState } from "react";
import { supabaseClient } from "../../../../lib/auth/auth-client";

export function JournalForm() {
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("editorial");
  const [status, setStatus] = useState("draft");
  const [publishedAt, setPublishedAt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  
  const [processing, setProcessing] = useState(false);
  const [log, setLog] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setLog(null);

    try {
      let heroImageUrl = "";

      if (file) {
        const fileExt = file.name.split(".").pop();
        const filePath = `journal/${crypto.randomUUID()}.${fileExt}`;
        
        const { error: uploadError } = await supabaseClient.storage
          .from("product-images")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabaseClient.storage.from("product-images").getPublicUrl(filePath);
        if (data?.publicUrl) heroImageUrl = data.publicUrl;
      }

      const { error } = await supabaseClient.from("journal_stories").insert([
        {
          title,
          slug: generateSlug(title),
          excerpt,
          content,
          category,
          status,
          hero_image: heroImageUrl,
          published_at: publishedAt ? new Date(publishedAt).toISOString() : new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      setLog({ type: "success", text: "Editorial piece indexed securely into House Journal records." });
      setTitle(""); setExcerpt(""); setContent(""); setCategory("editorial"); setStatus("draft"); setPublishedAt(""); setFile(null);
    } catch (err: any) {
      setLog({ type: "error", text: err.message || "Failed to commit storytelling document." });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto text-left font-sans text-fg w-full max-w-full">
      {log && (
        <div className={`p-4 border font-mono text-xs tracking-wider ${
          log.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-amber-500/10 border-amber-500/20 text-amber-500"
        }`}>
          [{log.type.toUpperCase()}] {log.text}
        </div>
      )}

      <div className="space-y-2 group">
        <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-fg-muted">01 / Editorial Heading / Title</label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-bg border border-theme px-4 py-3.5 text-sm uppercase tracking-wider text-fg focus:outline-none focus:border-fg"
          placeholder="e.g., THE ANATOMY OF TEXTURE: HEAVY LINEN INTEGRITY"
        />
      </div>

      <div className="space-y-2 group">
        <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-fg-muted">02 / Abstract Excerpt</label>
        <input
          type="text"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          className="w-full bg-bg border border-theme px-4 py-3 text-sm text-fg-muted focus:outline-none focus:border-fg"
          placeholder="A brief opening summary detailing the conceptual scope of this narrative drop..."
        />
      </div>

      <div className="space-y-2 group">
        <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-fg-muted">03 / Body Text Log / Story Content</label>
        <textarea
          rows={10}
          required
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full bg-bg border border-theme p-4 text-sm text-fg focus:outline-none focus:border-fg resize-none leading-relaxed font-sans"
          placeholder="Write down full length lookbook analysis, brand documentation data logs, or design journals here..."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <div className="space-y-2">
          <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-fg-muted">04 / Content Archetype</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-bg border border-theme p-[14px] text-xs font-mono text-fg focus:outline-none focus:border-fg uppercase tracking-wider cursor-pointer"
          >
            <option value="editorial">Editorial Look</option>
            <option value="campaign">Brand Campaign</option>
            <option value="lookbook">Visual Lookbook</option>
            <option value="story">Craft History</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-fg-muted">05 / Release State</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full bg-bg border border-theme p-[14px] text-xs font-mono text-fg focus:outline-none focus:border-fg uppercase tracking-wider cursor-pointer"
          >
            <option value="draft">Draft (Private)</option>
            <option value="published">Publish Now</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-fg-muted">06 / Timed Entry Stamp</label>
          <input
            type="datetime-local"
            value={publishedAt}
            onChange={(e) => setPublishedAt(e.target.value)}
            className="w-full bg-bg border border-theme p-3 text-xs font-mono text-fg focus:outline-none focus:border-fg"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-fg-muted">07 / Hero Campaign Photo</label>
          <div className="relative border border-theme bg-bg p-3 text-center cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <span className="text-xs text-fg-muted font-mono block truncate">
              {file ? file.name.toUpperCase() : "SELECT IMAGE"}
            </span>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={processing}
        className="w-full bg-fg text-bg py-4 text-xs font-mono uppercase tracking-[0.25em] transition-colors hover:opacity-90 disabled:opacity-40 cursor-pointer"
      >
        {processing ? "ENGAGING CMS TRANSMISSION..." : "COMMIT NARRATIVE TO VALENOR JOURNAL"}
      </button>
    </form>
  );
}