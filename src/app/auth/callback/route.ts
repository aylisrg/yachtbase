import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/admin';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Sync user profile to public.users table.
      // This is a safety net in case the DB trigger hasn't fired yet.
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase.from('users').upsert(
          {
            id: user.id,
            email: user.email ?? '',
            full_name:
              user.user_metadata?.full_name ??
              user.user_metadata?.name ??
              null,
            avatar_url: user.user_metadata?.avatar_url ?? null,
            auth_provider: user.app_metadata?.provider ?? 'google',
          },
          { onConflict: 'id' }
        );
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
