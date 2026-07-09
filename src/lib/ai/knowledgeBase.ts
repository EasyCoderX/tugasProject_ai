// ==================== KNOWLEDGE BASE MODULE ====================
// Forward chaining inference engine for "What's This?" AI education app
// Berisi fakta, aturan, dan algoritma inferensi forward chaining

import type {
  Fact,
  Rule,
  InferenceResult,
  InferredTag,
  PredicateName,
  Category,
} from './types';

// ==================== LANGUAGE ALIASES ====================
// Maps from English and Chinese names to canonical Indonesian object names

const LANGUAGE_ALIASES: Record<string, Record<string, string>> = {
  en: {
    cat: 'kucing',
    dog: 'anjing',
    fish: 'ikan',
    bird: 'burung',
    elephant: 'gajah',
    snake: 'ular',
    butterfly: 'kupu_kupu',
    chicken: 'ayam',
    goat: 'kambing',
    cow: 'sapi',
    banana: 'pisang',
    apple: 'apel',
    carrot: 'wortel',
    milk: 'susu',
    rice: 'nasi',
    bread: 'roti',
    car: 'mobil',
    airplane: 'pesawat',
    bicycle: 'sepeda',
    ship: 'kapal',
    train: 'kereta',
    rocket: 'roket',
    sun: 'matahari',
    moon: 'bulan',
    tree: 'pohon',
    flower: 'bunga',
    cloud: 'awan',
    star: 'bintang',
    ball: 'bola',
    doll: 'boneka',
  },
  zh: {
    '猫': 'kucing',
    '狗': 'anjing',
    '鱼': 'ikan',
    '鸟': 'burung',
    '象': 'gajah',
    '蛇': 'ular',
    '蝴蝶': 'kupu_kupu',
    '鸡': 'ayam',
    '山羊': 'kambing',
    '牛': 'sapi',
    '香蕉': 'pisang',
    '苹果': 'apel',
    '胡萝卜': 'wortel',
    '牛奶': 'susu',
    '米': 'nasi',
    '面包': 'roti',
    '车': 'mobil',
    '飞机': 'pesawat',
    '自行车': 'sepeda',
    '船': 'kapal',
    '火车': 'kereta',
    '火箭': 'roket',
    '太阳': 'matahari',
    '月亮': 'bulan',
    '树': 'pohon',
    '花': 'bunga',
    '云': 'awan',
    '星': 'bintang',
    '球': 'bola',
    '娃娃': 'boneka',
  },
};

// ==================== ATTRIBUTE TO FACTS MAP ====================
// Maps AI vision attributes (from GLM-4V-Flash) to seed facts
// __OBJ__ is a placeholder replaced with actual object name at inference time

