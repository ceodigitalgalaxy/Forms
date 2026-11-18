"""Campanha "Black Friday antecipada" — Santuário Pet Center.

9 conceitos (3 creche, 3 banho, 3 hotel) x 2 formatos (stories 1080x1920, feed 1080x1350).
Uso: python3 santuario-pet/gerar_black_antecipada.py
Saída: santuario-pet/black-antecipada/{stories,feed}/NN-nome.png
"""
import base64
import os
import pathlib
import subprocess
import tempfile

ROOT = pathlib.Path(__file__).resolve().parent
OUT = ROOT / "black-antecipada"
RENDER = ROOT.parent / "agropet-bichao/tools/render.js"


def uri(p, mime="image/jpeg"):
    return f"data:{mime};base64,{base64.b64encode(p.read_bytes()).decode()}"


LOGO = uri(ROOT / "brand/logo-instagram-150px.jpg")


def foto(n):
    return uri(ROOT / "fotos" / f"{n}.jpg")


HOTEL = "Av. Nilo Peçanha, 2385 · (51) 98963-7205"

CSS = """
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,700;0,9..144,900;1,9..144,400;1,9..144,600&family=Nunito+Sans:opsz,wght@6..12,500;6..12,700;6..12,800;6..12,900&family=Quicksand:wght@600;700&display=block');
:root{--g:#06603A;--gd:#0A3F28;--lime:#AED250;--gl:#DCEBB4;--off:#F5F7EF;--ink:#14261C;--k:#0B110D}
*{box-sizing:border-box;margin:0;padding:0}
body{width:1080px;overflow:hidden;font-family:'Nunito Sans',sans-serif;-webkit-font-smoothing:antialiased;color:var(--ink)}
.p{position:relative;width:1080px;overflow:hidden}
.a{position:absolute}
.serif{font-family:'Fraunces',serif}
.it{font-style:italic}
.imp{font-family:'Anton',sans-serif;font-weight:400;text-transform:uppercase;letter-spacing:.5px}
.ph{position:absolute;background-size:cover;background-repeat:no-repeat}
.logo{display:block;border-radius:50%;object-fit:cover}
.tag{font-family:'Nunito Sans';font-weight:800;text-transform:uppercase;letter-spacing:4px;font-size:22px;display:flex;align-items:center;gap:14px}
.tag i{display:block;width:44px;height:3px;background:currentColor}
.rod{font-weight:700;font-size:24px;letter-spacing:1.5px;text-transform:uppercase}
.cta{font-weight:800;font-size:28px;display:inline-flex;align-items:center;gap:12px}
.cta svg{flex:none}
.sup{font-weight:500;line-height:1.45;text-wrap:pretty}
"""

SETA = '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'


def page(h, bg, body):
    return (f'<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>{CSS}'
            f'body{{height:{h}px}}.p{{height:{h}px;background:{bg}}}</style></head><body><div class="p">{body}</div></body></html>')


def logo(x, y, s=120, ring="#fff"):
    return f'<img class="a logo" src="{LOGO}" style="left:{x}px;top:{y}px;width:{s}px;height:{s}px;box-shadow:0 0 0 4px {ring}" alt="Santuário Pet Center">'


def tag(x, y, cor, txt="Black Friday antecipada"):
    return f'<div class="a tag" style="left:{x}px;top:{y}px;color:{cor}"><i></i>{txt}</div>'


