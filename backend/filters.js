// ─── Content Filter Rules ─────────────────────────────────────────────────────
// Each category has a label (shown in the error) and a list of patterns.
// Patterns can be plain strings (substring match) or RegExp objects.

const FILTER_CATEGORIES = [
  // ── 18+ / Adult Content ──────────────────────────────────────────────────
  {
    label: 'Adult / NSFW content is not allowed.',
    patterns: [
      'porn', 'pornhub', 'xvideos', 'xnxx', 'onlyfans', 'brazzers',
      'xxx', 'hentai', 'nsfw', 'nude', 'nudity', 'naked',
      'erotic', 'explicit', 'adult content', 'sex tape',
      'camgirl', 'stripper', 'escort service', 'prostitut',
    ],
  },

  // ── Dark Web / Tor ────────────────────────────────────────────────────────
  {
    label: 'Dark web / Tor links are not allowed.',
    patterns: [
      /\.onion/i,
      'darkweb', 'dark web', 'deepweb', 'deep web',
      'tor browser', 'tor network', 'tor2web',
      'silkroad', 'silk road', 'alphabay', 'dream market',
      'darknet market', 'hidden wiki',
    ],
  },

  // ── Drugs & Illegal Substances ────────────────────────────────────────────
  {
    label: 'Drug-related content is not allowed.',
    patterns: [
      'buy drugs', 'buy cocaine', 'buy heroin', 'buy meth',
      'buy weed online', 'buy cannabis online',
      'drug dealer', 'drug market', 'narcotics for sale',
      'methamphetamine', 'fentanyl for sale', 'ketamine for sale',
      'mdma for sale', 'lsd for sale', 'shrooms for sale',
    ],
  },

  // ── Weapons & Violence ────────────────────────────────────────────────────
  {
    label: 'Weapons or violent content is not allowed.',
    patterns: [
      'buy guns online', 'illegal weapons', 'buy explosives',
      'bomb making', 'how to make a bomb', 'pipe bomb',
      'buy ammo online illegally', 'ghost gun', 'untraceable gun',
      'kill yourself', 'kill people', 'mass shooting',
    ],
  },

  // ── Scam / Phishing / Fraud ───────────────────────────────────────────────
  {
    label: 'Scam, phishing, or fraud content is not allowed.',
    patterns: [
      'phishing', 'credential harvest', 'steal password',
      'free money hack', 'bank account hack', 'credit card dump',
      'carding forum', 'cvv dump', 'fullz for sale',
      'fake id', 'fake passport', 'counterfeit money',
      'money laundering', 'wire fraud',
    ],
  },

  // ── Hate Speech & Terrorism ───────────────────────────────────────────────
  {
    label: 'Hate speech or extremist content is not allowed.',
    patterns: [
      'isis', 'al-qaeda', 'al qaeda', 'jihad recruitment',
      'white supremac', 'neo nazi', 'neo-nazi',
      'ethnic cleansing', 'terrorist attack',
      'join isis', 'join al-qaeda',
    ],
  },

  // ── Malware / Hacking ─────────────────────────────────────────────────────
  {
    label: 'Malware or hacking content is not allowed.',
    patterns: [
      'download malware', 'ransomware download', 'keylogger download',
      'rat download', 'trojan download', 'virus download',
      'free hacking tools', 'hack facebook', 'hack instagram',
      'hack wifi password', 'ddos attack', 'ddos tool',
    ],
  },

  // ── Child Safety (CSAM) ───────────────────────────────────────────────────
  {
    label: 'Content that endangers minors is strictly prohibited.',
    patterns: [
      'csam', 'child porn', 'cp site', 'minor explicit',
      'underage', 'preteen explicit', 'lolita site',
    ],
  },

  // ── Spam / Gambling ───────────────────────────────────────────────────────
  {
    label: 'Spam or illegal gambling content is not allowed.',
    patterns: [
      'click here to win', 'you have been selected', 'claim your prize',
      'nigerian prince', 'wire transfer scam',
      'illegal casino', 'underground gambling',
    ],
  },
];

// ─── URL Allowlist (trusted domains always pass) ──────────────────────────────
const TRUSTED_DOMAINS = [
  'google.com', 'youtube.com', 'facebook.com', 'github.com',
  'wikipedia.org', 'microsoft.com', 'apple.com', 'linkedin.com',
  'hsb.edu.vn', 'edu.vn', 'gov.vn',
];

function isTrustedDomain(url) {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return TRUSTED_DOMAINS.some((d) => hostname === d || hostname.endsWith('.' + d));
  } catch {
    return false;
  }
}

// ─── Main Filter Function ─────────────────────────────────────────────────────

/**
 * Returns null if content is clean, or an error message string if blocked.
 */
function runContentFilter(text, url) {
  // Trusted domain shortcut for URL type
  if (url && isTrustedDomain(url)) return null;

  const lower = text.toLowerCase();

  for (const category of FILTER_CATEGORIES) {
    for (const pattern of category.patterns) {
      const matched =
        pattern instanceof RegExp
          ? pattern.test(lower)
          : lower.includes(pattern.toLowerCase());

      if (matched) return category.label;
    }
  }

  return null;
}

module.exports = { runContentFilter };
