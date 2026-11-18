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


def bf(size, mt=0):
    return (f'<div class="bf" style="margin-top:{mt}px"><div class="l" style="font-size:{size}px">Black Friday</div>'
            f'<div class="ant" style="font-size:{round(size * .42)}px">Antecipada</div></div>')


def tape(txt, size, mt=0, mb=0, rot=0):
    """Linha de condição: caixa-alta espaçada em verde-limão (padrão do card aprovado)."""
    mt = max(mt, 0) if mt >= 0 else 24
    return (f'<div class="rodl" style="font-size:{round(size * .62)}px;margin-top:{mt}px;margin-bottom:{mb}px">'
            f'{txt}</div>')


def ph(nome, pos, extra="", fades=""):
    return f'<div class="foto" style="background-image:url({foto(nome)});background-position:{pos};{extra}">{fades}</div>'


def cta(txt, size, mt=0):
    return f'<div class="cta" style="font-size:{size}px;margin-top:{mt}px">{txt} {SETA}</div>'


SP = "150px 72px 250px"
FP = "56px 64px 60px"


def faixa(txt, bottom, left=64, width=520):
    return f'<div class="rodl" style="position:absolute;left:{left}px;width:{width}px;bottom:{bottom - 40}px;z-index:6;font-size:20px">{txt}</div>'


# ======================================================== CRECHE
def creche1(f):
    if f == "story":
        return page(1920, f"""{topo(104)}{bf(120, 46)}
  <div class="row" style="margin-top:34px;gap:30px;align-items:center">
    <div class="imp lime" style="font-size:430px;line-height:.8;letter-spacing:-6px">60</div>
    <div><div class="imp" style="font-size:118px">Diárias</div>
      <div class="ser it" style="font-size:44px;line-height:1.12;margin-top:16px;color:var(--gl)">Um desconto que vai te surpreender.</div></div>
  </div>
  {ph('creche-playground', '55% 30%', 'flex:1;margin:40px -72px 0;min-height:300px', '<div class="fade-t" style="height:160px"></div><div class="fade-b" style="height:120px"></div>')}
  {tape('Vagas limitadas • Somente até 30/11', 40, -60)}
  <div class="sup" style="font-size:29px;margin-top:40px">A Black Friday antecipada chegou à creche Santuário, com uma condição especial <b>sem diferenciação de preço por porte</b>.</div>
  {cta('Consulte a oferta pelo WhatsApp', 30, 22)}""", SP)
    return page(1350, f"""<div class="row" style="flex:1;gap:44px">
    <div style="width:520px;display:flex;flex-direction:column">
      {topo(92)}{bf(86, 34)}
      <div class="imp lime" style="font-size:340px;line-height:.8;letter-spacing:-5px;margin-top:30px">60</div>
      <div class="imp" style="font-size:104px;margin-top:6px">Diárias</div>
      <div class="ser it" style="font-size:40px;line-height:1.12;margin-top:16px;color:var(--gl)">Um desconto que vai te surpreender.</div>
      <div class="sup" style="font-size:24px;margin-top:22px">A Black Friday antecipada chegou à creche Santuário, com uma condição especial <b>sem diferenciação de preço por porte</b>.</div>
      <div style="flex:1"></div>{cta('Consulte a oferta pelo WhatsApp', 25)}
    </div>
    {ph('creche-playground', '50% 40%', 'flex:1;margin:-56px -64px -60px 0', '<div class="fade-l" style="width:120px"></div>')}
  </div>{faixa('Vagas limitadas • Somente até 30/11', 150)}""", FP)