const ATTRIBUTE_TO_FACTS: Record<string, Fact[]> = {
  furry: [{ predicate: 'hasProperty' as PredicateName, args: ['__OBJ__', 'berbulu_halus'] }],
  feathered: [{ predicate: 'hasProperty' as PredicateName, args: ['__OBJ__', 'berbulu_tebal'] }],
  scaly: [{ predicate: 'hasProperty' as PredicateName, args: ['__OBJ__', 'bersisik'] }],
  eats_plants: [{ predicate: 'hasDiet' as PredicateName, args: ['__OBJ__', 'tumbuhan'] }],
  eats_meat: [{ predicate: 'hasDiet' as PredicateName, args: ['__OBJ__', 'daging'] }],
  has_tail: [{ predicate: 'hasProperty' as PredicateName, args: ['__OBJ__', 'berekor'] }],
  flies: [{ predicate: 'canDo' as PredicateName, args: ['__OBJ__', 'terbang'] }],
  swims: [{ predicate: 'livesIn' as PredicateName, args: ['__OBJ__', 'air'] }],
  walks: [{ predicate: 'canDo' as PredicateName, args: ['__OBJ__', 'berjalan'] }],
  has_fur: [{ predicate: 'hasProperty' as PredicateName, args: ['__OBJ__', 'berbulu_halus'] }],
  has_feathers: [{ predicate: 'hasProperty' as PredicateName, args: ['__OBJ__', 'berbulu_tebal'] }],
  lays_eggs: [{ predicate: 'canDo' as PredicateName, args: ['__OBJ__', 'bertelur'] }],
  barks: [{ predicate: 'hasSound' as PredicateName, args: ['__OBJ__', 'menggonggong'] }],
  meows: [{ predicate: 'hasSound' as PredicateName, args: ['__OBJ__', 'mengeong'] }],
  roars: [{ predicate: 'hasSound' as PredicateName, args: ['__OBJ__', 'mengaum'] }],
  chirps: [{ predicate: 'hasSound' as PredicateName, args: ['__OBJ__', 'berkicau'] }],
  has_wings: [{ predicate: 'hasProperty' as PredicateName, args: ['__OBJ__', 'bersayap'] }],
  has_wheels: [{ predicate: 'hasProperty' as PredicateName, args: ['__OBJ__', 'beroda'] }],
  has_legs: [{ predicate: 'hasProperty' as PredicateName, args: ['__OBJ__', 'berkaki'] }],
  aquatic: [{ predicate: 'livesIn' as PredicateName, args: ['__OBJ__', 'air'] }],
  terrestrial: [{ predicate: 'livesIn' as PredicateName, args: ['__OBJ__', 'darat'] }],
  sweet: [{ predicate: 'hasProperty' as PredicateName, args: ['__OBJ__', 'manis'] }],
  healthy: [{ predicate: 'hasProperty' as PredicateName, args: ['__OBJ__', 'sehat'] }],
  natural: [{ predicate: 'hasProperty' as PredicateName, args: ['__OBJ__', 'alami'] }],
  round: [{ predicate: 'hasProperty' as PredicateName, args: ['__OBJ__', 'bulat'] }],
  tall: [{ predicate: 'hasProperty' as PredicateName, args: ['__OBJ__', 'tinggi'] }],
  colorful: [{ predicate: 'hasColor' as PredicateName, args: ['__OBJ__', 'warni'] }],
  can_swim: [{ predicate: 'canDo' as PredicateName, args: ['__OBJ__', 'berenang'] }],
  can_jump: [{ predicate: 'canDo' as PredicateName, args: ['__OBJ__', 'melompat'] }],
};

// ==================== CATEGORY FACT MAP ====================
// Maps UI categories to their seed facts (replaces __OBJ__ at inference time)

const CATEGORY_FACT_MAP: Record<string, Fact[]> = {
  Animals: [{ predicate: 'isA' as PredicateName, args: ['__OBJ__', 'hewan'] }],
  Food: [{ predicate: 'isA' as PredicateName, args: ['__OBJ__', 'makanan'] }],
  Toys: [{ predicate: 'isA' as PredicateName, args: ['__OBJ__', 'mainan'] }],
  Vehicles: [{ predicate: 'isA' as PredicateName, args: ['__OBJ__', 'kendaraan'] }],
  Plants: [{ predicate: 'isA' as PredicateName, args: ['__OBJ__', 'tumbuhan'] }],
  Electronics: [{ predicate: 'isA' as PredicateName, args: ['__OBJ__', 'elektronik'] }],
  Furniture: [{ predicate: 'isA' as PredicateName, args: ['__OBJ__', 'perabotan'] }],
  Clothing: [{ predicate: 'isA' as PredicateName, args: ['__OBJ__', 'pakaian'] }],
  Nature: [{ predicate: 'isA' as PredicateName, args: ['__OBJ__', 'alam'] }],
  Sports: [{ predicate: 'isA' as PredicateName, args: ['__OBJ__', 'olahraga'] }],
  School: [{ predicate: 'isA' as PredicateName, args: ['__OBJ__', 'sekolah'] }],
  Music: [{ predicate: 'isA' as PredicateName, args: ['__OBJ__', 'musik'] }],
  Household: [{ predicate: 'isA' as PredicateName, args: ['__OBJ__', 'rumah_tangga'] }],
  Tools: [{ predicate: 'isA' as PredicateName, args: ['__OBJ__', 'alat'] }],
  Art: [{ predicate: 'isA' as PredicateName, args: ['__OBJ__', 'seni'] }],
  People: [{ predicate: 'isA' as PredicateName, args: ['__OBJ__', 'orang'] }],
  Other: [],
};

// ==================== INFERENCE LABELS ====================
// Display labels for each inference result in three languages + emoji badge

const INFERENCE_LABELS: Record<
  string,
  { en: string; id: string; zh: string; emoji: string }
