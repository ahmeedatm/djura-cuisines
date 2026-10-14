import { describe, expect, it } from 'vitest';
import { adresseTexte, itineraireUrl, telUrl, whatsappUrl } from './contact';
import { ENTREPRISE } from '~/config/entreprise';

describe('whatsappUrl', () => {
  it('garde seulement les chiffres du numéro', () => {
    expect(whatsappUrl('+213 776 31 28 21', 'Bonjour')).toBe('https://wa.me/213776312821?text=Bonjour');
  });

  it('encode accents, slash et espaces du message', () => {
    const url = whatsappUrl(ENTREPRISE.telephone, ENTREPRISE.messageDevis);
    expect(url).toContain('https://wa.me/213776312821?text=');
    expect(decodeURIComponent(url.split('?text=')[1])).toBe(ENTREPRISE.messageDevis);
    expect(url.split('?text=')[1]).not.toMatch(/[ é/]/u);
  });

  it('refuse un numéro sans chiffres', () => {
    expect(() => whatsappUrl('abc', 'x')).toThrow(/numéro/);
  });
});

describe('telUrl', () => {
  it('garde le + et les chiffres', () => {
    expect(telUrl('+213 776 31 28 21')).toBe('tel:+213776312821');
  });
});

describe('adresse', () => {
  it('écrit l’adresse complète sur une ligne', () => {
    expect(adresseTexte(ENTREPRISE.adresse)).toBe("Local N°03, Rue Rahli Messaoud, M'Douha, 15000 Tizi Ouzou, Algérie");
  });

  it('encode l’apostrophe de M’Douha dans le lien d’itinéraire', () => {
    const url = itineraireUrl(ENTREPRISE.adresse);
    expect(url.startsWith('https://www.google.com/maps/search/?api=1&query=')).toBe(true);
    expect(url).not.toContain("'");
    expect(decodeURIComponent(url.split('query=')[1])).toBe(adresseTexte(ENTREPRISE.adresse));
  });
});
