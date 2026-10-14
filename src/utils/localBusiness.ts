import { ENTREPRISE } from '~/config/entreprise';

const CODE_PAYS = 'DZ';

export const localBusinessSchema = (siteUrl: string): Record<string, unknown> => ({
  '@context': 'https://schema.org',
  '@type': 'HomeAndConstructionBusiness',
  name: ENTREPRISE.nom,
  description: ENTREPRISE.accroche,
  url: siteUrl,
  telephone: ENTREPRISE.telephone,
  address: {
    '@type': 'PostalAddress',
    streetAddress: `${ENTREPRISE.adresse.rue}, ${ENTREPRISE.adresse.quartier}`,
    addressLocality: ENTREPRISE.adresse.ville,
    postalCode: ENTREPRISE.adresse.codePostal,
    addressCountry: CODE_PAYS,
  },
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: [...ENTREPRISE.horaires.joursSchema],
    opens: ENTREPRISE.horaires.ouvre,
    closes: ENTREPRISE.horaires.ferme,
  },
  sameAs: [ENTREPRISE.facebook],
});
