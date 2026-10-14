from PIL import Image

from djura_photos.retouche import traiter_dossier


def test_photo_corrompue_n_arrete_pas_le_lot(tmp_path, capsys):
    entree, sortie = tmp_path / "in", tmp_path / "out"
    entree.mkdir()
    (entree / "01.jpg").write_bytes(b"pas une image")
    Image.new("RGB", (32, 32), (100, 100, 100)).save(entree / "02.jpg")
    assert traiter_dossier(entree, sortie, None) == 1
    assert (sortie / "02.jpg").exists()
    assert "échec 01.jpg" in capsys.readouterr().err