def creche2(f):
    if f == "story":
        return page(1920, f"""{topo(104)}
  <div class="imp" style="font-size:132px;margin-top:56px;line-height:.95">A <span class="lime">Black Friday</span><br>da creche não<br>veio para</div>
  <div class="ser it lime" style="font-size:200px;line-height:.95;font-weight:700;margin-top:4px;letter-spacing:-3px">brincar.</div>
  <div class="ser" style="font-size:42px;font-weight:700;margin-top:26px">60 diárias com uma condição especial.</div>
  {ph('creche-brincando', '50% 52%', 'flex:1;margin:34px -72px 0;min-height:300px', '<div class="fade-t" style="height:140px"></div><div class="fade-b" style="height:120px"></div>')}
  {tape('Oferta até 30/11 • Vagas limitadas', 40, -50)}
  <div class="sup" style="font-size:29px;margin-top:40px">Mais oportunidades de recreação, atividades e diversão na rotina do teu pet.</div>
  {cta('Descubra a condição especial', 30, 22)}""", SP)
    return page(1350, f"""{ph('creche-brincando', '46% 50%', 'position:absolute;top:0;bottom:0;right:0;left:540px', '<div class="fade-l" style="width:120px"></div>')}
  <div style="position:relative;z-index:3;width:450px;display:flex;flex-direction:column;height:100%">
    <div style="--ls:92px"><img class="logo" src="{LOGO}" alt="Santuário Pet Center"></div>
    <div class="imp" style="font-size:88px;margin-top:44px;line-height:.98">A <span class="lime">Black<br>Friday</span> da<br>creche não<br>veio para</div>
    <div class="ser it lime" style="font-size:124px;line-height:.95;font-weight:700;margin-top:4px;letter-spacing:-2px">brincar.</div>
    <div class="ser" style="font-size:36px;font-weight:700;margin-top:28px;width:420px">60 diárias com uma condição especial.</div>
    <div class="sup" style="font-size:24px;margin-top:14px;width:420px">Mais oportunidades de recreação, atividades e diversão na rotina do teu pet.</div>
    <div style="flex:1"></div>{cta('Descubra a condição especial', 25)}
  </div>{faixa('Oferta até 30/11 • Vagas limitadas', 150)}""", FP)


def creche3(f):
    if f == "story":
        return page(1920, f"""{topo(104)}{bf(110, 46)}
  <div class="ser it" style="font-size:84px;margin-top:44px;color:var(--gl)">Porte diferente.</div>
  <div class="imp" style="font-size:176px;margin-top:10px">Mesmo preço<br><span class="lime">especial.</span></div>
  <div class="row" style="flex:1;gap:36px;margin-top:44px;min-height:300px">
    {ph('creche-grupo', '50% 55%', 'width:540px;border-radius:270px 270px 24px 24px')}
    <div style="flex:1;display:flex;flex-direction:column;justify-content:flex-end">
      <div class="sup" style="font-size:29px">Aproveita a Black Friday antecipada e conhece a condição do plano de <b>60 diárias</b> da creche Santuário.</div>
      {cta('Fala com a equipe', 30, 26)}
    </div>
  </div>
  {tape('Contratações até 30/11 • Vagas limitadas', 38, 46)}""", SP)
    return page(1350, f"""{topo(92)}
  <div class="row" style="flex:1;gap:40px;margin-top:34px">
    <div style="flex:1;display:flex;flex-direction:column">
      {bf(78)}
      <div class="ser it" style="font-size:62px;margin-top:36px;color:var(--gl)">Porte diferente.</div>
      <div class="imp" style="font-size:132px;margin-top:8px">Mesmo<br>preço<br><span class="lime">especial.</span></div>
    </div>
    {ph('creche-grupo', '50% 55%', 'width:400px;border-radius:200px 200px 22px 22px')}
  </div>
  <div class="sup" style="font-size:26px;margin-top:36px">Aproveita a Black Friday antecipada e conhece a condição do plano de <b>60 diárias</b> da creche Santuário.</div>
  {tape('Contratações até 30/11 • Vagas limitadas', 28, 30, 26)}
  {cta('Fala com a equipe', 25)}""", FP)


