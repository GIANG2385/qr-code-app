// ─── Multilingual Content Filter ─────────────────────────────────────────────
// Covers: English, Vietnamese, French, Spanish, Portuguese, German,
//         Japanese (romaji), Korean (romaji), Chinese (pinyin), Arabic (romaji)

const FILTER_CATEGORIES = [

  // ── 🇻🇳 Vietnamese Profanity ─────────────────────────────────────────────
  {
    label: 'Nội dung chứa từ ngữ thô tục không được phép. (Vietnamese profanity detected.)',
    patterns: [
      // Common Vietnamese swear words (normalized — no diacritics needed, see normalize() below)
      'dit', 'đit', 'cặc', 'cac', 'lồn', 'lon', 'buồi', 'buoi',
      'đụ', 'du má', 'duma', 'địt mẹ', 'dit me', 'con cho', 'chó chết',
      'đéo', 'deo', 'vãi', 'vai lon', 'cứt', 'cut', 'đồ ngu', 'do ngu',
      'thằng ngu', 'con điếm', 'diem', 'cave', 'gái điếm', 'gai diem',
      'bố láo', 'bo lao', 'mẹ kiếp', 'me kiep', 'tiên sư', 'tien su',
      'đồ chó', 'do cho', 'súc vật', 'suc vat', 'khốn nạn', 'khon nan',
      'đồ khốn', 'vô liêm sỉ', 'đĩ', 'di', 'thổ', 'cu', 'dái', 'dai',
    ],
  },

  // ── 🇺🇸 English Profanity ────────────────────────────────────────────────
  {
    label: 'Content contains profanity or offensive language.',
    patterns: [
      'fuck', 'f*ck', 'f**k', 'fck', 'fucc',
      'shit', 'sh1t', 'sh*t',
      'bitch', 'b*tch', 'biatch',
      'asshole', 'a**hole', 'a-hole',
      'bastard', 'cunt', 'c*nt',
      'dick', 'd*ck', 'cock', 'c*ck',
      'pussy', 'p*ssy',
      'nigger', 'nigga', 'n*gger', 'n-word',
      'faggot', 'fag', 'dyke',
      'retard', 'retarded',
      'motherfucker', 'mf', 'wtf',
      'damn', 'goddamn', 'jackass', 'dumbass', 'dipshit',
      'whore', 'slut', 'skank', 'ho ', 'hoe',
      'prick', 'wanker', 'tosser', 'twat',
    ],
  },

  // ── 🇫🇷 French Profanity ─────────────────────────────────────────────────
  {
    label: 'Le contenu contient des grossièretés. (French profanity detected.)',
    patterns: [
      'merde', 'putain', 'connard', 'connasse', 'salope',
      'enculé', 'encule', 'fils de pute', 'va te faire foutre',
      'bâtard', 'batard', 'bordel', 'con ', 'conne',
      'nique ta mère', 'ntm', 'pd ', 'pédé', 'pede',
      'couille', 'couillon', 'chiotte', 'merdique',
    ],
  },

  // ── 🇪🇸 Spanish Profanity ────────────────────────────────────────────────
  {
    label: 'El contenido contiene lenguaje ofensivo. (Spanish profanity detected.)',
    patterns: [
      'puta', 'puto', 'coño', 'cono', 'joder', 'hostia',
      'cabron', 'cabrón', 'hijo de puta', 'hdp', 'maricón', 'maricon',
      'gilipollas', 'imbécil', 'imbecil', 'mierda', 'chinga', 'chingada',
      'pendejo', 'verga', 'culero', 'pinche', 'mamón', 'mamon',
      'carajo', 'coger', 'follar', 'me cago',
    ],
  },

  // ── 🇵🇹 Portuguese Profanity ─────────────────────────────────────────────
  {
    label: 'O conteúdo contém linguagem ofensiva. (Portuguese profanity detected.)',
    patterns: [
      'porra', 'caralho', 'foda', 'foda-se', 'fodase',
      'merda', 'viado', 'buceta', 'cu ', 'arrombado',
      'vadia', 'safado', 'piranha', 'puta merda',
      'filho da puta', 'fdp', 'sua mãe', 'vai se foder',
    ],
  },

  // ── 🇩🇪 German Profanity ──────────────────────────────────────────────────
  {
    label: 'Der Inhalt enthält anstößige Sprache. (German profanity detected.)',
    patterns: [
      'scheiße', 'scheisse', 'scheiß', 'fick', 'ficken',
      'arschloch', 'arsch', 'wichser', 'hurensohn',
      'hure', 'schlampe', 'verdammt', 'fotze', 'schwanz',
      'idiot', 'vollidiot', 'depp', 'dummkopf',
    ],
  },

  // ── 🇯🇵 Japanese (Romaji) ────────────────────────────────────────────────
  {
    label: '不適切なコンテンツが検出されました。(Japanese profanity detected.)',
    patterns: [
      'kichiku', 'kisama', 'kuso', 'chikushō', 'chikusho',
      'fuzakeru', 'baka', 'aho', 'manko', 'chinpo', 'ochinchin',
      'yariman', 'sukebe', 'hentai',
    ],
  },

  // ── 🇰🇷 Korean (Romaji) ─────────────────────────────────────────────────
  {
    label: '부적절한 내용이 감지되었습니다. (Korean profanity detected.)',
    patterns: [
      'sibal', 'ssibal', '씨발', 'bitch', 'gaesaekki', '개새끼',
      'byeongsin', 'byungshin', 'jiral', 'jot', 'jotat',
      'ssibpal', 'michin', 'seki', 'yougjin',
    ],
  },

  // ── 🇨🇳 Chinese (Pinyin) ────────────────────────────────────────────────
  {
    label: '检测到不当内容。(Chinese profanity detected.)',
    patterns: [
      'tmd', 'cao ni', 'caoni', 'tamade', 'ta ma de',
      'sha bi', 'shabi', 'wang ba', 'wangba', 'hun dan', 'hundan',
      'cao ni ma', 'cao nima', 'nmsl', 'cnm',
      'qu ni de', 'ri ni', 'ri ni ma',
    ],
  },

  // ── 🌍 Arabic (Romaji) ───────────────────────────────────────────────────
  {
    label: 'تم اكتشاف محتوى غير لائق. (Arabic profanity detected.)',
    patterns: [
      'kus', 'kuss', 'ibn el sharmouta', 'sharmouta',
      'ayri', 'ayre', 'khara', 'khra', 'yil'an',
      'ibn el', 'ya ibn',
    ],
  },

  // ── 18+ / Adult Content (all languages) ─────────────────────────────────
  {
    label: 'Adult / NSFW content is not allowed.',
    patterns: [
      'porn', 'pornhub', 'xvideos', 'xnxx', 'xhamster', 'redtube',
      'onlyfans', 'brazzers', 'bangbros', 'pornstar',
      'xxx', 'hentai', 'nsfw', 'nude', 'nudity', 'naked',
      'erotic', 'explicit', 'adult content', 'sex tape',
      'camgirl', 'stripper', 'escort service', 'prostitut',
      // Vietnamese adult
      'phim sex', 'phim khieu dam', 'anh khoa than', 'gai goi',
      // Chinese
      'se qing', 'seqing', 'huang se', 'cheng ren', 'av ',
      // Japanese
      'エロ', 'ero', 'jav ', 'gravure',
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
      'darknet market', 'hidden wiki', 'empire market',
      // Vietnamese
      'web đen', 'mạng tối',
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
      // Vietnamese
      'mua ma túy', 'bán ma túy', 'mua heroin', 'mua cần sa',
      'thuốc lắc', 'thuoc lac', 'cần sa', 'can sa',
      // Spanish
      'comprar drogas', 'vender cocaína',
      // Chinese pinyin
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
      'kill yourself', 'kill people', 'mass shooting',
      // Vietnamese
      'mua vũ khí', 'chế tạo bom', 'giết người',
      // Spanish
      'comprar armas', 'fabricar bomba',
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
      'money laundering',
      // Vietnamese
      'lừa đảo', 'lua dao', 'giả mạo', 'gia mao', 'trộm cắp',
      'hack tài khoản', 'đánh cắp mật khẩu',
    ],
  },

  // ── Hate Speech & Terrorism ───────────────────────────────────────────────
  {
    label: 'Hate speech or extremist content is not allowed.',
    patterns: [
      'isis', 'al-qaeda', 'al qaeda', 'jihad recruitment',
      'white supremac', 'neo nazi', 'neo-nazi',
      'ethnic cleansing', 'terrorist attack',
      // Vietnamese
      'khủng bố', 'khung bo', 'kỳ thị', 'ky thi chung toc',
    ],
  },

  // ── Malware / Hacking ─────────────────────────────────────────────────────
  {
    label: 'Malware or hacking content is not allowed.',
    patterns: [
      'download malware', 'ransomware download', 'keylogger download',
      'rat download', 'trojan download', 'virus download',
      'hack facebook', 'hack instagram', 'hack wifi password',
      'ddos attack', 'ddos tool', 'free hacking tools',
      // Vietnamese
      'hack zalo', 'hack facebook', 'phần mềm gián điệp',
      'đánh cắp dữ liệu',
    ],
  },

  // ── Child Safety (CSAM) ───────────────────────────────────────────────────
  {
    label: 'Content that endangers minors is strictly prohibited.',
    patterns: [
      'csam', 'child porn', 'cp site', 'minor explicit',
      'underage', 'preteen explicit', 'lolita site',
      // Vietnamese
      'xâm hại trẻ em', 'lạm dụng trẻ em',
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

// ─── Normalize text before matching ──────────────────────────────────────────
// Strips diacritics so "đ*t", "d!t", "d.i.t" etc. still match
function normalize(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // remove combining diacritical marks
    .replace(/[^\w\s]/g, ' ')        // replace punctuation/symbols with space
    .replace(/\s+/g, ' ')
    .trim();
}

// ─── Main Filter Function ─────────────────────────────────────────────────────

/**
 * Returns null if content is clean, or an error message string if blocked.
 */
function runContentFilter(text, url) {
  if (url && isTrustedDomain(url)) return null;

  const normalizedText = normalize(text);
  const rawLower = text.toLowerCase();

  for (const category of FILTER_CATEGORIES) {
    for (const pattern of category.patterns) {
      let matched = false;

      if (pattern instanceof RegExp) {
        matched = pattern.test(rawLower);
      } else {
        const normalizedPattern = normalize(pattern);
        matched =
          normalizedText.includes(normalizedPattern) ||
          rawLower.includes(pattern.toLowerCase());
      }

      if (matched) return category.label;
    }
  }

  return null;
}

module.exports = { runContentFilter };
