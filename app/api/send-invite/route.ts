import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'

export const runtime = 'nodejs'

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization') || ''
  const { inviteId } = await req.json().catch(() => ({}))
  if (!auth || !inviteId) return NextResponse.json({ error: 'Bad request' }, { status: 400 })

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: auth } } }
  )
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: invite } = await sb
    .from('invites')
    .select('token,email,created_by,kind,family_id')
    .eq('id', inviteId)
    .single()

  if (!invite || invite.created_by !== user.id || !invite.email) {
    return NextResponse.json({ error: 'Invite not found' }, { status: 404 })
  }

  // Family name (only for relatives joining an existing archive)
  let familyName = ''
  if (invite.kind === 'family' && invite.family_id) {
    const { data: fam } = await sb.from('families').select('name').eq('id', invite.family_id).single()
    familyName = fam?.name || ''
  }

  // Inviter's name, if the account has one saved
  const meta = (user.user_metadata || {}) as Record<string, string>
  const inviter = meta.full_name || meta.name || ''

  const origin = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin
  const link = `${origin}/join?token=${invite.token}`

  const isFamily = invite.kind === 'family'
  const who = inviter || 'A family member'
  const subject = isFamily
    ? `${who} invited you to ${familyName || 'our family archive'}`
    : `${who} invited you to start your own family archive`

  const intro = isFamily
    ? `${who} has invited you to join ${familyName ? `the ${familyName} archive` : 'our family archive'}, a private place for our photos, stories and family tree.`
    : `${who} has invited you to start your own private family archive, a place for your photos, stories and family tree.`

  const text = `Hello,

${intro}

Open this link to join (it works once and expires in 14 days):
${link}

If you weren't expecting this, you can ignore this email.`

  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#222">
  <p>Hello,</p>
  <p>${esc(intro)}</p>
  <p>Open this link to join (it works once and expires in 14 days):<br>
  <a href="${link}">${link}</a></p>
  <p style="color:#777;font-size:13px">If you weren't expecting this, you can ignore this email.</p>
</div>`

  const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  })

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: invite.email,
      subject,
      text,
      html,
    })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('send-invite failed', e)
    return NextResponse.json({ error: 'Email failed' }, { status: 500 })
  }
}