# ======================================================== BANHO
def banho1(f):
    if f == "story":
        return page(1920, f"""{topo(104)}{bf(110, 46)}
  {ph('banho-shihtzu', '50% 36%', 'height:620px;margin:40px -72px 0', '<div class="fade-t" style="height:120px"></div><div class="fade-b" style="height:200px"></div>')}
  <div class="ser it" style="font-size:84px;margin-top:-40px;position:relative;z-index:3;color:var(--gl)">Vocês pediram.</div>
  <div class="imp lime" style="font-size:200px;margin-top:6px">Ele voltou.</div>
  <div class="ser" style="font-size:42px;font-weight:500;line-height:1.2;margin-top:34px">O plano de <b style="font-weight:700;color:var(--lime)">12 banhos</b> está de volta na Black Friday antecipada da Santuário Pet!</div>
  <div style="flex:1"></div>
  {tape('Condições especiais • Somente até 30/11', 38, 0, 40)}
  {cta('Conheça a oferta', 30)}""", SP)
    return page(1350, f"""{topo(92)}{bf(76, 26)}
  {ph('banho-shihtzu', '50% 36%', 'height:470px;margin:28px -64px 0', '<div class="fade-t" style="height:90px"></div><div class="fade-b" style="height:150px"></div>')}
  <div class="ser it" style="font-size:58px;color:var(--gl);margin-top:-40px;position:relative;z-index:3">Vocês pediram.</div>
  <div class="imp lime" style="font-size:150px;margin-top:6px">Ele voltou.</div>
  <div class="ser" style="font-size:34px;font-weight:500;line-height:1.22;margin-top:22px">O plano de <b style="font-weight:700;color:var(--lime)">12 banhos</b> está de volta na Black Friday antecipada da Santuário Pet!</div>
  <div style="flex:1"></div>
  {tape('Condições especiais • Somente até 30/11', 28, 0, 30)}
  {cta('Conheça a oferta', 25)}""", FP)


def banho2(f):
    if f == "story":
        return page(1920, f"""{topo(104)}{bf(110, 46)}
  <div class="row" style="gap:28px;margin-top:40px;height:620px">
    <div class="imp lime" style="font-size:640px;line-height:.78;letter-spacing:-14px">12</div>
    {ph('banho-toalha', '50% 30%', 'flex:1;border-radius:24px')}
  </div>
  <div class="imp" style="font-size:190px;margin-top:20px">Banhos</div>
  <div class="ser it" style="font-size:58px;color:var(--gl);margin-top:14px">Uma condição imperdível.</div>
  <div class="sup" style="font-size:29px;margin-top:20px">Planeja os banhos do teu pet com uma condição especial de Black Friday.</div>
  <div style="flex:1"></div>
  {tape('Black Friday antecipada • Até 30/11', 38, 0, 40)}
  {cta('Consulte os valores', 30)}""", SP)
    return page(1350, f"""<div class="row" style="flex:1;gap:40px">
    <div style="width:560px;display:flex;flex-direction:column">
      {topo(92)}{bf(80, 30)}
      <div class="imp lime" style="font-size:470px;line-height:.78;letter-spacing:-10px;margin-top:40px">12</div>
      <div class="imp" style="font-size:150px;margin-top:10px">Banhos</div>
      <div class="ser it" style="font-size:46px;color:var(--gl);margin-top:12px">Uma condição imperdível.</div>
      <div class="sup" style="font-size:24px;margin-top:14px">Planeja os banhos do teu pet com uma condição especial de Black Friday.</div>
      <div style="flex:1"></div>{cta('Consulte os valores', 25)}
    </div>
    {ph('banho-toalha', '50% 40%', 'flex:1;margin:-56px -64px -60px 0', '<div class="fade-l" style="width:100px"></div>')}
  </div>{faixa('Black Friday antecipada • Até 30/11', 150)}""", FP)


