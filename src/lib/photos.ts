// collects images under photos/ at build time so astro can resize them.
// hero/<name>, projects/<id>/cover, projects/<id>/<file>, elsewhere/<slug>
const files = import.meta.glob<{ default: ImageMetadata }>(
  '../../photos/**/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP}',
  { eager: true },
);

const byPath = new Map<string, ImageMetadata>();
for (const [key, mod] of Object.entries(files)) {
  byPath.set(key.replace('../../photos/', ''), mod.default);
}

const stripExt = (p: string) => p.replace(/\.[^./]+$/, '');

// finds folder/name with or without an extension.
export function photo(path: string): ImageMetadata | undefined {
  if (byPath.has(path)) return byPath.get(path);
  const want = stripExt(path).toLowerCase();
  for (const [p, img] of byPath) if (stripExt(p).toLowerCase() === want) return img;
  return undefined;
}
