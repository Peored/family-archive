'use client'
import { useEffect, useState } from 'react'
import { getUserRole } from '@/lib/roles'

export function useRole() {
  const [role, setRole] = useState<'admin' | 'viewer' | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getUserRole().then(r => {
      setRole(r)
      setLoading(false)
    })
  }, [])

  return {
    role,
    loading,
    isAdmin: role === 'admin',
    isViewer: role === 'viewer'
  }
}