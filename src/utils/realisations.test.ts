import { describe, expect, it } from 'vitest';
import { EMPLACEMENT, parseRealisations, versImagesGalerie } from './realisations';

const presents = new Set(['cuisine-ilot.jpg', 'dressing-chene.webp']);

describe('parseRealisations', () => {
  it('accepte une liste valide et garde son ordre', () => {
    const photos = parseRealisations(
      {
        photos: [
          { fichier: 'dressing-chene.webp', legende: 'Dressing en chêne', categorie: 'dressing' },
          { fichier: 'cuisine-ilot.jpg', legende: 'Cuisine avec îlot', categorie: 'cuisine' },
        ],
      },
      presents
    );
    expect(photos.map((p) => p.fichier)).toEqual(['dressing-chene.webp', 'cuisine-ilot.jpg']);
  });

  it('accepte une liste vide', () => {
    expect(parseRealisations({ photos: [] }, presents)).toEqual([]);
  });

  it('nomme le fichier listé mais absent du dossier', () => {
    expect(() =>
      parseRealisations({ photos: [{ fichier: 'absente.jpg', legende: 'Cuisine', categorie: 'cuisine' }] }, presents)
    ).toThrow(/absente\.jpg/);
  });

  it('refuse une catégorie inconnue', () => {
    expect(() =>
      parseRealisations({ photos: [{ fichier: 'cuisine-ilot.jpg', legende: 'Salon', categorie: 'salon' }] }, presents)
    ).toThrow(/categorie/);
  });

  it('refuse un nom de fichier avec espace ou majuscule', () => {
    expect(() =>
      parseRealisations({ photos: [{ fichier: 'Ma Cuisine.jpg', legende: 'Cuisine', categorie: 'cuisine' }] }, presents)
    ).toThrow(/fichier/);
  });

  it('refuse un doublon', () => {
    const p = { fichier: 'cuisine-ilot.jpg', legende: 'Cuisine', categorie: 'cuisine' };
    expect(() => parseRealisations({ photos: [p, p] }, presents)).toThrow(/doublon.*cuisine-ilot\.jpg/);
  });
});

describe('versImagesGalerie', () => {
  it('transforme chaque photo en image de galerie avec texte alternatif', () => {
    const [image] = versImagesGalerie([
      { fichier: 'cuisine-ilot.jpg', legende: 'Cuisine avec îlot', categorie: 'cuisine' },
    ]);
    expect(image).toEqual({
      src: '~/assets/images/realisations/cuisine-ilot.jpg',
      alt: 'Cuisine avec îlot',
      caption: 'Cuisine avec îlot',
    });
  });

  it('montre des emplacements « photo à venir » quand la liste est vide', () => {
    const images = versImagesGalerie([], 6);
    expect(images).toHaveLength(6);
    expect(images.every((i) => i.src.endsWith(EMPLACEMENT) && i.alt === 'Photo à venir')).toBe(true);
  });
});
