# Mohamad Al‑Kahfi — Personal Portfolio (Astro)

Portfolio pribadi dibangun dengan Astro v5, Tailwind CSS v4, GSAP, dan Lenis. Fokus pada performa, aksesibilitas, pengalaman pengguna yang halus, serta transisi halaman yang modern.

## ✨ Fitur Utama

- Animasi halus: GSAP untuk animasi, Lenis untuk smooth scrolling.
- Transisi halaman: Astro View Transitions + curtain transition kustom.
- Pengalaman pertama kunjungan: page reveal + fullscreen curtain loader.
- UI komponen modular: `Hero`, `Skills Marquee`, `About Teaser`, `Footer` interaktif.
- Styling modern: Tailwind CSS v4 via plugin Vite (`@tailwindcss/vite`).
- SEO dasar: metadata terpusat melalui `src/config/site.ts` (title, description, og:image).

## 🗂️ Struktur Proyek

```text
/
├── public/                  # aset statis (ikon, gambar, font, CV)
├── src/
│   ├── components/          # komponen UI & sections
│   ├── config/              # konfigurasi situs (SITE)
│   ├── data/                # data pendukung (opsional)
│   ├── helpers/             # helper utilitas
│   ├── layouts/             # layout halaman (SiteLayout)
│   ├── lib/                 # library/utility internal
│   ├── pages/               # halaman: index, about, blog, works
│   ├── scripts/             # skrip animasi & interaksi (GSAP, dsb.)
│   ├── styles/              # stylesheet global (Tailwind v4)
│   └── types/               # tipe/definisi (TS)
├── astro.config.mjs         # konfigurasi Astro + Vite alias `@` → `src`
├── package.json             # dependency & skrip
├── tsconfig.json            # konfigurasi TypeScript
└── pnpm-lock.yaml           # lockfile pnpm
```

Halaman yang tersedia:
- `/` Beranda (Hero, Skills, About teaser)
- `/about` Tentang saya (orbit tech stack, "What Drives Me")
- `/blog` (placeholder)
- `/works` (placeholder)

## 🛠️ Teknologi

- Astro `^5.x`
- Tailwind CSS `^4.x` (via `@tailwindcss/vite`) — diimpor di `src/styles/global.css` dengan `@import "tailwindcss";`
- GSAP `3.x`
- Lenis `^1.x`

Alias path `@` ke `src` dikonfigurasi di `astro.config.mjs`.

## 🚀 Menjalankan Proyek

Prasyarat:
- Node.js 18+ (disarankan LTS)
- pnpm (disarankan)

Perintah umum (jalankan di root proyek):

| Perintah            | Deskripsi                                           |
| :------------------ | :-------------------------------------------------- |
| `pnpm install`      | Instal seluruh dependensi                           |
| `pnpm dev`          | Menjalankan server dev di `http://localhost:4321`  |
| `pnpm build`        | Build produksi ke folder `./dist/`                  |
| `pnpm preview`      | Preview hasil build secara lokal                    |
| `pnpm astro ...`    | Perintah CLI Astro (mis. `astro check`)             |

## 🧩 Catatan Implementasi

- Layout utama: `src/layouts/SiteLayout.astro` memuat font, SEO meta, View Transitions, custom cursor, dan skrip boot (reveal, smooth scroll, route curtain, dll.).
- Styling global: `src/styles/global.css` berisi deklarasi `@theme` Tailwind v4, font local, dan utilitas tambahan.
- Skrip interaksi: tersedia di `src/scripts/` (mis. `skills-marquee-gsap.ts`, `tech-orbit.ts`, `route-curtain-transition.ts`).
- Konfigurasi SEO: ubah `src/config/site.ts` untuk title/description/og:image/url.
- Aset publik: simpan gambar, ikon, dan font di `public/` (mis. `public/icons`, `public/images`, `public/fonts`).

## 🗺️ Roadmap Singkat

- Isi konten untuk halaman `Blog` dan `Works`.
- Tambahkan artikel dan proyek beserta gambar/preview.
- Evaluasi performa (Lighthouse) dan aksesibilitas.

## 📄 Lisensi

Belum ditentukan. Tambahkan lisensi jika diperlukan.

