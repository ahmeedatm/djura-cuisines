export type Adresse = {
  readonly rue: string;
  readonly quartier: string;
  readonly codePostal: string;
  readonly ville: string;
  readonly pays: string;
};

export const ENTREPRISE = {
  nom: 'Djura Cuisines',
  nomTifinagh: 'ⴷⵊⵓⵔⴰ ⵜⵉⴽⵓⵣⵉⵏⵉⵏ',
  accroche: 'Cuisines équipées et dressings sur mesure à Tizi Ouzou',
  telephone: '+213776312821',
  telephoneAffiche: '+213 776 31 28 21',
  messageDevis: 'Bonjour, je souhaite un devis pour une cuisine / un dressing.',
  facebook: 'https://www.facebook.com/Djuracuisines/',
  adresse: {
    rue: 'Local N°03, Rue Rahli Messaoud',
    quartier: "M'Douha",
    codePostal: '15000',
    ville: 'Tizi Ouzou',
    pays: 'Algérie',
  },
  horaires: {
    texte: 'Du dimanche au jeudi, 9h-17h',
    fermeture: 'Fermé le vendredi et le samedi',
    joursSchema: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
    ouvre: '09:00',
    ferme: '17:00',
  },
} as const satisfies { adresse: Adresse } & Record<string, unknown>;
