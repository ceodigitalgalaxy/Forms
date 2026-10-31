"""Monta o gerador: injeta os logos e cria a versão do site (index.html) e, se pedido, a do Artifact."""
import base64, pathlib, sys
here = pathlib.Path(__file__).parent
def uri(name):
    return "data:image/png;base64," + base64.b64encode((here / name).read_bytes()).decode()
src = (here / "gerador.src.html").read_text()
for key, name in [("__LOGO_EMBLEMA__", "logo-emblema.png"), ("__LOGO_PETCENTER__", "logo-pet-center.png"), ("__LOGO_HOSPITAL__", "logo-hospital.png")]:
    src = src.replace(key, uri(name))
head = ('<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
        '<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}'
        'body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style></head><body>')
(here / "index.html").write_text(head + src + "</body></html>")
if len(sys.argv) > 1:
    pathlib.Path(sys.argv[1]).write_text(src)
