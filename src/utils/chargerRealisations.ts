import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import type { GalleryImage } from '~/types';
import { parseRealisations, versImagesGalerie } from './realisations';

const RACINE = process.cwd();
const FICHIER_YAML = path.join(RACINE, 'src/data/realisations.yaml');
const DOSSIER = path.join(RACINE, 'src/assets/images/realisations');

export const chargerRealisations = (): GalleryImage[] => {
  const brut = yaml.load(fs.readFileSync(FICHIER_YAML, 'utf8'));
  const presents = new Set(fs.readdirSync(DOSSIER));
  return versImagesGalerie(parseRealisations(brut, presents));
};
