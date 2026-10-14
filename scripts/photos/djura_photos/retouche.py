"""Couche 1 : retouche légère et honnête de toutes les photos, puis agrandissement x2.

Niveaux automatiques, balance des blancs (monde gris), netteté légère.
L'agrandissement passe par upscayl-bin (Real-ESRGAN) s'il est installé.
"""

import argparse
import shutil
import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageFilter, ImageOps, ImageStat

COUPURE_NIVEAUX = 1  # % de pixels ignorés aux extrêmes
NETTETE = ImageFilter.UnsharpMask(radius=1.2, percent=60, threshold=3)
UPSCAYL = shutil.which("upscayl-bin")
MODELE_UPSCAYL = "upscayl-standard-4x"
ECHELLE = "2"


def _balance_des_blancs(image: Image.Image) -> Image.Image:
    moyennes = ImageStat.Stat(image).mean
    gris = sum(moyennes) / 3
    canaux = [c.point(lambda v, f=gris / max(m, 1): min(255, round(v * f))) for c, m in zip(image.split(), moyennes)]
    return Image.merge("RGB", canaux)


def corriger(image: Image.Image) -> Image.Image:
    rgb = ImageOps.exif_transpose(image).convert("RGB")
    return ImageOps.autocontrast(_balance_des_blancs(rgb), cutoff=COUPURE_NIVEAUX).filter(NETTETE)


def _agrandir(source: Path, cible: Path, modeles: Path) -> None:
    subprocess.run(
        [UPSCAYL, "-i", str(source), "-o", str(cible), "-s", ECHELLE, "-n", MODELE_UPSCAYL, "-m", str(modeles)],
        check=True,
        capture_output=True,
        timeout=600,
    )


def _traiter_photo(photo: Path, cible: Path, modeles: Path | None) -> None:
    with Image.open(photo) as image:
        corriger(image).save(cible, quality=92)
    if UPSCAYL and modeles:
        # agrandit vers un fichier temporaire : un échec ne laisse pas de sortie tronquée
        temporaire = cible.with_name(f"{cible.stem}.agrandie.tmp{cible.suffix}")
        try:
            _agrandir(cible, temporaire, modeles)
            temporaire.replace(cible)
        finally:
            temporaire.unlink(missing_ok=True)


def traiter_dossier(entree: Path, sortie: Path, modeles: Path | None) -> int:
    sortie.mkdir(parents=True, exist_ok=True)
    if UPSCAYL is None or modeles is None:
        print("upscayl-bin ou modèles absents : pas d'agrandissement", file=sys.stderr)
    echecs = 0
    for photo in sorted(entree.glob("*.jpg")):
        try:
            _traiter_photo(photo, sortie / photo.name, modeles)
        except (OSError, subprocess.CalledProcessError, subprocess.TimeoutExpired) as erreur:
            echecs += 1
            print(f"échec {photo.name} : {erreur}", file=sys.stderr)
    return 1 if echecs else 0


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("entree", type=Path)
    parser.add_argument("sortie", type=Path)
    parser.add_argument("--modeles", type=Path, default=None, help="dossier des modèles upscayl")
    args = parser.parse_args()
    sys.exit(traiter_dossier(args.entree, args.sortie, args.modeles))
