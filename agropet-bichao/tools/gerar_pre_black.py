"""Stories 1080x1920 da campanha "Pré Black Bichão" (ofertas válidas até 21/11).

Uso: python3 agropet-bichao/tools/gerar_pre_black.py
Saída: agropet-bichao/pre-black/NN-<slug>.png
"""
import os
import pathlib
import subprocess
import tempfile

import gerar_fecha_mes as base

ROOT = base.ROOT
OUT = ROOT / "pre-black"
VALIDADE = "21/11"

CSS = base.CSS.replace("height:1350px", "height:1920px") + """
.slide{height:1920px;background:radial-gradient(1200px 1100px at 50% 36%,#0B36B8 0%,var(--azul) 48%,var(--azul-esc) 100%)}
.black{display:inline-flex;align-items:center;gap:12px;background:#0B0B0F;color:#fff;border-radius:14px;padding:12px 22px;
  font-family:'Alfa Slab One',serif;font-size:34px;line-height:1;letter-spacing:1px;box-shadow:0 10px 24px rgba(0,0,0,.35)}
.black span{color:var(--laranja)}
.card{position:absolute;left:48px;right:48px;background:#fff;border-radius:40px;overflow:hidden;box-shadow:0 26px 60px rgba(3,10,50,.5)}
.card .info{padding:40px 46px 30px;color:var(--tinta)}
.card .nome{font-family:'Alfa Slab One',serif;font-size:54px;line-height:1.06;color:var(--azul);text-wrap:balance}
.card .nome::after{content:"";display:block;width:70px;height:7px;border-radius:4px;background:var(--laranja);margin-top:18px}
.card .desc{font-weight:500;font-size:29px;line-height:1.42;color:var(--cinza);margin-top:16px;text-wrap:pretty}
.card .chips{display:flex;gap:12px;flex-wrap:wrap;margin-top:20px}
.card .chips span{font-weight:800;font-size:25px;letter-spacing:1px;text-transform:uppercase;padding:10px 18px;border-radius:12px;line-height:1}
.card .chips .a{background:var(--azul);color:#fff}
.card .chips .v{background:var(--verde);color:var(--azul-esc)}
.card .preco{display:flex;align-items:center;justify-content:space-between;padding:22px 46px 26px;
  background:linear-gradient(160deg,#F2352B 0%,var(--vermelho) 45%,#B3131B 100%);color:#fff}
.card .preco .rot{font-weight:800;font-size:30px;letter-spacing:3px;text-transform:uppercase;color:var(--amarelo);line-height:1.2}
.card .preco .val{display:flex;align-items:flex-start;font-family:'Alfa Slab One',serif;line-height:1;letter-spacing:-2px;
  text-shadow:0 5px 0 rgba(90,0,0,.25)}
.card .preco .rs{font-size:44px;margin-top:22px;margin-right:10px;letter-spacing:0}
.card .preco .int{font-size:150px}
.card .preco .cent{font-size:62px;margin-top:16px}
.rod{position:absolute;left:0;right:0;display:flex;align-items:center;justify-content:center;gap:16px;font-weight:700;font-size:30px}
.rod .sep{width:7px;height:7px;border-radius:50%;background:var(--laranja)}
"""


def topo():
    return f"""
  <div class="abs" style="left:56px;right:56px;top:150px;display:flex;align-items:center;justify-content:space-between">
    <img src="{base.LOGO_H}" style="height:116px;filter:drop-shadow(0 6px 14px rgba(0,0,0,.3))" alt="Agropet Bichão">
    <span class="black">PRÉ BLACK <span>BICHÃO</span></span>
  </div>"""


def rodape(top):
    return (f'<div class="rod" style="top:{top}px">{base.icon("wa", 38, "#fff")}{base.WHATS}<span class="sep"></span>'
            f'{base.icon("clock", 34, "#FFD56F")}<span style="color:var(--amarelo)">Válido até {VALIDADE}</span></div>')


