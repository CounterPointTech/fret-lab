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
  key_name: string | null
  bpm: number | null
  created_at: string | null
  active_job_id: string | null
  last_error: string | null
  stem_count: number
  /** present on the song-detail endpoint once the analyze job has run */
  chords_url?: string | null
}

export interface Stem {
  id: number
  song_id: string
  name: string
  duration_s: number | null
  audio_url: string
  peaks_url: string
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

export function getSong(videoId: string): Promise<{ song: Song; stems: Stem[] }> {
  return request(`/api/songs/${videoId}`)
}

export function separateSong(
  videoId: string,
): Promise<{ job_id: string; already_running: boolean }> {
  return request(`/api/songs/${videoId}/separate`, { method: 'POST' })
}

export function analyzeSong(
  videoId: string,
): Promise<{ job_id: string; already_running: boolean }> {
  return request(`/api/songs/${videoId}/analyze`, { method: 'POST' })
}

export interface Transcription {
  id: number
  song_id: string
  name: string
  kind: 'guitarpro' | 'musicxml' | 'alphatex'
  sync_bpm: number | null
  sync_offset_s: number
  source: 'upload' | 'generated' | 'edited'
  params_json: string | null
  meta_json: string | null
  created_at: string | null
  file_url: string
}

export interface TranscribeOptions {
  stem: string
  tuning?: string
  capo?: number
  onset_threshold?: number
  frame_threshold?: number
  min_note_length_ms?: number
}

export function transcribeStem(
  videoId: string,
  opts: TranscribeOptions,
): Promise<{ job_id: string; already_running: boolean }> {
  return request(`/api/songs/${videoId}/transcribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(opts),
  })
}

export function listTranscriptions(
  videoId: string,
): Promise<{ transcriptions: Transcription[] }> {
  return request(`/api/songs/${videoId}/transcriptions`)
}

export function uploadTranscription(
  videoId: string,
  file: File,
): Promise<{ transcription: Transcription }> {
  const form = new FormData()
  form.append('file', file)
  return request(`/api/songs/${videoId}/transcriptions`, { method: 'POST', body: form })
}

export function patchTranscription(
  id: number,
  patch: { name?: string; sync_bpm?: number; sync_offset_s?: number },
): Promise<{ transcription: Transcription }> {
  return request(`/api/transcriptions/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  })
}

export function saveTranscriptionContent(
  id: number,
  content: { alphatex: string; meta_json?: string },
): Promise<{ transcription: Transcription }> {
  return request(`/api/transcriptions/${id}/content`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(content),
  })
}

export function deleteTranscription(id: number): Promise<void> {
  return request(`/api/transcriptions/${id}`, { method: 'DELETE' })
}

export interface PracticeLoop {
  a: number
  b: number
  max_rate: number
  plays: number
}

export interface PracticeSession {
  id: number
  song_id: string
  started_at: string | null
  ended_at: string | null
  play_seconds: number
  max_rate: number
  loops: PracticeLoop[] | null
}

export interface PracticeSummary {
  total_seconds: number
  session_count: number
  week_seconds: number
}

export function logPracticeSession(
  videoId: string,
  session: {
    started_at?: string
    play_seconds: number
    max_rate: number
    loops: PracticeLoop[]
  },
): Promise<{ session: PracticeSession }> {
  return request(`/api/songs/${videoId}/practice-sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(session),
  })
}

export function listPracticeSessions(
  videoId: string,
): Promise<{ sessions: PracticeSession[]; summary: PracticeSummary }> {
  return request(`/api/songs/${videoId}/practice-sessions`)
}

export interface LessonProgress {
  id: number
  lesson_id: string
  completed_at: string | null
  quiz_correct: number | null
  quiz_total: number | null
}

export function listLearnProgress(): Promise<{ progress: LessonProgress[] }> {
  return request('/api/learn/progress')
}

export function putLessonProgress(
  lessonId: string,
  quiz?: { quiz_correct: number; quiz_total: number },
): Promise<{ progress: LessonProgress }> {
  return request(`/api/learn/progress/${lessonId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(quiz ?? {}),
  })
}

export function deleteLessonProgress(lessonId: string): Promise<void> {
  return request(`/api/learn/progress/${lessonId}`, { method: 'DELETE' })
}

export function formatDuration(s: number | null): string {
  if (s == null) return '–:––'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}
