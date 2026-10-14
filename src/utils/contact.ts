import type { Adresse } from '~/config/entreprise';

const chiffres = (telephone: string): string => telephone.replace(/\D/g, '');

export const whatsappUrl = (telephone: string, message: string): string => {
  const numero = chiffres(telephone);
  if (numero.length === 0) throw new Error(`numéro WhatsApp invalide : « ${telephone} »`);
  return `https://wa.me/${numero}?text=${encodeURIComponent(message)}`;
};

export const telUrl = (telephone: string): string => `tel:+${chiffres(telephone)}`;

export const adresseTexte = (a: Adresse): string => `${a.rue}, ${a.quartier}, ${a.codePostal} ${a.ville}, ${a.pays}`;

// encodeURIComponent laisse passer « ' » : on l'encode à la main pour ne pas casser l'attribut href.
export const itineraireUrl = (a: Adresse): string =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(adresseTexte(a)).replace(/'/g, '%27')}`;
