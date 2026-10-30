"""Gera os carrosséis "Fecha Mês Bichão" (cães e gatos) em PNG 1080x1350.

Visual baseado nos posts de referência da Agropet Bichão: fundo azul royal,
título com tarja vermelha, embalagem sem fundo sobre forma laranja e preço
em caixa vermelha e branca com tipografia condensada.

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
    ext = path.suffix.lstrip(".").lower()
    mime = "jpeg" if ext in ("jpg", "jpeg") else ext
    return f"data:image/{mime};base64,{base64.b64encode(path.read_bytes()).decode()}"


LOGO = data_uri(ROOT / "brand/logo-agropet-bichao-sem-fundo.png")


def foto(slug):
    for ext in ("png", "webp"):
        f = FOTOS / f"{slug}.{ext}"
        if f.exists():
            return data_uri(f)
    return None


WA_ICON = (
    '<svg viewBox="0 0 32 32" width="{s}" height="{s}" fill="currentColor" style="flex:none">'
    '<path d="M16 3C9 3 3.3 8.6 3.3 15.6c0 2.4.7 4.7 1.9 6.7L3 29l6.9-2.2c1.9 1 4 1.6 6.1 1.6 7 0 12.7-5.7 '
    '12.7-12.7S23 3 16 3zm0 23.1c-1.9 0-3.8-.5-5.4-1.5l-.4-.2-4.1 1.3 1.3-4-.3-.4c-1.1-1.7-1.6-3.6-1.6-5.6 '
    '0-5.8 4.7-10.5 10.5-10.5S26.5 9.9 26.5 15.6 21.8 26.1 16 26.1zm5.8-7.9c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2'
    '-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.2-1.3-.5-2.6-1.6-1-.9-1.6-1.9-1.8-2.3-.2-.3 0-.5.1-.7l.5-.6c.2-.2.2-.4.3-.6'
    '.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.8s1.2 3.2 1.4 3.5c.2.2 2.4 3.6 '
    '5.8 5.1 2.1.9 2.9 1 4 .8.6-.1 1.9-.8 2.2-1.5.3-.7.3-1.4.2-1.5-.1-.2-.3-.3-.6-.4z"/></svg>'
)

CSS = """
@import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,600;0,700;0,800;0,900;1,800&family=Oswald:wght@500;600;700&display=block');
:root{--azul:#0A2588;--azul-esc:#071a66;--laranja:#FAAA30;--verde:#AACF51;--vermelho:#D8161E;--branco:#fff}
*{box-sizing:border-box;margin:0;padding:0}
body{width:1080px;height:1350px;overflow:hidden;font-family:'Montserrat',sans-serif}
.slide{position:relative;width:1080px;height:1350px;overflow:hidden;color:#fff;
  background:radial-gradient(circle at 75% 30%,#1434a8 0,var(--azul) 50%,var(--azul-esc) 100%)}
.logo{position:absolute;object-fit:contain;filter:drop-shadow(0 8px 18px rgba(0,0,0,.35))}
.counter{position:absolute;font-weight:800;font-size:24px;letter-spacing:2px;opacity:.7}

/* título no padrão das referências */
.titulo{position:absolute;left:72px;font-weight:900;line-height:1;letter-spacing:-2px;text-transform:uppercase}
.titulo .l1{position:relative;display:inline-block;z-index:1}
.titulo .l1::after{content:"";position:absolute;left:12%;right:-2%;bottom:2px;height:30%;background:var(--vermelho);z-index:-1}
.titulo .l2{display:block;position:relative;z-index:2;margin-top:14px;color:var(--laranja)}

.pill{display:inline-block;font-weight:800;font-size:26px;letter-spacing:2px;text-transform:uppercase;
  padding:12px 26px;border-radius:999px;background:var(--verde);color:var(--azul-esc)}

/* área do produto */
.forma{position:absolute;left:0;background:var(--laranja);border-radius:0 70px 70px 0}
.produto{position:absolute;display:flex;align-items:flex-end;justify-content:center}
.produto img{max-width:100%;max-height:100%;object-fit:contain;filter:drop-shadow(0 22px 26px rgba(4,14,60,.45))}
.semfoto{color:var(--azul-esc);text-align:center;align-self:center}
.semfoto b{display:block;font-family:'Oswald',sans-serif;font-weight:700;font-size:240px;line-height:.9}
.semfoto small{font-family:'Oswald',sans-serif;font-weight:600;font-size:56px;letter-spacing:6px;text-transform:uppercase}

/* bloco de preço */
.oferta{position:absolute;right:56px;width:400px;box-shadow:0 18px 40px rgba(0,0,0,.35)}
.oferta .nome{background:var(--vermelho);padding:26px 28px;font-family:'Oswald',sans-serif;color:#fff}
.oferta .nome b{display:block;font-weight:700;font-size:50px;line-height:1.02}
.oferta .nome span{display:block;font-weight:500;font-size:30px;line-height:1.2;margin-top:10px;opacity:.95}
.oferta .nome em{display:inline-block;font-style:normal;margin-top:14px;font-weight:600;font-size:26px;letter-spacing:1px;
  background:#fff;color:var(--vermelho);padding:4px 14px;border-radius:6px;text-transform:uppercase}
.oferta .preco{background:#fff;color:var(--vermelho);padding:20px 28px 24px;font-family:'Oswald',sans-serif}
.oferta .preco small{display:block;font-weight:600;font-size:30px;letter-spacing:1px;text-transform:uppercase;color:var(--azul)}
.oferta .preco div{display:flex;align-items:flex-start;font-weight:700;line-height:1}
.oferta .preco .rs{font-size:44px;margin-top:14px;margin-right:8px}
.oferta .preco .int{font-size:132px;letter-spacing:-2px}
.oferta .preco .cent{font-size:56px;margin-top:12px}

.selo{position:absolute;width:190px;height:190px;border-radius:50%;background:var(--vermelho);color:#fff;
  display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;
  font-family:'Oswald',sans-serif;font-weight:700;font-size:30px;line-height:1.05;text-transform:uppercase;
  transform:rotate(-10deg);border:6px solid #fff;box-shadow:0 10px 24px rgba(0,0,0,.3)}
.selo b{font-size:44px}

/* rodapé */
.rodape{position:absolute;left:56px;right:56px;bottom:56px;display:flex;align-items:center;justify-content:space-between;gap:24px}
.rodape .wa{display:flex;align-items:center;gap:14px;font-weight:800;font-size:34px}
.rodape .validade{font-family:'Oswald',sans-serif;font-weight:600;font-size:30px;letter-spacing:1px;text-transform:uppercase;
  background:var(--laranja);color:var(--azul-esc);padding:12px 24px;border-radius:12px}
"""


def page(body):
    return f'<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>{CSS}</style></head><body>{body}</body></html>'


def rodape():
    return (
        f'<div class="rodape"><div class="wa">{WA_ICON.format(s=46)}{WHATS}</div>'
        f'<div class="validade">Válido até {VALIDADE}</div></div>'
    )


def titulo(top, size, l1="Fecha Mês", l2="Bichão"):
    return f'<div class="titulo" style="top:{top}px;font-size:{size}px"><span class="l1">{l1}</span><span class="l2">{l2}</span></div>'


def capa(n_total, publico, destaques):  # n_total mantido para manter a assinatura
    imgs = [foto(s) for s in destaques]
    pos = [(50, 790, 340, 400), (360, 720, 360, 470), (690, 790, 340, 400)]
    produtos = "".join(
        f'<div class="produto" style="left:{x}px;top:{y}px;width:{w}px;height:{h}px"><img src="{i}" alt=""></div>'
        for (x, y, w, h), i in zip(pos, imgs) if i
    )
    body = f"""
<div class="slide">
  <div style="position:absolute;left:72px;top:72px"><span class="pill">Ofertas {publico}</span></div>
  {titulo(160, 108)}
  <img class="logo" src="{LOGO}" style="right:56px;top:56px;width:220px;height:264px" alt="Agropet Bichão">
  <p style="position:absolute;left:72px;top:450px;max-width:640px;font-weight:700;font-size:38px;line-height:1.25">
    Preço de fim de mês nas melhores marcas. <span style="color:var(--laranja)">Arraste e confira!</span></p>
  <div class="forma" style="top:880px;width:1020px;height:310px"></div>
  {produtos}
  <div class="selo" style="right:50px;top:480px"><span>Poucas</span><b style="font-size:36px">unidades</b></div>
  {rodape()}
</div>"""
    return page(body)


def produto(n, total, p):
    img = foto(p["slug"])
    if img:
        vis = f'<img src="{img}" alt="{p["brand"]}">'
    else:
        num, unid = p["size"].split(" ", 1)
        vis = f'<div class="semfoto"><b>{num}</b><small>{unid}</small></div>'
    inteiro, cent = p["price"].split(",")
    extra = f'<em>{p["extra"]}</em>' if p.get("extra") else f'<em>{p["size"]}</em>'
    body = f"""
<div class="slide">
  <div class="counter" style="top:78px;left:72px">{n}/{total}</div>
  {titulo(120, 104)}
  <img class="logo" src="{LOGO}" style="right:56px;top:60px;width:200px;height:240px" alt="Agropet Bichão">
  <div style="position:absolute;left:72px;top:380px"><span class="pill">{p["cat"]}</span></div>
  <div class="forma" style="top:620px;width:700px;height:540px"></div>
  <div class="produto" style="left:60px;top:480px;width:560px;height:640px">{vis}</div>
  <div class="oferta" style="top:480px">
    <div class="nome"><b>{p["brand"]}</b><span>{p["desc"]}</span>{extra}</div>
    <div class="preco"><small>{p.get("rotulo", "Por apenas")}:</small>
      <div><span class="rs">R$</span><span class="int">{inteiro}</span><span class="cent">,{cent}</span></div></div>
  </div>
  <div class="selo" style="right:300px;top:1070px;width:160px;height:160px;font-size:24px"><span>Poucas</span><b style="font-size:36px">unid.</b></div>
  {rodape()}
</div>"""
    return page(body)


def cta(total):
    body = f"""
<div class="slide">
  <div style="position:absolute;left:72px;top:72px"><span class="pill" style="background:var(--vermelho);color:#fff">Poucas unidades</span></div>
  {titulo(160, 108, "Garanta", "o seu!")}
  <img class="logo" src="{LOGO}" style="right:56px;top:56px;width:220px;height:264px" alt="Agropet Bichão">
  <p style="position:absolute;left:72px;top:470px;max-width:900px;font-weight:700;font-size:38px;line-height:1.3">
    Chame no WhatsApp, separe seus produtos e receba em casa.</p>
  <div style="position:absolute;left:72px;top:620px;display:flex;align-items:center;gap:20px;background:var(--laranja);color:var(--azul-esc);
    font-family:'Oswald',sans-serif;font-weight:700;font-size:76px;padding:24px 44px;border-radius:24px;box-shadow:0 12px 0 #c9821a">
    {WA_ICON.format(s=78)}{WHATS}</div>
  <div style="position:absolute;left:72px;right:72px;top:860px;display:flex;flex-direction:column;gap:22px;font-size:36px;font-weight:700">
    <div><span style="color:var(--laranja)">■</span>&nbsp; Tele-entrega grátis: consulte condições</div>
    <div><span style="color:var(--laranja)">■</span>&nbsp; Entregamos para toda Porto Alegre</div>
    <div><span style="color:var(--laranja)">■</span>&nbsp; Av. Alberto Pasqualini, 451 — Jardim Sabará</div>
  </div>
  <div style="position:absolute;left:0;right:0;bottom:0;height:150px;background:var(--vermelho);display:flex;align-items:center;justify-content:center;
    font-family:'Oswald',sans-serif;font-weight:600;font-size:34px;letter-spacing:1px;text-transform:uppercase;text-align:center;padding:0 40px">
    Ofertas válidas até {VALIDADE} ou enquanto durarem os estoques</div>
</div>"""
    return page(body)


ANTIPULGAS = "Antipulgas e carrapatos"
CAES = [
    dict(slug="seresto-p", cat=ANTIPULGAS, size="P tamanho", brand="Coleira Seresto P",
         desc="Cães e gatos até 8 kg", price="149,99"),
    dict(slug="seresto-g", cat=ANTIPULGAS, size="G tamanho", brand="Coleira Seresto G",
         desc="Cães acima de 8 kg", price="189,99"),
    dict(slug="nexgard-4-10kg", cat=ANTIPULGAS, size="3 unidades", brand="NexGard",
         desc="Antipulgas e carrapatos · Cães de 4,1 a 10 kg", extra="Combo 3 unidades",
         price="189,99", rotulo="Combo por apenas"),
    dict(slug="origens-shih-tzu", cat="Ração para cães", size="10,1 kg", brand="Origens Shih Tzu e Lhasa Apso",
         desc="Cães adultos · Raças específicas", price="109,99"),
    dict(slug="guabi-natural-caes-medias", cat="Ração para cães", size="12 kg", brand="Guabi Natural",
         desc="Cães adultos · Raças médias", price="199,99"),
    dict(slug="bionatural-junior-grandes", cat="Ração para cães", size="15 kg", brand="Bionatural Júnior",
         desc="Raças grandes e gigantes", price="259,99"),
    dict(slug="bionatural-sensitive-peixe", cat="Super premium", size="15 kg", brand="Bionatural Sensitive",
         desc="Cães adultos · Peixe · Raças pequenas", price="279,99"),
    dict(slug="premier-diabetes-caes", cat="Nutrição clínica", size="10,1 kg", brand="Premier Diabetes",
         desc="Cães · Médio e grande porte", price="319,99"),
]
GATOS = [
    dict(slug="seresto-p", cat=ANTIPULGAS, size="P tamanho", brand="Coleira Seresto P",
         desc="Cães e gatos até 8 kg", price="149,99"),
    dict(slug="areia-bento", cat="Higiene", size="4 unidades", brand="Areia de Mandioca Bento",
         desc="Pacotes de 4 kg", extra="Combo 4 unidades", price="99,99", rotulo="Combo por apenas"),
    dict(slug="frost-gatos-filhotes", cat="Ração para gatos", size="7,5 kg", brand="Frost",
         desc="Gatos filhotes", price="169,99"),
    dict(slug="guabi-natural-gatos", cat="Ração para gatos", size="7,5 kg", brand="Guabi Natural",
         desc="Gatos adultos", price="189,99"),
    dict(slug="premier-nattu-gatos-castrados", cat="Ração para gatos", size="7,5 kg", brand="Premier Nattu",
         desc="Gatos castrados · Abóbora", price="199,99"),
    dict(slug="nd-tropical-gatos", cat="Super premium", size="7,5 kg", brand="N&amp;D Tropical Selection",
         desc="Gatos castrados · Frango", price="279,99"),
    dict(slug="premier-urinario-gatos", cat="Nutrição clínica", size="7,5 kg", brand="Premier Urinário",
         desc="Gatos adultos", price="299,99"),
    dict(slug="nd-pumpkin-gatos", cat="Super premium", size="7,5 kg", brand="N&amp;D Pumpkin",
         desc="Gatos adultos · Frango e romã", price="419,99"),
]


def campanhas():
    out = {}
    for nome, itens, publico, destaques in [
        ("caes", CAES, "para cães", ["seresto-g", "bionatural-sensitive-peixe", "nexgard-4-10kg"]),
        ("gatos", GATOS, "para gatos", ["premier-nattu-gatos-castrados", "nd-pumpkin-gatos", "guabi-natural-gatos"]),
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
