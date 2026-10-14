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
  socialLinks: [],
  footNote: '',
};
