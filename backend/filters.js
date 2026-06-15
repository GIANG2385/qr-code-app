// ─── Vietnamese + English Content Filter ─────────────────────────────────────
//
// Each bad word is matched in THREE forms:
//   1. WITH diacritics  → "lồn"
//   2. WITHOUT diacritics (ASCII) → "lon"  (word boundary prevents matching "London")
//   3. Leet / bypass attempts → "l0n", "l*n", "l.o.n"

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Word-boundary regex for ASCII strings (safe for short words)
function wb(word) {
  const esc = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\b${esc}\\b`, 'i');
}

// Check if text contains a plain string (case-insensitive substring)
function has(text, phrase) {
  return text.toLowerCase().includes(phrase.toLowerCase());
}

// Run one category; return label string if matched, null otherwise
function matchCategory(text, lower, { label, matchers }) {
  for (const m of matchers) {
    if (m instanceof RegExp ? m.test(text) : has(text, m)) return label;
  }
  return null;
}

// ─── Filter Categories ────────────────────────────────────────────────────────

const CATEGORIES = [

  // ════════════════════════════════════════════════════════════
  //  VIETNAMESE TEENCODE / VIẾT TẮT CHỬI THỀ
  //  Must run BEFORE the full-word Vietnamese list
  // ════════════════════════════════════════════════════════════
  {
    label: 'Nội dung chứa từ viết tắt / teencode thô tục không được phép.',
    matchers: [
      // — NOTE: \b does not work with Vietnamese Unicode chars (đ, ồ…)
      // — Use (?<!\w) / (?!\w) as word boundaries for those patterns

      // đm / đmm / đmmm (đụ má) — keep "đ" to avoid "Dm (decimeter)" false positive
      /(?<!\w)đm+(?!\w)/iu,
      /(?<!\w)đmmd(?!\w)/iu,
      // dm + Vietnamese word after it (mày, má, mẹ, mấy)
      /(?<!\w)dm\s*(m[àáaẹ]y?|m[aàáâ]y)\b/iu,

      // vl / vcl / vkl (vãi lồn) — case-sensitive lowercase to avoid "VL (Vĩnh Long)"
      /(?<!\w)v[ck]?l(?!\w)/,        // lowercase only — intentional, no /i flag
      /(?<!\w)vkl(?!\w)/,

      // cl / cul (cặc lồn)
      /(?<!\w)cu?l(?!\w)/i,

      // loz / lồz / l0z (lồn)
      /(?<!\w)l[oô0ồ]z(?!\w)/iu,

      // duma / đuma / du ma (đụ má)
      /(?<!\w)(duma|đuma)(?!\w)/iu,
      /(?<!\w)(du|đu)\s*ma(?!\w)/iu,

      // đcm / dcm / dkm / đkm — each listed explicitly to avoid regex mistake
      /(?<!\w)(đcm|dcm|dkm|đkm|đkcm|dkcm)(?!\w)/iu,

      // tml / đtml / ktml (tiên mẹ lồn)
      /(?<!\w)[kđd]?tml(?!\w)/iu,

      // clgt (con lồn gì thế)
      /(?<!\w)clgt(?!\w)/i,

      // dmml / đmml
      /(?<!\w)[đd]mml(?!\w)/iu,

      // cờ lờ (ám chỉ cặc lồn)
      /cờ\s*lờ/iu,

      // clmm
      /(?<!\w)clmm(?!\w)/i,

      // wtf / stfu / kys (English aggressive slang)
      /(?<!\w)wtf(?!\w)/i,
      /(?<!\w)stfu(?!\w)/i,
      /(?<!\w)kys(?!\w)/i,

      // Insults (English)
      /\bstupid\b/i,
      /\bidiot\b/i,
      /\bmoron\b/i,
      /\bdumbass\b/i,
      /\bloser\b/i,

      // Insults (Vietnamese)
      /(?<!\p{L})ngu(?!\p{L})/iu,   // ngu = stupid
      /(?<!\p{L})khùng(?!\p{L})/iu, // crazy/dumb
      /(?<!\p{L})điên(?!\p{L})/iu,  // crazy
      /(?<!\p{L})óc chó(?!\p{L})/iu, // dog-brained
    ],
  },

  // ════════════════════════════════════════════════════════════
  //  VIETNAMESE PROFANITY
  // ════════════════════════════════════════════════════════════
  {
    label: 'Nội dung chứa từ ngữ thô tục không được phép.',
    matchers: [
      // đ*t / dit / d1t / d!t
      /đ[iíìỉĩị]t/iu,
      /\bd[i!1|][t+]\b/i,
      wb('dit'),

      // cặc / cac / c@c / c4c
      /cặc/iu,
      /\bc[a@4][c]\b/i,
      wb('cac'),

      // lồn / lon / l0n
      /lồn/iu,
      /\bl[o0]n\b/i,

      // buồi / buoi / bu0i
      /buồi/iu,
      /\bbu[o0]i\b/i,

      // đụ / du (only as standalone)
      /đụ/iu,
      /\bdu\s+m[aáà]/i,

      // đéo / deo
      /đéo/iu,
      /\bd[e3]o\b/i,

      // cứt / cut (as Vietnamese word — must be standalone)
      /cứt/iu,
      /\bcứt\b/iu,

      // dái / dai (standalone)
      /\bdái\b/iu,
      /\bd[a@]i\b/i,

      // vãi (standalone)
      /\bvãi\b/iu,
      /\bv[a@]i\b/i,

      // đĩ / di (sex worker — only standalone)
      /\bđĩ\b/iu,

      // thằng ngu / đồ ngu / đồ chó / đồ khốn
      /thằng\s*ngu/iu,
      /đồ\s*(ngu|chó|khốn)/iu,
      /\bkhốn\s*nạn\b/iu,

      // mẹ kiếp / tiên sư / bố láo
      /mẹ\s*kiếp/iu,
      /tiên\s*sư/iu,
      /bố\s*láo/iu,

      // con chó / chó chết / súc vật
      /con\s*chó\s*chết/iu,
      /súc\s*vật/iu,

      // cave / gái điếm / điếm / gái gọi
      /\bcave\b/i,
      /gái\s*(điếm|gọi)/iu,
      /\bđiếm\b/iu,

      // phim sex / phim khiêu dâm / ảnh khỏa thân
      /phim\s*sex/iu,
      /phim\s*khi[eê]u\s*dâm/iu,
      /ảnh\s*kh[oỏ]a\s*thân/iu,

      // ma túy / heroin / cần sa / thuốc lắc
      /ma\s*t[uú]y/iu,
      /\bheroin\b/i,
      /cần\s*sa/iu,
      /thu[oố]c\s*l[aắ]c/iu,

      // lừa đảo / giả mạo
      /lừa\s*đảo/iu,
      /giả\s*mạo/iu,

      // đánh cắp / hack tài khoản
      /đánh\s*cắp/iu,
      /hack\s*tài\s*khoản/iu,

      // mua / bán vũ khí
      /mua\s*vũ\s*khí/iu,
      /bán\s*vũ\s*khí/iu,

      // chế tạo bom / giết người
      /chế\s*tạo\s*bom/iu,
      /giết\s*người/iu,

      // khủng bố / xâm hại trẻ em
      /khủng\s*bố/iu,
      /xâm\s*hại\s*trẻ\s*em/iu,
    ],
  },

  // ════════════════════════════════════════════════════════════
  //  ENGLISH PROFANITY
  // ════════════════════════════════════════════════════════════
  {
    label: 'Content contains profanity or offensive language.',
    matchers: [
      // fuck / f*ck / fck / ph*ck
      /\bf+[u*@][c*]{1,2}k+\b/i,
      /\bf{1,2}[u*@3]c+\b/i,

      // shit / sh!t / sh1t
      /\bsh[i!1]+t\b/i,

      // bitch / b*tch / biatch
      /\bb[i!1*]+tch\b/i,
      /\bbiatch\b/i,

      // ass / asshole / dumbass / jackass
      /\basshole\b/i,
      /\bdumb\s*ass\b/i,
      /\bjack\s*ass\b/i,
      /\bdip\s*shit\b/i,

      // bastard
      wb('bastard'),

      // cunt / c*nt
      /\bc[u*]+n+t\b/i,

      // dick / d*ck
      /\bd[i!1*]+ck\b/i,

      // cock / c*ck
      /\bc[o0*]+ck\b/i,

      // pussy / p*ssy
      /\bp[u*]+ss?y\b/i,

      // nigger / nigga / n-word
      /\bn[i!1*]+gg[ae]+r?\b/i,
      /\bn-word\b/i,

      // faggot / fag
      /\bfagg?[o0]t\b/i,

      // retard
      /\bretard(ed)?\b/i,

      // whore / wh0re
      /\bwh[o0*]+re\b/i,

      // slut / sl*t
      /\bsl[u*]+t\b/i,

      // motherfucker / mf
      /\bm[o0*]+ther\s*f[u*]+ck/i,
      /\bmf+\b/i,

      // prick / wanker / twat / tosser
      wb('prick'),
      wb('wanker'),
      wb('twat'),
      wb('tosser'),
    ],
  },

  // ════════════════════════════════════════════════════════════
  //  ADULT / NSFW (both languages)
  // ════════════════════════════════════════════════════════════
  {
    label: 'Adult / NSFW content is not allowed.',
    matchers: [
      /\bporn(hub|star|ography)?\b/i,
      /\bxxx\b/i,
      /\bnsfw\b/i,
      /\bnud(e|ity|ist)\b/i,
      /\bnaked\b/i,
      /\berotic\b/i,
      'explicit content', 'adult content', 'sex tape',
      'onlyfans', 'xvideos', 'xnxx', 'xhamster', 'brazzers',
      'camgirl', 'escort service', 'prostitut',
    ],
  },

  // ════════════════════════════════════════════════════════════
  //  DARK WEB / TOR
  // ════════════════════════════════════════════════════════════
  {
    label: 'Dark web / Tor links are not allowed.',
    matchers: [
      /\.onion\b/i,
      'darkweb', 'dark web', 'deepweb', 'deep web',
      'tor browser', 'tor network', 'silkroad', 'silk road',
      'darknet market', 'hidden wiki', 'alphabay',
    ],
  },

  // ════════════════════════════════════════════════════════════
  //  DRUGS
  // ════════════════════════════════════════════════════════════
  {
    label: 'Drug-related content is not allowed.',
    matchers: [
      'buy cocaine', 'buy heroin', 'buy meth', 'buy drugs',
      'buy weed online', 'buy cannabis online',
      'drug dealer', 'drug market', 'narcotics for sale',
      'fentanyl for sale', 'mdma for sale', 'lsd for sale',
    ],
  },

  // ════════════════════════════════════════════════════════════
  //  WEAPONS & VIOLENCE
  // ════════════════════════════════════════════════════════════
  {
    label: 'Weapons or violent content is not allowed.',
    matchers: [
      'buy guns online', 'illegal weapons', 'buy explosives',
      'bomb making', 'how to make a bomb', 'ghost gun',
      'mass shooting', 'kill people',
    ],
  },

  // ════════════════════════════════════════════════════════════
  //  SCAM / PHISHING
  // ════════════════════════════════════════════════════════════
  {
    label: 'Scam, phishing, or fraud content is not allowed.',
    matchers: [
      'phishing', 'credential harvest', 'steal password',
      'bank account hack', 'credit card dump',
      'carding forum', 'cvv dump', 'fake passport',
      'counterfeit money', 'money laundering',
    ],
  },

  // ════════════════════════════════════════════════════════════
  //  HATE SPEECH & TERRORISM
  // ════════════════════════════════════════════════════════════
  {
    label: 'Hate speech or extremist content is not allowed.',
    matchers: [
      /\bisis\b/i,
      'al-qaeda', 'al qaeda', 'jihad recruitment',
      'white supremac', 'neo-nazi', 'neo nazi',
      'ethnic cleansing', 'terrorist attack',
    ],
  },

  // ════════════════════════════════════════════════════════════
  //  MALWARE / HACKING
  // ════════════════════════════════════════════════════════════
  {
    label: 'Malware or hacking content is not allowed.',
    matchers: [
      'download malware', 'ransomware download', 'keylogger download',
      'trojan download', 'virus download',
      'hack facebook', 'hack instagram', 'hack wifi password',
      'ddos attack', 'ddos tool',
    ],
  },

  // ════════════════════════════════════════════════════════════
  //  CHILD SAFETY
  // ════════════════════════════════════════════════════════════
  {
    label: 'Content that endangers minors is strictly prohibited.',
    matchers: [
      'csam', 'child porn', 'minor explicit', 'preteen explicit',
    ],
  },

];

// ─── Trusted Domain Allowlist ─────────────────────────────────────────────────
const TRUSTED_DOMAINS = [
  'google.com', 'youtube.com', 'facebook.com', 'github.com',
  'wikipedia.org', 'microsoft.com', 'apple.com', 'linkedin.com',
  'hsb.edu.vn', 'edu.vn', 'gov.vn', 'moet.gov.vn',
];

function isTrustedDomain(url) {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return TRUSTED_DOMAINS.some(
      (d) => hostname === d || hostname.endsWith('.' + d)
    );
  } catch {
    return false;
  }
}

// ─── Consecutive Repeated Word Detection ─────────────────────────────────────
// Catches "hello hello", "ngu ngu ngu", "test test", "lol lol lol", etc.
// A "word" here is any sequence of Unicode letters/digits (covers Vietnamese).

function hasConsecutiveRepeatedWords(text) {
  // (?<!\p{L}) and (?!\p{L}) act as Unicode word boundaries
  // ensuring we match WHOLE words, not suffixes/prefixes

  // Single whole-word repeat: "hello hello", "ngu ngu", "ok ok"
  const singleWord = /(?<!\p{L})(\p{L}[\p{L}\p{N}]*)(?!\p{L})\s+\1(?!\p{L})/giu;
  if (singleWord.test(text)) return true;

  // Two-word phrase repeat: "xin chào xin chào", "hello world hello world"
  const twoWord = /(?<!\p{L})(\p{L}[\p{L}\p{N}]*\s+\p{L}[\p{L}\p{N}]*)(?!\p{L})\s+\1(?!\p{L})/giu;
  if (twoWord.test(text)) return true;

  return false;
}

// ─── Main Filter ──────────────────────────────────────────────────────────────

function runContentFilter(text, url) {
  if (url && isTrustedDomain(url)) return null;

  // Check consecutive repeated words first (spam pattern)
  if (hasConsecutiveRepeatedWords(text)) {
    return 'Consecutive repeated words are not allowed.';
  }

  const lower = text.toLowerCase();
  for (const cat of CATEGORIES) {
    const hit = matchCategory(text, lower, cat);
    if (hit) return hit;
  }
  return null;
}

module.exports = { runContentFilter };
