"""Dynamic-programming string/fret assignment.

Pitches -> (string, fret) minimizing hand movement, fret span, and high
positions; chords are voiced on distinct strings with a playable span.
Tuning + capo aware; frets are relative to the capo (0 = open/capo).
"""

import logging
from dataclasses import dataclass
from itertools import islice

from app.pipeline.beats import QuantNote

logger = logging.getLogger("fretlab.pipeline.fret_assign")

STANDARD_TUNING = (40, 45, 50, 55, 59, 64)  # E2 A2 D3 G3 B3 E4, low -> high

TUNINGS: dict[str, tuple[int, ...]] = {
    "standard": STANDARD_TUNING,
    "drop_d": (38, 45, 50, 55, 59, 64),
    "eb_standard": tuple(p - 1 for p in STANDARD_TUNING),
    "bass_standard": (28, 33, 38, 43),  # E1 A1 D2 G2
}

MAX_FRET = 22
MAX_CHORD_SPAN = 4  # frets, among non-open strings
_MAX_CANDIDATES = 24  # DP beam width per event
_MAX_CHORD_COMBOS = 400  # cap on voicing enumeration per chord

# cost weights (unitless; tuned on the unit-test riffs)
_W_MOVE = 1.0  # |hand position delta| between events
_W_FRET = 0.12  # sum of fret numbers (prefers opens / low positions)
_W_SPAN = 1.5  # fret span within a chord
_W_HIGH = 0.08  # per-fret penalty above the 12th (draft readability)


@dataclass(frozen=True)
class FrettedNote:
    pitch: int  # MIDI (after octave-clamping into the instrument range)
    string: int  # 0 = lowest-pitched string
    fret: int  # relative to capo; 0 = open


@dataclass(frozen=True)
class TabEvent:
    """One beat of the draft: a note or chord starting at `step`."""

    step: int
    dur_steps: int
    notes: tuple[FrettedNote, ...]


@dataclass(frozen=True)
class _Event:
    step: int
    dur_steps: int
    pitches: tuple[int, ...]


def group_events(
    qnotes: list[QuantNote], max_polyphony: int
) -> list[_Event]:
    """Group quantized notes by start step into note/chord events, keep the
    voice monophonic by truncating durations at the next event's start."""
    by_step: dict[int, list[QuantNote]] = {}
    for q in qnotes:
        by_step.setdefault(q.step, []).append(q)

    events: list[_Event] = []
    for step in sorted(by_step):
        group = by_step[step]
        if len(group) > max_polyphony:
            # more simultaneous notes than strings: keep the most prominent
            group = sorted(group, key=lambda q: (q.velocity, q.pitch), reverse=True)
            group = group[:max_polyphony]
        pitches = tuple(sorted({q.pitch for q in group}))
        dur = max(q.dur_steps for q in group)
        events.append(_Event(step=step, dur_steps=dur, pitches=pitches))

    for i in range(len(events) - 1):
        gap = events[i + 1].step - events[i].step
        if events[i].dur_steps > gap:
            events[i] = _Event(events[i].step, gap, events[i].pitches)
    return events


def clamp_pitch(pitch: int, tuning: tuple[int, ...], capo: int, max_fret: int = MAX_FRET) -> int:
    """Octave-shift a pitch into the instrument's playable range."""
    lo = tuning[0] + capo
    hi = tuning[-1] + capo + max_fret
    while pitch < lo:
        pitch += 12
    while pitch > hi:
        pitch -= 12
    return pitch


def _note_options(
    pitch: int, tuning: tuple[int, ...], capo: int, max_fret: int
) -> list[tuple[int, int]]:
    """All (string, fret) that sound `pitch`."""
    options = []
    for s, open_pitch in enumerate(tuning):
        fret = pitch - (open_pitch + capo)
        if 0 <= fret <= max_fret:
            options.append((s, fret))
    return options


def _chord_voicings(
    pitches: tuple[int, ...], tuning: tuple[int, ...], capo: int, max_fret: int
) -> list[tuple[FrettedNote, ...]]:
    """Enumerate playable voicings: distinct strings, fretted span <= 4."""
    per_note = [_note_options(p, tuning, capo, max_fret) for p in pitches]
    voicings: list[tuple[FrettedNote, ...]] = []

    def backtrack(i: int, used: int, picked: list[FrettedNote], lo: int, hi: int) -> None:
        if len(voicings) >= _MAX_CHORD_COMBOS:
            return
        if i == len(pitches):
            voicings.append(tuple(picked))
            return
        for s, f in per_note[i]:
            if used & (1 << s):
                continue
            new_lo, new_hi = lo, hi
            if f > 0:
                new_lo, new_hi = min(lo, f), max(hi, f)
                if new_hi - new_lo > MAX_CHORD_SPAN:
                    continue
            picked.append(FrettedNote(pitches[i], s, f))
            backtrack(i + 1, used | (1 << s), picked, new_lo, new_hi)
            picked.pop()

    backtrack(0, 0, [], 99, -1)
    return voicings


