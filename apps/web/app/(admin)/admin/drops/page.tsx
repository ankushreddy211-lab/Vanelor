import { redirect } from "next/navigation";
import { Text, Divider } from "@valenor/design-system";
import { computeDropStatus } from "@valenor/domain";
import { getSession, NotAuthorizedError } from "../../../../lib/auth/session";
import { assertCanForUser } from "../../../../lib/auth/rbac";
import { listCollections, listPiecesByCollection } from "../../../../features/catalog/server/queries";
import { listDrops } from "../../../../features/drops/server/queries";
import { DropForm, AddPieceToDropForm, DeleteDropButton } from "./DropForms";

export default async function AdminDropsPage() {
  const session = await getSession();
  if (!session) redirect("/sign-in?from=/admin/drops");

  try {
    await assertCanForUser(session.userId, "drop:schedule");
  } catch (error) {
    if (error instanceof NotAuthorizedError) redirect("/admin");
    throw error;
  }

  const [collections, drops] = await Promise.all([listCollections(), listDrops()]);
  const now = new Date();

  const dropsWithPieces = await Promise.all(
    drops.map(async (drop) => ({
      drop,
      // Live status shown here is computed the same way the storefront page
      // and the gate compute it — one function, three call sites, per
      // architecture §11.2's "server-authoritative time checks
      // exclusively" (never a second, slightly-different implementation).
      liveStatus: computeDropStatus({ liveAt: drop.liveAt, endsAt: drop.endsAt }, now),
      availablePieces: await listPiecesByCollection(drop.collectionId),
    }))
  );

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Text role="label" as="p">
        Admin
      </Text>
      <Text role="heading" as="h1" className="mt-4">
        Drops
      </Text>
      <Text role="body" as="p" className="mt-4 text-fg-muted">
        The status shown per drop below is computed live from{" "}
        <code className="text-fg">liveAt</code>/<code className="text-fg">endsAt</code> — the same
        function the storefront page and the reservation gate use, not a
        cached value that could drift.
      </Text>

      <div className="mt-10 max-w-sm">
        <DropForm collections={collections} />
      </div>

      <Divider className="my-16" />

      <div className="flex flex-col gap-10">
        {dropsWithPieces.length === 0 && (
          <Text role="bodySm" as="p" className="text-fg-muted">
            No drops scheduled yet.
          </Text>
        )}
        {dropsWithPieces.map(({ drop, liveStatus, availablePieces }) => (
          <div key={drop.id} className="border-b border-border pb-8 space-y-4">
            <div className="flex items-center justify-between">
              <Text role="headingSm" as="h2">
                {drop.slug}
              </Text>
              <Text role="label" as="span" className="text-accent-strong">
                {liveStatus}
                {/* @ts-ignore */}
                {drop.storedStatus && liveStatus !== drop.storedStatus && ` (cached: ${drop.storedStatus})`}
              </Text>
            </div>
            
            <Text role="caption" as="p">
              {/* @ts-ignore */}
              {drop.collectionTitle || "Collection"} · {drop.pieceCount || 0} piece(s) · live{" "}
              {new Date(drop.liveAt).toLocaleString()} → {new Date(drop.endsAt).toLocaleString()}
            </Text>

            <div className="flex items-center justify-between gap-4 pt-2">
              <AddPieceToDropForm dropId={drop.id} pieces={availablePieces} />
              <DeleteDropButton dropId={drop.id} />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}