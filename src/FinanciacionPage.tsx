import { useState, useEffect, useMemo } from 'react'
import logo from './assets/logo-transparent.png'
import { getCarsAsync, type CarData } from './store'
import { SAMPLE_CARS } from './sample-cars'

const BLACK = '#0A0A0A'
const WHITE = '#FFFFFF'
const GOLD = '#C8952A'
const GRAY_BG = '#F7F7F7'
const BORDER = '#E8E8E8'
const MUTED = '#8A8A8A'
const F = "'Space Grotesk', sans-serif"
const FD = "'Barlow Condensed', sans-serif"

// TAE por plazo — valores orientativos de mercado (financieras de automoción España)
// Plazo corto → menor riesgo → menor TAE
const TAE_BY_MONTHS: Record<number, number> = {
  12:  5.99,
  24:  6.49,
  36:  6.99,
  48:  7.49,
  60:  7.99,
  72:  8.49,
  84:  8.99,
}
const PLAZOS = [12, 24, 36, 48, 60, 72, 84]

function calcCuota(precio: number, entrada: number, meses: number): number {
  const principal = precio - entrada
  if (principal <= 0 || meses <= 0) return 0
  const tae = TAE_BY_MONTHS[meses] ?? 7.99
  const r = tae / 100 / 12
  if (r === 0) return principal / meses
  return principal * (r * Math.pow(1 + r, meses)) / (Math.pow(1 + r, meses) - 1)
}

function fmt(n: number) {
  return n.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}
