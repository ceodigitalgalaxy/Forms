"""Cartões de Natal Santuário Pet (para acompanhar petisco) — 4 variações.

Formato: 10 x 15 cm (1181 x 1772 px a 300 dpi). Saída: PNG + PDF em santuario-pet/natal/.
Uso: python3 santuario-pet/gerar_cartao_natal.py
"""
import base64
import pathlib
import subprocess
import tempfile

ROOT = pathlib.Path(__file__).resolve().parent
OUT = ROOT / "natal"


def uri(p, mime):
    return f"data:{mime};base64,{base64.b64encode(p.read_bytes()).decode()}"


LOGO = uri(ROOT / "brand/logo-instagram-150px.jpg", "image/jpeg")


def pet(n):
    return uri(ROOT / "fotos" / f"natal-{n}.png", "image/png")


OSSO = ('<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150">'
        '<g fill="%23E9D3A6" transform="rotate(-30 75 75)"><rect x="45" y="68" width="60" height="14" rx="7"/>'
        '<circle cx="45" cy="66" r="9"/><circle cx="45" cy="84" r="9"/><circle cx="105" cy="66" r="9"/><circle cx="105" cy="84" r="9"/></g></svg>')

CSS = """
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,900&family=Pacifico&family=Quicksand:wght@600;700&display=block');
@page{size:100mm 150mm;margin:0}
:root{--g:#06603A;--gd:#0A3F28;--lime:#AED250;--off:#F5F7EF;--red:#C8202E;--ink:#14261C;--creme:#FBF4E6}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1181px;height:1772px;overflow:hidden;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.c{position:relative;width:1181px;height:1772px;overflow:hidden}
.verde{background:
  radial-gradient(circle,rgba(255,255,255,.75) 0 3px,transparent 4px) 0 0/58px 58px,
  radial-gradient(circle,rgba(255,255,255,.45) 0 2px,transparent 3px) 29px 29px/58px 58px,
  repeating-linear-gradient(45deg,rgba(255,255,255,.07) 0 2px,transparent 2px 70px),
  repeating-linear-gradient(-45deg,rgba(255,255,255,.07) 0 2px,transparent 2px 70px),
  radial-gradient(900px 900px at 50% 40%,#0B7A4A,var(--g) 60%,var(--gd))}
.creme{background:url('data:image/svg+xml;utf8,OSSO') 0 0/150px 150px,
  radial-gradient(circle,rgba(200,32,46,.55) 0 3px,transparent 4px) 13px 41px/97px 89px,
  radial-gradient(circle,rgba(6,96,58,.45) 0 3px,transparent 4px) 61px 7px/113px 101px,var(--creme)}
.a{position:absolute}
.logo{width:130px;height:130px;border-radius:50%;box-shadow:0 0 0 8px #fff,0 10px 24px rgba(0,0,0,.25)}
.tit{text-align:center;line-height:1}
.feliz{font-family:'Pacifico',cursive;color:var(--g);-webkit-text-stroke:0;paint-order:stroke fill;
  text-shadow:0 0 0 #fff,4px 4px 0 #fff,-4px -4px 0 #fff,4px -4px 0 #fff,-4px 4px 0 #fff,0 6px 0 #fff,0 -6px 0 #fff,6px 0 0 #fff,-6px 0 0 #fff}
.natal{font-family:'Fraunces',serif;font-weight:900;color:var(--red);letter-spacing:-2px;
  -webkit-text-stroke:22px #fff;paint-order:stroke fill;filter:drop-shadow(0 10px 14px rgba(0,0,0,.25))}
.natal .v{color:var(--g)}
.msg{font-family:'Quicksand',sans-serif;font-weight:700;text-align:center;line-height:1.32;color:var(--ink);
  background:#fff;border-radius:34px;padding:34px 40px;box-shadow:0 12px 30px rgba(0,0,0,.18)}
.msg b{color:var(--red)}
.msg i{font-style:normal;color:var(--g)}
.pet{filter:drop-shadow(0 0 0 #fff) drop-shadow(9px 0 0 #fff) drop-shadow(-9px 0 0 #fff) drop-shadow(0 9px 0 #fff) drop-shadow(0 -9px 0 #fff) drop-shadow(0 14px 18px rgba(0,0,0,.28))}
.ass{font-family:'Quicksand',sans-serif;font-weight:700;text-align:center;font-size:26px;letter-spacing:2px}
""".replace("OSSO", OSSO)


