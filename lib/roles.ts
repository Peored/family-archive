import { supabase } from './supabase'

export async function getUserRole(): Promise<'admin' | 'viewer'> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 'viewer'

  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  return (data?.role as 'admin' | 'viewer') || 'viewer'
}