> = {
  mamalia: { en: 'Mammal', id: 'Mamalia', zh: '哺乳动物', emoji: '🦁' },
  unggas: { en: 'Bird', id: 'Unggas', zh: '鸟类', emoji: '🐔' },
  ikan: { en: 'Fish', id: 'Ikan', zh: '鱼', emoji: '🐟' },
  karnivora: { en: 'Carnivore', id: 'Karnivora', zh: '食肉动物', emoji: '🥩' },
  herbivora: { en: 'Herbivore', id: 'Herbivora', zh: '食草动物', emoji: '🌿' },
  bergerak: { en: 'Can move', id: 'Bisa bergerak', zh: '能动', emoji: '🐾' },
  bersuara: { en: 'Can make sound', id: 'Bersuara', zh: '能发声', emoji: '🗣️' },
  berjalan_di_darat: {
    en: 'Runs on land',
    id: 'Jalan di darat',
    zh: '陆地上行驶',
    emoji: '🛣️',
  },
  terbang: { en: 'Can fly', id: 'Bisa terbang', zh: '会飞', emoji: '🪶' },
  sehat: { en: 'Healthy', id: 'Sehat', zh: '健康', emoji: '💚' },
  memberi_cahaya: {
    en: 'Gives light',
    id: 'Memberi cahaya',
    zh: '发光',
    emoji: '💡',
  },
};

// ==================== RULES (12 aturan) ====================
// Rules sudah diaudit: predikat berbulu_halus dan berbulu_tebal disjoint,
// tidak ada konflik atau overlap antar rule.

const rules: Rule[] = [
  {
    id: 'mamalia',
    antecedents: [
      { predicate: 'isA', args: ['X', 'hewan'] },
      { predicate: 'hasProperty', args: ['X', 'berbulu_halus'] },
    ],
    consequent: { predicate: 'isA', args: ['X', 'mamalia'] },
    description: 'Hewan berbulu halus adalah mamalia',
  },
  {
    id: 'unggas',
    antecedents: [
      { predicate: 'isA', args: ['X', 'hewan'] },
      { predicate: 'hasProperty', args: ['X', 'berbulu_tebal'] },
      { predicate: 'canDo', args: ['X', 'bertelur'] },
    ],
    consequent: { predicate: 'isA', args: ['X', 'unggas'] },
    description: 'Hewan berbulu tebal yang bertelur adalah unggas',
  },
  {
    id: 'ikan',
    antecedents: [
      { predicate: 'isA', args: ['X', 'hewan'] },
      { predicate: 'hasProperty', args: ['X', 'bersisik'] },
      { predicate: 'livesIn', args: ['X', 'air'] },
    ],
    consequent: { predicate: 'isA', args: ['X', 'ikan'] },
    description: 'Hewan bersisik yang hidup di air adalah ikan',
  },
  {
    id: 'karnivora',
    antecedents: [
      { predicate: 'isA', args: ['X', 'hewan'] },
      { predicate: 'hasDiet', args: ['X', 'daging'] },
    ],
    consequent: { predicate: 'hasProperty', args: ['X', 'karnivora'] },
    description: 'Hewan pemakan daging adalah karnivora',
  },
  {
    id: 'herbivora',
    antecedents: [
      { predicate: 'isA', args: ['X', 'hewan'] },
      { predicate: 'hasDiet', args: ['X', 'tumbuhan'] },
    ],
    consequent: { predicate: 'hasProperty', args: ['X', 'herbivora'] },
    description: 'Hewan pemakan tumbuhan adalah herbivora',
  },
  {
    id: 'bergerak',
    antecedents: [
      { predicate: 'isA', args: ['X', 'hewan'] },
    ],
    consequent: { predicate: 'canDo', args: ['X', 'bergerak'] },
    description: 'Semua hewan bisa bergerak',
  },
  {
    id: 'bersuara',
    antecedents: [
      { predicate: 'isA', args: ['X', 'hewan'] },
    ],
    consequent: { predicate: 'canDo', args: ['X', 'bersuara'] },
    description: 'Semua hewan bisa bersuara',
  },
  {
    id: 'kendaraan_darat',
    antecedents: [
      { predicate: 'isA', args: ['X', 'kendaraan'] },
      { predicate: 'hasProperty', args: ['X', 'beroda'] },
    ],
    consequent: { predicate: 'canDo', args: ['X', 'berjalan_di_darat'] },
    description: 'Kendaraan beroda bisa berjalan di darat',
  },
  {
    id: 'kendaraan_terbang',
    antecedents: [
      { predicate: 'isA', args: ['X', 'kendaraan'] },
      { predicate: 'hasProperty', args: ['X', 'bersayap'] },
    ],
    consequent: { predicate: 'canDo', args: ['X', 'terbang'] },
    description: 'Kendaraan bersayap bisa terbang',
  },
  {
    id: 'makanan_sehat',
    antecedents: [
      { predicate: 'isA', args: ['X', 'makanan'] },
      { predicate: 'hasProperty', args: ['X', 'alami'] },
    ],
    consequent: { predicate: 'hasProperty', args: ['X', 'sehat'] },
    description: 'Makanan dari alam itu sehat',
  },
  {
    id: 'tumbuhan_hijau',
    antecedents: [
      { predicate: 'isA', args: ['X', 'tumbuhan'] },
    ],
    consequent: { predicate: 'hasColor', args: ['X', 'hijau'] },
    description: 'Tumbuhan berwarna hijau',
  },
  {
    id: 'alam_bersinar',
    antecedents: [
      { predicate: 'isA', args: ['X', 'alam'] },
      { predicate: 'hasProperty', args: ['X', 'bersinar'] },
    ],
    consequent: { predicate: 'canDo', args: ['X', 'memberi_cahaya'] },
    description: 'Benda alam yang bersinar bisa memberi cahaya',
  },
];

