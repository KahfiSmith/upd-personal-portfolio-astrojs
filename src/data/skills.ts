export type SkillGroup = { title: string; items: string[] };

const skills: SkillGroup[] = [
  { title: "Languages", items: ["JavaScript", "TypeScript", "HTML", "CSS"] },
  { title: "Frameworks", items: ["Astro", "React", "Next.js"] },
  { title: "Styling", items: ["Tailwind", "GSAP", "Framer Motion"] },
  { title: "Build Tools", items: ["Vite", "ESBuild", "PNPM"] },
  { title: "Quality", items: ["ESLint", "Prettier", "Lighthouse"] },
  { title: "Others", items: ["Git", "REST API", "A11y"] },
];

export default skills;

