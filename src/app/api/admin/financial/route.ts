import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { getSupabase } from '@/lib/supabase/client'

export async function GET(req: NextRequest) {
  try {
    const session = (await getServerSession(authOptions as any)) as import('next-auth').Session | null
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = (session.user as any)?.role
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const supabase = getSupabase()
    
    // Call the Supabase function to get financial stats
    const { data, error } = await supabase.rpc('get_financial_stats')

    if (error) {
      console.error('Error fetching financial stats:', error)
      return NextResponse.json({ error: 'Failed to fetch financial stats' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in admin financial API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Get recent transactions
export async function POST(req: NextRequest) {
  try {
    const session = (await getServerSession(authOptions as any)) as import('next-auth').Session | null
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = (session.user as any)?.role
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const supabase = getSupabase()
    const body = await req.json()
    const { limit = 50, offset = 0 } = body

    const { data, error } = await supabase
      .from('financial_transactions')
      .select(`
        *,
        users (
          username,
          email
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching transactions:', error)
      return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error in admin transactions API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
