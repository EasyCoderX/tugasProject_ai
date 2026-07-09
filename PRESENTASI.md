# PRESENTASI UAS — "What's This?" Aplikasi Edukasi Anak

**Mata Kuliah:** Artificial Intelligence — Semester 4
**Tanggal:** 2026-07-09

---

## Slide 1 — Judul

**Aplikasi "What's This?" — Integrasi 4 Modul AI Klasik**

**Mata Kuliah:** Artificial Intelligence

**Anggota Kelompok:**
- Richie Hujaya
- Anthony Louis
- Trevan Edgard
- Suryanata Yaptanto

**Deskripsi Singkat:** Aplikasi edukasi anak berbasis React Native/Next.js yang menggunakan AI Vision (GLM-4V-Flash) untuk mengidentifikasi objek dari kamera/gambar, ditambah 4 modul AI klasik: CSP, Knowledge Base + Forward Chaining, Classical Planning, dan Goal-Based Agent.

---

## Slide 2 — Demo Aplikasi

**Alur Penggunaan:**

```
Register/Guest → Scan Objek (Camera/Upload) → AI Vision (GLM-4V-Flash)
    → Knowledge Base Inferensi (Forward Chaining) → Badge Inferensi
    → Quiz (CSP-generated) → Planner Rekomendasi → Achievement
```

**Tahapan Detail:**
1. **Register / Guest** — User masuk lewat register akun atau mode guest
2. **Scan** — User foto/upload gambar objek (kucing, apel, mobil, dll.)
3. **AI Vision** — Panggil `/api/identify` → GLM-4V-Flash → return `name`, `category`, `attributes[]`
4. **Knowledge Base** — `inferFromObject()` dijalankan → forward chaining → badge inferensi (Mamalia, Karnivora, dll.) ditampilkan di `ResultCard.tsx`
5. **Quiz** — `solveQuizCSP()` menghasilkan 5 soal dengan 4 distractors per soal → `QuizGame.tsx`
6. **Planner** — `generatePlan()` di `HomeTab` / `ProfileTab` menampilkan card "Langkah Belajar Berikut"
7. **Achievement** — Achievement unlock sebagai feedback loop

**Integrasi Nyata:** Semua modul terpanggil di flow nyata aplikasi — bukan file mati.

---

## Slide 3 — CSP (Constraint Satisfaction Problem)

**File:** `src/lib/ai/csp.ts`

**Formalisasi CSP:**

```
V  = {Q₁, Q₂, Q₃, Q₄, Q₅}           (5 slot pertanyaan per sesi quiz)
D_Qi = historyObjects ∪ DEFAULT_OBJECT_POOL  (domain ≥ 3 objek per slot)
C  = {
  C₁: ∀i≠j → Qi.objek ≠ Qj.objek                    (unik — tidak ada objek kembar)
  C₂: ∀i(1..4) → Qi.kategori ≠ Q(i+1).kategori      (kategori tidak berurutan sama)
  C₃: ∀i(1..4) → Qi.difficulty ≤ Q(i+1).difficulty  (kesulitan non-decreasing)
  C₄: distractors ⊆ (D \ {Qi.name}) ∧ |distractors| = 4  (4 pengecoh valid)
  C₅: distractors[i] ≠ distractors[j]                (pengecoh unik)
  C₆: prioritaskan distractor kategori = Qi.category (pengecoh kategori sama)
}
```

**DEFAULT_OBJECT_POOL:** 15 objek umum (10 difficulty-1: Cat, Dog, Fish, Bird, Apple, Banana, Carrot, Milk, Ball, Doll; 5 difficulty-2: Car, Airplane, Bicycle, Sun, Tree)

**Algoritma — Backtracking + MRV + Forward Checking:**
1. `mergeAndDeduplicate()` — Gabung history + default pool, deduplikasi by name
2. `selectUnassignedVariable()` — **MRV heuristic:** pilih slot dengan domain paling sedikit
3. `isConsistent()` — Cek C₁ (unik), C₂ (kategori), C₃ (difficulty)
4. `forwardCheck()` — Setelah assign, prune domain slot lain yang langgar C₂/C₃
5. `backtrack()` — Rekursif; restore domain kalau gagal
6. `generateDistractors()` — Filter same-category dulu, lalu other-category (C₄–C₆)
7. Return `{ slots: QuizSlot[], solutionFound: boolean }`