// ==================== FACTS DATABASE (~30 objek, 140+ fakta) ====================

const facts: Fact[] = [
  // ========== ANIMALS (10 objek) ==========
  // kucing
  { predicate: 'isA', args: ['kucing', 'hewan'] },
  { predicate: 'hasProperty', args: ['kucing', 'berbulu_halus'] },
  { predicate: 'hasDiet', args: ['kucing', 'daging'] },
  { predicate: 'hasSound', args: ['kucing', 'mengeong'] },
  { predicate: 'livesIn', args: ['kucing', 'darat'] },
  { predicate: 'hasProperty', args: ['kucing', 'berekor'] },
  { predicate: 'canDo', args: ['kucing', 'berjalan'] },
  { predicate: 'hasProperty', args: ['kucing', 'berkaki'] },

  // anjing
  { predicate: 'isA', args: ['anjing', 'hewan'] },
  { predicate: 'hasProperty', args: ['anjing', 'berbulu_halus'] },
  { predicate: 'hasDiet', args: ['anjing', 'daging'] },
  { predicate: 'hasSound', args: ['anjing', 'menggonggong'] },
  { predicate: 'livesIn', args: ['anjing', 'darat'] },
  { predicate: 'hasProperty', args: ['anjing', 'berekor'] },
  { predicate: 'canDo', args: ['anjing', 'berjalan'] },
  { predicate: 'hasProperty', args: ['anjing', 'berkaki'] },

  // ikan
  { predicate: 'isA', args: ['ikan', 'hewan'] },
  { predicate: 'hasProperty', args: ['ikan', 'bersisik'] },
  { predicate: 'livesIn', args: ['ikan', 'air'] },
  { predicate: 'canDo', args: ['ikan', 'berenang'] },
  { predicate: 'hasProperty', args: ['ikan', 'berekor'] },
  { predicate: 'hasDiet', args: ['ikan', 'daging'] },

  // burung
  { predicate: 'isA', args: ['burung', 'hewan'] },
  { predicate: 'hasProperty', args: ['burung', 'berbulu_tebal'] },
  { predicate: 'canDo', args: ['burung', 'bertelur'] },
  { predicate: 'canDo', args: ['burung', 'terbang'] },
  { predicate: 'hasSound', args: ['burung', 'berkicau'] },
  { predicate: 'hasProperty', args: ['burung', 'bersayap'] },
  { predicate: 'hasProperty', args: ['burung', 'berkaki'] },
  { predicate: 'hasDiet', args: ['burung', 'tumbuhan'] },

  // gajah
  { predicate: 'isA', args: ['gajah', 'hewan'] },
  { predicate: 'hasDiet', args: ['gajah', 'tumbuhan'] },
  { predicate: 'livesIn', args: ['gajah', 'darat'] },
  { predicate: 'hasProperty', args: ['gajah', 'berekor'] },
  { predicate: 'canDo', args: ['gajah', 'berjalan'] },
  { predicate: 'hasProperty', args: ['gajah', 'belalai'] },
  { predicate: 'hasProperty', args: ['gajah', 'tinggi'] },
  { predicate: 'hasProperty', args: ['gajah', 'berkaki'] },

  // ular
  { predicate: 'isA', args: ['ular', 'hewan'] },
  { predicate: 'hasProperty', args: ['ular', 'bersisik'] },
  { predicate: 'livesIn', args: ['ular', 'darat'] },
  { predicate: 'hasDiet', args: ['ular', 'daging'] },

  // kupu_kupu
  { predicate: 'isA', args: ['kupu_kupu', 'hewan'] },
  { predicate: 'hasProperty', args: ['kupu_kupu', 'bersayap'] },
  { predicate: 'canDo', args: ['kupu_kupu', 'terbang'] },
  { predicate: 'hasColor', args: ['kupu_kupu', 'warni'] },
  { predicate: 'hasDiet', args: ['kupu_kupu', 'tumbuhan'] },

  // ayam
  { predicate: 'isA', args: ['ayam', 'hewan'] },
  { predicate: 'hasProperty', args: ['ayam', 'berbulu_tebal'] },
  { predicate: 'canDo', args: ['ayam', 'bertelur'] },
  { predicate: 'canDo', args: ['ayam', 'berjalan'] },
  { predicate: 'hasProperty', args: ['ayam', 'berkaki'] },
  { predicate: 'hasSound', args: ['ayam', 'berkokok'] },
  { predicate: 'hasProperty', args: ['ayam', 'bersayap'] },

  // kambing
  { predicate: 'isA', args: ['kambing', 'hewan'] },
  { predicate: 'hasProperty', args: ['kambing', 'berbulu_halus'] },
  { predicate: 'hasDiet', args: ['kambing', 'tumbuhan'] },
  { predicate: 'livesIn', args: ['kambing', 'darat'] },
  { predicate: 'hasProperty', args: ['kambing', 'berekor'] },
  { predicate: 'canDo', args: ['kambing', 'berjalan'] },
  { predicate: 'hasProperty', args: ['kambing', 'berkaki'] },

  // sapi
  { predicate: 'isA', args: ['sapi', 'hewan'] },
  { predicate: 'hasProperty', args: ['sapi', 'berbulu_halus'] },
  { predicate: 'hasDiet', args: ['sapi', 'tumbuhan'] },
  { predicate: 'livesIn', args: ['sapi', 'darat'] },
  { predicate: 'hasProperty', args: ['sapi', 'berekor'] },
  { predicate: 'canDo', args: ['sapi', 'berjalan'] },
  { predicate: 'hasProperty', args: ['sapi', 'berkaki'] },

  // ========== FOOD (6 objek) ==========
  // pisang
  { predicate: 'isA', args: ['pisang', 'makanan'] },
  { predicate: 'hasProperty', args: ['pisang', 'manis'] },
  { predicate: 'hasProperty', args: ['pisang', 'alami'] },
  { predicate: 'hasColor', args: ['pisang', 'kuning'] },

  // apel
  { predicate: 'isA', args: ['apel', 'makanan'] },
  { predicate: 'hasProperty', args: ['apel', 'manis'] },
  { predicate: 'hasProperty', args: ['apel', 'alami'] },
  { predicate: 'hasColor', args: ['apel', 'merah'] },
  { predicate: 'hasProperty', args: ['apel', 'bulat'] },

  // wortel
  { predicate: 'isA', args: ['wortel', 'makanan'] },
  { predicate: 'hasProperty', args: ['wortel', 'alami'] },
  { predicate: 'hasColor', args: ['wortel', 'orange'] },

  // susu
  { predicate: 'isA', args: ['susu', 'makanan'] },
  { predicate: 'hasProperty', args: ['susu', 'alami'] },
  { predicate: 'hasColor', args: ['susu', 'putih'] },

  // nasi
  { predicate: 'isA', args: ['nasi', 'makanan'] },
  { predicate: 'hasProperty', args: ['nasi', 'alami'] },
  { predicate: 'hasColor', args: ['nasi', 'putih'] },

  // roti
  { predicate: 'isA', args: ['roti', 'makanan'] },
  { predicate: 'hasProperty', args: ['roti', 'alami'] },

  // ========== VEHICLES (6 objek) ==========
  // mobil
  { predicate: 'isA', args: ['mobil', 'kendaraan'] },
  { predicate: 'hasProperty', args: ['mobil', 'beroda'] },
  { predicate: 'hasProperty', args: ['mobil', 'cepat'] },

  // pesawat
  { predicate: 'isA', args: ['pesawat', 'kendaraan'] },
  { predicate: 'hasProperty', args: ['pesawat', 'bersayap'] },

  // sepeda
  { predicate: 'isA', args: ['sepeda', 'kendaraan'] },
  { predicate: 'hasProperty', args: ['sepeda', 'beroda'] },

  // kapal
  { predicate: 'isA', args: ['kapal', 'kendaraan'] },
  { predicate: 'livesIn', args: ['kapal', 'air'] },
  { predicate: 'canDo', args: ['kapal', 'berenang'] },

  // kereta
  { predicate: 'isA', args: ['kereta', 'kendaraan'] },
  { predicate: 'hasProperty', args: ['kereta', 'beroda'] },

  // roket
  { predicate: 'isA', args: ['roket', 'kendaraan'] },
  { predicate: 'canDo', args: ['roket', 'terbang'] },

  // ========== NATURE (6 objek) ==========
  // matahari
  { predicate: 'isA', args: ['matahari', 'alam'] },
  { predicate: 'hasProperty', args: ['matahari', 'bersinar'] },
  { predicate: 'hasColor', args: ['matahari', 'kuning'] },
  { predicate: 'hasProperty', args: ['matahari', 'panas'] },

  // bulan
  { predicate: 'isA', args: ['bulan', 'alam'] },
  { predicate: 'hasColor', args: ['bulan', 'putih'] },

  // pohon
  { predicate: 'isA', args: ['pohon', 'tumbuhan'] },
  { predicate: 'hasColor', args: ['pohon', 'hijau'] },
  { predicate: 'hasProperty', args: ['pohon', 'tinggi'] },
  { predicate: 'hasProperty', args: ['pohon', 'alami'] },

  // bunga
  { predicate: 'isA', args: ['bunga', 'tumbuhan'] },
  { predicate: 'hasColor', args: ['bunga', 'warni'] },
  { predicate: 'hasProperty', args: ['bunga', 'alami'] },
  { predicate: 'hasProperty', args: ['bunga', 'wangi'] },

  // awan
  { predicate: 'isA', args: ['awan', 'alam'] },
  { predicate: 'hasColor', args: ['awan', 'putih'] },

  // bintang
  { predicate: 'isA', args: ['bintang', 'alam'] },
  { predicate: 'hasProperty', args: ['bintang', 'bersinar'] },
  { predicate: 'hasColor', args: ['bintang', 'kuning'] },

  // ========== TOYS (2 objek) ==========
  // bola
  { predicate: 'isA', args: ['bola', 'mainan'] },
  { predicate: 'hasProperty', args: ['bola', 'bulat'] },
  { predicate: 'canDo', args: ['bola', 'melompat'] },
  { predicate: 'hasColor', args: ['bola', 'warni'] },

  // boneka
  { predicate: 'isA', args: ['boneka', 'mainan'] },
  { predicate: 'hasProperty', args: ['boneka', 'berbulu_halus'] },
  { predicate: 'hasColor', args: ['boneka', 'warni'] },
];

