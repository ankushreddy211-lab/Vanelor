"use client";

import { useState, useEffect } from "react";
import { supabaseClient } from "../../../../lib/auth/auth-client";

interface PreviewFile {
  file: File;
  previewUrl: string;
}

const CATEGORIES = [
  "Outerwear",
  "Knitwear",
  "Shirts",
  "Trousers",
  "Footwear",
  "Accessories"
];

// Dynamic sizing options based on category selection
const SIZES_BY_CATEGORY: Record<string, string[]> = {
  Outerwear: ["Size I (Small / 38)", "Size II (Medium / 40)", "Size III (Large / 42)", "Size IV (XL / 44)", "Custom Tailored"],
  Knitwear: ["Size I (Small)", "Size II (Medium)", "Size III (Large)", "Size IV (XL)", "Custom Tailored"],
  Shirts: ["38 (S)", "40 (M)", "42 (L)", "44 (XL)", "Custom Tailored"],
  Trousers: ["30 (Waist)", "32 (Waist)", "34 (Waist)", "36 (Waist)", "Custom Tailored"],
  Footwear: ["UK 7 / US 8", "UK 8 / US 9", "UK 9 / US 10", "UK 10 / US 11", "UK 11 / US 12"],
  Accessories: ["One Size / Standard", "Custom Fit"]
};

