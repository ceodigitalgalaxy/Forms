"""Gera os carrosséis "Fecha Mês Bichão" (cães e gatos) em PNG 1080x1350.

Uso: python3 agropet-bichao/tools/gerar_fecha_mes.py
Saída: agropet-bichao/fecha-mes/{caes,gatos}/slide-N.png
"""
import base64
import pathlib
import subprocess
import tempfile

ROOT = pathlib.Path(__file__).resolve().parents[1]
LOGO = base64.b64encode((ROOT / "brand/logo-agropet-bichao.png").read_bytes()).decode()
LOGO_URI = f"data:image/png;base64,{LOGO}"

WHATS = "(51) 98062-1781"
VALIDADE = "31/10"
FOTOS = ROOT / "produtos"  # coloque aqui <slug>.png para exibir a foto no cartão

# Pegada de pet (SVG) usada como elemento gráfico
PAW = (
    '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">'
    '<ellipse cx="50" cy="68" rx="22" ry="19"/>'
    '<ellipse cx="22" cy="42" rx="10" ry="13"/><ellipse cx="40" cy="25" rx="10" ry="13"/>'
    '<ellipse cx="60" cy="25" rx="10" ry="13"/><ellipse cx="78" cy="42" rx="10" ry="13"/></svg>'
)

CSS = """
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800;900&display=block');
:root{--azul:#0A2588;--azul-esc:#061857;--laranja:#FAAA30;--verde:#AACF51;--creme:#FFF7EA;--tinta:#0B1433;}
*{box-sizing:border-box;margin:0;padding:0}
body{width:1080px;height:1350px;font-family:'Montserrat',sans-serif;overflow:hidden;color:var(--tinta)}
.slide{position:relative;width:1080px;height:1350px;overflow:hidden}
.bg-azul{background:radial-gradient(circle at 80% 15%,#1636b0 0,var(--azul) 45%,var(--azul-esc) 100%);color:#fff}
.bg-creme{background:var(--creme)}
.paw{position:absolute;fill:currentColor}
.paw svg{width:100%;height:100%}
.tag{display:inline-block;font-weight:800;font-size:30px;letter-spacing:3px;text-transform:uppercase;
  padding:14px 28px;border-radius:999px}
.logo-badge{position:absolute;background:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;
  box-shadow:0 10px 30px rgba(0,0,0,.18)}
.logo-badge img{width:100%;height:100%;object-fit:contain;border-radius:50%}
.counter{position:absolute;top:84px;right:84px;font-weight:800;font-size:26px;letter-spacing:2px;opacity:.75}

/* cabeçalho dos slides de produto */
.head{position:absolute;left:0;top:0;width:100%;height:330px;padding:84px 84px 0}
.head .tag{background:var(--acento);color:var(--azul)}
.head h2{font-weight:900;font-size:68px;line-height:1.02;margin-top:26px;letter-spacing:-1px}

.cards{position:absolute;left:72px;right:72px;top:340px;display:flex;flex-direction:column;gap:26px}
.card{display:flex;align-items:stretch;background:#fff;border-radius:30px;overflow:hidden;
  box-shadow:0 8px 24px rgba(10,37,136,.10);min-height:250px}
.card .size{width:190px;flex:none;background:var(--azul);color:#fff;display:flex;flex-direction:column;
  align-items:center;justify-content:center;text-align:center;padding:16px}
.card .size b{font-weight:900;font-size:58px;line-height:1}
.card .size small{font-weight:700;font-size:22px;letter-spacing:2px;margin-top:8px;text-transform:uppercase;color:var(--acento)}
.card .info{flex:1;padding:30px 30px;display:flex;flex-direction:column;justify-content:center}
.card .brand{font-weight:900;font-size:44px;line-height:1.05;color:var(--azul);letter-spacing:-.5px}
.card .desc{font-weight:600;font-size:28px;line-height:1.25;margin-top:10px;color:#3a4366}
.card .extra{display:inline-block;align-self:flex-start;margin-top:14px;font-weight:800;font-size:22px;letter-spacing:1px;
  text-transform:uppercase;background:var(--verde);color:var(--azul-esc);padding:8px 16px;border-radius:10px}
.price{flex:none;width:290px;padding:0 18px;background:var(--laranja);display:flex;flex-direction:column;align-items:center;justify-content:center;
  color:var(--azul-esc)}
.price .por{font-weight:800;font-size:22px;letter-spacing:2px;text-transform:uppercase}
.price .val{display:flex;align-items:flex-start;font-weight:900;line-height:1}
.price .rs{font-size:28px;margin-top:12px;margin-right:6px}
.price .int{font-size:78px;letter-spacing:-2px}
.price .cent{font-size:36px;margin-top:10px}

/* versão premium (fundo azul) */
.premium .card{background:rgba(255,255,255,.06);border:2px solid rgba(250,170,48,.55);box-shadow:none}
.premium .card .size{background:transparent;border-right:2px solid rgba(250,170,48,.35)}
.premium .card .brand{color:#fff}
.premium .card .desc{color:#d6dcf5}
.premium .price{background:transparent;color:var(--laranja);border-left:2px solid rgba(250,170,48,.35)}
.premium .card .extra{background:var(--laranja)}
.big .card{min-height:340px}
.big .card .brand{font-size:52px}

.foot{position:absolute;left:84px;right:84px;bottom:56px;height:120px;display:flex;align-items:center;justify-content:space-between}
.foot .wa{font-weight:800;font-size:30px}
.foot .wa span{display:block;font-weight:600;font-size:22px;opacity:.75;letter-spacing:1px;text-transform:uppercase;margin-bottom:4px}
.foot .logo-badge{position:static;width:140px;height:140px}
.foot .aviso{font-weight:700;font-size:22px;line-height:1.3;text-align:center;letter-spacing:1px;text-transform:uppercase;
  border:3px solid var(--laranja);border-radius:16px;padding:10px 18px}
.foot .aviso b{font-weight:900;color:var(--laranja)}
.bg-creme .foot .aviso b{color:#c66f00}
.card .foto{width:210px;flex:none;background:#fff;display:flex;align-items:center;justify-content:center;padding:14px}
.card .foto img{max-width:100%;max-height:220px;object-fit:contain}
.card .chip{display:inline-block;align-self:flex-start;margin-top:12px;font-weight:900;font-size:24px;background:var(--azul);color:#fff;padding:6px 14px;border-radius:10px}
.swipe{font-weight:800;font-size:26px;letter-spacing:2px;text-transform:uppercase}
"""

