export const QUESTIONS = [
  // Food and drink
  "What's the best pizza topping?",
  'Which breakfast food is the best?',
  "What's the ultimate comfort food?",
  'Which fast food chain is the best?',
  "What's the best way to eat potatoes?",
  'Which ice cream flavor is unbeatable?',
  "What's the best movie night snack?",
  'Which drink do you reach for first?',
  "What's the best kind of sandwich?",
  'Which cuisine could you eat forever?',
  "What's the best candy?",
  'Which fruit is the most underrated?',
  "What's the best thing to dip fries in?",
  "What's the best dessert?",
  "What's the perfect midnight snack?",

  // Travel and places
  'Where would you go on your dream vacation?',
  "What's the best kind of trip?",
  'Which city would you most like to live in?',
  "What's the best way to travel?",
  'Which season is best for a vacation?',
  "What's the best thing to pack for a trip?",
  'Which country is at the top of your bucket list?',
  "What's the best way to spend a long weekend?",
  'Which landmark would you most like to visit?',
  "What's the best road trip activity?",

  // Entertainment
  "What's the best movie genre?",
  'Which streaming service is worth it?',
  "What's the best video game of all time?",
  'Which music genre do you play the most?',
  "What's the best superhero?",
  'Which TV show deserves a comeback?',
  "What's the best way to spend a rainy day?",
  'Which board game is the most fun?',
  "What's the best decade for music?",
  'Which fictional world would you want to live in?',
  "What's the best animated movie?",
  'Which sport is the most fun to watch?',
  'Which artist would you most want to see live?',
  "What's the best book genre?",
  'Which holiday movie do you watch every year?',

  // Tech and gadgets
  'Which phone brand is the best?',
  "What's the most useful app on your phone?",
  'Which social media app do you open first?',
  "What's the best gaming console?",
  'Which gadget could you not live without?',
  "What's the best way to listen to music?",
  'Which tech company has the best products?',
  "What's the most annoying thing about technology?",
  'Which smart device is actually worth buying?',
  'Which programming language should everyone learn?',

  // Lifestyle and habits
  "What's the best time to wake up?",
  'Which day of the week is the best?',
  "What's the best way to relax after a long day?",
  'Which hobby would you pick up next?',
  "What's the best way to stay active?",
  'Which season is your favorite?',
  "What's the best weather?",
  'When are you most productive?',
  "What's the best way to spend a Sunday?",
  'Which chore do you dislike the most?',
  "What's the best way to start the day?",
  'Which holiday is the best?',
  "What's the best way to celebrate a birthday?",
  'Which room in the house is your favorite?',
  "What's the best way to meet new people?",

  // Hypotheticals
  'Which superpower would you choose?',
  'What would you do with a million dollars?',
  'Which time period would you visit?',
  "What's the first thing you'd do if you won the lottery?",
  'Which fictional character would you want as a best friend?',
  'What would you bring to a deserted island?',
  "Which job would you pick if money didn't matter?",
  'What would you do with an extra hour every day?',
  'Which talent would you love to have?',
  'What would you name a pet dragon?',
  'If you could have dinner with anyone, who would it be?',
  'Which language would you master instantly?',
  'What would you do on a free day with no plans?',
  'Which place would you teleport to right now?',
  'What would you change about your daily routine?',

  // School and work
  "What's the best school subject?",
  'Which study snack works best?',
  "What's the best way to focus?",
  'Which part of the workday is the best?',
  "What's the best type of workspace?",
  'Which skill is most valuable to learn?',
  "What's the best way to take notes?",
  "What's the best lunch break activity?",
  'Which class would you take again?',
  "What's the best thing about working from home?",

  // Animals and nature
  "What's the best pet?",
  'Which animal is the coolest?',
  "What's the best thing to do outdoors?",
  'Which national park would you visit first?',
  "What's the best kind of weather for a walk?",
  'Which wild animal would you most like to see?',
  "What's the best camping meal?",
  'Which flower is the prettiest?',
  "What's the best view in nature?",
  'Which ocean creature is the most fascinating?',
]

// A shuffled copy, so every question is used once before any repeats.
// The first question drawn (popped from the end) never equals `avoid`.
export function createDeck(avoid) {
  const deck = [...QUESTIONS]
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  const last = deck.length - 1
  if (deck[last] === avoid) {
    ;[deck[last], deck[0]] = [deck[0], deck[last]]
  }
  return deck
}
