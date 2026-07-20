"""Score output: fretted events on a beat grid -> MusicXML (canonical, with
TAB string/fret info) and alphaTex (debug/diff).

Layout model: 4/4, one voice, 1/16 base grid. Gaps become rests; events are
split at measure boundaries and into notatable duration chunks, tied together.
"""

from dataclasses import dataclass
from xml.sax.saxutils import escape

from app.pipeline.fret_assign import TabEvent

BEATS_PER_MEASURE = 4

# duration chunks in 1/16 steps we can notate directly, largest first
_CHUNKS = (16, 12, 8, 6, 4, 3, 2, 1)
_XML_TYPE = {16: "whole", 12: "half", 8: "half", 6: "quarter", 4: "quarter",
             3: "eighth", 2: "eighth", 1: "16th"}
_XML_DOTTED = {12, 6, 3}
# alphaTex duration numbers (no dotted values — dots are split into tied beats)
_ATEX_DUR = {16: "1", 8: "2", 4: "4", 2: "8", 1: "16"}
_ATEX_CHUNKS = (16, 8, 4, 2, 1)

_STEP_NAMES = ("C", "C", "D", "D", "E", "F", "F", "G", "G", "A", "A", "B")
_STEP_ALTER = (0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0)


@dataclass(frozen=True)
class _Piece:
    """One notated beat: a chunk of an event (or rest) inside one measure."""

    start: int  # absolute step
    dur: int  # steps, always in _CHUNKS / _ATEX_CHUNKS
    notes: tuple  # FrettedNotes; empty = rest
    tie_stop: bool
    tie_start: bool


def _decompose(dur: int, chunks: tuple[int, ...]) -> list[int]:
    out = []
    for c in chunks:
        while dur >= c:
            out.append(c)
            dur -= c
    return out


def _split(start: int, dur: int, notes: tuple, steps_per_measure: int,
           chunks: tuple[int, ...]) -> list[_Piece]:
    """Split a segment at measure boundaries and into notatable chunks."""
    sizes: list[int] = []
    pos, left = start, dur
    while left > 0:
        room = steps_per_measure - (pos % steps_per_measure)
        take = min(left, room)
        sizes.extend(_decompose(take, chunks))
        pos += take
        left -= take
    pieces = []
    pos = start
    for i, size in enumerate(sizes):
        tie = bool(notes)
        pieces.append(_Piece(
            start=pos, dur=size, notes=notes,
            tie_stop=tie and i > 0, tie_start=tie and i < len(sizes) - 1,
        ))
        pos += size
    return pieces


def _layout(events: list[TabEvent], steps_per_quarter: int,
            chunks: tuple[int, ...]) -> list[list[_Piece]]:
    """Events -> measures of pieces, rests filling every gap."""
    steps_per_measure = steps_per_quarter * BEATS_PER_MEASURE
    pieces: list[_Piece] = []
    cursor = 0
    for ev in events:
        if ev.step > cursor:
            pieces.extend(_split(cursor, ev.step - cursor, (), steps_per_measure, chunks))
        pieces.extend(_split(ev.step, ev.dur_steps, ev.notes, steps_per_measure, chunks))
        cursor = ev.step + ev.dur_steps
    tail = (-cursor) % steps_per_measure
    if tail and pieces:
        pieces.extend(_split(cursor, tail, (), steps_per_measure, chunks))

    measures: list[list[_Piece]] = []
    for p in pieces:
        m = p.start // steps_per_measure
        while len(measures) <= m:
            measures.append([])
        measures[m].append(p)
    return measures or [[]]


def _pitch_xml(midi: int) -> str:
    pc, octave = midi % 12, midi // 12 - 1
    alter = f"<alter>{_STEP_ALTER[pc]}</alter>" if _STEP_ALTER[pc] else ""
    return f"<pitch><step>{_STEP_NAMES[pc]}</step>{alter}<octave>{octave}</octave></pitch>"


def _note_name(midi: int) -> str:
    pc, octave = midi % 12, midi // 12 - 1
    return f"{_STEP_NAMES[pc].lower()}{'#' if _STEP_ALTER[pc] else ''}{octave}"