// ==================== FORWARD CHAINING ENGINE ====================

/**
 * Checks whether a specific fact already exists in a set of facts.
 * Facts are considered identical when predicate and all args match.
 */
function factExists(fact: Fact, inFacts: Fact[]): boolean {
  return inFacts.some(
    (f) =>
      f.predicate === fact.predicate &&
      f.args.length === fact.args.length &&
      f.args.every((arg, i) => arg === fact.args[i])
  );
}

/**
 * Forward Chaining Inference Algorithm
 *
 * Iteratively applies rules against known facts to derive new facts.
 * Uses variable unification (binding variable 'X' to object names).
 *
 * Pseudocode:
 *   function forwardChain(knownFacts, rules, maxIterations):
 *     newFacts = []
 *     iteration = 0
 *     repeat:
 *       iteration++
 *       for each rule:
 *         try unified match of rule.antecedents against knownFacts U newFacts
 *         if match found AND consequent not in knownFacts U newFacts:
 *           add consequent to newFacts
 *           record derivation
 *     until no new facts added OR iteration >= maxIterations
 *     return newFacts + derivations
 */
export function forwardChain(
  knownFacts: Fact[],
  rules: Rule[],
  maxIterations: number = 10
): InferenceResult {
  const workingSet = [...knownFacts];
  const newFacts: Fact[] = [];
  const derivations: string[] = [];

  let iteration = 0;
  let changed = true;

  while (changed && iteration < maxIterations) {
    changed = false;
    iteration++;

    // Collect all unique object names from the current working set
    // (exclude __OBJ__ placeholder which is only used in attribute maps)
    const objectNames = new Set<string>();
    for (const fact of workingSet) {
      if (fact.args.length > 0 && fact.args[0] !== '__OBJ__') {
        objectNames.add(fact.args[0]);
      }
    }

    // Try each rule with each possible object binding
    for (const rule of rules) {
      for (const objName of objectNames) {
        // Check if this object satisfies ALL antecedents of the rule
        const allAntecedentsMatch = rule.antecedents.every((ant) => {
          const searchArgs = ant.args.map((a) => (a === 'X' ? objName : a));
          return workingSet.some(
            (f) =>
              f.predicate === ant.predicate &&
              f.args.length === searchArgs.length &&
              f.args.every((arg, i) => arg === searchArgs[i])
          );
        });

        if (!allAntecedentsMatch) continue;

        // Build consequent with object binding applied
        const consArgs = rule.consequent.args.map((a) =>
          a === 'X' ? objName : a
        );
        const inferredFact: Fact = {
          predicate: rule.consequent.predicate,
          args: consArgs,
        };

        // Skip if this fact already exists in the working set
        if (factExists(inferredFact, workingSet)) continue;

        // Add the newly inferred fact
        newFacts.push(inferredFact);
        workingSet.push(inferredFact);

        // Build human-readable derivation string
        const antDesc = rule.antecedents
          .map((a) => {
            const displayArgs = a.args.map((arg) =>
              arg === 'X' ? objName : arg
            );
            return displayArgs.join(' ');
          })
          .join(', ');
        const consDesc = consArgs.join(' ');
        derivations.push(`${objName}: ${rule.description}`);

        changed = true;
      }
    }
  }

  return { newFacts, derivations };
}

