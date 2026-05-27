# What's This?

> **Tugas Mata Kuliah Artificial Intelligence — Semester 4**

---

- Richie Hujaya (241110258)
- Anthony Louis (241110249)
- Trevan Edgard (241110265)
- Suryanata Yaptanto (241111143)

## 1. Ide Project

**"What's This?"** adalah aplikasi web edukasi interaktif untuk anak-anak yang memanfaatkan teknologi AI (Computer Vision & Browser Text-to-Speech) untuk membantu anak mengenali objek di sekitar mereka.

### Latar Belakang

Anak-anak secara alami memiliki rasa ingin tahu yang tinggi terhadap lingkungan sekitar. Mereka sering bertanya *"ini apa?"* saat melihat benda baru. Metode belajar konvensional seperti buku gambar dan kartu flash memiliki keterbatasan — kontennya statis, jumlah terbatas, dan tidak responsif terhadap rasa ingin tahu anak secara real-time.

### Solusi

Aplikasi ini mengubah proses belajar menjadi pengalaman yang dinamis:

```
Anak arahkan kamera ke benda → AI mengenali benda tersebut
→ App menjelaskan dengan bahasa anak-anak → Browser TTS membacakan penjelasan
→ Mini-game memperkuat pemahaman
```

Dengan pendekatan ini, anak bisa belajar dari **objek apa saja** kapan saja dan di mana saja, tanpa dibatasi oleh konten statis.

### Teknologi Utama

| Teknologi | Fungsi |
|---|---|
| Next.js 16 + TypeScript | Framework full-stack |
| Z-AI SDK (GLM-4.6V-Flash) | AI Vision untuk mengenali objek dari gambar |
| Z-AI SDK (GLM-4.5-Flash) | AI Chat untuk menjawab pertanyaan anak |
| Z-AI SDK (GLM-4.7-Flash) | AI generate soal kuis |
| Browser SpeechSynthesis | Text-to-Speech bawaan browser untuk membacakan penjelasan |
| Tailwind CSS 4 + shadcn/ui | UI/UX responsive dan ramah anak |
| Prisma + SQLite | Penyimpanan data user, riwayat, dan achievement |
| Framer Motion | Animasi agar app terasa hidup |
| @dnd-kit | Drag-and-drop untuk puzzle game |

---

## 2. Fitur-Fitur Penting

### Fitur Inti AI & Kamera

| No | Fitur | Deskripsi |
|---|---|---|
| 1 | **AI Object Recognition** | Menggunakan model GLM-4.6V-Flash (VLM) untuk mengenali objek dari foto. AI mengembalikan nama objek, emoji, deskripsi ramah anak, fakta menarik, dan kategori — semua dalam bahasa yang dipilih user. |
| 2 | **Real-Time Camera** | Integrasi kamera device via WebRTC. Menggunakan `getUserMedia()` dengan resolusi ideal 1280x720. |
| 3 | **Upload Gambar** | Alternatif saat kamera tidak tersedia, user bisa mengunggah gambar dari galeri perangkat via `<input type="file">`. |
| 4 | **Ganti Kamera (Depan/Belakang)** | Tombol toggle untuk berpindah antara kamera depan (`user`) dan belakang (`environment`) menggunakan `enumerateDevices()` untuk mendeteksi perangkat video. |
| 5 | **Rotasi Gambar** | Gambar hasil identifikasi bisa diputar per 90° menggunakan canvas transformation agar tampil dengan orientasi yang benar. Rotasi terjadi setelah identifikasi AI selesai. |
| 6 | **Text-to-Speech (Browser)** | Setiap objek yang berhasil dikenali otomatis dibacakan oleh Browser TTS (`window.speechSynthesis`). Menggunakan bahasa sesuai pilihan user (en-US, id-ID, zh-CN) dengan rate 0.85 dan pitch 1.1. |

### Fitur Autentikasi & User

