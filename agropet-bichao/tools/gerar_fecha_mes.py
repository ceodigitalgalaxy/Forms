"""Gera os carrosséis "Fecha Mês Bichão" (cães e gatos) em PNG 1080x1350.

Sistema visual:
- Fundo azul royal da marca com luz suave; laranja e verde da logo como destaque.
- Tipografia única (Poppins), com hierarquia por peso e tamanho.
- Slide de produto: embalagem sem fundo como protagonista, sobre um círculo laranja;
  cartão branco com nome, descrição, peso e preço alinhados em grade.

Uso: python3 agropet-bichao/tools/gerar_fecha_mes.py
Fotos: agropet-bichao/produtos/<slug>.png (PNG sem fundo)
Saída: agropet-bichao/fecha-mes/{caes,gatos}/slide-N.png
"""
import base64
import pathlib
import subprocess
import tempfile

ROOT = pathlib.Path(__file__).resolve().parents[1]
FOTOS = ROOT / "produtos"
WHATS = "(51) 98062-1781"
VALIDADE = "31/10"


def data_uri(path):
    return f"data:image/png;base64,{base64.b64encode(path.read_bytes()).decode()}"


LOGO = data_uri(ROOT / "brand/logo-agropet-bichao-sem-fundo.png")


def foto(slug):
    f = FOTOS / f"{slug}.png"
    return data_uri(f) if f.exists() else None


# Ícones de traço (24x24)
ICON = {
    "wa": '<path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3Z"/><path d="M8.6 8.4c.2-.5.5-.5.8-.5h.5c.2 0 .4.1.5.4l.7 1.6c.1.2 0 .4-.1.6l-.4.5c-.1.1-.2.3 0 .5.5.9 1.3 1.7 2.3 2.2.2.1.4.1.5-.1l.5-.6c.2-.2.4-.2.6-.1l1.6.7c.2.1.3.3.3.5 0 .9-.7 1.9-1.9 1.9-2.6 0-5.9-3-5.9-5.6 0-.6.2-1 .4-1.4Z"/>',
    "truck": '<path d="M3 6h11v9H3z"/><path d="M14 9h4l3 3v3h-7z"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
    "pin": '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>',
    "store": '<path d="M4 10v10h16V10"/><path d="M3 10l2-6h14l2 6"/><path d="M3 10c0 1.7 1.3 3 3 3s3-1.3 3-3c0 1.7 1.3 3 3 3s3-1.3 3-3c0 1.7 1.3 3 3 3s3-1.3 3-3"/><path d="M10 20v-5h4v5"/>',
    "clock": '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    "arrow": '<path d="M5 12h14M13 6l6 6-6 6"/>',
}


def icon(name, size, color="currentColor", sw=2.2):
    return (f'<svg width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{color}" '
            f'stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round" style="flex:none">{ICON[name]}</svg>')


