import type { Course } from '../types'

const course: Course = {
  id: 'phrasing',
  title: 'Phrasing & Composition',
  description:
    'Notes into music: motifs, question-and-answer phrasing, bends and vibrato, rhythm, and composing a complete solo.',
  modules: [
    {
      title: 'Speaking in Phrases',
      lessons: [
        {
          id: 'phrasing-motifs',
          title: 'Motifs: Say Something Small',
          synopsis: 'A three-to-five-note idea, repeated and varied, beats a hundred random scale notes.',
          blocks: [
            {
              kind: 'text',
              md: `You know the scales. You know the chord tones. So why do your solos still sound like scale practice? Because scales are an alphabet, not a language. Nobody listens to the alphabet — they listen to sentences. This course is about building those sentences, and it starts with the smallest one possible.

A **motif** is a short musical idea — three to five notes with a definite rhythm. Think of the four-note opening of Beethoven's Fifth, or the two-bar riff that carries an entire rock song. Small enough to remember instantly, strong enough to build on. Great soloists don't play more ideas than beginners; they play fewer ideas *better*.`,
            },
            {
              kind: 'text',
              heading: 'Repeat it, then bend it',
              md: `The magic of a motif isn't the notes — it's what you do next. First you **repeat** it, exactly. Repetition tells the listener "that wasn't an accident, that's the idea." Then you **vary** it: keep it recognizable but change one thing. Change the rhythm. Change just the last note. Add one note as an ornament. Each variation says something new while the listener still hears the original underneath.

The third tool is **transposition**: play the same shape of idea starting from a different note in the scale, or jump it up an octave. Same sentence, different pitch — instantly familiar and fresh at once. String these three moves together — state, repeat, vary, transpose — and a five-second idea becomes a thirty-second solo section that actually goes somewhere.

Here's your palette. It's Box 1 of A minor pentatonic — the same five notes you drilled in Pentatonic Mastery. Five notes is plenty. Beethoven used four.`,
            },
            {
              kind: 'fretboard',
              spec: { type: 'scale', tonic: 'A', scale: 'minor pentatonic', box: 0 },
              caption: 'A minor pentatonic, Box 1 (frets 5-8) — your entire palette for this lesson. Pick any 3-5 of these notes.',
            },
            {
              kind: 'text',
              heading: 'The drill: one motif, four variations',
              md: `Where do good motifs come from? Sing before you play. Hum any short phrase — even nonsense — then hunt down those pitches inside the box. A motif you can sing is a motif a listener can remember; a motif your fingers invented by pattern-running usually isn't.

Pick three or four notes from the box and give them a rhythm you can sing. That's your motif. Now play this sequence, two bars each:

1. The motif, exactly as written.
2. The motif again, note for note — earn the repetition.
3. Same notes, new rhythm — stretch one note longer, or chop one in two.
4. Same rhythm, but change only the final note.
5. The whole idea moved up an octave, or started from the next scale note up.

If a stranger could hum your motif back after hearing the drill, you did it right. If it dissolved into noodling, shrink the idea and try again. Smaller is stronger.`,
            },
            {
              kind: 'quiz',
              questions: [
                {
                  prompt: 'A motif is best described as…',
                  choices: [
                    'A full solo you memorize note for note',
                    'A short three-to-five-note idea with a definite rhythm',
                    'A scale pattern played as fast as possible',
                    'Any note from the pentatonic box',
                  ],
                  answer: 1,
                  explanation: 'A motif is a small, memorable idea — short enough to repeat, strong enough to build a whole solo from.',
                },
                {
                  prompt: 'You play your motif, then play it again with the same notes but a new rhythm. That is…',
                  choices: ['A brand-new motif', 'A variation', 'Transposition', 'A cadence'],
                  answer: 1,
                  explanation: 'Changing one element (here, the rhythm) while keeping the idea recognizable is variation — the core move of motif development.',
                },
                {
                  prompt: 'Moving your motif so it starts on a higher note of the scale is called…',
                  choices: ['Syncopation', 'Vibrato', 'Transposition', 'Resolution'],
                  answer: 2,
                  explanation: 'Transposition replays the same idea from a different starting pitch — same sentence, new register.',
                },
                {
                  prompt: 'Why repeat a motif exactly before varying it?',
                  choices: [
                    'To fill time while you think of the next lick',
                    'So the listener recognizes it as the idea, not an accident',
                    'Because scales must always be played twice',
                    'To keep your pick hand warmed up',
                  ],
                  answer: 1,
                  explanation: 'Repetition plants the idea in the listener’s ear. Only after they know it can a variation mean anything.',
                },
              ],
            },
            {
              kind: 'jam',
              md: 'Take the drill to a real song: pick one motif in E minor pentatonic Box 1 and spend a whole verse on nothing but that motif and its variations. Boring is impossible — commit to it.',
              tonic: 'E',
              mode: 'minor',
              scale: 'minor pentatonic',
            },
          ],
        },
        {
          id: 'phrasing-question-answer',
          title: 'Question & Answer',
          synopsis: 'Pair your phrases: a question that leaves tension hanging, an answer that resolves it.',
          blocks: [
            {
              kind: 'text',
              md: `Listen to any great blues solo and you'll hear a conversation: a phrase that ends hanging in the air, then a second phrase that settles it. That pairing is **question and answer** — the oldest structure in music, and the fastest way to make two phrases sound like they belong together.

What makes a phrase feel like a question? Where it *ends*. You met this in Chord Tone Targeting: some notes feel like home, others feel like they're leaning somewhere. End a phrase on an unstable note and the listener's ear waits for more. End the next phrase on a stable note and the ear relaxes. Tension, then resolution — that's the whole trick.

This isn't a guitar invention. It's call and response — gospel choirs, field hollers, a singer trading lines with a horn section. When you solo alone, you're playing both roles: you ask, then you answer yourself. Get this one structure into your hands and even a two-phrase solo sounds intentional instead of accidental.`,
            },
            {
              kind: 'text',
              heading: 'Stable and unstable in A minor',
              md: `Over an A minor chord, the stable notes are the chord tones — above all the **root** (A) and the **5th** (E). The b3 (C) is a chord tone too: settled, just softer. The unstable notes are the 4 (D) and the b7 (G): both sit outside the chord and pull toward a neighbor. The b7 leans up to the root; the 4 leans toward the 5.

Look at the intervals in the box below. Every R and 5 is an answer waiting to happen. Every 4 and b7 is a question mark. One warning from Chord Tone Targeting still applies: stability depends on the chord underneath, not just the key. When the song moves to a new chord, that chord's tones become the stable landing spots. Over a static A minor groove, though, the table below is your map.`,
            },
            {
              kind: 'fretboard',
              spec: { type: 'scale', tonic: 'A', scale: 'minor pentatonic', box: 0 },
              showIntervals: true,
              caption: 'Box 1 with intervals shown. End questions on 4 or b7; end answers on R or 5.',
            },
            {
              kind: 'table',
              caption: 'How each pentatonic interval feels as a phrase ending, over the A minor chord.',
              head: ['Interval', 'Note in A minor', 'As a phrase ending'],
              rows: [
                ['R', 'A', 'Fully resolved — home'],
                ['b3', 'C', 'Settled, with color — a chord tone'],
                ['4', 'D', 'Suspended — leans toward the 5'],
                ['5', 'E', 'Solid and stable'],
                ['b7', 'G', 'Unresolved — leans up to the root'],
              ],
            },
            {
              kind: 'text',
              heading: 'The drill: two bars asking, two bars answering',
              md: `Set the metronome below. Play a two-bar phrase that ends on D or G and *stop* — let the tension hang through the silence. Then play a two-bar answer that ends on A or E. For maximum effect, make the answer a variation of the question (Lesson 1!): same idea, different ending. That's a matched pair, not two strangers.

Do eight pairs in a row. Breathe in the gaps — the silence between question and answer is part of the music. When a pair falls flat, diagnose the ending first: nine times out of ten the question resolved too early, or the answer never landed anywhere at all.`,
            },
            {
              kind: 'metronome',
              bpm: 70,
              label: '2-bar question ending on 4 or b7, 2-bar answer ending on R or 5 — eight pairs.',
            },
            {
              kind: 'quiz',
              questions: [
                {
                  prompt: 'Which two notes are the most stable phrase endings in A minor pentatonic over an Am chord?',
                  choices: ['D and G', 'A and E', 'C and D', 'G and C'],
                  answer: 1,
                  explanation: 'A (root) and E (5th) are the strongest chord tones — ending on them resolves the phrase completely.',
                },
                {
                  prompt: 'A question phrase should end on…',
                  choices: [
                    'The root, always',
                    'An unstable note that leaves tension hanging',
                    'The lowest note in the box',
                    'A rest with no note at all',
                  ],
                  answer: 1,
                  explanation: 'The unresolved ending is what makes it feel like a question — the ear waits for the answer to resolve it.',
                },
                {
                  prompt: 'In A minor pentatonic, the b7 (G) at a phrase end feels like it wants to…',
                  choices: ['Stay put — it is home', 'Pull up to the root, A', 'Drop to the 4, D', 'Become a new key'],
                  answer: 1,
                  explanation: 'The b7 sits one whole step under the root and leans up into it — a classic setup note for a resolution.',
                },
                {
                  prompt: 'The strongest way to link an answer phrase to its question is to…',
                  choices: [
                    'Play it in a different key',
                    'Make it a variation of the question with a stable ending',
                    'Play it twice as fast',
                    'Use completely different notes',
                  ],
                  answer: 1,
                  explanation: 'Reusing the question’s idea and changing the ending ties the pair together — motif development meets resolution.',
                },
              ],
            },
          ],
        },
        {
          id: 'phrasing-bends-vibrato',
          title: 'Bends & Vibrato: Your Voice',
          synopsis: 'Bend to real scale targets and shake notes on purpose — the two moves that make a guitar sing.',
          blocks: [
            {
              kind: 'text',
              md: `A piano can't do what you're about to do. **Bending** — pushing a string sideways to raise its pitch — is the closest a guitar gets to a human voice, and it's where most players either sing or squawk. The difference is one rule: *a bend is a note, not an effect*. Every bend must land on a pitch you could have played by fretting — you're just arriving by sliding up to it through the air instead of hopping frets.

That means bend targets aren't a matter of feel. They're on the map. Look at the intervals below and you can read them straight off the diagram.`,
            },
            {
              kind: 'fretboard',
              spec: { type: 'scale', tonic: 'A', scale: 'minor pentatonic', box: 0 },
              showIntervals: true,
              caption: 'Box 1 with intervals. Every bend should land on one of these — usually the next scale note up from where you started.',
            },
            {
              kind: 'text',
              heading: 'The three money bends in Box 1',
              md: `Find the 4 — that's D, fret 7 on the G string. Its neighbor in the scale is the 5 (E), a **whole step** up. Bend D until it *becomes* E and you've played the single most famous bend in rock.

Find the b7 — G, fret 8 on the B string. A whole step up is the root, A. Bending b7 into R resolves tension in one gesture: it's a question and answer in a single note.

Find the b3 — C, fret 8 on the high E string. Here's the subtle one: nudge it just a **quarter to a half step**, toward the major 3rd (C#), without fully arriving. That's the *curl* — the between-major-and-minor smear you met in Blues Language. Full whole-step bends from the b3 land on the 4 instead.`,
            },
            {
              kind: 'table',
              caption: 'Bend targets in A minor pentatonic, Box 1.',
              head: ['Start', 'Where', 'Bend', 'Target'],
              rows: [
                ['4 (D)', 'G string, fret 7', 'Whole step', '5 (E)'],
                ['b7 (G)', 'B string, fret 8', 'Whole step', 'R (A)'],
                ['b3 (C)', 'high E string, fret 8', 'Quarter-to-half curl', 'toward 3 (C#)'],
              ],
            },
            {
              kind: 'text',
              heading: 'Tune every bend, then add vibrato',
              md: `Here's how to never bend out of tune again: play the *target* fret first — fret 9 on the G string for that D-to-E bend — listen hard, then bend fret 7 until the pitches match. Do it ten times slowly. Your fingers are learning exactly how far a whole step feels, and that calibration transfers everywhere on the neck.

**Vibrato** is the same skill miniaturized: a controlled, rhythmic wobble of pitch — tiny repeated bends and releases. Controlled is the key word. Slow and wide sounds vocal and bluesy; fast and narrow sounds nervous and electric; random shaking just sounds out of tune. Practice it as a rhythm: bend-release, bend-release, in time, on a long note at the end of a phrase. A phrase that ends with singing vibrato sounds finished. One that ends with a dead note sounds abandoned.

Now play this: the question-and-answer drill from last lesson, but end the answer with the b7-to-root bend, then hold the landing note with slow vibrato.`,
            },
            {
              kind: 'quiz',
              questions: [
                {
                  prompt: 'You bend D (fret 7, G string) up a whole step. What note should you hear?',
                  choices: ['C', 'D#', 'E', 'F'],
                  answer: 2,
                  explanation: 'A whole step above D is E — the 5th of A minor. Check it against fret 9 on the same string.',
                },
                {
                  prompt: 'The best way to check a bend is in tune is to…',
                  choices: [
                    'Bend as far as the string physically allows',
                    'Play the target fret first, then bend until the pitches match',
                    'Watch how far your finger travels',
                    'Always bend exactly two frets of distance',
                  ],
                  answer: 1,
                  explanation: 'Your ear is the reference. Hearing the target pitch first, then matching it, calibrates the bend every time.',
                },
                {
                  prompt: 'Bending the b7 (G) up a whole step lands on…',
                  choices: ['The 5 (E)', 'The root (A)', 'The b3 (C)', 'The 4 (D)'],
                  answer: 1,
                  explanation: 'G is one whole step below A. Bending b7 into the root resolves tension inside a single note.',
                },
                {
                  prompt: 'Good vibrato is…',
                  choices: [
                    'Random shaking added to every note',
                    'A controlled, rhythmic bend-and-release of pitch',
                    'Only possible with a tremolo bar',
                    'The same thing as a whole-step bend',
                  ],
                  answer: 1,
                  explanation: 'Vibrato is deliberate: small pitch wobbles in time. Control — width and speed on purpose — is what separates singing from shaking.',
                },
              ],
            },
            {
              kind: 'jam',
              md: 'Jam over an A major song with A minor pentatonic — the blues blend from Blues Language. Curl every b3 toward the major 3rd, and finish phrases with the b7-to-root bend plus vibrato.',
              tonic: 'A',
              mode: 'major',
              scale: 'minor pentatonic',
            },
          ],
        },
      ],
    },
    {
      title: 'From Phrases to Solos',
      lessons: [
        {
          id: 'phrasing-rhythm',
          title: 'Rhythm Before Notes',
          synopsis: 'The same three notes with different rhythm is different music — space and syncopation are your sharpest tools.',
          blocks: [
            {
              kind: 'text',
              md: `Here's an uncomfortable truth: listeners forgive a wrong note instantly, but they never forgive bad rhythm. **Rhythm** — where your notes start, how long they last, and where you leave silence — carries more of your musical identity than note choice ever will. Take any three notes from the box and play them as even quarter notes: a scale exercise. Play the same three notes as a long note, a pause, then two quick stabs: suddenly it's music. Same pitches. Different rhythm. Different song.

The most overlooked rhythm tool is **space** — the deliberate silence between phrases. Every legendary soloist leaves gaps you could drive a truck through. Silence frames a phrase the way white space frames a headline: without it, everything shouts and nothing is heard.`,
            },
            {
              kind: 'fretboard',
              spec: { type: 'scale', tonic: 'A', scale: 'minor pentatonic', box: 0 },
              caption: 'Pick exactly three notes from Box 1 — say C and D on the G string plus E on the B string — and freeze them for this whole lesson. Only the rhythm changes.',
            },
            {
              kind: 'text',
              heading: 'Off the beat: syncopation',
              md: `Most beginners start every phrase on beat 1. It's the musical equivalent of starting every sentence with "So…". **Syncopation** means accenting the off-beats — the "&" counts between the numbers — and the simplest way in is to start your phrase there. Count "1 & 2 & 3 & 4 &" out loud, then begin your phrase on the "&" of 1. That tiny shift makes the same notes lean forward instead of marching.

Where do good rhythms come from? Steal them. Vocal melodies are a goldmine: take the rhythm of a sung line you love — just the rhythm, not the pitches — and pour your three notes into it. Speech works too: say a sentence out loud and play its syllables. Rhythms borrowed from voices always breathe, because voices have to.

Compare the two phrases below. Same three attacks, but Phrase B starts off the beat and lands in different slots — it grooves where Phrase A plods.`,
            },
            {
              kind: 'table',
              caption: 'Two rhythms for the same three notes. X marks where a note starts.',
              head: ['Count', '1', '&', '2', '&', '3', '&', '4', '&'],
              rows: [
                ['Phrase A', 'X', '', 'X', '', 'X', '', '', ''],
                ['Phrase B', '', 'X', '', 'X', '', '', 'X', ''],
              ],
            },
            {
              kind: 'text',
              heading: 'The drill: three notes, sixty beats per minute',
              md: `Set the metronome to 60 — slow enough that you can feel every "&". Using only your three frozen notes, play one bar of rhythm, then one full bar of silence. Every phrase must use a different rhythm: start on the beat, start on the "&" of 1, hold one note across beat 3, end before beat 4 and let it ring. Ten phrases, ten rhythms, zero new notes.

If you're tempted to add notes, you're dodging the real work. Rhythm is the muscle this drill trains — three notes is all the melody you get. And notice how quickly ten distinct phrases appear: that's the lesson. You were never short on notes. You were short on rhythms.`,
            },
            {
              kind: 'metronome',
              bpm: 60,
              label: 'Three notes only: one bar of rhythm, one bar of silence, new rhythm every phrase.',
            },
            {
              kind: 'quiz',
              questions: [
                {
                  prompt: 'Playing the same three notes with a different rhythm gives you…',
                  choices: [
                    'The same phrase — only pitch matters',
                    'A genuinely different musical phrase',
                    'A key change',
                    'A transposition',
                  ],
                  answer: 1,
                  explanation: 'Rhythm carries as much identity as pitch. New rhythm, new music — that’s why the drill freezes the notes.',
                },
                {
                  prompt: 'Syncopation means…',
                  choices: [
                    'Playing as fast as possible',
                    'Accenting the off-beats — the "&" counts',
                    'Always starting on beat 1',
                    'Playing without a metronome',
                  ],
                  answer: 1,
                  explanation: 'Syncopation shifts emphasis onto the weak part of the beat, which is what makes a phrase lean and groove.',
                },
                {
                  prompt: 'The most overlooked phrasing tool is…',
                  choices: ['More notes per bar', 'Higher frets', 'Deliberate silence between phrases', 'Faster tempo'],
                  answer: 2,
                  explanation: 'Space frames your phrases. Without gaps, even great lines blur into noise.',
                },
                {
                  prompt: 'Starting your phrase on the "&" of 1 instead of on beat 1 is an example of…',
                  choices: ['Starting off the beat', 'A bend', 'Transposition', 'A cadence'],
                  answer: 0,
                  explanation: 'Beginning on an off-beat is the simplest syncopation — same notes, instantly more forward motion.',
                },
              ],
            },
          ],
        },
        {
          id: 'phrasing-solo-arc',
          title: 'Building a Solo Arc',
          synopsis: 'Shape a solo like a story: climb the register, thicken the phrases, hit one peak, come home.',
          blocks: [
            {
              kind: 'text',
              md: `Phrases are sentences. A solo is the whole speech — and speeches have shape. The classic solo **arc** does two things at once as it unfolds: it *climbs in register*, starting low on the neck and ending high, and it *thickens in density*, starting with sparse, spacious phrases and building toward busier ones. Both curves rise together toward a single **peak** — the highest, most intense moment — then release.

One peak. Not three. A solo that peaks in bar two has nowhere to go; a solo with three climaxes has none. Decide where your peak lives (usually about three-quarters of the way through) and make everything before it a climb and everything after it a landing. Next time a favorite solo comes on, listen for exactly this: where it starts on the neck, where the single loudest moment lands, and how it gets home afterward. The arc is hiding in almost every solo you love.`,
            },
            {
              kind: 'text',
              heading: 'The five boxes as floors of a building',
              md: `You already own the elevator. In Pentatonic Mastery you connected the five boxes of A minor pentatonic into one map of the neck — now think of those boxes as **floors of a building**. Box 1 at frets 5-8 is the ground floor: home base, where solos start and end. Boxes 2 and 3 are the middle floors. Boxes 4 and 5 are the penthouse, where the thin strings scream and your biggest bend lives.

An arc is just a trip through the building: start on the ground floor with roomy, vocal phrases; take the stairs up a box at a time as the phrases tighten; step out at the top for the peak — one huge bend with vibrato, the highest root you can find; then ride back down to Box 1 to land the final answer phrase on the root. Look at the whole neck below and trace that trip with your eyes before your fingers.`,
            },
            {
              kind: 'fretboard',
              spec: { type: 'scale', tonic: 'A', scale: 'minor pentatonic' },
              caption: 'A minor pentatonic across the whole neck. Low frets = ground floor, high frets = penthouse. An arc is one trip up and back.',
            },
            {
              kind: 'text',
              heading: 'The drill: an eight-bar arc',
              md: `Sketch this before you play it — composers write; that's next lesson's secret too:

1. Bars 1-2: ground floor. One motif, low in Box 1, lots of space.
2. Bars 3-4: repeat the motif with a variation, moving into Box 2.
3. Bars 5-6: climb through Box 3 or 4, phrases getting busier and more insistent.
4. Bar 7: the peak — highest register, your D-to-E bend an octave up, maximum vibrato.
5. Bar 8: fall back to Box 1 and resolve on the root. Silence. Done.

Play it three times. The notes can change every pass — the *shape* must not. When the arc is in your hands, take it to a song below.`,
            },
            {
              kind: 'quiz',
              questions: [
                {
                  prompt: 'Across a classic solo arc, register and phrase density both…',
                  choices: [
                    'Stay constant for consistency',
                    'Rise together toward one peak, then release',
                    'Fall steadily from a loud start',
                    'Alternate randomly to surprise the listener',
                  ],
                  answer: 1,
                  explanation: 'Climbing pitch and thickening phrases are the two curves of the arc — they crest together at the single peak.',
                },
                {
                  prompt: 'How many peaks should a short solo have?',
                  choices: ['One', 'One per bar', 'At least three', 'None — peaks are for vocalists'],
                  answer: 0,
                  explanation: 'A single climax gives the solo a destination. Multiple climaxes compete and cancel each other out.',
                },
                {
                  prompt: 'In the building metaphor, the five pentatonic boxes are…',
                  choices: [
                    'Five different keys',
                    'Floors — routes from low register up to high',
                    'Five different chords',
                    'Interchangeable — register doesn’t matter',
                  ],
                  answer: 1,
                  explanation: 'Each box sits higher on the neck than the last, so moving box to box is how you climb the register on purpose.',
                },
                {
                  prompt: 'Roughly where in the solo should the peak usually land?',
                  choices: ['In the first bar', 'About three-quarters of the way through', 'Exactly halfway', 'After the solo ends'],
                  answer: 1,
                  explanation: 'Peaking around the three-quarter mark leaves room to climb before it and just enough room to land after it.',
                },
              ],
            },
            {
              kind: 'jam',
              md: 'Play the eight-bar arc over a real song in E minor: start low in Box 1, climb a box every two bars, peak high with one big bend, land back home on E.',
              tonic: 'E',
              mode: 'minor',
              scale: 'minor pentatonic',
            },
          ],
        },
        {
          id: 'phrasing-compose',
          title: 'Compose a Solo',
          synopsis: 'The capstone: combine targeting, motifs, and the arc into a written solo using the full Fret Lab workflow.',
          blocks: [
            {
              kind: 'text',
              md: `Here's the secret nobody tells beginners: most of the famous "improvised" solos you love were **composed** — written, edited, and rehearsed like a melody. Improvising in real time is spontaneous composition; composing is improvising with an undo button. Practice the slow version and the fast version gets better for free.

You now hold every tool this curriculum has built: chord-tone targeting from Chord Tone Targeting, motifs and question-answer pairs from this course, bends and vibrato for delivery, rhythm for identity, and the arc for large-scale shape. Time to aim all of it at one real song and write a solo you can stand behind.`,
            },
            {
              kind: 'text',
              heading: 'The five-step Fret Lab workflow',
              md: `1. **Loop it.** Pick a song in your library and set an A-B loop around one section — a verse or a chorus, eight bars or so. This is your canvas; you'll hear it a hundred times, and that's the point.
2. **Slow it down.** Drop playback to 70 percent — the pitch stays put, so your ear stays honest. At slow speed you can hear each chord arrive and pick real landing notes for each change.
3. **Explore in jam mode.** Pull up the scale over the section and hunt for a motif — three to five notes that feel like they belong to this song. Don't write yet. Just find the idea.
4. **Write it phrase by phrase.** Two bars at a time: a question ending unstable, an answer ending on a chord tone of the bar it lands in. Build the arc across the section — ground floor first, one peak near the end. Repeat each phrase until it's a decision, not an accident.
5. **Speed-train it back up.** Raise playback speed in small steps — five percent at a time, only after a clean pass. By the time you're back at full tempo, the solo is in your hands, not just your head.`,
            },
            {
              kind: 'text',
              heading: 'Your assignment: G minor',
              md: `Your target key is G minor — pick a G minor song from your library below. The map is the same shape you've used all course, shifted so the roots sit on G: Box 1 lives at fret 3. Same intervals, same bend targets (the 4 bends to the 5, the b7 bends to the root), one whole map down two frets.

Sketch the arc, write four question-answer pairs, place the peak in the last quarter, and end on G with vibrato. Then speed-train it with the metronome habit below until full tempo feels easy. When it does, you haven't just learned a solo — you've learned how to make one, and that skill transfers to every song you'll ever loop.`,
            },
            {
              kind: 'fretboard',
              spec: { type: 'scale', tonic: 'G', scale: 'minor pentatonic' },
              caption: 'G minor pentatonic across the whole neck — your map for the capstone. Box 1 sits at fret 3; the arc climbs from there.',
            },
            {
              kind: 'metronome',
              bpm: 80,
              label: 'Speed training: run the written solo, add ~5 bpm only after a fully clean pass.',
            },
            {
              kind: 'quiz',
              questions: [
                {
                  prompt: 'What is the first step of the composing workflow?',
                  choices: [
                    'Speed-train the solo to full tempo',
                    'Loop one section of the song',
                    'Write the peak first',
                    'Pick a new scale for every bar',
                  ],
                  answer: 1,
                  explanation: 'Everything starts with an A-B loop around one section — a fixed canvas you can hear over and over while you work.',
                },
                {
                  prompt: 'Why slow the loop down while writing?',
                  choices: [
                    'Slow songs are more fashionable',
                    'It changes the key to an easier one',
                    'You can hear each chord change and choose landing notes — pitch stays the same',
                    'It makes bends physically easier',
                  ],
                  answer: 2,
                  explanation: 'Time-stretching keeps the pitch intact while giving your ear room to catch every change and target it deliberately.',
                },
                {
                  prompt: 'When writing phrase by phrase, each answer phrase should land on…',
                  choices: [
                    'Any note, as long as it is fast',
                    'A chord tone of the bar it lands in',
                    'The highest note in the box',
                    'An open string',
                  ],
                  answer: 1,
                  explanation: 'That is chord-tone targeting doing its job inside the question-answer frame — resolutions land on the current chord.',
                },
                {
                  prompt: 'The right way to bring a written solo back to full tempo is…',
                  choices: [
                    'Jump straight to full speed and repeat until it sticks',
                    'Raise the speed in small steps, only after clean passes',
                    'Skip the hard phrases at higher speeds',
                    'Practice it without the backing track only',
                  ],
                  answer: 1,
                  explanation: 'Small increments after clean passes build accuracy into the speed. Jumping ahead just rehearses mistakes faster.',
                },
                {
                  prompt: 'In G minor pentatonic, the whole-step bend targets are…',
                  choices: [
                    'Different in every key',
                    'The same intervals as in A minor: 4 up to 5, b7 up to the root',
                    'Only available above fret 12',
                    'Half steps instead of whole steps',
                  ],
                  answer: 1,
                  explanation: 'Intervals travel with the shape. Shift the map so the roots are G and the 4-to-5 and b7-to-root bends sit in the same spots of the box.',
                },
              ],
            },
            {
              kind: 'jam',
              md: 'The capstone jam: loop a G minor song, run the five-step workflow, and perform your written solo end to end at full tempo — arc, bends, vibrato, and a final G that rings.',
              tonic: 'G',
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