| No | Fitur | Deskripsi |
|---|---|---|
| 7 | **Register & Login** | Sistem autentikasi berbasis cookie session. Password di-hash menggunakan bcryptjs dengan salt rounds 10. Session bertahan 30 hari. User bisa login pakai email atau username. |
| 8 | **Guest Mode** | User bisa langsung menggunakan aplikasi tanpa mendaftar. Riwayat dan achievement disimpan di localStorage, dan akan dipindahkan jika user memutuskan daftar nanti. |
| 9 | **Profil Pengguna** | User dapat mengubah nama tampilan, tema warna, dan bahasa. Semua preferensi tersimpan di database dan otomatis dimuat saat login. |
| 10 | **Pro Membership** | Simulasi upgrade ke akun Pro. Status isPro tersimpan di database dengan badge visual di profil. |

### Fitur Belajar & Game

| No | Fitur | Deskripsi |
|---|---|---|
| 11 | **Riwayat Discovery** | Setiap objek yang berhasil dikenali beserta gambar, nama, deskripsi, dan fakta menarik tersimpan di database. User bisa melihat hingga 50 penemuan terakhir, menghapus satu item, atau menghapus semua sekaligus. |
| 12 | **Listen & Identify Game** | Game dengar-dan-identifikasi: AI membacakan nama objek, lalu anak memilih gambar yang sesuai dari 4 opsi acak. Skor dilacak (benar/salah) dan jawaban benar memicu achievement `listen_master`. |
| 13 | **Quiz Challenge** | Kuis pilihan ganda yang menampilkan gambar objek dan 5 opsi jawaban (1 benar + 4 pengecoh). Pertanyaan digenerate oleh AI via `/api/quiz/generate` dengan sistem preloading/caching. Skor disimpan di database dan perfect score membuka achievement. |
| 14 | **Puzzle Game** | Gambar yang dipindai dipotong menjadi potongan 2x2 yang diacak. Anak menyusun potongan kembali dengan drag-and-drop `@dnd-kit`. Selesai dengan benar memicu feedback suara dan achievement. |
| 15 | **AI Chat Buddy** | Chatbot AI untuk anak-anak yang didukung model GLM-4.5-Flash. Mendukung percakapan multi-turn dengan mengingat riwayat chat, dan merespons sesuai bahasa yang dipilih. |

### Fitur Gamifikasi & Kustomisasi

| No | Fitur | Deskripsi |
|---|---|---|
| 16 | **Achievement System (9 Badge)** | Sistem pencapaian dengan 9 badge: First Discovery 🔍, Explorer 🧭 (5 scan), Scientist 🔬 (10 scan), Professor 🎓 (20 scan), Perfect Score 💯, Puzzle Master 🧩, Good Listener 👂, Chatty Kid 💬, dan Helper ⭐. Milestone scan (5, 10, 20 objek) dicek otomatis saat unlock achievement. |
| 17 | **Multi-Bahasa (3 Bahasa)** | Seluruh UI dan respons AI tersedia dalam 3 bahasa: English 🇬🇧, Bahasa Indonesia 🇮🇩, dan 简体中文 🇨🇳. Terdapat 140+ string yang diterjemahkan secara manual. History items menyimpan `nameOptions`, `descriptionOptions`, dan `funFactOptions` dalam bentuk JSON untuk memungkinkan switch bahasa tanpa re-identifikasi. |
| 18 | **6 Tema Warna** | Tersedia 6 tema gradient: Luminous Meadow 🌈, Coral Dreams 🌊, Whispering Woods 🌲, Golden Hour 🌅, Twilight Reverie 🌙, dan Sugar Paradise 🍬. Hanya 1 tema default gratis, 5 tema lainnya bersifat Pro. Pilihan tema tersimpan per pengguna di database. |
| 19 | **User Feedback** | User dapat memberikan rating bintang 1–5 beserta komentar opsional via `/api/feedback`. Mengirim feedback otomatis membuka achievement "Helper". |
| 20 | **Responsive Mobile-First** | Desain dibangun dengan pendekatan mobile-first menggunakan Tailwind CSS 4. Layout menyesuaikan dari HP ke desktop dengan animasi Framer Motion. |

---

## 3. Arsitektur API

| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| POST | `/api/auth/register` | Registrasi user baru dengan bcrypt | Tidak |
| POST | `/api/auth/login` | Login dengan email atau username | Tidak |
| POST | `/api/auth/logout` | Hapus cookie session | Tidak |
| GET | `/api/auth/me` | Cek user yang sedang login | Ya* |
| PUT | `/api/auth/update` | Update displayName, language, theme | Ya |
| POST | `/api/auth/upgrade` | Upgrade akun ke Pro | Ya |
| POST | `/api/identify` | Identifikasi objek dari gambar (VLM) | Ya |
| POST | `/api/chat` | AI chat dengan multi-turn support | Ya |
| GET/POST | `/api/achievements` | List achievement / Unlock achievement baru | Ya |
| POST | `/api/feedback` | Submit rating dan komentar | Ya |
| GET/POST/DELETE | `/api/history` | Lihat 50 riwayat terakhir / Simpan item baru / Hapus semua | Ya |
| DELETE | `/api/history/[id]` | Hapus satu item riwayat | Ya |
| POST | `/api/quiz` | Simpan skor quiz | Ya |
| POST | `/api/quiz/generate` | Generate pertanyaan quiz dari riwayat | Ya |

*Return 401 jika tidak terautentikasi.

---

## 4. Database Schema

Menggunakan Prisma ORM dengan SQLite. Terdiri dari 5 model:

- **User**: id, username (unique), email (unique), password (hashed), displayName, avatar, isPro, theme, language, createdAt, updatedAt
- **HistoryItem**: id, userId (FK), name, emoji, description, funFact, category, imageData, nameOptions (JSON), descriptionOptions (JSON), funFactOptions (JSON), createdAt
- **Achievement**: id, userId (FK), type, title, emoji, unlockedAt — unique constraint pada (userId, type)
- **Feedback**: id, userId (FK), rating (1-5), comment, createdAt
- **QuizScore**: id, userId (FK), score, total, createdAt

---

## 5. Struktur Project

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   ├── register/route.ts
│   │   │   ├── logout/route.ts
│   │   │   ├── me/route.ts
│   │   │   ├── update/route.ts
│   │   │   └── upgrade/route.ts
│   │   ├── identify/route.ts
│   │   ├── chat/route.ts
│   │   ├── achievements/route.ts
│   │   ├── feedback/route.ts
│   │   ├── history/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── quiz/
│   │   │   ├── route.ts
│   │   │   └── generate/route.ts
│   │   └── route.ts
│   ├── page.tsx
│   ├── layout.tsx
│   └── globals.css
├── lib/
│   ├── auth.ts
│   ├── db.ts
│   ├── i18n.ts
│   ├── themes.ts
│   ├── helpers.ts
│   ├── retry.ts
│   ├── zai-queue.ts
│   └── utils.ts
├── components/
│   ├── ui/            (shadcn/ui primitives)
│   ├── tabs/          (HomeTab, LearnTab, GamesTab, ChatTab, ProfileTab, QuizGame, PuzzleGame)
│   ├── Sidebar.tsx
│   ├── MobileTabBar.tsx
│   ├── Header.tsx
│   ├── CameraView.tsx
│   ├── AuthScreen.tsx
│   ├── ResultCard.tsx
│   ├── ResultCard_new.tsx
│   ├── SettingsDialog.tsx
│   ├── CelebrationOverlay.tsx
│   ├── Confetti.tsx
│   └── ThemePortal.tsx
├── hooks/
│   ├── use-mobile.ts
│   └── use-toast.ts
└── prisma/
    └── schema.prisma
```

---

## 6. Cara Menjalankan

### Prasyarat
- Node.js 18+
- SQLite (sudah termasuk via Prisma)

### Langkah Instalasi

1. Install dependensi:
```bash
npm install
```

2. Buat file `.env` di root directory:
```
DATABASE_URL="file:./db/custom.db"
Z_AI_API_KEY="your_api_key_here"
```

3. Push schema database:
```bash
npm run db:push
```

4. Jalankan development server:
```bash
npm run dev
```

Aplikasi akan tersedia di `http://localhost:3000`.

### Production Build

```bash
npm run build
npm run start
```

---

<div align="center">

*Dibuat menggunakan Next.js · TypeScript · Tailwind CSS 4 · Z-AI SDK · Prisma*

</div>