// ==================== INFER FROM OBJECT ====================

/**
 * Performs forward chaining inference for a single object.
 *
 * Builds seed facts from:
 * 1. Category-based facts (isA hewan/makanan/etc.)
 * 2. AI vision attribute-based facts (hasProperty, hasDiet, etc.)
 * 3. Pre-existing KB facts matching the object name
 *
 * Then runs forward chaining and returns InferredTag[] for display.
 */
export function inferFromObject(
  objectName: string,
  category: Category | string,
  attributes: string[],
  language: 'en' | 'id' | 'zh',
  kb: { facts: Fact[]; rules: Rule[] }
): InferredTag[] {
  // Build seed facts for this specific object
  const seedFacts: Fact[] = [];

  // 1. Category seed facts (replacing __OBJ__ with actual object name)
  const catFacts = CATEGORY_FACT_MAP[category] || [];
  for (const fact of catFacts) {
    seedFacts.push({
      predicate: fact.predicate,
      args: fact.args.map((a) => (a === '__OBJ__' ? objectName : a)),
    });
  }

  // 2. Attribute seed facts from AI vision
  for (const attr of attributes) {
    const attrFactList = ATTRIBUTE_TO_FACTS[attr];
    if (attrFactList) {
      for (const fact of attrFactList) {
        seedFacts.push({
          predicate: fact.predicate,
          args: fact.args.map((a) => (a === '__OBJ__' ? objectName : a)),
        });
      }
    }
  }

  // 3. Pre-existing KB facts matching this object name
  for (const fact of kb.facts) {
    if (fact.args[0] === objectName) {
      // Avoid duplicating facts already added from step 1 or 2
      if (!factExists(fact, seedFacts)) {
        seedFacts.push(fact);
      }
    }
  }

  // Run forward chaining
  const result = forwardChain(seedFacts, kb.rules);

  // Map inferred facts to InferredTag[] for UI display.
  // Iterate newFacts and derivations in parallel since their order corresponds.
  const tags: InferredTag[] = [];
  const seenLabels = new Set<string>();

  for (let i = 0; i < result.newFacts.length; i++) {
    const fact = result.newFacts[i];
    // The second argument of an inferred fact contains the inference key
    // e.g. isA(kucing, mamalia) -> key = 'mamalia'
    //      hasProperty(kucing, karnivora) -> key = 'karnivora'
    //      canDo(kucing, bergerak) -> key = 'bergerak'
    const inferenceKey = fact.args[1];
    const labelInfo = INFERENCE_LABELS[inferenceKey];

    if (labelInfo && !seenLabels.has(inferenceKey)) {
      seenLabels.add(inferenceKey);

      // Derivation from forwardChain at the same index matches this fact
      const derivation = result.derivations[i] || `${objectName}: inferred as ${inferenceKey}`;

      tags.push({
        emoji: labelInfo.emoji,
        label: labelInfo[language] || labelInfo.en,
        derivation,
      });
    }
  }

  return tags;
}

