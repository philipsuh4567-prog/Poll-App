let nextId = 1

function poll(question, optionTexts, votesArr, upvotes, downvotes, minutesAgo) {
  const options = optionTexts.map((text, i) => ({
    id: i,
    text,
    votes: votesArr[i],
  }))
  return {
    id: nextId++,
    question,
    options,
    upvotes,
    downvotes,
    createdAt: Date.now() - minutesAgo * 60 * 1000,
  }
}

export const mockPolls = [
  poll(
    'Best way to eat pizza?',
    ['Fold it', 'Knife & fork', 'Straight up flat', 'Roll it burrito-style'],
    [142, 21, 98, 15],
    71,
    7,
    12
  ),
  poll(
    'Should pineapple go on pizza?',
    ['Yes, it’s great', 'No, never'],
    [58, 133],
    52,
    19,
    47
  ),
  poll(
    'Favorite season?',
    ['Spring', 'Summer', 'Fall', 'Winter'],
    [30, 52, 88, 19],
    26,
    3,
    95
  ),
  poll(
    'Best morning drink?',
    ['Coffee', 'Tea', 'Just water'],
    [201, 76, 34],
    118,
    9,
    150
  ),
  poll(
    'iOS or Android?',
    ['iOS', 'Android'],
    [163, 158],
    90,
    24,
    260
  ),
  poll(
    'Ideal work setup?',
    ['Fully remote', 'Hybrid', 'Fully in-office'],
    [190, 121, 22],
    58,
    5,
    400
  ),
]
