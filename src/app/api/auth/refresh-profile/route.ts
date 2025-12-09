import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/config';
import { getSupabase } from '@/lib/supabase/client';

export async function POST(req: Request) {
  // Get server session directly
  const session = (await getServerSession(authOptions as any)) as import('next-auth').Session | null;
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('users')
      .select('password_hash, date_of_birth, gender')
      .eq('user_id', session.user.id)
      .single();

    if (error) {
      console.error('Error fetching user for refresh-profile:', error);
      return NextResponse.json({ error: error.message || String(error) }, { status: 500 });
    }

    const needsProfileCompletion = !(data?.password_hash && data?.date_of_birth && data?.gender);
    return NextResponse.json({ needsProfileCompletion });
  } catch (err) {
    console.error('Unexpected error in refresh-profile:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
