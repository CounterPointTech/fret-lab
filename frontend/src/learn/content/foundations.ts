import type { Course } from '../types'

const course: Course = {
  id: 'foundations',
  title: 'Guitar Theory Foundations',
  description:
    'The musical alphabet, intervals as shapes, the major scale, keys, the circle of fifths, and where chords come from — everything else builds on this.',
  modules: [
    {
      title: 'The Twelve Notes',
      lessons: [
        {
          id: 'foundations-fretboard-map',
          title: 'The Musical Alphabet & the Fretboard Map',
          synopsis: 'Twelve notes, one repeating map — learn the low strings and own the neck.',
          blocks: [
            {
              kind: 'text',
              md: `Music has exactly **twelve notes**. That's the whole alphabet: A, A#, B, C, C#, D, D#, E, F, F#, G, G# — then it repeats, higher. Every riff you love is built from these twelve, and on the guitar they're laid out in a dead-simple pattern: **one fret = one step** up the alphabet.

Two quirks to memorize now: there's no sharp between **B and C**, and none between **E and F**. Those pairs sit on neighboring frets. Everything else has a sharp (or, seen from above, a flat) between them.`,
            },
            {
              kind: 'text',
              heading: 'Why the low strings matter most',
              md: `Almost everything you'll learn — power chords, barre chords, scale boxes, the CAGED system — is **anchored to a root note on the low E or A string**. Know those two strings cold and every shape in this curriculum snaps into place.

Play fret 3 on the low E string: that's **G**. Fret 5 is **A**. Fret 7 is **B**, fret 8 is **C**. Say each note out loud as you play it — slowly, no metronome yet. That's the map forming.`,
            },
            {
              kind: 'text',
              heading: 'The two shortcuts that finish the job',
              md: `You don't have to memorize six strings — two shortcuts cover the rest. First, the **octave shape**: from any note on the low E string, jump *two strings over and two frets up* and you land on the same note, an octave higher. Root on E-string fret 3 (G)? Two over, two up puts G on the D string at fret 5. The same move maps the A string onto the G string.

Second, **fret 12 is a reset**: every string repeats its open note there, so the whole map above fret 12 is just frets 0–11 again. Learn frets 0–12 on two strings, apply the octave jump, and you can name any note on the neck in a couple of seconds.

- Drill: pick a random note name each day (say, Bb) and find it on every string.
- Drill: play the octave shape from frets 1–10 on the low E, naming each pair out loud.`,
            },
            {
              kind: 'fretboard',
              spec: { type: 'scale', tonic: 'C', scale: 'major' },
              caption:
                'Every C major note on the neck — notice how the same notes repeat in octaves as you move up.',
            },
            {
              kind: 'table',
              caption: 'The low E string, frets 0–12. The A string works identically, starting from A.',
              head: ['Fret', '0', '1', '2', '3', '5', '7', '8', '10', '12'],
              rows: [['Note', 'E', 'F', 'F#', 'G', 'A', 'B', 'C', 'D', 'E']],
            },
            {
              kind: 'quiz',
              questions: [
                {
                  prompt: 'Which two pairs of notes have NO sharp between them?',
                  choices: ['A–B and C–D', 'B–C and E–F', 'F–G and G–A', 'D–E and A–B'],
                  answer: 1,
                  explanation:
                    'B→C and E→F are the two natural half steps — neighboring frets with nothing between.',
                },
                {
                  prompt: 'What note is at fret 5 of the low E string?',
                  choices: ['G', 'A', 'B', 'C'],
                  answer: 1,
                  explanation:
                    "E (0) → F (1) → F# (2) → G (3) → G# (4) → A (5). Fret 5 of a string is also the next string's open note — except on the G string, where fret 4 gives B.",
                },
                {
                  prompt: 'One fret on the guitar equals…',
                  choices: ['One whole step', 'One half step', 'One octave', 'It depends on the string'],
                  answer: 1,
                  explanation:
                    'Each fret is a half step (semitone) — the smallest distance in Western music. Two frets make a whole step.',
                },
              ],
            },
          ],
        },
        {
          id: 'foundations-intervals',
          title: 'Intervals: Distances You Can See',
          synopsis: 'Every interval is a fret distance — learn to see and hear the shapes that measure music.',
          blocks: [
            {
              kind: 'text',
              md: `An **interval** is the distance between two notes — and on the guitar, distance is something you can literally see and count. Every interval is a number of frets. Play any note, then the note two frets higher on the same string: that exact distance sounds the same anywhere on the neck, in any key, on any string. This is the guitar's superpower. A pianist has to relearn every distance in every key; you just slide the shape.

You already met the two smallest intervals in Lesson 1: one fret is a **half step** (also called a semitone), and two frets make a **whole step**. Every other interval is just a stack of these. Play fret 5 on the low E string (that's A), then fret 7 (B). That's a whole step — the sound of the first two notes of nearly every major-scale melody you know.`,
            },
            {
              kind: 'text',
              heading: 'The names are just fret counts',
              md: `Interval names sound fancy — major 3rd, perfect 5th — but each one is nothing more than a fret count with history attached. Three frets is a **minor 3rd**: the dark, sad distance. Four frets is a **major 3rd**: the bright, happy one. Seven frets is a **perfect 5th** — the power-chord interval. Twelve frets is an **octave**: the same note again, higher, which is why fret 12 gets double dots on almost every guitar.

Count them out on the low E string from A at fret 5: fret 8 is the minor 3rd (C), fret 9 the major 3rd (C#), fret 12 the perfect 5th (E). Play the root before each one, every time, so your ear ties the name to the sound.`,
            },
            {
              kind: 'table',
              caption: 'Interval names by fret distance. Same string, same key, everywhere on the neck.',
              head: ['Frets', '0', '1', '2', '3', '4', '5', '6', '7', '9', '12'],
              rows: [
                [
                  'Interval',
                  'Unison',
                  'Minor 2nd',
                  'Major 2nd',
                  'Minor 3rd',
                  'Major 3rd',
                  'Perfect 4th',
                  'Tritone',
                  'Perfect 5th',
                  'Major 6th',
                  'Octave',
                ],
              ],
            },
            {
              kind: 'text',
              heading: 'Intervals across strings',
              md: `Nobody actually plays a major 3rd by jumping four frets sideways — you cross strings, and each cross-string pair makes a compact **shape**. Here's the one you'll use constantly: put your root on the low E string, then go one string up and one fret back. That's a major 3rd. Why it works: the next string up is tuned 5 frets higher, so stepping one fret back lands you 4 frets — a major 3rd — above your root.

The diagram below shows it: A at fret 5 on the low E string, C# at fret 4 on the A string. Play them together and you're hearing the interval that makes major chords major. Remember this little shape — in Lesson 7 you'll find it hiding inside every chord you know.

One more cross-string shape worth owning today: the **octave** is two strings up, two frets up. From A at fret 5 on the low E string, jump to the D string, fret 7 — same note, higher. Play a root, its major 3rd, and its octave back to back, and you've started measuring music with your hands.`,
            },
            {
              kind: 'fretboard',
              spec: {
                type: 'literal',
                positions: [
                  { string: 6, fret: 5, note: 'A', interval: 'R', isRoot: true },
                  { string: 5, fret: 4, note: 'C#', interval: '3' },
                ],
              },
              showIntervals: true,
              caption:
                'A major 3rd as a shape: root A (low E string, fret 5) with C# one string up, one fret back.',
            },
            {
              kind: 'quiz',
              questions: [
                {
                  prompt: 'A whole step equals how many frets?',
                  choices: ['One', 'Two', 'Three', 'Four'],
                  answer: 1,
                  explanation: 'One fret is a half step; two frets make a whole step.',
                },
                {
                  prompt:
                    'Your root is A at fret 5 on the low E string. Where is the perfect 5th on the same string?',
                  choices: ['Fret 12', 'Fret 10', 'Fret 9', 'Fret 7'],
                  answer: 0,
                  explanation:
                    'A perfect 5th is seven frets: 5 + 7 = 12. That note is E — A to E is the power-chord interval.',
                },
                {
                  prompt: 'How many frets (half steps) make a major 3rd?',
                  choices: ['Three', 'Four', 'Five', 'Seven'],
                  answer: 1,
                  explanation:
                    'Four frets is a major 3rd, the bright one. Three frets is the minor 3rd, the dark one.',
                },
                {
                  prompt: 'From a root on the low E string, "one string up, one fret back" gives you a…',
                  choices: ['Minor 3rd', 'Perfect 4th', 'Major 3rd', 'Perfect 5th'],
                  answer: 2,
                  explanation:
                    'The next string is tuned 5 frets higher; one fret back makes 4 frets above the root — a major 3rd.',
                },
              ],
            },
          ],
        },
        {
          id: 'foundations-major-scale',
          title: 'Building the Major Scale',
          synopsis: 'One formula — W-W-H-W-W-W-H — builds the seven-note scale everything else is made from.',
          blocks: [
            {
              kind: 'text',
              md: `Take the twelve-note alphabet from Lesson 1 and throw away five notes — what's left, if you choose wisely, is the **major scale**: the seven-note pattern underneath almost every song you've ever heard. The choosing rule is a formula of whole steps and half steps: **W–W–H–W–W–W–H**. Start on any note, walk up using that recipe, and you get the major scale of that note. That's the entire trick — there is nothing else to it.`,
            },
            {
              kind: 'text',
              heading: 'Build one right now',
              md: `Start on C — low E string, fret 8 — and walk the formula up that one string: whole step to D (fret 10), whole to E (12), half to F (13), whole to G (15), whole to A (17), whole to B (19), half step home to C (20). One octave of **C major**: C, D, E, F, G, A, B. Every natural note, no sharps or flats — and that's no coincidence. The two natural half steps you memorized in Lesson 1, B–C and E–F, land exactly where the formula demands its half steps. C major is the formula in its most visible form.

Now run the same recipe from G, starting at fret 3: G, A, B, C, D, E — and then the formula demands a whole step from E, which forces **F#**, not F. That's the whole reason sharps exist in keys: the formula doesn't bend, so the notes do. Start anywhere, apply W–W–H–W–W–W–H, and the right sharps appear on their own.

Of course nobody plays scales twenty frets up one string. On guitar the scale folds across the strings into compact patterns called boxes — here's the first one.`,
            },
            {
              kind: 'fretboard',
              spec: { type: 'scale', tonic: 'C', scale: 'major', box: 0 },
              caption:
                'C major, first box position. The highlighted roots are your anchors — everything else hangs off them.',
            },
            {
              kind: 'text',
              heading: 'Degrees: the scale as numbers',
              md: `Musicians name the seven notes by number: C is **1**, D is 2, E is 3, on up to B at 7 — these numbers are the scale **degrees**. Numbers beat letters because they travel: "the 3rd of the scale" means something in every key, while "E" only matters in a few. From here on, this curriculum talks in degrees constantly.

Why does one seven-note pattern deserve a whole lesson? Because everything downstream is made from it. Keys (next lesson) are major scales wearing a name tag. Chords (Lesson 7) are three notes pulled out of it. The minor scale, the modes in the Modes course, the chord families in Diatonic Harmony — every one of them is this pattern viewed from a different angle. Play the box above slowly and say the degree numbers out loud as you go: one, two, three… That habit pays off for years.`,
            },
            {
              kind: 'quiz',
              questions: [
                {
                  prompt: 'The major scale formula is…',
                  choices: ['W–H–W–W–H–W–W', 'W–W–H–W–W–W–H', 'W–W–W–H–W–W–H', 'H–W–W–H–W–W–W'],
                  answer: 1,
                  explanation:
                    'Whole, whole, half, whole, whole, whole, half. On one string: 2 frets, 2, 1, 2, 2, 2, 1.',
                },
                {
                  prompt: 'What is the 7th degree of the G major scale?',
                  choices: ['F', 'F#', 'E', 'C'],
                  answer: 1,
                  explanation:
                    'G A B C D E F# — running the formula from G forces exactly one sharp, on the 7th degree.',
                },
                {
                  prompt: 'In the major scale, the half steps fall between which degrees?',
                  choices: ['1–2 and 4–5', '2–3 and 5–6', '3–4 and 7–8', '6–7 and 7–8'],
                  answer: 2,
                  explanation:
                    'W–W–H–W–W–W–H: the half steps are the 3rd–4th and 7th–8th steps. In C major, that is E–F and B–C.',
                },
                {
                  prompt: 'Why does C major contain no sharps or flats?',
                  choices: [
                    'Because C is the first letter of the musical alphabet',
                    'Because the natural half steps B–C and E–F fall exactly where the formula wants half steps',
                    'Because guitars are tuned to C',
                    'Because the scale skips the sharps on purpose',
                  ],
                  answer: 1,
                  explanation:
                    'Starting from C, the formula asks for half steps precisely at E–F and B–C — the two spots the alphabet already provides them.',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      title: 'Keys & Chords',
      lessons: [
        {
          id: 'foundations-keys-signatures',
          title: 'Keys & Key Signatures',
          synopsis: 'What it means to be "in a key", why keys carry sharps, and how your ear finds home.',
          blocks: [
            {
              kind: 'text',
              md: `Play a song built from the C major scale and one note keeps acting like gravity: C. Melodies wander away from it and ache to come back; end on it and the music sounds finished. That pull is what defines a **key**. To say a song is "in the key of C major" means two things: its notes come from the C major scale, and C is home. The home note has a name — the **tonic** — and your ear finds it without being taught. Hum the final note of almost any song you know: that's the tonic.`,
            },
            {
              kind: 'text',
              heading: 'Key signatures: the sharp count',
              md: `Run the W–W–H formula from Lesson 3 starting anywhere other than C and some notes come out sharp. Start on G and you need one: F#. Start on D and you need two: F# and C#. Each starting note produces its own fixed set of sharps (or flats), called the **key signature** — the key's fingerprint. You never work these out under pressure; the count grows one sharp at a time, in an order you'll learn to predict in the next lesson.

Some starting notes produce flats instead — F major needs a Bb, and keys like Eb and Ab stack up more. They're the same formula at work, just spelled downward, and horn players love them the way guitarists love sharps. You'll meet them on the flat side of the circle in the next lesson; for now, the sharp keys are where you'll live.

The keys below are the guitarist's home turf. Their tonics sit on or near open strings, which is why such a huge share of guitar music lives in them.`,
            },
            {
              kind: 'table',
              caption: 'The guitar-friendly major keys and their signatures.',
              head: ['Key', 'Sharps', 'Which notes'],
              rows: [
                ['C major', '0', '—'],
                ['G major', '1', 'F#'],
                ['D major', '2', 'F#, C#'],
                ['A major', '3', 'F#, C#, G#'],
                ['E major', '4', 'F#, C#, G#, D#'],
              ],
            },
            {
              kind: 'fretboard',
              spec: { type: 'scale', tonic: 'G', scale: 'major' },
              caption:
                'The key of G major covers the whole neck: seven notes, one sharp (F#), with G as home.',
            },
            {
              kind: 'text',
              heading: 'Train your ear to find home',
              md: `Here's a two-minute drill that teaches more than any paragraph. Walk the G major scale up the low E string: G (fret 3), A (5), B (7), C (8), D (10), E (12), F# (14), G (15). Now walk up again and stop on F# — hold it. Feel it lean forward, practically begging for G. Then land on G and feel the release. That lean-and-resolve is what being in a key *feels* like, and every solo you'll ever play is about controlling it: tension when you move away from home, release when you land.

Do the same in D major on the A string, starting at fret 5: D (fret 5), E (7), F# (9), G (10), A (12), B (14), C# (16), D (17). Different key, identical pull — because the pull comes from the formula, not the note names. Once you can feel home in two keys, you can find it in all of them.`,
            },
            {
              kind: 'quiz',
              questions: [
                {
                  prompt: 'How many sharps are in the key of D major?',
                  choices: ['One', 'Two', 'Three', 'Four'],
                  answer: 1,
                  explanation: 'D major has two sharps: F# and C#.',
                },
                {
                  prompt: 'The "home" note of a key is called the…',
                  choices: ['Tonic', 'Octave', 'Signature', 'Dominant'],
                  answer: 0,
                  explanation:
                    'The tonic is the note the key resolves to — the gravitational center your ear hears as home.',
                },
                {
                  prompt: 'Which key has four sharps?',
                  choices: ['A major', 'G major', 'E major', 'D major'],
                  answer: 2,
                  explanation: 'E major carries F#, C#, G#, and D#. A has three, D has two, G has one.',
                },
                {
                  prompt: 'A key signature tells you…',
                  choices: [
                    'How fast to play the song',
                    'Which notes are sharp or flat throughout the key',
                    'Which fret to start on',
                    'Which strings to avoid',
                  ],
                  answer: 1,
                  explanation:
                    'The signature is the fixed set of sharps or flats the formula produces from that tonic — the key\'s fingerprint.',
                },
              ],
            },
          ],
        },
        {
          id: 'foundations-circle-of-fifths',
          title: 'The Circle of Fifths',
          synopsis: 'One circle maps every key, shows which ones are neighbors — and it lives on your fretboard.',
          blocks: [
            {
              kind: 'text',
              md: `Arrange the twelve notes so each one sits a perfect 5th — seven frets — above the last, and something remarkable happens: they form a closed loop that passes through every key exactly once before coming home. This is the **circle of fifths**, and it's less a theory diagram than a map of which keys are neighbors.

Read it like a clock with C at twelve. Clockwise: C, G, D, A, E, B… each key a perfect 5th above the last, each carrying one more sharp than the one before. Counter-clockwise: C, F, Bb, Eb… each a 4th above the last, each adding one more flat. Every key you'll ever play in is somewhere on this dial, exactly one stop from its two closest relatives.`,
            },
            {
              kind: 'circle',
              tonic: 'C',
              mode: 'major',
              caption:
                'The circle of fifths with C at the top. Clockwise adds a sharp per step; counter-clockwise adds a flat.',
            },
            {
              kind: 'text',
              heading: 'Neighbors share almost everything',
              md: `Walk one step clockwise from C and you reach G. Compare the scales: C major is C D E F G A B; G major is G A B C D E F#. **Six of the seven notes are identical** — only F changed, to F#. That's true for every neighboring pair on the circle: one step, one changed note. Step clockwise and one note sharpens; step counter-clockwise (C to F) and one note flattens (B becomes Bb).

This makes the circle the instant answer to "how many sharps does this key have?" — count the clockwise steps from C. G is one step: one sharp. D is two steps: two sharps. A is three, E is four — exactly the table from last lesson. It also explains why moving to a neighboring key mid-song sounds smooth while leaping across the circle sounds dramatic: the farther apart two keys sit, the fewer notes they share.`,
            },
            {
              kind: 'text',
              heading: 'The circle on your fretboard',
              md: `You don't need to memorize the circle — your guitar has it built in. A perfect 5th is seven frets up one string, or far easier: **one string up, two frets up**. Put a finger on C (A string, fret 3). One string up, two frets up: G (D string, fret 5). Again: D (G string, fret 7). You just walked the circle clockwise with one small shape.

Counter-clockwise is even simpler: the **same fret on the next string up** is a perfect 4th, which is one counter-clockwise step. C (A string, fret 3) to F (D string, fret 3). Trace both directions now, saying the key names out loud, until the neighbors of G, D, and A feel automatic. The Diatonic Harmony course leans on this map constantly when it shows you why certain chords cluster into families.`,
            },
            {
              kind: 'quiz',
              questions: [
                {
                  prompt: 'One step clockwise from C on the circle of fifths is…',
                  choices: ['F', 'G', 'D', 'A'],
                  answer: 1,
                  explanation: 'Clockwise moves up a perfect 5th: C to G. F is one step counter-clockwise.',
                },
                {
                  prompt: 'Neighboring keys on the circle share how many of their seven notes?',
                  choices: ['All seven', 'Six', 'Five', 'Four'],
                  answer: 1,
                  explanation: 'Each step changes exactly one note, so neighbors share six of seven.',
                },
                {
                  prompt: 'Which note changes when you move from C major to G major?',
                  choices: ['B becomes Bb', 'F becomes F#', 'C becomes C#', 'G becomes G#'],
                  answer: 1,
                  explanation:
                    'C major: C D E F G A B. G major: G A B C D E F#. The only difference is F rising to F#.',
                },
                {
                  prompt: 'One step counter-clockwise from C is…',
                  choices: ['G', 'Bb', 'F', 'D'],
                  answer: 2,
                  explanation:
                    'Counter-clockwise moves by a 4th: C to F. F major swaps B for Bb — one new flat.',
                },
              ],
            },
          ],
        },
        {
          id: 'foundations-relative-minor',
          title: 'Relative Major & Minor',
          synopsis: 'C major and A minor are the same seven notes with different homes — three frets apart.',
          blocks: [
            {
              kind: 'text',
              md: `Here's a fact that confuses people for years when taught from a book, and takes five minutes on a fretboard: **every major scale contains a complete minor scale**, made of the exact same seven notes. C major is C D E F G A B, home on C. Start the very same notes from A instead — A B C D E F G — and you get **A natural minor**: same alphabet, new home, completely different mood. C major and A minor are called **relative** keys: two homes sharing one house.

Hear it before you believe it. Play C D E F G A B C up from fret 8 on the low E string and it sounds bright, finished, major. Now play A B C D E F G A from fret 5 — the same seven letters — and it turns melancholy. Nothing changed but where you started and where your ear expects to land. Look at the next two diagrams before reading another word.`,
            },
            {
              kind: 'fretboard',
              spec: { type: 'scale', tonic: 'C', scale: 'major' },
              caption: 'C major across the whole neck, roots marked on C.',
            },
            {
              kind: 'fretboard',
              spec: { type: 'scale', tonic: 'A', scale: 'minor' },
              caption:
                'A natural minor across the whole neck. Compare with the C major map above: every dot is in the same place — only the root markers moved, from C to A.',
            },
            {
              kind: 'text',
              heading: 'The 3-fret trick',
              md: `Stare at those two diagrams until it lands: identical dots, different roots. So how do you find any key's relative minor without spelling scales? **Drop three frets.** C sits at fret 8 on the low E string; three frets down is A at fret 5 — A minor is C major's relative. G sits at fret 3; three frets down is the open E string — E minor is G major's relative. It works everywhere, and in both directions: from any minor root, three frets *up* is its relative major.

Why care? Because it doubles everything you own, for free. Every major pattern you learn is already a minor pattern — you just treat a different note as home, exactly like the ear drill in Lesson 4 but resolving to the 6th degree instead. And when a song feels sad while its notes match a major key signature, it's almost certainly living in the relative minor. This isn't rare — an enormous share of rock and pop rides in minor keys borrowed from a major signature, which is why the trick matters at the jam session, not just on paper.

The Diatonic Harmony course shows you how to tell which of the two homes a song is actually using — for now, train the trick. Name the relative minor of D, A, and E major out loud, checking yourself with the 3-fret drop on the low strings, before you take the quiz.`,
            },
            {
              kind: 'quiz',
              questions: [
                {
                  prompt: 'The relative minor of C major is…',
                  choices: ['A minor', 'E minor', 'C minor', 'D minor'],
                  answer: 0,
                  explanation:
                    'Three frets below C (fret 8, low E string) is A (fret 5). A minor uses the same seven notes as C major.',
                },
                {
                  prompt: "On one string, the relative minor's root sits how many frets below the major root?",
                  choices: ['Two', 'Three', 'Four', 'Five'],
                  answer: 1,
                  explanation:
                    'Three frets (a minor 3rd) down — or three frets up to go from a minor key to its relative major.',
                },
                {
                  prompt: 'What is the relative minor of G major?',
                  choices: ['B minor', 'D minor', 'E minor', 'A minor'],
                  answer: 2,
                  explanation:
                    'G at fret 3, drop three frets: open E. E minor shares all seven notes with G major, including F#.',
                },
                {
                  prompt: 'C major and A natural minor differ in…',
                  choices: [
                    'The notes they contain',
                    'Their home note only',
                    'Their sharps and flats',
                    'The strings they use',
                  ],
                  answer: 1,
                  explanation:
                    'Same seven notes, same zero-sharp signature — the only difference is which note the music treats as home.',
                },
              ],
            },
            {
              kind: 'jam',
              md: `Your library has songs in **E minor** — G major's relative. Pull one up and play the G major notes you already know, but treat E as home: start your phrases from E, land them on E, and hear the same seven notes turn minor around you.`,
              tonic: 'E',
              mode: 'minor',
              scale: 'minor',
            },
          ],
        },
        {
          id: 'foundations-triads',
          title: 'Building Triads: Where Chords Come From',
          synopsis: 'Stack every-other-note from a scale and chords fall out — major, minor, and diminished.',
          blocks: [
            {
              kind: 'text',
              md: `Every chord you've ever strummed is three notes from a scale wearing a trench coat. Take the C major scale, stand on any note, and grab every other note going up: start on C, skip D, take E, skip F, take G. Three notes — C, E, G — played together make a **C major chord**. This grab-every-other-note move is called **stacking 3rds**, because each gap (C up to E, E up to G) is a 3rd from Lesson 2, and the three-note result is a **triad**. Triads are where chords come from — all of them.`,
            },
            {
              kind: 'fretboard',
              spec: { type: 'chordTones', label: 'C' },
              caption:
                'Every C, E, and G on the neck. Play any three of these — one of each — and you have played a C major chord.',
            },
            {
              kind: 'text',
              heading: 'Major, minor, diminished: the 3rds decide',
              md: `Remember from Lesson 2 that 3rds come in two sizes — minor (3 frets) and major (4 frets). Which sizes land in your stack decides the chord's entire personality:

- **Major triad** — root, major 3rd, perfect 5th (R–3–5). C–E–G. Bright, stable, resolved.
- **Minor triad** — root, minor 3rd, perfect 5th (R–b3–5). Stack 3rds on D inside the C scale and you get D–F–A; D up to F is only 3 frets. That one flattened 3rd is the entire difference between happy and sad.
- **Diminished triad** — root, minor 3rd, flat 5th (R–b3–b5). Stack on B: B–D–F. Tense and unstable — it wants to move somewhere immediately.

One scale, one stacking rule, three chord flavors — decided purely by where you're standing when you stack. The names follow the same logic: C means the major triad on C, Dm means the minor triad on D, Bdim the diminished one on B. Even the two-note power chord is a triad with its tell-tale 3rd removed — just R and 5, which is why it sounds neither happy nor sad.`,
            },
            {
              kind: 'fretboard',
              spec: { type: 'voicing', label: 'C' },
              caption:
                'A C major voicing at the nut — five strings ringing, but only the three triad notes C, E, and G, some doubled in different octaves.',
            },
            {
              kind: 'text',
              heading: 'Chords are scale excerpts',
              md: `Set the voicing above next to the chord-tone map before it and the big idea clicks: a **voicing** is just one convenient handful grabbed from the everywhere-map. Guitar chords double notes freely — that open C plays two Cs and two Es — but there are still only three real notes in the building.

This is the doorway into everything ahead. Stack 3rds on all seven degrees of a major scale and you get the seven chords that belong to that key — that's the Diatonic Harmony course, and it's why certain chords simply sound right together. Spread a triad's notes across the neck and you get the five shapes of the CAGED course. For now, do this: play the open C, then find a C, an E, and a G somewhere else on the chord-tone map and play those three instead. Different grip, same chord. That one idea carries you a very long way.`,
            },
            {
              kind: 'quiz',
              questions: [
                {
                  prompt: 'A major triad is built from…',
                  choices: ['R–3–5', 'R–b3–5', 'R–3–b5', 'R–4–5'],
                  answer: 0,
                  explanation: 'Root, major 3rd, perfect 5th — for C major that spells C–E–G.',
                },
                {
                  prompt: 'To turn C major (C–E–G) into C minor, which note moves?',
                  choices: ['C drops to B', 'E drops to Eb', 'G drops to Gb', 'You add a Bb'],
                  answer: 1,
                  explanation:
                    'Minor means a minor 3rd above the root: flatten the 3rd, E, to Eb. Root and 5th stay put.',
                },
                {
                  prompt: 'Triads are built by stacking…',
                  choices: ['4ths', '3rds', '5ths', 'Octaves'],
                  answer: 1,
                  explanation:
                    'Grab every other scale note and each gap is a 3rd — two stacked 3rds make a triad.',
                },
                {
                  prompt: 'Stacking 3rds on B inside the C major scale (B–D–F) gives which triad type?',
                  choices: ['Major', 'Minor', 'Diminished', 'Suspended'],
                  answer: 2,
                  explanation:
                    'B to D is 3 frets (minor 3rd) and B to F is 6 frets (flat 5th): R–b3–b5 — diminished.',
                },
              ],
            },
            {
              kind: 'jam',
              md: `Take it to a song: jam in **C major** and aim for chord notes. While a C chord is ringing, land your phrases on C, E, or G and feel the note lock in — that single habit is the seed of the whole Chord Tone Targeting course.`,
              tonic: 'C',
              mode: 'major',
              scale: 'major',
            },
          ],
        },
      ],
    },
  ],
}

export default course
