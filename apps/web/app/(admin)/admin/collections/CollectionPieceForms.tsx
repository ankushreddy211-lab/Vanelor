"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Input, Button, Text } from "@valenor/design-system";
import { createCollection, createPiece } from "../../../../features/catalog/server/actions";
import type { CollectionListItem } from "../../../../features/catalog/server/queries";

export function CollectionForm() {
  const [pending, startTransition] = useTransition();
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      try {
        await createCollection({ slug, title, description });
        setMessage(`Created "${title}"`);
        setSlug("");
        setTitle("");
        setDescription("");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Couldn't create collection.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Input placeholder="Slug (e.g. chapter-four)" value={slug} onChange={(e) => setSlug(e.target.value)} required />
      <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <Input
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />
      <Button type="submit" variant="secondary" disabled={pending}>
        Create Collection
      </Button>
      {message && (
        <Text role="caption" as="p">
          {message}
        </Text>
      )}
    </form>
  );
}

export function PieceForm({ collections }: { collections: CollectionListItem[] }) {
  const [pending, startTransition] = useTransition();
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [editorialCopy, setEditorialCopy] = useState("");
  const [collectionId, setCollectionId] = useState(collections[0]?.id ?? "");
  const [imageUrl, setImageUrl] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!collectionId) {
      setMessage("Create a collection first.");
      return;
    }
    startTransition(async () => {
      try {
        await createPiece({ slug, title, editorialCopy, collectionId, imageUrl: imageUrl || undefined });
        setMessage(`Created "${title}"`);
        setSlug("");
        setTitle("");
        setEditorialCopy("");
        setImageUrl("");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Couldn't create piece.");
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
      <Input placeholder="Slug (e.g. the-overcoat)" value={slug} onChange={(e) => setSlug(e.target.value)} required />
      <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <Input
        placeholder="Editorial copy"
        value={editorialCopy}
        onChange={(e) => setEditorialCopy(e.target.value)}
        required
      />
      <Input placeholder="Image URL (optional)" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
      <Button type="submit" variant="secondary" disabled={pending}>
        Create Piece
      </Button>
      {message && (
        <Text role="caption" as="p">
          {message}
        </Text>
      )}
    </form>
  );
}