# ---------------------------------------------------------------- CRECHE
def creche1(f):
    """Impacto nos números: 60 gigante sobre verde escuro + foto em recreação."""
    S = f == "story"
    H = 1920 if S else 1350
    if S:
        body = f"""
  {logo(72, 150)}{tag(220, 196, 'var(--lime)')}
  <div class="a serif" style="left:56px;top:300px;font-size:430px;font-weight:900;line-height:.8;color:var(--off);letter-spacing:-18px">60</div>
  <div class="a imp" style="left:72px;top:660px;font-size:118px;line-height:1;color:var(--lime)">Diárias</div>
  <div class="a serif it" style="left:72px;top:800px;width:560px;font-size:50px;line-height:1.12;color:var(--off);font-weight:400">Um desconto que vai te surpreender.</div>
  <div class="ph" style="left:640px;top:330px;width:380px;height:620px;border-radius:190px 190px 24px 24px;background-image:url({foto('creche-playground')});background-position:56% 40%"></div>
  <div class="a sup" style="left:72px;top:1010px;width:936px;font-size:33px;color:#CFE0D3">A Black Friday antecipada chegou à creche Santuário, com uma condição especial <b style="color:var(--off)">sem diferenciação de preço por porte</b>.</div>
  <div class="a" style="left:72px;right:72px;top:1210px;height:2px;background:rgba(220,235,180,.35)"></div>
  <div class="a rod" style="left:72px;top:1246px;color:var(--lime)">Vagas limitadas • Somente até 30/11</div>
  <div class="a cta" style="left:72px;top:1310px;color:var(--off)">Consulte a oferta pelo WhatsApp {SETA}</div>
  <div class="a" style="left:72px;top:1690px;font-family:Quicksand;font-weight:700;font-size:26px;color:#9DB8A6">@santuariopet · Todo pet é único</div>"""
    else:
        body = f"""
  <div class="ph" style="right:0;top:0;width:470px;height:1350px;background-image:url({foto('creche-playground')});background-position:52% 40%"></div>
  {logo(64, 64, 104)}{tag(64, 196, 'var(--lime)')}
  <div class="a serif" style="left:44px;top:262px;font-size:360px;font-weight:900;line-height:.8;color:var(--off);letter-spacing:-16px">60</div>
  <div class="a imp" style="left:64px;top:566px;font-size:104px;line-height:1;color:var(--lime)">Diárias</div>
  <div class="a serif it" style="left:64px;top:694px;width:500px;font-size:46px;line-height:1.12;color:var(--off);font-weight:400">Um desconto que vai te surpreender.</div>
  <div class="a sup" style="left:64px;top:850px;width:500px;font-size:27px;color:#CFE0D3">A Black Friday antecipada chegou à creche Santuário, com uma condição especial <b style="color:var(--off)">sem diferenciação de preço por porte</b>.</div>
  <div class="a rod" style="left:64px;top:1130px;width:500px;font-size:21px;color:var(--lime)">Vagas limitadas • Somente até 30/11</div>
  <div class="a cta" style="left:64px;top:1186px;font-size:25px;color:var(--off)">Consulte a oferta pelo WhatsApp {SETA}</div>"""
    return page(H, "var(--gd)", body)


