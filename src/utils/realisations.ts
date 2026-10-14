import { z } from 'astro/zod';
import type { GalleryImage } from '~/types';

export const DOSSIER_REALISATIONS = '~/assets/images/realisations';
export const EMPLACEMENT = 'photo-a-venir.webp';
const EMPLACEMENTS_PAR_DEFAUT = 6;

const PhotoSchema = z.object({
  fichier: z.string().regex(/^[a-z0-9-]+\.(jpe?g|png|webp)$/, 'fichier : minuscules, chiffres et tirets seulement'),
  legende: z.string().min(3),
  categorie: z.enum(['cuisine', 'dressing']),
});
const RealisationsSchema = z.object({ photos: z.array(PhotoSchema) });

export type Photo = z.infer<typeof PhotoSchema>;

const doublons = (fichiers: readonly string[]): string[] => {
  const vus = new Set<string>();
  return fichiers.filter((f) => {
    const dejaVu = vus.has(f);
    vus.add(f);
    return dejaVu;
  });
};

export const parseRealisations = (brut: unknown, fichiersPresents: ReadonlySet<string>): Photo[] => {
  const resultat = RealisationsSchema.safeParse(brut);
  if (!resultat.success) {
    const details = resultat.error.issues.map((i) => `${i.path.join('.')} : ${i.message}`).join('\n');
    throw new Error(`realisations.yaml invalide :\n${details}`);
  }
  const photos = resultat.data.photos;
  const fichiers = photos.map((p) => p.fichier);
  const absents = fichiers.filter((f) => !fichiersPresents.has(f));
  if (absents.length > 0) throw new Error(`photos listées mais absentes du dossier : ${absents.join(', ')}`);
  const doubles = doublons(fichiers);
  if (doubles.length > 0) throw new Error(`doublon dans realisations.yaml : ${doubles.join(', ')}`);
  return photos;
};

export const versImagesGalerie = (photos: readonly Photo[], emplacements = EMPLACEMENTS_PAR_DEFAUT): GalleryImage[] =>
  photos.length > 0
    ? photos.map((p) => ({ src: `${DOSSIER_REALISATIONS}/${p.fichier}`, alt: p.legende, caption: p.legende }))
    : Array.from({ length: emplacements }, () => ({
        src: `${DOSSIER_REALISATIONS}/${EMPLACEMENT}`,
        alt: 'Photo à venir',
      }));