WA_ICON = (
    '<svg viewBox="0 0 32 32" width="40" height="40" style="vertical-align:-9px;margin-right:10px" fill="currentColor">'
    '<path d="M16 3C9 3 3.3 8.6 3.3 15.6c0 2.4.7 4.7 1.9 6.7L3 29l6.9-2.2c1.9 1 4 1.6 6.1 1.6 7 0 12.7-5.7 '
    '12.7-12.7S23 3 16 3zm0 23.1c-1.9 0-3.8-.5-5.4-1.5l-.4-.2-4.1 1.3 1.3-4-.3-.4c-1.1-1.7-1.6-3.6-1.6-5.6 '
    '0-5.8 4.7-10.5 10.5-10.5S26.5 9.9 26.5 15.6 21.8 26.1 16 26.1zm5.8-7.9c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2'
    '-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.2-1.3-.5-2.6-1.6-1-.9-1.6-1.9-1.8-2.3-.2-.3 0-.5.1-.7l.5-.6c.2-.2.2-.4.3-.6'
    '.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.8s1.2 3.2 1.4 3.5c.2.2 2.4 3.6 '
    '5.8 5.1 2.1.9 2.9 1 4 .8.6-.1 1.9-.8 2.2-1.5.3-.7.3-1.4.2-1.5-.1-.2-.3-.3-.6-.4z"/></svg>'
)


def paws(specs):
    return "".join(
        f'<div class="paw" style="left:{x}px;top:{y}px;width:{s}px;height:{s}px;transform:rotate({r}deg);'
        f'opacity:{o};color:{c}">{PAW}</div>'
        for x, y, s, r, o, c in specs
    )


