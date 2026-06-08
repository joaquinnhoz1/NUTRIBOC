export default function ReservaPendiente() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAF6EF', fontFamily: 'system-ui, sans-serif', padding: '20px' }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#fff3e0', color: '#e65100', fontSize: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>⏳</div>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 32, color: '#2C2A22', marginBottom: 12 }}>Pago pendiente</h1>
        <p style={{ color: '#5C584B', fontSize: 17, marginBottom: 32 }}>Tu pago está siendo procesado. Cuando se confirme, tu turno quedará reservado automáticamente.</p>
        <a href="/" style={{ background: '#6E7B52', color: '#FAF6EF', padding: '14px 28px', borderRadius: 50, fontWeight: 700, fontSize: 15 }}>Volver al inicio</a>
      </div>
    </main>
  )
}
