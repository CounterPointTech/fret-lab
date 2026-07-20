import type { Course } from '../types'

const course: Course = {
  id: 'caged',
  title: 'The CAGED System',
  description:
    'Five chord shapes that map the entire neck — and how scales and arpeggios live inside them.',
  modules: [
    {
      title: 'The Five Shapes',
      lessons: [
        {
          id: 'caged-five-shapes',
          title: 'Five Shapes, One Chord',
          synopsis:
            'The five open chords you already know are movable templates — meet the same C chord in three different places.',
          blocks: [
            {
              kind: 'text',
              md: `You already know five chords that are about to become a map of the entire neck: the open C, A, G, E, and D grips. The **CAGED system** is the discovery that these five shapes are not just beginner chords — they're *movable templates*, and between them they cover every major chord in every position on the guitar.

Here's the logic, straight from the Foundations course: a C major chord is just three notes — C, E, and G. *Any* grip that sounds those three notes is a C chord. The open C grip is one way. But slide a different open shape up the neck until its notes land on C, E, and G, and you've got the same chord in a new place with a new color.`,
            },
            {
              kind: 'text',
              heading: 'One chord, three homes',
              md: `Look at the three diagrams below. All three are C major — same three notes, three different grips, three different neighborhoods of the neck.

The first is the open **C shape** you already play. The second is the **A shape**: the open-A grip pushed up so its root lands on C — that's fret 3 of the A string, a note you memorized in the Foundations fretboard map. The third is the **E shape**: the open-E grip pushed all the way up to fret 8, because fret 8 of the low E string is C.

Play all three back to back, low to high. Listen to how each one is unmistakably C, but each sits in a different register. That sound — one chord, several homes — is the whole point of this course.`,
            },
            {
              kind: 'fretboard',
              spec: { type: 'voicing', label: 'C', shape: 'C' },
              caption: 'C major, C shape — the open grip you already know. Root on the A string, fret 3.',
            },
            {
              kind: 'fretboard',
              spec: { type: 'voicing', label: 'C', shape: 'A' },
              caption: 'The same C major as an A shape: the open-A grip moved up so its root sits at fret 3 of the A string.',
            },
            {
              kind: 'fretboard',
              spec: { type: 'voicing', label: 'C', shape: 'E' },
              caption: 'C major again as an E shape at fret 8 — fret 8 of the low E string is C.',
            },
            {
              kind: 'text',
              heading: 'The root is the handle',
              md: `Every shape hangs from its **root** — the note the chord is named after — on one specific string. Move the root, and the whole shape moves with it. That's why the low-string note names you drilled in Foundations matter so much here: name the root, and you've named the chord.

- **E and G shapes**: root on the 6th (low E) string
- **A and C shapes**: root on the 5th (A) string
- **D shape**: root on the 4th (D) string

One warning before you drill: don't try to conquer all five shapes this week. The rest of this module takes them two and three at a time, in the order working guitarists actually use them.

Now grab your guitar and play the three C voicings above until switching between them feels smooth. Say "root" out loud each time you plant the anchor finger. The next lesson turns the two easiest shapes — E and A — into the barre chords you'll use constantly.`,
            },
            {
              kind: 'quiz',
              questions: [
                {
                  prompt: 'How many CAGED shapes does every major chord have on the neck?',
                  choices: ['Three', 'Four', 'Five', 'Twelve'],
                  answer: 2,
                  explanation:
                    'One for each letter: C, A, G, E, and D. Every major chord can be played in all five shapes, each in its own region of the neck.',
                },
                {
                  prompt: 'The A-shape voicing of C major puts its root where?',
                  choices: [
                    'Fret 3 of the A string',
                    'Fret 8 of the low E string',
                    'Fret 5 of the D string',
                    'The open A string',
                  ],
                  answer: 0,
                  explanation:
                    'The A shape hangs from a root on the 5th string. Counting up the A string — A, A#, B, C — puts C at fret 3.',
                },
                {
                  prompt: 'Why does an E shape played at fret 8 sound a C major chord?',
                  choices: [
                    'Because fret 8 is always C on every string',
                    'Because fret 8 of the low E string is C, and the shape keeps the same intervals',
                    'Because the E shape can only play C',
                    'Because barre chords are always major',
                  ],
                  answer: 1,
                  explanation:
                    'The shape is a template of intervals. Plant its root on C (low E string, fret 8) and every note in the grip shifts with it, spelling C, E, and G.',
                },
                {
                  prompt: 'Which two shapes hang their root from the 6th (low E) string?',
                  choices: ['C and A', 'E and G', 'D and C', 'A and D'],
                  answer: 1,
                  explanation:
                    'E and G shapes are rooted on the 6th string; A and C shapes on the 5th; the D shape on the 4th.',
                },
              ],
            },
          ],
        },
        {
          id: 'caged-e-a-barres',
          title: 'The E & A Barre Shapes',
          synopsis:
            'The two workhorse barre shapes, and how to name any chord instantly from its root fret on strings 6 and 5.',
          blocks: [
            {
              kind: 'text',
              md: `Of the five shapes, two do most of the heavy lifting in real playing: the **E shape** and the **A shape**. They're the classic **barre chords** — your index finger lays flat across the strings like a movable nut, and the rest of your hand forms the familiar open grip in front of it. Full, strong voicings on five or six strings, playable anywhere.

Why these two? Because their roots live on the low E and A strings — the two strings you already know cold from the Foundations fretboard map. Know the note under your barre, and you know the chord. No thinking, no counting shapes: root name = chord name.

This is also the moment the dreaded F chord finally makes sense. F major has no comfortable open grip — but it's just the E shape moved up one fret. If your barre buzzes at first, that's normal: roll the index finger slightly onto its bony edge, keep it close behind the fret wire, and let your arm's weight do the pressing instead of squeezing with the thumb.`,
            },
            {
              kind: 'fretboard',
              spec: { type: 'voicing', label: 'F', shape: 'E' },
              caption: 'F major: the E shape barred at fret 1. The root under your index finger — low E string, fret 1 — is F.',
            },
            {
              kind: 'fretboard',
              spec: { type: 'voicing', label: 'Bb', shape: 'A' },
              caption: 'Bb major: the A shape barred at fret 1. The root on the A string, fret 1, is Bb.',
            },
            {
              kind: 'text',
              heading: 'Root tracking: the only math you need',
              md: `Slide the E-shape barre to fret 3 and it's G. Fret 5, A. Fret 8, C. The A-shape barre works identically one string over: fret 3 is C, fret 5 is D, fret 10 is G. Two shapes, two strings, every major chord within reach of the first twelve frets — twice.

That "twice" is the practical payoff: every chord has both an E-shape home and an A-shape home. Check the table below: G major lives at fret 3 as an E shape *and* at fret 10 as an A shape. When you're changing chords, pick whichever home is closer to where your hand already is.

One bonus that costs you nothing: lift one finger and both shapes turn minor. The E shape drops the note on the G string to the barre; the A shape drops the note on the B string. Minor chords only come in E, A, and D shapes — a fact you'll use in the next lesson.`,
            },
            {
              kind: 'table',
              caption: 'Root frets for the two barre shapes. E shape reads the low E string; A shape reads the A string.',
              head: ['Fret', '1', '3', '5', '7', '8', '10', '12'],
              rows: [
                ['E-shape chord', 'F', 'G', 'A', 'B', 'C', 'D', 'E'],
                ['A-shape chord', 'Bb', 'C', 'D', 'E', 'F', 'G', 'A'],
              ],
            },
            {
              kind: 'text',
              md: `Drill it now: play G as an E-shape barre at fret 3, then C as an A-shape barre at the same fret. Same fret, different root string, two different chords. Then walk a G–C–D progression entirely in barres: E shape at 3, A shape at 3, A shape at 5 — notice your hand barely travels. Say each chord name out loud as you land it; naming while playing is what welds the fretboard map to your hands.`,
            },
            {
              kind: 'quiz',
              questions: [
                {
                  prompt: 'An E-shape barre with its root at fret 3 of the low E string is which chord?',
                  choices: ['F major', 'G major', 'A major', 'C major'],
                  answer: 1,
                  explanation:
                    'The low E string goes E (open), F (1), F# (2), G (3) — so the root under the barre is G, and the chord is G major.',
                },
                {
                  prompt: 'To play C major with an A-shape barre, where does the barre go?',
                  choices: ['Fret 1', 'Fret 3', 'Fret 5', 'Fret 8'],
                  answer: 1,
                  explanation:
                    'The A shape reads the A string: A (open), Bb (1), B (2), C (3). Barre at fret 3 puts the root on C.',
                },
                {
                  prompt: 'An A-shape barre at fret 1 sounds which chord?',
                  choices: ['A# / Bb major', 'B major', 'F major', 'C major'],
                  answer: 0,
                  explanation:
                    'One fret up from the open A string is A#, more often spelled Bb. That is the classic first-position Bb barre chord.',
                },
                {
                  prompt: 'Which shapes exist for minor chords in the CAGED system?',
                  choices: [
                    'All five: C, A, G, E, D',
                    'Only E, A, and D',
                    'Only C and G',
                    'Minor chords have no movable shapes',
                  ],
                  answer: 1,
                  explanation:
                    'Lowering the 3rd makes the C and G grips unplayable, so minor chords come in E, A, and D shapes only.',
                },
              ],
            },
          ],
        },
        {
          id: 'caged-c-g-d',
          title: 'C, G & D Shapes Up the Neck',
          synopsis:
            'The three stretchy shapes nobody full-barres — and the chord fragments that make them genuinely useful.',
          blocks: [
            {
              kind: 'text',
              md: `The E and A shapes barre beautifully. The other three — C, G, and D — mostly don't, and it's worth being honest about that up front. Slide the full C grip up the neck and your fingers have to cover a barre *plus* the original open-position fingering stretched across four frets. The full G shape is worse: its notes span from the root fret down to a barre three frets behind it, with your pinky doing splits. Nobody plays that on purpose.

So why learn them at all? Because you don't play these shapes whole — you play **fragments**: three- and four-string pieces of the full shape, usually on the higher strings. Fragments are light, bright, easy to grab, and they fill the spaces between your barre chords. Funk, pop, and rhythm players live on them.`,
            },
            {
              kind: 'fretboard',
              spec: { type: 'voicing', label: 'D', shape: 'C' },
              caption: 'D major as a C shape: the open-C grip slid up so its root sits at fret 5 of the A string.',
            },
            {
              kind: 'fretboard',
              spec: { type: 'voicing', label: 'A', shape: 'G' },
              caption: 'A major as a G shape around frets 2–5. Try just the top three or four strings — that fragment is the usable part.',
            },
            {
              kind: 'fretboard',
              spec: { type: 'voicing', label: 'G', shape: 'D' },
              caption: 'G major as a D shape: the open-D grip moved up so its root lands at fret 5 of the D string.',
            },
            {
              kind: 'text',
              heading: 'How to actually use them',
              md: `Look at each diagram and mentally slice off the lowest strings. The **C shape** minus its bass note is a sweet four-string voicing with the melody note on top. The **G shape**'s useful core is its top three or four strings — grab just those and the impossible stretch disappears. The **D shape** is *already* a fragment: four strings, root on the D string, the brightest voicing of the five.

Root tracking still applies. The C shape hangs from the A string (like the A shape, but the grip extends *toward the nut* from the root instead of away from it). The G shape hangs from the low E string. The D shape hangs from the D string.

Try this: play D major three ways — A-shape barre at fret 5, then the C-shape grip in the diagram above, then the open D chord. Same chord, three registers. Then find G major as a D shape at fret 5 of the D string and compare it to your open G. Hearing the same chord get brighter as the shapes climb is what makes fragments click.

Where you'll actually reach for these: a second guitar part that stays out of the singer's way, a chorus that needs to lift without changing chords, or funk-style stabs where a full six-string barre would sound muddy. High fragments plus a bassist covering the root is a classic band arrangement move.`,
            },
            {
              kind: 'text',
              md: `From here on you know all five homes of every major chord. In the next module the shapes stop being just grips: scales, arpeggios, and finally the whole neck snap onto this five-shape frame. Before moving on, quiz yourself below.`,
            },
            {
              kind: 'quiz',
              questions: [
                {
                  prompt: 'Why does almost nobody play the full G shape as a barre chord?',
                  choices: [
                    'It only works for the chord G major',
                    'The stretch across four frets plus a barre is impractical — fragments work better',
                    'It contains notes outside the chord',
                    'It only sounds good on acoustic guitar',
                  ],
                  answer: 1,
                  explanation:
                    'The full G shape spans the root fret and a barre three frets behind it. Players take the top three or four strings instead — the fragment gives the same color without the acrobatics.',
                },
                {
                  prompt: 'A C-shape grip whose root sits at fret 5 of the A string is which chord?',
                  choices: ['C major', 'D major', 'E major', 'G major'],
                  answer: 1,
                  explanation:
                    'The C shape reads the A string: A, Bb, B, C, C#, D — fret 5 is D, so the grip sounds D major.',
                },
                {
                  prompt: 'The D shape hangs its root from which string?',
                  choices: ['6th (low E)', '5th (A)', '4th (D)', '1st (high E)'],
                  answer: 2,
                  explanation:
                    'The D shape is a four-string voicing rooted on the D string — move that root and the whole shape follows.',
                },
                {
                  prompt: 'A D-shape grip with its root at fret 5 of the D string sounds…',
                  choices: ['F major', 'G major', 'A major', 'D major'],
                  answer: 1,
                  explanation:
                    'Up the D string: D, D#, E, F, F#, G — fret 5 is G. Root G plus the same major-chord intervals makes G major.',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      title: 'Shapes Become Music',
      lessons: [
        {
          id: 'caged-scales-in-shapes',
          title: 'Scales Inside the Shapes',
          synopsis:
            'Overlay the major scale on a chord shape and see it plainly: the chord is the skeleton, the scale is the flesh.',
          blocks: [
            {
              kind: 'text',
              md: `Here's the payoff the first module was building toward: every chord shape sits *inside* a scale pattern. Same neighborhood of the neck, same root, same frets — the chord is simply the strongest notes of the scale, grabbed all at once. Learn to see that, and chords and scales stop being two subjects. They become one map.

Start with the E-shape C chord from Lesson 1, parked at fret 8. Now look at the C major scale pattern that lives in that same neighborhood — the box spanning roughly frets 7 to 10. Every note of the chord grip is *in* the scale box. The scale just adds the in-between notes around the grip.`,
            },
            {
              kind: 'fretboard',
              spec: { type: 'voicing', label: 'C', shape: 'E' },
              caption: 'The skeleton: C major, E shape, frets 8–10.',
            },
            {
              kind: 'fretboard',
              spec: { type: 'scale', tonic: 'C', scale: 'major', box: 0 },
              showIntervals: true,
              caption: 'The flesh: the C major scale box in the same zone, frets 7–10. Every chord-grip note is in here — shown as R, 3, and 5.',
            },
            {
              kind: 'text',
              heading: 'Chord tones are the skeleton',
              md: `Switch the scale diagram to interval view in your mind: the notes marked **R**, **3**, and **5** are the **chord tones** — the C, E, and G that make the chord. Hold the E-shape barre with your fretting hand and you're literally gripping the R–3–5 skeleton of the scale box around it.

This works in every zone, with the matching shape. Below is the scale box that wraps the *A-shape* C chord you learned in Lesson 1, down around frets 2–5. Same story: the barre-chord grip is sitting inside the pattern, and the scale fills in around it.`,
            },
            {
              kind: 'fretboard',
              spec: { type: 'scale', tonic: 'C', scale: 'major', box: 3 },
              showIntervals: true,
              caption: 'The C major scale box around frets 2–5 — the A-shape C chord grip lives inside this one.',
            },
            {
              kind: 'text',
              md: `Practice it physically, because that's how it sticks: hold the E-shape C at fret 8, then without moving your hand position, play the scale box around it, one string at a time. Feel how the scale notes sit under and around your chord fingers. Then reverse it — play through the scale slowly, and every time you hit an R, 3, or 5, pause and let it ring a beat longer than the rest. You're teaching your ear which notes are structural and which are passing.

Then do the same pair of drills in the A-shape zone at fret 3. If you took Pentatonic Mastery, all of this should feel familiar — the pentatonic boxes are these same five zones with two notes per string, and now you know *why* there are exactly five of them: one box per chord shape.

This is also the answer to the eternal question "which scale pattern should I use?" Use the one wrapped around the chord shape nearest your hand. The chord tells you where; the shape tells you what. Next lesson we strip the scale back down to just its skeleton — and turn it into a lead-guitar weapon.`,
            },
            {
              kind: 'quiz',
              questions: [
                {
                  prompt: 'What is the relationship between a chord shape and the scale box in the same zone?',
                  choices: [
                    'They share a root but no other notes',
                    'The chord shape is the R–3–5 skeleton inside the scale box',
                    'The scale replaces the chord shape',
                    'They are in different keys',
                  ],
                  answer: 1,
                  explanation:
                    'Every note of the chord grip is a note of the scale — the root, 3rd, and 5th. The scale adds the remaining notes around that skeleton.',
                },
                {
                  prompt: 'The E-shape C chord at fret 8 pairs with the C major scale box spanning roughly which frets?',
                  choices: ['Frets 0–3', 'Frets 2–5', 'Frets 7–10', 'Frets 12–15'],
                  answer: 2,
                  explanation:
                    'The E-shape grip sits at frets 8–10, and the scale box wrapping that zone runs from fret 7 to fret 10.',
                },
                {
                  prompt: 'In the scale diagrams, which intervals mark the chord tones of C major?',
                  choices: ['R, 2, and 4', 'R, 3, and 5', '3, 5, and 7', 'R, 4, and 6'],
                  answer: 1,
                  explanation:
                    'A major triad is the root, major 3rd, and perfect 5th — for C major, the notes C, E, and G.',
                },
                {
                  prompt: 'Why are there exactly five scale boxes on the neck?',
                  choices: [
                    'Because the guitar has six strings',
                    'Because each box wraps one of the five CAGED chord shapes',
                    'Because scales have five notes',
                    'It is an arbitrary teaching convention',
                  ],
                  answer: 1,
                  explanation:
                    'One zone per shape: C, A, G, E, D. Each scale box is the flesh around one chord-shape skeleton, so five shapes give five boxes.',
                },
              ],
            },
          ],
        },
        {
          id: 'caged-arpeggios',
          title: 'Arpeggios Inside the Shapes',
          synopsis:
            'Play the chord tones one at a time through every zone — the skeleton itself becomes a lead-guitar tool.',
          blocks: [
            {
              kind: 'text',
              md: `Last lesson you saw that the chord grip is the skeleton of the scale. Now play that skeleton one note at a time and you've got an **arpeggio** — the notes of a chord sounded in sequence instead of together. Arpeggios are how lead players outline a chord without strumming it, and they're the strongest possible note choices for a solo: every single note agrees with the harmony.

The diagram below shows *every* C major chord tone on the neck — all the Cs, Es, and Gs everywhere. It looks like a scatter at first. But you already own the tool to organize it: the five shapes. Every cluster of dots is one of the CAGED grips you learned in Module 1.`,
            },
            {
              kind: 'fretboard',
              spec: { type: 'chordTones', label: 'C' },
              showIntervals: true,
              caption: 'Every C, E, and G on the whole neck — the raw material for C major arpeggios, tagged R, 3, and 5.',
            },
            {
              kind: 'text',
              heading: 'The practice pattern',
              md: `Work one zone at a time, and always in the same three steps:

1. **Grip it.** Play the chord shape for that zone — strum it once so your ear has the target.
2. **Break it.** Keep your hand in position and pick the same notes one at a time, lowest string to highest, then back down. Say the interval of each note out loud: "root… third… fifth… root…"
3. **Wander it.** Still in the zone, skip around the chord tones in any order. Land hard on the root to finish.

Start in the E-shape zone at fret 8, because you know it best from the last two lessons. Then move down to the A-shape zone at fret 3 and repeat. Two zones done slowly beat five zones done sloppily — the other three will come quickly once the pattern of grip-break-wander is in your hands.

A detail that pays off later: notice how each interval *feels* under your fingers. In every zone the 3rd sits a specific distance from the root, and your hands learn those distances faster than your eyes memorize dots. When you can grab "the 3rd above this root" without looking at a diagram, you've stopped memorizing shapes and started knowing the neck.`,
            },
            {
              kind: 'metronome',
              bpm: 60,
              label: 'One zone per pass: grip the shape for a bar, then arpeggiate R–3–5 up and back in quarter notes.',
            },
            {
              kind: 'text',
              md: `Why does this matter beyond the exercise? Because when a song sits on a C chord, these dots are the notes that can't sound wrong — land a phrase on any of them and it resolves. Scales tell you what key you're in; arpeggios tell you what chord you're on right now — and that difference is the entire subject of the Chord Tone Targeting course, which picks up exactly where this lesson leaves off.`,
            },
            {
              kind: 'quiz',
              questions: [
                {
                  prompt: 'What is an arpeggio?',
                  choices: [
                    'A scale played very fast',
                    'The notes of a chord played one at a time',
                    'A chord with added notes outside the key',
                    'A strumming pattern',
                  ],
                  answer: 1,
                  explanation:
                    'Arpeggio means the chord is broken into a sequence — same notes as the grip, sounded individually instead of together.',
                },
                {
                  prompt: 'Which notes make up a C major arpeggio?',
                  choices: ['C, D, E', 'C, E, G', 'C, F, G', 'C, E, A'],
                  answer: 1,
                  explanation:
                    'The C major triad is root C, major 3rd E, and perfect 5th G — so the arpeggio cycles through C, E, and G in any octave.',
                },
                {
                  prompt: 'Why practice arpeggios inside the CAGED zones rather than up one string?',
                  choices: [
                    'Single strings are out of tune higher up',
                    'The zones let you find chord tones under your hand anywhere on the neck',
                    'Arpeggios only exist inside chord shapes',
                    'It is easier to play fast on one string',
                  ],
                  answer: 1,
                  explanation:
                    'Any zone you land in already contains a full R–3–5 skeleton from its chord shape — so you can outline the chord without running up and down the neck hunting for notes.',
                },
              ],
            },
          ],
        },
        {
          id: 'caged-five-zones',
          title: 'The Neck as Five Zones',
          synopsis:
            'Chain all five shapes for one key, shift position on purpose, and the neck stops having any blank spots.',
          blocks: [
            {
              kind: 'text',
              md: `Time to zoom all the way out. You know five chord shapes, the scale box wrapped around each one, and the arpeggio inside each box. Chain them together for a single key and something clicks: the neck is not a mystery with a few familiar islands. It's **five zones**, tiled edge to edge, repeating at the octave. There are no blank spots left.

The diagram below is every C major note on the whole neck. Read it zone by zone using the table underneath: down at the nut you're in the C-shape zone; slide up and you pass through the A, G, E, and D zones in order; past fret 12 the C-shape zone returns an octave up. Ascending from the open position, the shapes always spell **C-A-G-E-D** — that's where the name comes from — and the sequence cycles forever, whatever shape you start on.`,
            },
            {
              kind: 'fretboard',
              spec: { type: 'scale', tonic: 'C', scale: 'major' },
              caption: 'The whole neck in C major. Every dot belongs to one of the five zones in the table below — and each zone wraps one C-chord shape.',
            },
            {
              kind: 'table',
              caption: 'The five zones for the key of C major. Neighboring zones overlap by design — the seams are where you shift.',
              head: ['Zone (shape)', 'C', 'A', 'G', 'E', 'D'],
              rows: [
                ['Fret window', '0–3', '2–5', '5–8', '7–10', '9–13'],
                ['C chord lives at', 'open grip', 'barre fret 3', 'fragment ~fret 5', 'barre fret 8', 'grip ~fret 10'],
              ],
            },
            {
              kind: 'text',
              heading: 'Position shifting on purpose',
              md: `Notice the fret windows overlap: the E zone ends at fret 10, the D zone starts at fret 9. Those shared frets are doorways. A **position shift** is simply walking through one — slide along a single string from a note in one zone to a note in the next, and your hand arrives inside a pattern you already know.

Practice the doorway drill: play the C major scale in the A-shape zone (frets 2–5), and when you reach the G string, slide up two frets and finish the scale in the G-shape zone (frets 5–8). One smooth slide, two zones covered. Then chain three: C zone into A zone into G zone, shifting on a different string each time. Shifting stops being an emergency escape and becomes a choice — you move because the melody wants a higher register, not because you ran out of frets.

This is the destination of the whole course: any chord, any key, you know five homes for the chord, five boxes for the scale, and the doorways between them. To move the whole map to another key, slide the entire tiling until the E-shape root lands on the new key's fret — everything else follows automatically.`,
            },
            {
              kind: 'quiz',
              questions: [
                {
                  prompt: 'Ascending the neck from the open position, the chord shapes for any major chord appear in which order?',
                  choices: ['E-A-D-G-C', 'C-A-G-E-D, repeating', 'Alphabetical: A-C-D-E-G', 'It depends on the key'],
                  answer: 1,
                  explanation:
                    'The zones always tile in C-A-G-E-D order going up the neck, cycling back to C at the octave. The key only changes which fret the sequence starts on.',
                },
                {
                  prompt: 'After the D-shape zone, the next zone up the neck is…',
                  choices: [
                    'The E-shape zone',
                    'The C-shape zone, an octave higher',
                    'There are no zones past the D shape',
                    'The A-shape zone',
                  ],
                  answer: 1,
                  explanation:
                    'The five-zone sequence cycles: after D comes C again, one octave (12 frets) above where it first appeared.',
                },
                {
                  prompt: 'For the key of C, the E-shape zone sits around which frets?',
                  choices: ['0–3', '2–5', '7–10', '12–15'],
                  answer: 2,
                  explanation:
                    'The E-shape C chord is barred at fret 8 (fret 8 of the low E string is C), and its scale box wraps it from fret 7 to fret 10.',
                },
                {
                  prompt: 'What makes position shifting between zones easy?',
                  choices: [
                    'Neighboring zones overlap, so a short slide lands you inside the next pattern',
                    'All zones use identical fingerings',
                    'You can only shift at fret 12',
                    'Open strings connect every zone',
                  ],
                  answer: 0,
                  explanation:
                    'Adjacent zones share a fret or two. Slide along one string through the overlap and your hand arrives inside a box you already know.',
                },
              ],
            },
            {
              kind: 'jam',
              md: `Put the zones to work in A major. Find the E-shape A chord (barre at fret 5 — fret 5 of the low E string is A), jam the A major pentatonic box around it, then walk the doorway into the neighboring zones on either side. One shift per phrase, always landing on a chord tone.`,
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
