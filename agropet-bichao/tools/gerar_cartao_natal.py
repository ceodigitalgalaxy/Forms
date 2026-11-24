"""Cartão de Natal Agropet Bichão (para acompanhar petisco): versão "Au, au! Miau, miau!".

Mesmo layout do cartão 6 da Santuário Pet, aplicado à IV da Bichão (ver brand/MANUAL.md):
azul #00238B, laranja #FFA800, amarelo #FFD56F, verde #A9CF45; Alfa Slab One + Poppins.
Formato 8,5 x 9,6 cm (1004 x 1134 px a 300 dpi). Saída: PNG + PDF em agropet-bichao/natal/.
"""
import base64
import pathlib
import subprocess
import tempfile

from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "natal"
NOME = "cartao-natal-bichao-au-miau"


def uri(p):
    return f"data:image/png;base64,{base64.b64encode(p.read_bytes()).decode()}"


LOGO = uri(ROOT / "brand/logo-horizontal.png")
PREMIER = "data:image/svg+xml;base64," + base64.b64encode((ROOT / "brand/parceiros/premierpet-laranja.svg").read_bytes()).decode()
LINHA = uri(ROOT / "brand/parceiros/linha-laranja-premier.png")
DUPLA = uri(ROOT.parent / "santuario-pet/fotos/natal-dupla.png")

AZUL, AZUL_ESC, LARANJA, AMARELO, VERDE = "#00238B", "#00175E", "#FFA800", "#FFD56F", "#A9CF45"

CSS = """
@import url('https://fonts.googleapis.com/css2?family=Alfa+Slab+One&family=Poppins:ital,wght@0,600;0,700;1,500;1,600&display=block');
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1004px;height:1134px;overflow:hidden}
.c{position:relative;width:1004px;height:1134px;overflow:hidden;background:#fff}
.a{position:absolute}
.topo{position:absolute;left:0;right:0;top:0;height:650px}
.meio{position:absolute;left:0;right:0;top:666px;bottom:0}
.borda{position:absolute;left:0;right:0;top:650px;height:16px;z-index:3}
.pet{z-index:2;filter:drop-shadow(7px 0 0 #fff) drop-shadow(-7px 0 0 #fff) drop-shadow(0 7px 0 #fff) drop-shadow(0 -7px 0 #fff) drop-shadow(0 12px 14px rgba(0,0,0,.3))}
"""


def cartao():
    fundo = ("radial-gradient(circle,rgba(255,236,190,.4) 0 3px,transparent 4px) 0 0/44px 44px,"
             "radial-gradient(circle,rgba(255,255,255,.18) 0 2px,transparent 3px) 22px 22px/44px 44px,"
             f"radial-gradient(700px 520px at 72% 22%,#0B36B8,{AZUL} 55%,{AZUL_ESC})")
    # véu azul-escuro atrás do texto: esconde a neve e garante o contraste da frase
    veu = ('<div class="a" style="left:0;top:0;width:640px;height:650px;z-index:1;'
           'background:linear-gradient(90deg,rgba(0,22,92,.95) 0,rgba(0,22,92,.9) 62%,rgba(0,22,92,0) 100%)"></div>')
    dupla = f'<img class="a pet" src="{DUPLA}" style="right:-78px;bottom:{1134 - 660}px;width:600px;transform:scaleX(-1)">'
    sombra = "text-shadow:0 4px 12px rgba(0,0,0,.35)"
    slab = f"font-family:'Alfa Slab One',serif;font-weight:400;line-height:1;white-space:nowrap;{sombra}"
    tag = (f"display:inline-block;color:{AZUL};background:{LARANJA};border-radius:14px;padding:8px 18px 12px;"
           "transform:rotate(-2deg);text-shadow:none;box-shadow:0 8px 18px rgba(0,0,0,.35)")
    coluna = (f'<div class="a" style="left:34px;width:420px;top:0;height:650px;z-index:3;display:flex;flex-direction:column;'
              f'align-items:center;justify-content:center;gap:26px;text-align:center">'
              f'<div>'
              f'<div style="{slab};font-size:64px;color:#fff">Au, au!</div>'
              f'<div style="{slab};font-size:56px;margin-top:14px"><span style="{tag}">Miau, miau!</span></div>'
              f'<div style="{slab};font-size:56px;color:{AMARELO};margin-top:20px">Feliz Natal!</div>'
              f'</div>'
              f'<div style="width:90px;height:5px;border-radius:3px;background:{VERDE}"></div>'
              f'<div style="font-family:Poppins,sans-serif;font-style:italic;font-weight:600;font-size:31px;line-height:1.36;'
              f'color:#fff;text-wrap:balance">Um petisco especial para quem deixa todos os nossos dias mais felizes!</div>'
              f'<div style="line-height:1">'
              f'<div style="font-family:Poppins,sans-serif;font-style:italic;font-weight:500;font-size:28px;color:{AMARELO}">Com carinho,</div>'
              f'<img src="{LOGO}" alt="Agropet Bichão" style="display:block;width:330px;margin:14px auto 0;'
              f'filter:drop-shadow(0 4px 10px rgba(0,0,0,.35))"></div>'
              f'</div>')
    borda = f'<div class="borda" style="background:repeating-linear-gradient(90deg,{LARANJA} 0 20px,#fff 20px 40px)"></div>'
    petisco = f"repeating-linear-gradient(-45deg,{AZUL} 0 22px,#fff 22px 44px)"
    return (f'<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>{CSS}</style></head><body><div class="c">'
            f'<div class="topo" style="background:{fundo}"></div>{veu}{dupla}{coluna}{borda}'
            f'<div class="meio" style="background:{petisco}"></div>{selo_premier()}</div></body></html>')


def selo_premier():
    # selo do parceiro no topo da área do petisco (o cookie fica embaixo)
    return ('<div class="a" style="left:250px;right:250px;top:694px;z-index:4;background:#fff;border-radius:20px;'
            'padding:14px 24px 16px;text-align:center;box-shadow:0 12px 28px rgba(0,0,0,.22)">'
            f'<div style="font-family:Poppins,sans-serif;font-style:italic;font-weight:600;font-size:24px;line-height:1.1;color:{AZUL}">'
            'Aproveite com um Cookie</div>'
            f'<img src="{LINHA}" style="display:block;width:340px;margin:10px auto 12px">'
            f'<img src="{PREMIER}" alt="PremieRpet" style="display:block;height:42px;margin:0 auto">'
            '</div>')


JS = """
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1004, height: 1134 } });
  const [src, out] = process.argv.slice(2);
  await p.goto('file://' + src, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: out });
  await b.close();
})();
"""


def main():
    OUT.mkdir(exist_ok=True)
    png = OUT / f"{NOME}.png"
    with tempfile.TemporaryDirectory() as tmp:
        js, src = pathlib.Path(tmp) / "r.js", pathlib.Path(tmp) / "c.html"
        js.write_text(JS)
        src.write_text(cartao(), encoding="utf-8")
        subprocess.run(["node", str(js), str(src), str(png)], check=True)
    # PDF a partir do PNG em 300 dpi (85 x 96 mm), idêntico à arte
    Image.open(png).convert("RGB").save(OUT / f"{NOME}.pdf", "PDF", resolution=300.0)
    print(png)


if __name__ == "__main__":
    main()