def creche2(f):
    """Criatividade e desejo: manchete ousada sobre preto + foto espontânea de recreação."""
    S = f == "story"
    H = 1920 if S else 1350
    if S:
        body = f"""
  <div class="ph" style="left:0;top:1080px;width:1080px;height:840px;background-image:url({foto('creche-brincando')});background-position:50% 50%"></div>
  <div class="a" style="left:0;top:1060px;width:1080px;height:260px;background:linear-gradient(var(--k),rgba(11,17,13,0))"></div>
  {logo(72, 150, 110)}{tag(212, 192, 'var(--lime)')}
  <div class="a imp" style="left:72px;top:320px;width:936px;font-size:112px;line-height:1.02;color:var(--off)">A Black Friday<br>da creche não<br>veio para</div>
  <div class="a serif it" style="left:66px;top:640px;font-size:176px;line-height:1;font-weight:600;color:var(--lime);letter-spacing:-3px">brincar.</div>
  <div class="a" style="left:72px;top:870px;width:600px">
    <div class="serif" style="font-size:44px;font-weight:700;color:var(--off);line-height:1.15">60 diárias com uma condição especial.</div>
    <div class="sup" style="font-size:28px;color:#D5DDD7;margin-top:14px">Mais oportunidades de recreação, atividades e diversão na rotina do teu pet.</div>
  </div>
  <div class="a" style="left:0;right:0;top:1500px;height:170px;background:linear-gradient(rgba(11,17,13,0),rgba(11,17,13,.78))"></div>
  <div class="a rod" style="left:72px;top:1560px;color:var(--lime);text-shadow:0 2px 10px rgba(0,0,0,.6)">Oferta até 30/11 • Vagas limitadas</div>
  <div class="a cta" style="left:72px;top:1612px;color:#fff;text-shadow:0 2px 10px rgba(0,0,0,.6)">Descubra a condição especial {SETA}</div>"""
    else:
        body = f"""
  <div class="ph" style="left:540px;top:0;width:540px;height:1350px;background-image:url({foto('creche-brincando')});background-position:46% 50%"></div>
  <div class="a" style="left:520px;top:0;width:120px;height:1350px;background:linear-gradient(90deg,var(--k),rgba(11,17,13,0))"></div>
  {logo(64, 64, 100)}{tag(64, 200, 'var(--lime)')}
  <div class="a imp" style="left:64px;top:270px;width:480px;font-size:84px;line-height:1.04;color:var(--off)">A Black Friday da creche não veio para</div>
  <div class="a serif it" style="left:58px;top:615px;font-size:132px;line-height:1;font-weight:600;color:var(--lime);letter-spacing:-2px">brincar.</div>
  <div class="a serif" style="left:64px;top:800px;width:440px;font-size:38px;font-weight:700;color:var(--off);line-height:1.15">60 diárias com uma condição especial.</div>
  <div class="a sup" style="left:64px;top:910px;width:440px;font-size:25px;color:#D5DDD7">Mais oportunidades de recreação, atividades e diversão na rotina do teu pet.</div>
  <div class="a rod" style="left:64px;top:1150px;font-size:20px;color:var(--lime)">Oferta até 30/11 • Vagas limitadas</div>
  <div class="a cta" style="left:64px;top:1200px;font-size:25px;color:#fff">Descubra a condição especial {SETA}</div>"""
    return page(H, "var(--k)", body)


def creche3(f):
    """Benefício comercial: off-white editorial, foto de portes diferentes em arco."""
    S = f == "story"
    H = 1920 if S else 1350
    if S:
        body = f"""
  {logo(72, 150, 110, 'var(--gl)')}{tag(212, 192, 'var(--g)')}
  <div class="a serif it" style="left:72px;top:330px;font-size:92px;font-weight:400;color:var(--g);line-height:1">Porte diferente.</div>
  <div class="a imp" style="left:72px;top:450px;width:936px;font-size:150px;line-height:.98;color:var(--gd)">Mesmo preço<br><span style="background:linear-gradient(transparent 62%,var(--lime) 62%,var(--lime) 92%,transparent 92%)">especial.</span></div>
  <div class="ph" style="left:72px;top:920px;width:580px;height:600px;border-radius:290px 300px 28px 28px;background-image:url({foto('creche-grupo')});background-position:50% 55%"></div>
  <div class="a sup" style="left:690px;top:960px;width:320px;font-size:30px;color:var(--ink)">Aproveita a Black Friday antecipada e conhece a condição do plano de <b>60 diárias</b> da creche Santuário.</div>
  <div class="a" style="left:690px;top:1330px;width:320px">
    <div class="rod" style="font-size:22px;line-height:1.5;color:var(--g)">Contratações até 30/11<br>Vagas limitadas</div>
    <div class="cta" style="margin-top:20px;color:var(--gd)">Fala com a equipe {SETA}</div>
  </div>"""
    else:
        body = f"""
  <div class="ph" style="right:64px;top:300px;width:420px;height:560px;border-radius:210px 210px 24px 24px;background-image:url({foto('creche-grupo')});background-position:50% 55%"></div>
  {logo(64, 64, 100, 'var(--gl)')}{tag(194, 102, 'var(--g)')}
  <div class="a serif it" style="left:64px;top:300px;font-size:68px;font-weight:400;color:var(--g);line-height:1">Porte diferente.</div>
  <div class="a imp" style="left:64px;top:400px;width:500px;font-size:132px;line-height:.96;color:var(--gd)">Mesmo<br>preço<br><span style="background:linear-gradient(transparent 62%,var(--lime) 62%,var(--lime) 92%,transparent 92%)">especial.</span></div>
  <div class="a sup" style="left:64px;top:930px;width:900px;font-size:29px;color:var(--ink)">Aproveita a Black Friday antecipada e conhece a condição do plano de <b>60 diárias</b> da creche Santuário.</div>
  <div class="a" style="left:64px;right:64px;top:1100px;height:2px;background:rgba(6,96,58,.25)"></div>
  <div class="a rod" style="left:64px;top:1140px;font-size:21px;color:var(--g)">Contratações até 30/11 • Vagas limitadas</div>
  <div class="a cta" style="left:64px;top:1196px;font-size:26px;color:var(--gd)">Fala com a equipe {SETA}</div>"""
    return page(H, "var(--off)", body)