**Fungsi Publik:**
- `solveQuizCSP(historyObjects, quizCount?)` → `CSPResult`
- `getDifficulty(category, name)` → `number` (1–5 deterministik)
- `generateDistractors(correctObject, allObjects, count)` → `string[]`

**Q&A — "Kenapa Backtracking?"**
- Jumlah variabel kecil (5 slot) → exhaustive search dengan pruning sudah cukup
- MRV mempercepat konvergensi dengan meminimalkan branching factor
- Forward checking menghindari dead end lebih awal
- Tidak perlu algoritma kompleks (AC-3, FC-MRV sudah optimal) karena n kecil
- Kompleksitas kasus terburuk O(d^n) = O(15^5) ~ 759k, tapi dengan pruning efektif hanya mengeksplorasi < 100 node per sesi

---

## Slide 4 — Knowledge Base & Forward Chaining

**File:** `src/lib/ai/knowledgeBase.ts`

**Struktur Representasi Pengetahuan:**

| Komponen | Detail |
|----------|--------|
| **Objek** | 30 objek (10 hewan, 6 makanan, 6 kendaraan, 6 alam, 2 mainan) |
| **Fakta** | 128+ fakta dalam database |
| **Aturan** | 12 aturan inferensi (audited — tidak ada konflik) |
| **Predikat** | 7 predikat: `isA`, `hasProperty`, `canDo`, `livesIn`, `hasColor`, `hasSound`, `hasDiet` |
| **Multi-bahasa** | `LANGUAGE_ALIASES` — 48 mapping en→id, 30 mapping zh→id |
| **Attribute Map** | `ATTRIBUTE_TO_FACTS` — 25+ atribut AI vision → fakta seed |
| **Category Map** | `CATEGORY_FACT_MAP` — 17 kategori UI → fakta seed |
| **Inference Labels** | `INFERENCE_LABELS` — 11 label inferensi dalam 3 bahasa + emoji |

**12 Aturan (dengan contoh derivasi):**

| Aturan | Antecedent | Consequent | Contoh |
|--------|-----------|------------|--------|
| mamalia | `isA(X,hewan) ∧ hasProperty(X,berbulu_halus)` | `isA(X,mamalia)` | Kucing → Mamalia |
| unggas | `isA(X,hewan) ∧ hasProperty(X,berbulu_tebal) ∧ canDo(X,bertelur)` | `isA(X,unggas)` | Burung → Unggas |
| ikan | `isA(X,hewan) ∧ hasProperty(X,bersisik) ∧ livesIn(X,air)` | `isA(X,ikan)` | Ikan → Ikan |
| karnivora | `isA(X,hewan) ∧ hasDiet(X,daging)` | `hasProperty(X,karnivora)` | Kucing → Karnivora |
| herbivora | `isA(X,hewan) ∧ hasDiet(X,tumbuhan)` | `hasProperty(X,herbivora)` | Gajah → Herbivora |
| bergerak | `isA(X,hewan)` | `canDo(X,bergerak)` | Semua hewan |
| bersuara | `isA(X,hewan)` | `canDo(X,bersuara)` | Semua hewan |
| kendaraan_darat | `isA(X,kendaraan) ∧ hasProperty(X,beroda)` | `canDo(X,berjalan_di_darat)` | Mobil |
| kendaraan_terbang | `isA(X,kendaraan) ∧ hasProperty(X,bersayap)` | `canDo(X,terbang)` | Pesawat |
| makanan_sehat | `isA(X,makanan) ∧ hasProperty(X,alami)` | `hasProperty(X,sehat)` | Pisang |
| tumbuhan_hijau | `isA(X,tumbuhan)` | `hasColor(X,hijau)` | Pohon |
| alam_bersinar | `isA(X,alam) ∧ hasProperty(X,bersinar)` | `canDo(X,memberi_cahaya)` | Matahari |

