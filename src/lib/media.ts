import { hasPublicFile } from './site';

type ImageModule = { default: ImageMetadata };

// Images in src/assets are optimized by Astro at build time. Videos live in public/media.
const headshotFiles = import.meta.glob<ImageModule>('../assets/headshot.{jpg,jpeg,png,webp,avif}', { eager: true });
const teaserImages = import.meta.glob<ImageModule>('../assets/teasers/*.{jpg,jpeg,png,webp,avif}', { eager: true });
const stripFiles = import.meta.glob<ImageModule>('../assets/strip/*.{jpg,jpeg,png,webp,avif}', { eager: true });

export type Teaser =
  | { kind: 'video'; sources: { src: string; type: string }[]; poster?: string }
  | { kind: 'image'; image: ImageMetadata }
  | { kind: 'none' };

// Browsers take the first source they can play, so the smallest encodes go first.
const VIDEO_SOURCES: [file: string, type: string][] = [
  ['teaser.av1.webm', 'video/webm; codecs="av01.0.05M.08"'],
  ['teaser.vp9.webm', 'video/webm; codecs="vp9"'],
  ['teaser.mp4', 'video/mp4'],
];

const baseName = (path: string): string => (path.split('/').pop() ?? '').replace(/\.[^.]+$/, '');

/** public/media/<id>/teaser.* wins; otherwise src/assets/teasers/<id>.* is used as a still. */
export function findTeaser(id: string): Teaser {
  const dir = `media/${id}`;
  const sources = VIDEO_SOURCES.filter(([file]) => hasPublicFile(`${dir}/${file}`)).map(([file, type]) => ({
    src: `/${dir}/${file}`,
    type,
  }));
  if (sources.length > 0) {
    const poster = ['poster.jpg', 'poster.webp', 'poster.png'].find((file) => hasPublicFile(`${dir}/${file}`));
    return { kind: 'video', sources, poster: poster ? `/${dir}/${poster}` : undefined };
  }
  const match = Object.entries(teaserImages).find(([path]) => baseName(path) === id);
  return match ? { kind: 'image', image: match[1].default } : { kind: 'none' };
}

export const headshot = (): ImageMetadata | undefined => Object.values(headshotFiles)[0]?.default;

/** Strip frames in file-name order (01.jpg, 02.jpg, ...). */
export const stripFrames = (): ImageMetadata[] =>
  Object.keys(stripFiles)
    .sort()
    .map((path) => stripFiles[path].default);