# ---------------------------------------------------------------- BANHO
def banho1(f):
    """O retorno: editorial creme, 'ELE VOLTOU.' dominante + retrato do pet arrumado."""
    S = f == "story"
    H = 1920 if S else 1350
    if S:
        body = f"""
  {logo(72, 150, 110, 'var(--gl)')}{tag(212, 192, 'var(--g)')}
  <div class="a serif it" style="left:72px;top:310px;font-size:84px;font-weight:400;color:var(--g)">Vocês pediram.</div>
  <div class="a imp" style="left:68px;top:410px;font-size:176px;line-height:1;color:var(--gd);white-space:nowrap">Ele voltou.</div>
  <div class="ph" style="left:72px;top:640px;width:922px;height:620px;border-radius:24px;background-image:url({foto('banho-shihtzu')});background-position:50% 62%;box-shadow:14px 14px 0 var(--lime)"></div>
  <div class="a serif" style="left:72px;top:1310px;width:900px;font-size:44px;font-weight:500;line-height:1.2;color:var(--ink)">O plano de <b style="font-weight:900;color:var(--g)">12 banhos</b> está de volta na Black Friday antecipada da Santuário Pet!</div>
  <div class="a rod" style="left:72px;top:1500px;color:var(--g)">Condições especiais • Somente até 30/11</div>
  <div class="a cta" style="left:72px;top:1552px;color:var(--gd)">Conheça a oferta {SETA}</div>
  <div class="a" style="left:72px;top:1700px;font-family:Quicksand;font-weight:700;font-size:26px;color:#6E8A78">@santuariopet · Todo pet é único</div>"""
    else:
        body = f"""
  <div class="ph" style="left:0;top:0;width:1080px;height:600px;background-image:url({foto('banho-shihtzu')});background-position:46% 34%"></div>
  {logo(64, 56, 100)}{tag(64, 636, 'var(--g)')}
  <div class="a serif it" style="left:64px;top:684px;font-size:60px;font-weight:400;color:var(--g)">Vocês pediram.</div>
  <div class="a imp" style="left:60px;top:764px;font-size:190px;line-height:.92;color:var(--gd)">Ele voltou.</div>
  <div class="a serif" style="left:64px;top:990px;width:900px;font-size:36px;font-weight:500;line-height:1.25;color:var(--ink)">O plano de <b style="font-weight:900;color:var(--g)">12 banhos</b> está de volta na Black Friday antecipada da Santuário Pet!</div>
  <div class="a rod" style="left:64px;top:1170px;font-size:21px;color:var(--g)">Condições especiais • Somente até 30/11</div>
  <div class="a cta" style="left:64px;top:1222px;font-size:26px;color:var(--gd)">Conheça a oferta {SETA}</div>"""
    return page(H, "#F1EDE3", body)


