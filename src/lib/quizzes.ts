// Client-safe self-assessment quizzes + scoring (no server imports). Each quiz
// scores answers into weighted "types"; the highest total is the result.
export type Option = { label: string; weights: Record<string, number> }
export type Question = { q: string; options: Option[] }
export type Result = { label: string; emoji: string; blurb: string }
export type Quiz = {
  key: string
  title: string
  emoji: string
  intro: string
  questions: Question[]
  results: Record<string, Result>
}

export const QUIZZES: Quiz[] = [
  {
    key: 'communication',
    title: 'Communication Style',
    emoji: '🗣️',
    intro: 'How you naturally connect and get your point across.',
    questions: [
      { q: 'In a tough conversation, you…', options: [
        { label: 'Get straight to the point', weights: { DIRECT: 2 } },
        { label: 'Lay out the facts and logic', weights: { ANALYTICAL: 2 } },
        { label: 'Keep the peace and listen', weights: { AMIABLE: 2 } },
        { label: 'Talk it out with energy', weights: { EXPRESSIVE: 2 } },
      ] },
      { q: 'People say you are…', options: [
        { label: 'Decisive', weights: { DIRECT: 2 } },
        { label: 'Thorough', weights: { ANALYTICAL: 2 } },
        { label: 'Warm', weights: { AMIABLE: 2 } },
        { label: 'Inspiring', weights: { EXPRESSIVE: 2 } },
      ] },
      { q: 'You lose patience when…', options: [
        { label: 'Things move too slowly', weights: { DIRECT: 2 } },
        { label: 'Details are sloppy', weights: { ANALYTICAL: 2 } },
        { label: 'People are unkind', weights: { AMIABLE: 2 } },
        { label: 'It gets boring', weights: { EXPRESSIVE: 2 } },
      ] },
      { q: 'Your ideal meeting is…', options: [
        { label: 'Short and outcome-driven', weights: { DIRECT: 2 } },
        { label: 'Data-backed and clear', weights: { ANALYTICAL: 2 } },
        { label: 'Collaborative and safe', weights: { AMIABLE: 2 } },
        { label: 'High-energy and creative', weights: { EXPRESSIVE: 2 } },
      ] },
    ],
    results: {
      DIRECT: { label: 'Direct', emoji: '🎯', blurb: 'You drive to the outcome. Bring people the “why” and they’ll follow your pace.' },
      ANALYTICAL: { label: 'Analytical', emoji: '🧠', blurb: 'You trust the evidence. Lead with the data, then invite the heart in.' },
      AMIABLE: { label: 'Amiable', emoji: '🤝', blurb: 'You build trust and belonging. Your steadiness is a superpower — voice your needs too.' },
      EXPRESSIVE: { label: 'Expressive', emoji: '✨', blurb: 'You energize the room. Anchor your fire with a clear next step.' },
    },
  },
  {
    key: 'love-language',
    title: 'Love Language',
    emoji: '❤️‍🩹',
    intro: 'How you most feel seen and cared for.',
    questions: [
      { q: 'You feel most loved when someone…', options: [
        { label: 'Tells you how much you mean', weights: { WORDS: 2 } },
        { label: 'Helps without being asked', weights: { ACTS: 2 } },
        { label: 'Gives you their full attention', weights: { TIME: 2 } },
        { label: 'Surprises you with a gift', weights: { GIFTS: 2 } },
        { label: 'Holds your hand', weights: { TOUCH: 2 } },
      ] },
      { q: 'You show love by…', options: [
        { label: 'Encouraging words', weights: { WORDS: 2 } },
        { label: 'Doing things for them', weights: { ACTS: 2 } },
        { label: 'Planning time together', weights: { TIME: 2 } },
        { label: 'Thoughtful presents', weights: { GIFTS: 2 } },
        { label: 'A warm hug', weights: { TOUCH: 2 } },
      ] },
      { q: 'What stings the most?', options: [
        { label: 'Harsh words', weights: { WORDS: 2 } },
        { label: 'Broken promises to help', weights: { ACTS: 2 } },
        { label: 'Being ignored', weights: { TIME: 2 } },
        { label: 'A forgotten occasion', weights: { GIFTS: 2 } },
        { label: 'Coldness', weights: { TOUCH: 2 } },
      ] },
    ],
    results: {
      WORDS: { label: 'Words of Affirmation', emoji: '💬', blurb: 'Words land deep for you. Say what you need to hear — and ask for it out loud.' },
      ACTS: { label: 'Acts of Service', emoji: '🛠️', blurb: 'Actions speak loudest. Let people help you; receiving is love too.' },
      TIME: { label: 'Quality Time', emoji: '⏳', blurb: 'Presence is everything. Protect undistracted time with the people who matter.' },
      GIFTS: { label: 'Gifts', emoji: '🎁', blurb: 'Thoughtful tokens say “I thought of you.” Celebrate the meaning, not the price.' },
      TOUCH: { label: 'Physical Touch', emoji: '🤗', blurb: 'Connection through touch grounds you. Seek the hugs — they refill your tank.' },
    },
  },
  {
    key: 'leadership',
    title: 'Leadership Style',
    emoji: '🚀',
    intro: 'How you naturally lead and lift others.',
    questions: [
      { q: 'Your team needs direction. You…', options: [
        { label: 'Paint the big vision', weights: { VISIONARY: 2 } },
        { label: 'Develop each person', weights: { COACH: 2 } },
        { label: 'Ask for everyone’s input', weights: { DEMOCRATIC: 2 } },
        { label: 'Set the standard and go', weights: { COMMANDING: 2 } },
      ] },
      { q: 'You measure success by…', options: [
        { label: 'Progress toward the mission', weights: { VISIONARY: 2 } },
        { label: 'People growing', weights: { COACH: 2 } },
        { label: 'Buy-in and unity', weights: { DEMOCRATIC: 2 } },
        { label: 'Results, on time', weights: { COMMANDING: 2 } },
      ] },
      { q: 'Under pressure you…', options: [
        { label: 'Re-anchor to the why', weights: { VISIONARY: 2 } },
        { label: 'Check in on people', weights: { COACH: 2 } },
        { label: 'Rally the group', weights: { DEMOCRATIC: 2 } },
        { label: 'Take charge fast', weights: { COMMANDING: 2 } },
      ] },
    ],
    results: {
      VISIONARY: { label: 'Visionary', emoji: '🔭', blurb: 'You move people with the mission. Keep translating vision into the next small step.' },
      COACH: { label: 'Coach', emoji: '🌱', blurb: 'You grow people. Your patience compounds — guard time for the mission too.' },
      DEMOCRATIC: { label: 'Democratic', emoji: '🤝', blurb: 'You build unity and buy-in. When speed matters, be willing to make the call.' },
      COMMANDING: { label: 'Commanding', emoji: '🥊', blurb: 'You get results under pressure. Pair the drive with the why and people go further.' },
    },
  },
]

export const QUIZ_BY_KEY: Record<string, Quiz> = Object.fromEntries(QUIZZES.map((q) => [q.key, q]))

// Returns the winning result key for a set of answers (indices into options).
export function scoreQuiz(quiz: Quiz, answers: number[]): string {
  const totals: Record<string, number> = {}
  quiz.questions.forEach((question, i) => {
    const opt = question.options[answers[i]]
    if (!opt) return
    for (const [k, v] of Object.entries(opt.weights)) totals[k] = (totals[k] ?? 0) + v
  })
  let best = Object.keys(quiz.results)[0]
  let bestV = -1
  for (const k of Object.keys(quiz.results)) {
    if ((totals[k] ?? 0) > bestV) { best = k; bestV = totals[k] ?? 0 }
  }
  return best
}
