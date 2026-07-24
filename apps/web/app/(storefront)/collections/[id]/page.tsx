import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import ProductClientView from "./ProductClientView"; // adjust path as needed

export default async function ProductPage({ params }: { params: { id: string } }) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );

  // 1. Fetch product details
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", params.id)
    .single();

  // 2. Check authenticated user session
  const { data: { user } } = await supabase.auth.getUser();

  let isMember = false;

  if (user) {
    // 3. Verify if user email or id exists in the house_registry table
    const { data: registryMatch } = await supabase
      .from("house_registry")
      .select("id")
      .or(`email.eq.${user.email},user_id.eq.${user.id}`)
      .maybeSingle();

    if (registryMatch) {
      isMember = true;
    }
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-bg text-fg flex items-center justify-center font-mono text-xs uppercase tracking-widest">
        Garment record not found in archive.
      </div>
    );
  }

  return <ProductClientView product={product} isMember={isMember} isAuthenticated={!!user} />;
}