export function ProductUploadForm() {
  const [collections, setCollections] = useState<{ id: string; title: string }[]>([]);
  const [selectedCollection, setSelectedCollection] = useState("");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [memberPrice, setMemberPrice] = useState("");
  const [category, setCategory] = useState("Outerwear");
  const [selectedSizes, setSelectedSizes] = useState<string[]>(SIZES_BY_CATEGORY["Outerwear"]);
  
  // Track selected files with preview URLs
  const [selectedFiles, setSelectedFiles] = useState<PreviewFile[]>([]);
  
  const [craftNotes, setCraftNotes] = useState("");
  const [material, setMaterial] = useState("");
  const [construction, setConstruction] = useState("");
  const [details, setDetails] = useState("");
  const [weight, setWeight] = useState("");
  const [fitProfile, setFitProfile] = useState("");
  const [careGuide, setCareGuide] = useState("");

  const [uploading, setUploading] = useState(false);
  const [log, setLog] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function fetchCollections() {
      const { data } = await supabaseClient.from("collections").select("id, title").order("created_at", { ascending: false });
      if (data) setCollections(data);
    }
    fetchCollections();
  }, []);

  // Automatically update and reset default sizes when category changes
  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    setSelectedSizes(SIZES_BY_CATEGORY[newCategory] || ["Standard"]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFilesArray = Array.from(e.target.files).map(file => ({
      file,
      previewUrl: URL.createObjectURL(file)
    }));
    setSelectedFiles(prev => [...prev, ...newFilesArray]);
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].previewUrl);
      updated.splice(index, 1);
      return updated;
    });
  };

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setLog(null);

    try {
      const uploadedUrls: string[] = [];

      if (selectedFiles.length > 0) {
        for (const item of selectedFiles) {
          const file = item.file;
          const fileName = `${crypto.randomUUID()}.${file.name.split(".").pop()}`;
          const isVideo = file.type.startsWith("video/");
          const folder = isVideo ? "catalog/videos" : "catalog/images";
          const filePath = `${folder}/${fileName}`;
          
          const { error } = await supabaseClient.storage.from("product-images").upload(filePath, file);
          if (error) throw error;

          const { data } = supabaseClient.storage.from("product-images").getPublicUrl(filePath);
          if (data?.publicUrl) uploadedUrls.push(data.publicUrl);
        }
      }

      const { error: dbError } = await supabaseClient.from("products").insert([
        {
          title,
          price: parseFloat(price),
          member_price: memberPrice ? parseFloat(memberPrice) : null,
          category,
          sizes: selectedSizes,
          collection_id: selectedCollection || null,
          images: uploadedUrls,
          craft_notes: craftNotes,
          material,
          construction,
          details,
          weight_g: weight ? parseInt(weight) : null,
          fit_profile: fitProfile,
          care_guide: careGuide,
        },
      ]);

      if (dbError) throw dbError;

      setLog({ type: "success", text: "Product successfully cataloged into database." });
      setTitle(""); setPrice(""); setMemberPrice(""); setCraftNotes(""); setMaterial(""); setConstruction("");
      setDetails(""); setWeight(""); setFitProfile(""); setCareGuide(""); setSelectedCollection("");
      setSelectedFiles([]);
    } catch (err: any) {
      setLog({ type: "error", text: err.message || "Failed to catalog production details." });
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-6 max-w-4xl mx-auto text-left font-sans text-fg w-full max-w-full overflow-x-hidden">
      {log && (
        <div className={`p-3.5 border text-xs font-mono rounded-none ${log.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-amber-500/10 border-amber-500/20 text-amber-500"}`}>
          {log.text}
        </div>
      )}

      {/* Core Details */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="space-y-1.5 md:col-span-2">
          <label className="block text-xs font-semibold text-fg-muted uppercase tracking-wider">Garment Title</label>
          <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-bg border border-theme rounded-none px-3 py-2.5 text-sm text-fg focus:outline-none focus:border-fg" placeholder="e.g. Wool Coat" />
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-fg-muted uppercase tracking-wider">Retail Price (INR)</label>
          <input type="number" required value={price} onChange={(e) => setPrice(e.target.value)} className="w-full bg-bg border border-theme rounded-none px-3 py-2.5 text-sm text-fg focus:outline-none focus:border-fg" placeholder="0.00" />
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-fg-muted uppercase tracking-wider">Member Price</label>
          <input type="number" value={memberPrice} onChange={(e) => setMemberPrice(e.target.value)} className="w-full bg-bg border border-theme rounded-none px-3 py-2.5 text-sm text-fg focus:outline-none focus:border-fg" placeholder="Exclusive rate" />
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-fg-muted uppercase tracking-wider">Category</label>
          <select value={category} onChange={(e) => handleCategoryChange(e.target.value)} className="w-full bg-bg border border-theme rounded-none p-[11px] text-sm text-fg focus:outline-none focus:border-fg cursor-pointer uppercase tracking-wider">
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
      </div>

      {/* Collection Capsule & Dynamic Available Sizes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-fg-muted uppercase tracking-wider">Collection Capsule</label>
          <select value={selectedCollection} onChange={(e) => setSelectedCollection(e.target.value)} className="w-full bg-bg border border-theme rounded-none p-[11px] text-sm text-fg focus:outline-none focus:border-fg cursor-pointer">
            <option value="">Standalone Item</option>
            {collections.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-semibold text-fg-muted uppercase tracking-wider">Available Sizing ({category})</label>
            <span className="text-[10px] text-fg-subtle font-mono">Click to toggle active specs</span>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {(SIZES_BY_CATEGORY[category] || []).map(size => {
              const isSelected = selectedSizes.includes(size);
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  className={`px-2.5 py-1 text-[11px] font-mono border rounded-none transition-colors cursor-pointer ${
                    isSelected 
                      ? 'bg-fg text-bg border-fg font-bold' 
                      : 'bg-bg text-fg-muted border-theme hover:border-fg'
                  }`}
                >
                  {size} {isSelected ? '✓' : ''}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Narrative Fields */}
      <div className="space-y-4 pt-2">
        <h3 className="text-xs font-bold text-fg-subtle uppercase tracking-widest border-b border-theme pb-1.5 font-mono">Garment Narrative Profile</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-fg-muted uppercase tracking-wider">Craft Notes</label>
            <textarea rows={4} value={craftNotes} onChange={(e) => setCraftNotes(e.target.value)} className="w-full bg-bg border border-theme rounded-none p-3 text-sm text-fg focus:outline-none focus:border-fg resize-none leading-normal" placeholder="Describe the design inspiration and narrative..." />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-fg-muted uppercase tracking-wider">Material Composition</label>
            <textarea rows={4} value={material} onChange={(e) => setMaterial(e.target.value)} className="w-full bg-bg border border-theme rounded-none p-3 text-sm text-fg focus:outline-none focus:border-fg resize-none leading-normal" placeholder="Textile details and blend specs..." />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-fg-muted uppercase tracking-wider">Architectural Construction</label>
            <textarea rows={4} value={construction} onChange={(e) => setConstruction(e.target.value)} className="w-full bg-bg border border-theme rounded-none p-3 text-sm text-fg focus:outline-none focus:border-fg resize-none leading-normal" placeholder="Details regarding tailoring and fit assembly..." />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-fg-muted uppercase tracking-wider">Fine Details & Accents</label>
            <textarea rows={4} value={details} onChange={(e) => setDetails(e.target.value)} className="w-full bg-bg border border-theme rounded-none p-3 text-sm text-fg focus:outline-none focus:border-fg resize-none leading-normal" placeholder="Hardware, lining elements, custom accents..." />
          </div>
        </div>
      </div>

      {/* Physical Fit & Storage Fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-fg-muted uppercase tracking-wider">Textile Weight (Grams)</label>
          <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full bg-bg border border-theme rounded-none px-3 py-2.5 text-sm text-fg focus:outline-none focus:border-fg" placeholder="e.g. 420" />
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-fg-muted uppercase tracking-wider">Fit Specification</label>
          <input type="text" value={fitProfile} onChange={(e) => setFitProfile(e.target.value)} className="w-full bg-bg border border-theme rounded-none px-3 py-2.5 text-sm text-fg focus:outline-none focus:border-fg" placeholder="e.g. Regular Cut / Oversized Fit" />
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-fg-muted uppercase tracking-wider">Visual & Video Assets</label>
          <div className="relative border border-theme bg-bg rounded-none p-3 text-center cursor-pointer hover:border-fg transition-colors">
            <input type="file" multiple accept="image/*,video/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
            <span className="text-xs text-fg-muted font-mono uppercase tracking-wider block truncate">Upload Images / Videos</span>
          </div>
        </div>
      </div>

      {/* Previews Grid with Removal Option */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2 pt-2">
          <label className="block text-xs font-semibold text-fg-muted uppercase tracking-wider">Selected Assets ({selectedFiles.length})</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {selectedFiles.map((item, index) => {
              const isVideo = item.file.type.startsWith("video/");
              return (
                <div key={index} className="relative group border border-theme rounded-none bg-bg overflow-hidden aspect-square flex items-center justify-center">
                  {isVideo ? (
                    <video src={item.previewUrl} className="w-full h-full object-cover" muted />
                  ) : (
                    <img src={item.previewUrl} alt={`preview-${index}`} className="w-full h-full object-cover" />
                  )}
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute top-1 right-1 bg-black/80 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Remove asset"
                  >
                    ✕
                  </button>
                  <span className="absolute bottom-1 left-1 bg-bg text-[9px] px-1 text-fg font-semibold font-mono uppercase">
                    {isVideo ? "Video" : "Image"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-fg-muted uppercase tracking-wider">Garment Care Guide</label>
        <input type="text" value={careGuide} onChange={(e) => setCareGuide(e.target.value)} className="w-full bg-bg border border-theme rounded-none px-3 py-2.5 text-sm text-fg focus:outline-none focus:border-fg" placeholder="e.g. Dry Clean Only." />
      </div>

      <button type="submit" disabled={uploading} className="w-full bg-fg text-bg py-3.5 rounded-none text-xs font-mono font-bold uppercase tracking-[0.2em] transition-colors hover:opacity-90 disabled:opacity-40 cursor-pointer">
        {uploading ? "Saving item to catalog..." : "Publish Item to Catalog →"}
      </button>
    </form>
  );
}