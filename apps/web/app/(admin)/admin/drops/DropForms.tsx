"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Input, Button, Text } from "@valenor/design-system";
import { createDrop, addPieceToDrop, deleteDrop } from "../../../../features/drops/server/actions";
import type { CollectionListItem } from "../../../../features/catalog/server/queries";

export function DropForm({ collections }: { collections: CollectionListItem[] }) {
  const [pending, startTransition] = useTransition();
  const [slug, setSlug] = useState("");
  const [collectionId, setCollectionId] = useState(collections[0]?.id ?? "");
  const [liveAt, setLiveAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!collectionId) {
      setMessage("Create a collection first.");
      return;
    }
    startTransition(async () => {
      try {
        await createDrop({ slug, collectionId, liveAt, endsAt });
        setMessage(`Scheduled "${slug}"`);
        setSlug("");
        setLiveAt("");
        setEndsAt("");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Couldn't schedule drop.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <select
        value={collectionId}
        onChange={(e) => setCollectionId(e.target.value)}
        className="h-11 rounded-sm border border-border bg-transparent px-3 text-sm text-fg"
      >
        {collections.length === 0 && <option value="">No collections yet</option>}
        {collections.map((c) => (
          <option key={c.id} value={c.id} className="bg-bg text-fg">
            {c.title}
          </option>
        ))}
      </select>
      <Input placeholder="Slug (e.g. chapter-four)" value={slug} onChange={(e) => setSlug(e.target.value)} required />
      <label className="label">
        Live at
        <input
          type="datetime-local"
          value={liveAt}
          onChange={(e) => setLiveAt(e.target.value)}
          required
          className="mt-2 h-11 w-full rounded-sm border border-border bg-transparent px-3 text-sm text-fg"
        />
      </label>
      <label className="label">
        Ends at
        <input
          type="datetime-local"
          value={endsAt}
          onChange={(e) => setEndsAt(e.target.value)}
          required
          className="mt-2 h-11 w-full rounded-sm border border-border bg-transparent px-3 text-sm text-fg"
        />
      </label>
      <Button type="submit" variant="secondary" disabled={pending}>
        Schedule Drop
      </Button>
      {message && (
        <Text role="caption" as="p">
          {message}
        </Text>
      )}
    </form>
  );
}

export function AddPieceToDropForm({
  dropId,
  pieces,
}: {
  dropId: string;
  pieces: Array<{ id: string; title: string }>;
}) {
  const [pending, startTransition] = useTransition();
  const [pieceId, setPieceId] = useState(pieces[0]?.id ?? "");
  const [message, setMessage] = useState<string | null>(null);

  if (pieces.length === 0) return null;

  return (
    <div className="mt-3 flex items-center gap-2">
      <select
        value={pieceId}
        onChange={(e) => setPieceId(e.target.value)}
        className="h-9 rounded-sm border border-border bg-transparent px-2 text-sm text-fg"
      >
        {pieces.map((p) => (
          <option key={p.id} value={p.id} className="bg-bg text-fg">
            {p.title}
          </option>
        ))}
      </select>
      <Button
        size="sm"
        variant="ghost"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await addPieceToDrop(dropId, pieceId);
            setMessage("Added");
          })
        }
      >
        Add to drop
      </Button>
      {message && (
        <Text role="caption" as="span">
          {message}
        </Text>
      )}
    </div>
  );
}

export function DeleteDropButton({ dropId }: { dropId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      size="sm"
      variant="ghost"
      className="text-red-500 hover:text-red-700"
      disabled={pending}
      onClick={() => {
        if (confirm("Are you sure you want to delete this drop?")) {
          startTransition(async () => {
            try {
              await deleteDrop(dropId);
            } catch (error) {
              alert("Failed to delete drop.");
            }
          });
        }
      }}
    >
      {pending ? "Deleting..." : "Delete Drop"}
    </Button>
  );
}