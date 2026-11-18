"""Cartazes A4 "Pré Black" da Santuário Pet Center.

Uso: python3 santuario-pet/gerar_cartazes.py
Saída: santuario-pet/cartazes/<nome>.pdf (impressão) e .png (300 dpi)
"""
import base64
import pathlib
import subprocess
import tempfile

ROOT = pathlib.Path(__file__).resolve().parent
LOGO = "data:image/png;base64," + base64.b64encode((ROOT / "brand/logo-circulo.png").read_bytes()).decode()

PATA = ('<path d="M50 88c-14 0-26-8-26-19 0-9 9-17 26-17s26 8 26 17c0 11-12 19-26 19z"/>'
        '<ellipse cx="20" cy="44" rx="9" ry="12"/><ellipse cx="38" cy="26" rx="9" ry="12"/>'
        '<ellipse cx="62" cy="26" rx="9" ry="12"/><ellipse cx="80" cy="44" rx="9" ry="12"/>')

# Ilustrações vetoriais (traço branco + detalhes em amarelo)
BOLSA = """
<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
  <path d="M120 92 C120 30 280 30 280 92" fill="none" stroke="#fff" stroke-width="16" stroke-linecap="round"/>
  <path d="M150 92 C150 52 250 52 250 92" fill="none" stroke="#FFD24A" stroke-width="10" stroke-linecap="round"/>
  <rect x="40" y="88" width="320" height="190" rx="34" fill="#fff"/>
  <rect x="40" y="88" width="320" height="34" rx="17" fill="#FFD24A"/>
  <rect x="78" y="140" width="150" height="112" rx="22" fill="#0A5C3A"/>
  <g stroke="#fff" stroke-opacity=".55" stroke-width="5">
    <path d="M103 140v112M128 140v112M153 140v112M178 140v112M203 140v112"/>
    <path d="M78 165h150M78 190h150M78 215h150M78 240h150"/>
  </g>
  <g fill="#0A5C3A" transform="translate(262 168) scale(.62)">""" + PATA + """</g>
  <rect x="250" y="236" width="80" height="14" rx="7" fill="#0A5C3A" opacity=".25"/>
</svg>"""

ROUPA = """
<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(330 64)">
    <circle r="30" fill="#FFD24A"/>
    <g stroke="#FFD24A" stroke-width="8" stroke-linecap="round">
      <path d="M0-46v-14M0 46v14M46 0h14M-46 0h-14M33-33l10-10M-33 33l-10 10M33 33l10 10M-33-33l-10-10"/>
    </g>
  </g>
  <path d="M120 40 L80 70 L40 70 L40 120 L90 120 L100 270 L300 270 L310 120 L360 120 L360 70 L320 70 L280 40
           C265 70 135 70 120 40 Z" fill="#fff" stroke="#fff" stroke-width="10" stroke-linejoin="round"/>
  <path d="M120 40 C135 70 265 70 280 40" fill="none" stroke="#FFD24A" stroke-width="12" stroke-linecap="round"/>
  <rect x="40" y="96" width="50" height="24" fill="#FFD24A"/><rect x="310" y="96" width="50" height="24" fill="#FFD24A"/>
  <g fill="#0A5C3A" transform="translate(160 130) scale(.8)">""" + PATA + """</g>
  <path d="M110 230 q22-14 44 0 t44 0 t44 0 t44 0" fill="none" stroke="#0A5C3A" stroke-opacity=".35" stroke-width="8" stroke-linecap="round"/>
</svg>"""

