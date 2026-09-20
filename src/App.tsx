import { useState, useEffect } from 'react'
import logo from './assets/logo-transparent.png'
import golf6Hero from './assets/hero-desktop.jpg'
import golf6HeroMobile from './assets/hero-mobile.jpg'
import { getCarsAsync, type CarData } from './store'
import { SAMPLE_CARS } from './sample-cars'

// ─── Constants ────────────────────────────────────────────────────────────────

const RED = '#C8952A'
const BLACK = '#0A0A0A'
const WHITE = '#FFFFFF'
const GRAY_BG = '#F7F7F7'
const GRAY_TEXT = '#6B6B6B'
const BORDER = '#E8E8E8'

const F_DISPLAY = "'Barlow Condensed', sans-serif"
const F_BODY = "'Space Grotesk', sans-serif"

// ─── Data ────────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: 'Vehículos', href: '#vehiculos' },
  { label: 'Importación', href: '#importacion' },
  { label: 'Financiación', href: '#financiacion-calc' },
  { label: 'Vende tu coche', href: '#vende' },
  { label: 'Contacto', href: '#contacto' },
]

const CARS = SAMPLE_CARS

const STATS = [
  { value: '+300', label: 'Coches vendidos' },
  { value: '+3', label: 'Años de experiencia' },
  { value: '100%', label: 'Clientes satisfechos' },
  { value: 'Financiación', label: 'a medida' },
]

// ─── Shared UI ────────────────────────────────────────────────────────────────

