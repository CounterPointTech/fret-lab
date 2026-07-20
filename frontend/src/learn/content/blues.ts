import type { Course } from '../types'

const course: Course = {
  id: 'blues',
  title: 'Blues Language',
  description:
    'The blue note, the 12-bar form, dominant 7ths, and the major/minor blend — the vocabulary underneath rock, blues, and everything between.',
  modules: [
    {
      title: 'The Sound',
      lessons: [
        {
          id: 'blues-blue-note',
          title: 'The Blue Note',
          synopsis:
            'One extra note turns the minor pentatonic into the blues scale — learn where it lives and how to pass through it.',
          blocks: [
            {
              kind: 'text',
              md: `You already own the most important shape in this course: minor pentatonic box 1, the one you drilled in Pentatonic Mastery. The blues scale is that exact shape plus **one note**. That's it. Five notes become six, and the whole thing suddenly sounds like the blues instead of just sounding minor.

The new note is the **blue note** — the flat five (b5). In A, your minor pentatonic is A, C, D, E, G. The blues scale wedges an Eb between the D and the E. That D-to-E gap is a whole step with an empty fret in the middle, and the blue note fills it with the most tense interval in music: the tritone against your root.`,
            },
            {
              kind: 'fretboard',
              spec: { type: 'scale', tonic: 'A', scale: 'minor pentatonic', box: 0 },
              caption: 'A minor pentatonic, box 1 — the shape you already know.',
            },
            {
              kind: 'fretboard',
              spec: { type: 'scale', tonic: 'A', scale: 'blues', box: 0 },
              caption: 'A blues scale, same box — spot the new note wedged between the 4th and 5th.',
              showIntervals: true,
            },
            {
              kind: 'text',
              heading: 'Where it lives in the box',
              md: `Compare the two diagrams above. Every blue note sits exactly one fret above a note you already play: on the A string it's fret 6, one fret above the D at fret 5. Find the same pair everywhere it appears in the box — the b5 always lives in that crack between the 4 and the 5.

Play the box slowly and, every time you reach a D, slide up one fret to the Eb and then continue to the E. You're not learning a new shape; you're decorating one you own.`,
            },
            {
              kind: 'text',
              heading: 'Passing color, not a landing pad',
              md: `Here's the rule that separates blues players from people running scales: the blue note is a **passing tone**. You move *through* it — slide into it, bend through it, chromatic-walk D–Eb–E — but you don't stop and sit on it. Park on the b5 and it stops sounding bluesy and starts sounding wrong; brush past it and it drips attitude.

Try this crawl right now: play D (A string, fret 5), Eb (fret 6), E (fret 7) as one smooth slide, then land on the E and let it ring. Then reverse it: E, Eb, D. That three-note move — up and down — is maybe the single most-used lick in blues. End every run on a pentatonic note; use the Eb as the spice on the way there.

The other classic delivery is the bend: grab the D and bend it up just one fret's worth, so the pitch curls into Eb and hangs there, aching, before you release it back down or push on up to E. Half-step bends are small — barely a nudge of the wrist — but this one carries more feel per millimeter than anything else on the instrument.

One last reframe before the quiz: the blues scale isn't a new thing to memorize. It's your box 1 with a habit. Spend this week playing everything you already know from Pentatonic Mastery, but let your fingers drift through that extra fret whenever the line moves between the 4 and the 5. By Lesson 4 you'll be blending this with a second flavor entirely.`,
            },
            {
              kind: 'quiz',
              questions: [
                {
                  prompt: 'Which note does the blues scale add to A minor pentatonic?',
                  choices: ['C#', 'Eb', 'F#', 'Bb'],
                  answer: 1,
                  explanation:
                    'The blues scale adds the flat five. The 5th of A is E, so the b5 is Eb — six half steps above A, the tritone.',
                },
                {
                  prompt: 'How many notes are in the blues scale?',
                  choices: ['Five', 'Six', 'Seven', 'Eight'],
                  answer: 1,
                  explanation:
                    'Minor pentatonic has five notes; add the b5 and you get six: A, C, D, Eb, E, G in the key of A.',
                },
                {
                  prompt: 'How should you treat the blue note in a solo?',
                  choices: [
                    'Land on it and hold it for maximum tension',
                    'Avoid it over the I chord',
                    'Pass through it between the 4 and the 5',
                    'Only play it on the low strings',
                  ],
                  answer: 2,
                  explanation:
                    'It\'s a passing tone. Slide or bend through it — D to Eb to E — and resolve to a pentatonic note. Sitting on it turns color into clash.',
                },
                {
                  prompt: 'What interval is the blue note against the root?',
                  choices: ['Minor 3rd', 'Perfect 4th', 'Flat 5th (tritone)', 'Flat 7th'],
                  answer: 2,
                  explanation:
                    'The b5 is the tritone — the most unstable interval there is, which is exactly why passing through it sounds so good.',
                },
              ],
            },
          ],
        },
        {
          id: 'blues-12-bar',
          title: 'The 12-Bar Form',
          synopsis:
            'Three chords, twelve bars, one map — the form behind thousands of songs, plus the shuffle feel that drives it.',
          blocks: [
            {
              kind: 'text',
              md: `Blues runs on a repeating twelve-bar loop called the **12-bar form**, built from just three chords: the I, the IV, and the V of the key. You met these Roman numerals in Foundations — in the key of A they're A, D, and E. Learn this one map and you can play along with thousands of songs on the first listen.

Think of the twelve bars as three lines of four, like a verse of poetry. Line one stays home on the I. Line two steps up to the IV and comes back. Line three climbs to the V, falls through the IV, and lands home — then the whole thing repeats.`,
            },
            {
              kind: 'table',
              caption: 'The 12-bar blues in A, as three lines of four bars.',
              head: ['', 'Bar 1', 'Bar 2', 'Bar 3', 'Bar 4'],
              rows: [
                ['Line 1', 'I (A)', 'I (A)', 'I (A)', 'I (A)'],
                ['Line 2', 'IV (D)', 'IV (D)', 'I (A)', 'I (A)'],
                ['Line 3', 'V (E)', 'IV (D)', 'I (A)', 'V (E)'],
              ],
            },
            {
              kind: 'text',
              heading: 'Count it out loud',
              md: `Each bar gets four beats. Count "1-2-3-4" per bar and strum one chord per beat — the only skill here is *knowing where you are*. The changes to watch: bar 5 (first move to the IV), bar 9 (the V, the tensest moment of the form), and bar 12, which usually goes back to the V to throw you into the next round. Lesson 6 is entirely about those last two bars.

Grab the three chords below. Play the whole form, counting every bar out loud, and don't stop when you fumble a change — the form keeps rolling, and so do you.

One common variation worth knowing from day one: the **quick change**. Instead of sitting on the I for all of line one, bar 2 jumps briefly to the IV and comes right back. You'll hear it constantly on records — if a band seems to change chords "early" in bar 2, that's the quick change, not a mistake. Everything else in the form stays the same.`,
            },
            {
              kind: 'fretboard',
              spec: { type: 'voicing', label: 'A' },
              caption: 'A — your I chord.',
            },
            {
              kind: 'fretboard',
              spec: { type: 'voicing', label: 'D' },
              caption: 'D — the IV, first appearing at bar 5.',
            },
            {
              kind: 'fretboard',
              spec: { type: 'voicing', label: 'E' },
              caption: 'E — the V, the tension chord at bar 9.',
            },
            {
              kind: 'text',
              heading: 'The shuffle feel',
              md: `Blues almost never plays straight eighth notes. It plays a **shuffle**: each beat splits long-short, like the first and last notes of a triplet, so it lopes instead of marching. Say "HUM-pty DUM-pty" — that lilt is the shuffle. Strum down on the long part, up on the short part.

Set the metronome slow and run the form with the shuffle. Twelve bars, count out loud, every change on time. Boring? Maybe for the first two loops. Then it starts to groove — and that groove is the foundation everything else in this course sits on.

A tip for internalizing the map: don't memorize twelve separate bars, memorize the three *events*. "Four bars home. Up to the IV, back home. V, IV, home, V." Say that sentence while you play until you feel the changes coming before they arrive. Once the form lives in your body instead of on the page, every lesson that follows — 7th chords, scale blending, turnarounds — just decorates a structure you already trust.`,
            },
            {
              kind: 'metronome',
              bpm: 70,
              label:
                'Shuffle through the 12-bar in A — one chord per beat, count each bar out loud, no stopping at fumbles.',
            },
            {
              kind: 'quiz',
              questions: [
                {
                  prompt: 'In which bar does the IV chord first appear?',
                  choices: ['Bar 2', 'Bar 5', 'Bar 9', 'Bar 12'],
                  answer: 1,
                  explanation:
                    'Line one (bars 1–4) stays on the I. Line two opens with the IV — that\'s bar 5, the first change you have to nail.',
                },
                {
                  prompt: 'In the key of A, which chords are the I, IV, and V?',
                  choices: ['A, C, E', 'A, D, E', 'A, D, G', 'A, E, F#'],
                  answer: 1,
                  explanation:
                    'Count up the A major scale: A(1), B(2), C#(3), D(4), E(5). So I = A, IV = D, V = E.',
                },
                {
                  prompt: 'What does bar 12 usually do?',
                  choices: [
                    'Rests in silence',
                    'Stays on the I to finish',
                    'Goes to the V to launch the next round',
                    'Jumps to the IV',
                  ],
                  answer: 2,
                  explanation:
                    'Bar 12 typically hits the V, whose pull back to the I throws you into bar 1 of the next chorus. That\'s the turnaround zone.',
                },
                {
                  prompt: 'The shuffle feel divides each beat…',
                  choices: [
                    'Into two equal halves',
                    'Long-short, like a triplet missing its middle',
                    'Into four equal sixteenths',
                    'Short-long, with the accent at the end',
                  ],
                  answer: 1,
                  explanation:
                    'Shuffle = triplet feel with the first two thirds tied: long-short, long-short. That lope is the heartbeat of the blues.',
                },
              ],
            },
          ],
        },
        {
          id: 'blues-dominant-7',
          title: 'Dominant 7th Chords',
          synopsis:
            'Add a b7 to a major triad and you get the restless, gritty chord that blues is built on — and blues uses it everywhere.',
          blocks: [
            {
              kind: 'text',
              md: `A major triad — root, 3rd, 5th — sounds finished. Blues doesn't want finished; it wants *restless*. So blues stacks one more note on top: the **flat seven** (b7), the note two frets below the root's octave. Root, 3, 5, b7 is a **dominant 7th chord**, written A7, D7, E7.

Why does it sound so gritty? Inside every dominant 7th, the 3 and the b7 form a tritone — the same unstable interval as the blue note you met in Lesson 1. That buzz of tension is the chordal version of the blues scale's attitude. Major triads smile; dominant 7ths smirk.`,
            },
            {
              kind: 'table',
              caption: 'Building the three dominant 7ths of a blues in A.',
              head: ['Chord', '1', '3', '5', 'b7'],
              rows: [
                ['A7', 'A', 'C#', 'E', 'G'],
                ['D7', 'D', 'F#', 'A', 'C'],
                ['E7', 'E', 'G#', 'B', 'D'],
              ],
            },
            {
              kind: 'text',
              heading: 'Hear it under your fingers',
              md: `Start from the open A shape below: your fretting fingers sit on the D, G, and B strings at fret 2. Now lift the finger on the **G string** and let it ring open. That open G is the b7 of A — you just turned A into A7 with one finger. Strum A, then A7, back and forth, and listen to the chord lean forward.

Same trick works on the others: in the open D shape, move the B string's note down from fret 3 (a D) to fret 1 — that C is D7's b7. In the open E shape, lift your finger off the D string and the open D is E7's b7. Every one of these is a one-finger edit to a chord you already play.`,
            },
            {
              kind: 'fretboard',
              spec: { type: 'voicing', label: 'A' },
              caption: 'The A major shape. Lift the G-string finger and the open G — the b7 — turns it into A7.',
            },
            {
              kind: 'text',
              heading: 'Every chord gets the treatment',
              md: `Here's the strange, wonderful rule of blues: **all three chords** — I, IV, and V — get played as dominant 7ths. A7, D7, E7. In the diatonic harmony you'll study later, only the V chord is naturally dominant; a key is only supposed to contain one. Blues ignores that. It puts that tritone buzz on every chord, so the tension never fully resolves and the loop never wants to stop.

That's also why the blues scale works over the whole form: the scale and the chords are both carrying b7s and rubbing major against minor. Play last lesson's 12-bar again, but swap in the 7th shapes you just made. That's the sound.

Want to find a b7 anywhere, for any chord, forever? Use the octave shape you know from Foundations: from a root on the low E or A string, the octave sits two strings up and two frets over — and the b7 is two frets below that, which puts it on the **same fret as your root, two strings up**. Try it: root A at fret 5 of the low E string; fret 5 of the D string is G, its b7. Once you can spot that shape from any root, you can dominant-ify every chord you ever learn, in any key, without a chart. Diatonic Harmony will show you why the V chord is the only *naturally* dominant one — and why that makes it the engine of every key.`,
            },
            {
              kind: 'quiz',
              questions: [
                {
                  prompt: 'What\'s the formula for a dominant 7th chord?',
                  choices: ['1-3-5', '1-3-5-7', '1-3-5-b7', '1-b3-5-b7'],
                  answer: 2,
                  explanation:
                    'A major triad (1-3-5) plus the flat seven. The natural 7 would make a major 7th chord — a much dreamier, non-blues sound.',
                },
                {
                  prompt: 'Which note is the b7 of A7?',
                  choices: ['G#', 'G', 'F#', 'C'],
                  answer: 1,
                  explanation:
                    'The b7 sits two frets (a whole step) below the octave. A down a whole step is G — which is why the open G string turns A into A7.',
                },
                {
                  prompt: 'Which note turns E into E7?',
                  choices: ['D#', 'C#', 'D', 'B'],
                  answer: 2,
                  explanation:
                    'A whole step below E is D. In the open E shape, lifting your finger off the D string lets that b7 ring.',
                },
                {
                  prompt: 'In a blues, which chords get played as dominant 7ths?',
                  choices: [
                    'Only the V, like in classical harmony',
                    'Only the I',
                    'The I and V but never the IV',
                    'All three — I, IV, and V',
                  ],
                  answer: 3,
                  explanation:
                    'Blues breaks the one-dominant-per-key rule on purpose: A7, D7, and E7 all carry the tritone, so the tension never fully settles.',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      title: 'Playing the Form',
      lessons: [
        {
          id: 'blues-major-minor',
          title: 'Mixing Major & Minor',
          synopsis:
            'The signature blues blend: major pentatonic sweetness against minor pentatonic grit, and the rule for when to use which.',
          blocks: [
            {
              kind: 'text',
              md: `Play a C over an A7 chord and theory says it should clash — the chord has C#, you're playing C. But that clash *is* the blues. The signature blues sound comes from blending **major pentatonic** sweetness with minor pentatonic grit over the same chords, often inside a single lick.

Both scales live in the same five-box system from Pentatonic Mastery. A minor pentatonic: A, C, D, E, G. A major pentatonic: A, B, C#, E, F#. They share only the root and the 5th — A and E — but the fight that matters is C versus C#, the minor 3rd against the major 3rd. That's the axis the whole style rotates around.`,
            },
            {
              kind: 'fretboard',
              spec: { type: 'scale', tonic: 'A', scale: 'major pentatonic', box: 0 },
              caption: 'A major pentatonic, box 1 — the sweet, sunny half of the blend.',
            },
            {
              kind: 'fretboard',
              spec: { type: 'scale', tonic: 'A', scale: 'minor pentatonic', box: 0 },
              caption: 'A minor pentatonic, box 1 — the gritty half. Same key, two notes different.',
            },
            {
              kind: 'text',
              heading: 'The rule of thumb',
              md: `When do you use which? Here's the working rule: **major pentatonic over the I chord, minor pentatonic anywhere**. Minor pentatonic is the all-terrain vehicle — its C is the b7 of D7 and its G is the b7 of A7, so it survives every chord in the form. Major pentatonic shines brightest over the I (A7 contains A, C#, and E — all major pentatonic notes) but its C# grinds badly against D7, which contains a plain C.

So a classic move is: open the chorus sweet — major pentatonic over bars 1–4 — then shift to minor pentatonic when the IV arrives at bar 5. That switch *announces* the chord change without you playing a single chord.`,
            },
            {
              kind: 'text',
              heading: 'One home base for both',
              md: `Players like B.B. King didn't jump between distant boxes to switch scales — they parked in one small zone where the two sounds sit a finger-roll apart. The famous **BB box** is a little four-fret cell anchored on the root on the B string (for A, that's fret 10): from that one anchor you can reach the major 3rd, the minor 3rd, the 6th, and the b7 without moving your hand, bending the minor notes up toward the major ones when the I chord is underneath.

You don't need to master that cell today. Just try the blend: over an A chord, play C (minor pent) and slide it up one fret into C# (major pent). That one-fret slide is the major/minor blend in miniature — and it's pure blues.

There's also a shortcut for your hands. A major pentatonic uses the *same physical shape* as minor pentatonic, planted three frets lower: box 1 with its anchor at fret 5 gives you A minor pentatonic, and the identical fingering anchored at fret 2 gives you A major pentatonic (it's F# minor pentatonic — A's relative minor — wearing a different hat, exactly like the relative-key trick from Foundations). So you already know both scales in five boxes; you're just learning a second place to park the shape. Drill the switch: two bars of the shape at fret 5, two bars at fret 2, over a droning A. Hear the mood flip from grit to sunshine and back — then start flipping it on purpose.`,
            },
            {
              kind: 'quiz',
              questions: [
                {
                  prompt: 'Which notes do A minor pentatonic and A major pentatonic have in common?',
                  choices: ['A and E', 'A and D', 'C and G', 'E and G'],
                  answer: 0,
                  explanation:
                    'Minor: A C D E G. Major: A B C# E F#. Only the root and the 5th survive both — and the defining fight between the rest is C (b3) versus C# (3).',
                },
                {
                  prompt: 'What\'s the rule of thumb for choosing a pentatonic in a blues?',
                  choices: [
                    'Major everywhere, minor never',
                    'Major over the I, minor anywhere',
                    'Minor over the I, major over IV and V',
                    'Alternate scales every bar',
                  ],
                  answer: 1,
                  explanation:
                    'Minor pentatonic survives all three chords; major pentatonic sounds sweetest over the I but its major 3rd clashes with the IV chord.',
                },
                {
                  prompt: 'Why does A major pentatonic clash with the D7 chord?',
                  choices: [
                    'Its C# grinds against the C in D7',
                    'Its F# isn\'t in the key',
                    'It has no root note in common with D7',
                    'It doesn\'t clash — it\'s always safe',
                  ],
                  answer: 0,
                  explanation:
                    'D7 = D, F#, A, C. A major pentatonic\'s C# sits a half step against that C — a much harsher rub than the stylized b3-over-major-chord blues clash.',
                },
                {
                  prompt: 'The BB box idea is about…',
                  choices: [
                    'Playing only on the low strings',
                    'A small zone where major and minor notes sit within finger reach',
                    'A special tuning B.B. King used',
                    'Avoiding the root note entirely',
                  ],
                  answer: 1,
                  explanation:
                    'Anchored on the B-string root, one compact cell offers the 3, b3, 6, and b7 — so you blend sweet and gritty without shifting position.',
                },
              ],
            },
          ],
        },
        {
          id: 'blues-phrasing',
          title: 'Phrasing the Blues',
          synopsis:
            'Call and response, space, and repetition with variation — how the same six notes become sentences instead of scales.',
          blocks: [
            {
              kind: 'text',
              md: `Two players can use the identical blues box and one sounds like a conversation while the other sounds like a typing test. The difference isn't notes — it's **phrasing**: shaping your lines like sentences, with beginnings, endings, and breath between them.

Blues phrasing is built on **call and response**. It comes straight from the music's roots: a singer states a line, and the band — or the guitar — answers it. As a soloist you play both roles. Play a short phrase (the call), leave a gap, then play a phrase that answers it — ending somewhere more settled, usually on the root or the 5th. Question, breath, answer.`,
            },
            {
              kind: 'text',
              heading: 'The form tells you where the sentences go',
              md: `The 12-bar's three four-bar lines are a phrasing map, and it mirrors classic blues lyrics: line one states it ("Woke up this morning…"), line two repeats it, line three answers it. Do the same with your guitar: play a phrase over bars 1–4, play it *again* over bars 5–8 — same shape, tweaked because the chord under it changed to the IV — then answer it with something conclusive over bars 9–12.

That "again, but tweaked" is the third pillar: **repetition with variation**. Repeating a phrase makes it a hook instead of an accident; changing just its ending — one note higher, one beat later — keeps it alive. Listeners love hearing a phrase come back; they love it more when it comes back slightly different.`,
            },
            {
              kind: 'fretboard',
              spec: { type: 'scale', tonic: 'A', scale: 'blues', box: 0 },
              caption: 'Your palette: A blues, box 1. Phrasing is how you spend these notes, not how many you have.',
            },
            {
              kind: 'text',
              heading: 'Space is a note',
              md: `The hardest habit to build: **stop playing**. Space before a phrase makes it an entrance; space after makes it a statement. A phrase surrounded by silence carries ten times the weight of the same notes buried in a stream. When in doubt, halve what you play and double the gap.

Where you *end* a phrase matters as much as where you breathe. Calls can end anywhere — up in the air on the 4, the b7, even a hanging bend — but answers want to settle on a home note: the root, the 5th, or (once you're chasing the changes) a note inside whichever chord is playing. Ending the answer on the chord's own note is exactly where the Chord Tone Targeting course picks up.

Drill it with the metronome below: improvise a phrase across two bars, then rest for two full bars — hands still, counting. It'll feel like an eternity. That eternity is where the groove lives, and where your next idea comes from. Then take it to a jam: loop a slow blues from your library and play three-line "verses" — call, call again varied, answer. The Phrasing & Composition course builds a whole solo out of these tools later.`,
            },
            {
              kind: 'metronome',
              bpm: 66,
              label:
                'Two bars of phrase, two bars of silence — count the rests out loud and don\'t cheat the space.',
            },
            {
              kind: 'quiz',
              questions: [
                {
                  prompt: 'What is call and response in a solo?',
                  choices: [
                    'Trading solos with another guitarist only',
                    'A phrase, a gap, then an answering phrase that settles',
                    'Repeating one lick until the song ends',
                    'Playing the melody an octave higher',
                  ],
                  answer: 1,
                  explanation:
                    'You play both roles: state a musical question, breathe, then answer it — typically resolving to a restful note like the root or 5th.',
                },
                {
                  prompt: 'How do the 12 bars naturally split into phrases?',
                  choices: [
                    'Two lines of six bars',
                    'Four lines of three bars',
                    'Three four-bar lines: statement, restatement, answer',
                    'Twelve independent one-bar phrases',
                  ],
                  answer: 2,
                  explanation:
                    'Mirroring blues lyrics: state it over bars 1–4, repeat it over 5–8 (adjusted for the IV), answer it over 9–12.',
                },
                {
                  prompt: 'What makes repetition work instead of getting boring?',
                  choices: [
                    'Playing it faster each time',
                    'Small variation — change the ending or timing',
                    'Adding more notes every repeat',
                    'Switching keys between repeats',
                  ],
                  answer: 1,
                  explanation:
                    'Repetition turns a phrase into a hook; a small tweak — one note, one beat — keeps the hook alive. Same shape, different tail.',
                },
                {
                  prompt: 'Why does space matter so much in blues phrasing?',
                  choices: [
                    'It gives your hands a rest',
                    'Silence frames a phrase, giving it far more weight',
                    'It\'s only needed at slow tempos',
                    'It lets the drummer solo',
                  ],
                  answer: 1,
                  explanation:
                    'A phrase surrounded by silence lands like a statement; the same notes in a constant stream disappear. Space is part of the music.',
                },
              ],
            },
          ],
        },
        {
          id: 'blues-turnarounds',
          title: 'Turnarounds',
          synopsis:
            'Bars 11 and 12 are the form\'s hinge: classic walk-down and walk-up moves that sling every chorus into the next.',
          blocks: [
            {
              kind: 'text',
              md: `Bars 11 and 12 have one job: get everyone back to bar 1 wanting more. The move that does it is the **turnaround** — a two-bar figure that starts from home base and lands on the V chord, whose pull yanks the whole band back to the top of the form. You noticed in Lesson 2 that bar 12 goes to the V; the turnaround is *how* it gets there with style.

Nearly every turnaround is a **chromatic walk**: a line that moves one fret at a time, so the landing feels inevitable. Two directions, two classics — walk down through the I chord, or walk the bass up into the V.`,
            },
            {
              kind: 'fretboard',
              spec: { type: 'voicing', label: 'A' },
              caption: 'Home base: the A shape. The classic walk-down starts from its b7 — the G at fret 3 of the high E string.',
            },
            {
              kind: 'text',
              heading: 'The walk-down',
              md: `The most recorded turnaround in history walks down from the b7 of the I chord. Over the A shape above, start bar 11 on G (high E string, fret 3) and descend one fret at a time — G, F#, F, E — one note per beat, while keeping an A ringing underneath or on top as a drone. Hear it? That's the intro and ending of half the blues records ever made. The line is really the b7 sliding down to the 5: pure gravity, resolved just in time for bar 12.

Play it now, slowly: pinch the open A string together with each note of the descent. Four beats, four chromatic steps, and you've played your first real turnaround.`,
            },
            {
              kind: 'fretboard',
              spec: { type: 'voicing', label: 'E' },
              caption: 'The target: the E shape. Both classic moves aim to land here on bar 12.',
            },
            {
              kind: 'text',
              heading: 'The walk-up',
              md: `The second classic approaches the V from below in the bass. In bar 12, walk the low notes up to E chromatically: C# (A string, fret 4), D (fret 5), D# (fret 6), then land on the open-position E chord on the downbeat of the next chorus — or hit the E on beat 3 of bar 12 and let it ring like a held breath. One fret at a time, the bass climbs a staircase straight into the V, and the pull back to bar 1 becomes irresistible.

Turnarounds moonlight as intros, too. Count a band in, play the bar-11-and-12 figure once, and everyone knows the key, the feel, and exactly where bar 1 lands — which is why so many blues recordings open with one. And when a song finally ends, the same figure resolves to the I instead of the V: the walk-down lands home and stays there. One little machine, three jobs: intro, engine, ending.

Now assemble the whole machine: play the 12-bar shuffle from Lesson 2, walk down through bar 11, walk up into the V at bar 12, and loop back to the top without dropping a beat. Then take it to a real song below — count yourself into the form, mark every turnaround, and blend your major and minor pentatonics over the top like you learned in this module. That's not an exercise anymore. That's playing the blues.`,
            },
            {
              kind: 'quiz',
              questions: [
                {
                  prompt: 'Which bars does the turnaround occupy?',
                  choices: ['Bars 1–2', 'Bars 5–6', 'Bars 9–10', 'Bars 11–12'],
                  answer: 3,
                  explanation:
                    'The turnaround is the last two bars of the form — its job is to sling the music from the end of one chorus into the start of the next.',
                },
                {
                  prompt: 'A turnaround typically ends on which chord?',
                  choices: ['The I', 'The IV', 'The V', 'The relative minor'],
                  answer: 2,
                  explanation:
                    'It lands on the V (E in the key of A), because the V\'s pull toward the I drags everyone back to bar 1.',
                },
                {
                  prompt: 'The classic walk-down over the I chord in A descends…',
                  choices: [
                    'A, G, F, E — down the scale',
                    'G, F#, F, E — chromatically from the b7 to the 5',
                    'C#, C, B, A — from the 3rd to the root',
                    'E, D, C, A — down the minor pentatonic',
                  ],
                  answer: 1,
                  explanation:
                    'Start on G (the b7 of A) and fall one fret per beat: G, F#, F, E. The b7 sliding to the 5 over a ringing A is the signature sound.',
                },
                {
                  prompt: 'What makes a chromatic walk-up into the V feel so strong?',
                  choices: [
                    'It uses only chord tones',
                    'One-fret steps make the landing feel inevitable',
                    'It avoids the bass strings',
                    'It\'s louder than the rest of the form',
                  ],
                  answer: 1,
                  explanation:
                    'Half-step motion (C#, D, D#, E) aims straight at the target — each fret raises the tension until the V lands right on the downbeat.',
                },
              ],
            },
            {
              kind: 'jam',
              md: 'Pull up a song in A major from your library and play the full circuit: count the 12-bar, shuffle the 7th chords, blend A major and minor pentatonic over the top, and nail a walk-down or walk-up turnaround every chorus.',
              tonic: 'A',
              mode: 'major',
              scale: 'major pentatonic',
            },
          ],
        },
      ],
    },
  ],
}

export default course
