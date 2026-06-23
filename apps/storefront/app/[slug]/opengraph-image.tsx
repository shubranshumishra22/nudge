import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'
export const alt = 'Nudge Store'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default async function Image({ params }: { params: { slug: string } }) {
  const { data: store } = await supabase.from('stores').select('id, name, tagline').eq('slug', params.slug).single()

  const name = store?.name || 'Nudge Store'
  const tagline = store?.tagline || ''
  let primaryColor = '#0F0F0E'

  if (store?.id) {
    const { data: theme } = await supabase.from('store_themes').select('primary_color').eq('store_id', store.id).single()
    if (theme?.primary_color) primaryColor = theme.primary_color
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: primaryColor,
          color: 'white',
          fontFamily: '"Instrument Serif", Georgia, serif',
          padding: '60px',
        }}
      >
        <div style={{ fontSize: 80, fontWeight: 700, letterSpacing: '-0.02em', textAlign: 'center', lineHeight: 1.1 }}>
          {name}
        </div>
        {tagline && (
          <div style={{ fontSize: 28, opacity: 0.85, marginTop: 20, textAlign: 'center', fontWeight: 400 }}>
            {tagline}
          </div>
        )}
        <div style={{ fontSize: 18, opacity: 0.6, marginTop: 50, textAlign: 'center', fontWeight: 400 }}>
          Powered by Nudge Commerce
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