CSS = """
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700;800;900&display=block');
:root{--azul:#0A2588;--azul-esc:#06175E;--laranja:#FAAA30;--laranja-esc:#E8901A;
  --verde:#AACF51;--vermelho:#E2231A;--tinta:#0B1A4A;--cinza:#5B6483}
*{box-sizing:border-box;margin:0;padding:0}
body{width:1080px;height:1350px;overflow:hidden;font-family:'Poppins',sans-serif;-webkit-font-smoothing:antialiased}
.slide{position:relative;width:1080px;height:1350px;overflow:hidden;color:#fff;
  background:radial-gradient(1100px 900px at 50% 38%,#1B3CC0 0%,var(--azul) 45%,var(--azul-esc) 100%)}
.abs{position:absolute}

/* assinatura da campanha */
.lockup{display:flex;align-items:center;gap:18px}
.lockup img{height:118px;filter:drop-shadow(0 6px 14px rgba(0,0,0,.35))}
.lockup .txt{font-weight:900;line-height:.98;letter-spacing:-.5px;text-transform:uppercase}
.lockup .txt span{display:block}
.lockup .txt .b{color:var(--laranja)}

.pill{display:inline-flex;align-items:center;gap:10px;font-weight:700;font-size:22px;letter-spacing:1.5px;
  text-transform:uppercase;padding:10px 22px;border-radius:999px;line-height:1}
.pill.verde{background:var(--verde);color:var(--azul-esc)}
.pill.contorno{border:2px solid rgba(255,255,255,.55);color:#fff}
.pill.vermelho{background:var(--vermelho);color:#fff}

/* palco do produto */
.palco{position:absolute;left:50%;transform:translateX(-50%);border-radius:50%}
.palco.anel{border:2px solid rgba(255,255,255,.14)}
.palco.disco{background:radial-gradient(circle at 50% 40%,#FFC15C 0%,var(--laranja) 55%,var(--laranja-esc) 100%);
  box-shadow:0 30px 80px rgba(3,10,50,.45)}
.chao{position:absolute;left:50%;transform:translateX(-50%);height:46px;border-radius:50%;
  background:radial-gradient(closest-side,rgba(4,12,50,.55),rgba(4,12,50,0))}
.prod{position:absolute;left:50%;transform:translateX(-50%);display:flex;align-items:flex-end;justify-content:center}
.prod img{position:relative;z-index:1;max-width:100%;max-height:100%;object-fit:contain;
  filter:drop-shadow(0 4px 6px rgba(2,8,40,.35)) drop-shadow(0 26px 30px rgba(2,8,40,.45))}
.prod::after{content:"";position:absolute;z-index:0;left:14%;right:14%;bottom:-20px;height:48px;border-radius:50%;
  background:radial-gradient(closest-side,rgba(2,8,40,.75),rgba(2,8,40,0))}

/* cartão de oferta */
.cartao{position:absolute;left:48px;right:48px;background:#fff;border-radius:36px;display:flex;align-items:stretch;
  box-shadow:0 24px 60px rgba(3,10,50,.45);overflow:hidden}
.cartao .info{flex:1;padding:30px 18px 30px 44px;display:flex;flex-direction:column;justify-content:center;color:var(--tinta)}
.cartao .marca{font-weight:800;font-size:56px;line-height:1.04;letter-spacing:-1px;color:var(--azul)}
.cartao .desc{font-weight:500;font-size:30px;line-height:1.28;color:var(--cinza);margin-top:10px}
.cartao .chips{display:flex;gap:10px;margin-top:16px;flex-wrap:wrap}
.chip{font-weight:700;font-size:24px;letter-spacing:1px;text-transform:uppercase;padding:9px 18px;border-radius:10px;line-height:1}
.chip.azul{background:var(--azul);color:#fff}
.chip.verde{background:var(--verde);color:var(--azul-esc)}
.chip.vermelho{background:#FDE7E6;color:var(--vermelho)}
.cartao .preco{flex:none;width:420px;background:linear-gradient(160deg,#F2352B 0%,var(--vermelho) 45%,#B3131B 100%);
  display:flex;flex-direction:column;justify-content:center;align-items:center;padding:20px 14px;color:#fff}
.preco .rot{font-weight:800;font-size:26px;letter-spacing:3px;text-transform:uppercase;color:#FFD45C}
.preco .val{display:flex;align-items:flex-start;font-weight:800;line-height:1;margin-top:2px;letter-spacing:-4px;text-shadow:0 4px 0 rgba(90,0,0,.25)}
.preco .rs{font-size:40px;margin-top:20px;margin-right:8px;letter-spacing:0}
.preco .int{font-size:136px}
.preco .cent{font-size:56px;margin-top:16px;letter-spacing:-1px}

.rodape{position:absolute;left:48px;right:48px;bottom:34px;display:flex;align-items:center;justify-content:center;gap:14px;
  font-weight:600;font-size:27px;color:rgba(255,255,255,.92)}
.rodape b{font-weight:800;color:#fff}
.rodape .sep{width:6px;height:6px;border-radius:50%;background:var(--laranja)}
"""


def page(body):
    return f'<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>{CSS}</style></head><body>{body}</body></html>'


