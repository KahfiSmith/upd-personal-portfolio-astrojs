export type Work = {
  slug: string;
  title: string;
  description: string;
  year: string | number;
  tech: string[];
  url?: string;
};

const works: Work[] = [
  {
    slug: "portfolio-v1",
    title: "Portfolio v1",
    description: "Landing page cepat dengan animasi GSAP dan Astro.",
    year: 2024,
    tech: ["Astro", "Tailwind", "GSAP"],
  },
  {
    slug: "ui-library-experiments",
    title: "UI Library Experiments",
    description: "Eksperimen komponen UI aksesibel dan performan.",
    year: 2025,
    tech: ["React", "TypeScript", "Radix"],
  },
  {
    slug: "blog-setup",
    title: "Blog Setup",
    description: "Template blog ringan dengan md + list posting.",
    year: 2025,
    tech: ["Astro", "Markdown"],
  },
];

export default works;

