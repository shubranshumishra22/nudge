import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Create user and auto-confirm email to bypass Supabase Auth default SMTP rate limits
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Send welcome/confirmation email via Resend
    // Obfuscating the Resend key inside code fallback is not strictly needed because we pull it from environment variables,
    // but we use process.env.RESEND_API_KEY as primary.
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Karoji <onboarding@resend.dev>',
            to: [email],
            subject: 'Welcome to Karoji!',
            html: `
              <div style="font-family: sans-serif; padding: 20px; color: #1a1a1a; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px;">
                <h2 style="color: #4F46E5;">Welcome to Karoji!</h2>
                <p>Hello,</p>
                <p>Your account has been successfully created and verified. You are ready to start building your AI-powered storefront.</p>
                <p>Log in anytime at: <a href="https://nudge.store/login" style="color: #4F46E5; text-decoration: none; font-weight: bold;">Karoji Dashboard</a></p>
                <br />
                <hr style="border: 0; border-top: 1px solid #eaeaea;" />
                <p style="font-size: 0.85em; color: #666;">Cheers,<br />The Karoji Team</p>
              </div>
            `
          }),
        })
      } catch (emailErr) {
        console.error('[Signup Email] Failed to send onboarding email:', emailErr)
      }
    }

    return NextResponse.json({ success: true, user: data.user })
  } catch (err) {
    console.error('[Signup Route] Error:', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal Server Error' }, { status: 500 })
  }
}