def card_produto(p):
    inteiro, cent = p["price"].split(",")
    chips = f'<span class="a">{p["peso"]}</span>' + (f'<span class="v">{p["extra"]}</span>' if p.get("extra") else "")
    h = p.get("h", 640)
    body = f"""
<div class="slide">
  {topo()}
  <div class="abs" style="left:56px;top:300px"><span class="pill verde" style="font-size:24px;padding:12px 24px">{p["cat"]}</span></div>
  <div class="palco anel" style="top:330px;width:760px;height:760px"></div>
  <div class="palco disco" style="top:390px;width:640px;height:640px"></div>
  <div class="prod" style="top:{1040 - h}px;width:{p.get("w", 540)}px;height:{h}px"><img src="{base.foto(p["slug"])}" alt="{p["nome"]}"></div>
  <div class="card" style="top:1090px">
    <div class="info"><div class="nome">{p["nome"]}</div><div class="desc">{p["desc"]}</div><div class="chips">{chips}</div></div>
    <div class="preco"><div class="rot">{p.get("rotulo", "Por<br>apenas")}</div>
      <div class="val"><span class="rs">R$</span><span class="int">{inteiro}</span><span class="cent">,{cent}</span></div></div>
  </div>
  {rodape(1700)}
</div>"""
    return f'<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>{CSS}</style></head><body>{body}</body></html>'


def capa(destaques):
    slots = [(-320, 330, 410), (0, 380, 480), (320, 330, 410)]
    prods = "".join(
        f'<div class="prod" style="top:{1500 - h}px;margin-left:{dx}px;width:{w}px;height:{h}px;z-index:{2 if dx == 0 else 1}">'
        f'<img src="{base.foto(s)}" alt=""></div>' for (dx, w, h), s in zip(slots, destaques))
    body = f"""
<div class="slide">
  <div class="abs" style="left:0;right:0;top:160px;display:flex;justify-content:center">
    <img src="{base.LOGO_HS}" style="width:520px;filter:drop-shadow(0 8px 18px rgba(0,0,0,.35))" alt="Agropet Bichão"></div>
  <div class="abs slab" style="left:0;right:0;top:420px;text-align:center;line-height:1;text-transform:uppercase">
    <div style="display:inline-block;background:#0B0B0F;color:#fff;font-size:150px;padding:18px 48px 26px;border-radius:26px;
      transform:rotate(-2deg);box-shadow:0 16px 0 rgba(0,0,0,.35)">PRÉ <span style="color:var(--laranja)">BLACK</span></div>
    <div style="font-size:126px;margin-top:26px">Bichão</div>
  </div>
  <div class="abs" style="left:0;right:0;top:770px;text-align:center">
    <div style="font-weight:600;font-size:38px;line-height:1.35">Ofertas especiais nas marcas que<br>seu pet ama, antes da Black Friday.</div>
    <div style="margin-top:28px;display:inline-flex;gap:14px">
      <span class="pill contorno" style="font-size:28px;padding:14px 28px">{base.icon("clock", 26, "#fff")}Válido até {VALIDADE}</span>
    </div>
  </div>
  <div class="palco disco" style="top:1120px;width:1300px;height:1300px"></div>
  {prods}
  <div class="abs" style="left:0;right:0;top:1560px;display:flex;justify-content:center;z-index:3">
    <div style="display:flex;align-items:center;gap:14px;background:var(--azul);color:#fff;font-weight:800;font-size:34px;
      padding:18px 40px;border-radius:999px;box-shadow:0 12px 30px rgba(3,10,50,.4)">Veja as ofertas {base.icon("arrow", 36, "#FFD56F", 3)}</div></div>
</div>"""
    return f'<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>{CSS}</style></head><body>{body}</body></html>'


