// site wide text: intro, facts, links, photo row and interests.
export const site = {
  // browser tab and link preview text.
  title: 'Nuray Ganbarova',
  description: 'Engineer building across software and AI/ML. Incoming SWE at Google, CS and Arts & Humanities at Minerva.',

  // prompt reads user@host:~$
  user: 'nuray',
  host: 'nurayg.me',

  greeting: "hey, I'm Nuray Ganbarova",
  bio: 'I am an engineer building across software and AI/ML, from mobile and web apps to AI agents and computer vision. I have a rather investigative nature when it comes to learning: I like knowing the ins and outs of concepts and the answers to seemingly unnecessary "what if" questions. Once my investigation concludes 🕵🏻‍♀️, building is a breeze.',

  // label and value rows under the bio. a list value shows one item per line.
  facts: [
    {
      label: 'study',
      value: [
        'B.S. Computational Sciences (Concentrating in Artificial Intelligence), Minerva University [Graduating May 2027]',
        'B.A. Arts & Humanities (Concentrating in Arts & Literature), Minerva University [Graduating May 2027]',
      ],
    },
    { label: 'seeking', value: '2027 winter/spring internship, intriguing collaborations, full time positions' },
    { label: 'based', value: 'San Francisco' },
  ] as { label: string; value: string | string[] }[],

  email: 'nuray@uni.minerva.edu',

  // used when public/resume.pdf does not exist.
  resumeFallback: 'https://drive.google.com/file/d/1SkcaovW5nhk4B60NSK5f8MtPEXEZ6Vet/view?usp=sharing',

  links: [
    { label: 'github', url: 'https://github.com/ganbnuray' },
    { label: 'linkedin', url: 'https://www.linkedin.com/in/nuray-ganbarova/' },
  ],

  // photo row under whoami. photo is a file name in photos/hero/ without extension.
  hero: [
    { photo: '1', caption: 'night visits to the 8 priestesses of culture' },
    { photo: '2', caption: '10-hour hike in Patagonia' },
    { photo: '3', caption: 'calculating angles, missing anyway' },
    { photo: '4', caption: 'where everything started' },
  ],

  // cat interests.txt, one string per paragraph.
  interests: [
    "I like AI best when it helps professionals in other fields do their work better. That's why I am interested in entrepreneurship: building a startup means figuring out exactly where AI belongs in someone's work.",
    'Outside of tech, I read and write poems, enjoy seeing sculptures from all possible angles, and love discussing art markets.',
  ],
};
