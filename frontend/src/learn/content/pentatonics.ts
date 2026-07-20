import type { Course } from '../types'

const course: Course = {
  id: 'pentatonics',
  title: 'Pentatonic Mastery',
  description:
    'The five boxes that unlock the whole neck — learn them, connect them, and solo in any key over any song.',
  modules: [
    {
      title: 'The Five Boxes',
      lessons: [
        {
          id: 'pentatonics-box-1',
          title: 'Box 1: Home Base',
          synopsis:
            'Five notes, one shape at fret 5 — the pattern behind half the solos ever recorded.',
          blocks: [
            {
              kind: 'text',
              md: `The **minor pentatonic scale** is five notes. Not seven, not twelve — five. In A minor pentatonic those notes are A, C, D, E, G, and they have a superpower: over almost any rock, blues, or pop song in A minor, every single one of them sounds good. No landmines. That's why this scale powers half of recorded rock — most of the classic solos you know are these five notes, phrased well.

You met scales as note collections back in Guitar Theory Foundations. Here we do it the guitar way: as a **shape**. Your hands learn patterns faster than your brain learns note names, so we learn the pattern first and let the names catch up.`,
            },
            {
              kind: 'fretboard',
              spec: { type: 'scale', tonic: 'A', scale: 'minor pentatonic', box: 0 },
              caption:
                'Box 1 of A minor pentatonic, frets 5–8. Two notes on every string — index finger takes fret 5, ring or pinky takes 7 and 8.',
            },
            {
              kind: 'text',
              heading: 'Play it now',
              md: `Put your index finger at fret 5 on the low E string. That note is **A** — your root. Play frets 5 and 8 on the low E, 5 and 7 on the A and D strings, 5 and 7 on the G, 5 and 8 on the B, and 5 and 8 on the high E. Then walk it back down. Notice the pattern: **two notes per string**, index finger anchored at fret 5 the whole time.

Do it again, slowly, and let your hand memorize the grip. This shape is called **Box 1**, and it's home base for everything in this course.`,
            },
            {
              kind: 'fretboard',
              spec: { type: 'scale', tonic: 'A', scale: 'minor pentatonic', box: 0 },
              showIntervals: true,
              caption:
                'The same box with intervals. R marks the roots — low E fret 5, D string fret 7, high E fret 5. The others are b3, 4, 5, and b7.',
            },
            {
              kind: 'text',
              heading: 'Find your roots',
              md: `Inside Box 1 the root A lives in three places: **fret 5 on the low E**, **fret 7 on the D string**, and **fret 5 on the high E**. Learn these cold. Roots are where phrases land — end a lick on a root and it sounds finished; end anywhere else and it sounds like a question.

Try it: play any four or five notes from the box, then land on the D-string root at fret 7. Hear that "home" feeling? That's the whole game of soloing, in miniature.

Why does this scale never miss? The full minor scale has seven notes, and two of them rub against certain chords. The pentatonic simply deletes the two troublemakers. What's left has no half steps at all — nothing to clash, nothing to apologize for. That's why a beginner bending strings in Box 1 and a stadium headliner are often playing the exact same five notes; the difference is entirely in the phrasing.

One warning before you fall in love: players get stuck in this box for years — it's so comfortable they never leave. We're going to use it as a launchpad, not a cage. Spend this week making Box 1 automatic: up, down, then little three-note phrases ending on roots. The next two lessons add four more boxes that tile the rest of the neck.`,
            },
            {
              kind: 'quiz',
              questions: [
                {
                  prompt: 'Which notes make up A minor pentatonic?',
                  choices: ['A B C D E', 'A C D E G', 'A C E G B', 'A B D E F#'],
                  answer: 1,
                  explanation:
                    'Five notes: A (root), C (b3), D (4), E (5), G (b7). "Penta" = five.',
                },
                {
                  prompt: 'Where is the lowest root in Box 1 of A minor pentatonic?',
                  choices: ['Low E string, fret 3', 'Low E string, fret 5', 'A string, fret 5', 'Low E string, fret 8'],
                  answer: 1,
                  explanation:
                    'Fret 5 on the low E string is A — the anchor your index finger sits on for the whole box.',
                },
                {
                  prompt: 'How many notes does a pentatonic box put on each string?',
                  choices: ['One', 'Two', 'Three', 'It varies by string'],
                  answer: 1,
                  explanation:
                    'Every string gets exactly two notes — that regularity is what makes the boxes so easy to memorize.',
                },
                {
                  prompt: 'Why do phrases usually end on a root note?',
                  choices: [
                    'Roots are easier to bend',
                    'Landing on the root sounds resolved — like coming home',
                    'The root is the highest note in the box',
                    'Roots are the only notes that fit the key',
                  ],
                  answer: 1,
                  explanation:
                    'The root is the tonal center. Ending there resolves the phrase; ending elsewhere leaves it hanging like an unanswered question.',
                },
              ],
            },
          ],
        },
        {
          id: 'pentatonics-boxes-2-3',
          title: 'Boxes 2 & 3: Moving Up',
          synopsis:
            'The next two shapes up the neck — and the shared notes that stitch every box to its neighbor.',
          blocks: [
            {
              kind: 'text',
              md: `Here's the trick the whole course is built on: the five pentatonic notes cover the entire neck, and the five boxes are just five overlapping windows onto that one map. Same notes, different grips. **Box 2** starts where Box 1 ends.

Look at Box 1 again in your head: the *higher* note on each string (frets 7 and 8). Those exact notes are the *lower* notes of Box 2. Neighboring boxes always share one note per string — that overlap is the seam you'll slide through later.`,
            },
            {
              kind: 'fretboard',
              spec: { type: 'scale', tonic: 'A', scale: 'minor pentatonic', box: 1 },
              caption:
                'Box 2, frets 7–10. Its low note on each string is the note Box 1 topped out on. Anchor: C at fret 8 on the low E.',
            },
            {
              kind: 'text',
              heading: 'Box 2 grip and roots',
              md: `Play Box 2 now, low to high: frets 8 and 10 on the low E, 7 and 10 on the A, 7 and 10 on the D, 7 and 9 on the G, 8 and 10 on the B, 8 and 10 on the high E. Index finger floats around fret 7–8, ring and pinky take the rest.

Your roots here: **D string fret 7** (shared with Box 1 — same physical note) and **B string fret 10**. Two roots only, so learn both. Play the box up and down, then land a short phrase on the B-string root at fret 10. Notice the grip feels different from Box 1 — less symmetrical, a little more stretch on the G string. That's normal; each box has its own personality under the fingers.`,
            },
            {
              kind: 'fretboard',
              spec: { type: 'scale', tonic: 'A', scale: 'minor pentatonic', box: 2 },
              caption:
                'Box 3, roughly frets 9–13. Roots: B string fret 10 and A string fret 12.',
            },
            {
              kind: 'text',
              heading: 'Box 3 and your first shift',
              md: `**Box 3** stacks on top of Box 2 the same way: frets 10 and 12 on the low E, 10 and 12 on the A, 10 and 12 on the D, 9 and 12 on the G, 10 and 13 on the B, 10 and 12 on the high E. Roots at **A string fret 12** and **B string fret 10**.

Now the fun part — shifting mid-phrase. Play the first three notes of Box 1 on the low strings, then when you reach the D string, jump your hand up and finish the phrase in Box 2. The shared notes make the seam invisible: you're never leaving the scale, just changing windows. Do the same between Box 2 and Box 3.

Why bother moving up at all? Register. The same lick played in Box 3 sits a fourth higher than in Box 1 — it cuts through more, sings more, and gives a solo somewhere to *go*. Solos that build almost always climb the boxes as they climb in intensity. Three boxes gets you from fret 5 to fret 13 — most of the neck already, and most of the emotional range too.`,
            },
            {
              kind: 'quiz',
              questions: [
                {
                  prompt: 'Roughly which frets does Box 2 of A minor pentatonic cover?',
                  choices: ['Frets 5–8', 'Frets 7–10', 'Frets 9–13', 'Frets 12–15'],
                  answer: 1,
                  explanation:
                    'Box 2 sits at frets 7–10, starting exactly where Box 1 leaves off.',
                },
                {
                  prompt: "How do neighboring boxes relate on each string?",
                  choices: [
                    'They share no notes — each box is separate',
                    "One box's higher note is the next box's lower note",
                    'They share both notes on every string',
                    'They only overlap on the E strings',
                  ],
                  answer: 1,
                  explanation:
                    'Every string overlaps by one note: the top note of a box is the bottom note of the next. That shared note is your sliding lane.',
                },
                {
                  prompt: 'In Box 2, the root A appears on which strings?',
                  choices: [
                    'Low E and high E',
                    'D string (fret 7) and B string (fret 10)',
                    'A string and G string',
                    'Only the low E string',
                  ],
                  answer: 1,
                  explanation:
                    'Box 2 holds two roots: D string fret 7 (shared with Box 1) and B string fret 10.',
                },
                {
                  prompt: "What's the anchor note at fret 8 on the low E string, where Box 2 begins?",
                  choices: ['A', 'C', 'D', 'G'],
                  answer: 1,
                  explanation:
                    'Fret 8 on the low E is C — the b3 of A minor pentatonic and the next scale note above the root at fret 5.',
                },
              ],
            },
          ],
        },
        {
          id: 'pentatonics-boxes-4-5',
          title: 'Boxes 4 & 5: Completing the Map',
          synopsis:
            'The last two shapes, the wrap past fret 12, and the full-neck lattice all five boxes tile together.',
          blocks: [
            {
              kind: 'text',
              md: `Two boxes left, and then the neck has no blank spots. **Box 4** picks up at fret 12 where Box 3 ended — and fret 12 is special: it's the octave, where the whole fretboard starts over. Everything above fret 12 is a repeat of the open-position frets, one octave higher.`,
            },
            {
              kind: 'fretboard',
              spec: { type: 'scale', tonic: 'A', scale: 'minor pentatonic', box: 3 },
              caption:
                'Box 4, frets 12–15. Roots: A string fret 12 and G string fret 14. This is prime bending territory — the strings are loose up here.',
            },
            {
              kind: 'text',
              heading: 'Box 4, then the wrap',
              md: `Play Box 4: frets 12 and 15 on the low E, 12 and 15 on the A, 12 and 14 on the D, 12 and 14 on the G, 13 and 15 on the B, 12 and 15 on the high E. Roots at **A string fret 12** and **G string fret 14**.

**Box 5** comes next — but past fret 15 things get cramped, so here's the octave trick: since the neck repeats every 12 frets, Box 5 lives at frets 14–17 *and* at frets 2–5. Same shape, same notes, an octave apart. We'll learn it in the low spot, where it sits directly below Box 1.`,
            },
            {
              kind: 'fretboard',
              spec: { type: 'scale', tonic: 'A', scale: 'minor pentatonic', box: 4 },
              caption:
                'Box 5 in its low octave, frets 2–5. Roots: G string fret 2, plus both E strings at fret 5. Its top notes at fret 5 are exactly where Box 1 begins.',
            },
            {
              kind: 'text',
              heading: 'The circle closes',
              md: `Play Box 5: frets 3 and 5 on the low E, 3 and 5 on the A, 2 and 5 on the D, 2 and 5 on the G, 3 and 5 on the B, 3 and 5 on the high E. Roots at **G string fret 2** and **both E strings at fret 5** — and that low E fret 5 is Box 1's anchor. Box 5's top notes *are* Box 1's bottom notes. After Box 5 comes... Box 1 again. The five boxes form a loop that wraps around the neck forever, in both directions.

This is worth sitting with: there is no "first" or "last" box on the guitar, just a cycle of five shapes chained by their shared notes. Learn the cycle in one key and you own it in every key — the whole ring just slides up or down the neck together, which is exactly where this course is headed in Lesson 6.`,
            },
            {
              kind: 'fretboard',
              spec: { type: 'scale', tonic: 'A', scale: 'minor pentatonic' },
              caption:
                'The whole lattice: every A minor pentatonic note on the neck. All five boxes are in here, overlapping — there are no gaps and no wrong frets.',
            },
            {
              kind: 'text',
              md: `Stare at the full map for a minute and find each box inside it: 5 (frets 2–5), 1 (5–8), 2 (7–10), 3 (9–13), 4 (12–15), then 5 again at 14–17. Every dot on that diagram belongs to at least one box, and the seams overlap so tightly that the boxes are really one continuous pattern. Now play the lap: up Box 1, shift to Box 2, keep going through 3 and 4 as high as your guitar allows, and come back down. You just used the whole neck with five notes.`,
            },
            {
              kind: 'quiz',
              questions: [
                {
                  prompt: 'Which frets does Box 4 of A minor pentatonic cover?',
                  choices: ['Frets 9–12', 'Frets 12–15', 'Frets 14–17', 'Frets 10–13'],
                  answer: 1,
                  explanation:
                    'Box 4 runs frets 12–15, starting at the octave where the fretboard pattern begins repeating.',
                },
                {
                  prompt: 'Why can Box 5 be played at frets 2–5 as well as frets 14–17?',
                  choices: [
                    'They are two different boxes that happen to look alike',
                    'The fretboard repeats every 12 frets, so every shape exists an octave apart',
                    'Box 5 changes notes depending on where you play it',
                    'Only the E strings repeat at fret 12',
                  ],
                  answer: 1,
                  explanation:
                    'Twelve frets = one octave. Every shape on the neck has a copy 12 frets away with identical note names.',
                },
                {
                  prompt: 'What comes directly above Box 5 on the neck?',
                  choices: ['Box 4', 'Box 1 — the cycle repeats', 'Nothing; the pattern ends', 'A sixth box'],
                  answer: 1,
                  explanation:
                    "Box 5's top notes are Box 1's bottom notes. The five boxes loop around the neck endlessly.",
                },
                {
                  prompt: 'How many distinct pentatonic box shapes are there in total?',
                  choices: ['Three', 'Five', 'Seven', 'Twelve'],
                  answer: 1,
                  explanation:
                    'Five notes in the scale, five anchor points on the low string, five boxes. Then the loop restarts.',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      title: 'Owning the Neck',
      lessons: [
        {
          id: 'pentatonics-connecting',
          title: 'Connecting the Boxes',
          synopsis:
            'Slides, diagonal runs, and drills that break you out of box 1 prison for good.',
          blocks: [
            {
              kind: 'text',
              md: `Knowing five boxes and *using* five boxes are different skills. Most players learn all the shapes and still spend every solo camped at frets 5–8 — call it **box 1 prison**. The escape route is already built into the map: every neighboring pair of boxes shares one note per string, and those shared notes are doors.

The move that opens the door is the **slide**. Instead of picking a note in the next box, you pick a note in *this* box and slide it up a string into the next one. Your hand travels, the sound stays seamless, and suddenly you're phrasing across positions instead of inside one. Pick any string right now and try it: fret a Box 1 note, pick it, and push it up two or three frets to the next scale note without picking again.`,
            },
            {
              kind: 'fretboard',
              spec: { type: 'scale', tonic: 'A', scale: 'minor pentatonic' },
              caption:
                'The full A minor pentatonic map. Horizontal moves follow one string through the boxes; diagonal runs climb strings and frets at the same time.',
            },
            {
              kind: 'text',
              heading: 'Three escape routes',
              md: `Drill these, in order:

1. **The one-string highway.** Play A minor pentatonic on the G string alone: frets 2, 5, 7, 9, 12, 14. Slide between the notes instead of jumping. One string, whole neck — no boxes at all.
2. **The two-box slide.** Start a phrase in Box 1 on the D string, and when you hit fret 7, slide it to fret 10 — you just entered Box 3's floor via Box 2. Finish the phrase up there and land on the B-string root at fret 10.
3. **The diagonal run.** Play the bottom two strings of Box 1, shift up and play the middle two strings in Box 2, shift again and play the top two strings in Box 3. You cut a diagonal from fret 5 to fret 13, climbing strings and positions at once.`,
            },
            {
              kind: 'metronome',
              bpm: 80,
              label:
                'Diagonal-run drill: two notes per click through boxes 1 → 2 → 3 and back — slides on the shifts, no pauses at the seams.',
            },
            {
              kind: 'text',
              heading: 'Make it musical',
              md: `Set the metronome around 80 and run the diagonal at two notes per click until the shifts stop feeling like events. Then loosen up: improvise short phrases, but force each new phrase to start in a different box than the last. It'll feel clunky for a day or two. Then it clicks, and the neck stops being five rooms and becomes one hallway.

A slide isn't just transportation, either — it's an expressive move in its own right. A slow slide into a root note is one of the oldest sounds in blues. So don't hide the seams; lean on them. Pick a note, slide up a box, hold the arrival note and let it ring.

You met this idea from the chord side in The CAGED System — same neck, same five zones. Here you're proving it with your hands.`,
            },
            {
              kind: 'quiz',
              questions: [
                {
                  prompt: 'What makes a slide the smoothest way to change boxes mid-phrase?',
                  choices: [
                    'Slides are louder than picked notes',
                    'You travel along a string through notes both boxes share, so there is no audible seam',
                    'Slides skip over the notes between boxes',
                    'You can only change boxes on open strings',
                  ],
                  answer: 1,
                  explanation:
                    'The overlap note on each string belongs to both boxes — sliding through it moves your hand without breaking the line.',
                },
                {
                  prompt: 'What is "box 1 prison"?',
                  choices: [
                    'Playing only the root notes of Box 1',
                    'Knowing several boxes but always soloing inside the same one position',
                    'A drill for learning Box 1 faster',
                    'Playing Box 1 in the wrong key',
                  ],
                  answer: 1,
                  explanation:
                    "It's the habit of camping at frets 5–8 even after you've learned the whole map. The cure is forcing phrases to cross positions.",
                },
                {
                  prompt: 'A diagonal run moves…',
                  choices: [
                    'Up the neck and across the strings at the same time',
                    'Along a single string only',
                    'Straight across one fret',
                    'Down the neck on open strings',
                  ],
                  answer: 0,
                  explanation:
                    'Diagonals climb both dimensions at once — a few strings in one box, shift, a few strings in the next — covering huge fretboard distance in one phrase.',
                },
                {
                  prompt: 'On the G string, which frets hold A minor pentatonic notes below fret 12?',
                  choices: ['Frets 3, 5, 8, 10', 'Frets 2, 5, 7, 9', 'Frets 1, 4, 6, 9', 'Frets 2, 4, 7, 10'],
                  answer: 1,
                  explanation:
                    'G string: A at fret 2, C at 5, D at 7, E at 9 (then G at 12). That single string is a complete lap through the scale.',
                },
              ],
            },
          ],
        },
        {
          id: 'pentatonics-major',
          title: 'Major Pentatonic: Same Shapes, New Home',
          synopsis:
            'Every box you know, reheard as a bright major sound — same dots, different root.',
          blocks: [
            {
              kind: 'text',
              md: `Here's the best free lunch in guitar: you already know the **major pentatonic** scale. Every shape, every box, every slide from the last four lessons — identical. The only thing that changes is which note you call home.

C major pentatonic is C, D, E, G, A. Look closely: those are the *same five notes* as A minor pentatonic (A, C, D, E, G), just starting from C. The two scales are relatives — same family of notes, two different family homes. Treat A as the root and the sound is dark, bluesy, minor. Treat C as the root and the exact same dots turn bright, sweet, country-tinged major.`,
            },
            {
              kind: 'fretboard',
              spec: { type: 'scale', tonic: 'A', scale: 'minor pentatonic' },
              caption:
                'A minor pentatonic across the neck. Memorize where the roots sit — the dots themselves are about to stay put.',
            },
            {
              kind: 'fretboard',
              spec: { type: 'scale', tonic: 'C', scale: 'major pentatonic' },
              caption:
                'C major pentatonic — the same dots in the same places. Only the roots moved: every C is now home instead of every A.',
            },
            {
              kind: 'text',
              heading: 'Hearing the flip',
              md: `Prove it to your ears. Play Box 1 at fret 5 and end the phrase on A (low E, fret 5) — minor, moody. Now play the same box but end on C: inside Box 1 it lives at low E fret 8, G string fret 5, and high E fret 8. Same notes, but landing on C makes the whole line smile. The resolution note tells your ear which scale you were "really" playing.

The bookkeeping rule: a major pentatonic shares its shapes with the minor pentatonic **three frets below** its root. C major pentatonic = A minor pentatonic shapes (C is three frets above A on any string). G major pentatonic = E minor pentatonic shapes. This is the relative major/minor pairing from Foundations, now living in your hands.`,
            },
            {
              kind: 'text',
              heading: 'When to reach for each',
              md: `Match the scale to the song's key. Song in A minor? A minor pentatonic — dark, aggressive, rock and blues native. Song in C major? C major pentatonic — bright, open, the sound of country solos, classic pop hooks, and happy rock. Same shapes either way; what changes is which key the *song* calls home, and which dots you lean on and land on.

Try both against a droning chord: play the shared shapes over an Am chord, then over a C chord, landing on the matching root each time. Feel how the backing chord plus your landing note flips the color of everything in between.

One trap to dodge: don't think of major pentatonic as "the other scale I also know." It's the same map with a second set of home markers. When you look at the neck, practice seeing both at once — every dot is simultaneously part of A minor's story and C major's story. Which story the listener hears depends on the chords behind you and the notes you choose to land on.`,
            },
            {
              kind: 'quiz',
              questions: [
                {
                  prompt: 'Which notes make up C major pentatonic?',
                  choices: ['C D E F G', 'C D E G A', 'C E F G B', 'C D F G A'],
                  answer: 1,
                  explanation:
                    'C major pentatonic is C, D, E, G, A — the same five notes as A minor pentatonic, rooted on C.',
                },
                {
                  prompt: 'How are C major pentatonic and A minor pentatonic related?',
                  choices: [
                    'They share no notes',
                    'Same five notes and shapes — only the root (home note) differs',
                    'C major pentatonic has two extra notes',
                    'They use the same root but different notes',
                  ],
                  answer: 1,
                  explanation:
                    'They are relative scales: identical dots on the neck. A-as-home sounds minor; C-as-home sounds major.',
                },
                {
                  prompt: 'G major pentatonic uses the same shapes as which minor pentatonic?',
                  choices: ['A minor pentatonic', 'E minor pentatonic', 'B minor pentatonic', 'D minor pentatonic'],
                  answer: 1,
                  explanation:
                    'The relative minor sits three frets below the major root: G down three frets is E, so G major pentatonic = E minor pentatonic shapes.',
                },
                {
                  prompt: 'A song is bright, twangy, and in a major key. Which is the natural first choice?',
                  choices: [
                    "The minor pentatonic rooted on the song's key",
                    "The major pentatonic rooted on the song's key",
                    'Whichever box is closest to fret 5',
                    'Both sound identical over any song',
                  ],
                  answer: 1,
                  explanation:
                    "Major-key song, major pentatonic on its tonic. You'll play familiar shapes — just rooted and resolved on the major home note.",
                },
              ],
            },
          ],
        },
        {
          id: 'pentatonics-any-key',
          title: 'Every Key, Any Song',
          synopsis:
            'One root-finding workflow moves all five boxes to any key — then you take it to real songs.',
          blocks: [
            {
              kind: 'text',
              md: `Everything you've built lives in A minor so far, but none of it is glued there. The boxes are **movable**: shapes have no open strings, so sliding the whole system up or down the neck transposes it perfectly. Master one key and you've mastered twelve — you just need to know where to put your hand.

The workflow is three steps. **One:** name the song's key (Fret Lab's analysis tells you, or your ear does). **Two:** find that root note on the low E string — this is the fretboard-map skill from Foundations paying rent. **Three:** park Box 1 with its anchor on that fret. Every other box falls into place around it, exactly as far apart as they were in A.`,
            },
            {
              kind: 'table',
              caption: 'Box 1 anchor fret (low E string) for common minor keys.',
              head: ['Key', 'E minor', 'G minor', 'A minor', 'B minor', 'C minor', 'D minor'],
              rows: [['Anchor fret', '0 or 12', '3', '5', '7', '8', '10']],
            },
            {
              kind: 'fretboard',
              spec: { type: 'scale', tonic: 'E', scale: 'minor pentatonic', box: 0 },
              caption:
                'Box 1 in E minor: the anchor lands at fret 0, so the shape uses open strings — or play the identical fretted shape at fret 12.',
            },
            {
              kind: 'text',
              heading: 'Major keys use the same trick',
              md: `For a **major-key** song, add one step: the major pentatonic root is three frets *above* the minor shape's anchor — or flip it around and put the familiar Box 1 shape three frets *below* the major root. Song in A major? A is fret 5, so drop three: the Box 1 shape at fret 2 (that's F# minor pentatonic, A major's relative) gives you A major pentatonic. Land on A, not F#, and it sings major.

Test yourself away from the guitar: song in G minor — Box 1 at fret 3. Song in B minor — fret 7. Song in G major — minor shape at... G is fret 3, minus three is open position, the E minor shapes. Quiz your own library until the answer arrives before you finish asking.`,
            },
            {
              kind: 'text',
              heading: 'Close the loop',
              md: `This course gave you five boxes, the seams between them, the major/minor flip, and a workflow for any key. What's left is mileage over real music — which is exactly what Fret Lab is for. Chord Tone Targeting is the natural next course: it upgrades "every note is safe" into "this note is *perfect* right now."

Your library already has songs in E minor, G minor, and A major. That's three different anchor frets and both flavors of pentatonic — a complete workout. Start with E minor below.`,
            },
            {
              kind: 'quiz',
              questions: [
                {
                  prompt: 'A song is in G minor. Where does Box 1 anchor on the low E string?',
                  choices: ['Fret 1', 'Fret 3', 'Fret 5', 'Fret 7'],
                  answer: 1,
                  explanation:
                    'G is fret 3 on the low E string, so Box 1 anchors there — the whole system slides down two frets from A minor.',
                },
                {
                  prompt: 'A song is in B minor. Where does Box 1 anchor?',
                  choices: ['Fret 5', 'Fret 7', 'Fret 8', 'Fret 9'],
                  answer: 1,
                  explanation:
                    'B is fret 7 on the low E string (E–F–F#–G–G#–A–A#–B counts to seven half steps).',
                },
                {
                  prompt: 'For a song in A major, where does the familiar Box 1 shape go?',
                  choices: [
                    'Fret 5 — same as A minor',
                    'Fret 2 — three frets below the A root, giving A major pentatonic',
                    'Fret 8 — three frets above the root',
                    'Major keys cannot use pentatonic boxes',
                  ],
                  answer: 1,
                  explanation:
                    "The minor-box shape three frets below the major root is that key's major pentatonic. A (fret 5) minus three frets = fret 2, the F# minor / A major relative pair.",
                },
                {
                  prompt: 'Why can every box move to any key without changing shape?',
                  choices: [
                    'Because the boxes only use the thickest strings',
                    'The shapes contain no open strings, so sliding them keeps every interval intact',
                    'Because all keys share the same five notes',
                    'They cannot — each key needs new shapes',
                  ],
                  answer: 1,
                  explanation:
                    'Fretted shapes are interval patterns. Move the root, and every other note moves with it — the geometry of the box never changes.',
                },
              ],
            },
            {
              kind: 'jam',
              md: `Load a song in E minor from your library. Box 1 sits in open position (or fret 12), and everything you drilled in A minor works exactly the same, five frets lower. Loop a section, start slow, and force at least one box change per phrase. When E minor feels easy, rerun the workflow on a G minor song, then an A major one.`,
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
