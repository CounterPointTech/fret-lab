export interface SearchResult {
  video_id: string
  title: string
  channel: string | null
  duration_s: number | null
  thumbnail_url: string | null
}

export interface Song {
  video_id: string
  title: string
  channel: string | null
  duration_s: number | null
  thumbnail_url: string | null
  status: 'queued' | 'downloading' | 'ready' | 'error'
  created_at: string | null
  active_job_id: string | null
  last_error: string | null
}

export interface JobEvent {
  job_id: string
  status: 'queued' | 'running' | 'done' | 'error' | 'cancelled'
  stage: string | null
  progress: number
  error: string | null
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const resp = await fetch(url, init)
  if (!resp.ok) {
    let detail = `HTTP ${resp.status}`
    try {
      const body = (await resp.json()) as { detail?: string }
      if (body.detail) detail = body.detail
    } catch {
      // non-JSON error body; keep the status code message
    }
    throw new Error(detail)
  }
  if (resp.status === 204) return undefined as T
  return (await resp.json()) as T
}

export function searchSongs(q: string): Promise<{ results: SearchResult[] }> {
  return request(`/api/search?q=${encodeURIComponent(q)}`)
}

export function addSong(result: SearchResult): Promise<{ song: Song; job_id: string | null }> {
  return request('/api/songs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(result),
  })
}

export function listSongs(): Promise<{ songs: Song[] }> {
  return request('/api/songs')
}

export function deleteSong(videoId: string): Promise<void> {
  return request(`/api/songs/${videoId}`, { method: 'DELETE' })
}

export function formatDuration(s: number | null): string {
  if (s == null) return '–:––'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}