**Algoritma Forward Chaining:**

```
forwardChain(knownFacts, rules, maxIterations=10):
  workingSet = knownFacts ∪ newFacts
  ulang sampai tidak ada fakta baru ATAU iterasi >= 10:
    untuk setiap rule:
      untuk setiap objek di workingSet:
        coba unifikasi variabel X → objek
        jika semua antecedent cocok DAN consequent belum ada:
          tambahkan consequent ke workingSet
          catat derivasi
  return { newFacts, derivations }
```

**Fungsi Publik:**
- `createKnowledgeBase()` → `{ facts: Fact[], rules: Rule[] }`
- `forwardChain(knownFacts, rules, maxIterations)` → `InferenceResult`
- `inferFromObject(objectName, category, attributes, language, kb)` → `InferredTag[]`
- `normalizeObjectName(name, lang)` → string kanonik Bahasa Indonesia
- `validateKnowledgeBase(kb)` → `string[]` (error list; kosong = valid)

**Integrasi UI:** `inferFromObject()` dipanggil di `/api/identify/route.ts` → badge inferensi di `ResultCard.tsx` dengan tooltip derivasi, misalnya:
> 🐈 Kucing — [🦁 Mamalia] [🥩 Karnivora] [🐾 Bisa bergerak] [🗣️ Bersuara]
> Tooltip: "kucing: Hewan berbulu halus adalah mamalia"

**Q&A — "Kenapa Forward Chaining?"**
- Data-driven: fakta baru datang dari AI vision setiap scan → cocok untuk forward chaining (reasoning dari fakta ke kesimpulan)
- Backward chaining lebih cocok untuk goal-driven questioning ("apa bukti X?"), sementara kita punya data observasi langsung
- Forward chaining menghasilkan semua kemungkinan inferensi sekaligus → langsung ditampilkan ke user sebagai badge
- Jumlah aturan kecil (12) → kompleksitas O(rules × objects × iterations) = O(12×30×10) = 3600 operasi — sangat cepat

---

## Slide 5 — Classical Planning

**File:** `src/lib/ai/planner.ts`

**Formalisasi:**

```
State  = { discoveredObjects: string[], categoriesSeen: string[], 
           quizCompleted: boolean, puzzleCompleted: boolean, 
           listenScore: number, chatCount: number }

S₀     = discoveredObjects=[], categoriesSeen=[], 
         quizCompleted=false, puzzleCompleted=false, 
         listenScore=0, chatCount=0

Goal G:
  discoveredObjects.length ≥ 5 ∧
  {Animals, Food, Nature} ⊆ categoriesSeen ∧
  quizCompleted = true ∧
  puzzleCompleted = true ∧
  listenScore ≥ 2
```

**9 Action — Precondition & Effect:**

| Action | Precondition | Effect |
|--------|-------------|--------|
| `scan_first_object` | `discovered.length === 0` | `discovered +1` |
| `scan_animal` | `discovered > 0 ∧ Animals ∉ categories` | `discovered +1, Animals + categories` |
| `scan_food` | `discovered > 0 ∧ Food ∉ categories` | `discovered +1, Food + categories` |
| `scan_nature` | `discovered > 0 ∧ Nature ∉ categories` | `discovered +1, Nature + categories` |
| `discover_more` | `discovered > 0 ∧ discovered < 5` | `discovered +1` |
| `take_quiz` | `discovered ≥ 3 ∧ quizCompleted=false` | `quizCompleted=true` |
| `solve_puzzle` | `discovered ≥ 1 ∧ puzzleCompleted=false` | `puzzleCompleted=true` |
| `listen_game` | `discovered ≥ 3` | `listenScore +1` |
| `chat_with_ai` | `discovered ≥ 1` | `chatCount +1` |

**Algoritma — Forward Search + Goal Proximity Heuristic:**

