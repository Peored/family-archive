'use client'
import { useState } from 'react'

export function useToast() {
  const [toast, setToast] = useState<{message:string, type:'success'|'error'} | null>(null)

  function showToast(message: string, type: 'success'|'error' = 'success') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  return { toast, showToast }
}

export function Toast({ toast }: { toast: {message:string, type:'success'|'error'} | null }) {
  if (!toast) return null
  return (
    <div className={`fixed bottom-6 right-6 z-[999] px-6 py-4 border text-sm tracking-widest transition-all ${
      toast.type === 'success'
        ? 'bg-[#110E08] border-[#C9A84C] text-[#C9A84C]'
        : 'bg-[#110E08] border-red-700 text-red-400'
    }`}>
      {toast.type === 'success' ? '✦' : '✗'} &nbsp; {toast.message}
    </div>
  )
}