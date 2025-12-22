// Levenshtein Distance 算法
export function levenshtein(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

export function findClosestWord(typo, inventory) {
  let closest = null;
  let minDist = 999;
  const threshold = typo.length < 4 ? 1 : (typo.length < 7 ? 2 : 3);

  for (let word in inventory) {
    const dist = levenshtein(typo, word);
    if (dist < minDist && dist <= threshold) {
      minDist = dist;
      closest = word;
    }
  }
  return closest;
}

export function getRandomCardData(gameDB) {
  const totalWords = Object.values(gameDB).reduce((sum, arr) => sum + arr.length, 0);
  const weights = {
    legendary: gameDB.legendary.length / totalWords,
    epic: gameDB.epic.length / totalWords,
    rare: gameDB.rare.length / totalWords,
    common: gameDB.common.length / totalWords
  };

  const r = Math.random();
  let rarity = 'common';

  if (r < weights.legendary) rarity = 'legendary';
  else if (r < weights.legendary + weights.epic) rarity = 'epic';
  else if (r < weights.legendary + weights.epic + weights.rare) rarity = 'rare';

  const list = gameDB[rarity];
  if (!list || list.length === 0) return null;

  const item = list[Math.floor(Math.random() * list.length)];
  return { w: item.w, t: item.t, r: rarity };
}
