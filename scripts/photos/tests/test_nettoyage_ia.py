import base64

import pytest

from djura_photos import nettoyage_ia
from djura_photos.nettoyage_ia import CONSIGNE, est_deja_traitee, estimer_cout, extraire_image


def test_la_consigne_interdit_de_toucher_aux_meubles():
    assert "Do not change" in CONSIGNE
    for mot in ("cabinet", "color", "handle", "layout"):
        assert mot in CONSIGNE


def test_estimer_cout():
    assert estimer_cout(8, 0.012) == pytest.approx(0.096)


def test_est_deja_traitee(tmp_path):
    (tmp_path / "08.jpg").write_bytes(b"x")
    assert est_deja_traitee(tmp_path, "08.jpg")
    assert not est_deja_traitee(tmp_path, "09.jpg")


def test_extraire_image_lit_la_data_url_openrouter():
    octets = b"\xff\xd8\xff fausse image"
    reponse = {
        "choices": [
            {"message": {"images": [{"image_url": {"url": "data:image/jpeg;base64," + base64.b64encode(octets).decode()}}]}}
        ]
    }
    assert extraire_image(reponse) == octets


def test_extraire_image_sans_image_leve_une_erreur_claire():
    with pytest.raises(ValueError, match="aucune image"):
        extraire_image({"choices": [{"message": {"content": "désolé"}}]})


def test_extraire_image_url_sans_virgule_leve_valueerror():
    with pytest.raises(ValueError, match="aucune image"):
        extraire_image({"choices": [{"message": {"images": [{"image_url": {"url": "data:image/jpeg;base64"}}]}}]})


@pytest.fixture
def traiter_env(tmp_path, monkeypatch):
    appels = []
    monkeypatch.setattr(nettoyage_ia, "_nettoyer", lambda client, photo: appels.append(photo.name) or b"ia")
    monkeypatch.setenv("OPENROUTER_API_KEY", "cle-factice")
    entree, sortie = tmp_path / "in", tmp_path / "out"
    entree.mkdir()
    return entree, sortie, appels


def test_traiter_sans_cle_retourne_2(traiter_env, monkeypatch):
    entree, sortie, appels = traiter_env
    monkeypatch.delenv("OPENROUTER_API_KEY")
    assert nettoyage_ia.traiter(entree, sortie, ["08"], 1.0) == 2
    assert appels == []


def test_traiter_plafond_depasse_n_appelle_rien(traiter_env):
    entree, sortie, appels = traiter_env
    assert nettoyage_ia.traiter(entree, sortie, ["01", "02"], 0.01) == 3
    assert appels == []


def test_traiter_saute_les_photos_deja_traitees(traiter_env):
    entree, sortie, appels = traiter_env
    sortie.mkdir()
    (sortie / "08.jpg").write_bytes(b"deja")
    assert nettoyage_ia.traiter(entree, sortie, ["08", "09"], 1.0) == 0
    assert appels == ["09.jpg"]
    assert (sortie / "08.jpg").read_bytes() == b"deja"


@pytest.mark.parametrize("numero", ["../x", "08.jpg", "", "1234"])
def test_traiter_refuse_un_numero_invalide_avant_tout_appel(traiter_env, numero):
    entree, sortie, appels = traiter_env
    assert nettoyage_ia.traiter(entree, sortie, [numero], 1.0) == 2
    assert appels == []
