import type { Course } from '../types'

const course: Course = {
  id: 'chord-tones',
  title: 'Chord Tone Targeting',
  description:
    'Stop playing the key and start playing the changes — arpeggio maps, targeting 3rds, and the on-off method over real songs.',
  modules: [
    {
      title: 'Landing Notes',
      lessons: [
        {
          id: 'chord-tones-landing-notes',
          title: 'Why Some Notes Sound Better',
          synopsis:
            'Landing notes versus passing notes — the difference between playing the key and playing the changes.',
          blocks: [
            {
              kind: 'text',
              md: `You already know the shape. A minor pentatonic, box 1 — five notes, two per string, the pattern under a thousand solos. You met it in Pentatonic Mastery, and it works: over an A minor jam, nothing in that box sounds wrong.

But nothing sounding *wrong* isn't the same as everything sounding *good*. Try this experiment right now: play through the box slowly and hold each note for a full bar. Some notes feel finished — you could end a phrase there and it rings like home. Others feel restless, like a sentence that stops halfway through. The finished ones are **landing notes**; the restless ones are **passing notes**. Same box, same key — completely different jobs.`,
            },
            {
              kind: 'fretboard',
              spec: { type: 'scale', tonic: 'A', scale: 'minor pentatonic', box: 0 },
              caption:
                'A minor pentatonic, box 1 — five notes, but they are not all equal citizens.',
            },
            {
              kind: 'text',
              heading: 'The landing notes are the chord',
              md: `Here's the secret: the landing notes aren't random. They're the notes of the chord sounding underneath you. An A minor chord is three notes — **A, C, and E** — and while the band holds Am, those three agree with everything around them. That's why they land.

The box's other two notes, **D and G**, aren't in the chord. They're great for movement — stepping stones between chord tones — but hold one over Am and you'll feel it lean, wanting to resolve. Compare the diagram below with the box above: the **chord tones** are the box's skeleton. Strip away D and G and what's left is pure landing strip, repeating up the whole neck in every octave.`,
            },
            {
              kind: 'fretboard',
              spec: { type: 'chordTones', label: 'Am' },
              caption:
                'Every A, C, and E on the neck — the Am chord tones. Each one is a safe place to end a phrase while Am is sounding.',
            },
            {
              kind: 'text',
              heading: 'Playing the key vs playing the changes',
              md: `This is the dividing line between two ways of soloing. **Playing the key** means picking one scale that fits the song and treating every note in it as equal — it works, but every chord gets the same handful of notes and your solo floats above the song instead of locking into it. **Playing the changes** means knowing which chord is sounding *right now* and steering your phrases toward its chord tones — landing on the notes that belong, the moment they belong.

Now play this: loop box 1 slowly and end every phrase on A, C, or E. Then break the rule on purpose — end a phrase on D or G and listen to it hang in the air, unfinished. That itch you feel is the entire reason this course exists. Over the next five lessons you'll learn where the chord tones live, which one carries the most color, and how to chase them through a whole progression while a real song plays.`,
            },
            {
              kind: 'quiz',
              questions: [
                {
                  prompt: 'The Am triad is which three notes?',
                  choices: ['A–C–E', 'A–C#–E', 'A–D–G', 'A–B–C'],
                  answer: 0,
                  explanation:
                    'A minor is root A, minor 3rd C, and 5th E. Those three notes are the landing strip whenever Am is sounding.',
                },
                {
                  prompt:
                    'Over an Am chord, which A minor pentatonic notes are the passing notes?',
                  choices: ['A and E', 'C and E', 'D and G', 'A and C'],
                  answer: 2,
                  explanation:
                    'The box holds A, C, D, E, G. The chord holds A, C, E — so D and G are the two notes that want to keep moving.',
                },
                {
                  prompt: '"Playing the changes" means…',
                  choices: [
                    'Staying in one scale for the whole song',
                    'Targeting the tones of whichever chord is sounding right now',
                    'Playing faster whenever the chord changes',
                  ],
                  answer: 1,
                  explanation:
                    'Playing the key treats every scale note as equal; playing the changes aims your phrases at the current chord\'s own notes.',
                },
                {
                  prompt: 'Which note is the safest place to END a phrase while Am sounds?',
                  choices: ['D', 'G', 'C', 'B'],
                  answer: 2,
                  explanation:
                    'C is a chord tone of Am (its minor 3rd), so it lands. D and G are passing notes, and B isn\'t even in the pentatonic box.',
                },
              ],
            },
          ],
        },
        {
          id: 'chord-tones-triad-arpeggios',
          title: 'Triad Arpeggios Across the Neck',
          synopsis:
            'R-3-5 maps for C and Am across the whole neck — chords stretched out in time, where every note lands.',
          blocks: [
            {
              kind: 'text',
              md: `A **triad** is a three-note chord: a root, a 3rd, and a 5th. An **arpeggio** is that same chord played one note at a time. Strum C major and you hit C, E, and G together; arpeggiate it and you walk them — R, 3, 5 — up and down the neck like a scale that only contains the good bits.

That's the honest way to think about arpeggios: they're chords stretched out in time, and every single note is a landing note. Inside an arpeggio you literally cannot land wrong — which is exactly why soloists who sound "inside" the song lean on them so hard. Last lesson you found the Am tones hiding inside one pentatonic box; this lesson you get the whole neck, for two chords, as complete maps.`,
            },
            {
              kind: 'text',
              heading: 'Read the maps by interval, not by letter',
              md: `The two diagrams below show every C major tone and every A minor tone on the neck, labeled by **interval**: R for root, 3 or b3 for the third, 5 for the fifth. Intervals beat letter names because the pattern is movable — learn where the 3 sits relative to a root and you know it for all twelve chords.

Study both maps and you'll spot something: they share two of their three notes, C and E. That's the relative major/minor pair you met back in Foundations — C major and A minor use the same notes and only disagree about which one is the boss. Anchor each map from its roots: find the roots on the low E and A strings first, then let the 3 and 5 hang off them.`,
            },
            {
              kind: 'fretboard',
              spec: { type: 'chordTones', label: 'C' },
              showIntervals: true,
              caption: 'C major arpeggio map: C (R), E (3), G (5) everywhere on the neck.',
            },
            {
              kind: 'fretboard',
              spec: { type: 'chordTones', label: 'Am' },
              showIntervals: true,
              caption:
                'A minor arpeggio map: A (R), C (b3), E (5). Notice how much of it overlaps the C map above.',
            },
            {
              kind: 'text',
              heading: 'The arpeggio-vs-scale drill',
              md: `Here's the practice loop that makes these maps stick. Pick one position around fret 5. Play only the Am arpeggio tones there, slowly, saying the intervals out loud: *root, flat three, five*. Then play A minor pentatonic box 1 in the same spot. Then the arpeggio again. After a few rounds your ears start filing the pentatonic's D and G as decorations around a solid A–C–E frame — the box stops being five equal dots and becomes a chord with ornaments.

Do the same with C: arpeggio, box, arpeggio. Two minutes per chord, every session. Then stretch it: pick a different position — around the open frets, or up at fret 12 — and repeat. The maps above prove the tones live everywhere; the drill is what makes each neighborhood feel like home. You're not memorizing dots — you're teaching your hands where the landing strips are before the plane is in the air. Next lesson we zoom in on the one chord tone that matters most.`,
            },
            {
              kind: 'quiz',
              questions: [
                {
                  prompt: 'What are the R–3–5 of C major?',
                  choices: ['C–E–G', 'C–D–E', 'C–F–G', 'C–E–A'],
                  answer: 0,
                  explanation:
                    'C major is root C, major 3rd E, and 5th G — the three notes you strum in any C chord shape.',
                },
                {
                  prompt: 'Which two notes do C major and A minor share?',
                  choices: ['C and G', 'C and E', 'A and E', 'E and G'],
                  answer: 1,
                  explanation:
                    'C major is C–E–G; A minor is A–C–E. The overlap is C and E — the relative-pair connection from Foundations.',
                },
                {
                  prompt: 'In the Am arpeggio map, what interval label does C get?',
                  choices: ['R', 'b3', '5'],
                  answer: 1,
                  explanation:
                    'C is three frets above the root A — a minor (flat) 3rd, written b3 on the diagram.',
                },
                {
                  prompt: 'An arpeggio is…',
                  choices: [
                    'A chord played one note at a time',
                    'Any fast scale run',
                    'A strumming pattern',
                  ],
                  answer: 0,
                  explanation:
                    'Arpeggio just means the chord\'s own notes played in sequence instead of together — every note is a chord tone.',
                },
              ],
            },
          ],
        },
        {
          id: 'chord-tones-target-3rd',
          title: 'Target the 3rd',
          synopsis:
            'The 3rd is the color note — one fret decides major or minor, and it lives inside the boxes you already play.',
          blocks: [
            {
              kind: 'text',
              md: `Not all chord tones are equal. The root is home — safe, solid, and a little boring, because the bass player is already sitting on it. The 5th is neutral; it thickens the sound but says almost nothing. The **3rd** is where the color lives: it's the single note that decides whether a chord is major or minor.

The math is one fret. A **major 3rd** sits four frets above the root; a **minor 3rd** sits three. From A, four frets up is C# — that's A major. Three frets up is C — that's A minor. Everything else about the two chords is identical. Compare the two maps below and find the only dots that moved.`,
            },
            {
              kind: 'fretboard',
              spec: { type: 'chordTones', label: 'A' },
              showIntervals: true,
              caption: 'A major tones: A (R), C# (3), E (5). The 3 is the happy note.',
            },
            {
              kind: 'fretboard',
              spec: { type: 'chordTones', label: 'Am' },
              showIntervals: true,
              caption:
                'A minor tones: A (R), C (b3), E (5). Same roots, same 5ths — only the 3rd moved, down one fret.',
            },
            {
              kind: 'text',
              heading: 'Find the 3rds inside the box',
              md: `You don't need a new shape to target 3rds — they're already under your fingers. In A minor pentatonic box 1 at fret 5, the b3 (C) sits at fret 8 on the low E string, fret 5 on the G string, and fret 8 on the high E string. Find all three right now and mark them in your mind: those are the strongest color targets in the box while an Am chord sounds. Do this once per box as you revisit the other four from Pentatonic Mastery — every box holds two or three C's of its own.

Landing on the 3rd does something the root can't: it *announces the chord*. End a phrase on A over Am and you sound safe. End it on C and you sound like you know exactly what chord is playing — because you just played the note that defines it.`,
            },
            {
              kind: 'text',
              heading: 'Now play this',
              md: `Loop a slow phrase in box 1 and deliberately finish it on a C. Feel how much more it says than ending on A. Then imagine the band switches to A *major* — that same C now clashes, and it wants to slide up one fret to C#. That one-fret push is the blues players' favorite move, and it's the whole reason Blues Language spent time on the major/minor blend. Bends live here too: a slow bend from C toward C# is the sound of a chord making up its mind, and Phrasing & Composition will hand you the technique to milk it.

From here on, "target the chord tones" mostly means **target the 3rd**. Roots for safety, 5ths for filler, 3rds for meaning. Next module we put this to work inside a practice loop you can run every day.`,
            },
            {
              kind: 'quiz',
              questions: [
                {
                  prompt: 'What is the 3rd of A major?',
                  choices: ['C', 'C#', 'D', 'B'],
                  answer: 1,
                  explanation:
                    'A major 3rd is four frets (four half steps) above the root: A → A# → B → C → C#.',
                },
                {
                  prompt: 'What is the 3rd of A minor?',
                  choices: ['C', 'C#', 'E', 'G'],
                  answer: 0,
                  explanation:
                    'A minor 3rd is three frets above the root: A → A# → B → C. One fret below the major 3rd.',
                },
                {
                  prompt: 'Which interval decides whether a chord is major or minor?',
                  choices: ['The root', 'The 3rd', 'The 5th'],
                  answer: 1,
                  explanation:
                    'Root and 5th are identical in both. Major 3rd (4 frets up) = major chord; minor 3rd (3 frets up) = minor chord.',
                },
                {
                  prompt: 'What is the 3rd of C major?',
                  choices: ['D', 'E', 'F', 'G'],
                  answer: 1,
                  explanation:
                    'Four frets up from C: C → C# → D → D# → E. E is the note that makes C sound major.',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      title: 'Playing the Changes',
      lessons: [
        {
          id: 'chord-tones-on-off',
          title: 'The On-Off Method',
          synopsis:
            'Strum the chord, melodize inside it, return — the daily practice loop that welds chords and lead together.',
          blocks: [
            {
              kind: 'text',
              md: `Everything so far has been maps. This lesson is the engine that burns them in: the **on-off method**. It comes straight from campfire reality — the player who strums a chord, teases a little melody out of it, and lands back on the strum without ever losing the groove. "On" is the chord sounding. "Off" is you melodizing inside and around the shape. Then back on before the next bar starts.

The magic is that the chord shape itself hands you the chord tones. While your fingers hold Am, every fretted note *is* a landing note — melodize by lifting and re-planting fingers inside the grip, and you're targeting chord tones automatically, no thinking required.`,
            },
            {
              kind: 'fretboard',
              spec: { type: 'voicing', label: 'Am', shape: 'E' },
              caption:
                'Am, E shape — the barre at fret 5. Pentatonic box 1 wraps right around this grip, which is why it\'s the perfect on-off home base.',
            },
            {
              kind: 'text',
              heading: 'Run the loop',
              md: `Use the E-shape Am above — root at fret 5 on the low E string, the same neighborhood as box 1, so the chord and the box share real estate. The loop is dead simple:

1. Bar 1: strum Am, let it ring — that's *on*.
2. Bar 2: play a short phrase using notes of the grip plus box 1 around it — that's *off*.
3. Bar 3: land the phrase on a chord tone and strum again.
4. Repeat until it feels like one continuous piece of music, not two alternating exercises.

Keep the phrases tiny at first — three or four notes ending on A, C, or E. Fumbling the return is normal for the first few sessions; that fumble is precisely the seam you're welding shut. The win condition isn't speed, it's the seam disappearing — a listener shouldn't be able to tell where your rhythm playing stops and your lead playing starts. Start the metronome below and stay at 70 until the switch feels boring.`,
            },
            {
              kind: 'metronome',
              bpm: 70,
              label: 'On-off loop: one bar of Am strum, one bar of chord-tone melody, repeat.',
            },
            {
              kind: 'text',
              heading: 'Level it up',
              md: `When whole bars feel easy, shrink the cycle: two beats on, two beats off. Then move house. You've been playing the A-shape Am your entire life — it's the open Am chord — and the D shape puts Am up at fret 7 with the root on the D string. Run the same loop in each neighborhood and the neck stops having "chord zones" and "solo zones"; it's all one instrument.

Why does returning to the strum matter so much? Because it re-anchors your ears and your hands to the chord of the moment. Every return is a checkpoint: if your phrase can land cleanly back inside the grip, you were truly playing the changes. Next lesson we take this loop through a moving progression.`,
            },
            {
              kind: 'quiz',
              questions: [
                {
                  prompt: 'Where does the E-shape Am barre chord sit?',
                  choices: ['Fret 3', 'Fret 5', 'Fret 7', 'Fret 12'],
                  answer: 1,
                  explanation:
                    'The E shape takes its root from the low E string, and A lives at fret 5 there — so the barre lands at fret 5.',
                },
                {
                  prompt: 'The on-off loop is…',
                  choices: [
                    'Strum the chord, melodize inside it, return to the chord',
                    'Alternate between two different songs',
                    'Play the scale up, then down, then mute',
                  ],
                  answer: 0,
                  explanation:
                    '"On" is the sounding chord, "off" is a short phrase built from its tones, and the return glues them into one groove.',
                },
                {
                  prompt: 'Why do the melody notes come from inside the chord grip first?',
                  choices: [
                    'They\'re easier to reach quickly',
                    'Every fretted note in the grip is a chord tone, so every note lands',
                    'It keeps your strumming hand busy',
                  ],
                  answer: 1,
                  explanation:
                    'The chord shape is a chord-tone map under your fingers — melodizing inside it targets landing notes automatically.',
                },
                {
                  prompt: 'What does returning to the strummed chord give you?',
                  choices: [
                    'A rest for your fretting hand',
                    'A checkpoint that re-anchors you to the current chord',
                    'A louder overall sound',
                  ],
                  answer: 1,
                  explanation:
                    'Each return proves your phrase resolved back inside the chord of the moment — the core skill of playing the changes.',
                },
              ],
            },
          ],
        },
        {
          id: 'chord-tones-progressions',
          title: 'Targeting Through a Progression',
          synopsis:
            'Four chords in G — four moving targets. Learn to switch chord-tone maps at the barline.',
          blocks: [
            {
              kind: 'text',
              md: `Real songs don't sit on one chord. Take the most-used progression in pop and rock — **I–IV–V–vi** in the key of G: **G, C, D, Em**. You met Roman numerals in Diatonic Harmony; here they become a flight plan. Each chord lasts a bar, and every barline swaps the landing strip out from under you.

One scale covers all four chords — G major, or its relative E minor pentatonic — so *playing the key* is easy here. But playing the changes means something sharper: when the band moves from G to C, your target notes move too. The note B is golden over G (it's the 3rd) and merely decoration over C. Same fretboard, new map, four times over.

Read the table below like a route card before a road trip. Say each chord's three tones out loud in time — "G, B, D… C, E, G…" — before you play a single note. Naming the targets away from the guitar is half the work: when the change arrives at full speed, you want the decision already made, leaving your hands nothing to do but travel.`,
            },
            {
              kind: 'table',
              caption: 'The four triads and their chord tones. You drew C\'s full map in Lesson 2.',
              head: ['Chord', 'Numeral', 'Root', '3rd', '5th'],
              rows: [
                ['G', 'I', 'G', 'B', 'D'],
                ['C', 'IV', 'C', 'E', 'G'],
                ['D', 'V', 'D', 'F#', 'A'],
                ['Em', 'vi', 'E', 'G', 'B'],
              ],
            },
            {
              kind: 'fretboard',
              spec: { type: 'chordTones', label: 'G' },
              caption: 'G major tones (G–B–D): your map for bar 1.',
            },
            {
              kind: 'fretboard',
              spec: { type: 'chordTones', label: 'D' },
              caption: 'D major tones (D–F#–A): bar 3. F# is the color note — and it\'s not in the minor pentatonic box.',
            },
            {
              kind: 'fretboard',
              spec: { type: 'chordTones', label: 'Em' },
              caption: 'E minor tones (E–G–B): bar 4. Notice it shares G and B with the G chord — two safe notes carry over.',
            },
            {
              kind: 'text',
              heading: 'Switching at the barline',
              md: `Here's the drill, in three passes. Play the progression's roots only, one whole note per bar: G, C, D, E. Boring — and absolutely essential. That's your bass-player brain learning the route. Second pass: play each chord's **3rd** on beat 1 instead — B, E, F#, G. That single note per bar outlines the whole progression so clearly a listener could name the chords with no backing at all.

Third pass: free phrases, but aim to *arrive* on the new chord's 3rd right at the barline. The pro move is to start reaching for the next chord's tone during the last beat of the current bar, so the landing is a touchdown, not a scramble. Notice the freebies too: G and Em share two notes (G and B), so that change barely needs a course correction — while D's F# demands one, because it isn't even in the minor pentatonic box. That F# moment is the single most audible bar of the progression: nail it and everyone hears you playing the changes.

Chase these targets slowly, one chord per bar, using the on-off loop from last lesson — strum each chord on beat 1 if it helps you feel the map switch under your hands. Next lesson, Fret Lab starts moving the targets for you.`,
            },
            {
              kind: 'quiz',
              questions: [
                {
                  prompt: 'What is the 3rd of D major?',
                  choices: ['F', 'F#', 'G', 'A'],
                  answer: 1,
                  explanation:
                    'Four frets up from D: D → D# → E → F → F#. It\'s also the note that falls outside the E minor pentatonic box.',
                },
                {
                  prompt: 'The Em triad is…',
                  choices: ['E–G–B', 'E–G#–B', 'E–A–B', 'E–G–C'],
                  answer: 0,
                  explanation:
                    'E minor is root E, minor 3rd G (three frets up), and 5th B.',
                },
                {
                  prompt: 'How many notes do G major (G–B–D) and Em (E–G–B) share?',
                  choices: ['0', '1', '2'],
                  answer: 2,
                  explanation:
                    'They share G and B — which is why the G-to-Em change feels so smooth. They\'re the relative pair of the key.',
                },
                {
                  prompt: 'When should your target note switch during a progression?',
                  choices: [
                    'At the barline, when the chord changes',
                    'Every beat, no matter the chord',
                    'Only at the end of the song',
                  ],
                  answer: 0,
                  explanation:
                    'Each chord brings its own landing notes — the moment the chord changes, the map changes with it.',
                },
                {
                  prompt: 'In the key of G, the I–IV–V–vi chords are…',
                  choices: ['G, C, D, Em', 'G, A, B, Cm', 'G, C, D, E', 'G, D, Am, C'],
                  answer: 0,
                  explanation:
                    'I = G, IV = C, V = D, and vi is the relative minor, Em — the workhorse progression of pop and rock.',
                },
              ],
            },
          ],
        },
        {
          id: 'chord-tones-real-songs',
          title: 'Chord Tones over Real Songs',
          synopsis:
            'Jam Mode lights up the sounding chord\'s tones live while your song plays — here\'s how to practice with it.',
          blocks: [
            {
              kind: 'text',
              md: `Every drill so far had you tracking the chords yourself. Now Fret Lab takes a turn. In **Jam Mode**, you load a song from your library and the app's fretboard lights up the sounding chord's tones **live, as green dots**, while the music plays. The chord changes, the dots move — it's the maps from this whole course, animated in real time on top of a real recording.

That changes what practice feels like. You're no longer flipping between memorized diagrams; you're watching the landing strips relocate at every change, with the actual band underneath you. Your eyes learn the switches first, and your ears catch up fast.`,
            },
            {
              kind: 'text',
              heading: 'How to run a Jam Mode session',
              md: `Stack the deck before you play a note. Slow the song down — Fret Lab stretches time without changing pitch, so 70% speed stays in tune. Pull up the stem mixer and drop the lead guitar out of the mix so you're filling its chair, not fighting it. Loop one section — a verse or a chorus — instead of the whole song.

Then climb the same ladder you built in Lesson 5, one pass at a time:

1. **Roots only.** One green root per chord, on beat 1. You're learning the route.
2. **Add the 3rds.** Land on the color note at each change — watch for the green dot that just appeared.
3. **Free phrases.** Play whatever you hear, but *end* each phrase on a green dot. Passing notes are welcome in the middle; the landing is what you're grading.

When a phrase ends on a lit dot, you'll hear it click into the track. When it ends off the dots, you'll hear the float. That instant feedback, hundreds of times a session, is what actually builds the skill.`,
            },
            {
              kind: 'fretboard',
              spec: { type: 'chordTones', label: 'Em' },
              caption:
                'E minor tones (E–G–B) — what Jam Mode\'s green dots show whenever an Em chord is sounding.',
            },
            {
              kind: 'text',
              heading: 'Your first target: an E minor song',
              md: `Your library has E minor material, so start there. Keep E minor pentatonic under your fingers — E, G, A, B, D — and notice how it wraps the Em triad: E, G, and B are chord tones, while A and D are your built-in passing notes. On the Em bars, the box and the green dots agree almost everywhere. On the other chords, they won't — and those moments, when a green dot appears *outside* your comfortable box, are exactly where playing the changes gets real.

Run the on-off loop from Lesson 4 against the track: strum along for a bar, answer with a phrase that lands on green, return. Take the quiz, then hit the jam below. This is the payoff for the whole course — go land some notes.`,
            },
            {
              kind: 'quiz',
              questions: [
                {
                  prompt: 'In Jam Mode, the green dots on the fretboard show…',
                  choices: [
                    'Every note of the song\'s key',
                    'The tones of the chord sounding right now',
                    'The notes you played last session',
                  ],
                  answer: 1,
                  explanation:
                    'Jam Mode tracks the sounding chord and lights its chord tones live — the dots move at every change.',
                },
                {
                  prompt: 'Which E minor pentatonic notes are NOT Em chord tones?',
                  choices: ['G and B', 'A and D', 'E and B'],
                  answer: 1,
                  explanation:
                    'The box is E–G–A–B–D; the Em triad is E–G–B. A and D are the passing notes left over.',
                },
                {
                  prompt: 'What\'s the best first pass when jamming over a new looped section?',
                  choices: [
                    'Free improvisation at full speed',
                    'Roots only, one per chord, on beat 1',
                    'Copying the original solo note for note',
                  ],
                  answer: 1,
                  explanation:
                    'Roots-only at slow speed teaches you the route through the changes before you add color and phrases.',
                },
                {
                  prompt: 'When free-phrasing in Jam Mode, what should land on a green dot?',
                  choices: [
                    'Every single note you play',
                    'The last note of each phrase',
                    'Only the first note of the song',
                  ],
                  answer: 1,
                  explanation:
                    'Passing notes belong in the middle of phrases — it\'s the landing note that needs to be a chord tone.',
                },
              ],
            },
            {
              kind: 'jam',
              md: 'Fire up Jam Mode with an E minor song from your library. Keep E minor pentatonic under your fingers, slow the track down, and watch the green dots move at every change — roots first, then 3rds, then free phrases that land on green.',
              tonic: 'E',
              mode: 'minor',
              scale: 'minor pentatonic',
            },
          ],
        },
      ],
    },
  ],
}

export default course
