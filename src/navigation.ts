import { ENTREPRISE } from './config/entreprise';
import { getPermalink } from './utils/permalinks';

export const headerData = {
  links: [
    { text: 'Savoir-faire', href: getPermalink('/#savoir-faire') },
    { text: 'Réalisations', href: getPermalink('/#realisations') },
    { text: 'Étapes', href: getPermalink('/#etapes') },
    { text: 'Contact', href: getPermalink('/#contact') },
  ],
  actions: [],
};

export const footerData = {
  links: [],
  secondaryLinks: [],
  socialLinks: [{ ariaLabel: 'Facebook', icon: 'tabler:brand-facebook', href: ENTREPRISE.facebook }],
  footNote: `${ENTREPRISE.nom} · ${ENTREPRISE.adresse.quartier}, ${ENTREPRISE.adresse.ville}`,
};
