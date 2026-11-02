// cat research/*.md. an empty list hides the section.
// photo is a file name in photos/research/ without extension; with a photo the entry
// uses the same layout as a project.
export type Research = {
  title: string;
  who?: string;
  summary: string;
  stack?: string[];
  links?: { label: string; url: string }[];
  photo?: string;
  caption?: string;
};

export const research: Research[] = [
  {
    title: "Capstone: Recognizing Junji Ito's Style with Deep Learning",
    who: 'with Prof. Patrick Watson, Sep 2026 to May 2027',
    summary:
      "A deep learning study of artistic style in manga, focused on Junji Ito. Pages from Ito's books and the Manga109 dataset go through Inception V3 with frozen ImageNet weights, the output of each block is averaged into a style signature for the page, and a small neural network classifies pages by artist, Ito vs. other, and genre, following Laubrock and Dubray (2018). To separate his drawing from the horror genre he is known for, I test the model on unseen books, on pages with the text painted out, block by block across the network, and on Cat Diary, his only comedy, after training on his horror alone.",
    stack: ['Python', 'PyTorch', 'Inception V3'],
    photo: 'capstone',
    caption: 'from manga page to Ito or other',
  },
  {
    title: 'ML Squat Analysis',
    who: 'with Prof. Alex Diamond, Jan to Apr 2026',
    summary:
      'A computer vision pipeline that reviews squat form from a short video. MediaPipe tracks 33 body points in every frame, and 12 biomechanical metrics, like knee and hip angles and torso lean, drive rep counting and phase labels. Each rep is then classified as correct or as one of five common mistakes, scored, and turned into coaching tips by an LLM. Training a Random Forest on a labeled dataset raised classification accuracy from 39% with rule based thresholds to 88%.',
    stack: ['Python', 'MediaPipe', 'OpenCV', 'scikit-learn', 'Anthropic API'],
    links: [
      { label: 'writeup', url: 'https://drive.google.com/file/d/1YZCHTJPOzMJdPRj40NeCsAIMPPwyRtCt/view?usp=sharing' },
    ],
    photo: 'squat-analysis',
    caption: 'rep 4 of 5, caught at the bottom',
  },
];