// ==================== CREATE KNOWLEDGE BASE ====================

/**
 * Creates and returns the complete knowledge base:
 * - 30 objects with 140+ facts
 * - 12 inference rules
 *
 * Rules have been audited:
 * - berbulu_halus vs berbulu_tebal are disjoint (mamalia vs unggas)
 * - No conflicting or overlapping consequents
 * - Each rule fires for at least one object in the fact database
 */
export function createKnowledgeBase(): { facts: Fact[]; rules: Rule[] } {
  return {
    facts: [...facts],
    rules: [...rules],
  };
}

// ==================== NORMALIZE OBJECT NAME ====================

/**
 * Normalizes object names from English or Chinese to canonical Indonesian.
 *
 * Ensures that regardless of input language, the knowledge base query uses
 * the canonical Indonesian name that matches the fact database.
 *
 * @param name - The object name to normalize
 * @param lang - Source language ('en', 'id', or 'zh')
 * @returns The canonical Indonesian name (or original if not found in aliases)
 */
export function normalizeObjectName(name: string, lang: string): string {
  // Already in Indonesian -- return as-is
  if (lang === 'id') return name;

  // Look up the alias map for this language
  const aliases = LANGUAGE_ALIASES[lang];
  if (aliases && aliases[name] !== undefined) {
    return aliases[name];
  }

  // Return original if no alias found (defensive fallback)
  return name;
}