```
generatePlan(state, goal, actions, MAX_STEPS=20):
  steps = [], current = state, visited = {}
  while not isGoalReached(current, goal) AND steps.length < MAX_STEPS:
    visited.add(hashState(current))
    applicable = actions where precondition(current) AND hash(effect(current)) not visited
    
    if applicable empty: break  // dead end
    
    // Heuristic: pilih action dengan goalProximityDelta tertinggi
    // goalProximityDelta menghitung jumlah sub-goal yang false→true
    // Sub-goal: (1) discovered≥5, (2-4) 3 kategori baru, (5) quiz, (6) puzzle, (7) listenScore≥2
    // Max delta = 7
    bestAction = argmax(applicable, a => goalProximityDelta(current, a.effect(current), goal))
    
    steps.push(bestAction)
    current = bestAction.effect(current)
  
  return steps
```

**Fungsi Publik:**
- `createDefaultActions()` → `PlanningAction[]` (9 actions)
- `createDefaultGoal()` → `Goal` (5 objek, 3 kategori, quiz, puzzle, listen≥2)
- `isGoalReached(state, goal)` → `boolean`
- `goalProximityDelta(current, next, goal)` → `number` (0–7)
- `generatePlan(state, goal, actions)` → `PlanStep[]`

**Integrasi UI:** `generatePlan()` dipanggil di `agent.ts` → `displayNextSteps` (3 langkah pertama) → card "🎯 Langkah Belajar Berikut" di `HomeTab.tsx` dan `ProfileTab.tsx`. Setiap langkah bisa diklik → navigasi ke tab terkait. Planner di-run ulang setiap state berubah.

**Q&A — "Apa yang terjadi kalau goal tidak reachable?"**
- Jika `applicable` kosong sebelum goal tercapai, loop `break` dan mengembalikan plan parsial
- `MAX_PLAN_STEPS = 20` mencegah infinite loop (safety net)
- `visited` set mencegah siklus: state yang sama tidak dikunjungi dua kali
- UI tetap menampilkan langkah yang sudah ada (partial plan) sebagai rekomendasi
- Skenario unreachable: jika user sudah menyelesaikan quiz tapi belum scan 5 objek → planner akan rekomendasikan scan lebih lanjut. Jika tidak ada action applicable sama sekali (misal semua action precondition gagal), plan kosong dikembalikan

---

## Slide 6 — Agent Architecture

**File:** `src/lib/ai/agent.ts`

**Tipe Agen:** Goal-Based Agent with Utility Heuristic (stateless)

**Diagram Arsitektur:**

```
┌─────────────────────────────────────────────────────────┐
│                    👁️ PERCEPTION                         │
│  Camera/Upload → AI Vision API (GLM-4V-Flash)           │
│  Chat Input / Button Click → PerceptionInput             │
│  Fungsi: perceive(input: PerceptionInput)                 │
│    → extract { objName, category, attributes }           │
└────────────────────────────────┬────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────┐
│                    🧠 REASONING                          │
│  Fungsi: reason(perception, state, language, history)    │
│                                                          │
│  1. Knowledge Base (forward chaining)                    │
│     └─ inferFromObject() → InferredTag[]                 │
│                                                          │
│  2. CSP Quiz Generator                                   │
│     └─ solveQuizCSP() → QuizSlot[] (jika ≥3 objek)       │
│                                                          │
│  3. Classical Planner                                    │
│     └─ generatePlan() → PlanStep[] (selalu jalan)        │
└────────────────────────────────┬────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────┐
│                    🎯 ACTION                             │
│  Fungsi: act(decision, state, perception)                 │
│    → ActuatorCommands {                                   │
│        displayNextSteps: PlanStep[0..2]  (3 langkah)     │
│        inferredTags: InferredTag[]                        │
│        quizStructure?: CSPResult                          │
│      }                                                    │
│                                                          │
│  Output dikonsumsi oleh:                                  │
│    - QuizGame UI (quizStructure)                          │
│    - Next Step Card (displayNextSteps)                    │
│    - ResultCard badges (inferredTags)                     │
│    - Achievement Unlock                                   │
│    - SpeechSynthesis TTS                                  │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
                    User Learning Progress
                              │
                              └─── feedback loop ──→ REASON (ulang)
```

**Siklus `runCycle()`:**

