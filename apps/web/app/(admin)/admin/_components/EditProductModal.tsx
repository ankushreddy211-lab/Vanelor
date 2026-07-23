"use client";

import { useState } from "react";
import { supabaseClient } from "../../../../lib/auth/auth-client";
import Image from "next/image";

interface Product {
  id: string;
  title: string;
  price: number;
  member_price?: number;
  category?: string;
  sizes?: string[];
  collection_id?: string;
  images: string[];
  craft_notes?: string;
  material?: string;
  construction?: string;
  details?: string;
  weight_g?: number;
  fit_profile?: string;
  care_guide?: string;
}

interface EditProductModalProps {
  product: Product;
  collections: { id: string; title: string }[];
  onClose: () => void;
  onUpdated: () => void;
}

const CATEGORIES = [
  "Outerwear",
  "Knitwear",
  "Shirts",
  "Trousers",
  "Footwear",
  "Accessories"
];

const SIZES_BY_CATEGORY: Record<string, string[]> = {
  Outerwear: ["Size I (Small / 38)", "Size II (Medium / 40)", "Size III (Large / 42)", "Size IV (XL / 44)", "Custom Tailored"],
  Knitwear: ["Size I (Small)", "Size II (Medium)", "Size III (Large)", "Size IV (XL)", "Custom Tailored"],
  Shirts: ["38 (S)", "40 (M)", "42 (L)", "44 (XL)", "Custom Tailored"],
  Trousers: ["30 (Waist)", "32 (Waist)", "34 (Waist)", "36 (Waist)", "Custom Tailored"],
  Footwear: ["UK 7 / US 8", "UK 8 / US 9", "UK 9 / US 10", "UK 10 / US 11", "UK 11 / US 12"],
  Accessories: ["One Size / Standard", "Custom Fit"]
};

