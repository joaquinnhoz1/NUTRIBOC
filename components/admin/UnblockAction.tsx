'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function UnblockAction({ id }: { id: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function unblock() {
    setLoading(true)
    await fetch(`/api/admin/block-slot/${id}`, { method: 'DELETE' })
    setLoading(false)
    router.refresh()
  }

  return (
    <button className="adm-btn-danger" onClick={unblock} disabled={loading} style={{ fontSize: 12, padding: '6px 12px' }}>
      {loading ? '…' : 'Desbloquear'}
    </button>
  )
}