def price(valor, rotulo="por"):
    inteiro, cent = valor.split(",")
    return (
        f'<div class="price"><div class="por">{rotulo}</div><div class="val"><span class="rs">R$</span>'
        f'<span class="int">{inteiro}</span><span class="cent">,{cent}</span></div></div>'
    )


def foto(slug):
    for ext in ("png", "jpg", "jpeg", "webp"):
        f = FOTOS / f"{slug}.{ext}"
        if f.exists():
            mime = "jpeg" if ext in ("jpg", "jpeg") else ext
            return f"data:image/{mime};base64,{base64.b64encode(f.read_bytes()).decode()}"
    return None


def card(p):
    extra = f'<span class="extra">{p["extra"]}</span>' if p.get("extra") else ""
    img = foto(p["slug"]) if p.get("slug") else None
    if img:
        left = f'<div class="foto"><img src="{img}" alt="{p["brand"]}"></div>'
        extra = f'<span class="chip">{p["size"]} {p["unit"]}</span>' + extra
    else:
        left = f'<div class="size"><b>{p["size"]}</b><small>{p["unit"]}</small></div>'
    return (
        f'<div class="card">{left}'
        f'<div class="info"><div class="brand">{p["brand"]}</div><div class="desc">{p["desc"]}</div>{extra}</div>'
        f'{price(p["price"], p.get("rotulo", "por"))}</div>'
    )


def footer(dark):
    color = "#fff" if dark else "var(--azul)"
    return (
        f'<div class="foot" style="color:{color}"><div class="wa"><span>Peça pelo WhatsApp</span>{WA_ICON}{WHATS}</div>'
        f'<div class="aviso">Válido até {VALIDADE}<br><b>Poucas unidades</b></div>'
        f'<div class="logo-badge"><img src="{LOGO_URI}" alt="Agropet Bichão"></div></div>'
    )


def page(body, acento):
    return (
        f'<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>{CSS}'
        f':root{{--acento:{acento}}}</style></head><body>{body}</body></html>'
    )


def capa(publico, subtitulo, total, acento):
    deco = paws([(760, 470, 260, 18, .10, "#fff"), (880, 250, 120, -20, .12, "#fff"),
                 (40, 1000, 150, -25, .08, "#fff"), (690, 820, 90, 30, .10, "#fff")])
    body = f"""
<div class="slide bg-azul">
  {deco}
  <div style="position:absolute;right:-180px;bottom:-200px;width:820px;height:820px;border-radius:50%;background:rgba(255,255,255,.08)"></div>
  <div style="position:absolute;right:-60px;bottom:-80px;width:580px;height:580px;border-radius:50%;background:var(--laranja)"></div>
  <div class="counter">1/{total}</div>
  <div style="position:absolute;left:84px;top:96px;right:84px">
    <span class="tag" style="background:{acento};color:var(--azul)">Ofertas {publico}</span>
    <h1 style="font-weight:900;font-size:150px;line-height:.92;margin-top:44px;letter-spacing:-4px">FECHA<br>MÊS<br>
      <span style="color:var(--laranja)">BICHÃO</span></h1>
    <p style="font-weight:600;font-size:38px;line-height:1.3;margin-top:40px;max-width:600px">{subtitulo}</p>
    <div style="margin-top:34px;display:inline-block;background:#fff;color:var(--azul);font-weight:900;font-size:30px;
      padding:14px 24px;border-radius:14px;letter-spacing:1px;line-height:1.25">VÁLIDO ATÉ {VALIDADE}<br><span style="color:#c66f00">POUCAS UNIDADES</span></div>
  </div>
  <div class="logo-badge" style="right:120px;bottom:150px;width:400px;height:400px;border:10px solid #fff">
    <img src="{LOGO_URI}" alt="Agropet Bichão"></div>
  <div class="swipe" style="position:absolute;left:84px;bottom:110px;display:flex;align-items:center;gap:16px">
    Arraste para ver
    <svg width="60" height="30" viewBox="0 0 60 30"><path d="M0 15h52M40 3l14 12-14 12" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
  </div>
</div>"""
    return page(body, acento)