def banho2(f):
    """Oferta em destaque: 12 serifado gigante + 'BANHOS' em sans, verde escuro e foto na toalha."""
    S = f == "story"
    H = 1920 if S else 1350
    if S:
        body = f"""
  <div class="ph" style="right:0;top:760px;width:640px;height:1160px;background-image:url({foto('banho-toalha')});background-position:50% 30%;border-radius:40px 0 0 0"></div>
  {logo(72, 150, 110)}{tag(212, 192, 'var(--lime)')}
  <div class="a serif" style="left:44px;top:260px;font-size:560px;font-weight:900;line-height:.82;color:var(--off);letter-spacing:-30px">12</div>
  <div class="a imp" style="left:72px;top:745px;font-size:130px;line-height:1;color:var(--lime)">Banhos</div>
  <div class="a serif it" style="left:72px;top:900px;width:340px;font-size:48px;line-height:1.1;color:var(--off);font-weight:400">Uma condição imperdível.</div>
  <div class="a sup" style="left:72px;top:1130px;width:330px;font-size:29px;color:#CFE0D3">Planeja os banhos do teu pet com uma condição especial de Black Friday.</div>
  <div class="a rod" style="left:72px;top:1390px;width:330px;font-size:22px;line-height:1.5;color:var(--lime)">Black Friday antecipada<br>Até 30/11</div>
  <div class="a cta" style="left:72px;top:1490px;color:var(--off)">Consulte os valores {SETA}</div>"""
    else:
        body = f"""
  <div class="ph" style="left:600px;top:0;width:480px;height:1350px;background-image:url({foto('banho-toalha')});background-position:50% 40%"></div>
  {logo(64, 64, 100)}{tag(64, 192, 'var(--lime)')}
  <div class="a serif" style="left:36px;top:250px;font-size:430px;font-weight:900;line-height:.82;color:var(--off);letter-spacing:-26px">12</div>
  <div class="a imp" style="left:64px;top:620px;font-size:120px;line-height:1;color:var(--lime)">Banhos</div>
  <div class="a serif it" style="left:64px;top:766px;width:480px;font-size:46px;line-height:1.1;color:var(--off);font-weight:400">Uma condição imperdível.</div>
  <div class="a sup" style="left:64px;top:916px;width:480px;font-size:27px;color:#CFE0D3">Planeja os banhos do teu pet com uma condição especial de Black Friday.</div>
  <div class="a rod" style="left:64px;top:1130px;font-size:20px;color:var(--lime)">Black Friday antecipada • Até 30/11</div>
  <div class="a cta" style="left:64px;top:1184px;font-size:26px;color:var(--off)">Consulte os valores {SETA}</div>"""
    return page(H, "var(--g)", body)


def banho3(f):
    """Curiosidade: ritmo tipográfico 1 / 6 / 12, foto em círculo como apoio."""
    S = f == "story"
    H = 1920 if S else 1350
    risco = "text-decoration:line-through;text-decoration-thickness:6px;text-decoration-color:rgba(6,96,58,.55)"
    if S:
        body = f"""
  {logo(72, 150, 110, 'var(--gd)')}{tag(212, 192, 'var(--gd)')}
  <div class="a serif" style="left:72px;top:330px;font-size:104px;font-weight:500;line-height:1.05;color:rgba(10,63,40,.55)"><span style="{risco}">Não é 1.</span><br><span style="{risco}">Não são 6.</span></div>
  <div class="a imp" style="left:68px;top:590px;font-size:132px;line-height:1;color:var(--gd)">São</div>
  <div class="a serif" style="left:56px;top:690px;font-size:420px;font-weight:900;line-height:.8;color:var(--gd);letter-spacing:-22px">12</div>
  <div class="a imp" style="left:72px;top:1040px;font-size:132px;line-height:1;color:var(--gd)">banhos!</div>
  <div class="ph" style="left:600px;top:700px;width:420px;height:420px;border-radius:50%;background-image:url({foto('banho-golden')});background-position:50% 42%;box-shadow:0 0 0 12px var(--off)"></div>
  <div class="a sup" style="left:72px;top:1220px;width:880px;font-size:34px;color:var(--ink)">O plano tão pedido voltou com condições especiais na Black Friday Santuário.</div>
  <div class="a rod" style="left:72px;top:1390px;color:var(--gd)">Somente até 30/11</div>
  <div class="a cta" style="left:72px;top:1442px;color:var(--gd)">Chama no WhatsApp {SETA}</div>"""
    else:
        body = f"""
  {logo(64, 64, 100, 'var(--gd)')}{tag(194, 102, 'var(--gd)')}
  <div class="a serif" style="left:64px;top:230px;font-size:84px;font-weight:500;line-height:1.05;color:rgba(10,63,40,.55)"><span style="{risco}">Não é 1.</span><br><span style="{risco}">Não são 6.</span></div>
  <div class="a imp" style="left:60px;top:440px;font-size:110px;line-height:1;color:var(--gd)">São</div>
  <div class="a serif" style="left:50px;top:530px;font-size:340px;font-weight:900;line-height:.8;color:var(--gd);letter-spacing:-18px">12</div>
  <div class="a imp" style="left:64px;top:810px;font-size:110px;line-height:1;color:var(--gd)">banhos!</div>
  <div class="ph" style="left:620px;top:420px;width:400px;height:400px;border-radius:50%;background-image:url({foto('banho-golden')});background-position:50% 42%;box-shadow:0 0 0 12px var(--off)"></div>
  <div class="a sup" style="left:64px;top:980px;width:900px;font-size:30px;color:var(--ink)">O plano tão pedido voltou com condições especiais na Black Friday Santuário.</div>
  <div class="a rod" style="left:64px;top:1130px;font-size:21px;color:var(--gd)">Somente até 30/11</div>
  <div class="a cta" style="left:64px;top:1184px;font-size:26px;color:var(--gd)">Chama no WhatsApp {SETA}</div>"""
    return page(H, "var(--lime)", body)


