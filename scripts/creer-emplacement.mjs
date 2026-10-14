// Génère l'image grise affichée tant que les vraies photos ne sont pas en place.
import sharp from 'sharp';

const LARGEUR = 1200;
const HAUTEUR = 900;
const texte = `<svg width="${LARGEUR}" height="${HAUTEUR}" xmlns="http://www.w3.org/2000/svg">
  <text x="50%" y="50%" font-family="sans-serif" font-size="56" fill="#78716c" text-anchor="middle">Photo à venir</text>
</svg>`;

await sharp({ create: { width: LARGEUR, height: HAUTEUR, channels: 3, background: '#e7e5e4' } })
  .composite([{ input: Buffer.from(texte) }])
  .webp({ quality: 70 })
  .toFile('src/assets/images/realisations/photo-a-venir.webp');