def produtos(n, total, tag, titulo, itens, acento, premium=False):
    cls = "slide " + ("bg-azul premium" if premium else "bg-creme")
    if len(itens) == 2:
        cls += " big"
    cor_titulo = "#fff" if premium else "var(--azul)"
    deco = paws([(880, 170, 130, 20, .07 if premium else .06, "#fff" if premium else "var(--azul)")])
    body = f"""
<div class="{cls}">
  {deco}
  <div class="counter" style="color:{cor_titulo}">{n}/{total}</div>
  <div class="head"><span class="tag">{tag}</span><h2 style="color:{cor_titulo}">{titulo}</h2></div>
  <div class="cards">{''.join(card(i) for i in itens)}</div>
  {footer(premium)}
</div>"""
    return page(body, acento)


def cta(total, titulo, acento):
    deco = paws([(820, 140, 160, 20, .10, "#fff"), (60, 560, 110, -20, .08, "#fff"), (900, 760, 90, 15, .08, "#fff")])
    body = f"""
<div class="slide bg-azul">
  {deco}
  <div class="counter">{total}/{total}</div>
  <div style="position:absolute;left:84px;right:84px;top:96px">
    <span class="tag" style="background:{acento};color:var(--azul)">Válido até {VALIDADE}</span>
    <h2 style="font-weight:900;font-size:84px;line-height:1;margin-top:34px;letter-spacing:-2px">{titulo}</h2>
    <p style="font-weight:600;font-size:34px;line-height:1.3;margin-top:28px;max-width:860px">
      Chame no WhatsApp, separe seus produtos e receba em casa.</p>
    <div style="margin-top:46px;display:inline-flex;align-items:center;background:var(--laranja);color:var(--azul-esc);
      font-weight:900;font-size:50px;padding:28px 44px;border-radius:24px;box-shadow:0 12px 0 #c9821a">
      {WA_ICON.replace('width="40" height="40"', 'width="58" height="58"')}{WHATS}</div>
    <div style="margin-top:56px;display:flex;flex-direction:column;gap:20px;font-size:32px;font-weight:700">
      <div><span style="color:var(--laranja)">●</span>&nbsp; Tele-entrega grátis: consulte condições</div>
      <div><span style="color:var(--laranja)">●</span>&nbsp; Entregamos para toda Porto Alegre</div>
      <div><span style="color:var(--laranja)">●</span>&nbsp; Av. Alberto Pasqualini, 451 — Jardim Sabará</div>
    </div>
  </div>
  <div class="logo-badge" style="right:84px;bottom:96px;width:300px;height:300px;border:8px solid #fff">
    <img src="{LOGO_URI}" alt="Agropet Bichão"></div>
  <p style="position:absolute;left:84px;bottom:100px;max-width:560px;font-weight:600;font-size:22px;line-height:1.4;opacity:.7">
    Ofertas válidas até {VALIDADE} ou enquanto durarem os estoques.</p>
</div>"""
    return page(body, acento)