# ---------------------------------------------------------------- HOTEL
def hotel1(f):
    """Antecipe: foto do pet descansando, muito respiro e tipografia editorial."""
    S = f == "story"
    H = 1920 if S else 1350
    ph_top, fade = (720, 760) if S else (520, 560)
    body = f"""
  <div class="ph" style="left:0;top:{ph_top}px;width:1080px;height:{H - ph_top}px;background-image:url({foto('hotel-descanso')});background-position:50% 62%"></div>
  <div class="a" style="left:0;top:{ph_top - 2}px;width:1080px;height:{fade - ph_top + 260}px;background:linear-gradient(var(--off),rgba(245,247,239,0))"></div>
  {logo(72 if S else 64, 150 if S else 64, 110 if S else 100, 'var(--gl)')}{tag(212 if S else 194, 192 if S else 102, 'var(--g)', 'Black Friday antecipada · Hotel Pet')}
  <div class="a serif" style="left:{72 if S else 64}px;top:{330 if S else 220}px;width:{940 if S else 950}px;font-size:{96 if S else 80}px;font-weight:500;line-height:1.02;color:var(--gd);letter-spacing:-1px">Teu fim de ano<br>já tem destino?</div>
  <div class="a serif it" style="left:{72 if S else 64}px;top:{545 if S else 400}px;font-size:{68 if S else 56}px;font-weight:600;color:var(--g)">O dele também pode ter.</div>
  <div class="a" style="left:{72 if S else 64}px;bottom:{330 if S else 64}px;width:{560 if S else 600}px;background:rgba(245,247,239,.94);border-radius:22px;padding:30px 34px">
    <div class="sup" style="font-size:{29 if S else 26}px;color:var(--ink)">Garante a hospedagem do teu pet para o fim de ano com valor de <b style="color:var(--g)">baixa temporada</b>.</div>
    <div class="rod" style="font-size:{21 if S else 19}px;color:var(--g);margin-top:18px">Reserve até 30/11 • Vagas limitadas</div>
    <div class="cta" style="font-size:{26 if S else 24}px;color:var(--gd);margin-top:12px">Consulte a disponibilidade {SETA}</div>
    <div style="font-weight:600;font-size:{20 if S else 18}px;color:#5C7466;margin-top:12px">{HOTEL}</div>
  </div>"""
    return page(H, "var(--off)", body)


