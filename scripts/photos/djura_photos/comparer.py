"""Page avant/après pour valider les retouches photo par photo."""

import argparse
import html
import sys
from pathlib import Path

ETAPES = ("brut", "retouche", "ia")


def page_comparaison(paires: list[tuple[str, str, str]]) -> str:
    lignes = "".join(
        f"<section><h2>{html.escape(nom)}</h2><div class=duo>"
        f"<figure><img src='{html.escape(avant)}' alt='avant'><figcaption>avant</figcaption></figure>"
        f"<figure><img src='{html.escape(apres)}' alt='après'><figcaption>après</figcaption></figure>"
        "</div></section>"
        for nom, avant, apres in paires
    )
    style = (
        "body{font-family:sans-serif;margin:16px}.duo{display:grid;grid-template-columns:1fr 1fr;gap:8px}"
        "img{width:100%}@media(max-width:700px){.duo{grid-template-columns:1fr}}"
    )
    return f"<!doctype html><meta charset=utf-8><title>Avant / après</title><style>{style}</style>{lignes}"


def construire(racine: Path) -> int:
    paires = []
    for photo in sorted((racine / "brut").glob("*.jpg")):
        apres = next((f"{e}/{photo.name}" for e in reversed(ETAPES[1:]) if (racine / e / photo.name).exists()), None)
        if apres:
            paires.append((photo.stem, f"brut/{photo.name}", apres))
    (racine / "comparaison.html").write_text(page_comparaison(paires), encoding="utf-8")
    print(f"{len(paires)} paires dans {racine / 'comparaison.html'}")
    return 0


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("racine", type=Path)
    sys.exit(construire(parser.parse_args().racine))
