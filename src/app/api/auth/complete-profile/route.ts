import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import bcrypt from 'bcryptjs'
import { getSupabase } from '@/lib/supabase'
import { isRateLimited } from '@/lib/rateLimiter'

const SECRET = process.env.NEXTAUTH_SECRET

export async function POST(req: NextRequest) {
  try {
    const ip = (req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown').split(',')[0].trim();
    if (isRateLimited(`complete-profile:${ip}`, 8, 60_000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }
    const body = await req.json()
    const { username, password, dateOfBirth, gender, phone } = body || {}

    if (!username || !password || !dateOfBirth || !gender) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const token = await getToken({ req, secret: SECRET })
    if (!token || !token.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getSupabase()

    // Username uniqueness check (exclude current user)
    const { data: existing } = await supabase
      .from('users')
      .select('user_id')
      .eq('username', String(username).toLowerCase())
      .neq('user_id', token.id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 409 })
    }

    const hashed = await bcrypt.hash(String(password), 10)

    const { error: updateError } = await supabase
      .from('users')
      .update({
        username: String(username).toLowerCase(),
        password_hash: hashed,
        date_of_birth: dateOfBirth,
        gender: gender,
        phone: phone || null,
      })
      .eq('user_id', token.id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    console.log('complete-profile updated user:', token.id);
    // For debugging: fetch the updated user row using service role key and log presence of password_hash
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
      if (supabaseUrl && supabaseServiceKey) {
        const { createClient } = await import('@supabase/supabase-js');
        const serverClient = createClient(supabaseUrl, supabaseServiceKey);
        const { data: fetchedUser, error: fetchErr } = await serverClient
          .from('users')
          .select('user_id, email, username, password_hash, date_of_birth, gender')
          .eq('user_id', token.id)
          .single();
        if (fetchErr) {
          console.error('complete-profile: service role fetch error:', fetchErr.message || fetchErr);
        } else {
          console.log('complete-profile: fetched user after update (password_hash present?):', !!(fetchedUser && fetchedUser.password_hash));
        }
      } else {
        console.warn('complete-profile: missing SUPABASE_SERVICE_ROLE_KEY, cannot verify updated row');
      }
    } catch (err) {
      console.error('complete-profile: error verifying updated user row', err);
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('complete-profile error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
