// cat experience.md
// a company with one role shows it under the name; several roles get sub headings.
// more is the list behind the [+] more toggle.
export type Role = {
  title: string;
  dates: string;
  summary: string;
  stack?: string[];
  more?: string[];
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
    name: 'TODO',
    roles: [
      { title: 'TODO', dates: 'TODO', summary: 'TODO', stack: ['TODO'], more: ['TODO'] },
    ],
  },
  {
    name: 'TODO',
    note: 'TODO',
    roles: [
      { title: 'TODO', dates: 'TODO', summary: 'TODO', stack: ['TODO'], more: ['TODO'] },
      { title: 'TODO', dates: 'TODO', summary: 'TODO', stack: ['TODO'] },
    ],
  },
];

// older roles in one paragraph. empty string hides it.
export const earlier = 'TODO';