def banho3(f):
    if f == "story":
        return page(1920, f"""{topo(104)}{bf(110, 46)}
  <div class="imp" style="font-size:112px;margin-top:44px;line-height:1.05"><span class="strike">Não é 1.</span><br><span class="strike">Não são 6.</span></div>
  <div class="row" style="align-items:flex-end;gap:26px;margin-top:22px">
    <div class="imp" style="font-size:130px;padding-bottom:12px">São</div>
    <div class="imp lime" style="font-size:380px;line-height:.78;letter-spacing:-10px">12</div>
  </div>
  <div class="imp" style="font-size:130px;margin-top:12px">banhos!</div>
  {ph('banho-golden', '50% 24%', 'flex:1;margin:30px -72px 0;min-height:340px', '<div class="fade-t" style="height:140px"></div><div class="fade-b" style="height:110px"></div>')}
  {tape('Somente até 30/11', 40, -50)}
  <div class="sup" style="font-size:29px;margin-top:40px">O plano tão pedido voltou com condições especiais na Black Friday Santuário.</div>
  {cta('Chama no WhatsApp', 30, 22)}""", SP)
    return page(1350, f"""{ph('banho-golden', '50% 45%', 'position:absolute;right:0;top:0;width:420px;height:1350px', '<div class="fade-l" style="width:180px"></div>')}
  <div style="position:relative;z-index:3;width:680px;display:flex;flex-direction:column;height:100%">
    {topo(92)}{bf(80, 30)}
    <div class="imp" style="font-size:118px;margin-top:40px;line-height:1"><span class="strike">Não é 1.</span><br><span class="strike">Não são 6.</span></div>
    <div class="row" style="align-items:flex-end;gap:20px;margin-top:16px">
      <div class="imp" style="font-size:112px;padding-bottom:10px">São</div>
      <div class="imp lime" style="font-size:330px;line-height:.78;letter-spacing:-8px">12</div>
    </div>
    <div class="imp" style="font-size:112px;margin-top:10px">banhos!</div>
    <div class="sup" style="font-size:24px;margin-top:18px;width:560px">O plano tão pedido voltou com condições especiais na Black Friday Santuário.</div>
    <div style="flex:1"></div>{cta('Chama no WhatsApp', 25)}
  </div>{faixa('Somente até 30/11', 150)}""", FP)


# ======================================================== HOTEL
def hotel1(f):
    if f == "story":
        return page(1920, f"""{topo(104)}{bf(110, 46)}
  <div class="ser" style="font-size:96px;font-weight:700;line-height:1.02;margin-top:52px;letter-spacing:-1px">Teu fim de ano<br>já tem destino?</div>
  <div class="ser it lime" style="font-size:70px;font-weight:500;margin-top:16px">O dele também pode ter.</div>
  {ph('hotel-descanso', '50% 62%', 'flex:1;margin:44px -72px 0;min-height:300px', '<div class="fade-t" style="height:150px"></div><div class="fade-b" style="height:120px"></div>')}
  {tape('Reserve até 30/11 • Vagas limitadas', 40, -50)}
  <div class="sup" style="font-size:29px;margin-top:40px">Garante a hospedagem do teu pet para o fim de ano com valor de <b>baixa temporada</b>.</div>
  {cta('Consulte a disponibilidade', 30, 22)}
  <div class="end" style="font-size:21px;margin-top:12px">{HOTEL}</div>""", SP)
    return page(1350, f"""<div class="row" style="flex:1;gap:44px">
    {ph('hotel-descanso', '55% 62%', 'width:430px;margin:-56px 0 -60px -64px')}
    <div style="flex:1;display:flex;flex-direction:column">
      {topo(92)}{bf(70, 30)}
      <div class="ser" style="font-size:70px;font-weight:700;line-height:1.04;margin-top:44px;letter-spacing:-1px">Teu fim de ano já tem destino?</div>
      <div class="ser it lime" style="font-size:52px;font-weight:500;margin-top:16px;line-height:1.1">O dele também pode ter.</div>
      <div class="sup" style="font-size:24px;margin-top:26px">Garante a hospedagem do teu pet para o fim de ano com valor de <b>baixa temporada</b>.</div>
      <div style="flex:1"></div>{cta('Consulte a disponibilidade', 25)}
      <div class="end" style="font-size:18px;margin-top:10px">{HOTEL}</div>
    </div>
  </div>{faixa('Reserve até 30/11 • Vagas limitadas', 200, 474, 540)}""", FP)


