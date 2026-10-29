import { getActiveFamily } from './family'

// Fails closed: anyone without an explicit membership is a viewer.
export async function getUserRole(): Promise<'admin' | 'viewer'> {
  const active = await getActiveFamily()
  return active?.role === 'admin' ? 'admin' : 'viewer'
}
