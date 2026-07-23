"use client";

import { useState, useEffect } from "react";
import { supabaseClient } from "../../../../lib/auth/auth-client";

export function SettingsPanel() {
  const [brandName, setBrandName] = useState("");
  const [typographyMode, setTypographyMode] = useState("serif-display");
  const [storefrontActive, setStorefrontActive] = useState(true);
  const [supportEmail, setSupportEmail] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  
  const [saving, setSaving] = useState(false);
  const [log, setLog] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function loadSettings() {
      const { data } = await supabaseClient
        .from("site_settings")
        .select("*")
        .eq("id", 1)
        .single();
      
      if (data) {
        setBrandName(data.brand_name || "");
        setTypographyMode(data.typography_mode || "serif-display");
        setStorefrontActive(data.storefront_active);
        setSupportEmail(data.support_email || "");
        setMetaTitle(data.meta_title || "");
        setMetaDescription(data.meta_description || "");
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setLog(null);

    try {
      const { error } = await supabaseClient
        .from("site_settings")
        .update({
          brand_name: brandName,
          typography_mode: typographyMode,
          storefront_active: storefrontActive,
          support_email: supportEmail,
          meta_title: metaTitle,
          meta_description: metaDescription,
          updated_at: new Date().toISOString()
        })
        .eq("id", 1);

      if (error) throw error;
      setLog({ type: "success", text: "Global configuration vectors saved to core index." });
    } catch (err: any) {
      setLog({ type: "error", text: err.message || "Failed to commit system config metrics." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-4xl mx-auto text-left font-sans text-fg w-full max-w-full overflow-x-hidden">
      {log && (
        <div className={`p-4 border font-mono text-xs tracking-wider rounded-none ${
          log.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-amber-500/10 border-amber-500/20 text-amber-500"
        }`}>
          [{log.type.toUpperCase()}] {log.text}
        </div>
      )}

      {/* Brand Profile Coordinates */}
      <div className="space-y-4">
        <h3 className="font-mono text-[10px] uppercase tracking-[0.25em] text-fg-subtle border-b border-theme pb-2">01 / Brand Visual Constants</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-fg-muted">Brand Designation</label>
            <input
              type="text"
              required
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="w-full bg-bg border border-theme px-4 py-3 text-sm text-fg uppercase tracking-wider focus:outline-none focus:border-fg rounded-none"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-fg-muted">Typography Architecture Profile</label>
            <select
              value={typographyMode}
              onChange={(e) => setTypographyMode(e.target.value)}
              className="w-full bg-bg border border-theme p-[13px] text-xs font-mono text-fg focus:outline-none focus:border-fg cursor-pointer uppercase tracking-wider rounded-none"
            >
              <option value="serif-display">Editorial Serif (Luxury Focus)</option>
              <option value="minimal-sans">Minimalist Sans-Serif (Clean Focus)</option>
              <option value="brutalist-mono">Industrial Monospace (Raw Focus)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Support & Gatekeepers */}
      <div className="space-y-4">
        <h3 className="font-mono text-[10px] uppercase tracking-[0.25em] text-fg-subtle border-b border-theme pb-2">02 / Communication channels</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-fg-muted">Concierge Email Anchor</label>
            <input
              type="email"
              required
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              className="w-full bg-bg border border-theme px-4 py-3 text-sm text-fg focus:outline-none focus:border-fg rounded-none"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-fg-muted">Gatekeeper Gate Control Status</label>
            <div className="flex items-center h-12 gap-3">
              <input
                type="checkbox"
                id="storefrontActive"
                checked={storefrontActive}
                onChange={(e) => setStorefrontActive(e.target.checked)}
                className="accent-fg h-4 w-4 bg-bg border-theme rounded-none cursor-pointer"
              />
              <label htmlFor="storefrontActive" className="text-xs font-mono uppercase tracking-wider text-fg-muted cursor-pointer select-none">
                Storefront Public Traffic Active (Disable to force absolute maintenance block)
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Discoverability Indexes */}
      <div className="space-y-4">
        <h3 className="font-mono text-[10px] uppercase tracking-[0.25em] text-fg-subtle border-b border-theme pb-2">03 / Discovery Engine Indices (SEO)</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-fg-muted">Master Meta Title</label>
            <input
              type="text"
              required
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              className="w-full bg-bg border border-theme px-4 py-3.5 text-sm text-fg focus:outline-none focus:border-fg rounded-none"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-fg-muted">Global Search Meta Summary Description</label>
            <textarea
              rows={3}
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              className="w-full bg-bg border border-theme p-4 text-sm text-fg focus:outline-none focus:border-fg resize-none leading-relaxed rounded-none"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-fg text-bg py-4 text-xs font-mono uppercase tracking-[0.25em] transition-colors hover:opacity-90 disabled:opacity-40 cursor-pointer rounded-none font-bold"
      >
        {saving ? "SAVING SITE CONFIGURATION PARAMS..." : "COMMIT MASTER SYSTEM CONFIGURATION →"}
      </button>
    </form>
  );
}