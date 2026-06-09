export default function ReservaError() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAF6EF', fontFamily: 'system-ui, sans-serif', padding: '20px' }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#fce4ec', color: '#c62828', fontSize: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>✕</div>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 32, color: '#2C2A22', marginBottom: 12 }}>El pago no se completó</h1>
        <p style={{ color: '#5C584B', fontSize: 16, marginBottom: 24, lineHeight: 1.6 }}>
          No se realizó ningún cargo. Esto puede ocurrir por fondos insuficientes, datos incorrectos o cancelación del pago.
        </p>
        <p style={{ color: '#5C584B', fontSize: 15, marginBottom: 32 }}>
          Podés intentarlo nuevamente o elegir pagar por transferencia bancaria.
        </p>
        <a href="/#agenda" style={{ background: '#6E7B52', color: '#FAF6EF', padding: '14px 28px', borderRadius: 50, fontWeight: 700, fontSize: 15, textDecoration: 'none', display: 'inline-block' }}>
          Volver a intentar
        </a>
      </div>
    </main>
  )
}