function Label({ text, light = false }: { text: string; light?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
      <div style={{ width: 28, height: 2, backgroundColor: light ? 'rgba(255,255,255,0.3)' : RED, flexShrink: 0 }} />
      <span style={{
        fontFamily: F_BODY, fontWeight: 500, fontSize: 10,
        letterSpacing: '0.22em', textTransform: 'uppercase',
        color: light ? 'rgba(255,255,255,0.4)' : GRAY_TEXT,
      }}>
        {text}
      </span>
    </div>
  )
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const lk: React.CSSProperties = {
    color: 'rgba(255,255,255,0.38)',
    textDecoration: 'none',
    fontFamily: F_BODY,
    fontWeight: 500,
    fontSize: 11,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    transition: 'color 0.15s',
    whiteSpace: 'nowrap',
  }

  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 200, backgroundColor: scrolled ? 'rgba(10,10,10,0.97)' : BLACK, backdropFilter: 'blur(20px)', transition: 'background-color 0.3s' }}>

      {/* ── Top contact strip (desktop only) ── */}
      <div className="hide-mobile" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: 36, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: F_BODY, fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>
            Av. de Fuenlabrada 62, 28970 Humanes de Madrid
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <span style={{ fontFamily: F_BODY, fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>Lun–Vie 9:00–14:00 y 16:00–19:00</span>
            <span style={{ width: 1, height: 10, backgroundColor: 'rgba(255,255,255,0.1)' }} />
            <a href="mailto:info@hymotors.es" style={{ fontFamily: F_BODY, fontSize: 11, color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>info@hymotors.es</a>
            <span style={{ width: 1, height: 10, backgroundColor: 'rgba(255,255,255,0.1)' }} />
            <a href="tel:+34697271380" style={{ fontFamily: F_BODY, fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}>697 271 380</a>
          </div>
        </div>
      </div>

      {/* ── Main nav bar ── */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>

        {/* Desktop */}
        <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>
          <a href="#" style={{ display: 'flex', alignItems: 'center', flexShrink: 0, marginRight: 40 }}>
            <img src={logo} alt="H&Y Motors" style={{ height: 100, width: 'auto', filter: 'invert(1)' }} />
          </a>

          <div style={{ display: 'flex', alignItems: 'center', gap: 24, flex: 1 }}>
            {NAV_LINKS.map(l => (
              <a key={l.href} href={l.href} style={lk}
                onMouseEnter={e => (e.currentTarget.style.color = WHITE)}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.38)')}>
                {l.label}
              </a>
            ))}
          </div>

          <a href="tel:+34697271380" style={{
            backgroundColor: RED, color: WHITE,
            fontFamily: F_BODY, fontWeight: 600,
            fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase',
            textDecoration: 'none', padding: '10px 22px',
            display: 'flex', alignItems: 'center', gap: 8,
            flexShrink: 0, transition: 'background-color 0.15s',
          }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#A07820')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = RED)}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.69 12a19.79 19.79 0 01-3.07-8.67A2 2 0 013.6 1.27h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L7.91 9a16 16 0 006 6l1.09-1.09a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
            </svg>
            Llamar ahora
          </a>
        </div>

        {/* Mobile */}
        <div className="show-mobile" style={{ display: 'none', alignItems: 'center', justifyContent: 'space-between', height: 72, gap: 12 }}>
          <a href="#" style={{ flexShrink: 0 }}>
            <img src={logo} alt="H&Y Motors" style={{ height: 76, width: 'auto', filter: 'invert(1)' }} />
          </a>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, overflow: 'hidden' }}>
            <div style={{ width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, overflow: 'hidden' }}>
              <a href="tel:+34697271380" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.69 12a19.79 19.79 0 01-3.07-8.67A2 2 0 013.6 1.27h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L7.91 9a16 16 0 006 6l1.09-1.09a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                </svg>
                <span style={{ fontFamily: F_DISPLAY, fontWeight: 700, fontSize: 15, color: WHITE, letterSpacing: '0.04em', lineHeight: 1 }}>697 271 380</span>
              </a>
              <span style={{ fontFamily: F_BODY, fontSize: 10, color: 'rgba(255,255,255,0.25)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Humanes de Madrid · L–V 9–14h y 16–19h
              </span>
            </div>
          </div>

          <button onClick={() => setOpen(!open)} style={{ background: 'none', border: 'none', color: WHITE, cursor: 'pointer', padding: 4, flexShrink: 0 }} aria-label="Menú">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              {open ? <path d="M18 6L6 18M6 6l12 12" /> : <><line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/></>}
            </svg>
          </button>
        </div>

        {open && (
          <div className="show-mobile" style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid rgba(255,255,255,0.06)', paddingBottom: 16 }}>
            {NAV_LINKS.map(l => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} style={{
                display: 'block', padding: '13px 0', color: 'rgba(255,255,255,0.4)',
                textDecoration: 'none', fontFamily: F_BODY, fontWeight: 500,
                fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
              }}>{l.label}</a>
            ))}
            <a href="tel:+34697271380" style={{
              display: 'block', marginTop: 14, padding: '13px 0', textAlign: 'center',
              backgroundColor: RED, color: WHITE, textDecoration: 'none',
              fontFamily: F_BODY, fontWeight: 600, fontSize: 13,
              letterSpacing: '0.12em', textTransform: 'uppercase',
            }}>697 271 380</a>
          </div>
        )}
      </div>
    </nav>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <>
      <section style={{ position: 'relative', height: 'clamp(600px, 85vh, 860px)', overflow: 'hidden', backgroundColor: '#111' }}>
        {/* Desktop hero */}
        <img
          src={golf6Hero}
          alt="Golf GTI y SUV en showroom — H&Y Motors importación"
          className="hero-desktop"
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: '70% center',
            opacity: 0.92,
            filter: 'brightness(0.88) contrast(1.05)',
          }}
        />
        {/* Mobile hero — sin recorte, coches centrados */}
        <img
          src={golf6HeroMobile}
          alt="Volkswagen Golf GTI 35 Aniversario importado de Alemania"
          className="hero-mobile"
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'contain', objectPosition: 'center center',
            opacity: 0.72,
            filter: 'brightness(0.9) contrast(1.05) saturate(0.9)',
          }}
        />

        {/* Gradiente: izquierda opaca para texto, derecha transparente para coches */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(10,10,10,0.85) 0%, rgba(10,10,10,0.55) 38%, rgba(10,10,10,0.05) 62%, transparent 100%)' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '18%', background: 'linear-gradient(to bottom, rgba(10,10,10,0.95), transparent)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 180, background: 'linear-gradient(to bottom, transparent, #0A0A0A)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, backgroundColor: RED }} />

        <div style={{ position: 'relative', height: '100%', maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: 'clamp(56px, 8vh, 100px)' }}>
          <div style={{ maxWidth: 560 }}>
            <Label text="Importación directa · Alemania" light />
            <h1 style={{
              fontFamily: F_DISPLAY, fontWeight: 900,
              fontSize: 'clamp(3.4rem, 7vw, 6.4rem)',
              lineHeight: 0.88, textTransform: 'uppercase',
              color: WHITE, margin: '0 0 28px', letterSpacing: '-0.01em',
            }}>
              Tu próximo coche<br />viene de<br />
              <span style={{ color: RED }}>Alemania.</span>
            </h1>
            <p style={{
              color: 'rgba(255,255,255,0.6)', fontSize: 14,
              lineHeight: 1.9, fontWeight: 300, marginBottom: 40,
              maxWidth: 420, fontFamily: F_BODY, letterSpacing: '0.01em',
            }}>
              Seleccionamos vehículos premium en el mercado alemán y los traemos listos para circular. Inspección, transporte y matriculación incluidos.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <a href="#vehiculos" style={{
                backgroundColor: RED, color: WHITE,
                fontFamily: F_BODY, fontWeight: 600,
                fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase',
                textDecoration: 'none', padding: '14px 38px',
                transition: 'background-color 0.15s',
              }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#A07820')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = RED)}>
                Ver stock
              </a>
              <a href="#importacion" style={{
                border: '1px solid rgba(255,255,255,0.22)', color: 'rgba(255,255,255,0.8)',
                fontFamily: F_BODY, fontWeight: 500,
                fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase',
                textDecoration: 'none', padding: '14px 38px',
                transition: 'all 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = WHITE; e.currentTarget.style.color = WHITE }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)' }}>
                Importación a medida
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats scroll */}
      <div style={{ backgroundColor: BLACK, borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="stats-scroll">
          {STATS.map((s, i) => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '18px 28px', whiteSpace: 'nowrap', borderRight: i < STATS.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none', flexShrink: 0 }}>
              <span style={{ fontFamily: F_DISPLAY, fontWeight: 900, fontSize: 26, color: WHITE, lineHeight: 1 }}>{s.value}</span>
              <span style={{ fontFamily: F_BODY, color: 'rgba(255,255,255,0.28)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 500 }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

// ─── Cars Section ─────────────────────────────────────────────────────────────

type AnyCarData = typeof CARS[0] | CarData

function CarCard({ car }: { car: AnyCarData }) {
  const [hovered, setHovered] = useState(false)

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: WHITE,
        border: `1px solid ${hovered ? '#CCC' : BORDER}`,
        display: 'flex', flexDirection: 'column',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxShadow: hovered ? '0 12px 48px rgba(0,0,0,0.1)' : 'none',
      }}
    >
      <div style={{ position: 'relative', aspectRatio: '16/10', overflow: 'hidden', backgroundColor: '#111' }}>
        <img
          src={car.thumbs?.[0] ?? car.images?.[0] ?? ''} alt={`${car.brand} ${car.name}`} loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', transition: 'transform 0.6s ease', transform: hovered ? 'scale(1.05)' : 'scale(1)' }}
        />
        {/* Dark scrim at bottom of image */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%', background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.22))' }} />
        {car.badge != null && car.badge !== '' && (
          <span style={{
            position: 'absolute', top: 0, left: 0,
            backgroundColor: RED, color: WHITE,
            fontFamily: F_BODY, fontWeight: 600,
            fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase',
            padding: '5px 12px',
          }}>{car.badge}</span>
        )}
        {/* German import tag */}
        <span style={{
          position: 'absolute', bottom: 12, right: 12,
          backgroundColor: 'rgba(10,10,10,0.72)', backdropFilter: 'blur(4px)',
          color: 'rgba(255,255,255,0.7)',
          fontFamily: F_BODY, fontWeight: 500,
          fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase',
          padding: '4px 10px',
        }}>🇩🇪 Import</span>
      </div>

      <div style={{ padding: '20px 20px 22px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ fontFamily: F_BODY, color: '#C0C0C0', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 5, fontWeight: 500 }}>
          {car.brand} · {car.year}
        </div>
        <h3 style={{ fontFamily: F_DISPLAY, fontWeight: 800, fontSize: 20, textTransform: 'uppercase', color: BLACK, lineHeight: 1.05, margin: '0 0 14px', letterSpacing: '0.01em' }}>
          {car.name}
        </h3>

        {/* Specs row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 0', marginBottom: 18 }}>
          {[car.km, car.trans, car.fuel, car.hp].map((v, i, arr) => (
            <span key={v} style={{ fontFamily: F_BODY, color: GRAY_TEXT, fontSize: 12, fontWeight: 400 }}>
              {v}{i < arr.length - 1 && <span style={{ color: '#CCC', margin: '0 8px' }}>·</span>}
            </span>
          ))}
        </div>

        <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{ fontFamily: F_BODY, color: '#C0C0C0', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 2, fontWeight: 500 }}>Precio</div>
            <div style={{ fontFamily: F_DISPLAY, fontWeight: 900, fontSize: 26, color: BLACK, lineHeight: 1 }}>{car.price} <span style={{ fontSize: 16 }}>€</span></div>
          </div>
          <a href={`#coche-${car.id}`} style={{
            backgroundColor: BLACK, color: WHITE,
            fontFamily: F_BODY, fontWeight: 600,
            fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase',
            textDecoration: 'none', padding: '10px 20px',
            transition: 'background-color 0.15s',
          }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = RED)}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = BLACK)}>
            Ver ficha
          </a>
        </div>
      </div>
    </article>
  )
}

function CarsSection() {
  const [filter, setFilter] = useState<'todos' | 'gti' | 'turismo' | 'suv' | 'furgoneta' | 'otros'>('todos')
  const [source, setSource] = useState<AnyCarData[]>(CARS)

  useEffect(() => {
    getCarsAsync()
      .then(all => {
        const active = all.filter(c => c.active && !c.sold)
        if (active.length > 0) setSource(active)
      })
      .catch(() => {/* keep showing sample cars */})
  }, [])

  const filtered = (filter === 'todos' ? source : source.filter(c => c.type === filter)) as AnyCarData[]

  return (
    <section id="vehiculos" style={{ backgroundColor: WHITE, padding: '88px 0 100px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px 32px', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 52 }}>
          <div>
            <Label text="Stock disponible" />
            <h2 style={{ fontFamily: F_DISPLAY, fontWeight: 900, fontSize: 'clamp(2.6rem, 4.5vw, 4rem)', textTransform: 'uppercase', color: BLACK, lineHeight: 0.9, margin: 0, letterSpacing: '-0.01em' }}>
              Vehículos<br />en stock
            </h2>
          </div>

          <div style={{ display: 'flex', overflow: 'hidden', border: `1px solid ${BORDER}`, flexWrap: 'wrap' }}>
            {([
              { key: 'todos', label: 'Todos' },
              { key: 'gti', label: 'Golf / GTI' },
              { key: 'turismo', label: 'Turismo' },
              { key: 'suv', label: 'SUV / 4x4' },
              { key: 'furgoneta', label: 'Furgoneta' },
              { key: 'otros', label: 'Otros' },
            ] as const).map(({ key, label }, i, arr) => (
              <button key={key} onClick={() => setFilter(key)} style={{
                backgroundColor: filter === key ? BLACK : 'transparent',
                color: filter === key ? WHITE : GRAY_TEXT,
                border: 'none',
                borderRight: i < arr.length - 1 ? `1px solid ${BORDER}` : 'none',
                fontFamily: F_BODY, fontWeight: 600,
                fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase',
                padding: '10px 18px', cursor: 'pointer', transition: 'all 0.15s',
              }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {filtered.map(car => <CarCard key={String(car.id)} car={car} />)}
        </div>

        <div style={{ marginTop: 52, borderTop: `1px solid ${BORDER}`, paddingTop: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <p style={{ fontFamily: F_BODY, color: '#AAA', fontSize: 13, margin: 0 }}>¿No encuentras lo que buscas? Importamos cualquier vehículo a medida.</p>
          <a href="#importacion" style={{ color: RED, fontFamily: F_BODY, fontWeight: 600, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
            Importación a la carta
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>
      </div>
    </section>
  )
}

// ─── Services — editorial list layout ─────────────────────────────────────────

function ServicesSection() {
  const services = [
    {
      num: '01',
      title: 'Importación a la carta',
      desc: 'Buscamos el vehículo exacto que quieres en Alemania, Francia o Bélgica. Gestión completa: búsqueda, inspección técnica, transporte y matriculación en España.',
      tag: 'Alemania · Francia · Bélgica',
    },
    {
      num: '02',
      title: 'Financiación flexible',
      desc: 'Colaboramos con las principales entidades financieras para ofrecerte condiciones competitivas. Respuesta en 24 horas.',
      tag: 'Desde 0% TAE',
    },
    {
      num: '03',
      title: 'Compramos tu coche',
      desc: 'Valoramos tu vehículo al instante y al mejor precio del mercado. Pago inmediato sin esperas, con toda la gestión documental incluida.',
      tag: 'Pago en 24h',
    },
  ]

  return (
    <section id="importacion" style={{ backgroundColor: BLACK, padding: 'clamp(64px,10vw,100px) 0' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(20px,5vw,48px)' }}>

        {/* Header */}
        <div style={{ marginBottom: 'clamp(40px,7vw,72px)' }}>
          <Label text="Nuestros servicios" light />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px 64px', alignItems: 'flex-end' }}>
            <h2 style={{ fontFamily: F_DISPLAY, fontWeight: 900, fontSize: 'clamp(2.4rem,6vw,4.2rem)', textTransform: 'uppercase', color: WHITE, lineHeight: 0.9, margin: 0, letterSpacing: '-0.01em' }}>
              Más que un<br />concesionario.
            </h2>
            <p style={{ fontFamily: F_BODY, color: 'rgba(255,255,255,0.3)', fontSize: 13, lineHeight: 1.9, fontWeight: 300, margin: 0, maxWidth: 380 }}>
              Más de 3 años especializados en la importación de vehículos europeos. Transparencia total, sin letra pequeña.
            </p>
          </div>
        </div>

        {/* Service rows */}
        <div>
          {services.map(s => (
            <div key={s.num} style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: 'clamp(24px,4vw,36px) 0' }}>
              {/* Mobile: stacked. Desktop: row via flex */}
              <div style={{ display: 'flex', gap: '16px 40px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                <div style={{ fontFamily: F_DISPLAY, fontWeight: 900, fontSize: 11, color: RED, letterSpacing: '0.14em', paddingTop: 4, minWidth: 32 }}>{s.num}</div>
                <div style={{ flex: '1 1 240px', minWidth: 0 }}>
                  <h3 style={{ fontFamily: F_DISPLAY, fontWeight: 700, fontSize: 'clamp(18px,3vw,22px)', textTransform: 'uppercase', color: WHITE, lineHeight: 1.1, margin: '0 0 10px', letterSpacing: '0.01em' }}>
                    {s.title}
                  </h3>
                  <p style={{ fontFamily: F_BODY, color: 'rgba(255,255,255,0.35)', fontSize: 13, lineHeight: 1.85, margin: 0, fontWeight: 300 }}>
                    {s.desc}
                  </p>
                </div>
                <div style={{ fontFamily: F_BODY, fontSize: 9, color: 'rgba(255,255,255,0.18)', textTransform: 'uppercase', letterSpacing: '0.16em', fontWeight: 500, whiteSpace: 'nowrap', paddingTop: 4, alignSelf: 'flex-start' }}>
                  {s.tag}
                </div>
              </div>
            </div>
          ))}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }} />
        </div>
      </div>
    </section>
  )
}

// ─── Import CTA ───────────────────────────────────────────────────────────────

function ImportBanner() {
  return (
    <section style={{ backgroundColor: '#0D0D0D', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: 'clamp(56px,9vw,108px) clamp(20px,5vw,48px)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 'clamp(36px,6vw,80px)', alignItems: 'center' }}>
          <div>
            <Label text="Importación a medida" light />
            <h2 style={{ fontFamily: F_DISPLAY, fontWeight: 900, fontSize: 'clamp(2.4rem,6vw,5rem)', textTransform: 'uppercase', color: WHITE, lineHeight: 0.88, margin: 0, letterSpacing: '-0.01em' }}>
              ¿Buscas algo<br />concreto<br /><span style={{ color: RED }}>en Alemania?</span>
            </h2>
          </div>
          <div>
            <p style={{ fontFamily: F_BODY, color: 'rgba(255,255,255,0.38)', fontSize: 14, lineHeight: 1.9, fontWeight: 300, margin: '0 0 32px' }}>
              Dinos la marca, modelo, año y equipamiento. Lo localizamos en el mercado alemán y te damos precio cerrado antes de importar. Sin sorpresas.
            </p>
            <a href="#contacto" style={{
              display: 'inline-block', backgroundColor: RED, color: WHITE,
              fontFamily: F_BODY, fontWeight: 600, fontSize: 11,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              textDecoration: 'none', padding: '15px 40px',
              transition: 'background-color 0.15s',
            }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#A07820')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = RED)}>
              Solicitar importación
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Sell section ─────────────────────────────────────────────────────────────

function SellSection() {
  const items = ['Tasación gratuita e inmediata', 'Pago garantizado en menos de 24h', 'Gestión documental completa', 'Recogida a domicilio disponible']
  return (
    <section id="vende" style={{ backgroundColor: WHITE, padding: 'clamp(64px,10vw,100px) 0' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(20px,5vw,48px)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 'clamp(40px,7vw,80px)', alignItems: 'center' }}>

          {/* Image */}
          <div style={{ position: 'relative', aspectRatio: '3/2', overflow: 'hidden', backgroundColor: '#E8E8E8' }}>
            <img
              src="https://images.unsplash.com/photo-1550242499-b5171f56de56?w=900&h=600&fit=crop&auto=format"
              alt="Vende tu coche a H&Y Motors" loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 24px', background: 'linear-gradient(to top, rgba(0,0,0,0.55), transparent)' }}>
              <span style={{ fontFamily: F_BODY, fontSize: 10, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 500 }}>Pago garantizado en &lt; 24h</span>
            </div>
          </div>

          {/* Content */}
          <div>
            <Label text="Vende tu coche" />
            <h2 style={{ fontFamily: F_DISPLAY, fontWeight: 900, fontSize: 'clamp(2.2rem,5vw,3.8rem)', textTransform: 'uppercase', color: BLACK, lineHeight: 0.92, margin: '0 0 20px', letterSpacing: '-0.01em' }}>
              Te compramos<br />tu vehículo hoy.
            </h2>
            <p style={{ fontFamily: F_BODY, color: GRAY_TEXT, fontSize: 13, lineHeight: 1.9, fontWeight: 300, margin: '0 0 28px' }}>
              Valoramos tu coche al instante y al mejor precio. Si aceptas la oferta, el dinero está en tu cuenta en menos de 24 horas.
            </p>
            <div style={{ marginBottom: 36 }}>
              {items.map((item, i) => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: i < items.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
                  <div style={{ width: 3, height: 3, borderRadius: '50%', backgroundColor: RED, flexShrink: 0 }} />
                  <span style={{ fontFamily: F_BODY, color: BLACK, fontSize: 13, fontWeight: 400 }}>{item}</span>
                </div>
              ))}
            </div>
            <a href="#contacto" style={{
              display: 'inline-block', backgroundColor: BLACK, color: WHITE,
              fontFamily: F_BODY, fontWeight: 600, fontSize: 11,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              textDecoration: 'none', padding: '14px 36px',
              transition: 'background-color 0.15s',
            }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = RED)}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = BLACK)}>
              Pedir tasación gratis
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Contact — split dark/white ───────────────────────────────────────────────

function ContactSection() {
  const [form, setForm] = useState({ nombre: '', telefono: '', email: '', interes: 'Golf GTI', mensaje: '' })
  const [sent, setSent] = useState(false)

  const inp: React.CSSProperties = {
    width: '100%', padding: '12px 14px',
    border: `1px solid ${BORDER}`,
    backgroundColor: WHITE, color: BLACK,
    fontFamily: F_BODY, fontSize: 13, fontWeight: 400,
    outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.15s', borderRadius: 0,
  }

  return (
    <section id="contacto" style={{ backgroundColor: WHITE }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>

        <div style={{ backgroundColor: BLACK, padding: 'clamp(48px, 6vw, 80px) clamp(24px, 4vw, 56px)' }}>
          <Label text="Contacto" light />
          <h2 style={{ fontFamily: F_DISPLAY, fontWeight: 900, fontSize: 'clamp(2.4rem, 4vw, 3.8rem)', textTransform: 'uppercase', color: WHITE, lineHeight: 0.9, margin: '0 0 48px', letterSpacing: '-0.01em' }}>
            Estamos para<br /><span style={{ color: RED }}>ayudarte.</span>
          </h2>

          <div style={{ marginBottom: 40 }}>
            {[
              { label: 'Teléfono', val: '697 271 380', href: 'tel:+34697271380' },
              { label: 'Email', val: 'info@hymotors.es', href: 'mailto:info@hymotors.es' },
              { label: 'Dirección', val: 'Av. de Fuenlabrada 62\n28970 Humanes de Madrid', href: null },
              { label: 'Horario', val: 'Lun–Vie · 9:00–14:00 y 16:00–19:00', href: null },
            ].map((c, i, arr) => (
              <div key={c.label} style={{ paddingBottom: 22, marginBottom: 22, borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                <div style={{ fontFamily: F_BODY, color: 'rgba(255,255,255,0.25)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 5, fontWeight: 500 }}>{c.label}</div>
                {c.href
                  ? <a href={c.href} style={{ fontFamily: F_BODY, color: 'rgba(255,255,255,0.72)', fontSize: 14, textDecoration: 'none', fontWeight: 400 }}>{c.val}</a>
                  : <span style={{ fontFamily: F_BODY, color: 'rgba(255,255,255,0.72)', fontSize: 14, whiteSpace: 'pre-line' }}>{c.val}</span>}
              </div>
            ))}
          </div>

          <a href="https://wa.me/34697271380" target="_blank" rel="noopener noreferrer" style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            backgroundColor: '#25D366', color: WHITE,
            fontFamily: F_BODY, fontWeight: 600,
            fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase',
            textDecoration: 'none', padding: '13px 26px',
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.557 4.115 1.528 5.84L.057 23.454a.5.5 0 00.603.602l5.694-1.473A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.95 9.95 0 01-5.073-1.384l-.361-.214-3.742.968.992-3.659-.235-.374A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
            </svg>
            Escribir por WhatsApp
          </a>
        </div>

        <div style={{ padding: 'clamp(48px, 6vw, 80px) clamp(24px, 4vw, 56px)', backgroundColor: WHITE }}>
          {sent ? (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 14 }}>
              <div style={{ width: 52, height: 52, backgroundColor: RED, display: 'flex', alignItems: 'center', justifyContent: 'center', color: WHITE, fontSize: 20 }}>✓</div>
              <h3 style={{ fontFamily: F_DISPLAY, fontWeight: 800, fontSize: 28, textTransform: 'uppercase', color: BLACK, margin: 0 }}>Mensaje enviado</h3>
              <p style={{ fontFamily: F_BODY, color: GRAY_TEXT, fontSize: 13, margin: 0 }}>Nos pondremos en contacto en menos de 24 horas.</p>
            </div>
          ) : (
            <form onSubmit={e => { e.preventDefault(); setSent(true) }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ marginBottom: 8 }}>
                <h3 style={{ fontFamily: F_DISPLAY, fontWeight: 800, fontSize: 26, textTransform: 'uppercase', color: BLACK, margin: '0 0 4px', letterSpacing: '0.01em' }}>Cuéntanos qué buscas</h3>
                <p style={{ fontFamily: F_BODY, color: '#C0C0C0', fontSize: 12, margin: 0, fontWeight: 400 }}>Respuesta garantizada en menos de 24 horas.</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }} className="form-grid">
                <div>
                  <label style={{ display: 'block', fontFamily: F_BODY, color: '#AAA', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 6, fontWeight: 500 }}>Nombre *</label>
                  <input required type="text" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Tu nombre" style={inp}
                    onFocus={e => (e.target.style.borderColor = BLACK)} onBlur={e => (e.target.style.borderColor = BORDER)} />
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: F_BODY, color: '#AAA', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 6, fontWeight: 500 }}>Teléfono</label>
                  <input type="tel" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} placeholder="697 271 380" style={inp}
                    onFocus={e => (e.target.style.borderColor = BLACK)} onBlur={e => (e.target.style.borderColor = BORDER)} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: F_BODY, color: '#AAA', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 6, fontWeight: 500 }}>Email *</label>
                <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="tu@email.com" style={inp}
                  onFocus={e => (e.target.style.borderColor = BLACK)} onBlur={e => (e.target.style.borderColor = BORDER)} />
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: F_BODY, color: '#AAA', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 6, fontWeight: 500 }}>Me interesa</label>
                <select value={form.interes} onChange={e => setForm({ ...form, interes: e.target.value })} style={{ ...inp, cursor: 'pointer', appearance: 'none' as const }}>
                  {['Golf GTI', 'Golf R', 'Porsche Cayenne', 'Toyota Land Cruiser', 'Importación a la carta', 'Financiación', 'Vender mi coche', 'Otro vehículo'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: F_BODY, color: '#AAA', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 6, fontWeight: 500 }}>Mensaje</label>
                <textarea rows={4} value={form.mensaje} onChange={e => setForm({ ...form, mensaje: e.target.value })} placeholder="Cuéntanos qué buscas…" style={{ ...inp, resize: 'vertical' }}
                  onFocus={e => (e.target.style.borderColor = BLACK)} onBlur={e => (e.target.style.borderColor = BORDER)} />
              </div>
              <button type="submit" style={{
                backgroundColor: BLACK, color: WHITE, border: 'none',
                fontFamily: F_BODY, fontWeight: 600,
                fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase',
                padding: '15px', cursor: 'pointer', transition: 'background-color 0.15s',
              }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = RED)}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = BLACK)}>
                Enviar mensaje
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer style={{ backgroundColor: BLACK }}>
      {/* Red top bar */}
      <div style={{ height: 3, backgroundColor: RED }} />
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '60px 24px 28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '40px 48px', marginBottom: 52 }}>
          <div>
            <img src={logo} alt="H&Y Motors" style={{ height: 64, width: 'auto', marginBottom: 20, filter: 'invert(1)' }} />
            <p style={{ fontFamily: F_BODY, color: 'rgba(255,255,255,0.18)', fontSize: 12, lineHeight: 1.8, margin: 0, fontWeight: 300 }}>
              Especialistas en importación de vehículos europeos. Humanes de Madrid.
            </p>
          </div>
          <div>
            <div style={{ fontFamily: F_BODY, color: 'rgba(255,255,255,0.22)', fontSize: 9, fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 20 }}>Navegación</div>
            {NAV_LINKS.map(l => (
              <a key={l.href} href={l.href} style={{ display: 'block', marginBottom: 10, fontFamily: F_BODY, color: 'rgba(255,255,255,0.22)', fontSize: 13, textDecoration: 'none', fontWeight: 400, transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = WHITE)}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.22)')}>
                {l.label}
              </a>
            ))}
          </div>
          <div>
            <div style={{ fontFamily: F_BODY, color: 'rgba(255,255,255,0.22)', fontSize: 9, fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 20 }}>Contacto</div>
            {['697 271 380', 'info@hymotors.es', 'Av. de Fuenlabrada 62', 'Humanes de Madrid', 'Lun–Vie 9:00–14:00 / 16:00–19:00'].map(v => (
              <div key={v} style={{ fontFamily: F_BODY, color: 'rgba(255,255,255,0.22)', fontSize: 12, marginBottom: 8, fontWeight: 400 }}>{v}</div>
            ))}
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 22, display: 'flex', flexWrap: 'wrap', gap: '8px 24px', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <span style={{ fontFamily: F_BODY, color: 'rgba(255,255,255,0.12)', fontSize: 11 }}>© 2025 H&Y Motors · hymotors.es</span>
            <span style={{ fontFamily: F_BODY, color: 'rgba(255,255,255,0.08)', fontSize: 10 }}>H&Y MOTORWORKS PERFORMANCE SL · B25868878 · Avenida de Fuenlabrada 62, Humanes de Madrid 28970</span>
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Aviso legal', 'Privacidad', 'Cookies'].map(t => (
              <a key={t} href="#" style={{ fontFamily: F_BODY, color: 'rgba(255,255,255,0.12)', textDecoration: 'none', fontSize: 11, fontWeight: 400, transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.12)')}>
                {t}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

// ─── WhatsApp ─────────────────────────────────────────────────────────────────

function WhatsAppButton() {
  return (
    <a href="https://wa.me/34697271380" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"
      style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 300, width: 52, height: 52, borderRadius: '50%', backgroundColor: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', transition: 'transform 0.2s, box-shadow 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(0,0,0,0.36)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)' }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.557 4.115 1.528 5.84L.057 23.454a.5.5 0 00.603.602l5.694-1.473A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.95 9.95 0 01-5.073-1.384l-.361-.214-3.742.968.992-3.659-.235-.374A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
      </svg>
    </a>
  )
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <div style={{ backgroundColor: WHITE, minHeight: '100vh' }}>
      <Navbar />
      <main>
        <Hero />
        <CarsSection />
        <ServicesSection />
        <ImportBanner />
        <SellSection />
        <ContactSection />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}
