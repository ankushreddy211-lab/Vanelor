import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminClientLayout from './AdminClientLayout';
import { assertCanForUser } from '../../lib/auth/rbac';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();

  // Initialize Supabase server client safely using environment variables and cookies
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
          } catch {
            // The `setAll` method was called from a Server Component.
          }
        },
      },
    }
  );

  // 1. Verify user authentication securely on the server
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    redirect('/login');
  }

  // 2. Validate admin privileges using the centralized RBAC system
  try {
    await assertCanForUser(user.id, "admin:access");
  } catch {
    redirect('/'); // Kick regular users back to the storefront immediately
  }

  // 4. Render the client sidebar layout only if authorized
  return <AdminClientLayout>{children}</AdminClientLayout>;
}