def lockup(size=50):
    return (f'<div class="lockup"><img src="{LOGO}" alt="Agropet Bichão">'
            f'<div class="txt" style="font-size:{size}px"><span>Fecha mês</span><span class="b">Bichão</span></div></div>')


def rodape():
    return (f'<div class="rodape">{icon("wa", 34, "#fff")}<b>{WHATS}</b><span class="sep"></span>'
            f'<span>Tele-entrega grátis: consulte condições</span></div>')


def preco(valor, rotulo):
    inteiro, cent = valor.split(",")
    return (f'<div class="preco"><div class="rot">{rotulo}</div><div class="val"><span class="rs">R$</span>'
            f'<span class="int">{inteiro}</span><span class="cent">,{cent}</span></div></div>')


def produto(n, total, p):
    chips = f'<span class="chip azul">{p["size"]}</span>'
    if p.get("extra"):
        chips += f'<span class="chip verde">{p["extra"]}</span>'
    body = f"""
<div class="slide">
  <div class="abs" style="left:48px;top:44px">{lockup()}</div>
  <div class="abs" style="right:48px;top:58px;display:flex;flex-direction:column;align-items:flex-end;gap:14px">
    <span style="font-weight:700;font-size:22px;letter-spacing:3px;opacity:.7">{n:02d}/{total:02d}</span>
    <span class="pill contorno">{icon("clock", 22, "#fff")}Válido até {VALIDADE}</span>
  </div>
  <div class="abs" style="left:48px;top:212px"><span class="pill verde">{p["cat"]}</span></div>

  <div class="palco anel" style="top:190px;width:760px;height:760px"></div>
  <div class="palco disco" style="top:250px;width:640px;height:640px"></div>
  <div class="prod" style="top:{875 - p.get("h", 640)}px;width:{p.get("w", 520)}px;height:{p.get("h", 640)}px">
    <img src="{foto(p["slug"])}" alt="{p["brand"]}"></div>
  <div class="abs" style="right:48px;top:212px;z-index:3"><span class="pill vermelho" style="font-size:22px;transform:rotate(4deg);box-shadow:0 8px 18px rgba(0,0,0,.3)">Poucas unidades</span></div>

  <div class="cartao" style="top:918px;height:342px">
    <div class="info"><div class="marca">{p["brand"]}</div><div class="desc">{p["desc"]}</div><div class="chips">{chips}</div></div>
    {preco(p["price"], p.get("rotulo", "Por apenas"))}
  </div>
  {rodape()}
</div>"""
    return page(body)


def capa(total, publico, destaques):
    # três embalagens no palco, a do meio em destaque
    slots = [(-300, 380, 470), (0, 440, 560), (300, 380, 470)]
    prods = "".join(
        f'<div class="prod" style="top:{1250 - h}px;margin-left:{dx}px;width:{w}px;height:{h}px;z-index:{2 if dx == 0 else 1}">'
        f'<img src="{foto(s)}" alt=""></div>'
        for (dx, w, h), s in zip(slots, destaques)
    )
    body = f"""
<div class="slide">
  <div class="abs" style="left:0;right:0;top:48px;display:flex;justify-content:center">
    <img src="{LOGO}" style="height:190px;filter:drop-shadow(0 8px 18px rgba(0,0,0,.35))" alt="Agropet Bichão"></div>
  <div class="abs" style="left:0;right:0;top:262px;text-align:center;font-weight:900;text-transform:uppercase;line-height:1">
    <div style="font-size:150px;letter-spacing:-5px">Fecha mês</div>
    <div style="display:inline-block;margin-top:14px;background:var(--laranja);color:var(--azul-esc);font-size:112px;
      letter-spacing:-3px;padding:8px 40px 14px;border-radius:22px;transform:rotate(-2deg);box-shadow:0 14px 0 var(--laranja-esc)">Bichão</div>
  </div>
  <div class="abs" style="left:0;right:0;top:600px;display:flex;justify-content:center;gap:14px">
    <span class="pill verde" style="font-size:26px;padding:12px 26px">Ofertas {publico}</span>
    <span class="pill contorno" style="font-size:26px;padding:12px 26px">{icon("clock", 24, "#fff")}Até {VALIDADE}</span>
    <span class="pill vermelho" style="font-size:26px;padding:12px 26px">Poucas unidades</span>
  </div>
  <div class="palco disco" style="top:860px;width:1200px;height:1200px"></div>
  {prods}
  <div class="abs" style="right:48px;bottom:44px;z-index:3;display:flex;align-items:center;gap:10px;font-weight:700;font-size:24px;
    letter-spacing:2px;text-transform:uppercase;color:var(--azul-esc)">Arraste {icon("arrow", 30, "#06175E", 3)}</div>
</div>"""
    return page(body)