def hotel2(f):
    """Força comercial: foto protagonista + faixa 'BAIXA TEMPORADA' em serifada."""
    S = f == "story"
    H = 1920 if S else 1350
    if S:
        body = f"""
  <div class="ph" style="left:0;top:0;width:1080px;height:1920px;background-image:url({foto('hotel-samoieda')});background-position:50% 50%"></div>
  <div class="a" style="left:0;top:0;width:1080px;height:640px;background:linear-gradient(rgba(10,63,40,.95) 35%,rgba(10,63,40,0))"></div>
  <div class="a" style="left:0;top:980px;width:1080px;height:940px;background:linear-gradient(rgba(10,63,40,0),rgba(10,63,40,.97) 26%)"></div>
  {logo(72, 150, 110)}{tag(212, 192, 'var(--lime)', 'Black Friday antecipada · Hotel Pet')}
  <div class="a imp" style="left:72px;top:300px;font-size:96px;line-height:1;color:#fff">Fim de ano com</div>
  <div class="a" style="left:72px;top:1150px;width:936px">
    <div class="serif it" style="font-size:54px;font-weight:400;color:var(--gl)">valor de</div>
    <div class="serif" style="font-size:118px;font-weight:900;line-height:.95;color:var(--lime);letter-spacing:-2px">baixa<br>temporada.</div>
  </div>
  <div class="a sup" style="left:72px;top:1520px;width:900px;font-size:27px;color:#E7EFE9">A Black Friday antecipada da Santuário chegou ao hotel pet. Garante a hospedagem de fim de ano com uma condição especial.</div>
  <div class="a rod" style="left:72px;top:1630px;font-size:21px;color:var(--lime)">Somente até 30/11 • Vagas limitadas</div>
  <div class="a cta" style="left:72px;top:1676px;font-size:26px;color:#fff">Antecipe a reserva {SETA}</div>
  <div class="a" style="left:72px;top:1732px;font-weight:600;font-size:20px;color:#A9C3B2">{HOTEL}</div>"""
    else:
        body = f"""
  <div class="ph" style="left:0;top:0;width:640px;height:1350px;background-image:url({foto('hotel-samoieda')});background-position:50% 48%"></div>
  {logo(700, 64, 100)}
  <div class="a tag" style="left:700px;top:196px;width:330px;color:var(--lime);font-size:19px;letter-spacing:3px;line-height:1.4;flex-wrap:wrap"><i></i>Black Friday antecipada</div>
  <div class="a imp" style="left:700px;top:300px;width:330px;font-size:72px;line-height:1.02;color:#fff">Fim de ano com</div>
  <div class="a serif it" style="left:700px;top:470px;font-size:44px;font-weight:400;color:var(--gl)">valor de</div>
  <div class="a serif" style="left:698px;top:526px;width:340px;font-size:56px;font-weight:900;line-height:1.02;color:var(--lime);letter-spacing:-1px;white-space:nowrap">baixa<br>temporada.</div>
  <div class="a sup" style="left:700px;top:700px;width:320px;font-size:24px;color:#E7EFE9">A Black Friday antecipada da Santuário chegou ao hotel pet. Garante a hospedagem de fim de ano com uma condição especial.</div>
  <div class="a rod" style="left:700px;top:1060px;width:330px;font-size:19px;line-height:1.5;color:var(--lime)">Somente até 30/11<br>Vagas limitadas</div>
  <div class="a cta" style="left:700px;top:1150px;font-size:24px;color:#fff">Antecipe a reserva {SETA}</div>
  <div class="a" style="left:700px;top:1210px;width:330px;font-weight:600;font-size:17px;line-height:1.4;color:#A9C3B2">Av. Nilo Peçanha, 2385<br>(51) 98963-7205</div>"""
    return page(H, "var(--gd)", body)