CSS = """
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700;800;900&display=block');
@page{size:A4;margin:0}
:root{--verde:#0C6E45;--verde-esc:#06462B;--verde-claro:#1E8A5C;--amarelo:#FFD24A;--preto:#0B0B0F}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:794px;height:1123px;overflow:hidden;font-family:'Poppins',sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.a4{position:relative;width:794px;height:1123px;overflow:hidden;color:#fff;
  background:radial-gradient(900px 800px at 50% 42%,var(--verde-claro) 0%,var(--verde) 45%,var(--verde-esc) 100%)}
.abs{position:absolute}
.pata{position:absolute;fill:#fff;opacity:.06}
.faixa{position:absolute;left:-40px;right:-40px;top:44px;height:96px;background:var(--preto);transform:rotate(-3deg);
  display:flex;align-items:center;justify-content:center;gap:22px;box-shadow:0 10px 24px rgba(0,0,0,.35)}
.faixa b{font-weight:900;font-size:64px;letter-spacing:2px;line-height:1}
.faixa b span{color:var(--amarelo)}
.logo{position:absolute;left:50%;transform:translateX(-50%);top:168px;width:150px;height:150px;border-radius:50%;
  border:7px solid #fff;box-shadow:0 12px 28px rgba(0,0,0,.35);background:var(--verde)}
.logo img{width:100%;height:100%;border-radius:50%;display:block}
.cat{position:absolute;left:40px;right:40px;top:340px;text-align:center;font-weight:900;font-size:62px;line-height:1.02;
  text-transform:uppercase;letter-spacing:-1px}
.oferta{position:absolute;left:0;right:0;text-align:center}
.oferta .ate{font-weight:800;font-size:36px;letter-spacing:6px;text-transform:uppercase;color:var(--amarelo)}
.oferta .num{display:flex;justify-content:center;align-items:flex-start;line-height:.82;font-weight:900;color:var(--amarelo);
  text-shadow:0 10px 0 rgba(0,0,0,.18)}
.oferta .num b{font-size:260px;letter-spacing:-12px}
.oferta .num span{font-size:130px;margin-top:18px;margin-left:8px}
.oferta .de{display:inline-block;margin-top:18px;background:#fff;color:var(--verde-esc);font-weight:900;font-size:40px;
  letter-spacing:2px;text-transform:uppercase;padding:10px 34px;border-radius:999px}
.ilustra{position:absolute;left:50%;transform:translateX(-50%);width:250px}
.rod{position:absolute;left:0;right:0;bottom:34px;text-align:center;font-weight:600;font-size:17px;opacity:.85}
"""


def patas():
    pos = [(30, 380, 90, -20), (680, 420, 80, 18), (40, 900, 70, 12), (690, 940, 90, -14), (610, 200, 60, 20)]
    return "".join(f'<svg class="pata" viewBox="0 0 100 100" style="left:{x}px;top:{y}px;width:{w}px;transform:rotate({r}deg)">{PATA}</svg>'
                   for x, y, w, r in pos)


def cartaz(categoria, ilustra):
    return f"""<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>{CSS}</style></head><body>
<div class="a4">
  {patas()}
  <div class="faixa"><b>PRÉ <span>BLACK</span></b></div>
  <div class="logo"><img src="{LOGO}" alt="Santuário Pet Center"></div>
  <div class="cat">{categoria}</div>
  <div class="oferta" style="top:478px">
    <div class="ate">com até</div>
    <div class="num"><b>60</b><span>%</span></div>
    <div class="de">de desconto</div>
  </div>
  <div class="ilustra" style="top:870px">{ilustra}</div>
  <div class="rod">Consulte os produtos participantes.</div>
</div></body></html>"""


def main():
    out = ROOT / "cartazes"
    out.mkdir(exist_ok=True)
    for nome, cat, il in [("pre-black-bolsas-de-transporte", "Bolsas de<br>transporte", BOLSA),
                          ("pre-black-roupinhas-de-verao", "Roupinhas<br>de verão", ROUPA)]:
        with tempfile.TemporaryDirectory() as tmp:
            src = pathlib.Path(tmp) / "c.html"
            src.write_text(cartaz(cat, il), encoding="utf-8")
            subprocess.run(["node", str(ROOT / "render_a4.js"), str(src), str(out / nome)], check=True)
        print(out / nome)


if __name__ == "__main__":
    main()