def cta(total):
    itens = [("truck", "Tele-entrega grátis", "Consulte condições"),
             ("pin", "Toda Porto Alegre", "Entregamos em toda a cidade"),
             ("store", "Visite a loja", "Av. Alberto Pasqualini, 451 — Jardim Sabará")]
    cards = "".join(
        f'<div style="display:flex;align-items:center;gap:24px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);'
        f'border-radius:24px;padding:20px 30px"><div style="width:76px;height:76px;border-radius:20px;background:var(--laranja);'
        f'display:flex;align-items:center;justify-content:center">{icon(i, 42, "#06175E")}</div>'
        f'<div><div style="font-weight:800;font-size:34px;line-height:1.1">{t}</div>'
        f'<div style="font-weight:500;font-size:25px;opacity:.85;margin-top:4px">{d}</div></div></div>'
        for i, t, d in itens
    )
    body = f"""
<div class="slide">
  <div class="abs" style="left:0;right:0;top:56px;display:flex;justify-content:center">
    <img src="{LOGO}" style="height:170px;filter:drop-shadow(0 8px 18px rgba(0,0,0,.35))" alt="Agropet Bichão"></div>
  <div class="abs" style="left:64px;right:64px;top:258px;text-align:center">
    <span class="pill vermelho" style="font-size:24px">Poucas unidades</span>
    <div style="font-weight:900;font-size:96px;line-height:1;letter-spacing:-3px;margin-top:26px;text-transform:uppercase">
      Garanta antes<br><span style="color:var(--laranja)">que acabe!</span></div>
    <p style="font-weight:500;font-size:32px;line-height:1.35;margin-top:24px;opacity:.92">
      Chame no WhatsApp, separe seus produtos<br>e receba em casa.</p>
  </div>
  <div class="abs" style="left:0;right:0;top:690px;display:flex;justify-content:center">
    <div style="display:flex;align-items:center;gap:20px;background:var(--laranja);color:var(--azul-esc);font-weight:800;font-size:62px;
      letter-spacing:-1px;padding:22px 48px;border-radius:999px;box-shadow:0 12px 0 var(--laranja-esc)">
      {icon("wa", 64, "#06175E", 2.4)}{WHATS}</div></div>
  <div class="abs" style="left:64px;right:64px;top:850px;display:flex;flex-direction:column;gap:16px">{cards}</div>
  <div class="abs" style="left:0;right:0;bottom:36px;text-align:center;font-weight:600;font-size:22px;opacity:.75">
    Ofertas válidas até {VALIDADE} ou enquanto durarem os estoques.</div>
</div>"""
    return page(body)


