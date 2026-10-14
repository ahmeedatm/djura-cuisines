"""Couche 2 : nettoyage par IA générative des photos choisies (désordre, lumière).

Les meubles ne doivent jamais changer. Clé lue dans OPENROUTER_API_KEY.
Reprenable : une photo déjà présente dans la sortie n'est pas repayée.
"""

import argparse
import base64
import binascii
import os
import re
import sys
from pathlib import Path

import httpx

MODELE = "google/gemini-3.1-flash-image"
URL = "https://openrouter.ai/api/v1/chat/completions"
COUT_UNITAIRE_ESTIME_USD = 0.012
DELAI_S = 180
_NUMERO = re.compile(r"\d{1,3}")

CONSIGNE = (
    "This is a real photo of a kitchen or wardrobe installed by a cabinet maker. "
    "Remove clutter only: fridge magnets, protective plastic film on doors, loose objects on worktops, "
    "cables, tools, cardboard and chairs that hide the furniture. Make the lighting soft, even and bright, "
    "like a professional interior photo, with accurate neutral white balance. "
    "Do not change the cabinets, their color, material, wood grain, handles, worktop, appliances, "
    "layout, proportions or the room. Do not add any object. Keep the same framing."
)


def estimer_cout(nb_images: int, cout_unitaire: float) -> float:
    return nb_images * cout_unitaire


def est_deja_traitee(dossier: Path, nom: str) -> bool:
    return (dossier / nom).exists()


def extraire_image(reponse_json: dict) -> bytes:
    try:
        url = reponse_json["choices"][0]["message"]["images"][0]["image_url"]["url"]
        return base64.b64decode(url.split(",", 1)[1])
    except (KeyError, IndexError, TypeError, AttributeError, binascii.Error) as erreur:
        raise ValueError(f"aucune image dans la réponse : {reponse_json!r:.300}") from erreur


def _nettoyer(client: httpx.Client, photo: Path) -> bytes:
    data_url = "data:image/jpeg;base64," + base64.b64encode(photo.read_bytes()).decode()
    corps = {
        "model": MODELE,
        "modalities": ["image", "text"],
        "messages": [
            {
                "role": "user",
                "content": [{"type": "text", "text": CONSIGNE}, {"type": "image_url", "image_url": {"url": data_url}}],
            }
        ],
    }
    reponse = client.post(URL, json=corps, timeout=DELAI_S)
    reponse.raise_for_status()
    return extraire_image(reponse.json())


def traiter(entree: Path, sortie: Path, numeros: list[str], plafond_usd: float) -> int:
    invalides = [n for n in numeros if not _NUMERO.fullmatch(n)]
    if invalides:
        print(f"numéros de photo invalides (1 à 3 chiffres attendus) : {invalides}", file=sys.stderr)
        return 2
    cle = os.environ.get("OPENROUTER_API_KEY")
    if not cle:
        print("OPENROUTER_API_KEY absente", file=sys.stderr)
        return 2
    sortie.mkdir(parents=True, exist_ok=True)
    a_faire = [f"{n}.jpg" for n in numeros if not est_deja_traitee(sortie, f"{n}.jpg")]
    cout = estimer_cout(len(a_faire), COUT_UNITAIRE_ESTIME_USD)
    print(f"{len(a_faire)} photo(s) à traiter, coût estimé {cout:.3f} $")
    if cout > plafond_usd:
        print(f"plafond de {plafond_usd:.2f} $ dépassé, rien n'est lancé", file=sys.stderr)
        return 3
    echecs = 0
    with httpx.Client(headers={"Authorization": f"Bearer {cle}"}) as client:
        for nom in a_faire:
            try:
                (sortie / nom).write_bytes(_nettoyer(client, entree / nom))
                print(f"ok {nom}")
            except (httpx.HTTPError, ValueError, OSError) as erreur:
                echecs += 1
                print(f"échec {nom} : {erreur}", file=sys.stderr)
    return 1 if echecs else 0


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("entree", type=Path)
    parser.add_argument("sortie", type=Path)
    parser.add_argument("--photos", required=True, help="numéros séparés par des virgules, ex. 08,19")
    parser.add_argument("--plafond-usd", type=float, default=1.0)
    args = parser.parse_args()
    sys.exit(traiter(args.entree, args.sortie, [n.strip() for n in args.photos.split(",")], args.plafond_usd))
