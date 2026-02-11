import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { first_name, last_name, email, city, cigar_brands, source } = body;

    if (!first_name || !last_name || !email || !city) {
      return NextResponse.json(
        { error: 'First name, last name, email, and city are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { error } = await supabase.from('leads').insert({
      first_name,
      last_name,
      email,
      city,
      cigar_brands: cigar_brands || null,
      source: source || 'homepage_popup',
    });

    if (error) {
      console.error('Failed to save lead:', error);
      return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Lead API error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
