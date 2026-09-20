import { useState, useEffect } from 'react'
import { getCarsAsync, type CarData } from './store'
import { SAMPLE_CARS } from './sample-cars'
import logo from './assets/logo-transparent.png'

const RED = '#C8952A'
const BLACK = '#0A0A0A'
const WHITE = '#FFFFFF'
const GRAY = '#F7F7F7'
const MUTED = '#6B6B6B'
const BORDER = '#E8E8E8'
const F = "'Space Grotesk', sans-serif"
const FD = "'Barlow Condensed', sans-serif"

type AnyCar = CarData | typeof SAMPLE_CARS[0]

function getImages(car: AnyCar): string[] {
  return car.images?.length ? car.images : []
}
function getThumbs(car: AnyCar): string[] {
  return (car as CarData).thumbs?.length ? (car as CarData).thumbs : getImages(car)
}

function goHome() {
  window.location.hash = ''
}

// ─── Image Gallery ────────────────────────────────────────────────────────────

function Gallery({ images, thumbs }: { images: string[]; thumbs: string[] }) {
  const [active, setActive] = useState(0)
  if (!images.length) return (
    <div style={{ width: '100%', aspectRatio: '16/9', backgroundColor: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontFamily: F, color: 'rgba(255,255,255,0.2)', fontSize: 14 }}>Sin imágenes</span>
    </div>
  )

  const prev = () => setActive(a => (a - 1 + images.length) % images.length)
  const next = () => setActive(a => (a + 1) % images.length)

  return (
    <div>
      {/* Main image */}
      <div style={{ position: 'relative', backgroundColor: '#111', overflow: 'hidden' }}>
        <img
          key={active}
          src={images[active]}
          alt=""
          style={{ width: '100%', aspectRatio: '16/9', objectFit: 'contain', display: 'block' }}
        />

        {/* Nav arrows */}
        {images.length > 1 && (
          <>
            <button onClick={prev} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 40, height: 40, borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', border: 'none', color: WHITE, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <button onClick={next} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 40, height: 40, borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', border: 'none', color: WHITE, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            </button>
            <div style={{ position: 'absolute', bottom: 12, right: 16, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', color: 'rgba(255,255,255,0.8)', fontFamily: F, fontSize: 11, padding: '4px 10px', borderRadius: 20 }}>
              {active + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div style={{ display: 'flex', gap: 6, padding: '8px 0', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {images.map((img, i) => (
            <button key={i} onClick={() => setActive(i)} style={{ flexShrink: 0, width: 80, height: 50, padding: 0, border: `2px solid ${i === active ? RED : 'transparent'}`, borderRadius: 4, overflow: 'hidden', cursor: 'pointer', opacity: i === active ? 1 : 0.5, transition: 'all 0.15s' }}>
              <img src={thumbs[i] ?? img} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Spec item ────────────────────────────────────────────────────────────────

function Spec({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  if (!value) return null
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderBottom: `1px solid ${BORDER}` }}>
      <div style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: GRAY, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: MUTED }}>
        {icon}
      </div>
      <div>
        <div style={{ fontFamily: F, color: '#C0C0C0', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 2 }}>{label}</div>
        <div style={{ fontFamily: F, color: BLACK, fontSize: 14, fontWeight: 500 }}>{value}</div>
      </div>
    </div>
  )
}

// ─── Financing Calculator ─────────────────────────────────────────────────────

const TAE_BY_MONTHS: Record<number, number> = { 12: 5.99, 24: 6.49, 36: 6.99, 48: 7.49, 60: 7.99, 72: 8.49, 84: 8.99 }
const PLAZOS = [12, 24, 36, 48, 60, 72, 84]

function parsePrice(raw: string): number {
  return parseFloat(raw.replace(/\./g, '').replace(',', '.')) || 0
}

function pmt(principal: number, annualRate: number, months: number): number {
  if (principal <= 0) return 0
  const r = annualRate / 100 / 12
  if (r === 0) return principal / months
  return principal * (r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1)
}

function FinancingCalc({ priceRaw, carName }: { priceRaw: string; carName: string }) {
  const total = parsePrice(priceRaw)
  const maxEntrada = Math.max(0, total - 1000)
  const [entrada, setEntrada] = useState(Math.round(maxEntrada * 0.2 / 500) * 500)
  const [plazo, setPlazo] = useState(48)

  const financiado = total - entrada
  const cuota = pmt(financiado, TAE_BY_MONTHS[plazo], plazo)
  const totalPagar = cuota * plazo
  const intereses = totalPagar - financiado

  const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div id="calc-financiacion" style={{ backgroundColor: '#0f0f0f', border: `1px solid rgba(200,149,42,0.2)`, padding: '28px 24px', marginTop: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ width: 24, height: 2, backgroundColor: RED }} />
        <span style={{ fontFamily: F, fontWeight: 500, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>Calcula tu financiación</span>
      </div>

      {/* Entrada */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontFamily: F, fontSize: 12, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Entrada</span>
          <span style={{ fontFamily: F, fontSize: 15, fontWeight: 600, color: WHITE }}>{entrada.toLocaleString('es-ES')} €</span>
        </div>
        <input type="range" min={0} max={maxEntrada} step={500} value={entrada}
          onChange={e => setEntrada(Number(e.target.value))}
          style={{ width: '100%', accentColor: RED, cursor: 'pointer' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ fontFamily: F, fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>0 €</span>
          <span style={{ fontFamily: F, fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>{maxEntrada.toLocaleString('es-ES')} €</span>
        </div>
      </div>

      {/* Plazo */}
      <div style={{ marginBottom: 24 }}>
        <span style={{ fontFamily: F, fontSize: 12, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 10 }}>Plazo</span>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {PLAZOS.map(m => (
            <button key={m} onClick={() => setPlazo(m)} style={{
              padding: '7px 14px', border: `1px solid ${m === plazo ? RED : 'rgba(255,255,255,0.1)'}`,
              backgroundColor: m === plazo ? RED : 'transparent',
              color: m === plazo ? WHITE : 'rgba(255,255,255,0.4)',
              fontFamily: F, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.15s',
            }}>{m}m</button>
          ))}
        </div>
      </div>

      {/* Resultado */}
      <div style={{ backgroundColor: 'rgba(255,255,255,0.04)', padding: '18px 20px', marginBottom: 16 }}>
        <div style={{ fontFamily: F, fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 6 }}>Cuota mensual estimada</div>
        <div style={{ fontFamily: FD, fontWeight: 900, fontSize: 42, color: RED, lineHeight: 1 }}>
          {fmt(cuota)} <span style={{ fontSize: 22 }}>€/mes</span>
        </div>
        <div style={{ fontFamily: F, fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: 4 }}>TAE {TAE_BY_MONTHS[plazo]}% · {plazo} meses</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 18 }}>
        {[
          { label: 'Financiado', value: `${fmt(financiado)} €` },
          { label: 'Intereses totales', value: `${fmt(intereses)} €` },
          { label: 'Total a pagar', value: `${fmt(totalPagar)} €` },
          { label: 'Importe entrada', value: `${entrada.toLocaleString('es-ES')} €` },
        ].map(({ label, value }) => (
          <div key={label} style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '10px 14px' }}>
            <div style={{ fontFamily: F, fontSize: 10, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>{label}</div>
            <div style={{ fontFamily: F, fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>{value}</div>
          </div>
        ))}
      </div>

      <a href={`https://wa.me/34697271380?text=Hola, me interesa financiar el ${carName}. Precio: ${priceRaw}€, entrada: ${entrada.toLocaleString('es-ES')}€, plazo: ${plazo} meses.`}
        target="_blank" rel="noopener noreferrer"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', backgroundColor: RED, color: WHITE, fontFamily: F, fontWeight: 600, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>
        Solicitar financiación
      </a>
      <p style={{ fontFamily: F, fontSize: 10, color: 'rgba(255,255,255,0.18)', textAlign: 'center', marginTop: 10, margin: '10px 0 0' }}>
        Cálculo orientativo. Sujeto a aprobación de la entidad financiera.
      </p>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CarDetail({ id }: { id: string }) {
  const [car, setCar] = useState<AnyCar | null>(null)

  useEffect(() => {
    getCarsAsync().then(all => {
      const stored = all.find(c => c.id === id)
      if (stored) { setCar(stored); return }
      const sample = SAMPLE_CARS.find(c => c.id === id)
      if (sample) setCar(sample)
    })
  }, [id])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  if (!car) return (
    <div style={{ minHeight: '100vh', backgroundColor: BLACK, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: F, color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>Vehículo no encontrado</div>
    </div>
  )

  const images = getImages(car)
  const thumbs = getThumbs(car)
  const badge = car.badge || ''

  return (
    <div style={{ backgroundColor: WHITE, minHeight: '100vh' }}>

      {/* Navbar */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: 'rgba(10,10,10,0.97)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <button onClick={goHome} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontFamily: F, fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', padding: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Volver
          </button>
          <a href="/" style={{ flexShrink: 0 }}>
            <img src={logo} alt="H&Y Motors" style={{ height: 100, width: 'auto', filter: 'invert(1)' }} />
          </a>
          <a href="tel:+34697271380" style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: RED, color: WHITE, fontFamily: F, fontWeight: 600, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', padding: '9px 18px', flexShrink: 0 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.69 12a19.79 19.79 0 01-3.07-8.67A2 2 0 013.6 1.27h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L7.91 9a16 16 0 006 6l1.09-1.09a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
            Llamar
          </a>
        </div>
      </nav>

      {/* Banner VENDIDO — visible solo si está vendido, SEO-friendly */}
      {(car as any).sold && (
        <div style={{ backgroundColor: '#C8952A', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
            <span style={{ fontFamily: FD, fontWeight: 900, fontSize: 20, textTransform: 'uppercase', letterSpacing: '0.08em', color: BLACK }}>Este vehículo ha sido vendido</span>
          </div>
          <a href={`https://wa.me/34697271380?text=Hola, vi el ${car.brand} ${car.name} y ya está vendido. ¿Tenéis algo similar disponible?`}
            target="_blank" rel="noopener noreferrer"
            style={{ backgroundColor: BLACK, color: WHITE, fontFamily: F, fontWeight: 600, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', padding: '8px 18px', whiteSpace: 'nowrap' }}>
            Buscar uno similar
          </a>
        </div>
      )}

      {/* Header — dark band */}
      <div style={{ backgroundColor: BLACK, padding: '32px 20px 28px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          {badge && (
            <span style={{ display: 'inline-block', backgroundColor: RED, color: WHITE, fontFamily: F, fontWeight: 600, fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', padding: '4px 12px', marginBottom: 12 }}>
              {badge}
            </span>
          )}
          <div style={{ fontFamily: F, color: 'rgba(255,255,255,0.3)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: 8 }}>
            {car.brand} · {car.year}
          </div>
          <h1 style={{ fontFamily: FD, fontWeight: 900, fontSize: 'clamp(2rem, 5vw, 3.6rem)', textTransform: 'uppercase', color: WHITE, lineHeight: 0.95, margin: '0 0 20px', letterSpacing: '-0.01em' }}>
            {car.name}
          </h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 20px' }}>
            {[car.km, car.fuel, car.trans, car.hp].filter(Boolean).map(v => (
              <span key={v} style={{ fontFamily: F, color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>{v}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '0 64px', alignItems: 'start' }}>

          {/* Left: gallery + description */}
          <div style={{ paddingTop: 32, paddingBottom: 48 }}>
            <Gallery images={images} thumbs={thumbs} />

            {car.description && (
              <div style={{ marginTop: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 24, height: 2, backgroundColor: RED }} />
                  <span style={{ fontFamily: F, fontWeight: 500, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: MUTED }}>Descripción</span>
                </div>
                <p style={{ fontFamily: F, color: '#444', fontSize: 15, lineHeight: 1.85, margin: 0, fontWeight: 300, whiteSpace: 'pre-wrap' }}>
                  {car.description}
                </p>
              </div>
            )}
          </div>

          {/* Right: specs + price + CTA */}
          <div style={{ paddingTop: 32, paddingBottom: 48 }}>

            {/* Price card */}
            <div style={{ backgroundColor: BLACK, padding: '24px 28px', marginBottom: 24 }}>
              <div style={{ fontFamily: F, color: 'rgba(255,255,255,0.3)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6 }}>Precio de venta</div>
              <div style={{ fontFamily: FD, fontWeight: 900, fontSize: 52, color: WHITE, lineHeight: 1, marginBottom: 4 }}>
                {car.price} <span style={{ fontSize: 28 }}>€</span>
              </div>
              <div style={{ fontFamily: F, color: 'rgba(255,255,255,0.2)', fontSize: 11, marginBottom: 24 }}>IVA incluido · Financiación disponible</div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <a href={`https://wa.me/34697271380?text=Hola, estoy interesado en el ${car.brand} ${car.name} (${car.year}). ¿Está disponible?`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '14px', backgroundColor: '#25D366', color: WHITE, fontFamily: F, fontWeight: 600, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.557 4.115 1.528 5.84L.057 23.454a.5.5 0 00.603.602l5.694-1.473A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.95 9.95 0 01-5.073-1.384l-.361-.214-3.742.968.992-3.659-.235-.374A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
                  Consultar por WhatsApp
                </a>
                <button
                  onClick={() => document.getElementById('calc-financiacion')?.scrollIntoView({ behavior: 'smooth' })}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', backgroundColor: '#C8952A', color: '#0A0A0A', border: 'none', fontFamily: F, fontWeight: 700, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v20M2 12h20"/><circle cx="12" cy="12" r="10"/></svg>
                  Calcular financiación
                </button>
                <a href="tel:+34697271380" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)', fontFamily: F, fontWeight: 500, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.69 12a19.79 19.79 0 01-3.07-8.67A2 2 0 013.6 1.27h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L7.91 9a16 16 0 006 6l1.09-1.09a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
                  697 271 380
                </a>
              </div>
            </div>

            {/* Specs */}
            <div style={{ backgroundColor: WHITE, border: `1px solid ${BORDER}`, padding: '4px 20px 0' }}>
              <div style={{ fontFamily: F, fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.18em', color: MUTED, padding: '16px 0 4px' }}>Ficha técnica</div>

              <Spec label="Año" value={String(car.year)} icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              } />
              <Spec label="Kilómetros" value={car.km} icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              } />
              <Spec label="Combustible" value={car.fuel} icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 22V9l7-7 7 7v13H3z"/><path d="M9 22V12h4v10"/><path d="M19 8h2a1 1 0 011 1v4a1 1 0 01-1 1h-2"/></svg>
              } />
              <Spec label="Transmisión" value={car.trans} icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="5" cy="12" r="2"/><circle cx="19" cy="5" r="2"/><circle cx="19" cy="19" r="2"/><path d="M7 12h10M19 7v5M19 14v3"/></svg>
              } />
              <Spec label="Potencia" value={car.hp} icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              } />
              <Spec label="Marca" value={car.brand} icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8l4 4-4 4-4-4 4-4z"/></svg>
              } />
            </div>

            {/* Import badge */}
            <div style={{ marginTop: 16, backgroundColor: GRAY, border: `1px solid ${BORDER}`, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 22 }}>🇩🇪</span>
              <div>
                <div style={{ fontFamily: F, fontWeight: 600, fontSize: 13, color: BLACK }}>Importado de Alemania</div>
                <div style={{ fontFamily: F, fontSize: 11, color: MUTED, marginTop: 2 }}>Inspección técnica, transporte y matriculación incluidos</div>
              </div>
            </div>

            {/* Financing calculator — only if not sold */}
            {!(car as any).sold && <FinancingCalc priceRaw={car.price} carName={`${car.brand} ${car.name}`} />}
          </div>
        </div>
      </div>

      {/* Bottom CTA strip */}
      <div style={{ backgroundColor: BLACK, padding: '40px 20px', borderTop: `3px solid ${RED}` }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: FD, fontWeight: 900, fontSize: 28, textTransform: 'uppercase', color: WHITE, lineHeight: 1 }}>¿Te interesa este vehículo?</div>
            <div style={{ fontFamily: F, color: 'rgba(255,255,255,0.35)', fontSize: 13, marginTop: 6 }}>Contacta ahora y te respondemos en menos de 1 hora.</div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <a href={`https://wa.me/34697271380?text=Hola, me interesa el ${car.brand} ${car.name}`} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 28px', backgroundColor: '#25D366', color: WHITE, fontFamily: F, fontWeight: 600, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>
              WhatsApp
            </a>
            <a href="tel:+34697271380" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 28px', border: '1px solid rgba(255,255,255,0.15)', color: WHITE, fontFamily: F, fontWeight: 500, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>
              697 271 380
            </a>
          </div>
        </div>
      </div>

      {/* Footer minimal */}
      <div style={{ backgroundColor: BLACK, borderTop: '1px solid rgba(255,255,255,0.05)', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <span style={{ fontFamily: F, color: 'rgba(255,255,255,0.12)', fontSize: 11 }}>© 2025 H&Y Motors · hymotors.es</span>
        <button onClick={goHome} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', fontFamily: F, fontSize: 11, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.12em' }}>← Volver al catálogo</button>
      </div>
    </div>
  )
}
