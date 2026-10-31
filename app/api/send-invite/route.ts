import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization') || ''
  const { inviteId } = await req.json().catch(() => ({}))
  if (!auth || !inviteId) return NextResponse.json({ error: 'Bad request' }, { status: 400 })

  // Act as the signed-in user, so only their own invites are visible
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: auth } } }
  )
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: invite } = await sb
    .from('invites')
    .select('token,email,created_by')
    .eq('id', inviteId)
    .single()

  if (!invite || invite.created_by !== user.id || !invite.email) {
    return NextResponse.json({ error: 'Invite not found' }, { status: 404 })
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin
  const link = `${origin}/join?token=${invite.token}`

  const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  })

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: invite.email,
      subject: "You've been invited to a Family Archive",
      text: `You've been invited to join a family archive.\n\nOpen this link to join (expires in 14 days):\n${link}`,
      html: `<p>You've been invited to join a family archive.</p>
             <p><a href="${link}">Accept your invitation</a></p>
             <p>This link expires in 14 days.</p>`,
    })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('send-invite failed', e)
    return NextResponse.json({ error: 'Email failed' }, { status: 500 })
  }
}