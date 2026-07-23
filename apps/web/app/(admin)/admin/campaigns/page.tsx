"use client";

import { useState, useEffect, useTransition, type FormEvent } from "react";
import { Input, Button, Text } from "@valenor/design-system";
import { listCampaignAssets, createCampaignAsset } from "@/features/campaigns/server/actions";

export default function CampaignManagerPage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [pending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [campaignName, setCampaignName] = useState("Drop 01: Origins");
  const [channel, setChannel] = useState("Instagram");
  const [format, setFormat] = useState("Carousel");
  const [assetUrl, setAssetUrl] = useState("");
  const [status, setStatus] = useState("Scheduled");
  const [scheduledDate, setScheduledDate] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const fetchAssetsList = async () => {
    try {
      const data = await listCampaignAssets();
      setAssets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssetsList();
  }, []);

  function handleCreate(e: FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        await createCampaignAsset({
          title,
          campaignName,
          channel,
          format,
          assetUrl,
          status,
          scheduledDate: scheduledDate || undefined,
        });
        setMessage(`Successfully added campaign asset "${title}"`);
        setTitle("");
        setAssetUrl("");
        setScheduledDate("");
        setStatus("Scheduled");
        fetchAssetsList();
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "Failed to create campaign asset.");
      }
    });
  }

  return (
    <div>
      <header className="mb-8 border-b border-border pb-4">
        <h1 className="font-display text-2xl mb-1 text-fg">Campaign & Asset Manager</h1>
        <p className="font-body text-sm text-fg-muted">Manage hero assets, ad creatives, social drops, and multi-channel publication schedules.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Creation Form */}
        <div className="lg:col-span-1">
          <form onSubmit={handleCreate} className="flex flex-col gap-4 p-6 border border-border bg-bg-raised">
            <h2 className="text-sm font-semibold text-fg">Upload / Register Asset</h2>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted">Asset Title / Identifier</label>
              <Input placeholder="e.g. Heavyweight Hoodie Cinematic Teaser" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted">Campaign Name</label>
              <Input placeholder="e.g. Drop 01: Origins" value={campaignName} onChange={(e) => setCampaignName(e.target.value)} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted">Channel</label>
                <select 
                  className="h-10 px-3 rounded border border-border bg-bg text-fg text-xs"
                  value={channel} 
                  onChange={(e) => setChannel(e.target.value)}
                >
                  <option value="Instagram">Instagram</option>
                  <option value="Meta Ads">Meta Ads</option>
                  <option value="YouTube">YouTube</option>
                  <option value="Email">Email</option>
                  <option value="Website Hero">Website Hero</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted">Format</label>
                <select 
                  className="h-10 px-3 rounded border border-border bg-bg text-fg text-xs"
                  value={format} 
                  onChange={(e) => setFormat(e.target.value)}
                >
                  <option value="Carousel">Carousel</option>
                  <option value="Reel / Video">Reel / Video</option>
                  <option value="Hero Image">Hero Image</option>
                  <option value="Banner">Banner</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted">Asset URL (Cloudinary / S3 / Supabase Storage)</label>
              <Input placeholder="https://..." value={assetUrl} onChange={(e) => setAssetUrl(e.target.value)} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted">Status</label>
                <select 
                  className="h-10 px-3 rounded border border-border bg-bg text-fg text-xs"
                  value={status} 
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="Live">Live</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted">Scheduled Date</label>
                <Input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} />
              </div>
            </div>

            <Button type="submit" variant="primary" disabled={pending}>
              {pending ? "Saving Asset..." : "Save Campaign Asset"}
            </Button>

            {message && (
              <Text role="caption" as="p">
                {message}
              </Text>
            )}
          </form>
        </div>

        {/* Assets Grid Table */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-semibold text-fg">Active Campaign Assets ({assets.length})</h2>
          <div className="border border-border bg-bg-raised overflow-x-auto">
            <div className="grid grid-cols-5 p-3 border-b border-border bg-bg text-xs tracking-wider uppercase text-fg-muted font-medium min-w-[600px]">
              <div>Asset / Campaign</div>
              <div>Channel</div>
              <div>Format</div>
              <div>Schedule</div>
              <div>Status</div>
            </div>
            {loading ? (
              <div className="p-6 text-xs text-fg-muted text-center font-body">Loading campaign assets...</div>
            ) : assets.length === 0 ? (
              <div className="p-6 text-xs text-fg-muted text-center font-body">No campaign assets recorded yet.</div>
            ) : (
              assets.map((asset: any) => (
                <div key={asset.id} className="grid grid-cols-5 p-3 border-b border-border last:border-0 font-body text-xs items-center min-w-[600px]">
                  <div className="truncate pr-2">
                    <div className="font-medium text-fg truncate">{asset.title}</div>
                    <div className="text-fg-muted text-[10px]">{asset.campaign_name}</div>
                  </div>
                  <div className="text-fg-muted">{asset.channel}</div>
                  <div className="text-fg-muted">{asset.format}</div>
                  <div className="text-fg-muted text-[10px]">
                    {asset.scheduled_date ? new Date(asset.scheduled_date).toLocaleDateString() : 'Immediate'}
                  </div>
                  <div>
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-semibold ${
                      asset.status === 'Live' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      asset.status === 'Scheduled' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                    }`}>
                      {asset.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}