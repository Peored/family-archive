async function createInvite() {
  setError('')
  const cleanEmail = email.trim()
  if (cleanEmail && !/^\S+@\S+\.\S+$/.test(cleanEmail)) return setError('That email address does not look right')
  setSaving(true)
  const { data: { user } } = await supabase.auth.getUser()
  const family_id = scope === 'family' ? await getFamilyId() : null
  if (!user || (scope === 'family' && !family_id)) {
    setSaving(false)
    return setError('Could not find your archive. Please sign in again.')
  }
  const { data, error: err } = await supabase
    .from('invites')
    .insert([{
      kind: scope,
      family_id,
      role: scope === 'family' ? role : 'admin',
      email: cleanEmail || null,
      created_by: user.id,
    }])
    .select()
    .single()
  if (err || !data) {
    setSaving(false)
    return setError('Could not create the invite. Please try again.')
  }

  setEmail('')
  await fetchInvites()

  if (cleanEmail) {
    const { data: { session } } = await supabase.auth.getSession()
    try {
      const res = await fetch('/api/send-invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ inviteId: (data as Invite).id }),
      })
      if (res.ok) {
        showToast?.(`Invite emailed to ${cleanEmail}`)
      } else {
        showToast?.('Email failed, link copied instead', 'error')
        copy(data as Invite)
      }
    } catch {
      showToast?.('Email failed, link copied instead', 'error')
      copy(data as Invite)
    }
  } else {
    copy(data as Invite)
  }
  setSaving(false)
}