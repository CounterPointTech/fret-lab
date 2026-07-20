import type { Course } from '../types'

const course: Course = {
  id: 'harmony',
  title: 'Diatonic Harmony',
  description:
    'Why chords belong to keys: harmonizing the scale, Roman numerals, the progressions behind a thousand songs, cadences, and minor-key harmony.',
  modules: [
    {
      title: 'Chords from Scales',
      lessons: [
        {
          id: 'harmony-seven-note-patterns',
          title: 'The Full 7-Note Patterns',
          synopsis:
            'Add two notes to the pentatonic and the full major scale — with all its tension — snaps into place.',
          blocks: [
            {
              kind: 'text',
              md: `If you've worked through Pentatonic Mastery, you already know five-sevenths of this lesson. The full **major scale** is the pentatonic you've been soloing with, plus two extra notes. G major pentatonic is G, A, B, D, E. Add **C** and **F#** and you have the seven-note G major scale: G, A, B, C, D, E, F#. Same skeleton, two new muscles.

Those additions aren't random. They're the **4th degree** (C) and the **7th degree** (F#) — exactly the two notes the pentatonic leaves out. And they're left out for a reason: they're the tension notes. This lesson is about welcoming them back in, because this whole course — chords, progressions, cadences, keys — is built on the full seven-note scale, not the five-note shortcut.

Before you touch the diagrams, say the seven notes of G major out loud twice: G, A, B, C, D, E, F#. That spelling is the raw material for everything that follows.`,
            },
            {
              kind: 'text',
              heading: 'Why these two notes bite',
              md: `Look at where they land. C sits one fret above B, the scale's 3rd. F# sits one fret below G, the root. Both create **half steps** inside the scale, and half steps are where musical tension lives — a note one fret away from a resting note practically begs to move there. The pentatonic sounds so safe precisely because it deleted both half steps. The full major scale keeps them, which is why it can sound sweet, restless, or triumphant depending on where you lean.

Play the box below slowly, low string to high. It's your familiar first-position pentatonic shape with the two new notes tucked in. Every time you land on a C or an F#, let it ring for a beat and listen to how it leans toward its neighbor.`,
            },
            {
              kind: 'fretboard',
              spec: { type: 'scale', tonic: 'G', scale: 'major', box: 0 },
              caption:
                'G major, first position — the pentatonic skeleton plus the 4th (C) and the 7th (F#).',
              showIntervals: true,
            },
            {
              kind: 'text',
              heading: 'The whole neck',
              md: `Just like the pentatonic, the major scale tiles the entire fretboard in five overlapping positions — no gaps, no surprises. You don't need all five memorized today; the CAGED System course maps each one onto a chord shape so they actually stick. For now, take in the big picture below: seven notes, repeating everywhere, and the same two half-step pairs (B–C and F#–G) recurring in every octave.

Here's why this matters for this course: every chord that belongs to the key of G is built from these seven notes and nothing else. That single fact generates everything in the next six lessons — which chords exist in a key, why some are major and some minor, why certain chord moves feel like coming home. Play the first-position box once more, then hunt down the same seven notes an octave higher up the neck.`,
            },
            {
              kind: 'fretboard',
              spec: { type: 'scale', tonic: 'G', scale: 'major' },
              caption:
                'Every G major note on the neck — five overlapping positions, one scale, two recurring half steps.',
            },
            {
              kind: 'quiz',
              questions: [
                {
                  prompt:
                    'G major pentatonic is G, A, B, D, E. Which two notes complete the full G major scale?',
                  choices: ['C and F#', 'C# and F', 'A# and D#', 'B and E'],
                  answer: 0,
                  explanation:
                    'The major scale adds the 4th (C) and the 7th (F#) to the pentatonic skeleton.',
                },
                {
                  prompt: 'Which scale degrees does the major pentatonic leave out?',
                  choices: ['The 2nd and 6th', 'The 3rd and 5th', 'The 4th and 7th', 'The 1st and 5th'],
                  answer: 2,
                  explanation:
                    'Dropping the 4th and 7th removes both half steps — which is exactly why the pentatonic sounds so safe.',
                },
                {
                  prompt: 'Why do the two added notes create tension?',
                  choices: [
                    'They are outside the key',
                    'They form half steps with their neighbors',
                    'They are always played louder',
                    'They only appear in one octave',
                  ],
                  answer: 1,
                  explanation:
                    'C sits a half step above B, and F# a half step below G. Half steps pull — the smallest distance in music is the strongest magnet.',
                },
                {
                  prompt: 'What note is the 7th degree of G major?',
                  choices: ['F', 'E', 'F#', 'C'],
                  answer: 2,
                  explanation:
                    'G major is G, A, B, C, D, E, F#. The 7th, F#, sits one fret below the root — remember that pull, it runs this whole course.',
                },
              ],
            },
          ],
        },
        {
          id: 'harmony-harmonizing',
          title: 'Harmonizing the Scale',
          synopsis:
            'Stack thirds on every scale degree and seven chords fall out — always in the same quality pattern.',
          blocks: [
            {
              kind: 'text',
              md: `Here's the biggest idea in this course: **keys have chords**, and the chords come straight out of the scale. Take C major — C, D, E, F, G, A, B. Build a chord on each note by stacking every-other scale note on top of it: a stack of **thirds**, the same construction Foundations used to build triads. Start on C: take C, skip D, take E, skip F, take G. That's C–E–G — a C major chord. Start on D: D–F–A — D minor. Do this on all seven degrees and you've **harmonized the scale**: seven chords, one per degree, built entirely from the seven scale notes.

That's the whole trick. When someone says a song is "in C," they mean its chords are drawn from this family of seven. The scale isn't just a melody machine — it's a chord factory, and every key runs the same factory.`,
            },
            {
              kind: 'text',
              heading: 'Why the qualities fall out the way they do',
              md: `You only used scale notes, so the size of each stacked third varies. C up to E is four frets — a **major third**. E up to G is three frets — a minor third. Major third on the bottom makes a major chord. Start on D and it flips: D to F is three frets, F to A is four. Minor third on the bottom makes a minor chord. And on B, both thirds are small — B to D and D to F are three frets each. Two minor thirds stacked make a **diminished** chord: cramped, tense, dying to resolve.

Nobody chose this pattern. It's forced by where the major scale's two half steps sit, which means it's identical in every single major key: **major, minor, minor, major, major, minor, diminished**. Memorize that sequence — it's the periodic table of this course.`,
            },
            {
              kind: 'table',
              caption: 'C major, harmonized. The quality sequence is the same in every major key.',
              head: ['Degree', '1', '2', '3', '4', '5', '6', '7'],
              rows: [
                ['Chord', 'C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim'],
                ['Quality', 'major', 'minor', 'minor', 'major', 'major', 'minor', 'diminished'],
              ],
            },
            {
              kind: 'text',
              heading: 'Hear the family',
              md: `Play the seven chords in order — C, Dm, Em, F, G, Am, Bdim — with any voicings you know. For Bdim, fret just B, D, and F on three adjacent strings, or skip it and notice how the ladder wants to topple back onto C either way. Listen for two things: no chord sounds foreign, because none contains a note outside C major; and yet each has its own color, from the sunny F and G to the moody Am to the anxious Bdim.

Below is the chord built on degree 1, spread across the whole neck. Every dot is a scale note — the chord isn't something added to the key, it's the key with five notes removed. Play through the seven-chord ladder twice, then end on C and let it ring.`,
            },
            {
              kind: 'fretboard',
              spec: { type: 'chordTones', label: 'C' },
              caption:
                'The tones of C major — the chord built on degree 1 — everywhere on the neck. All of them are scale notes.',
            },
            {
              kind: 'quiz',
              questions: [
                {
                  prompt: 'Which chord is built on the 5th degree of C major?',
                  choices: ['G major', 'G minor', 'A minor', 'F major'],
                  answer: 0,
                  explanation:
                    'Stack thirds from G using C major notes: G–B–D. B is a major third above G, so the chord is G major.',
                },
                {
                  prompt: 'In any major key, the chord built on the 2nd degree is…',
                  choices: ['Major', 'Minor', 'Diminished', 'It depends on the key'],
                  answer: 1,
                  explanation:
                    'The quality sequence maj–min–min–maj–maj–min–dim is forced by the scale itself, so degree 2 is minor in every major key.',
                },
                {
                  prompt: 'Which degree of a major key produces the diminished chord?',
                  choices: ['The 2nd', 'The 4th', 'The 5th', 'The 7th'],
                  answer: 3,
                  explanation:
                    'Only the 7th degree stacks two minor thirds (in C: B–D–F), making the lone diminished chord in the key.',
                },
                {
                  prompt: 'What decides whether a harmonized chord comes out major or minor?',
                  choices: [
                    'How loud you strum it',
                    'Whether the bottom third spans four frets or three',
                    'Whether the root is on the low E string',
                    'The tempo of the song',
                  ],
                  answer: 1,
                  explanation:
                    'A major third (four frets) on the bottom gives a major chord; a minor third (three frets) on the bottom gives a minor chord.',
                },
              ],
            },
          ],
        },
        {
          id: 'harmony-roman-numerals',
          title: 'Roman Numerals',
          synopsis:
            'Name chords by their job — I through vii° — and every progression instantly works in every key.',
          blocks: [
            {
              kind: 'text',
              md: `Musicians rarely say "C, then A minor, then F, then G." They say **I–vi–IV–V**, because a chord's job matters more than its name. **Roman numerals** label the seven diatonic chords by scale degree: uppercase for major (I, IV, V), lowercase for minor (ii, iii, vi), and lowercase with a small circle for the diminished one (vii°). The quality sequence you memorized last lesson now reads: I, ii, iii, IV, V, vi, vii° — the same seven jobs in every major key, forever.

Notice how much information the notation smuggles in. The case tells you the quality before you play a note: see a lowercase ii and you already know it's minor, in any key, without thinking. And the numeral tells you the chord's role — I is home, V is the tension chord that points at home, vi is home's melancholy relative. Names describe a chord; numerals describe what it does.`,
            },
            {
              kind: 'text',
              heading: 'Instant transposition',
              md: `Here's the superpower. A progression written in numerals isn't in any key — it's a recipe. I–IV–V in C is C–F–G. Slide the recipe to G and it's G–C–D. Same song, same feel, friendlier key for the singer. Guitarists live off this: capo up two frets, or move a barre shape up two frets, and the chord names all change while the numerals sit still. Once you think in numerals, learning a song in one key means you know it in twelve.

The table below is worth more than a hundred chord charts. Read it row by row: each key is just the maj–min–min–maj–maj–min–dim pattern wearing different note names.`,
            },
            {
              kind: 'table',
              caption: 'The seven diatonic chords in four guitar-friendly keys.',
              head: ['Key', 'I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'],
              rows: [
                ['G', 'G', 'Am', 'Bm', 'C', 'D', 'Em', 'F#dim'],
                ['C', 'C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim'],
                ['D', 'D', 'Em', 'F#m', 'G', 'A', 'Bm', 'C#dim'],
                ['A', 'A', 'Bm', 'C#m', 'D', 'E', 'F#m', 'G#dim'],
              ],
            },
            {
              kind: 'text',
              heading: 'Drill it',
              md: `Cover the table and quiz yourself out loud. What's the vi of G? (Em.) The ii of D? (Em again — the same chord holding two different jobs in two different keys, and that dual citizenship is exactly what Lesson 7 will exploit to find the key of any song.) The V of A? (E.)

Now put it on the guitar. Play I–IV–V in G: G, C, D. Then move the identical recipe to A: A, D, E. Your hands just transposed a progression that took classical composers pen and paper. Do it once more in C and in D, saying the numerals — not the chord names — as you play. This is also how musicians talk on a gig: someone calls "one, four, five in A" and everyone's in. From here on, this course speaks numerals first and chord names second — exactly the fluency you're building right now.`,
            },
            {
              kind: 'quiz',
              questions: [
                {
                  prompt: 'What is the vi chord of D major?',
                  choices: ['B major', 'Bm', 'F#m', 'Em'],
                  answer: 1,
                  explanation:
                    'D major: D, Em, F#m, G, A, Bm, C#dim. The 6th degree is B, and degree 6 is always minor — Bm.',
                },
                {
                  prompt: 'What is the IV chord of A major?',
                  choices: ['E', 'C#m', 'D', 'G'],
                  answer: 2,
                  explanation:
                    'Count up the A major scale: A(1), B(2), C#(3), D(4). Degree 4 is always major, so the IV of A is D.',
                },
                {
                  prompt: 'In the key of G, Em is which numeral?',
                  choices: ['iii', 'ii', 'IV', 'vi'],
                  answer: 3,
                  explanation:
                    'E is the 6th note of the G major scale, so Em is the vi — the relative minor you met in Foundations.',
                },
                {
                  prompt: 'What does the small circle in vii° tell you?',
                  choices: [
                    'The chord is diminished',
                    'The chord is optional',
                    'The chord is played an octave higher',
                    'The chord is major',
                  ],
                  answer: 0,
                  explanation:
                    'The ° marks the diminished quality — lowercase plus circle means the tense two-minor-thirds chord on degree 7.',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      title: 'Progressions & Keys',
      lessons: [
        {
          id: 'harmony-progressions',
          title: 'Progressions You Already Know',
          synopsis:
            'Four numeral recipes — I–IV–V, I–V–vi–IV, ii–V–I, vi–IV–I–V — power most of the songs you know.',
          blocks: [
            {
              kind: 'text',
              md: `A **chord progression** is a loop of numerals, and a shockingly small number of loops power most of Western popular music. Learn four and you can play along with — or write — thousands of songs. You've already met one in disguise: the 12-bar form from Blues Language is I–IV–V wearing work clothes.

Why do the same few loops keep winning? Because each one is a little journey away from the I chord and back. I–IV–V barely leaves the porch. I–V–vi–IV takes a detour through the key's saddest chord before coming home. ii–V–I is a running start at the front door. Your ear doesn't hear four chord names — it hears departure, tension, and return, and these particular routes hit that arc hardest. Here are the big four, spelled out in G so you can play each one immediately.`,
            },
            {
              kind: 'table',
              caption: 'The four progressions behind a thousand songs, shown in the key of G.',
              head: ['Progression', 'In G', 'The archetype'],
              rows: [
                [
                  'I–IV–V',
                  'G–C–D',
                  'Three-chord rock and roll, blues, punk, folk — direct, driving, never far from home',
                ],
                [
                  'I–V–vi–IV',
                  'G–D–Em–C',
                  'The modern pop anthem — bright open, emotional dip at the vi, hopeful lift back home',
                ],
                [
                  'ii–V–I',
                  'Am–D–G',
                  'The jazz engine — a two-chord runway that lands on home harder than V alone',
                ],
                [
                  'vi–IV–I–V',
                  'Em–C–G–D',
                  'The melancholy loop — the pop anthem’s exact chords, started from the sad one',
                ],
              ],
            },
            {
              kind: 'text',
              heading: 'Same chords, different story',
              md: `Look at the last two rows: I–V–vi–IV and vi–IV–I–V contain the identical four chords. What changes is where the loop starts — and therefore which chord your ear treats as the center of gravity. Start on G and the Em is a passing shadow; start on Em and the whole loop turns wistful, with G as a memory of brighter times. Progressions aren't just chord lists; they're orbits around a home chord.

This is also your first taste of a skill Lesson 7 will sharpen: recognizing a progression by ear and by numeral. Next time a song grabs you, ask which of the four loops it's running — odds are genuinely good it's one of them, or a close cousin. The chords change from song to song; the numerals barely do.`,
            },
            {
              kind: 'text',
              heading: 'Play the I like you mean it',
              md: `That home chord — the **I** — deserves a map. Below is every tone of the G major triad across the neck: root, 3rd, and 5th. When a progression comes back to I, these are the notes that sound resolved, and the Chord Tone Targeting course builds an entire soloing method on exactly this map.

For now, play the progressions. Strum G–C–D, four slow beats each, and feel the pull back to G. Then play G–D–Em–C twice through. Then start the same chords from Em — Em–C–G–D — and notice how home has quietly moved. Finish with Am–D–G and feel the two-step landing. If a change trips you up, slow down and stay slow: the goal here is hearing the orbit, not speed. Once each loop feels inevitable under your fingers, you own it in every key at once.`,
            },
            {
              kind: 'fretboard',
              spec: { type: 'chordTones', label: 'G' },
              caption:
                'Every tone of the G major triad — the I chord in the key of G. When a progression resolves to I, these notes are home.',
            },
            {
              kind: 'quiz',
              questions: [
                {
                  prompt: 'What is I–V–vi–IV in the key of C major?',
                  choices: ['C–G–Am–F', 'C–F–G–Am', 'C–G–Em–F', 'C–Am–F–G'],
                  answer: 0,
                  explanation:
                    'In C major: I = C, V = G, vi = Am, IV = F. Read the numerals in order: C–G–Am–F.',
                },
                {
                  prompt: 'What is ii–V–I in the key of G major?',
                  choices: ['Bm–D–G', 'Am–D–G', 'Am–C–G', 'C–D–G'],
                  answer: 1,
                  explanation:
                    'In G major the 2nd degree is A (minor), the 5th is D: Am–D–G, the classic two-step landing.',
                },
                {
                  prompt: 'Which progression is the backbone of the 12-bar blues?',
                  choices: ['ii–V–I', 'vi–IV–I–V', 'I–IV–V', 'I–V–vi–IV'],
                  answer: 2,
                  explanation:
                    'The 12-bar form from Blues Language cycles I, IV, and V — three chords, endless songs.',
                },
                {
                  prompt:
                    'vi–IV–I–V uses the same four chords as I–V–vi–IV. Why does it feel different?',
                  choices: [
                    'It uses different voicings',
                    'It must be played slower',
                    'Starting on the vi makes the minor chord the center of gravity',
                    'It only works in minor keys',
                  ],
                  answer: 2,
                  explanation:
                    'Where a loop starts shapes what your ear hears as home. Leading with the vi turns the same chords wistful.',
                },
              ],
            },
          ],
        },
        {
          id: 'harmony-cadences',
          title: 'Cadences: Tension & Home',
          synopsis:
            'Authentic, plagal, deceptive, half — the four ways a phrase lands, and the physics of why V pulls home.',
          blocks: [
            {
              kind: 'text',
              md: `A **cadence** is how a musical phrase ends — the final chord move and the feeling it leaves behind. There are four you need, and they're less like theory and more like punctuation: a period, a soft amen, a plot twist, and a question mark. Learn to hear them and song structure stops being a mystery — you'll feel exactly when a section is closing, faking, or holding its breath.

Cadences are also where the numerals from the last two lessons earn their keep. Every cadence is described in numerals — V to I, IV to I — so once you hear one, you can play it in any key instantly. That's the payoff of thinking in jobs instead of names.`,
            },
            {
              kind: 'text',
              heading: 'What resolution physically is',
              md: `Why does V moving to I feel like arriving? Look inside the chords. In C major, the V chord is G: the notes G–B–D. That B is the scale's 7th degree — the **leading tone** — sitting one fret below the tonic C. One fret is a half step, the strongest pull in music, the same pull you met in Lesson 1. When G moves to C, the B slides up that single half step onto C and the tension snaps shut. Resolution isn't a metaphor: it's specific notes moving the smallest possible distance onto the notes of home.

Blues Language showed you the upgrade: add a 7th to the V (G becomes G7, adding an F) and now a second restless note wants to fall a half step onto E, the 3rd of C. Two magnets instead of one — that's why V7 pulls even harder than V.`,
            },
            {
              kind: 'table',
              caption: 'The four cadences, with examples in the key of C.',
              head: ['Cadence', 'Move', 'In C', 'Sounds like'],
              rows: [
                ['Authentic', 'V → I', 'G → C', 'A period — the leading tone resolves up to the root; the definitive ending'],
                ['Plagal', 'IV → I', 'F → C', 'The "Amen" from hymns — no leading tone, so the landing is soft and warm'],
                ['Deceptive', 'V → vi', 'G → Am', 'A plot twist — your ear expects I and gets its minor relative instead'],
                ['Half', 'ends on V', '… → G', 'A question mark — the phrase stops on maximum tension, begging to continue'],
              ],
            },
            {
              kind: 'text',
              heading: 'Play the punctuation',
              md: `Run all four in C. Play G to C and hear the door close — authentic. Play F to C and hear the gentle settle — plagal. Play G to Am and feel your ear flinch as the expected home turns minor — deceptive. Then play C–F–G and just stop. Sit in that itch — that's the half cadence, and it's why so many verses seem to lean forward into the chorus: the verse ends on V, and the chorus pays the tension off with an authentic landing.

Songwriters chain these deliberately. A deceptive cadence buys one more repeat of the hook; a plagal tag softens an ending; a half cadence is a held breath. Play each of the four moves three times, naming the cadence out loud as you land it — hearing and naming together is what makes it stick.`,
            },
            {
              kind: 'quiz',
              questions: [
                {
                  prompt: 'Which cadence is V → I?',
                  choices: ['Plagal', 'Half', 'Authentic', 'Deceptive'],
                  answer: 2,
                  explanation:
                    'V to I is the authentic cadence — the strongest close, powered by the leading tone rising to the root.',
                },
                {
                  prompt: 'In C major, the leading tone is which note?',
                  choices: ['B', 'F', 'D', 'G'],
                  answer: 0,
                  explanation:
                    'B is the 7th degree of C major, one half step below the tonic C — and it lives inside the V chord (G–B–D).',
                },
                {
                  prompt: 'A deceptive cadence in C major moves from G to…',
                  choices: ['C', 'F', 'Dm', 'Am'],
                  answer: 3,
                  explanation:
                    'Deceptive means V resolves to vi instead of I. In C major the vi is Am — home’s minor stand-in.',
                },
                {
                  prompt: 'A phrase that stops on the V chord is which cadence?',
                  choices: ['Authentic', 'Half', 'Plagal', 'Deceptive'],
                  answer: 1,
                  explanation:
                    'Ending on V is the half cadence — a question mark that leaves the tension unresolved.',
                },
              ],
            },
          ],
        },
        {
          id: 'harmony-minor-keys',
          title: 'Minor-Key Harmony',
          synopsis:
            'Harmonize natural minor, meet i–bVI–bIII–bVII, and learn why minor songs borrow a major V.',
          blocks: [
            {
              kind: 'text',
              md: `Minor keys have chord families too. Harmonize A natural minor — A, B, C, D, E, F, G, the same seven notes as C major, as the relative-minor lesson in Foundations showed — and you get the same seven chords as C major, renumbered from A. The quality sequence comes out: **minor, diminished, major, minor, minor, major, major**. You'll see the numerals written two ways: III, VI, VII, or bIII, bVI, bVII — the flat versions compare each degree to the major scale, and that's the spelling most rock and pop charts use.

Notice what flipped. The tonic chord is now minor (i), the diminished chord moved to degree 2, and the key's three major chords now live on bIII, bVI, and bVII. Same seven chords as the relative major, entirely different gravity — because home moved. Play Am, then C, then back to Am, and feel which one your ear treats as the ground floor.`,
            },
            {
              kind: 'table',
              caption: 'A natural minor, harmonized. Same notes as C major, new home, new numbering.',
              head: ['Degree', '1', '2', '3', '4', '5', '6', '7'],
              rows: [
                ['Numeral', 'i', 'ii°', 'bIII', 'iv', 'v', 'bVI', 'bVII'],
                ['Chord', 'Am', 'Bdim', 'C', 'Dm', 'Em', 'F', 'G'],
                ['Quality', 'minor', 'diminished', 'major', 'minor', 'minor', 'major', 'major'],
              ],
            },
            {
              kind: 'text',
              heading: 'The minor anthem: i–bVI–bIII–bVII',
              md: `The signature minor-key loop is **i–bVI–bIII–bVII** — in A minor: Am–F–C–G. If that looks familiar, it should: they're the same four chords as the vi–IV–I–V loop from Lesson 4, heard from the minor side of the family. This is the backbone of countless rock and pop songs in minor keys — dark opening, two major chords lifting through the middle, and the bVII rolling you back to the i. Play Am–F–C–G around the loop four times, slowly, and feel how Am is unmistakably home even with three major chords in the ring. That's minor-key gravity at work.`,
            },
            {
              kind: 'fretboard',
              spec: { type: 'scale', tonic: 'A', scale: 'minor' },
              caption:
                'A natural minor across the whole neck — the same seven notes as C major, renumbered from A.',
            },
            {
              kind: 'text',
              heading: 'The borrowed V',
              md: `Now the famous cheat. Play Am, then Em, then Am. Soft landing, right? The v chord of natural minor (Em) contains G natural — a whole step below the tonic A. No leading tone, no pull, no snap. So for centuries composers have fixed it by force: raise that G to **G#**, turning Em into **E major**, and suddenly there's a note one fret under the tonic straining upward. Play Am–E–Am and hear the difference — that's a real authentic cadence, imported into a minor key.

That raised 7th technically creates a new scale — the **harmonic minor** — which Modes & Beyond covers properly. For now, remember the practical takeaway: an E major chord in an A minor song isn't a mistake or an exception. It's the borrowed V, the oldest trick in the harmony book, and once you know it you'll spot it in half the minor-key songs you love.`,
            },
            {
              kind: 'quiz',
              questions: [
                {
                  prompt: 'What chord is built on the 3rd degree of A natural minor?',
                  choices: ['C minor', 'C major', 'E major', 'D minor'],
                  answer: 1,
                  explanation:
                    'Stacking thirds from C using A minor’s notes gives C–E–G: C major, the bIII (and the relative major of A minor).',
                },
                {
                  prompt: 'What is i–bVI–bIII–bVII in A minor?',
                  choices: ['Am–F–C–G', 'Am–G–C–F', 'Am–F–G–C', 'Am–C–F–G'],
                  answer: 0,
                  explanation:
                    'i = Am, bVI = F, bIII = C, bVII = G. The same four chords as C major’s vi–IV–I–V, centered on the minor.',
                },
                {
                  prompt: 'Why is the natural-minor v chord (Em in A minor) a weak way to cadence?',
                  choices: [
                    'It contains a note outside the key',
                    'It has no leading tone — its G is a whole step below the tonic',
                    'Minor chords cannot end phrases',
                    'It shares no notes with Am',
                  ],
                  answer: 1,
                  explanation:
                    'Resolution needs a half-step pull. G natural sits a whole step under A, so Em drifts home instead of snapping.',
                },
                {
                  prompt: 'To turn Em into the borrowed V (E major) in A minor, which note do you raise?',
                  choices: ['E to F', 'B to C', 'G to G#', 'A to A#'],
                  answer: 2,
                  explanation:
                    'Em is E–G–B; raising G to G# makes E–G#–B, E major — and G# is the leading tone, one fret below A.',
                },
              ],
            },
          ],
        },
        {
          id: 'harmony-find-the-key',
          title: 'Find the Key of Anything',
          synopsis:
            'Turn a raw chord list into a key with a three-step method — then test it on your own library.',
          blocks: [
            {
              kind: 'text',
              md: `Everything in this course now inverts into a superpower. So far you've gone from key to chords; real life runs the other way — someone hands you a chord list (a chart, a lyrics site, or Fret Lab's own chord detection) and you need the key. Get the key and you instantly know the numerals, the likely cadences, and which scale to solo with. That one deduction turns a wall of chord names into a map you already own. Here's the method — three steps, no guesswork.`,
            },
            {
              kind: 'text',
              heading: 'The three-step method',
              md: `1. **Collect the major chords.** A major key contains exactly three: I, IV, and V.
2. **Find the whole-step pair.** The two major chords a whole step apart are IV and V. The remaining major chord is your I. Example: a song uses F, G, and C. F and G sit a whole step apart, so they're IV and V — which makes C the I. Key of C major.
3. **Check where home is.** The minor chords should slot into ii, iii, and vi. But if the song starts, ends, and keeps landing on the vi chord instead of the I, you're in the **relative minor** — same chord family, minor center. C major's family with every phrase landing on Am is the key of A minor.

Bonus clue: a diminished chord is a gift. It's the vii°, one half step below the tonic — spot F#dim and you're almost certainly in G major (or its relative, E minor). And from last lesson: one lone major chord that "shouldn't" be there in a minor song is probably the borrowed V.`,
            },
            {
              kind: 'table',
              caption: 'Three worked examples of the method.',
              head: ['Chords you see', 'Whole-step majors', 'So I is', 'Verdict'],
              rows: [
                ['G, C, D, Em', 'C + D (IV, V)', 'G', 'G major — unless Em is home, then E minor'],
                ['Am, F, C, G', 'F + G (IV, V)', 'C', 'Phrases land on Am: A minor, C’s relative'],
                ['Gm, Cm, Dm, Eb, F', 'Eb + F (IV, V)', 'Bb', 'Home is Gm: G minor, Bb’s relative'],
              ],
            },
            {
              kind: 'text',
              heading: 'Your library is the answer sheet',
              md: `Fret Lab hands you an endless supply of practice: the song workspace detects the chords of every song you load. Open a song, read the detected chord timeline, and run the method before looking anything up — list the distinct chords, find the whole-step major pair, name the I, then listen for whether home feels major or minor. Do this for three songs in your library, checking your answer against your ear each time, and the method stops being a procedure and becomes a reflex.

One warning: real songs sometimes color outside the lines — a borrowed chord here, a key change there. Don't panic. Find the key that explains most of the chords, and treat the stragglers as the spice. The Chord Tone Targeting course teaches you to solo through exactly those moments.`,
            },
            {
              kind: 'quiz',
              questions: [
                {
                  prompt: 'A song uses G, C, D, and Em. What key is it most likely in?',
                  choices: ['C major', 'D major', 'G major', 'E major'],
                  answer: 2,
                  explanation:
                    'C and D are the whole-step pair (IV and V), leaving G as the I. Em slots in as the vi.',
                },
                {
                  prompt: 'A song loops Am–F–C–G and every phrase lands on Am. What key?',
                  choices: ['C major', 'A minor', 'F major', 'G major'],
                  answer: 1,
                  explanation:
                    'The chords are C major’s family, but home is the vi chord, Am — so it’s A minor, the relative minor.',
                },
                {
                  prompt: 'The only major chords in a song are D and E. What key?',
                  choices: ['D major', 'E major', 'G major', 'A major'],
                  answer: 3,
                  explanation:
                    'D and E are a whole step apart, so they’re IV and V. Count down: the I a fourth below D (and a fifth below E) is A. Key of A major.',
                },
                {
                  prompt: 'You spot an F#dim chord in a chart. Which key is most likely?',
                  choices: ['C major', 'G major (or its relative E minor)', 'D major', 'A major'],
                  answer: 1,
                  explanation:
                    'The diminished chord is the vii°, one half step below the tonic. F#dim points straight at G major — or E minor, its relative.',
                },
              ],
            },
            {
              kind: 'jam',
              md: `Your library has at least one song in **G minor**. Open it, read the detected chords — expect faces from the family Gm, Cm, Dm, Eb, F, Bb, and maybe a borrowed D major — and run the three-step method before peeking at anything. Then jam over it with G natural minor, landing on chord tones as the detected chords roll by.`,
              tonic: 'G',
              mode: 'minor',
              scale: 'minor',
            },
          ],
        },
      ],
    },
  ],
}

export default course