ANTI = "Antipulgas e carrapatos"
CAES = [
    dict(slug="seresto-p", cat=ANTI, size="Tamanho P", brand="Coleira Seresto P",
         desc="Cães e gatos até 8 kg · 8 meses de proteção", price="149,99", w=600, h=600),
    dict(slug="seresto-g", cat=ANTI, size="Tamanho G", brand="Coleira Seresto G",
         desc="Cães acima de 8 kg · 8 meses de proteção", price="189,99", w=600, h=600),
    dict(slug="nexgard-4-10kg", cat=ANTI, size="4,1 a 10 kg", brand="NexGard",
         desc="Tablete mastigável para cães", extra="Combo 3 unidades", price="189,99",
         rotulo="Combo por", w=620, h=520),
    dict(slug="origens-shih-tzu", cat="Ração para cães", size="10,1 kg", brand="Origens",
         desc="Shih Tzu e Lhasa Apso · Cães adultos", price="109,99"),
    dict(slug="guabi-natural-caes-medias", cat="Ração para cães", size="12 kg", brand="Guabi Natural",
         desc="Cães adultos · Raças médias", price="199,99"),
    dict(slug="bionatural-junior-grandes", cat="Ração super premium", size="15 kg", brand="Bionatural Prime Júnior",
         desc="Raças grandes e gigantes", price="259,99"),
    dict(slug="bionatural-sensitive-peixe", cat="Ração super premium", size="15 kg", brand="Bionatural Sensitive",
         desc="Cães adultos · Raças pequenas · Peixe", price="279,99"),
    dict(slug="premier-diabetes-caes", cat="Nutrição clínica", size="10,1 kg", brand="Premier Diabetes",
         desc="Cães de porte médio e grande", price="319,99"),
]
GATOS = [
    dict(slug="seresto-p", cat=ANTI, size="Tamanho P", brand="Coleira Seresto P",
         desc="Cães e gatos até 8 kg · 8 meses de proteção", price="149,99", w=600, h=600),
    dict(slug="areia-bento", cat="Higiene", size="4 kg cada", brand="Areia Bento Mandioca",
         desc="Granulado higiênico de mandioca e minerais", extra="Combo 4 unidades", price="99,99",
         rotulo="Combo por", w=560),
    dict(slug="frost-gatos-filhotes", cat="Ração para gatos", size="7,5 kg", brand="Frost Kitten",
         desc="Gatos filhotes · Super premium", price="169,99"),
    dict(slug="guabi-natural-gatos", cat="Ração para gatos", size="7,5 kg", brand="Guabi Natural",
         desc="Gatos adultos", price="189,99"),
    dict(slug="premier-nattu-gatos-castrados", cat="Ração para gatos", size="7,5 kg", brand="Premier Nattu",
         desc="Gatos castrados · Abóbora", price="199,99"),
    dict(slug="nd-tropical-gatos", cat="Ração super premium", size="7,5 kg", brand="N&amp;D Tropical Selection",
         desc="Gatos castrados · Frango", price="279,99"),
    dict(slug="premier-urinario-gatos", cat="Nutrição clínica", size="7,5 kg", brand="Premier Urinário",
         desc="Gatos adultos", price="299,99"),
    dict(slug="nd-pumpkin-gatos", cat="Ração super premium", size="7,5 kg", brand="N&amp;D Pumpkin",
         desc="Gatos adultos · Frango e romã", price="419,99"),
]


def campanhas():
    out = {}
    for nome, itens, publico, destaques in [
        ("caes", CAES, "para cães", ["seresto-g", "bionatural-sensitive-peixe", "nexgard-4-10kg"]),
        ("gatos", GATOS, "para gatos", ["premier-nattu-gatos-castrados", "nd-pumpkin-gatos", "frost-gatos-filhotes"]),
    ]:
        total = len(itens) + 2
        slides = [capa(total, publico, destaques)]
        slides += [produto(i + 2, total, p) for i, p in enumerate(itens)]
        slides.append(cta(total))
        out[nome] = slides
    return out


def main():
    with tempfile.TemporaryDirectory() as tmp:
        jobs = []
        for nome, slides in campanhas().items():
            out = ROOT / "fecha-mes" / nome
            out.mkdir(parents=True, exist_ok=True)
            for i, html in enumerate(slides, 1):
                src = pathlib.Path(tmp) / f"{nome}-{i}.html"
                src.write_text(html, encoding="utf-8")
                jobs.append(f"{src}|{out / f'slide-{i}.png'}")
        subprocess.run(["node", str(pathlib.Path(__file__).with_name("render.js")), *jobs], check=True)


if __name__ == "__main__":
    main()
