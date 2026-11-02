// site wide text: intro, facts, links, photo row and interests.
export const site = {
  // browser tab and link preview text.
  title: 'TODO',
  description: 'TODO',

  // prompt reads user@host:~$
  user: 'guest',
  host: 'ganbnuray.github.io',

  greeting: 'TODO',
  bio: 'TODO',

  // label and value rows under the bio.
  facts: [
    { label: 'study', value: 'TODO' },
    { label: 'seeking', value: 'TODO' },
    { label: 'based', value: 'TODO' },
  ],

  email: 'TODO',

  // used when public/resume.pdf does not exist.
  resumeFallback: '',

  links: [
    { label: 'github', url: 'https://github.com/ganbnuray' },
    { label: 'linkedin', url: 'TODO' },
  ],

  // photo row under whoami. photo is a file name in photos/hero/ without extension.
  hero: [
    { photo: '1', caption: 'TODO' },
    { photo: '2', caption: 'TODO' },
    { photo: '3', caption: 'TODO' },
    { photo: '4', caption: 'TODO' },
  ],

  // cat interests.txt, one string per paragraph.
  interests: ['TODO'],
};
