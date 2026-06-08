import { getSettings } from '@/lib/settings'
import { SettingsForm } from '@/components/admin/SettingsForm'

export default async function SettingsPage() {
  const settings = await getSettings()

  return (
    <>
      <div className="adm-page-header">
        <h1>Configuración</h1>
        <p>Datos del sitio, formas de pago y seguridad</p>
      </div>
      <SettingsForm settings={settings} />
    </>
  )
}
