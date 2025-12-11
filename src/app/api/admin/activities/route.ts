import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { getSupabase } from '@/lib/supabase/client'

// GET - List all activity types
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

    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('created_date', { ascending: false })

    if (error) {
      console.error('Error fetching activity types:', error)
      return NextResponse.json({ error: 'Failed to fetch activity types' }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error in activities API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new activity type
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

    const body = await req.json()
    const { name, category, minDuration, requiresDistance, requiresSteps, requiresHoles } = body

    if (!name || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = getSupabase()

    const { data, error } = await supabase
      .from('activities')
      .insert({
        activity_name: name,
        description: `${category} activity`
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating activity type:', error)
      return NextResponse.json({ error: 'Failed to create activity type' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in activities create API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Update activity type
export async function PATCH(req: NextRequest) {
  try {
    const session = (await getServerSession(authOptions as any)) as import('next-auth').Session | null
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = (session.user as any)?.role
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { id, updates } = body

    if (!id || !updates) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = getSupabase()

    const { data, error } = await supabase
      .from('activities')
      .update(updates)
      .eq('activity_id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating activity type:', error)
      return NextResponse.json({ error: 'Failed to update activity type' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in activities update API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete activity type
export async function DELETE(req: NextRequest) {
  try {
    const session = (await getServerSession(authOptions as any)) as import('next-auth').Session | null
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = (session.user as any)?.role
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing activity ID' }, { status: 400 })
    }

    const supabase = getSupabase()

    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('activity_id', id)

    if (error) {
      console.error('Error deleting activity type:', error)
      return NextResponse.json({ error: 'Failed to delete activity type' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in activities delete API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
