import { existsSync } from 'node:fs';
import { site } from '../data/site';

// public/resume.pdf if present, else the fallback url.
export const resumeUrl = existsSync('public/resume.pdf') ? '/resume.pdf' : site.resumeFallback;