SOLO_CSS = """
.solo .top{position:absolute;left:84px;right:84px;top:84px;display:flex;justify-content:space-between;align-items:center}
.solo .top .tag{background:var(--acento);color:var(--azul)}
.solo .counter{position:static}
.solo .vitrine{position:absolute;left:72px;right:72px;top:180px;height:650px;border-radius:40px;background:#fff;
  display:flex;align-items:center;justify-content:center;overflow:hidden;box-shadow:0 14px 40px rgba(10,37,136,.12)}
.solo .vitrine::before{content:"";position:absolute;width:520px;height:520px;border-radius:50%;background:radial-gradient(circle,rgba(250,170,48,.28) 0,rgba(250,170,48,.10) 55%,rgba(250,170,48,0) 70%)}
.solo .vitrine img{position:relative;max-width:80%;max-height:86%;object-fit:contain;filter:drop-shadow(0 18px 24px rgba(10,20,60,.22))}
.solo .vitrine .semfoto{text-align:center;color:var(--azul)}
.solo .vitrine .semfoto b{display:block;font-weight:900;font-size:220px;line-height:.9;letter-spacing:-8px}
.solo .vitrine .semfoto small{font-weight:800;font-size:40px;letter-spacing:6px;text-transform:uppercase;color:var(--laranja)}
.solo .selo{position:absolute;top:150px;right:52px;width:200px;height:200px;border-radius:50%;background:var(--acento);
  color:var(--azul-esc);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;
  font-weight:900;font-size:26px;line-height:1.1;transform:rotate(10deg);box-shadow:0 8px 20px rgba(0,0,0,.18)}
.solo .selo b{font-size:40px}
.solo .dados{position:absolute;left:84px;right:84px;top:870px;display:flex;gap:30px;align-items:stretch}
.solo .txt{flex:1;display:flex;flex-direction:column;justify-content:center}
.solo .nome{font-weight:900;font-size:58px;line-height:1.02;letter-spacing:-1px}
.solo .desc{font-weight:600;font-size:30px;line-height:1.3;margin-top:12px;opacity:.85}
.solo .chips{display:flex;gap:12px;margin-top:18px;flex-wrap:wrap}
.solo .chips span{font-weight:900;font-size:24px;padding:8px 16px;border-radius:10px;background:var(--azul);color:#fff;letter-spacing:1px;text-transform:uppercase}
.solo .chips span.v{background:var(--verde);color:var(--azul-esc)}
.solo .preco{flex:none;width:330px;border-radius:30px;background:var(--laranja);color:var(--azul-esc);
  display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px}
.solo .preco .por{font-weight:800;font-size:24px;letter-spacing:2px;text-transform:uppercase}
.solo .preco .val{display:flex;align-items:flex-start;font-weight:900;line-height:1}
.solo .preco .rs{font-size:30px;margin-top:16px;margin-right:6px}
.solo .preco .int{font-size:98px;letter-spacing:-3px}
.solo .preco .cent{font-size:46px;margin-top:14px}
.solo.bg-azul .vitrine{box-shadow:0 0 0 4px rgba(250,170,48,.6)}
.solo.bg-azul .chips span{background:#fff;color:var(--azul)}
.solo.bg-creme .nome{color:var(--azul)}
.solo.bg-creme .desc{color:#3a4366}
"""


def produto(n, total, p, acento):
    premium = p.get("premium", False)
    cls = "slide solo " + ("bg-azul" if premium else "bg-creme")
    img = foto(p["slug"])
    if img:
        vitrine = f'<img src="{img}" alt="{p["brand"]}">'
    else:
        vitrine = f'<div class="semfoto"><b>{p["size"]}</b><small>{p["unit"]}</small></div>'
    chips = f'<span>{p["size"]} {p["unit"]}</span>' if p["unit"] in ("kg",) else ""
    if p.get("extra"):
        chips += f'<span class="v">{p["extra"]}</span>'
    inteiro, cent = p["price"].split(",")
    cor = "#fff" if premium else "var(--azul)"
    body = f"""
<div class="{cls}">
  <div class="top"><span class="tag">{p["cat"]}</span><span class="counter" style="color:{cor}">{n}/{total}</span></div>
  <div class="vitrine">{vitrine}</div>
  <div class="selo"><span>POUCAS</span><b>UNID.</b></div>
  <div class="dados">
    <div class="txt"><div class="nome">{p["brand"]}</div><div class="desc">{p["desc"]}</div><div class="chips">{chips}</div></div>
    <div class="preco"><div class="por">{p.get("rotulo", "por")}</div><div class="val"><span class="rs">R$</span>
      <span class="int">{inteiro}</span><span class="cent">,{cent}</span></div></div>
  </div>
  {footer(premium)}
</div>"""
    return page(body, acento).replace("</style>", SOLO_CSS + "</style>", 1)