def page(cls, body):
    return f'<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>{CSS}</style></head><body><div class="c {cls}">{body}</div></body></html>'


def topo(cor):
    return (f'<div class="a" style="left:0;right:0;top:64px;display:flex;flex-direction:column;align-items:center;gap:16px">'
            f'<img class="logo" src="{LOGO}" alt="Santuário Pet Center">'
            f'<div class="ass" style="color:{cor}">@SANTUARIOPET · TODO PET É ÚNICO</div></div>')


def corpo(pet_nome, lado, msg, w=700):
    pet_pos = "left:18px" if lado == "esq" else "right:18px"
    msg_pos = "right:64px" if lado == "esq" else "left:64px"
    return (f'<img class="a pet" src="{pet(pet_nome)}" style="{pet_pos};bottom:-40px;width:{w}px">'
            f'<div class="a msg" style="{msg_pos};top:770px;width:520px;font-size:42px;text-wrap:balance">{msg}</div>')


def v1():
    return page("verde", f"""{topo('#fff')}
  <div class="a tit" style="left:0;right:0;top:330px">
    <div class="feliz" style="font-size:130px">Feliz</div>
    <div class="natal" style="font-size:250px;margin-top:-40px">Natal</div>
  </div>
  {corpo('golden', 'esq', 'Que o teu Natal tenha <b>muito colo</b>, <i>petiscos</i> e <b>rabinhos abanando</b> de alegria!')}""")


def v2():
    return page("creme", f"""{topo('#0A3F28')}
  <div class="a tit" style="left:0;right:0;top:330px">
    <div class="feliz" style="font-size:112px">um Natal de</div>
    <div class="natal" style="font-size:158px;margin-top:-20px">muito <span class="v">ronrom</span></div>
  </div>
  {corpo('gato', 'dir', 'Que não falte <b>carinho</b>, <i>sonecas quentinhas</i> e uma <b>caixinha</b> para cada presente!', 660)}""")


def v3():
    return page("verde", f"""{topo('#fff')}
  <div class="a tit" style="left:0;right:0;top:330px">
    <div class="feliz" style="font-size:112px">um Natal cheio de</div>
    <div class="natal" style="font-size:200px;margin-top:-26px">lambeijos</div>
  </div>
  {corpo('shihtzu', 'esq', 'Obrigado por confiar no <b>Santuário</b> para cuidar de quem tu <i>mais ama</i>. Boas festas!', 660)}""")


def v4():
    return page("creme", f"""{topo('#0A3F28')}
  <div class="a tit" style="left:0;right:0;top:330px">
    <div class="natal" style="font-size:200px"><span class="v">Au</span>, <span class="v">au</span>, <span class="v">au</span>!</div>
    <div class="feliz" style="font-size:118px;margin-top:-14px">Feliz Natal!</div>
  </div>
  {corpo('beagle', 'dir', 'Este <b>petisco</b> é um mimo nosso para o teu melhor amigo. Um <i>Natal muito feliz</i> para vocês!', 620)}""")


CARTOES = [("cartao-natal-1-golden", v1), ("cartao-natal-2-gato", v2),
           ("cartao-natal-3-shihtzu", v3), ("cartao-natal-4-beagle", v4)]

JS = """
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1181, height: 1772 } });
  for (const job of process.argv.slice(2)) {
    const [src, out] = job.split('|');
    await p.goto('file://' + src, { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: out + '.png' });
    await p.pdf({ path: out + '.pdf', width: '100mm', height: '150mm', printBackground: true,
                  margin: { top: 0, right: 0, bottom: 0, left: 0 }, scale: 0.3197 });
  }
  await b.close();
})();
"""


def main():
    OUT.mkdir(exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        js = pathlib.Path(tmp) / "r.js"
        js.write_text(JS)
        jobs = []
        for nome, fn in CARTOES:
            src = pathlib.Path(tmp) / f"{nome}.html"
            src.write_text(fn(), encoding="utf-8")
            jobs.append(f"{src}|{OUT / nome}")
        subprocess.run(["node", str(js), *jobs], check=True)


if __name__ == "__main__":
    main()
