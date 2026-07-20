declare module 'signalsmith-stretch' {
  export interface StretchScheduleChange {
    /** AudioContext time for this change (node compensates its own latency). */
    output?: number
    active?: boolean
    /** Position in the input buffer, seconds. */
    input?: number
    rate?: number
    semitones?: number
    tonalityHz?: number
    formantSemitones?: number
    formantCompensation?: boolean
    formantBaseHz?: number
    loopStart?: number
    loopEnd?: number
  }

  export interface StretchNode extends AudioWorkletNode {
    /** Latest reported playback position in the input buffers, seconds. */
    inputTime: number
    schedule(change: StretchScheduleChange): Promise<StretchScheduleChange>
    start(when?: number, offset?: number, duration?: number): Promise<unknown>
    stop(when?: number): Promise<unknown>
    /** One Float32Array per channel, equal lengths. Returns new buffer end time. */
    addBuffers(buffers: Float32Array[]): Promise<number>
    dropBuffers(toSeconds?: number): Promise<{ start: number; end: number }>
    latency(): Promise<number>
    configure(config: { blockMs?: number; intervalMs?: number; splitComputation?: boolean }): Promise<void>
    setUpdateInterval(seconds: number, callback?: (inputTime: number) => void): Promise<void>
  }

  export default function SignalsmithStretch(
    audioContext: BaseAudioContext,
    options?: AudioWorkletNodeOptions,
  ): Promise<StretchNode>
}
