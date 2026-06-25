import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerSupabaseClient } from '@nudge/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const cookieStore = cookies();
  const supabase = createServerSupabaseClient({
    get(name: string) { return cookieStore.get(name)?.value; },
    set(name: string, value: string, options: Record<string, unknown>) { try { cookieStore.set(name, value, options); } catch {} },
    remove(name: string, options: Record<string, unknown>) { try { cookieStore.set(name, '', options); } catch {} },
  });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: rawStore, error } = await supabase
    .from('stores')
    .select('id, name, slug, status, ai_config, generation_started_at, generation_completed_at, generation_score')
    .eq('id', params.id)
    .eq('owner_id', user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!rawStore) {
    return NextResponse.json({ error: 'Store not found' }, { status: 404 });
  }

  const store = rawStore as any;

  const startedAt = store.generation_started_at;
  const completedAt = store.generation_completed_at;
  
  let elapsedSeconds = 0;
  if (startedAt) {
    const end = completedAt ? new Date(completedAt).getTime() : Date.now();
    elapsedSeconds = Math.max(0, Math.floor((end - new Date(startedAt).getTime()) / 1000));
  }

  const isCompleted = store.status !== 'generating';
  // If ai_config exists and has success property, check if it's true. If ai_config doesn't exist yet, it's not finished
  const isSuccess = store.ai_config ? (store.ai_config.success !== false) : null;

  return NextResponse.json({
    status: store.status,
    completed: isCompleted,
    success: isSuccess,
    error: store.ai_config?.error || null,
    elapsed_seconds: elapsedSeconds,
    preview_url: `/onboard/preview?store=${store.id}`,
    slug: store.slug
  });
}