CAES = [
    dict(slug="seresto-p", cat="Antipulgas e carrapatos", size="P", unit="Tamanho", brand="Coleira Seresto P",
         desc="Proteção contra pulgas e carrapatos", price="149,99"),
    dict(slug="seresto-g", cat="Antipulgas e carrapatos", size="G", unit="Tamanho", brand="Coleira Seresto G",
         desc="Proteção contra pulgas e carrapatos", price="189,99"),
    dict(slug="nexgard-4-10kg", cat="Antipulgas e carrapatos", size="3", unit="unidades", brand="NexGard",
         desc="Cães de 4,1 a 10 kg · 3 tabletes", extra="Combo 3 unidades", price="189,99", rotulo="combo por"),
    dict(slug="origens-shih-tzu", cat="Ração para cães", size="10,1", unit="kg", brand="Origens Shih Tzu e Lhasa Apso",
         desc="Cães adultos · Raças específicas", price="109,99"),
    dict(slug="guabi-natural-caes-medias", cat="Ração para cães", size="12", unit="kg", brand="Guabi Natural",
         desc="Cães adultos · Raças médias", price="199,99"),
    dict(slug="bionatural-junior-grandes", cat="Ração para cães", size="15", unit="kg", brand="Bionatural Júnior",
         desc="Raças grandes e gigantes", price="259,99"),
    dict(slug="bionatural-sensitive-peixe", cat="Super premium", size="15", unit="kg", brand="Bionatural Sensitive",
         desc="Cães adultos · Peixe · Raças pequenas", price="279,99", premium=True),
    dict(slug="premier-diabetes-caes", cat="Nutrição clínica", size="10,1", unit="kg", brand="Premier Diabetes",
         desc="Cães · Médio e grande porte", price="319,99", premium=True),
]
GATOS = [
    dict(slug="seresto-p", cat="Antipulgas e carrapatos", size="P", unit="Tamanho", brand="Coleira Seresto P",
         desc="Proteção contra pulgas e carrapatos", price="149,99"),
    dict(slug="areia-bento", cat="Higiene", size="4", unit="unidades", brand="Areia de Mandioca Bento",
         desc="Pacotes de 4 kg", extra="Combo 4 unidades", price="99,99", rotulo="combo por"),
    dict(slug="frost-gatos-filhotes", cat="Ração para gatos", size="7,5", unit="kg", brand="Frost",
         desc="Gatos filhotes", price="169,99"),
    dict(slug="guabi-natural-gatos", cat="Ração para gatos", size="7,5", unit="kg", brand="Guabi Natural",
         desc="Gatos adultos", price="189,99"),
    dict(slug="premier-nattu-gatos-castrados", cat="Ração para gatos", size="7,5", unit="kg", brand="Premier Nattu",
         desc="Gatos castrados · Abóbora", price="199,99"),
    dict(slug="nd-tropical-gatos", cat="Super premium", size="7,5", unit="kg", brand="N&amp;D Tropical Selection",
         desc="Gatos castrados · Frango", price="279,99", premium=True),
    dict(slug="premier-urinario-gatos", cat="Nutrição clínica", size="7,5", unit="kg", brand="Premier Urinário",
         desc="Nutrição Clínica · Gatos adultos", price="299,99", premium=True),
    dict(slug="nd-pumpkin-gatos", cat="Super premium", size="7,5", unit="kg", brand="N&amp;D Pumpkin",
         desc="Gatos adultos · Frango e romã", price="419,99", premium=True),
]


def campanhas():
    out = {}
    for nome, itens, publico, sub, acento in [
        ("caes", CAES, "para cães", "Antipulgas e rações das melhores marcas com preço de fim de mês.", "var(--laranja)"),
        ("gatos", GATOS, "para gatos", "Rações, areia e antipulgas para o seu gato com preço de fim de mês.", "var(--verde)"),
    ]:
        total = len(itens) + 2
        slides = [capa(publico, sub, total, acento)]
        slides += [produto(i + 2, total, p, acento) for i, p in enumerate(itens)]
        slides.append(cta(total, "Poucas unidades.<br>Garanta antes<br>que acabe!", acento))
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
