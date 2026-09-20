import { createClient } from '@supabase/supabase-js'
import { projectId, publicAnonKey } from '../utils/supabase/info'

export interface CarData {
  id: string
  brand: string
  name: string
  year: number
  km: string
  price: string
  fuel: string
  trans: string
  hp: string
  images: string[]
  thumbs: string[]
  badge: string
  type: 'gti' | 'turismo' | 'suv' | 'furgoneta' | 'otros'
  description: string
  active: boolean
  sold: boolean
  createdAt: number
}

const PIN_KEY = 'hy_pin'
const API_KEY = 'hy_api_key'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabase = (): any => {
  const w = window as any
  if (!w.__hy_sb) w.__hy_sb = createClient(`https://${projectId}.supabase.co`, publicAnonKey)
  return w.__hy_sb
}

function normalize(c: CarData & { image?: string }): CarData {
  return {
    ...c,
    images: c.images?.length ? c.images : c.image ? [c.image] : [],
    thumbs: c.thumbs?.length ? c.thumbs : c.images?.length ? c.images : c.image ? [c.image] : [],
    sold: c.sold ?? false,
  }
}

// ─── IndexedDB (primary storage, always available) ────────────────────────────

const DB_NAME = 'hymotors'
const IDB_STORE = 'cars'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(IDB_STORE))
        req.result.createObjectStore(IDB_STORE, { keyPath: 'id' })
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function idbGetAll(): Promise<CarData[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const req = db.transaction(IDB_STORE, 'readonly').objectStore(IDB_STORE).getAll()
    req.onsuccess = () => {
      const list = (req.result as (CarData & { image?: string })[]).map(normalize)
      list.sort((a, b) => b.createdAt - a.createdAt)
      resolve(list)
    }
    req.onerror = () => reject(req.error)
  })
}

async function idbPut(car: CarData): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const req = db.transaction(IDB_STORE, 'readwrite').objectStore(IDB_STORE).put(car)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

async function idbDelete(id: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const req = db.transaction(IDB_STORE, 'readwrite').objectStore(IDB_STORE).delete(id)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

// ─── Supabase sync (syncs to cloud when available) ────────────────────────────

async function sbGetAll(): Promise<CarData[]> {
  const { data, error } = await supabase()
    .from('hy_cars')
    .select('data')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map((r: { data: CarData & { image?: string } }) => normalize(r.data))
}

async function sbUpsert(car: CarData): Promise<void> {
  const { error } = await supabase()
    .from('hy_cars')
    .upsert({ id: car.id, data: car, created_at: car.createdAt })
  if (error) throw error
}

async function sbDelete(id: string): Promise<void> {
  const { error } = await supabase().from('hy_cars').delete().eq('id', id)
  if (error) throw error
}

// ─── Public API (IndexedDB + Supabase sync) ───────────────────────────────────

export async function getCarsAsync(): Promise<CarData[]> {
  // Try Supabase first; fall back to IndexedDB
  try {
    const cars = await sbGetAll()
    // Update local cache
    for (const car of cars) await idbPut(car).catch(() => {})
    return cars
  } catch {
    return idbGetAll()
  }
}

export async function upsertCarAsync(car: CarData): Promise<void> {
  // Always save locally first
  await idbPut(car)
  // Then sync to Supabase (don't fail if Supabase is unavailable)
  await sbUpsert(car).catch(console.warn)
}

export async function removeCarAsync(id: string): Promise<void> {
  await idbDelete(id)
  await sbDelete(id).catch(console.warn)
}

export async function migrateFromLocalStorage(): Promise<void> {
  const raw = localStorage.getItem('hy_cars')
  if (!raw) return
  try {
    const list: (CarData & { image?: string })[] = JSON.parse(raw)
    for (const car of list) await upsertCarAsync(normalize(car))
    localStorage.removeItem('hy_cars')
  } catch { /* ignore */ }
}

// ─── PIN / API key ─────────────────────────────────────────────────────────────

export const getPin = (): string => localStorage.getItem(PIN_KEY) || '1234'
export const setPin = (pin: string): void => localStorage.setItem(PIN_KEY, pin)
export const getApiKey = (): string => localStorage.getItem(API_KEY) || ''
export const setApiKey = (k: string): void => localStorage.setItem(API_KEY, k)

// ─── Image compression ─────────────────────────────────────────────────────────

function scaleCanvas(img: HTMLImageElement, maxW: number): string {
  const scale = Math.min(1, maxW / img.naturalWidth)
  const w = Math.round(img.naturalWidth * scale)
  const h = Math.round(img.naturalHeight * scale)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
  return canvas.toDataURL('image/jpeg', 0.78)
}

function fileToImage(file: File): Promise<HTMLImageElement> {
  return new Promise(resolve => {
    const reader = new FileReader()
    reader.onload = e => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.src = e.target!.result as string
    }
    reader.readAsDataURL(file)
  })
}

export async function compressImage(file: File): Promise<string> {
  return scaleCanvas(await fileToImage(file), 960)
}

export async function compressThumb(file: File): Promise<string> {
  return scaleCanvas(await fileToImage(file), 480)
}

// ─── OpenAI ────────────────────────────────────────────────────────────────────

export async function analyzeCarWithAI(
  base64: string,
  apiKey: string,
  extraHint: string = ''
): Promise<{ brand: string; model: string; description: string; fuel: string; trans: string }> {
  const prompt = `Eres experto en automoción. Analiza esta foto de un vehículo.${extraHint ? ` Contexto adicional: ${extraHint}` : ''}

Devuelve SOLO este JSON (sin markdown, sin texto adicional):
{
  "brand": "marca del coche",
  "model": "modelo completo incluyendo versión si se aprecia",
  "fuel": "Gasolina o Diesel o Híbrido o Eléctrico",
  "trans": "tipo de caja de cambios (ej: DSG 7, Manual 6, Automático)",
  "description": "descripción comercial en español de 2-3 frases. Tono profesional y atractivo. Destaca puntos fuertes, diseño, sensaciones de conducción. Sin mencionar precios."
}`

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 512,
      messages: [{ role: 'user', content: [
        { type: 'image_url', image_url: { url: base64, detail: 'low' } },
        { type: 'text', text: prompt },
      ]}],
    }),
  })

  if (!res.ok) throw new Error(`API error ${res.status}`)
  const data = await res.json()
  const clean = data.choices[0].message.content.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}
