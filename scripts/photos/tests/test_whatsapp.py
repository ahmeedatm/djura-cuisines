import pytest

from djura_photos.whatsapp import nom_local, parse_ids, requete_sql_images


def test_requete_ne_lit_que_les_images_du_chat_depuis_la_date():
    sql = requete_sql_images("111@lid", "2026-10-14")
    assert "media_type='image'" in sql
    assert "chat_jid='111@lid'" in sql
    assert "timestamp>='2026-10-14'" in sql
    assert "content" not in sql  # jamais le texte des messages (discussion familiale)


@pytest.mark.parametrize("date", ["2026-10-14\n", "2026-10-14'; drop table messages;--", "2026-13-99", "hier"])
def test_requete_refuse_une_date_douteuse(date):
    with pytest.raises(ValueError):
        requete_sql_images("1@lid", date)


def test_requete_refuse_un_jid_douteux():
    with pytest.raises(ValueError):
        requete_sql_images("1@lid' or '1'='1", "2026-10-14")


def test_requete_trie_aussi_par_id_pour_un_rang_stable():
    assert "order by timestamp, id" in requete_sql_images("1@lid", "2026-10-14")


def test_requete_refuse_un_jid_avec_retour_a_la_ligne():
    with pytest.raises(ValueError):
        requete_sql_images("1@lid\n", "2026-10-14")


def test_parse_ids_ignore_les_lignes_vides():
    assert parse_ids("AC1\n\nAC2\n") == ["AC1", "AC2"]


def test_parse_ids_refuse_un_id_bizarre():
    with pytest.raises(ValueError):
        parse_ids("AC1\n../../etc/passwd\n")


def test_nom_local_numerote_sur_deux_chiffres():
    assert nom_local(3) == "03.jpg"
