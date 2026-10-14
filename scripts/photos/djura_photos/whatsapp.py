"""Importe les photos reçues dans la discussion WhatsApp de l'entreprise via le pont du NAS.

Ne lit que les messages de type image (la discussion est aussi familiale).
La clé d'API du pont reste dans le conteneur : elle n'est jamais lue ici.
"""

import argparse
import json
import os
import re
import subprocess
import sys
from pathlib import Path

VARIABLE_CHAT_JID = "DJURA_CHAT_JID"
BASE_SQLITE = "/Config/whatsapp/store/messages.db"
DOSSIER_MEDIA_NAS = "/Config/whatsapp/store/media"
CONTENEUR = "whatsapp-bridge"
_JID = re.compile(r"[0-9]+@(lid|s\.whatsapp\.net|g\.us)")
_DATE = re.compile(r"\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])")
_ID = re.compile(r"[A-F0-9]{3,40}")


def requete_sql_images(chat_jid: str, depuis: str) -> str:
    if not _JID.fullmatch(chat_jid):
        raise ValueError(f"JID invalide : {chat_jid!r}")
    if not _DATE.fullmatch(depuis):
        raise ValueError(f"date invalide (AAAA-MM-JJ attendu) : {depuis!r}")
    return (
        f"select id from messages where chat_jid='{chat_jid}' "
        f"and media_type='image' and timestamp>='{depuis}' order by timestamp, id;"
    )


def parse_ids(sortie_sqlite: str) -> list[str]:
    ids = [ligne.strip() for ligne in sortie_sqlite.splitlines() if ligne.strip()]
    douteux = [i for i in ids if not _ID.fullmatch(i)]
    if douteux:
        raise ValueError(f"identifiants de message inattendus : {douteux}")
    return ids


def nom_local(rang: int) -> str:
    return f"{rang:02d}.jpg"


def _ssh(*commande: str) -> str:
    resultat = subprocess.run(["ssh", "nas", *commande], capture_output=True, text=True, timeout=120)
    if resultat.returncode != 0:
        raise RuntimeError(f"ssh nas a échoué : {resultat.stderr.strip()}")
    return resultat.stdout


def _telecharger_sur_nas(chat_jid: str, message_id: str) -> None:
    corps = json.dumps({"message_id": message_id, "chat_jid": chat_jid}).replace('"', '\\"')
    script = (
        'wget -qO- --header="X-API-Key: $API_KEY" --header="Content-Type: application/json" '
        f'--post-data="{corps}" http://localhost:8080/api/download'
    )
    reponse = json.loads(_ssh("docker", "exec", CONTENEUR, "sh", "-c", f"'{script}'"))
    if not reponse.get("success"):
        raise RuntimeError(reponse.get("error", "réponse sans succès"))


def importer(chat_jid: str, depuis: str, sortie: Path) -> int:
    sortie.mkdir(parents=True, exist_ok=True)
    ids = parse_ids(_ssh("sqlite3", "-readonly", BASE_SQLITE, f'"{requete_sql_images(chat_jid, depuis)}"'))
    echecs = 0
    for rang, message_id in enumerate(ids, start=1):
        cible = sortie / nom_local(rang)
        if cible.exists():
            continue
        try:
            _telecharger_sur_nas(chat_jid, message_id)
            subprocess.run(
                ["scp", "-q", f"nas:{DOSSIER_MEDIA_NAS}/{chat_jid}/{message_id}.jpg", str(cible)],
                check=True,
                timeout=120,
            )
        except (RuntimeError, subprocess.SubprocessError, json.JSONDecodeError) as erreur:
            echecs += 1
            print(f"échec {message_id} : {erreur}", file=sys.stderr)
    print(f"{len(ids) - echecs}/{len(ids)} photos dans {sortie}")
    return 1 if echecs else 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--chat-jid", default=os.environ.get(VARIABLE_CHAT_JID), help=f"défaut : ${VARIABLE_CHAT_JID}")
    parser.add_argument("--depuis", required=True, help="AAAA-MM-JJ")
    parser.add_argument("--sortie", type=Path, required=True)
    args = parser.parse_args(argv)
    if not args.chat_jid:
        parser.error(f"JID de la discussion manquant : --chat-jid ou variable {VARIABLE_CHAT_JID}")
    try:
        return importer(args.chat_jid, args.depuis, args.sortie)
    except (RuntimeError, ValueError, subprocess.SubprocessError, OSError) as erreur:
        print(f"erreur : {erreur}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