def _local_cost(voicing: tuple[FrettedNote, ...]) -> float:
    frets = [n.fret for n in voicing if n.fret > 0]
    cost = _W_FRET * sum(n.fret for n in voicing)
    if frets:
        cost += _W_SPAN * (max(frets) - min(frets))
        cost += _W_HIGH * sum(f - 12 for f in frets if f > 12)
    return cost


# a hand at position p reaches frets p..p+_HAND_SPAN without moving; must be
# >= MAX_CHORD_SPAN or a max-span chord would have no valid hand position
_HAND_SPAN = MAX_CHORD_SPAN


def _hand_options(voicing: tuple[FrettedNote, ...]) -> list[int] | None:
    """Index-finger positions that reach every fretted note, or None if the
    voicing is all open strings (hand stays wherever it was)."""
    frets = [n.fret for n in voicing if n.fret > 0]
    if not frets:
        return None
    lo, hi = min(frets), max(frets)
    start = max(1, hi - _HAND_SPAN)
    return list(range(start, lo + 1)) or [start]


def assign_frets(
    events: list[_Event],
    tuning: tuple[int, ...] = STANDARD_TUNING,
    capo: int = 0,
    max_fret: int = MAX_FRET,
) -> list[TabEvent]:
    """DP over events: choose one voicing per event minimizing local cost +
    hand movement. Pitches outside the instrument range are octave-clamped;
    chord notes that still can't be voiced together are dropped (draft)."""
    if not events:
        return []

    # candidates per event, beam-limited by local cost
    all_cands: list[list[tuple[FrettedNote, ...]]] = []
    for ev in events:
        pitches = tuple(sorted({clamp_pitch(p, tuning, capo, max_fret) for p in ev.pitches}))
        voicings = _chord_voicings(pitches, tuning, capo, max_fret)
        while not voicings and len(pitches) > 1:
            # unvoiceable cluster: drop the lowest note until playable
            pitches = pitches[1:]
            voicings = _chord_voicings(pitches, tuning, capo, max_fret)
        if not voicings:
            raise ValueError(f"Pitch {ev.pitches} unplayable with tuning {tuning} capo {capo}")
        voicings.sort(key=_local_cost)
        all_cands.append(list(islice(voicings, _MAX_CANDIDATES)))

    # DP state = (voicing candidate, hand position); movement only costs when
    # the hand window actually shifts. States are beam-pruned per event.
    n = len(events)
    beam = 40
    # rows[i] = list of (cost, hand: int | None, cand_idx, backptr into rows[i-1])
    rows: list[list[tuple[float, int | None, int, int]]] = []
    first_row: list[tuple[float, int | None, int, int]] = []
    for c_idx, cand in enumerate(all_cands[0]):
        lc = _local_cost(cand)
        hands = _hand_options(cand)
        for hand in hands if hands is not None else [None]:
            first_row.append((lc, hand, c_idx, -1))
    first_row.sort(key=lambda s: s[0])
    rows.append(first_row[:beam])

    for i in range(1, n):
        row: list[tuple[float, int | None, int, int]] = []
        prev_row = rows[i - 1]
        for c_idx, cand in enumerate(all_cands[i]):
            lc = _local_cost(cand)
            hands = _hand_options(cand)
            for hand in hands if hands is not None else [None]:
                best_cost, best_prev, best_hand = float("inf"), -1, hand
                for j, (p_cost, p_hand, _pc, _pb) in enumerate(prev_row):
                    if hand is None:
                        move, eff_hand = 0.0, p_hand  # opens keep the hand put
                    elif p_hand is None:
                        move, eff_hand = 0.0, hand
                    else:
                        move, eff_hand = _W_MOVE * abs(hand - p_hand), hand
                    total = p_cost + lc + move
                    if total < best_cost:
                        best_cost, best_prev, best_hand = total, j, eff_hand
                row.append((best_cost, best_hand, c_idx, best_prev))
        row.sort(key=lambda s: s[0])
        rows.append(row[:beam])

    # backtrack from the cheapest final state
    state = min(rows[-1], key=lambda s: s[0])
    chosen: list[tuple[FrettedNote, ...]] = [()] * n
    for i in range(n - 1, -1, -1):
        chosen[i] = all_cands[i][state[2]]
        state = rows[i - 1][state[3]] if i > 0 else state

    return [
        TabEvent(step=ev.step, dur_steps=ev.dur_steps, notes=chosen[i])
        for i, ev in enumerate(events)
    ]
