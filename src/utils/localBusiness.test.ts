import { expect, it } from 'vitest';
import { localBusinessSchema } from './localBusiness';

it('décrit l’entreprise pour Google avec adresse, téléphone et horaires', () => {
  const s = localBusinessSchema('https://ahmeedatm.github.io/djura-cuisines/');
  expect(s['@type']).toBe('HomeAndConstructionBusiness');
  expect(s.name).toBe('Djura Cuisines');
  expect(s.telephone).toBe('+213776312821');
  expect(s.url).toBe('https://ahmeedatm.github.io/djura-cuisines/');
  expect(s.address).toMatchObject({ addressLocality: 'Tizi Ouzou', postalCode: '15000', addressCountry: 'DZ' });
  expect(s.openingHoursSpecification).toMatchObject({
    dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
    opens: '09:00',
    closes: '17:00',
  });
  expect(s.sameAs).toEqual(['https://www.facebook.com/Djuracuisines/']);
});