export function EditProductModal({ product, collections, onClose, onUpdated }: EditProductModalProps) {
  const [title, setTitle] = useState(product.title || "");
  const [price, setPrice] = useState(product.price ? product.price.toString() : "");
  const [memberPrice, setMemberPrice] = useState(product.member_price ? product.member_price.toString() : "");
  const [category, setCategory] = useState(product.category || "Outerwear");
  const [selectedSizes, setSelectedSizes] = useState<string[]>(product.sizes || SIZES_BY_CATEGORY["Outerwear"]);
  const [selectedCollection, setSelectedCollection] = useState(product.collection_id || "");
  
  const [existingImages, setExistingImages] = useState<string[]>(product.images || []);
  const [newFiles, setNewFiles] = useState<{ file: File; previewUrl: string }[]>([]);

  const [craftNotes, setCraftNotes] = useState(product.craft_notes || "");
  const [material, setMaterial] = useState(product.material || "");
  const [construction, setConstruction] = useState(product.construction || "");
  const [details, setDetails] = useState(product.details || "");
  const [weight, setWeight] = useState(product.weight_g ? product.weight_g.toString() : "");
  const [fitProfile, setFitProfile] = useState(product.fit_profile || "");
  const [careGuide, setCareGuide] = useState(product.care_guide || "");

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    setSelectedSizes(SIZES_BY_CATEGORY[newCategory] || ["Standard"]);
  };

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const handleNewFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const mapped = Array.from(e.target.files).map(file => ({
      file,
      previewUrl: URL.createObjectURL(file)
    }));
    setNewFiles(prev => [...prev, ...mapped]);
    e.target.value = "";
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewFile = (index: number) => {
    setNewFiles(prev => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);

    try {
      let updatedUrls = [...existingImages];

      if (newFiles.length > 0) {
        for (const item of newFiles) {
          const file = item.file;
          const fileName = `${crypto.randomUUID()}.${file.name.split(".").pop()}`;
          const isVideo = file.type.startsWith("video/");
          const folder = isVideo ? "catalog/videos" : "catalog/images";
          const filePath = `${folder}/${fileName}`;

          const { error: uploadError } = await supabaseClient.storage.from("product-images").upload(filePath, file);
          if (uploadError) throw uploadError;

          const { data } = supabaseClient.storage.from("product-images").getPublicUrl(filePath);
          if (data?.publicUrl) {
            updatedUrls.push(data.publicUrl);
          }
        }
      }

      const { error: dbError } = await supabaseClient
        .from("products")
        .update({
          title,
          price: parseFloat(price),
          member_price: memberPrice ? parseFloat(memberPrice) : null,
          category,
          sizes: selectedSizes,
          collection_id: selectedCollection || null,
          images: updatedUrls,
          craft_notes: craftNotes,
          material,
          construction,
          details,
          weight_g: weight ? parseInt(weight) : null,
          fit_profile: fitProfile,
          care_guide: careGuide,
        })
        .eq("id", product.id);

      if (dbError) throw dbError;

      onUpdated();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update product.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-bg-raised border border-theme rounded-none max-w-3xl w-full p-6 text-fg my-8 max-h-[90vh] overflow-y-auto shadow-2xl">
        
        <div className="flex items-center justify-between border-b border-theme pb-4 mb-6">
          <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-fg font-bold">Edit Garment Record</h2>
          <button onClick={onClose} className="text-fg-muted hover:text-fg text-xs uppercase font-mono cursor-pointer">Close ✕</button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-mono">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-6">
          
          {/* Core Info */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-xs font-semibold text-fg-muted uppercase tracking-wider">Garment Title</label>
              <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-bg border border-theme rounded-none px-3 py-2.5 text-sm text-fg focus:outline-none focus:border-fg" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-fg-muted uppercase tracking-wider">Retail Price (INR)</label>
              <input type="number" required value={price} onChange={(e) => setPrice(e.target.value)} className="w-full bg-bg border border-theme rounded-none px-3 py-2.5 text-sm text-fg focus:outline-none focus:border-fg" />
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

          {/* Collection Capsule & Dynamic Sizes */}
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
                <span className="text-[10px] text-fg-subtle font-mono">Click to toggle</span>
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

          {/* Existing & New Assets Manager */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-fg-muted uppercase tracking-wider">Media Assets</label>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {existingImages.map((url, index) => {
                const isVideo = url.endsWith('.mp4');
                return (
                  <div key={index} className="relative group border border-theme rounded-none bg-bg overflow-hidden aspect-square flex items-center justify-center">
                    {isVideo ? (
                      <video src={url} className="w-full h-full object-cover" muted />
                    ) : (
                      <Image src={url} alt={`media-${index}`} fill className="object-cover" />
                    )}
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute top-1 right-1 bg-black/80 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      title="Remove asset"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}

              {newFiles.map((item, index) => {
                const isVideo = item.file.type.startsWith("video/");
                return (
                  <div key={`new-${index}`} className="relative group border border-theme rounded-none bg-bg overflow-hidden aspect-square flex items-center justify-center">
                    {isVideo ? (
                      <video src={item.previewUrl} className="w-full h-full object-cover" muted />
                    ) : (
                      <img src={item.previewUrl} alt={`new-${index}`} className="w-full h-full object-cover" />
                    )}
                    <button
                      type="button"
                      onClick={() => removeNewFile(index)}
                      className="absolute top-1 right-1 bg-black/80 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      ✕
                    </button>
                    <span className="absolute bottom-1 left-1 bg-fg text-[9px] px-1 text-bg font-semibold font-mono uppercase">New</span>
                  </div>
                );
              })}
            </div>

            <div className="relative border border-dashed border-theme bg-bg rounded-none p-4 text-center cursor-pointer hover:border-fg transition-colors mt-2">
              <input type="file" multiple accept="image/*,video/*" onChange={handleNewFilesChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              <span className="text-xs text-fg-muted font-mono uppercase tracking-wider">+ Add More Images or Videos</span>
            </div>
          </div>

          {/* Narrative Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-fg-muted uppercase tracking-wider">Craft Notes</label>
              <textarea rows={3} value={craftNotes} onChange={(e) => setCraftNotes(e.target.value)} className="w-full bg-bg border border-theme rounded-none p-3 text-sm text-fg focus:outline-none focus:border-fg resize-none" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-fg-muted uppercase tracking-wider">Material Composition</label>
              <textarea rows={3} value={material} onChange={(e) => setMaterial(e.target.value)} className="w-full bg-bg border border-theme rounded-none p-3 text-sm text-fg focus:outline-none focus:border-fg resize-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-fg-muted uppercase tracking-wider">Construction Details</label>
              <textarea rows={3} value={construction} onChange={(e) => setConstruction(e.target.value)} className="w-full bg-bg border border-theme rounded-none p-3 text-sm text-fg focus:outline-none focus:border-fg resize-none" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-fg-muted uppercase tracking-wider">Design Details</label>
              <textarea rows={3} value={details} onChange={(e) => setDetails(e.target.value)} className="w-full bg-bg border border-theme rounded-none p-3 text-sm text-fg focus:outline-none focus:border-fg resize-none" />
            </div>
          </div>

          {/* Specs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-fg-muted uppercase tracking-wider">Weight (Grams)</label>
              <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full bg-bg border border-theme rounded-none px-3 py-2.5 text-sm text-fg focus:outline-none focus:border-fg" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-fg-muted uppercase tracking-wider">Fit Specification</label>
              <input type="text" value={fitProfile} onChange={(e) => setFitProfile(e.target.value)} className="w-full bg-bg border border-theme rounded-none px-3 py-2.5 text-sm text-fg focus:outline-none focus:border-fg" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-fg-muted uppercase tracking-wider">Care Guide</label>
              <input type="text" value={careGuide} onChange={(e) => setCareGuide(e.target.value)} className="w-full bg-bg border border-theme rounded-none px-3 py-2.5 text-sm text-fg focus:outline-none focus:border-fg" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-theme">
            <button type="button" onClick={onClose} className="px-4 py-2.5 bg-transparent text-fg-muted hover:text-fg text-xs uppercase font-mono tracking-wider cursor-pointer">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="px-6 py-2.5 bg-fg text-bg rounded-none text-xs font-mono font-bold uppercase tracking-widest hover:opacity-90 disabled:opacity-40 cursor-pointer">
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}