// cat experience.md
// a company with one role shows it under the name; several roles get sub headings.
// more is the list behind the [+] more toggle.
export type Role = {
  title: string;
  dates: string;
  // one paragraph, or several shown one after another.
  summary?: string | string[];
  // always visible dash list under the summary.
  points?: string[];
  stack?: string[];
  more?: string[];
  // gallery behind [+] photos, keyed by path inside photos/experience/.
  photos?: Record<string, string>;
  // start expanded.
  open?: boolean;
};

export type Company = {
  name: string;
  // line under the company name, e.g. "two internships, 2024 to 2025".
  note?: string;
  roles: Role[];
};

export const experience: Company[] = [
  {
    name: 'Google',
    roles: [
      {
        title: 'Software Engineer II (L3)',
        dates: 'Incoming',
        summary: 'Core, Bay Area',
      },
      {
        title: 'Software Engineer Intern',
        dates: 'May to Aug 2026',
        summary: [
          'Core, Irvine',
          "Built a self-optimizing lifecycle for Gems, custom data analysis agents, that writes their instructions from data assets and keeps refining them from feedback.",
        ],
        stack: ['TypeScript', 'Angular', 'C++', 'Python'],
        more: [
          'Built a backend generator agent that writes tailored system instructions from data assets (tables, dashboards), turning Gem setup into one click, about 15x faster than writing instructions by hand.',
          'Added a user-triggered mid-chat instruction refresh that analyzes the full chat history and surfaces proposed changes in a side-by-side diff viewer for approval.',
          'Architected a feedback loop where a background agent proposes updates from user feedback and corrections as the chat progresses, scoped to the most recent messages for about 10x lower cost per update.',
          'Wrote it in 3,000+ lines of TypeScript and C++.',
        ],
        photos: {
          'google/01.jpg': 'riding the wave',
          'google/02.jpg': 'THE intern hat',
        },
      },
    ],
  },
  {
    name: 'Minerva University',
    roles: [
      {
        title: 'Technical Interview Prep Instructor',
        dates: 'Sep 2026 to present',
        summary:
          'Running mock technical interviews and giving actionable feedback to students across 4 cohorts.',
        more: [
          'Conducting mock DSA, OOP, and System Design interviews in different languages (e.g., Python, C++, Java, etc.).',
          'Giving feedback on problem solving, communication, and code quality.',
          'Guiding students on interview preparation strategy.',
        ],
      },
    ],
  },
];

// older roles in one paragraph. empty string hides it.
export const earlier =
  'Robotics research at Universidad Abierta Interamericana in Buenos Aires, building 3D printed robots with IoT sensors and AI chatbots. Software engineering at UNIPORT in Seoul, where a new React flow cut the Alien Residency Card application from 30 days to 5 minutes. Mobile development at Andgreen in Taipei, building an iOS app in React Native before launch. AI in education research at Minerva University.';
