// ─── Multilingual Content Filter ─────────────────────────────────────────────
//
// Matching strategy:
//  - Vietnamese bad words: matched WITH diacritics (exact Unicode), word-boundary aware
//  - English/other words: substring match only for phrases 5+ chars; short words use \b
//  - Regex patterns: used directly
//  - normalize() is NOT used for matching — it caused false positives on normal text

// Helper: build a word-boundary regex for a plain string
function wordBoundary(str) {
  const escaped = str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?<![\\w\\u00C0-\\u024F])${escaped}(?![\\w\\u00C0-\\u024F])`, 'iu');
}

// Words 4 chars or shorter always use word boundary; longer ones use substring match
function buildMatcher(pattern) {
  if (pattern instanceof RegExp) return pattern;
  if (pattern.trim().length <= 4) return wordBoundary(pattern.trim());
  return null; // signals: use plain includes()
}

const FILTER_CATEGORIES = [

  // ── 🇻🇳 Vietnamese Profanity ─────────────────────────────────────────────
  // Matched WITH diacritics to avoid false-positives on English text
  {
    label: 'Nội dung chứa từ ngữ thô tục không được phép.',
    patterns: [
      // Must match with Unicode diacritics — do NOT add plain ASCII versions here
      /\bđ[iíìỉĩị]t\b/iu,
      /\bcặc\b/iu,
      /\blồn\b/iu,
      /\bbuồi\b/iu,
      /(?<!\w)đụ(?!\w)/iu,
      /\bđéo\b/iu,
      /\bđ[ií]a\b/iu,
      /\bđ[ií]t\s*m[eẹ]\b/iu,
      /du\s*m[áà]\b/iu,
      /\bcứt\b/iu,
      /\bdái\b/iu,
      /\bc[aà]v[e]\b/iu,               // cave / cavê (sex work slang)
      /gái\s*đi[eê]m/iu,
      /\bđi[eê]m\b/iu,
      /phim\s*sex/iu,
      /ph[iì]m\s*khi[eê]u\s*dâm/iu,
      /ảnh\s*kh[oỏ]a\s*thân/iu,
      /mua\s*ma\s*t[uú]y/iu,
      /bán\s*ma\s*t[uú]y/iu,
      /mua\s*heroin/iu,
      /mua\s*cần\s*sa/iu,
      /\bthu[oố]c\s*l[aắ]c\b/iu,
      /hack\s*(zalo|facebook|tài\s*khoản)/iu,
      /đánh\s*cắp\s*(mật\s*khẩu|dữ\s*liệu)/iu,
      /\blừa\s*đảo\b/iu,
      /\bgiả\s*mạo\b/iu,
      /mua\s*vũ\s*khí/iu,
      /chế\s*tạo\s*bom/iu,
      /giết\s*người/iu,
      /\bkhủng\s*bố\b/iu,
      /xâm\s*hại\s*trẻ\s*em/iu,
    ],
  },

  // ── 🇺🇸 English Profanity ────────────────────────────────────────────────
  {
    label: 'Content contains profanity or offensive language.',
    patterns: [
      // Use regex with word boundaries for short/ambiguous words
      /\bf+u+c+k+\b/i,
      /\bsh[i1!]+t\b/i,
      /\bb[i1]+tch\b/i,
      /\basshole\b/i,
      /\bbastard\b/i,
      /\bc+u+n+t\b/i,
      /\bd[i!1]+ck\b/i,
      /\bc[o0]+ck\b/i,
      /\bp+u+s+y\b/i,
      /\bn[i1!]+gg[ae]+r\b/i,
      /\bn-word\b/i,
      /\bfaggot\b/i,
      /\bretard(ed)?\b/i,
      /\bwh[o0]+re\b/i,
      /\bslut\b/i,
      /\bskank\b/i,
      /\bprick\b/i,
      /\bwanker\b/i,
      /\btwat\b/i,
      /\bdipshit\b/i,
      /\bdumbass\b/i,
      /\bjackass\b/i,
      /\bmotherfuck/i,
      // Longer phrases — substring is fine
      'onlyfans', 'pornhub', 'xvideos', 'xnxx', 'xhamster',
      'brazzers', 'bangbros',
    ],
  },

  // ── 18+ / Adult Content ───────────────────────────────────────────────────
  {
    label: 'Adult / NSFW content is not allowed.',
    patterns: [
      /\bporn(star|ography)?\b/i,
      /\bxxx\b/i,
      /\bnsfw\b/i,
      /\bnud(e|ity)\b/i,
      /\bnaked\b/i,
      /\berotic\b/i,
      'explicit content', 'adult content', 'sex tape',
      'camgirl', 'escort service', 'prostitut',
      // Japanese/Chinese adult slang
      /\bjav\b/i,
      /\bav (video|film|actress)/i,
      'seqing', 'se qing', 'huang se',
    ],
  },

  // ── Dark Web / Tor ────────────────────────────────────────────────────────
  {
    label: 'Dark web / Tor links are not allowed.',
    patterns: [
      /\.onion\b/i,
      'darkweb', 'dark web', 'deepweb', 'deep web',
      'tor browser', 'tor network', 'tor2web',
      'silkroad', 'silk road', 'alphabay', 'dream market',
      'darknet market', 'hidden wiki', 'empire market',
    ],
  },

  // ── Drugs ─────────────────────────────────────────────────────────────────
  {
    label: 'Drug-related content is not allowed.',
    patterns: [
      'buy cocaine', 'buy heroin', 'buy meth', 'buy drugs',
      'buy weed online', 'buy cannabis online',
      'drug dealer', 'drug market', 'narcotics for sale',
      'fentanyl for sale', 'ketamine for sale',
      'mdma for sale', 'lsd for sale', 'shrooms for sale',
      'comprar drogas', 'vender cocaína',
      'mai du pin', 'du pin jiao yi',
    ],
  },

  // ── Weapons & Violence ────────────────────────────────────────────────────
  {
    label: 'Weapons or violent content is not allowed.',
    patterns: [
      'buy guns online', 'illegal weapons', 'buy explosives',
      'bomb making', 'how to make a bomb', 'pipe bomb',
      'ghost gun', 'untraceable gun',
      'mass shooting',
      'comprar armas', 'fabricar bomba',
    ],
  },

  // ── Scam / Phishing ───────────────────────────────────────────────────────
  {
    label: 'Scam, phishing, or fraud content is not allowed.',
    patterns: [
      'phishing', 'credential harvest', 'steal password',
      'bank account hack', 'credit card dump',
      'carding forum', 'cvv dump', 'fullz for sale',
      'fake passport', 'counterfeit money', 'money laundering',
    ],
  },

  // ── Hate Speech & Terrorism ───────────────────────────────────────────────
  {
    label: 'Hate speech or extremist content is not allowed.',
    patterns: [
      /\bisis\b/i,
      'al-qaeda', 'al qaeda', 'jihad recruitment',
      'white supremac', 'neo-nazi', 'neo nazi',
      'ethnic cleansing', 'terrorist attack',
      'join isis', 'join al-qaeda',
    ],
  },

  // ── Malware / Hacking ─────────────────────────────────────────────────────
  {
    label: 'Malware or hacking content is not allowed.',
    patterns: [
      'download malware', 'ransomware download', 'keylogger download',
      'trojan download', 'virus download',
      'hack facebook', 'hack instagram', 'hack wifi password',
      'ddos attack', 'ddos tool', 'free hacking tools',
    ],
  },

  // ── Child Safety ──────────────────────────────────────────────────────────
  {
    label: 'Content that endangers minors is strictly prohibited.',
    patterns: [
      'csam', 'child porn', 'minor explicit',
      'preteen explicit', 'lolita site',
    ],
  },

  // ── French ────────────────────────────────────────────────────────────────
  {
    label: 'Le contenu contient des grossièretés.',
    patterns: [
      /\bmerde\b/i,
      /\bputain\b/i,
      /\bconnard\b/i,
      /\bconnasse\b/i,
      /\bsalope\b/i,
      /\benculé\b/i,
      'fils de pute', 'va te faire foutre',
      /\bbordel\b/i,
      /\bpédé\b/i,
    ],
  },

  // ── Spanish ───────────────────────────────────────────────────────────────
  {
    label: 'El contenido contiene lenguaje ofensivo.',
    patterns: [
      /\bputa\b/i,
      /\bcoño\b/i,
      /\bjoder\b/i,
      /\bcabrón\b/i,
      'hijo de puta', 'hdp',
      /\bmaricón\b/i,
      /\bgilipollas\b/i,
      /\bmierda\b/i,
      /\bchingada\b/i,
      /\bpendejo\b/i,
      /\bverga\b/i,
      /\bpinche\b/i,
      /\bcarajo\b/i,
    ],
  },

  // ── Portuguese ────────────────────────────────────────────────────────────
  {
    label: 'O conteúdo contém linguagem ofensiva.',
    patterns: [
      /\bporra\b/i,
      /\bcaralho\b/i,
      /\bfoda\b/i, 'foda-se',
      /\bmerda\b/i,
      /\bviado\b/i,
      /\bbuceta\b/i,
      /\barrombado\b/i,
      /\bvadia\b/i,
      'filho da puta', 'fdp',
    ],
  },

  // ── German ────────────────────────────────────────────────────────────────
  {
    label: 'Der Inhalt enthält anstößige Sprache.',
    patterns: [
      /\bschei[ßs]e\b/i,
      /\bfick(en)?\b/i,
      /\barschloch\b/i,
      /\bwichser\b/i,
      /\bhurensohn\b/i,
      /\bschlampe\b/i,
      /\bfotze\b/i,
    ],
  },

  // ── Japanese (Romaji) ─────────────────────────────────────────────────────
  {
    label: '不適切なコンテンツが検出されました。',
    patterns: [
      /\bkuso\b/i,
      /\bchikusho\b/i,
      /\bmanko\b/i,
      /\bchinpo\b/i,
      /\byariman\b/i,
      /\bsukebe\b/i,
      /\bhentai\b/i,
    ],
  },

  // ── Korean (Romaji) ──────────────────────────────────────────────────────
  {
    label: '부적절한 내용이 감지되었습니다。',
    patterns: [
      /\bs+[i1]b[a@]l\b/i,
      /\bgaesaekki\b/i,
      /\bjiral\b/i,
      /\bmichin\b/i,
    ],
  },

  // ── Chinese (Pinyin) ─────────────────────────────────────────────────────
  {
    label: '检测到不当内容。',
    patterns: [
      /\btmd\b/i,
      'cao ni', 'caoni', 'cao nima',
      /\bshabi\b/i, 'sha bi',
      /\bhundan\b/i, 'hun dan',
      /\bnmsl\b/i,
      /\bcnm\b/i,
    ],
  },

  // ── Arabic (Romaji) ──────────────────────────────────────────────────────
  {
    label: 'تم اكتشاف محتوى غير لائق.',
    patterns: [
      /\bsharmouta\b/i,
      /\bkhara\b/i,
      /\bayri\b/i,
      "yil'an",
      /\bib[mn]\s*el\b/i,
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
    return TRUSTED_DOMAINS.some((d) => hostname === d || hostname.endsWith('.' + d));
  } catch {
    return false;
  }
}

// ─── Main Filter ──────────────────────────────────────────────────────────────

function runContentFilter(text, url) {
  if (url && isTrustedDomain(url)) return null;

  for (const category of FILTER_CATEGORIES) {
    for (const pattern of category.patterns) {
      let matched = false;

      if (pattern instanceof RegExp) {
        matched = pattern.test(text);
      } else {
        // Plain string: use word-boundary regex for short terms, includes() for long ones
        const trimmed = pattern.trim();
        if (trimmed.length <= 4) {
          matched = wordBoundary(trimmed).test(text);
        } else {
          matched = text.toLowerCase().includes(trimmed.toLowerCase());
        }
      }

      if (matched) return category.label;
    }
  }

  return null;
}

module.exports = { runContentFilter };
