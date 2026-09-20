import { useState, useEffect, useRef } from 'react'
import {
  getCarsAsync, upsertCarAsync, removeCarAsync, getPin, setPin,
  getApiKey, setApiKey, compressImage, compressThumb, analyzeCarWithAI,
  migrateFromLocalStorage, type CarData,
} from './store'
import logo from './assets/logo-transparent.png'

const BG = '#0A0A0A'
const CARD = '#141414'
const BORDER = 'rgba(255,255,255,0.07)'
const RED = '#C8952A'
const WHITE = '#FFFFFF'
const MUTED = 'rgba(255,255,255,0.35)'
const F = "'Space Grotesk', sans-serif"
const FD = "'Barlow Condensed', sans-serif"

const newCar = (): CarData => ({
  id: crypto.randomUUID(),
  brand: '', name: '', year: new Date().getFullYear(),
  km: '', price: '', fuel: 'Gasolina', trans: '', hp: '',
  images: [], thumbs: [], badge: '', type: 'turismo',
  description: '', active: true, sold: false, createdAt: Date.now(),
})

// ─── PIN screen ───────────────────────────────────────────────────────────────

function PinScreen({ onUnlock }: { onUnlock: () => void }) {
  const [digits, setDigits] = useState('')
  const [error, setError] = useState(false)

  const press = (d: string) => {
    const next = (digits + d).slice(0, 4)
    setDigits(next)
    setError(false)
    if (next.length === 4) {
      if (next === getPin()) { onUnlock() }
      else { setError(true); setTimeout(() => setDigits(''), 500) }
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: BG, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <img src={logo} alt="H&Y Motors" style={{ height: 100, width: 'auto', filter: 'invert(1)', marginBottom: 40 }} />
      <div style={{ fontFamily: FD, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: MUTED, marginBottom: 32 }}>Panel de administración</div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 40 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: digits.length > i ? (error ? RED : WHITE) : 'transparent', border: `2px solid ${error ? RED : digits.length > i ? WHITE : BORDER}`, transition: 'all 0.15s' }} />
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, width: 220 }}>
        {['1','2','3','4','5','6','7','8','9','','0','⌫'].map(k => (
          <button key={k} onClick={() => k === '⌫' ? setDigits(d => d.slice(0,-1)) : k ? press(k) : undefined}
            disabled={!k}
            style={{ height: 64, backgroundColor: k ? CARD : 'transparent', border: k ? `1px solid ${BORDER}` : 'none', color: WHITE, fontFamily: F, fontSize: 22, cursor: k ? 'pointer' : 'default', opacity: k ? 1 : 0, borderRadius: 8 }}>
            {k}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Car form ─────────────────────────────────────────────────────────────────

function CarForm({ car: initial, onSave, onCancel }: { car: CarData; onSave: () => void; onCancel: () => void }) {
  const [car, setCar] = useState<CarData>(initial)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiHint, setAiHint] = useState('')
  const [aiError, setAiError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const set = (k: keyof CarData, v: unknown) => setCar(c => ({ ...c, [k]: v }))

  const handleImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    setUploadProgress(0)
    const newFulls: string[] = []
    const newThumbs: string[] = []
    for (let i = 0; i < files.length; i++) {
      const [full, thumb] = await Promise.all([
        compressImage(files[i]),
        compressThumb(files[i]),
      ])
      newFulls.push(full)
      newThumbs.push(thumb)
      setUploadProgress(Math.round(((i + 1) / files.length) * 100))
    }
    setCar(c => ({
      ...c,
      images: [...c.images, ...newFulls],
      thumbs: [...(c.thumbs ?? []), ...newThumbs],
    }))
    e.target.value = ''
    setUploading(false)
  }

  const removeImage = (idx: number) => {
    setCar(c => ({
      ...c,
      images: c.images.filter((_, i) => i !== idx),
      thumbs: (c.thumbs ?? []).filter((_, i) => i !== idx),
    }))
  }

  const moveToFirst = (idx: number) => {
    setCar(c => {
      const imgs = [...c.images]
      const thumbs = [...(c.thumbs ?? [])]
      const [img] = imgs.splice(idx, 1)
      const [thumb] = thumbs.splice(idx, 1)
      return { ...c, images: [img, ...imgs], thumbs: [thumb, ...thumbs] }
    })
  }

  const runAI = async () => {
    if (!car.images[0]) { setAiError('Sube al menos una foto primero'); return }
    const key = getApiKey()
    if (!key) { setAiError('Añade tu clave de API de OpenAI en Ajustes'); return }
    setAiLoading(true); setAiError('')
    try {
      const result = await analyzeCarWithAI(car.images[0], key, aiHint)
      setCar(c => ({
        ...c,
        brand: result.brand || c.brand,
        name: result.model || c.name,
        fuel: result.fuel || c.fuel,
        trans: result.trans || c.trans,
        description: result.description || c.description,
      }))
    } catch {
      setAiError('Error al conectar con la IA. Comprueba tu clave de API.')
    } finally {
      setAiLoading(false)
    }
  }

  const save = async () => {
    setSaveError('')
    if (!car.brand.trim()) { setSaveError('Falta la marca del vehículo'); return }
    if (!car.name.trim()) { setSaveError('Falta el modelo / versión'); return }
    setSaving(true)
    try {
      await upsertCarAsync(car)
      onSave()
    } catch (e) {
      setSaving(false)
      setSaveError('Error al guardar. Inténtalo de nuevo.')
      console.error(e)
    }
  }

  const inp: React.CSSProperties = { width: '100%', padding: '11px 12px', backgroundColor: BG, border: `1px solid ${BORDER}`, color: WHITE, fontFamily: F, fontSize: 14, outline: 'none', boxSizing: 'border-box', borderRadius: 6 }
  const lbl: React.CSSProperties = { display: 'block', fontFamily: F, color: MUTED, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 5 }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: BG, paddingBottom: 40 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 16px 14px', borderBottom: `1px solid ${BORDER}`, position: 'sticky', top: 0, backgroundColor: BG, zIndex: 10 }}>
        <button onClick={onCancel} style={{ background: 'none', border: 'none', color: MUTED, cursor: 'pointer', padding: 4 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <span style={{ fontFamily: FD, fontWeight: 700, fontSize: 18, color: WHITE, textTransform: 'uppercase', letterSpacing: '0.06em', flex: 1 }}>
          {initial.brand ? 'Editar vehículo' : 'Nuevo vehículo'}
        </span>
        <button onClick={save} disabled={saving} style={{ backgroundColor: saving ? '#555' : RED, color: WHITE, border: 'none', fontFamily: F, fontWeight: 600, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '9px 18px', cursor: saving ? 'default' : 'pointer', borderRadius: 6 }}>
          {saving ? 'Guardando…' : 'Guardar'}
        </button>
      </div>

      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Photos */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <label style={{ ...lbl, marginBottom: 0 }}>Fotos del vehículo</label>
            {car.images.length > 0 && (
              <span style={{ fontFamily: F, color: MUTED, fontSize: 10 }}>{car.images.length} foto{car.images.length !== 1 ? 's' : ''} · 16:10 optimizado</span>
            )}
          </div>

          {/* Cover image — large preview */}
          {car.images.length > 0 && (
            <>
              <div style={{ position: 'relative', aspectRatio: '16/10', borderRadius: 8, overflow: 'hidden', border: `2px solid ${RED}`, marginBottom: 8 }}>
                <img src={car.thumbs?.[0] ?? car.images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: 8, left: 8, backgroundColor: RED, color: WHITE, fontFamily: F, fontSize: 9, padding: '3px 8px', borderRadius: 3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                  Portada
                </div>
              </div>

              {/* Rest as small grid */}
              {car.images.length > 1 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 8 }}>
                  {car.images.slice(1).map((img, i) => {
                    const idx = i + 1
                    return (
                      <div key={idx} style={{ position: 'relative', aspectRatio: '16/10', borderRadius: 6, overflow: 'hidden', border: `1px solid ${BORDER}` }}>
                        <img src={car.thumbs?.[idx] ?? img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                          <div style={{ display: 'flex', backgroundColor: 'rgba(0,0,0,0.7)' }}>
                            <button onClick={() => moveToFirst(idx)} style={{ flex: 1, padding: '4px 0', background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', fontFamily: F, fontSize: 8, cursor: 'pointer', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                              ★
                            </button>
                            <button onClick={() => removeImage(idx)} style={{ flex: 1, padding: '4px 0', background: 'none', border: 'none', color: RED, fontFamily: F, fontSize: 8, cursor: 'pointer' }}>
                              ✕
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Remove cover button */}
              <button onClick={() => removeImage(0)} style={{ width: '100%', padding: '7px', background: 'none', border: `1px solid rgba(200,16,46,0.2)`, color: 'rgba(200,16,46,0.6)', fontFamily: F, fontSize: 11, cursor: 'pointer', borderRadius: 6, marginBottom: 8 }}>
                Eliminar portada
              </button>
            </>
          )}

          {/* Upload button / progress */}
          {uploading ? (
            <div style={{ padding: '14px', backgroundColor: CARD, borderRadius: 8, border: `1px dashed ${BORDER}` }}>
              <div style={{ fontFamily: F, color: MUTED, fontSize: 12, marginBottom: 8, textAlign: 'center' }}>Optimizando imágenes… {uploadProgress}%</div>
              <div style={{ height: 3, backgroundColor: '#222', borderRadius: 2 }}>
                <div style={{ height: '100%', width: `${uploadProgress}%`, backgroundColor: RED, borderRadius: 2, transition: 'width 0.2s' }} />
              </div>
            </div>
          ) : (
            <button onClick={() => fileRef.current?.click()} style={{ width: '100%', padding: '14px', backgroundColor: CARD, border: `1px dashed ${BORDER}`, color: MUTED, fontFamily: F, fontSize: 13, cursor: 'pointer', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              {car.images.length === 0 ? 'Subir fotos (puedes seleccionar varias)' : 'Añadir más fotos'}
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleImages} style={{ display: 'none' }} />
          {car.images.length > 1 && !uploading && (
            <div style={{ fontFamily: F, color: MUTED, fontSize: 10, marginTop: 6 }}>Pulsa ★ en una foto pequeña para convertirla en portada · ✕ para eliminar</div>
          )}
        </div>

        {/* AI Analysis */}
        <div style={{ backgroundColor: CARD, borderRadius: 8, padding: 16, border: `1px solid ${BORDER}` }}>
          <div style={{ fontFamily: FD, fontWeight: 700, fontSize: 14, color: WHITE, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>✦ Análisis con IA</div>
          <input value={aiHint} onChange={e => setAiHint(e.target.value)} placeholder="Pista adicional (ej: Golf GTI mk6 2011, gasolina)" style={{ ...inp, marginBottom: 10, fontSize: 13 }} />
          <button onClick={runAI} disabled={aiLoading} style={{ width: '100%', padding: '12px', backgroundColor: aiLoading ? '#333' : RED, color: WHITE, border: 'none', fontFamily: F, fontWeight: 600, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: aiLoading ? 'default' : 'pointer', borderRadius: 6, transition: 'background-color 0.15s' }}>
            {aiLoading ? '⏳ Analizando…' : '⚡ Analizar con IA (GPT-4o)'}
          </button>
          {aiError && <div style={{ fontFamily: F, color: RED, fontSize: 12, marginTop: 8 }}>{aiError}</div>}
        </div>

        {/* Brand + Year */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={lbl}>Marca <span style={{ color: RED }}>*</span></label>
            <input value={car.brand} onChange={e => { set('brand', e.target.value); setSaveError('') }} placeholder="Volkswagen" style={{ ...inp, borderColor: saveError.includes('marca') ? RED : BORDER }} />
          </div>
          <div>
            <label style={lbl}>Año</label>
            <input type="number" value={car.year} onChange={e => set('year', +e.target.value)} style={inp} />
          </div>
        </div>

        <div>
          <label style={lbl}>Modelo / Versión <span style={{ color: RED }}>*</span></label>
          <input value={car.name} onChange={e => { set('name', e.target.value); setSaveError('') }} placeholder="Golf GTI Performance" style={{ ...inp, borderColor: saveError.includes('modelo') ? RED : BORDER }} />
        </div>

        {/* Specs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={lbl}>Km</label>
            <input value={car.km} onChange={e => set('km', e.target.value)} placeholder="45.000 km" style={inp} />
          </div>
          <div>
            <label style={lbl}>Precio (€)</label>
            <input value={car.price} onChange={e => set('price', e.target.value)} placeholder="28.500" style={inp} />
          </div>
          <div>
            <label style={lbl}>Combustible</label>
            <select value={car.fuel} onChange={e => set('fuel', e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
              {['Gasolina', 'Diesel', 'Híbrido', 'Eléctrico', 'Mild Hybrid'].map(f => <option key={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Potencia</label>
            <input value={car.hp} onChange={e => set('hp', e.target.value)} placeholder="245 CV" style={inp} />
          </div>
          <div>
            <label style={lbl}>Cambio</label>
            <input value={car.trans} onChange={e => set('trans', e.target.value)} placeholder="DSG 7" style={inp} />
          </div>
          <div>
            <label style={lbl}>Tipo</label>
            <select value={car.type} onChange={e => set('type', e.target.value as CarData['type'])} style={{ ...inp, cursor: 'pointer' }}>
              <option value="gti">Golf / GTI</option>
              <option value="turismo">Turismo</option>
              <option value="suv">SUV / 4x4</option>
              <option value="furgoneta">Furgoneta</option>
              <option value="otros">Otros</option>
            </select>
          </div>
        </div>

        <div>
          <label style={lbl}>Badge destacado (opcional)</label>
          <input value={car.badge} onChange={e => set('badge', e.target.value)} placeholder="Nuevo, Destacado, Ed. Especial…" style={inp} />
        </div>

        <div>
          <label style={lbl}>Descripción</label>
          <textarea value={car.description} onChange={e => set('description', e.target.value)} rows={5} placeholder="Descripción del vehículo… (la IA la puede generar automáticamente)" style={{ ...inp, resize: 'vertical', lineHeight: 1.7 }} />
        </div>

        {/* Active toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: CARD, borderRadius: 8, padding: '14px 16px', border: `1px solid ${BORDER}` }}>
          <span style={{ fontFamily: F, color: WHITE, fontSize: 14 }}>Mostrar en la web</span>
          <div onClick={() => set('active', !car.active)} style={{ width: 44, height: 24, borderRadius: 12, backgroundColor: car.active ? RED : '#333', cursor: 'pointer', position: 'relative', transition: 'background-color 0.2s' }}>
            <div style={{ position: 'absolute', top: 3, left: car.active ? 23 : 3, width: 18, height: 18, borderRadius: '50%', backgroundColor: WHITE, transition: 'left 0.2s' }} />
          </div>
        </div>

        {saveError && (
          <div style={{ backgroundColor: 'rgba(200,16,46,0.12)', border: '1px solid rgba(200,16,46,0.3)', borderRadius: 8, padding: '12px 16px', fontFamily: F, color: RED, fontSize: 13 }}>
            ⚠ {saveError}
          </div>
        )}
        <button onClick={save} disabled={saving} style={{ padding: '15px', backgroundColor: saving ? '#333' : RED, color: WHITE, border: 'none', fontFamily: F, fontWeight: 600, fontSize: 14, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: saving ? 'default' : 'pointer', borderRadius: 8, opacity: saving ? 0.7 : 1 }}>
          {saving ? 'Guardando…' : 'Guardar vehículo'}
        </button>
      </div>
    </div>
  )
}

// ─── Settings ─────────────────────────────────────────────────────────────────

function SettingsPanel({ onBack }: { onBack: () => void }) {
  const [apiKey, setKey] = useState(getApiKey())
  const [pin, setNewPin] = useState(getPin())
  const [saved, setSaved] = useState(false)

  const save = () => {
    setApiKey(apiKey.trim())
    if (/^\d{4}$/.test(pin)) setPin(pin)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const inp: React.CSSProperties = { width: '100%', padding: '11px 12px', backgroundColor: BG, border: `1px solid rgba(255,255,255,0.07)`, color: WHITE, fontFamily: F, fontSize: 14, outline: 'none', boxSizing: 'border-box', borderRadius: 6 }
  const lbl: React.CSSProperties = { display: 'block', fontFamily: F, color: MUTED, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 5 }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: BG }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 16px 14px', borderBottom: `1px solid ${BORDER}`, position: 'sticky', top: 0, backgroundColor: BG, zIndex: 10 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: MUTED, cursor: 'pointer', padding: 4 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <span style={{ fontFamily: FD, fontWeight: 700, fontSize: 18, color: WHITE, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Ajustes</span>
      </div>
      <div style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <label style={lbl}>Clave de API OpenAI</label>
          <input type="password" value={apiKey} onChange={e => setKey(e.target.value)} placeholder="sk-..." style={inp} />
          <div style={{ fontFamily: F, color: MUTED, fontSize: 11, marginTop: 6, lineHeight: 1.6 }}>
            Necesaria para que la IA analice las fotos (GPT-4o Vision). Obtén tu clave en platform.openai.com → API Keys. Se guarda solo en este dispositivo.
          </div>
        </div>
        <div>
          <label style={lbl}>PIN de acceso (4 dígitos)</label>
          <input type="number" value={pin} onChange={e => setNewPin(e.target.value.slice(0,4))} placeholder="1234" style={inp} />
        </div>
        <button onClick={save} style={{ padding: '14px', backgroundColor: saved ? '#1a6b3a' : RED, color: WHITE, border: 'none', fontFamily: F, fontWeight: 600, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: 8, transition: 'background-color 0.3s' }}>
          {saved ? '✓ Guardado' : 'Guardar ajustes'}
        </button>
      </div>
    </div>
  )
}

// ─── Car list ─────────────────────────────────────────────────────────────────

function CarList({ onEdit, onSettings, onLogout }: { onEdit: (car: CarData | null) => void; onSettings: () => void; onLogout: () => void }) {
  const [cars, setCars] = useState<CarData[]>([])
  const [confirmDel, setConfirmDel] = useState<string | null>(null)

  useEffect(() => {
    migrateFromLocalStorage().then(() => getCarsAsync().then(setCars))
  }, [])

  const del = async (id: string) => {
    await removeCarAsync(id)
    setCars(await getCarsAsync())
    setConfirmDel(null)
  }

  const toggleSold = async (car: CarData) => {
    await upsertCarAsync({ ...car, sold: !car.sold })
    setCars(await getCarsAsync())
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: BG, paddingBottom: 100 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: `1px solid ${BORDER}`, position: 'sticky', top: 0, backgroundColor: BG, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src={logo} alt="H&Y" style={{ height: 60, width: 'auto', filter: 'invert(1)' }} />
          <div>
            <div style={{ fontFamily: FD, fontWeight: 700, fontSize: 15, color: WHITE, textTransform: 'uppercase', letterSpacing: '0.06em', lineHeight: 1 }}>Admin</div>
            <div style={{ fontFamily: F, fontSize: 10, color: MUTED }}>{cars.length} vehículos</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onSettings} style={{ background: 'none', border: `1px solid ${BORDER}`, color: MUTED, cursor: 'pointer', padding: '6px 10px', borderRadius: 6 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
          </button>
          <button onClick={onLogout} style={{ background: 'none', border: `1px solid ${BORDER}`, color: MUTED, cursor: 'pointer', padding: '6px 12px', borderRadius: 6, fontFamily: F, fontSize: 11 }}>Salir</button>
        </div>
      </div>

      <div style={{ padding: 16 }}>
        {cars.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: MUTED }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🚗</div>
            <div style={{ fontFamily: F, fontSize: 14 }}>Sin vehículos. Pulsa + para añadir.</div>
          </div>
        )}
        {cars.map(car => (
          <div key={car.id} style={{ backgroundColor: CARD, borderRadius: 10, border: `1px solid ${BORDER}`, marginBottom: 12, overflow: 'hidden' }}>
            <div style={{ display: 'flex' }}>
              <div style={{ width: 96, flexShrink: 0, backgroundColor: '#1A1A1A', position: 'relative', minHeight: 80 }}>
                {car.images[0]
                  ? <img src={car.images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: MUTED, fontSize: 22 }}>🚗</div>}
                {car.sold && (
                  <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.72)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontFamily: F, fontSize: 9, color: '#C8952A', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 700 }}>Vendido</span>
                  </div>
                )}
                {!car.sold && !car.active && (
                  <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontFamily: F, fontSize: 9, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Oculto</span>
                  </div>
                )}
              </div>
              <div style={{ flex: 1, padding: '12px 14px' }}>
                <div style={{ fontFamily: F, color: MUTED, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 3 }}>{car.brand} · {car.year}</div>
                <div style={{ fontFamily: FD, fontWeight: 700, fontSize: 16, color: WHITE, textTransform: 'uppercase', lineHeight: 1.1, marginBottom: 4 }}>{car.name || '—'}</div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ fontFamily: F, color: RED, fontSize: 13, fontWeight: 600 }}>{car.price ? `${car.price} €` : 'Sin precio'}</span>
                  {car.images.length > 1 && <span style={{ fontFamily: F, color: MUTED, fontSize: 10 }}>{car.images.length} fotos</span>}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', borderTop: `1px solid ${BORDER}` }}>
              <button onClick={() => onEdit(car)} style={{ flex: 1, padding: '10px', background: 'none', border: 'none', color: MUTED, fontFamily: F, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Editar
              </button>
              <div style={{ width: 1, backgroundColor: BORDER }} />
              <button onClick={() => toggleSold(car)} style={{ flex: 1, padding: '10px', background: 'none', border: 'none', color: car.sold ? '#C8952A' : MUTED, fontFamily: F, fontSize: 12, fontWeight: car.sold ? 700 : 400, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
                {car.sold ? 'Disponible' : 'Vendido'}
              </button>
              <div style={{ width: 1, backgroundColor: BORDER }} />
              {confirmDel === car.id
                ? <>
                    <button onClick={() => del(car.id)} style={{ flex: 1, padding: '10px', background: 'none', border: 'none', color: RED, fontFamily: F, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>¿Eliminar?</button>
                    <div style={{ width: 1, backgroundColor: BORDER }} />
                    <button onClick={() => setConfirmDel(null)} style={{ flex: 1, padding: '10px', background: 'none', border: 'none', color: MUTED, fontFamily: F, fontSize: 12, cursor: 'pointer' }}>Cancelar</button>
                  </>
                : <button onClick={() => setConfirmDel(car.id)} style={{ flex: 1, padding: '10px', background: 'none', border: 'none', color: MUTED, fontFamily: F, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                    Eliminar
                  </button>}
            </div>
          </div>
        ))}
      </div>

      <button onClick={() => onEdit(null)} style={{ position: 'fixed', bottom: 24, right: 24, width: 58, height: 58, borderRadius: '50%', backgroundColor: RED, color: WHITE, border: 'none', fontSize: 28, cursor: 'pointer', boxShadow: '0 4px 20px rgba(200,16,46,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        +
      </button>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

type View = 'login' | 'list' | 'form' | 'settings'

export default function AdminPanel() {
  const [view, setView] = useState<View>('login')
  const [editCar, setEditCar] = useState<CarData | null>(null)

  const openEdit = (car: CarData | null) => {
    setEditCar(car ?? newCar())
    setView('form')
  }

  if (view === 'login') return <PinScreen onUnlock={() => setView('list')} />
  if (view === 'settings') return <SettingsPanel onBack={() => setView('list')} />
  if (view === 'form' && editCar) return <CarForm car={editCar} onSave={() => setView('list')} onCancel={() => setView('list')} />
  return <CarList onEdit={openEdit} onSettings={() => setView('settings')} onLogout={() => setView('login')} />
}