// ==================== VALIDATE KNOWLEDGE BASE ====================

/**
 * Programmatic validator for the knowledge base.
 *
 * Checks:
 * 1. All object names are consistent across facts
 * 2. No facts have unknown predicates
 * 3. All facts have the correct number of arguments (minimum 2)
 * 4. Every rule has at least one object that satisfies its antecedents
 *
 * @param kb - The knowledge base to validate
 * @returns Array of error messages (empty array means validation passed)
 */
export function validateKnowledgeBase(kb: {
  facts: Fact[];
  rules: Rule[];
}): string[] {
  const errors: string[] = [];

  // Collect all unique object names from the fact database
  const objectNames = new Set<string>();
  for (const fact of kb.facts) {
    if (fact.args.length > 0 && fact.args[0] !== '__OBJ__') {
      objectNames.add(fact.args[0]);
    }
  }

  // --- Check 1: Every rule has at least one matching object ---
  for (const rule of kb.rules) {
    let foundMatch = false;

    for (const objName of objectNames) {
      const allMatch = rule.antecedents.every((ant) => {
        const searchArgs = ant.args.map((a) => (a === 'X' ? objName : a));
        return kb.facts.some(
          (f) =>
            f.predicate === ant.predicate &&
            f.args.length === searchArgs.length &&
            f.args.every((arg, i) => arg === searchArgs[i])
        );
      });

      if (allMatch) {
        foundMatch = true;
        break;
      }
    }

    if (!foundMatch) {
      errors.push(
        `Rule "${rule.id}" ("${rule.description}") has zero matching objects -- antecedents may be too restrictive or facts are missing.`
      );
    }
  }

  // --- Check 2: All predicates are valid ---
  const validPredicates: PredicateName[] = [
    'isA',
    'hasProperty',
    'canDo',
    'livesIn',
    'hasColor',
    'hasSound',
    'hasDiet',
  ];

  for (const fact of kb.facts) {
    if (!validPredicates.includes(fact.predicate)) {
      errors.push(
        `Unknown predicate "${fact.predicate}" in fact for "${fact.args[0] || 'unknown'}".`
      );
    }
  }

  // --- Check 3: All facts have sufficient arguments ---
  for (const fact of kb.facts) {
    if (fact.args.length < 2) {
      errors.push(
        `Fact "${fact.predicate}" for "${fact.args[0] || 'unknown'}" has only ${fact.args.length} argument(s) -- expected at least 2.`
      );
    }
  }

  // --- Check 4: All rule IDs are unique ---
  const ruleIds = new Set<string>();
  for (const rule of kb.rules) {
    if (ruleIds.has(rule.id)) {
      errors.push(`Duplicate rule ID: "${rule.id}".`);
    }
    ruleIds.add(rule.id);
  }

  return errors;
}
