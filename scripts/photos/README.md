# Outillage photos

Outils Python (hors site) pour préparer les photos de réalisations. Tout ce qu'ils produisent va dans `photos-tri/` (ignoré par git). Les commandes se lancent depuis `scripts/photos/`.

1. Import depuis la discussion WhatsApp (via le pont du NAS, images uniquement) :
   `uv run python -m djura_photos.whatsapp --depuis 2026-10-14 --sortie ../../photos-tri/brut`
2. Retouche légère (niveaux, balance des blancs, netteté) puis agrandissement x2 si upscayl est installé :
   `uv run python -m djura_photos.retouche ../../photos-tri/brut ../../photos-tri/retouche --modeles ~/.local/share/upscayl/models`
3. Nettoyage par IA des photos choisies (désordre, lumière) :
   `uv run python -m djura_photos.nettoyage_ia ../../photos-tri/retouche ../../photos-tri/ia --photos 08,19,20,21 --plafond-usd 1.00`
4. Page avant/après (`photos-tri/comparaison.html`) :
   `uv run python -m djura_photos.comparer ../../photos-tri`

## Règle : l'IA ne touche jamais aux meubles

La consigne envoyée au modèle n'autorise que le retrait du désordre (aimants, film de protection, objets, câbles, cartons, chaises) et l'adoucissement de la lumière. Façades, couleurs, matières, poignées, plan de travail, électroménager, agencement et cadrage restent identiques. Toujours vérifier chaque paire dans la page de comparaison avant de retenir une photo.

## Clé OpenRouter et identifiant de la discussion

Utiliser une clé OpenRouter dédiée, avec une limite de crédit basse, passée uniquement pour la commande (jamais dans un fichier du dépôt) :

```bash
OPENROUTER_API_KEY=... uv run python -m djura_photos.nettoyage_ia ../../photos-tri/retouche ../../photos-tri/ia --photos 08,19 --plafond-usd 1.00
```

L'identifiant de la discussion WhatsApp n'est pas dans le dépôt (public) : le passer de la même façon, par `--chat-jid` ou par la variable `DJURA_CHAT_JID` :

```bash
DJURA_CHAT_JID=...@lid uv run python -m djura_photos.whatsapp --depuis 2026-10-14 --sortie ../../photos-tri/brut
```

Le traitement est reprenable : une photo déjà présente dans `ia/` n'est pas repayée. Le plafond (`--plafond-usd`) bloque le lancement si le coût estimé le dépasse.

## Installer upscayl (agrandissement)

```bash
mkdir -p ~/.local/share/upscayl ~/.local/bin && cd ~/.local/share/upscayl
gh release download -R upscayl/upscayl-ncnn -p '*macos.zip' -D .
unzip -o upscayl-bin-*-macos.zip && rm upscayl-bin-*-macos.zip
chmod +x upscayl-bin-*-macos/upscayl-bin
ln -sf "$PWD"/upscayl-bin-*-macos/upscayl-bin ~/.local/bin/upscayl-bin
mkdir -p models
for f in upscayl-standard-4x.param upscayl-standard-4x.bin; do
  curl -sL -o models/$f "https://raw.githubusercontent.com/upscayl/upscayl/main/resources/models/$f"
done
```

`~/.local/bin` doit être dans le `PATH` (le binaire est cherché avec `shutil.which`). Sans upscayl, la retouche tourne quand même, sans agrandissement.