def to_musicxml(
    events: list[TabEvent],
    bpm: float,
    tuning: tuple[int, ...],
    capo: int,
    title: str,
    steps_per_quarter: int = 4,
) -> str:
    n_strings = len(tuning)
    measures = _layout(events, steps_per_quarter, _CHUNKS)
    clef = (
        "<clef><sign>G</sign><line>2</line><clef-octave-change>-1</clef-octave-change></clef>"
        if n_strings >= 6
        else "<clef><sign>F</sign><line>4</line><clef-octave-change>-1</clef-octave-change></clef>"
    )
    tuning_xml = "".join(
        f'<staff-tuning line="{i + 1}">'
        f"<tuning-step>{_STEP_NAMES[p % 12]}</tuning-step>"
        + (f"<tuning-alter>{_STEP_ALTER[p % 12]}</tuning-alter>" if _STEP_ALTER[p % 12] else "")
        + f"<tuning-octave>{p // 12 - 1}</tuning-octave></staff-tuning>"
        for i, p in enumerate(tuning)
    )
    capo_xml = f"<capo>{capo}</capo>" if capo > 0 else ""
    tempo = round(bpm, 1)

    body: list[str] = []
    for m_idx, measure in enumerate(measures):
        parts = [f'<measure number="{m_idx + 1}">']
        if m_idx == 0:
            parts.append(
                f"<attributes><divisions>{steps_per_quarter}</divisions>"
                "<key><fifths>0</fifths></key>"
                f"<time><beats>{BEATS_PER_MEASURE}</beats><beat-type>4</beat-type></time>"
                f"{clef}"
                f"<staff-details><staff-lines>{n_strings}</staff-lines>{tuning_xml}{capo_xml}"
                "</staff-details></attributes>"
                '<direction placement="above"><direction-type><metronome>'
                f"<beat-unit>quarter</beat-unit><per-minute>{tempo}</per-minute>"
                f'</metronome></direction-type><sound tempo="{tempo}"/></direction>'
            )
        for piece in measure:
            note_type = _XML_TYPE[piece.dur]
            dot = "<dot/>" if piece.dur in _XML_DOTTED else ""
            if not piece.notes:
                parts.append(
                    f"<note><rest/><duration>{piece.dur}</duration>"
                    f"<type>{note_type}</type>{dot}</note>"
                )
                continue
            for i, fn in enumerate(piece.notes):
                chord = "<chord/>" if i > 0 else ""
                ties, tieds = "", ""
                if piece.tie_stop:
                    ties += '<tie type="stop"/>'
                    tieds += '<tied type="stop"/>'
                if piece.tie_start:
                    ties += '<tie type="start"/>'
                    tieds += '<tied type="start"/>'
                technical = (
                    f"<technical><string>{n_strings - fn.string}</string>"
                    f"<fret>{fn.fret}</fret></technical>"
                )
                parts.append(
                    f"<note>{chord}{_pitch_xml(fn.pitch)}"
                    f"<duration>{piece.dur}</duration>{ties}"
                    f"<type>{note_type}</type>{dot}"
                    f"<notations>{tieds}{technical}</notations></note>"
                )
        parts.append("</measure>")
        body.append("".join(parts))

    instrument = "Guitar" if n_strings >= 6 else "Bass"
    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<score-partwise version="3.1">'
        f"<movement-title>{escape(title)}</movement-title>"
        f'<part-list><score-part id="P1"><part-name>{instrument}</part-name>'
        "</score-part></part-list>"
        f'<part id="P1">{"".join(body)}</part>'
        "</score-partwise>\n"
    )


def to_alphatex(
    events: list[TabEvent],
    bpm: float,
    tuning: tuple[int, ...],
    capo: int,
    title: str,
    steps_per_quarter: int = 4,
) -> str:
    n_strings = len(tuning)
    measures = _layout(events, steps_per_quarter, _ATEX_CHUNKS)
    # alphaTex lists tuning from string 1 (highest) down
    tuning_names = " ".join(_note_name(p) for p in reversed(tuning))
    header = [f'\\title "{title}"', f"\\tempo {round(bpm)}", f"\\tuning {tuning_names}"]
    if capo > 0:
        header.append(f"\\capo {capo}")
    bars: list[str] = []
    for measure in measures:
        beats: list[str] = []
        for piece in measure:
            dur = _ATEX_DUR[piece.dur]
            if not piece.notes:
                beats.append(f"r.{dur}")
            elif len(piece.notes) == 1:
                fn = piece.notes[0]
                fret = "-" if piece.tie_stop else str(fn.fret)
                beats.append(f"{fret}.{n_strings - fn.string}.{dur}")
            else:
                inner = " ".join(
                    f"{'-' if piece.tie_stop else fn.fret}.{n_strings - fn.string}"
                    for fn in piece.notes
                )
                beats.append(f"({inner}).{dur}")
        bars.append(" ".join(beats) if beats else f"r.{_ATEX_DUR[16]}")
    return "\n".join(header) + "\n.\n" + " |\n".join(bars) + "\n"
