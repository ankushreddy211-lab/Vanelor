"use client";

import { useState, useEffect } from "react";
import { supabaseClient } from "../../../../lib/auth/auth-client";

interface StorageFile {
  name: string;
  id: string;
  updated_at: string;
  metadata: {
    size: number;
    mimetype: string;
  };
}

export function MediaVault() {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function loadBucketAssets() {
    setLoading(true);
    try {
      // Pull assets inside the structural 'catalog' and 'journal' namespaces
      const { data: catalogData } = await supabaseClient.storage.from("product-images").list("catalog", { limit: 50 });
      const { data: journalData } = await supabaseClient.storage.from("product-images").list("journal", { limit: 50 });
      
      let unifiedList: any[] = [];
      
      if (catalogData) {
        catalogData.forEach(f => {
          if (f.name !== ".emptyFolderPlaceholder") unifiedList.push({ ...f, folder: "catalog" });
        });
      }
      if (journalData) {
        journalData.forEach(f => {
          if (f.name !== ".emptyFolderPlaceholder") unifiedList.push({ ...f, folder: "journal" });
        });
      }

      setFiles(unifiedList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBucketAssets();
  }, []);

  const copyUrlToClipboard = (folder: string, name: string, id: string) => {
    const { data } = supabaseClient.storage.from("product-images").getPublicUrl(`${folder}/${name}`);
    if (data?.publicUrl) {
      navigator.clipboard.writeText(data.publicUrl);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  if (loading) {
    return <div className="font-mono text-xs text-fg-muted tracking-widest py-12 text-center">SCANNING CLOUD ASSET BUCKETS...</div>;
  }

  return (
    <div className="space-y-6 font-mono text-xs text-fg w-full max-w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-theme pb-4 gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-accent-strong block">
            Cloud Vault Index
          </span>
          <h3 className="text-lg sm:text-xl font-light uppercase tracking-wider text-fg">
            Total Indexed Vault Files: {files.length}
          </h3>
        </div>
        <button 
          onClick={loadBucketAssets} 
          className="font-mono text-xs text-fg-muted hover:text-fg uppercase tracking-wider bg-bg border border-theme px-4 py-2 rounded-none transition-colors cursor-pointer w-full sm:w-auto text-center"
        >
          Refresh Vault
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {files.length === 0 ? (
          <div className="col-span-full border border-dashed border-theme p-12 text-center text-fg-muted uppercase tracking-widest bg-bg-raised/30">
            No premium structural media assets uploaded to cloud buckets yet.
          </div>
        ) : (
          files.map((file) => {
            const sizeInMb = file.metadata?.size ? (file.metadata.size / (1024 * 1024)).toFixed(2) : "0.00";
            const mimeType = file.metadata?.mimetype || "image/jpeg";
            const { data } = supabaseClient.storage.from("product-images").getPublicUrl(`${(file as any).folder}/${file.name}`);
            
            return (
              <div key={file.id} className="border border-theme bg-bg-raised/40 p-4 space-y-4 flex flex-col justify-between hover:border-fg transition-all rounded-none">
                {/* Image asset mini preview wrapper context */}
                <div className="h-44 bg-bg border border-theme relative overflow-hidden flex items-center justify-center group">
                  <img 
                    src={data?.publicUrl} 
                    alt={file.name} 
                    className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-2 left-2 bg-bg border border-theme px-2 py-0.5 text-[8px] uppercase tracking-wider text-fg-muted font-mono">
                    {(file as any).folder}
                  </div>
                </div>

                <div className="space-y-1.5 text-left font-sans">
                  <div className="text-fg truncate font-semibold uppercase tracking-wide text-xs" title={file.name}>
                    {file.name}
                  </div>
                  <div className="flex justify-between text-[10px] text-fg-muted font-mono">
                    <span>TYPE: {mimeType.includes("/") ? mimeType.split("/")[1].toUpperCase() : "FILE"}</span>
                    <span>SIZE: {sizeInMb} MB</span>
                  </div>
                </div>

                <button
                  onClick={() => copyUrlToClipboard((file as any).folder, file.name, file.id)}
                  className={`w-full py-2.5 border text-[10px] uppercase tracking-widest font-mono transition-colors cursor-pointer ${
                    copiedId === file.id 
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                      : "bg-fg text-bg font-bold hover:opacity-90 border-fg"
                  }`}
                >
                  {copiedId === file.id ? "LINK SAVED TO CLIPBOARD ✓" : "COPY IMAGE ENDPOINT URL"}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}