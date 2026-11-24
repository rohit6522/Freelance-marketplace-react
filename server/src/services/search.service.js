/**
 * Search Service: Levenshtein distance, typo tolerance, and suggestion helpers.
 * Works seamlessly across free MongoDB Atlas (M0) and local MongoDB instances.
 */

export const COMMON_KEYWORDS = [
  "design", "logo", "website", "react", "nextjs", "node", "nodejs",
  "frontend", "backend", "fullstack", "ui", "ux", "figma", "tailwind",
  "wordpress", "python", "mobile", "flutter", "seo", "branding",
  "api", "developer", "freelance", "database", "mongodb", "docker",
  "devops", "cloud", "aws", "ecommerce", "shopify", "copywriting",
  "translation", "marketing", "animation", "video", "content",
  "graphics", "illustration", "mobile app", "web development"
];

/**
 * Compute the Levenshtein distance between two strings.
 */
export function levenshtein(a = "", b = "") {
  const s1 = String(a).toLowerCase();
  const s2 = String(b).toLowerCase();
  if (s1 === s2) return 0;
  if (!s1.length) return s2.length;
  if (!s2.length) return s1.length;

  const matrix = Array.from({ length: s2.length + 1 }, (_, i) => [i]);
  for (let j = 0; j <= s1.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= s2.length; i++) {
    for (let j = 1; j <= s1.length; j++) {
      if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[s2.length][s1.length];
}

/**
 * Escapes special regex characters for safe use in RegExp.
 */
export function escapeRegex(text = "") {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Finds the closest matching word in a dictionary of candidate words.
 */
export function findFuzzyMatch(word, candidates = [], maxDistance = 2) {
  if (!word || typeof word !== "string") return null;
  const lower = word.toLowerCase().trim();
  if (lower.length < 3) return null;

  // Direct exact match check
  for (const cand of candidates) {
    if (cand.toLowerCase().trim() === lower) return null;
  }

  let bestMatch = null;
  let minDistance = Infinity;

  for (const cand of candidates) {
    const cLower = cand.toLowerCase().trim();
    if (!cLower) continue;

    // Direct prefix match (e.g., "figm" -> "figma", "wordpres" -> "wordpress")
    if (cLower.startsWith(lower) && cLower.length - lower.length <= 2) {
      return cand;
    }

    const dist = levenshtein(lower, cLower);
    const threshold = lower.length <= 4 ? 1 : maxDistance;

    if (dist <= threshold && dist < minDistance) {
      minDistance = dist;
      bestMatch = cand;
    }
  }

  return bestMatch;
}

/**
 * Tokenize input query and correct any misspelled words against the dictionary.
 * Returns { corrected: string, hasCorrection: boolean }
 */
export function correctQuery(queryText = "", dictionary = []) {
  if (!queryText || typeof queryText !== "string") {
    return { corrected: "", hasCorrection: false };
  }

  const tokens = queryText.trim().split(/\s+/);
  let hasCorrection = false;
  const pool = Array.from(new Set([...dictionary, ...COMMON_KEYWORDS]));

  const correctedTokens = tokens.map((token) => {
    // strip non-alphanumeric punctuation from borders
    const cleaned = token.replace(/^[^\w]+|[^\w]+$/g, "");
    if (cleaned.length < 3) return token;

    const fuzzy = findFuzzyMatch(cleaned, pool);
    if (fuzzy) {
      hasCorrection = true;
      return fuzzy;
    }
    return token;
  });

  return {
    corrected: correctedTokens.join(" "),
    hasCorrection,
  };
}