```typescript
function runCycle(currentState, input, historyObjects, language): AgentOutput {
  // 1. PERCEIVE — ekstrak data sensor
  const perception = perceive(input);

  // 2. State update berdasarkan tipe input
  const updatedState = updateState(currentState, input);

  // 3. REASON — KB + CSP + Planner
  const decision = reason(perception, updatedState, language, historyObjects);

  // 4. ACT — konversi ke actuator commands
  const commands = act(decision, updatedState, perception);

  return { newState: updatedState, commands };
}
```

**5 Tipe Input (`PerceptionInput.type`):**
`'scan_complete' | 'quiz_complete' | 'puzzle_complete' | 'listen_complete' | 'chat_sent' | 'app_launch'`

**Stateless Design:**
- Agen tidak menyimpan state internal — state diterima dari luar (React state / DB)
- Setiap panggilan `runCycle()` adalah siklus independen
- Keuntungan: mudah di-scale (horizontal), mudah di-test (pure function), tidak ada hidden state

---

## Slide 7 — Simulasi Kasus: Ani Scan Kucing

**Skenario:** Ani (user baru) membuka aplikasi, scan gambar kucing.

**Langkah-langkah:**

| # | Komponen | Proses |
|---|----------|--------|
| 1 | **Perception** | Camera capture → `/api/identify` → GLM-4V-Flash return `{name: "kucing", category: "Animals", attributes: ["furry", "meows", "has_tail"]}` |
| 2 | **Agent: perceive** | `perceive({type: 'scan_complete', objectName: 'kucing', objectCategory: 'Animals', attributes: ['furry','meows','has_tail']})` → `{objName:'kucing', category:'Animals', attributes:['furry','meows','has_tail']}` |
| 3 | **Agent: reason → KB** | `inferFromObject('kucing', 'Animals', ['furry','meows','has_tail'], 'id', kb)` — Seed facts dari AI vision: `isA(kucing,hewan)`, `hasProperty(kucing,berbulu_halus)`, `hasSound(kucing,mengeong)`, `hasProperty(kucing,berekor)` + 5 existing KB facts → Forward chaining menghasilkan 4 inferensi: **Mamalia** (🦁), **Karnivora** (🥩), **Bisa bergerak** (🐾), **Bersuara** (🗣️) |
| 4 | **Agent: reason → Planner** | `generatePlan({discovered:['kucing'], categoriesSeen:['Animals'], ...}, goal, actions)` → Plan: 1. scan_food 2. scan_nature 3. discover_more 4. take_quiz 5. solve_puzzle 6. listen_game 7. listen_game |
| 5 | **Agent: act** | `act()` → `commands = { displayNextSteps: [📷 Scan Food, 🌿 Scan Nature, 🔍 Discover More], inferredTags: [🦁Mamalia,🥩Karnivora,...] }` → UI update: badge di ResultCard + card rekomendasi di HomeTab |

**State Setelah Siklus:**
```
{
  discoveredObjects: ['kucing'],
  categoriesSeen: ['Animals'],
  quizCompleted: false,
  puzzleCompleted: false,
  listenScore: 0,
  chatCount: 0
}
```

**Visual Badge di ResultCard:**
```
🐈 Kucing
[🦁 Mamalia] [🥩 Karnivora] [🐾 Bisa bergerak] [🗣️ Bersuara]
```

---

## Slide 8 — Antisipasi Pertanyaan

