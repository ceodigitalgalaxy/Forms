"""Campanha "Black Friday antecipada" — Santuário Pet Center (v2).

Sistema visual único de Black Friday:
- base preta com granulado de filme e brilho verde da marca;
- assinatura "BLACK FRIDAY" + selo "ANTECIPADA" em verde-limão;
- fita diagonal verde-limão com a condição/prazo;
- fotos reais com o mesmo tratamento de cor (contraste, leve dessaturação, vinheta).

9 conceitos x 2 formatos (stories 1080x1920, feed 1080x1350). Layout em fluxo (flex).
Uso: python3 santuario-pet/gerar_black_antecipada.py
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
GRAO = "data:image/svg+xml;base64," + base64.b64encode(
    b'<svg xmlns="http://www.w3.org/2000/svg" width="260" height="260"><filter id="n"><feTurbulence type="fractalNoise" '
    b'baseFrequency=".85" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>'
    b'<rect width="100%" height="100%" filter="url(#n)"/></svg>').decode()


def foto(n):
    return uri(ROOT / "fotos" / f"{n}.jpg")


HOTEL = "Av. Nilo Peçanha, 2385 · (51) 98963-7205"
SETA = ('<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" '
        'stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>')

CSS = """
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,700;1,9..144,500;1,9..144,700&family=Nunito+Sans:opsz,wght@6..12,500;6..12,700;6..12,800;6..12,900&display=block');
:root{--g:#06603A;--gd:#0A3F28;--lime:#AED250;--gl:#DCEBB4;--off:#F5F7EF;--k:#0B110D}
*{box-sizing:border-box;margin:0;padding:0}
body{width:1080px;overflow:hidden;font-family:'Nunito Sans',sans-serif;-webkit-font-smoothing:antialiased;color:var(--off)}
.p{position:relative;width:1080px;overflow:hidden;
  background:var(--k)}
.p::after{content:"";position:absolute;inset:0;background:url(GRAO);opacity:0;mix-blend-mode:overlay;pointer-events:none;z-index:50}
.col{position:relative;z-index:2;display:flex;flex-direction:column;height:100%}
.row{display:flex;align-items:stretch}
.imp{font-family:'Anton',sans-serif;font-weight:400;text-transform:uppercase;line-height:.92;letter-spacing:.5px}
.ser{font-family:'Fraunces',serif;text-wrap:balance}
.it{font-style:italic}
.lime{color:var(--lime)}
.top{display:flex;align-items:center;justify-content:space-between}
.logo{width:var(--ls);height:var(--ls);border-radius:50%;box-shadow:0 0 0 3px var(--lime);display:block}
.handle{font-weight:800;font-size:22px;letter-spacing:3px;text-transform:uppercase;color:#9AA89E}
.bf{display:flex;align-items:flex-end;gap:18px;flex-wrap:wrap}
.bf .l{font-family:'Anton';text-transform:uppercase;line-height:.86;color:#fff;letter-spacing:1px}
.bf .ant{font-family:'Anton';text-transform:uppercase;background:var(--lime);color:var(--k);line-height:1;padding:.1em .28em .14em;
  transform:rotate(-3deg);transform-origin:left bottom}
.foto{position:relative;background-size:cover;background-repeat:no-repeat;overflow:hidden;filter:contrast(1.04)}
.foto::after{content:none}
.fade-t{position:absolute;left:0;right:0;top:0;z-index:2;background:linear-gradient(var(--k),rgba(11,17,13,0))}
.fade-b{position:absolute;left:0;right:0;bottom:0;z-index:2;background:linear-gradient(rgba(11,17,13,0),var(--k))}
.fade-l{position:absolute;top:0;bottom:0;left:0;z-index:2;background:linear-gradient(90deg,var(--k),rgba(11,17,13,0))}
.tape{position:relative;z-index:6;margin:0 -200px;background:var(--lime);color:var(--k);white-space:nowrap;overflow:hidden;
  font-family:'Anton';text-transform:uppercase;letter-spacing:2px;box-shadow:0 10px 30px rgba(0,0,0,.45)}
.tape span{display:inline-block;padding:.32em 0}
.sup{font-weight:500;line-height:1.42;color:#C9D2CB;text-wrap:pretty}
.sup b{color:#fff;font-weight:800}
.cta{display:flex;align-items:center;gap:.5em;font-weight:900;color:#fff}
.cta svg{color:var(--lime)}
.end{font-weight:700;color:#8E9C92;letter-spacing:.5px}
.oferta{background:var(--lime);color:var(--k);border-radius:20px;padding:.26em .34em .3em;position:relative;z-index:6;
  box-shadow:0 16px 40px rgba(0,0,0,.35)}
.oferta .k{font-weight:900;font-size:.3em;letter-spacing:.12em;text-transform:uppercase;line-height:1.25}
.oferta .r{display:flex;align-items:center;justify-content:space-between;gap:.25em;flex-wrap:wrap;margin-top:.1em}
.oferta .b{font-family:'Anton';text-transform:uppercase;line-height:1;letter-spacing:.01em}
.oferta .t{background:var(--k);color:var(--lime);font-weight:900;font-size:.24em;letter-spacing:.14em;text-transform:uppercase;
  padding:.45em .7em;border-radius:.5em;white-space:nowrap}
.serv{display:flex;align-items:center;gap:.55em;font-weight:900;text-transform:uppercase;letter-spacing:.16em;color:#fff;line-height:1}
.serv i{display:block;width:2.2em;height:.18em;background:var(--lime)}
.rodl{position:relative;z-index:6;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:var(--lime)}
.strike{display:inline-block;color:rgba(245,247,239,.42);text-decoration:line-through;text-decoration-color:var(--lime);text-decoration-thickness:.055em}
"""


def page(h, body, pad):
    return (f'<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>{CSS.replace("GRAO", GRAO)}'
            f'body{{height:{h}px}}.p{{height:{h}px}}</style></head><body><div class="p">'
            f'<div class="col" style="padding:{pad}">{body}</div></div></body></html>')


def topo(ls):
    return (f'<div class="top" style="--ls:{ls}px"><img class="logo" src="{LOGO}" alt="Santuário Pet Center">'
            f'<span class="handle">@santuariopet</span></div>')


SERV = {"creche": "Creche Pet", "banho": "Banho e Tosa", "hotel": "Hotel Pet"}


def servico(size, mt):
    nome = SERV[CUR["nome"].split("-")[1]]
    return (f'<div class="serv" style="font-size:{size}px;margin-top:{mt}px"><i></i>{nome}</div>')


def bf(size, mt=0):
    return (f'<div class="bf" style="margin-top:{mt}px"><div class="l" style="font-size:{size}px">Black Friday</div>'
            f'<div class="ant" style="font-size:{round(size * .42)}px">Antecipada</div></div>'
            + servico(max(24, round(size * .36)), round(size * .26)))


def tape(*a, **k):
    return ""


def ph(nome, pos, extra="", fades=""):
    return f'<div class="foto" style="background-image:url({foto(nome)});background-position:{pos};{extra}">{fades}</div>'


CUR = {"nome": ""}
OFERTAS = {
    "01-creche-60-diarias": ("Mesmo preço para todos os portes", "Só até 30/11", "Vagas limitadas"),
    "02-creche-nao-veio-para-brincar": ("60 diárias com condição especial", "Só até 30/11", "Vagas limitadas"),
    "03-creche-mesmo-preco-especial": ("Plano de 60 diárias", "Contrate até 30/11", "Vagas limitadas"),
    "04-banho-ele-voltou": ("Plano de 12 banhos · condições especiais", "Só até 30/11", "Black Friday"),
    "05-banho-12-banhos": ("Condição especial de Black Friday", "Só até 30/11", "12 banhos"),
    "06-banho-nao-e-1-nao-sao-6": ("Plano de 12 banhos · condições especiais", "Só até 30/11", "Black Friday"),
    "07-hotel-fim-de-ano-destino": ("Hospedagem com valor de baixa temporada", "Reserve até 30/11", "Vagas limitadas"),
    "08-hotel-baixa-temporada": ("Hospedagem de fim de ano", "Só até 30/11", "Vagas limitadas"),
    "09-hotel-viagem-pode-esperar": ("Valor de baixa temporada", "Até 30/11", "Vagas limitadas"),
}


def oferta(size, mt):
    k, b, t = OFERTAS[CUR["nome"]]
    return (f'<div class="oferta" style="font-size:{size}px;margin-top:{mt}px"><div class="k">{k}</div>'
            f'<div class="r"><div class="b">{b}</div><div class="t">{t}</div></div></div>')


def cta(txt, size, mt=0):
    big = 80 if size >= 30 else 64
    return (oferta(big, max(mt, 26)) +
            f'<div class="cta" style="font-size:{size}px;margin-top:29px">{txt} {SETA}</div>')


SP = "170px 92px 270px"
FP = "68px 80px 68px"


def faixa(*a, **k):
    return ""


def _faixa_old(txt, bottom, left=64, width=520):
    return f'<div class="rodl" style="position:absolute;left:{left}px;width:{width}px;bottom:{bottom - 40}px;z-index:6;font-size:20px">{txt}</div>'


# ======================================================== CRECHE
def creche1(f):
    if f == "story":
        return page(1920, f"""{topo(90)}{bf(90, 40)}
  <div class="row" style="margin-top:44px;gap:30px;align-items:center">
    <div class="imp lime" style="font-size:330px;line-height:.8;letter-spacing:-5px">60</div>
    <div><div class="imp" style="font-size:100px">Diárias</div>
      <div class="ser it" style="font-size:44px;line-height:1.12;margin-top:21px;color:var(--gl)">Um desconto que vai te surpreender.</div></div>
  </div>
  {ph('creche-playground', '55% 30%', 'flex:1;margin:40px -92px 0;min-height:470px', '<div class="fade-t" style="height:80px"></div><div class="fade-b" style="height:70px"></div>')}
  {tape('Vagas limitadas • Somente até 30/11', 40, -60)}
  <div class="sup" style="font-size:29px;margin-top:52px">A Black Friday antecipada chegou à creche Santuário, com uma condição especial <b>sem diferenciação de preço por porte</b>.</div>
  {cta('Consulte a oferta pelo WhatsApp', 30, 22)}""", SP)
    return page(1350, f"""<div class="row" style="flex:1;gap:44px">
    <div style="width:520px;display:flex;flex-direction:column">
      {topo(92)}{bf(86, 34)}
      <div class="imp lime" style="font-size:340px;line-height:.8;letter-spacing:-5px;margin-top:39px">60</div>
      <div class="imp" style="font-size:104px;margin-top:6px">Diárias</div>
      <div class="ser it" style="font-size:40px;line-height:1.12;margin-top:21px;color:var(--gl)">Um desconto que vai te surpreender.</div>
      <div class="sup" style="font-size:24px;margin-top:29px">A Black Friday antecipada chegou à creche Santuário, com uma condição especial <b>sem diferenciação de preço por porte</b>.</div>
      <div style="flex:1"></div>{cta('Consulte a oferta pelo WhatsApp', 25)}
    </div>
    {ph('creche-playground', '50% 40%', 'flex:1;margin:-68px -80px -68px 0', '<div class="fade-l" style="width:120px"></div>')}
  </div>{faixa('Vagas limitadas • Somente até 30/11', 150)}""", FP)


def creche2(f):
    if f == "story":
        return page(1920, f"""{topo(90)}{servico(32, 46)}
  <div class="imp" style="font-size:112px;margin-top:65px;line-height:.95">A <span class="lime">Black Friday</span><br>da creche não<br>veio para</div>
  <div class="ser it lime" style="font-size:168px;line-height:.95;font-weight:700;margin-top:4px;letter-spacing:-3px">brincar.</div>
  <div class="ser" style="font-size:42px;font-weight:700;margin-top:34px">60 diárias com uma condição especial.</div>
  {ph('creche-brincando', '50% 52%', 'flex:1;margin:34px -92px 0;min-height:470px', '<div class="fade-t" style="height:80px"></div><div class="fade-b" style="height:70px"></div>')}
  {tape('Oferta até 30/11 • Vagas limitadas', 40, -50)}
  <div class="sup" style="font-size:29px;margin-top:52px">Mais oportunidades de recreação, atividades e diversão na rotina do teu pet.</div>
  {cta('Descubra a condição especial', 30, 22)}""", SP)
    return page(1350, f"""{ph('creche-brincando', '46% 50%', 'position:absolute;top:0;bottom:0;right:0;left:540px', '<div class="fade-l" style="width:120px"></div>')}
  <div style="position:relative;z-index:3;width:450px;display:flex;flex-direction:column;height:100%">
    <div style="--ls:92px"><img class="logo" src="{LOGO}" alt="Santuário Pet Center"></div>{servico(24, 34)}
    <div class="imp" style="font-size:88px;margin-top:57px;line-height:.98">A <span class="lime">Black<br>Friday</span> da<br>creche não<br>veio para</div>
    <div class="ser it lime" style="font-size:124px;line-height:.95;font-weight:700;margin-top:4px;letter-spacing:-2px">brincar.</div>
    <div class="ser" style="font-size:36px;font-weight:700;margin-top:36px;width:420px">60 diárias com uma condição especial.</div>
    <div class="sup" style="font-size:24px;margin-top:18px;width:420px">Mais oportunidades de recreação, atividades e diversão na rotina do teu pet.</div>
    <div style="flex:1"></div>{cta('Descubra a condição especial', 25)}
  </div>{faixa('Oferta até 30/11 • Vagas limitadas', 150)}""", FP)


def creche3(f):
    if f == "story":
        return page(1920, f"""{topo(90)}{bf(86, 40)}
  <div class="ser it" style="font-size:68px;margin-top:47px;color:var(--gl)">Porte diferente.</div>
  <div class="imp" style="font-size:140px;margin-top:10px">Mesmo preço<br><span class="lime">especial.</span></div>
  <div class="row" style="flex:1;gap:36px;margin-top:57px;min-height:470px">
    {ph('creche-grupo', '50% 55%', 'width:540px;border-radius:270px 270px 24px 24px')}
    <div style="flex:1;display:flex;flex-direction:column;justify-content:flex-end">
      <div class="sup" style="font-size:29px">Aproveita a Black Friday antecipada e conhece a condição do plano de <b>60 diárias</b> da creche Santuário.</div>
    </div>
  </div>
  {cta('Fala com a equipe', 30, 36)}
  {tape('Contratações até 30/11 • Vagas limitadas', 38, 46)}""", SP)
    return page(1350, f"""{topo(92)}
  <div class="row" style="flex:1;gap:40px;margin-top:44px">
    <div style="flex:1;display:flex;flex-direction:column">
      {bf(78)}
      <div class="ser it" style="font-size:62px;margin-top:47px;color:var(--gl)">Porte diferente.</div>
      <div class="imp" style="font-size:132px;margin-top:10px">Mesmo<br>preço<br><span class="lime">especial.</span></div>
    </div>
    {ph('creche-grupo', '50% 55%', 'width:400px;border-radius:200px 200px 22px 22px')}
  </div>
  <div class="sup" style="font-size:26px;margin-top:47px">Aproveita a Black Friday antecipada e conhece a condição do plano de <b>60 diárias</b> da creche Santuário.</div>
  {tape('Contratações até 30/11 • Vagas limitadas', 28, 30, 26)}
  {cta('Fala com a equipe', 25)}""", FP)


# ======================================================== BANHO
def banho1(f):
    if f == "story":
        return page(1920, f"""{topo(90)}{bf(86, 40)}
  {ph('banho-shihtzu', '50% 36%', 'height:620px;margin:40px -92px 0', '<div class="fade-t" style="height:120px"></div><div class="fade-b" style="height:200px"></div>')}
  <div class="ser it" style="font-size:84px;margin-top:-40px;position:relative;z-index:3;color:var(--gl)">Vocês pediram.</div>
  <div class="imp lime" style="font-size:200px;margin-top:6px">Ele voltou.</div>
  <div class="ser" style="font-size:42px;font-weight:500;line-height:1.2;margin-top:44px">O plano de <b style="font-weight:700;color:var(--lime)">12 banhos</b> está de volta na Black Friday antecipada da Santuário Pet!</div>
  <div style="flex:1"></div>
  {tape('Condições especiais • Somente até 30/11', 38, 0, 40)}
  {cta('Conheça a oferta', 30)}""", SP)
    return page(1350, f"""{topo(92)}{bf(76, 26)}
  {ph('banho-shihtzu', '50% 36%', 'height:470px;margin:28px -80px 0', '<div class="fade-t" style="height:90px"></div><div class="fade-b" style="height:150px"></div>')}
  <div class="ser it" style="font-size:58px;color:var(--gl);margin-top:-40px;position:relative;z-index:3">Vocês pediram.</div>
  <div class="imp lime" style="font-size:150px;margin-top:6px">Ele voltou.</div>
  <div class="ser" style="font-size:34px;font-weight:500;line-height:1.22;margin-top:29px">O plano de <b style="font-weight:700;color:var(--lime)">12 banhos</b> está de volta na Black Friday antecipada da Santuário Pet!</div>
  <div style="flex:1"></div>
  {tape('Condições especiais • Somente até 30/11', 28, 0, 30)}
  {cta('Conheça a oferta', 25)}""", FP)


def banho2(f):
    if f == "story":
        return page(1920, f"""{topo(90)}{bf(86, 40)}
  <div class="row" style="gap:28px;margin-top:52px;height:620px">
    <div class="imp lime" style="font-size:640px;line-height:.78;letter-spacing:-14px">12</div>
    {ph('banho-toalha', '50% 30%', 'flex:1;border-radius:24px')}
  </div>
  <div class="imp" style="font-size:190px;margin-top:26px">Banhos</div>
  <div class="ser it" style="font-size:58px;color:var(--gl);margin-top:18px">Uma condição imperdível.</div>
  <div class="sup" style="font-size:29px;margin-top:26px">Planeja os banhos do teu pet com uma condição especial de Black Friday.</div>
  <div style="flex:1"></div>
  {tape('Black Friday antecipada • Até 30/11', 38, 0, 40)}
  {cta('Consulte os valores', 30)}""", SP)
    return page(1350, f"""<div class="row" style="flex:1;gap:40px">
    <div style="width:560px;display:flex;flex-direction:column">
      {topo(92)}{bf(80, 30)}
      <div class="imp lime" style="font-size:470px;line-height:.78;letter-spacing:-10px;margin-top:52px">12</div>
      <div class="imp" style="font-size:150px;margin-top:13px">Banhos</div>
      <div class="ser it" style="font-size:46px;color:var(--gl);margin-top:16px">Uma condição imperdível.</div>
      <div class="sup" style="font-size:24px;margin-top:18px">Planeja os banhos do teu pet com uma condição especial de Black Friday.</div>
      <div style="flex:1"></div>{cta('Consulte os valores', 25)}
    </div>
    {ph('banho-toalha', '50% 40%', 'flex:1;margin:-68px -80px -68px 0', '<div class="fade-l" style="width:100px"></div>')}
  </div>{faixa('Black Friday antecipada • Até 30/11', 150)}""", FP)


def banho3(f):
    if f == "story":
        return page(1920, f"""{topo(90)}{bf(86, 40)}
  <div class="imp" style="font-size:72px;margin-top:40px;line-height:1.08"><span class="strike">Não são 4.</span><br><span class="strike">Não são 8.</span></div>
  <div class="row" style="align-items:flex-end;gap:26px;margin-top:29px">
    <div class="imp" style="font-size:92px;padding-bottom:8px">São</div>
    <div class="imp lime" style="font-size:250px;line-height:.78;letter-spacing:-8px">12</div>
  </div>
  <div class="imp" style="font-size:92px;margin-top:14px">banhos!</div>
  {ph('banho-golden', '50% 30%', 'flex:1;margin:26px -92px 0;min-height:470px', '<div class="fade-t" style="height:80px"></div><div class="fade-b" style="height:70px"></div>')}
  {tape('Somente até 30/11', 40, -50)}
  <div class="sup" style="font-size:29px;margin-top:52px">O plano tão pedido voltou com condições especiais na Black Friday Santuário.</div>
  {cta('Chama no WhatsApp', 30, 22)}""", SP)
    return page(1350, f"""{ph('banho-golden', '50% 45%', 'position:absolute;right:0;top:0;width:420px;height:1350px', '<div class="fade-l" style="width:180px"></div>')}
  <div style="position:relative;z-index:3;width:680px;display:flex;flex-direction:column;height:100%">
    {topo(92)}{bf(80, 30)}
    <div class="imp" style="font-size:118px;margin-top:52px;line-height:1"><span class="strike">Não são 4.</span><br><span class="strike">Não são 8.</span></div>
    <div class="row" style="align-items:flex-end;gap:20px;margin-top:21px">
      <div class="imp" style="font-size:112px;padding-bottom:10px">São</div>
      <div class="imp lime" style="font-size:330px;line-height:.78;letter-spacing:-8px">12</div>
    </div>
    <div class="imp" style="font-size:112px;margin-top:13px">banhos!</div>
    <div class="sup" style="font-size:24px;margin-top:23px;width:560px">O plano tão pedido voltou com condições especiais na Black Friday Santuário.</div>
    <div style="flex:1"></div>{cta('Chama no WhatsApp', 25)}
  </div>{faixa('Somente até 30/11', 150)}""", FP)


# ======================================================== HOTEL
def hotel1(f):
    if f == "story":
        return page(1920, f"""{topo(90)}{bf(86, 40)}
  <div class="ser" style="font-size:80px;font-weight:700;line-height:1.04;margin-top:57px;letter-spacing:-1px">Teu fim de ano<br>já tem destino?</div>
  <div class="ser it lime" style="font-size:58px;font-weight:500;margin-top:21px">O dele também pode ter.</div>
  {ph('hotel-colo', '50% 40%', 'flex:1;margin:44px -92px 0;min-height:470px', '<div class="fade-t" style="height:80px"></div><div class="fade-b" style="height:70px"></div>')}
  {tape('Reserve até 30/11 • Vagas limitadas', 40, -50)}
  <div class="sup" style="font-size:29px;margin-top:52px">Garante a hospedagem do teu pet para o fim de ano com valor de <b>baixa temporada</b>.</div>
  {cta('Consulte a disponibilidade', 30, 22)}
  <div class="end" style="font-size:21px;margin-top:16px">{HOTEL}</div>""", SP)
    return page(1350, f"""<div class="row" style="flex:1;gap:44px">
    {ph('hotel-colo', '42% 40%', 'width:430px;margin:-68px 0 -68px -80px')}
    <div style="flex:1;display:flex;flex-direction:column">
      {topo(92)}{bf(70, 30)}
      <div class="ser" style="font-size:70px;font-weight:700;line-height:1.04;margin-top:57px;letter-spacing:-1px">Teu fim de ano já tem destino?</div>
      <div class="ser it lime" style="font-size:52px;font-weight:500;margin-top:21px;line-height:1.1">O dele também pode ter.</div>
      <div class="sup" style="font-size:24px;margin-top:34px">Garante a hospedagem do teu pet para o fim de ano com valor de <b>baixa temporada</b>.</div>
      <div style="flex:1"></div>{cta('Consulte a disponibilidade', 25)}
      <div class="end" style="font-size:18px;margin-top:13px">{HOTEL}</div>
    </div>
  </div>{faixa('Reserve até 30/11 • Vagas limitadas', 200, 474, 540)}""", FP)


def hotel2(f):
    if f == "story":
        return page(1920, f"""{topo(90)}{bf(86, 40)}
  <div class="imp" style="font-size:112px;margin-top:52px">Fim de ano com</div>
  {ph('hotel-samoieda', '50% 42%', 'flex:1;margin:34px -92px 0;min-height:470px', '<div class="fade-t" style="height:80px"></div><div class="fade-b" style="height:120px"></div>')}
  <div class="ser it" style="font-size:52px;color:var(--gl);margin-top:-30px;position:relative;z-index:3">valor de</div>
  <div class="imp lime" style="font-size:128px;margin-top:6px">Baixa temporada.</div>
  <div class="sup" style="font-size:28px;margin-top:22px">A Black Friday antecipada da Santuário chegou ao hotel pet. Garante a hospedagem de fim de ano com uma condição especial.</div>
  {cta('Antecipe a reserva', 30)}
  <div class="end" style="font-size:21px;margin-top:16px">{HOTEL}</div>""", SP)
    return page(1350, f"""{ph('hotel-samoieda', '50% 40%', 'position:absolute;top:0;bottom:0;right:0;left:470px', '<div class="fade-l" style="width:420px;background:linear-gradient(90deg,var(--k) 20%,rgba(10,11,10,0))"></div>')}
  <div style="position:relative;z-index:3;width:600px;display:flex;flex-direction:column;height:100%">
    {topo(92)}{bf(76, 30)}
    <div class="imp" style="font-size:96px;margin-top:57px">Fim de ano com</div>
    <div class="ser it" style="font-size:48px;color:var(--gl);margin-top:26px">valor de</div>
    <div class="imp lime" style="font-size:118px;margin-top:4px">Baixa<br>temporada.</div>
    <div class="sup" style="font-size:24px;margin-top:29px;width:500px">A Black Friday antecipada da Santuário chegou ao hotel pet. Garante a hospedagem de fim de ano com uma condição especial.</div>
    <div style="flex:1"></div>{cta('Antecipe a reserva', 25)}
    <div class="end" style="font-size:18px;margin-top:13px">{HOTEL}</div>
  </div>{faixa('Somente até 30/11 • Vagas limitadas', 200)}""", FP)


def hotel3(f):
    if f == "story":
        return page(1920, f"""{topo(90)}{bf(86, 40)}
  <div class="imp" style="font-size:116px;margin-top:52px">Tua viagem<br>pode esperar.</div>
  {ph('hotel-pastor', '50% 32%', 'flex:1;margin-top:52px;border-radius:26px;min-height:470px')}
  {tape('Vagas limitadas • Hotel Pet Santuário', 38, -40)}
  <div class="ser it lime" style="font-size:64px;font-weight:700;line-height:1.04;margin-top:44px">A reserva dele,<br>melhor não.</div>
  <div class="sup" style="font-size:28px;margin-top:23px">Planeja a hospedagem de fim de ano e aproveita o valor de <b>baixa temporada</b> para reservas realizadas até 30/11.</div>
  {cta('Garanta a vaga pelo WhatsApp', 30, 20)}
  <div class="end" style="font-size:21px;margin-top:16px">{HOTEL}</div>""", SP)
    return page(1350, f"""<div class="row" style="flex:1;gap:44px">
    <div style="flex:1;display:flex;flex-direction:column">
      {topo(92)}{bf(70, 30)}
      <div class="imp" style="font-size:94px;margin-top:46px">Tua viagem pode esperar.</div>
      <div class="ser it lime" style="font-size:64px;font-weight:700;line-height:1.02;margin-top:31px">A reserva dele, melhor não.</div>
      <div class="sup" style="font-size:24px;margin-top:29px">Planeja a hospedagem de fim de ano e aproveita o valor de <b>baixa temporada</b> para reservas realizadas até 30/11.</div>
      <div style="flex:1"></div>{cta('Garanta a vaga pelo WhatsApp', 25)}
      <div class="end" style="font-size:18px;margin-top:13px">{HOTEL}</div>
    </div>
    {ph('hotel-pastor', '50% 35%', 'width:400px;border-radius:24px')}
  </div>""", FP)


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
                CUR["nome"] = nome
                src.write_text(fn("story" if fmt == "stories" else "feed"), encoding="utf-8")
                jobs.append(f"{src}|{d / (nome + '.png')}")
            subprocess.run(["node", str(RENDER), *jobs], check=True, env={**os.environ, "H": str(h)},
                           stdout=subprocess.DEVNULL)


if __name__ == "__main__":
    main()