def hotel2(f):
    if f == "story":
        return page(1920, f"""{ph('hotel-samoieda', '50% 45%', 'position:absolute;inset:0', '<div class="fade-t" style="height:820px;background:linear-gradient(var(--k) 45%,rgba(11,17,13,0))"></div><div class="fade-b" style="height:1120px;background:linear-gradient(rgba(11,17,13,0),rgba(11,17,13,.88) 34%,var(--k) 52%)"></div>')}
  <div style="position:relative;z-index:3">{topo(104)}{bf(110, 46)}
    <div class="imp" style="font-size:120px;margin-top:50px">Fim de ano com</div></div>
  <div style="flex:1"></div>
  <div style="position:relative;z-index:3">
    <div class="ser it" style="font-size:60px;color:var(--gl)">valor de</div>
    <div class="imp lime" style="font-size:176px;margin-top:6px">Baixa<br>temporada.</div>
    <div class="sup" style="font-size:28px;margin-top:28px">A Black Friday antecipada da Santuário chegou ao hotel pet. Garante a hospedagem de fim de ano com uma condição especial.</div>
    {tape('Somente até 30/11 • Vagas limitadas', 38, 30, 34)}
    {cta('Antecipe a reserva', 30)}
    <div class="end" style="font-size:21px;margin-top:12px">{HOTEL}</div>
  </div>""", SP)
    return page(1350, f"""{ph('hotel-samoieda', '50% 40%', 'position:absolute;top:0;bottom:0;right:0;left:470px', '<div class="fade-l" style="width:420px;background:linear-gradient(90deg,var(--k) 20%,rgba(10,11,10,0))"></div>')}
  <div style="position:relative;z-index:3;width:600px;display:flex;flex-direction:column;height:100%">
    {topo(92)}{bf(76, 30)}
    <div class="imp" style="font-size:96px;margin-top:44px">Fim de ano com</div>
    <div class="ser it" style="font-size:48px;color:var(--gl);margin-top:20px">valor de</div>
    <div class="imp lime" style="font-size:118px;margin-top:4px">Baixa<br>temporada.</div>
    <div class="sup" style="font-size:24px;margin-top:22px;width:500px">A Black Friday antecipada da Santuário chegou ao hotel pet. Garante a hospedagem de fim de ano com uma condição especial.</div>
    <div style="flex:1"></div>{cta('Antecipe a reserva', 25)}
    <div class="end" style="font-size:18px;margin-top:10px">{HOTEL}</div>
  </div>{faixa('Somente até 30/11 • Vagas limitadas', 200)}""", FP)


def hotel3(f):
    if f == "story":
        return page(1920, f"""{topo(104)}{bf(110, 46)}
  <div class="imp" style="font-size:138px;margin-top:46px">Tua viagem<br>pode esperar.</div>
  {ph('hotel-pastor', '50% 32%', 'flex:1;margin-top:40px;border-radius:26px;min-height:300px')}
  {tape('Vagas limitadas • Hotel Pet Santuário', 38, -40)}
  <div class="ser it lime" style="font-size:76px;font-weight:700;line-height:1.04;margin-top:40px">A reserva dele,<br>melhor não.</div>
  <div class="sup" style="font-size:28px;margin-top:18px">Planeja a hospedagem de fim de ano e aproveita o valor de <b>baixa temporada</b> para reservas realizadas até 30/11.</div>
  {cta('Garanta a vaga pelo WhatsApp', 30, 20)}
  <div class="end" style="font-size:21px;margin-top:12px">{HOTEL}</div>""", SP)
    return page(1350, f"""<div class="row" style="flex:1;gap:44px">
    <div style="flex:1;display:flex;flex-direction:column">
      {topo(92)}{bf(70, 30)}
      <div class="imp" style="font-size:112px;margin-top:40px">Tua viagem pode esperar.</div>
      <div class="ser it lime" style="font-size:64px;font-weight:700;line-height:1.02;margin-top:24px">A reserva dele, melhor não.</div>
      <div class="sup" style="font-size:24px;margin-top:22px">Planeja a hospedagem de fim de ano e aproveita o valor de <b>baixa temporada</b> para reservas realizadas até 30/11.</div>
      <div style="flex:1"></div>{cta('Garanta a vaga pelo WhatsApp', 25)}
      <div class="end" style="font-size:18px;margin-top:10px">{HOTEL}</div>
    </div>
    {ph('hotel-pastor', '50% 35%', 'width:400px;border-radius:24px')}
  </div>{faixa('Vagas limitadas • Hotel Pet Santuário', 210, 64, 540).replace('font-size:20px','font-size:17px')}""", FP)


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
