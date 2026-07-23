"use server";

import { revalidatePath } from "next/cache";
import { assertValidDropTiming } from "@valenor/domain";
import { getSession } from "../../../lib/auth/session";
import { assertCanForUser } from "../../../lib/auth/rbac";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

async function requireCaller(action: string) {
  const session = await getSession();
  if (!session) throw new Error("Not signed in");
  await assertCanForUser(session.userId, action);
  return session;
}

async function createSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    }
  );
}

export async function createDrop(input: {
  slug: string;
  collectionId: string;
  liveAt: string; // ISO string from a <input type="datetime-local">
  endsAt: string;
}) {
  await requireCaller("drop:schedule");

  const liveAt = new Date(input.liveAt);
  const endsAt = new Date(input.endsAt);
  assertValidDropTiming({ liveAt, endsAt });

  const supabase = await createSupabaseClient();
  const { error } = await supabase.from("Drop").insert({
    slug: input.slug,
    collectionId: input.collectionId,
    liveAt: liveAt.toISOString(),
    endsAt: endsAt.toISOString(),
    status: "SCHEDULED",
  });

  if (error) throw new Error(error.message);

  revalidatePath("/admin/drops");
}

export async function deleteDrop(dropId: string) {
  await requireCaller("drop:schedule");

  const supabase = await createSupabaseClient();
  const { error } = await supabase.from("Drop").delete().eq("id", dropId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/drops");
}

export async function addPieceToDrop(dropId: string, pieceId: string) {
  await requireCaller("drop:schedule");

  const supabase = await createSupabaseClient();
  // Upsert equivalent in Supabase via ON CONFLICT
  const { error } = await supabase.from("DropPiece").upsert(
    { dropId, pieceId },
    { onConflict: "dropId,pieceId" }
  );

  if (error) throw new Error(error.message);

  revalidatePath("/admin/drops");
}

export async function removePieceFromDrop(dropId: string, pieceId: string) {
  await requireCaller("drop:schedule");

  const supabase = await createSupabaseClient();
  const { error } = await supabase
    .from("DropPiece")
    .delete()
    .match({ dropId, pieceId });

  if (error) throw new Error(error.message);

  revalidatePath("/admin/drops");
}