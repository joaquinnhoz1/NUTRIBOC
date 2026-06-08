import type { Metadata } from 'next'
import '../globals.css'
import './admin.css'
import { AdminNav } from '@/components/admin/AdminNav'

export const metadata: Metadata = { title: 'Panel Admin — NUTRIBOC' }

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="adm-shell">
      <AdminNav />
      <main className="adm-main">{children}</main>
    </div>
  )
}
