import { Nav } from "./_components/Nav";
import { Footer } from "./_components/Footer";
import { Cursor } from "./_components/Cursor";
import { GlobalBack } from "./_components/GlobalBack";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let isAdmin = false;

  try {
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
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

    const { data: { user }, error } = await supabase.auth.getUser();

    if (user && !error) {
      // Query the User table directly via Supabase client
      const { data: dbUser } = await supabase
        .from("User")
        .select("role")
        .eq("id", user.id)
        .single();
      
      isAdmin = dbUser?.role?.toLowerCase() === "admin";
    }
  } catch (error) {
    isAdmin = false;
  }

  return (
    <div className="min-h-screen bg-bg text-fg font-sans antialiased selection:bg-fg selection:text-bg transition-colors duration-200">
      <Cursor />
      <GlobalBack /> 
      <Nav isAdmin={isAdmin} />
      {children}
      <Footer isAdmin={isAdmin} />
    </div>
  );
}