| Pertanyaan | Jawaban |
|-----------|---------|
| **CSP: Kenapa backtracking bukan brute force?** | Brute force = coba semua 15^5 = 759k kombinasi. Backtracking hanya eksplorasi < 100 node karena (a) MRV pilih slot tersempit dulu, (b) forward checking prune domain sebelum rekursi, (c) constraint C1–C3 sangat ketat. |
| **CSP: Kenapa tidak pakai algoritma lain (AC-3, genetic)?** | n = 5 kecil. AC-3 overhead untuk arc consistency tidak justified. Genetic algorithm overkill — butuh populasi, crossover, mutasi untuk problem yang bisa diselesaikan dalam < 1ms dengan backtracking. |
| **KB: Forward vs backward chaining — kenapa forward?** | Forward chaining = data-driven. Setiap scan menghasilkan fakta baru dari AI vision → kita ingin semua kesimpulan dari data itu. Backward chaining = goal-driven ("buktikan bahwa kucing mamalia") — lebih cocok untuk sistem expert dengan query spesifik. Di sini kita butuh semua badge sekaligus. |
| **KB: Validasi aturan — bagaimana cek konflik?** | `validateKnowledgeBase()` menjalankan 4 cek: (1) tiap aturan punya minimal 1 objek yang match, (2) predikat valid, (3) fakta memiliki ≥2 argumen, (4) ID aturan unik. Di development, semua aturan sudah diaudit: `berbulu_halus` vs `berbulu_tebal` disjoint → tidak ada objek yang bisa diinfer sebagai mamalia sekaligus unggas. |
| **Planner: Goal-based vs utility-based?** | Goal-based: goal didefinisikan eksplisit (5 objek, 3 kategori, quiz, puzzle, listen≥2). Utility-based: fungsi utility untuk setiap state. Goal-based lebih cocok karena goal belajar anak terdefinisi jelas. Namun heuristic `goalProximityDelta` adalah elemen utility: mengukur seberapa dekat suatu action membawa state ke goal. Jadi ini hybrid goal-based + utility heuristic. |
| **Agent: Stateless — apa keuntungan?** | (1) **Scalability**: agen bisa dijalankan di serverless functions tanpa session state. (2) **Testability**: `runCycle()` adalah pure function — input sama → output sama. (3) **Simplicity**: tidak ada hidden state, bug lebih mudah dilacak. (4) **Resilience**: crash → restart tanpa kehilangan state karena state disimpan di DB/React state. |
| **Agent: Stateless — apa tradeoff?** | Tidak bisa menyimpan konteks antar siklus (misal, "user sudah melihat rekomendasi ini 3 kali"). Tapi tradeoff ini acceptable karena konteks jangka panjang bisa disimpan di database dan dimasukkan ke state input. |

---

## Slide 9 — Kesimpulan

**Perjalanan UTS → UAS:**

```
UTS (Subsymbolic AI):
  └─ AI Vision (GLM-4V-Flash) — neural network untuk identifikasi objek
  └─ Image processing, classification

UAS (Symbolic AI — Modul Baru):
  ├─ CSP — Constraint satisfaction untuk generate quiz (backtracking + MRV + FC)
  ├─ Knowledge Base — Representasi pengetahuan (7 predikat, 128+ fakta, 12 aturan)
  ├─ Forward Chaining — Inference engine data-driven (max 10 iterasi)
  ├─ Classical Planning — Learning path planner (forward search + goal proximity heuristic)
  └─ Goal-Based Agent — Siklus perceive → reason → act (stateless)

Terintegrasi penuh ke aplikasi nyata — bukan file mati.
```

**4 Modul Terintegrasi:**

| Modul | AI Concept | File | Dipanggil Dari |
|-------|-----------|------|----------------|
| **CSP** | Constraint Satisfaction (Backtracking + MRV + Forward Checking) | `src/lib/ai/csp.ts` | `/api/quiz/generate/route.ts` |
| **Knowledge Base** | Representasi Pengetahuan + Forward Chaining | `src/lib/ai/knowledgeBase.ts` | `/api/identify/route.ts` |
| **Classical Planning** | Forward Search + Goal Proximity Heuristic | `src/lib/ai/planner.ts` | `agent.ts`, `HomeTab.tsx`, `ProfileTab.tsx` |
| **Agent Architecture** | Goal-Based Agent (stateless, perceive→reason→act) | `src/lib/ai/agent.ts` | `app/page.tsx` |

**Dokumentasi Lengkap:**
- Design spec: `docs/superpowers/specs/2026-07-09-whats-this-ai-modules-design.md`
- Source code: `src/lib/ai/` (6 file: `types.ts`, `knowledgeBase.ts`, `csp.ts`, `planner.ts`, `agent.ts`, `index.ts`)
- Test: `src/lib/ai/knowledgeBase.test.ts`

---

*Terima kasih — Sesi Tanya Jawab*
