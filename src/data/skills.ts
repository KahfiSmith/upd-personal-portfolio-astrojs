export type Skill = {
  name: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  icon?: string; // optional icon path/name
};

export type SkillGroup = {
  group: string;
  items: Skill[];
};

export const skills: SkillGroup[] = [
  {
    group: 'Languages',
    items: [
      { name: 'HTML', level: 'expert' },
      { name: 'CSS', level: 'advanced' },
      { name: 'JavaScript', level: 'advanced' },
      { name: 'TypeScript', level: 'intermediate' },
    ],
  },
  {
    group: 'Frameworks',
    items: [
      { name: 'Astro', level: 'advanced' },
      { name: 'React', level: 'intermediate' },
      { name: 'Tailwind CSS', level: 'advanced' },
    ],
  },
  {
    group: 'Tools',
    items: [
      { name: 'Git', level: 'advanced' },
      { name: 'Vite', level: 'intermediate' },
      { name: 'PNPM', level: 'intermediate' },
    ],
  },
];

