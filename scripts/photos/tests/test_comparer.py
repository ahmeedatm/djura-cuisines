from djura_photos.comparer import page_comparaison


def test_page_montre_avant_et_apres_et_echappe_les_noms():
    html = page_comparaison([("08<script>", "brut/08.jpg", "ia/08.jpg")])
    assert "brut/08.jpg" in html and "ia/08.jpg" in html
    assert "<script>" not in html
    assert "&lt;script&gt;" in html