function fmtDec(n: number) {
  return n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

type AnyCar = CarData | typeof SAMPLE_CARS[0]

export default function FinanciacionPage() {
  const [cars, setCars] = useState<AnyCar[]>(SAMPLE_CARS)
  const [selectedId, setSelectedId] = useState<string>('custom')
  const [customPrice, setCustomPrice] = useState(20000)
  const [entrada, setEntrada] = useState(3000)
  const [meses, setMeses] = useState(60)

  useEffect(() => {
    window.scrollTo(0, 0)
    getCarsAsync()
      .then(all => { if (all.length > 0) setCars(all) })
      .catch(() => {})
  }, [])

  const selectedCar = cars.find(c => c.id === selectedId)
  const precio = selectedId === 'custom'
    ? customPrice
    : selectedCar ? parseFloat(String(selectedCar.price).replace(/[.,]/g, '').replace(',', '.')) || customPrice : customPrice

  const entradaMax = Math.max(0, precio - 1)
  const entradaSafe = Math.min(entrada, entradaMax)
  const principal = precio - entradaSafe
  const tae = TAE_BY_MONTHS[meses] ?? 7.99
  const cuota = useMemo(() => calcCuota(precio, entradaSafe, meses), [precio, entradaSafe, meses])
  const totalPagar = cuota * meses + entradaSafe
  const totalIntereses = totalPagar - precio

  const pctEntrada = precio > 0 ? Math.round((entradaSafe / precio) * 100) : 0

  function goBack() {
    window.location.hash = ''
    window.history.back()
  }

  return (
    <div style={{ backgroundColor: WHITE, minHeight: '100vh' }}>

      {/* Navbar */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: 'rgba(10,10,10,0.97)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <button onClick={goBack} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontFamily: F, fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', padding: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Volver
          </button>
          <a href="/" style={{ flexShrink: 0 }}>
            <img src={logo} alt="H&Y Motors" style={{ height: 100, width: 'auto', filter: 'invert(1)' }} />
          </a>
          <a href="tel:+34697271380" style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: GOLD, color: WHITE, fontFamily: F, fontWeight: 600, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', padding: '9px 18px', flexShrink: 0 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.69 12a19.79 19.79 0 01-3.07-8.67A2 2 0 013.6 1.27h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L7.91 9a16 16 0 006 6l1.09-1.09a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
            Llamar
          </a>
        </div>
      </nav>

      {/* Hero strip */}
      <div style={{ backgroundColor: BLACK, padding: 'clamp(40px,7vw,72px) clamp(20px,5vw,48px)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 28, height: 2, backgroundColor: GOLD }} />
            <span style={{ fontFamily: F, fontWeight: 500, fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>Financiación</span>
          </div>
          <h1 style={{ fontFamily: FD, fontWeight: 900, fontSize: 'clamp(2.4rem,6vw,4.5rem)', textTransform: 'uppercase', color: WHITE, lineHeight: 0.9, margin: '0 0 16px', letterSpacing: '-0.01em' }}>
            Calcula tu<br /><span style={{ color: GOLD }}>cuota mensual.</span>
          </h1>
          <p style={{ fontFamily: F, color: 'rgba(255,255,255,0.35)', fontSize: 14, lineHeight: 1.8, fontWeight: 300, margin: 0, maxWidth: 480 }}>
            Ajusta la entrada y el plazo para ver al instante cuánto pagarías al mes. Sin compromiso.
          </p>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: 'clamp(32px,5vw,64px) clamp(20px,5vw,48px)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'clamp(32px,5vw,64px)', alignItems: 'start' }}>

          {/* ── Left: Controls ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

            {/* Vehicle selector */}
            <div>
              <label style={{ display: 'block', fontFamily: F, fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: MUTED, marginBottom: 10 }}>
                Vehículo
              </label>
              <select
                value={selectedId}
                onChange={e => {
                  setSelectedId(e.target.value)
                  if (e.target.value !== 'custom') {
                    const c = cars.find(x => x.id === e.target.value)
                    if (c) {
                      const p = parseFloat(String(c.price).replace(/\./g, '').replace(',', '.')) || 20000
                      setEntrada(Math.round(p * 0.15))
                    }
                  }
                }}
                style={{ width: '100%', padding: '14px 16px', border: `1px solid ${BORDER}`, backgroundColor: WHITE, fontFamily: F, fontSize: 14, color: BLACK, outline: 'none', cursor: 'pointer', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 7L11 1' stroke='%236B6B6B' stroke-width='1.5'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center' }}
              >
                {cars.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.brand} {c.name} — {c.price ? `${c.price} €` : '—'}
                  </option>
                ))}
                <option value="custom">Otro precio (personalizado)</option>
              </select>

              {selectedId !== 'custom' && selectedCar && (
                <div style={{ marginTop: 10, padding: '12px 14px', backgroundColor: GRAY_BG, display: 'flex', gap: 12, alignItems: 'center' }}>
                  {selectedCar.thumbs?.[0] || selectedCar.images?.[0] ? (
                    <img src={selectedCar.thumbs?.[0] ?? selectedCar.images?.[0]} style={{ width: 72, height: 45, objectFit: 'contain', flexShrink: 0, backgroundColor: '#E0E0E0' }} />
                  ) : null}
                  <div>
                    <div style={{ fontFamily: FD, fontWeight: 700, fontSize: 15, color: BLACK, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{selectedCar.brand} {selectedCar.name}</div>
                    <div style={{ fontFamily: F, fontSize: 12, color: MUTED }}>{selectedCar.year} · {selectedCar.km} · {selectedCar.fuel}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Custom price */}
            {selectedId === 'custom' && (
              <div>
                <label style={{ display: 'block', fontFamily: F, fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: MUTED, marginBottom: 10 }}>
                  Precio del vehículo
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number" min={1000} max={300000} step={500}
                    value={customPrice}
                    onChange={e => { setCustomPrice(Number(e.target.value)); setEntrada(Math.round(Number(e.target.value) * 0.15)) }}
                    style={{ width: '100%', padding: '14px 40px 14px 16px', border: `1px solid ${BORDER}`, fontFamily: F, fontSize: 16, fontWeight: 600, color: BLACK, outline: 'none', boxSizing: 'border-box' }}
                  />
                  <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', fontFamily: F, fontSize: 14, color: MUTED }}>€</span>
                </div>
              </div>
            )}

            {/* Entrada slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
                <label style={{ fontFamily: F, fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: MUTED }}>Entrada</label>
                <span style={{ fontFamily: FD, fontWeight: 700, fontSize: 20, color: BLACK }}>{fmt(entradaSafe)} € <span style={{ fontFamily: F, fontSize: 11, color: MUTED, fontWeight: 400 }}>({pctEntrada}%)</span></span>
              </div>
              <input type="range" min={0} max={Math.max(0, precio - 1000)} step={500}
                value={entradaSafe}
                onChange={e => setEntrada(Number(e.target.value))}
                style={{ width: '100%', accentColor: GOLD, height: 4, cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                <span style={{ fontFamily: F, fontSize: 11, color: MUTED }}>0 €</span>
                <span style={{ fontFamily: F, fontSize: 11, color: MUTED }}>{fmt(Math.max(0, precio - 1000))} €</span>
              </div>
            </div>

            {/* Plazo selector */}
            <div>
              <label style={{ display: 'block', fontFamily: F, fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: MUTED, marginBottom: 10 }}>
                Plazo de financiación
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
                {PLAZOS.map(m => (
                  <button key={m} onClick={() => setMeses(m)} style={{
                    padding: '10px 4px',
                    backgroundColor: meses === m ? BLACK : GRAY_BG,
                    color: meses === m ? WHITE : MUTED,
                    border: meses === m ? `1px solid ${BLACK}` : `1px solid ${BORDER}`,
                    fontFamily: F, fontWeight: meses === m ? 600 : 400,
                    fontSize: 12, cursor: 'pointer', transition: 'all 0.15s',
                    textAlign: 'center',
                  }}>
                    {m}<br /><span style={{ fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.6 }}>mes</span>
                  </button>
                ))}
              </div>
            </div>

            {/* TAE info */}
            <div style={{ padding: '14px 16px', backgroundColor: GRAY_BG, borderLeft: `3px solid ${GOLD}` }}>
              <div style={{ fontFamily: F, fontSize: 11, color: MUTED, lineHeight: 1.7 }}>
                TAE aplicado para {meses} meses: <strong style={{ color: BLACK }}>{tae.toFixed(2)}%</strong><br />
                <span style={{ fontSize: 10 }}>Tipo orientativo. La TAE final depende del perfil del solicitante y la entidad financiera. Llámanos para condiciones personalizadas.</span>
              </div>
            </div>
          </div>

          {/* ── Right: Result ── */}
          <div style={{ position: 'sticky', top: 80 }}>

            {/* Main result card */}
            <div style={{ backgroundColor: BLACK, padding: 'clamp(28px,4vw,48px)', marginBottom: 2 }}>
              <div style={{ fontFamily: F, fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>Cuota mensual estimada</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                <span style={{ fontFamily: FD, fontWeight: 900, fontSize: 'clamp(3.5rem,8vw,5rem)', color: WHITE, lineHeight: 1 }}>{fmtDec(cuota)}</span>
                <span style={{ fontFamily: FD, fontWeight: 700, fontSize: 28, color: GOLD }}>€/mes</span>
              </div>
              <div style={{ fontFamily: F, fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 32 }}>durante {meses} meses · TAE {tae.toFixed(2)}%</div>

              {/* Breakdown */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Precio del vehículo', val: `${fmt(precio)} €` },
                  { label: 'Entrada', val: `${fmt(entradaSafe)} €`, muted: true },
                  { label: 'Importe financiado', val: `${fmt(principal)} €`, bold: true },
                  { label: 'Intereses totales', val: `${fmtDec(totalIntereses)} €`, accent: true },
                  { label: 'Total a pagar', val: `${fmtDec(totalPagar)} €`, bold: true },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: F, fontSize: 12, color: row.bold ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)', fontWeight: row.bold ? 500 : 300 }}>{row.label}</span>
                    <span style={{ fontFamily: F, fontSize: 13, fontWeight: row.bold ? 700 : 400, color: row.accent ? GOLD : row.bold ? WHITE : 'rgba(255,255,255,0.5)' }}>{row.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <a href="tel:+34697271380" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              backgroundColor: GOLD, color: WHITE,
              fontFamily: F, fontWeight: 700, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase',
              textDecoration: 'none', padding: '18px 24px',
              transition: 'background-color 0.15s',
            }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#A07820')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = GOLD)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.69 12a19.79 19.79 0 01-3.07-8.67A2 2 0 013.6 1.27h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L7.91 9a16 16 0 006 6l1.09-1.09a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
              Solicitar financiación — 697 271 380
            </a>

            {/* Disclaimer */}
            <p style={{ fontFamily: F, fontSize: 10, color: '#C0C0C0', lineHeight: 1.7, marginTop: 16, margin: '16px 0 0' }}>
              * Cálculo orientativo. La cuota definitiva puede variar según el perfil crediticio, la entidad financiera y las condiciones del contrato. H&Y Motors colabora con las principales entidades financieras para ofrecerte las mejores condiciones.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
