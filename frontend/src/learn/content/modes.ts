import type { Course } from '../types'

const course: Course = {
  id: 'modes',
  title: 'Modes & Beyond',
  description:
    'One parent scale, seven sounds: Dorian, Mixolydian, Lydian, Phrygian — plus harmonic minor and when to reach for it.',
  modules: [
    {
      title: 'One Scale, Seven Sounds',
      lessons: [
        {
          id: 'modes-what-are-modes',
          title: 'What Modes Actually Are',
          synopsis:
            'Seven notes, seven possible homes — modes are the major scale heard from different front doors.',
          blocks: [
            {
              kind: 'text',
              md: `You already know the big secret behind modes — you learned it back in the Foundations course. C major and A minor use the **exact same seven notes**: C, D, E, F, G, A, B. Not one note changes. What changes is which note feels like *home*. Land on C and everything sounds bright and resolved. Land on A and the same notes turn moody and serious.

Here's the leap: if two different notes in that set can be home, why not all seven? They can. A **mode** is what you get when you take one parent scale and treat a different degree as the root. Seven degrees, seven modes, seven distinct flavors — from one scale you already know cold.`,
            },
            {
              kind: 'text',
              heading: 'The root defines the sound',
              md: `Play the notes of C major starting and ending on D — D, E, F, G, A, B, C, D — and keep gravitating back to D. That's **D Dorian**. Same seven notes as C major, but because D is now the center, every other note is measured against D, and the pattern of whole and half steps *from the root* is different. That interval pattern is the mode's fingerprint.

This is why modes confuse people who only think in note names. "D Dorian is just C major" is true on paper and useless in your ears. The sound doesn't come from the notes — it comes from the **relationship between the notes and the root**. Change the root, change the sound.

There are two useful ways to think about any mode, and you'll use both in this course. The *relative* view says "D Dorian borrows C major's notes" — great for finding shapes fast, because you already know them. The *parallel* view says "D Dorian is D minor with one note raised" — great for hearing what the mode actually does, because it names the one changed note. Fast fingers from the first view, honest ears from the second.`,
            },
            {
              kind: 'fretboard',
              spec: { type: 'scale', tonic: 'C', scale: 'major' },
              caption:
                'Every note of C major across the neck. All seven modes of C major live inside this one map — D Dorian, E Phrygian, G Mixolydian — you just pick a different note to call home.',
            },
            {
              kind: 'table',
              caption:
                'The seven modes of the major scale. The formula compares each mode to a plain major scale built on the same root.',
              head: ['Mode', 'Home degree', 'Formula', 'Character'],
              rows: [
                ['Ionian', '1', '1 2 3 4 5 6 7', 'The major scale itself — bright, settled'],
                ['Dorian', '2', '1 2 b3 4 5 6 b7', 'Minor with a bright 6 — funky, soulful'],
                ['Phrygian', '3', '1 b2 b3 4 5 b6 b7', 'Dark and Spanish — tension right above the root'],
                ['Lydian', '4', '1 2 3 #4 5 6 7', 'Major but floating — dreamy, film-score'],
                ['Mixolydian', '5', '1 2 3 4 5 6 b7', 'Major with attitude — bluesy, jammy'],
                ['Aeolian', '6', '1 2 b3 4 5 b6 b7', 'The natural minor scale — sad, serious'],
                ['Locrian', '7', '1 b2 b3 4 b5 b6 b7', 'Unstable — the b5 kills the home base'],
              ],
            },
            {
              kind: 'text',
              heading: 'How to actually hear a mode',
              md: `A mode only exists while something establishes its root. Let a low open string ring as a drone, or loop a one-chord vamp, then play the parent scale over it. Try it now: let the open D string ring, then walk the C major shapes above while resolving every phrase to a D. That floating-minor flavor is Dorian — and you just played it without learning a single new shape.

The rest of this course takes the four modes guitarists actually use — Dorian, Mixolydian, Lydian, Phrygian — one at a time, then adds harmonic minor, which isn't a mode of major at all but solves a problem modes can't.`,
            },
            {
              kind: 'quiz',
              questions: [
                {
                  prompt: 'D Dorian contains exactly the same notes as which scale?',
                  choices: ['D major', 'C major', 'D minor', 'G major'],
                  answer: 1,
                  explanation:
                    'D is the 2nd degree of C major, so D Dorian = the notes of C major with D as home: D E F G A B C.',
                },
                {
                  prompt: 'If two modes share the same seven notes, what makes them sound different?',
                  choices: [
                    'The order you play the notes in',
                    'Which note functions as the root',
                    'How fast you play them',
                    'Nothing — they sound identical',
                  ],
                  answer: 1,
                  explanation:
                    'The root is the reference point. Each note is heard as an interval above the root, so a new root creates a new pattern of intervals — a new sound.',
                },
                {
                  prompt: 'Which mode is just another name for the plain major scale?',
                  choices: ['Aeolian', 'Mixolydian', 'Ionian', 'Lydian'],
                  answer: 2,
                  explanation:
                    'Ionian is the mode built on degree 1 — the major scale itself. Aeolian, built on degree 6, is the natural minor scale.',
                },
                {
                  prompt: 'A minor is which mode of C major?',
                  choices: ['Dorian', 'Phrygian', 'Mixolydian', 'Aeolian'],
                  answer: 3,
                  explanation:
                    'A is the 6th degree of C major, and the mode on degree 6 is Aeolian — the relative minor you met in Foundations.',
                },
              ],
            },
          ],
        },
        {
          id: 'modes-dorian',
          title: 'Dorian: The Bright Minor',
          synopsis:
            'Take natural minor, raise one note, and you get the funky, soulful minor sound of Santana and a thousand grooves.',
          blocks: [
            {
              kind: 'text',
              md: `**Dorian** is a minor sound — it has the b3 and b7 that make minor feel minor — but with one crucial upgrade: a **natural 6** instead of minor's b6. That single half step is the whole story. The b6 in natural minor is the note that drags the scale down into sadness; swap it for a natural 6 and the darkness lifts into something cooler — still minor, but confident, funky, a little sly.

Compare the two maps below. They're identical except for one note on the neck.`,
            },
            {
              kind: 'fretboard',
              spec: { type: 'scale', tonic: 'A', scale: 'dorian' },
              caption: 'A Dorian: A B C D E F# G. Minor with a natural 6 — the F# is the color note.',
              showIntervals: true,
            },
            {
              kind: 'fretboard',
              spec: { type: 'scale', tonic: 'A', scale: 'minor' },
              caption: 'A natural minor: A B C D E F G. Same scale except the F — one fret lower than Dorian\'s F#.',
              showIntervals: true,
            },
            {
              kind: 'text',
              heading: 'Spot the one changed note',
              md: `Hunt through both diagrams and find the difference: every **F** in A minor becomes an **F#** in A Dorian. That's it. Everything you know about minor pentatonic and natural minor shapes carries straight over — you're nudging one note up a fret wherever it appears.

Play it now. Run your A minor pentatonic box 1 at the 5th fret, then add the F# at the 7th fret of the B string. Resolve to A. That brightness you hear against the minor backdrop is the natural 6 doing its thing.

In the parallel view, Dorian's formula is **1 2 b3 4 5 6 b7** — memorize it as "natural minor with a raised 6." In the relative view, Dorian lives on **degree 2** of its parent major scale: A is the 2nd note of G major, so A Dorian borrows G major's notes and shapes wholesale. Both roads lead to the same seven notes; use whichever gets you playing faster.`,
            },
            {
              kind: 'text',
              heading: 'Where Dorian lives',
              md: `Dorian is everywhere groove lives. Santana's *Oye Como Va* sits on a two-chord Dorian vamp — Am to D, where the D major chord gets its F# from Dorian's natural 6 — and *Evil Ways* rides the same i-to-IV move in G Dorian (Gm to C). Funk rhythm sections camp on one minor chord for minutes at a time, and Dorian is usually the scale painting over the top. Miles Davis built *So What* on almost nothing but D Dorian.

The tell-tale chord move: a **minor i chord to a major IV chord** (Am to D). Natural minor can't make that IV major — its b6 forces Dm. If you hear minor-key music where the IV chord sounds bright, your Dorian alarm should go off. Loop Am to D yourself and solo with A Dorian, leaning on that F#.

A practical drill to lock in the difference: play the same four-bar phrase twice — once with F, once with F#. Same rhythm, same shape, one note swapped. Natural minor version first, Dorian version second. When you can *predict* the mood shift before you play it, the sound is yours.`,
            },
            {
              kind: 'quiz',
              questions: [
                {
                  prompt: 'Which note is different between A Dorian and A natural minor?',
                  choices: ['B vs Bb', 'F# vs F', 'G# vs G', 'C# vs C'],
                  answer: 1,
                  explanation:
                    'A Dorian has a natural 6 (F#); A natural minor has a b6 (F). The other six notes are identical.',
                },
                {
                  prompt: "Dorian's color note — the one that separates it from natural minor — is the…",
                  choices: ['b3', 'Natural 6', 'b7', '#4'],
                  answer: 1,
                  explanation:
                    'Both scales share the b3 and b7. Dorian swaps minor\'s b6 for a natural 6, and that one note is the Dorian sound.',
                },
                {
                  prompt: 'A Dorian uses the same notes as which major scale?',
                  choices: ['C major', 'G major', 'D major', 'A major'],
                  answer: 1,
                  explanation:
                    'Dorian is built on degree 2 of its parent. A is the 2nd degree of G major, so A Dorian = G major notes (G A B C D E F#) with A as home.',
                },
                {
                  prompt: 'Which chord vamp most strongly suggests A Dorian?',
                  choices: ['Am to Dm', 'Am to D', 'Am to E', 'A to D'],
                  answer: 1,
                  explanation:
                    'Minor i to major IV is the classic Dorian move: the D chord\'s F# is Dorian\'s natural 6. Natural minor would give you Dm instead.',
                },
              ],
            },
          ],
        },
        {
          id: 'modes-mixolydian',
          title: 'Mixolydian: The Blues Major',
          synopsis:
            'Major with a flatted 7th — the sound of dominant chords, jam bands, and rock that grooves instead of resolves.',
          blocks: [
            {
              kind: 'text',
              md: `**Mixolydian** is the major scale with one note lowered: the 7th drops a half step to a **b7**. That's the entire recipe — and it changes everything about how the scale behaves. A major scale's natural 7 is a leading tone: it aches to resolve up to the root, which gives major keys their "coming home" feeling. Flatten it and the ache disappears. The music stops driving toward a finish line and starts *grooving in place*.

Compare the two maps. One note, one fret, on every string where it appears.`,
            },
            {
              kind: 'fretboard',
              spec: { type: 'scale', tonic: 'A', scale: 'mixolydian' },
              caption: 'A Mixolydian: A B C# D E F# G. Major, but with G natural — the b7.',
              showIntervals: true,
            },
            {
              kind: 'fretboard',
              spec: { type: 'scale', tonic: 'A', scale: 'major' },
              caption: 'A major: A B C# D E F# G#. Only the 7th differs — G# here, G natural in Mixolydian.',
              showIntervals: true,
            },
            {
              kind: 'text',
              heading: 'The dominant connection',
              md: `You've met this b7 before. In the Blues Language course, every chord in a 12-bar was a **dominant 7th** — a major triad with a b7 stacked on top. Mixolydian is the scale version of that exact chord: 1, 3, 5, b7 are all sitting in it. Whenever a groove parks on a dominant chord — A7, E7, a one-chord funk riff — Mixolydian is the scale that matches every chord tone.

Play it now: strum an A7, let it ring, then run A Mixolydian over it and land on the G natural. Then try the same lick with G#. The G# fights the chord; the G melts into it.

The relative view works here too: Mixolydian lives on **degree 5** of its parent major. A is the 5th note of D major, so A Mixolydian borrows D major's notes and every D major shape you know. And if you've been soloing with major pentatonic since the Pentatonic Mastery course, you're closer than you think — A major pentatonic (A B C# E F#) is already five-sevenths of A Mixolydian. Add the D and the G and you're there.`,
            },
            {
              kind: 'text',
              heading: 'The jam-band major',
              md: `Mixolydian is the default major sound of rock that vamps instead of cadences. The Grateful Dead and the Allman Brothers built entire jams on one dominant chord with Mixolydian on top. *Sweet Home Alabama* leans on the b7 chord. Countless AC/DC and Stones riffs are major-key riffs with a b7 stomped into them — that's Mixolydian thinking, even if nobody on stage would call it that.

The chord tell: a **major I chord with a bVII chord** (A to G) or a groove that sits on I7 without ever pushing to a V. Loop A to G and solo with A Mixolydian — hit the C# to keep it major, hit the G to keep it honest. If a phrase ever sounds too sweet, you've drifted back into plain major; lean on that b7 until the groove swaggers again.`,
            },
            {
              kind: 'quiz',
              questions: [
                {
                  prompt: 'Mixolydian differs from the plain major scale by which single change?',
                  choices: ['b3 instead of 3', 'b7 instead of 7', '#4 instead of 4', 'b6 instead of 6'],
                  answer: 1,
                  explanation:
                    'Mixolydian is 1 2 3 4 5 6 b7 — a major scale with the 7th lowered a half step. Everything else matches major.',
                },
                {
                  prompt: 'In A Mixolydian, which note replaces the G# of A major?',
                  choices: ['G natural', 'F natural', 'C natural', 'B natural'],
                  answer: 0,
                  explanation:
                    'The 7th of A major is G#. Flatten it a half step and you get G natural — A Mixolydian\'s b7.',
                },
                {
                  prompt: 'A Mixolydian shares its notes with which parent major scale?',
                  choices: ['A major', 'G major', 'D major', 'E major'],
                  answer: 2,
                  explanation:
                    'Mixolydian is built on degree 5. A is the 5th degree of D major, so A Mixolydian = D major notes (D E F# G A B C#) rooted on A.',
                },
                {
                  prompt: 'Which chord is the natural pairing for a Mixolydian solo?',
                  choices: ['A minor 7', 'A major 7', 'A dominant 7', 'A diminished'],
                  answer: 2,
                  explanation:
                    'A dominant 7th chord is 1 3 5 b7 — exactly Mixolydian\'s defining tones. A major 7 would clash with the b7.',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      title: 'The Colorful Four',
      lessons: [
        {
          id: 'modes-lydian',
          title: 'Lydian: The Dream #4',
          synopsis:
            'Major with a raised 4th — the floating, film-score sound, plus the parent-scale trick for finding any mode fast.',
          blocks: [
            {
              kind: 'text',
              md: `**Lydian** is the major scale with the 4th raised a half step: a **#4**. Where Mixolydian took bright major and roughed it up, Lydian takes it the other direction — up and away. The #4 removes the one note in the major scale that pulls downward (the natural 4 always wants to fall to the 3), so nothing in Lydian ever settles. The result floats: dreamy, weightless, slightly unreal. It's the go-to sound of film scores, *The Simpsons* theme, Joe Satriani's *Flying in a Blue Dream* — anything that needs wonder instead of resolution.

There's no Lydian generator on the fretboard here, and that's fine — this lesson is the perfect place to learn the trick that unlocks *every* mode.`,
            },
            {
              kind: 'text',
              heading: 'The parent-scale trick',
              md: `Every mode is some major scale wearing a different root. So to find any mode, ask: **which major scale contains my root at the right degree?** Lydian is built on degree 4 — so for G Lydian, ask "G is the 4th of which major scale?" Count down four degrees, or just remember the 4th sits a perfect 4th above its parent root: the answer is **D major**.

That means G Lydian is simply the notes of D major — D, E, F#, G, A, B, C# — played with G as home. You already own D major all over the neck. Root your phrases on G instead of D, and Lydian appears with zero new shapes.

This trick generalizes to every mode you've met. Dorian? Root on degree 2, so count the parent down a whole step. Mixolydian? Degree 5, so the parent is a perfect 4th above the root — or a perfect 5th below, same thing. Learn the degree, find the parent, reuse shapes you already own. That's the entire system.`,
            },
            {
              kind: 'table',
              caption:
                'G major vs G Lydian, degree by degree. One note changes: the 4th, C, rises to C#.',
              head: ['Scale', '1', '2', '3', '4', '5', '6', '7'],
              rows: [
                ['G major', 'G', 'A', 'B', 'C', 'D', 'E', 'F#'],
                ['G Lydian', 'G', 'A', 'B', 'C#', 'D', 'E', 'F#'],
              ],
            },
            {
              kind: 'fretboard',
              spec: { type: 'scale', tonic: 'D', scale: 'major' },
              caption:
                'D major across the neck — the parent scale of G Lydian. Play these exact notes but treat every G as home, and you\'re playing G Lydian.',
            },
            {
              kind: 'text',
              heading: 'Hearing the float',
              md: `Try it now. Let the open G string ring as a drone, then play D major shapes over it, resolving phrases to G. Lean deliberately on the **C#** — the #4 — and hold it. Against the G drone it doesn't clash; it hovers. That suspended, wide-open shimmer is the entire Lydian brand.

The chord tell: a **major I chord moving to a major II chord** (G to A). A plain G major key would make that second chord A minor; the A major chord's C# is Lydian's #4 announcing itself. One warning: the #4 is a half step below the 5, so if you sit on it *while a full band hammers the plain I chord*, it can rub. Treat it as the destination of a phrase, not a parking spot, and it sings.`,
            },
            {
              kind: 'quiz',
              questions: [
                {
                  prompt: "Lydian's signature color note is the…",
                  choices: ['b7', '#4', 'b2', 'Natural 6'],
                  answer: 1,
                  explanation:
                    'Lydian is 1 2 3 #4 5 6 7 — a major scale with the 4th raised a half step. The #4 is what makes it float.',
                },
                {
                  prompt: 'G Lydian contains exactly the notes of which major scale?',
                  choices: ['G major', 'C major', 'D major', 'A major'],
                  answer: 2,
                  explanation:
                    'Lydian sits on degree 4 of its parent. G is the 4th degree of D major, so G Lydian = D E F# G A B C# with G as home.',
                },
                {
                  prompt: 'Which note is the #4 of G Lydian?',
                  choices: ['C', 'C#', 'F#', 'D#'],
                  answer: 1,
                  explanation:
                    'G major\'s 4th is C. Raise it a half step and you get C# — the note that separates G Lydian from plain G major.',
                },
                {
                  prompt: 'Using the parent-scale trick, C Lydian uses the notes of which major scale?',
                  choices: ['C major', 'F major', 'G major', 'D major'],
                  answer: 2,
                  explanation:
                    'Ask: C is the 4th degree of which major scale? G major (G A B C D E F#). So C Lydian is those notes rooted on C — with F# as its #4.',
                },
              ],
            },
          ],
        },
        {
          id: 'modes-phrygian',
          title: 'Phrygian: The Dark b2',
          synopsis:
            'Minor with a flatted 2nd — a half step of menace above the root that powers flamenco and metal alike.',
          blocks: [
            {
              kind: 'text',
              md: `**Phrygian** is natural minor with one note pulled even darker: the 2nd drops a half step to a **b2**. That puts a note just *one fret above the root* — the tightest, most dissonant neighbor a home note can have. Every time the melody touches the b2 and falls back, you get a little shiver of menace. Natural minor is sad; Phrygian is *threatening*.

You've heard it in two very different places. Flamenco guitar is soaked in Phrygian — those Spanish cadences walking down onto the home chord are the b2 sliding home. And metal rhythm players love it for the same reason: riff between the root and the fret right above it and you get instant darkness with zero effort.`,
            },
            {
              kind: 'text',
              heading: 'The parent trick, again',
              md: `Same move as Lydian, new degree. Phrygian is built on **degree 3** of its parent major scale, so ask: "E is the 3rd of which major scale?" Count down: the answer is **C major**. E Phrygian is the notes of C major — no sharps, no flats — with E as home: E, F, G, A, B, C, D.

Look at that b2: it's **F**, sitting one fret above the open E. This is why E is *the* guitar key for Phrygian — the open low E string is your root, and the F at the 1st fret is the dark neighbor. No stretches, no barres, maximum evil.

In parallel-view terms, the formula is **1 b2 b3 4 5 b6 b7** — natural minor with the 2nd flattened. Compare it to Dorian and you'll see the family logic: Dorian brightened minor by raising one note, Phrygian darkens it by lowering one. Same skeleton, opposite directions.`,
            },
            {
              kind: 'table',
              caption:
                'E natural minor vs E Phrygian. One note changes: the 2nd, F#, falls to F — the half step above the root.',
              head: ['Scale', '1', '2', '3', '4', '5', '6', '7'],
              rows: [
                ['E natural minor', 'E', 'F#', 'G', 'A', 'B', 'C', 'D'],
                ['E Phrygian', 'E', 'F', 'G', 'A', 'B', 'C', 'D'],
              ],
            },
            {
              kind: 'fretboard',
              spec: { type: 'scale', tonic: 'C', scale: 'major' },
              caption:
                'C major across the neck — the parent scale of E Phrygian. Root everything on E (start with the open low E string) and these notes turn dark.',
            },
            {
              kind: 'text',
              heading: 'Riffing on the half step',
              md: `Play it right now: chug the open low E string, then hammer the F at the 1st fret and pull back off to E. Congratulations — that's a Phrygian riff, and roughly half of all metal rhythm playing. Extend it: E, F, G on the low string (frets 0, 1, 3), then walk back down. Keep the open E droning between every note so your ear never loses the root.

The chord tell: a **bII major chord resolving down to the i chord** — F to Em. That half-step drop onto home is the flamenco cadence and the film-score "something wicked" move in one. Loop Em to F yourself and pick phrases from the C major map above, always ending on E. When you want the drama, hang on the F a beat longer than feels safe, then fall.`,
            },
            {
              kind: 'quiz',
              questions: [
                {
                  prompt: "Phrygian's defining color note is the…",
                  choices: ['b2', 'b7', '#4', 'Natural 6'],
                  answer: 0,
                  explanation:
                    'Phrygian is 1 b2 b3 4 5 b6 b7 — natural minor with the 2nd flattened. The b2, one fret above the root, is the whole flavor.',
                },
                {
                  prompt: 'E Phrygian uses exactly the notes of which major scale?',
                  choices: ['E major', 'G major', 'A major', 'C major'],
                  answer: 3,
                  explanation:
                    'Phrygian sits on degree 3 of its parent. E is the 3rd degree of C major, so E Phrygian = C major\'s notes with E as home.',
                },
                {
                  prompt: 'In E Phrygian, the b2 is which note — and where is it on the low E string?',
                  choices: ['F#, at fret 2', 'F, at fret 1', 'G, at fret 3', 'D, at fret 10'],
                  answer: 1,
                  explanation:
                    'A b2 sits one half step — one fret — above the root. Above E that\'s F, at the 1st fret of the low E string.',
                },
                {
                  prompt: 'Which single note separates E Phrygian from E natural minor?',
                  choices: ['C vs C#', 'D vs D#', 'F vs F#', 'G vs G#'],
                  answer: 2,
                  explanation:
                    'E natural minor has F# (a natural 2); Phrygian flattens it to F. The other six notes are identical.',
                },
              ],
            },
          ],
        },
        {
          id: 'modes-harmonic-minor',
          title: 'Harmonic Minor: The Raised 7th',
          synopsis:
            'Not a mode of major at all — natural minor with a raised 7th, invented to give minor keys a V chord that actually pulls home.',
          blocks: [
            {
              kind: 'text',
              md: `Everything so far came from rotating one parent scale. **Harmonic minor** breaks the pattern: it's natural minor with the **7th raised a half step**, and it exists to fix a real problem in minor-key harmony.

Here's the problem. In the Diatonic Harmony course you saw that a key's **V chord** creates the pull back to home — and its power comes from the leading tone, the note a half step below the root. Natural minor doesn't have one. In A minor the 7th is G, a whole step below A, so the "five" chord comes out as E *minor* — a soft chord with no pull. Composers fixed it centuries ago by force: raise the G to **G#**. Now the chord on E contains G# instead of G, making it **E major** — a real dominant with a leading tone that yanks the music back to Am. That's why nearly every minor-key song you know uses a major V or V7 — the raised 7th snuck into the harmony long before anyone told you the scale's name.`,
            },
            {
              kind: 'fretboard',
              spec: { type: 'scale', tonic: 'A', scale: 'harmonic minor' },
              caption: 'A harmonic minor: A B C D E F G#. The G# is the raised 7th — the borrowed leading tone.',
              showIntervals: true,
            },
            {
              kind: 'fretboard',
              spec: { type: 'scale', tonic: 'A', scale: 'minor' },
              caption: 'A natural minor: A B C D E F G. Identical except the G — a fret below harmonic minor\'s G#.',
              showIntervals: true,
            },
            {
              kind: 'text',
              heading: 'The exotic run',
              md: `Raising the 7th has a dramatic side effect. The gap from the b6 (F) up to the raised 7 (G#) is now **three frets** — an augmented 2nd, wider than any step in the plain major or minor scales. That oversized leap is instantly recognizable: it's the "Egyptian" / neoclassical sound, the flavor Yngwie Malmsteen built a career on and surf classics like *Misirlou* ride from the first note.

Play it now: on the D string play F at fret 3, G# at fret 6, then A at fret 7. Walk it up and down — F, G#, A, G#, F, E. That three-fret lurch followed by the half-step resolve into the root is harmonic minor's entire personality in six notes.`,
            },
            {
              kind: 'text',
              heading: 'Where it actually belongs',
              md: `Here's the part most players get wrong: harmonic minor is usually a **part-time scale**. In a real minor-key song you don't grind it over everything — you use natural minor (or minor pentatonic) most of the time and reach for the raised 7th **when the V chord arrives**. Over Am, play A natural minor; the moment the E or E7 chord hits, swap G for G# and let it lead you home. That one-note swap at the right moment sounds intentional and expensive.

The same logic transposes anywhere. In E minor, the raised 7th is D#, and it belongs over the B or B7 chord. Practice the swap slowly: loop Am to E to Am in your head, playing G over the Am and G# over the E, and feel how the G# makes the return to A inevitable. Then take it to a real song below.`,
            },
            {
              kind: 'quiz',
              questions: [
                {
                  prompt: 'Which note is raised to turn A natural minor into A harmonic minor?',
                  choices: ['F becomes F#', 'G becomes G#', 'C becomes C#', 'D becomes D#'],
                  answer: 1,
                  explanation:
                    'Harmonic minor raises the 7th degree a half step. In A minor the 7th is G, so it becomes G# — a leading tone below A.',
                },
                {
                  prompt: 'Why was the 7th raised in the first place?',
                  choices: [
                    'To make the scale easier to finger',
                    'To turn the minor v chord into a major V with real pull toward home',
                    'To match the major scale exactly',
                    'To remove the b3 from the scale',
                  ],
                  answer: 1,
                  explanation:
                    'Natural minor\'s chord on the 5th degree is minor (Em in A minor) and pulls nowhere. Raising G to G# makes it E major — a true dominant that resolves hard to Am.',
                },
                {
                  prompt: 'The exotic-sounding gap in harmonic minor sits between which degrees?',
                  choices: ['The root and the b2', 'The b3 and the 4', 'The b6 and the raised 7', 'The 5 and the b6'],
                  answer: 2,
                  explanation:
                    'From the b6 (F in A harmonic minor) to the raised 7 (G#) is an augmented 2nd — three frets, wider than any step in major or natural minor.',
                },
                {
                  prompt: 'In an E minor song, when does harmonic minor earn its keep?',
                  choices: [
                    'Over every chord, all the time',
                    'Over the B or B7 chord — swap D for D#',
                    'Only over the E minor chord itself',
                    'Never — it only works in A minor',
                  ],
                  answer: 1,
                  explanation:
                    'Harmonic minor is a part-time scale: use natural minor most of the time and raise the 7th (D# in E minor) when the V chord — B or B7 — arrives.',
                },
              ],
            },
            {
              kind: 'jam',
              md: `Take it to the real thing. Jam over an E minor song from your library: stay in E natural minor or E minor pentatonic for the verses, and when you hear the V chord (B or B7) push toward home, swap D for **D#** — E harmonic minor — then resolve to E. One note, perfectly timed, is the whole trick.`,
              tonic: 'E',
              mode: 'minor',
              scale: 'harmonic minor',
            },
          ],
        },
      ],
    },
  ],
}

export default course
