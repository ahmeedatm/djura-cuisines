from PIL import Image, ImageStat

from djura_photos.retouche import corriger


def _image_unie(couleur):
    return Image.new("RGB", (64, 48), couleur)


def test_corriger_garde_la_taille_et_le_mode():
    sortie = corriger(_image_unie((120, 110, 100)))
    assert sortie.size == (64, 48)
    assert sortie.mode == "RGB"


def test_corriger_neutralise_une_dominante_jaune():
    jaune = Image.new("RGB", (64, 48))
    jaune.putdata([(180 + (i % 40), 160 + (i % 40), 90 + (i % 40)) for i in range(64 * 48)])
    r, g, b = ImageStat.Stat(corriger(jaune)).mean
    assert abs(r - b) < abs(180 - 90) / 2


def test_corriger_ne_modifie_pas_l_original():
    original = _image_unie((10, 20, 30))
    copie = original.copy()
    corriger(original)
    assert original.tobytes() == copie.tobytes()