def hotel3(f):
    """Urgência e tranquilidade: preto, foto expressiva em card alto, manchete de impacto."""
    S = f == "story"
    H = 1920 if S else 1350
    if S:
        body = f"""
  {logo(72, 150, 110)}{tag(212, 192, 'var(--lime)', 'Black Friday antecipada · Hotel Pet')}
  <div class="a imp" style="left:72px;top:310px;width:936px;font-size:118px;line-height:1;color:var(--off)">Tua viagem<br>pode esperar.</div>
  <div class="ph" style="left:72px;top:590px;width:936px;height:700px;border-radius:28px;background-image:url({foto('hotel-pastor')});background-position:50% 30%"></div>
  <div class="a serif it" style="left:72px;top:1320px;width:936px;font-size:82px;font-weight:600;line-height:1.02;color:var(--lime)">A reserva dele,<br>melhor não.</div>
  <div class="a sup" style="left:72px;top:1510px;width:900px;font-size:27px;color:#C9D3CC">Planeja a hospedagem de fim de ano e aproveita o valor de <b style="color:#fff">baixa temporada</b> para reservas realizadas até 30/11.</div>
  <div class="a rod" style="left:72px;top:1650px;font-size:21px;color:var(--lime)">Vagas limitadas • Hotel Pet Santuário</div>
  <div class="a cta" style="left:72px;top:1696px;font-size:26px;color:#fff">Garanta a vaga pelo WhatsApp {SETA}</div>
  <div class="a" style="left:72px;top:1752px;font-weight:600;font-size:20px;color:#8FA196">{HOTEL}</div>"""
    else:
        body = f"""
  <div class="ph" style="left:560px;top:64px;width:456px;height:1222px;border-radius:28px;background-image:url({foto('hotel-pastor')});background-position:50% 35%"></div>
  {logo(64, 64, 100)}
  <div class="a tag" style="left:64px;top:196px;width:460px;color:var(--lime);font-size:19px;letter-spacing:3px"><i></i>Black Friday · Hotel Pet</div>
  <div class="a imp" style="left:64px;top:280px;width:470px;font-size:96px;line-height:1;color:var(--off)">Tua viagem pode esperar.</div>
  <div class="a serif it" style="left:64px;top:600px;width:470px;font-size:68px;font-weight:600;line-height:1.02;color:var(--lime)">A reserva dele, melhor não.</div>
  <div class="a sup" style="left:64px;top:810px;width:450px;font-size:25px;color:#C9D3CC">Planeja a hospedagem de fim de ano e aproveita o valor de <b style="color:#fff">baixa temporada</b> para reservas realizadas até 30/11.</div>
  <div class="a rod" style="left:64px;top:1060px;width:470px;font-size:19px;line-height:1.5;color:var(--lime)">Vagas limitadas<br>Hotel Pet Santuário</div>
  <div class="a cta" style="left:64px;top:1150px;font-size:24px;color:#fff">Garanta a vaga pelo WhatsApp {SETA}</div>
  <div class="a" style="left:64px;top:1210px;font-weight:600;font-size:17px;line-height:1.4;color:#8FA196">Av. Nilo Peçanha, 2385<br>(51) 98963-7205</div>"""
    return page(H, "var(--k)", body)


PECAS = [("01-creche-60-diarias", creche1), ("02-creche-nao-veio-para-brincar", creche2),
         ("03-creche-mesmo-preco-especial", creche3), ("04-banho-ele-voltou", banho1),
         ("05-banho-12-banhos", banho2), ("06-banho-nao-e-1-nao-sao-6", banho3),
         ("07-hotel-fim-de-ano-destino", hotel1), ("08-hotel-baixa-temporada", hotel2),
         ("09-hotel-viagem-pode-esperar", hotel3)]


def main():
    with tempfile.TemporaryDirectory() as tmp:
        for fmt, h in [("stories", 1920), ("feed", 1350)]:
            d = OUT / fmt
            d.mkdir(parents=True, exist_ok=True)
            jobs = []
            for nome, fn in PECAS:
                src = pathlib.Path(tmp) / f"{fmt}-{nome}.html"
                src.write_text(fn("story" if fmt == "stories" else "feed"), encoding="utf-8")
                jobs.append(f"{src}|{d / (nome + '.png')}")
            subprocess.run(["node", str(RENDER), *jobs], check=True, env={**os.environ, "H": str(h)},
                           stdout=subprocess.DEVNULL)


if __name__ == "__main__":
    main()