CAES, GATOS, ANTI, HIG = "Ração para cães", "Ração para gatos", "Antipulgas e carrapatos", "Higiene para gatos"
PE = "Premium Especial"
ITENS = [
    dict(slug="golden-special-20", cat=CAES, nome="Golden Special Cães Adultos", peso="20 kg", price="179,99",
         desc=f"Ração {PE} para cães adultos, sabor frango e carne."),
    dict(slug="golden-special-15", cat=CAES, nome="Golden Special Cães Adultos", peso="15 kg", price="139,99",
         desc=f"Ração {PE} para cães adultos, sabor frango e carne."),
    dict(slug="golden-special-rp", cat=CAES, nome="Golden Special Raças Pequenas", peso="15 kg", price="144,99",
         desc=f"Ração {PE} para cães adultos de porte pequeno, sabor frango e carne."),
    dict(slug="golden-mb-carne", cat=CAES, nome="Golden Fórmula Mini Bits Carne e Arroz", peso="15 kg", price="159,99",
         desc="Para cães adultos de raças pequenas, com grãos Mini Bits. Sabor carne, arroz e vegetais."),
    dict(slug="golden-mb-frango", cat=CAES, nome="Golden Fórmula Mini Bits Frango e Arroz", peso="15 kg", price="159,99",
         desc="Para cães adultos de raças pequenas, com grãos Mini Bits. Sabor frango, arroz e vegetais."),
    dict(slug="golden-power", cat=CAES, nome="Golden Power Training Adultos", peso="15 kg", price="169,99",
         desc="Para cães adultos em treinamento e competição. Sabor frango, arroz e vegetais."),
    dict(slug="three-dogs-rp", cat=CAES, nome="Three Dogs Raças Pequenas", peso="15 kg", price="149,99",
         desc=f"Ração {PE} para cães adultos de raças pequenas e minis. Frango, carne e arroz."),
    dict(slug="three-dogs-rmg", cat=CAES, nome="Three Dogs Raças Médias e Grandes", peso="15 kg", price="149,99",
         desc=f"Ração {PE} para cães adultos de raças médias e grandes. Frango, carne e arroz."),
    dict(slug="birbo-frango", cat=CAES, nome="Birbo Cães Adultos Frango", peso="25 kg", price="149,99",
         desc="Ração Premium para cães adultos de médio e grande porte, sabor tradicional frango."),
    dict(slug="granplus-choice-caes", cat=CAES, nome="GranPlus Choice Cães Adultos", peso="16,5 kg", price="139,99",
         desc="Alimento High Premium para cães adultos, sabor frango e carne."),
    dict(slug="apolo", cat=CAES, nome="Apolo Original Cães Adultos", peso="20 kg", price="134,99",
         desc="Para cães adultos, com sabor natural de carne e cereais."),
    dict(slug="golden-gatos-castrados", cat=GATOS, nome="Golden Special Gatos Castrados", peso="10,1 kg", price="144,99",
         desc=f"Ração {PE} para gatos adultos castrados, sabor frango e carne."),
    dict(slug="primogato-original", cat=GATOS, nome="Primogato Original", peso="10,1 kg", price="112,99",
         desc="Ração Premium para gatos adultos, sabor carne e frango."),
    dict(slug="granplus-choice-gatos", cat=GATOS, nome="GranPlus Choice Gatos Adultos", peso="10,1 kg", price="149,99",
         desc="Alimento High Premium para gatos adultos, sabor frango e carne."),
    dict(slug="three-cats-castrados-carne", cat=GATOS, nome="Three Cats Castrados Carne", peso="10,1 kg", price="159,99",
         desc=f"Ração {PE} para gatos adultos castrados, sabor carne."),
    dict(slug="osw-pellets", cat=HIG, nome="Granulado de Madeira OSW Pellets", peso="15 kg cada", price="99,99",
         extra="Combo 3 unidades", rotulo="Combo<br>por apenas", w=600, h=560,
         desc="Granulado higiênico de madeira para gatos, com alta absorção e controle de odores."),
    dict(slug="seresto-p", cat=ANTI, nome="Coleira Seresto P", peso="Até 8 kg", price="149,99", w=560, h=560,
         desc="Elimina pulgas e carrapatos em cães e pulgas em gatos de até 8 kg. Até 8 meses de proteção."),
    dict(slug="nexgard-4-10kg", cat=ANTI, nome="NexGard 4,1 a 10 kg", peso="3 tabletes", price="179,99",
         extra="Combo 3 unidades", rotulo="Combo<br>por apenas", w=620, h=480,
         desc="Tablete mastigável sabor carne que mata pulgas e carrapatos. Cada tablete protege por 30 dias."),
    dict(slug="nexgard-10-25", cat=ANTI, nome="NexGard 10,1 a 25 kg", peso="3 tabletes", price="219,99",
         extra="Combo 3 unidades", rotulo="Combo<br>por apenas", w=620, h=480,
         desc="Tablete mastigável sabor carne que mata pulgas e carrapatos. Cada tablete protege por 30 dias."),
]


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for f in OUT.glob("*.png"):
        f.unlink()
    paginas = [("00-capa", capa(["golden-special-15", "golden-power", "three-cats-castrados-carne"]))]
    paginas += [(f"{i:02d}-{p['slug']}", card_produto(p)) for i, p in enumerate(ITENS, 1)]
    with tempfile.TemporaryDirectory() as tmp:
        jobs = []
        for nome, html in paginas:
            src = pathlib.Path(tmp) / f"{nome}.html"
            src.write_text(html, encoding="utf-8")
            jobs.append(f"{src}|{OUT / (nome + '.png')}")
        subprocess.run(["node", str(pathlib.Path(__file__).with_name("render.js")), *jobs], check=True,
                       env={**os.environ, "H": "1920"}, stdout=subprocess.DEVNULL)


if __name__ == "__main__":
    main()
