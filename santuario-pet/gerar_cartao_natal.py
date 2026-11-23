"""Cartões de Natal Santuário Pet (para acompanhar petisco) — 4 variações, v2.

Estrutura (como os cartões de petisco de referência):
  topo: título + ilustração do pet | meio: área estampada livre para o petisco | rodapé: mensagem + logo.
Formato 10 x 15 cm (1181 x 1772 px a 300 dpi). Saída: PNG + PDF em santuario-pet/natal/.
Regra de contraste: nunca texto verde sobre fundo verde.
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


C = dict(verde="#06603A", verde_esc="#0A3F28", lime="#AED250", creme="#FBF4E6", off="#F5F7EF",
         red="#C8202E", red_esc="#9E1622", ink="#14261C", ouro="#E3B04B")

FUNDOS = {
    "creme_xadrez": f"repeating-linear-gradient(0deg,rgba(6,96,58,.07) 0 40px,transparent 40px 80px),"
                    f"repeating-linear-gradient(90deg,rgba(6,96,58,.07) 0 40px,transparent 40px 80px),{C['creme']}",
    "vermelho_neve": f"radial-gradient(circle,rgba(255,255,255,.8) 0 3px,transparent 4px) 0 0/64px 64px,"
                     f"radial-gradient(circle,rgba(255,255,255,.45) 0 2px,transparent 3px) 32px 32px/64px 64px,"
                     f"radial-gradient(900px 700px at 50% 30%,#D9293A,{C['red']} 55%,{C['red_esc']})",
    "verde_neve": f"radial-gradient(circle,rgba(255,255,255,.75) 0 3px,transparent 4px) 0 0/64px 64px,"
                  f"radial-gradient(circle,rgba(255,255,255,.4) 0 2px,transparent 3px) 32px 32px/64px 64px,"
                  f"radial-gradient(900px 700px at 50% 30%,#0B7A4A,{C['verde']} 55%,{C['verde_esc']})",
    "creme_xadrez_red": f"repeating-linear-gradient(0deg,rgba(200,32,46,.07) 0 40px,transparent 40px 80px),"
                        f"repeating-linear-gradient(90deg,rgba(200,32,46,.07) 0 40px,transparent 40px 80px),{C['creme']}",
}
PETISCO = {
    "xadrez_verde": f"repeating-linear-gradient(0deg,rgba(6,96,58,.16) 0 46px,transparent 46px 92px),"
                    f"repeating-linear-gradient(90deg,rgba(6,96,58,.16) 0 46px,transparent 46px 92px),#fff",
    "listra_vermelha": f"repeating-linear-gradient(-45deg,{C['red']} 0 34px,#fff 34px 68px)",
    "xadrez_creme": f"repeating-linear-gradient(0deg,rgba(200,32,46,.12) 0 46px,transparent 46px 92px),"
                    f"repeating-linear-gradient(90deg,rgba(200,32,46,.12) 0 46px,transparent 46px 92px),#fff",
    "listra_verde": f"repeating-linear-gradient(-45deg,{C['verde']} 0 34px,#fff 34px 68px)",
}

CSS = """
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,900&family=Pacifico&family=Quicksand:wght@600;700&display=block');
@page{size:100mm 150mm;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1181px;height:1772px;overflow:hidden;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.c{position:relative;width:1181px;height:1772px;overflow:hidden;background:#fff}
.a{position:absolute}
.topo{position:absolute;left:0;right:0;top:0;height:980px}
.meio{position:absolute;left:0;right:0;top:1000px;height:540px}
.borda{position:absolute;left:0;right:0;top:980px;height:20px;z-index:3}
.rod{position:absolute;left:0;right:0;bottom:0;height:232px;display:flex;align-items:center;justify-content:space-between;
  padding:0 70px;gap:30px;box-shadow:0 -10px 24px rgba(0,0,0,.12)}
.rod .t{font-family:'Quicksand',sans-serif;font-weight:700;font-size:44px;line-height:1.2}
.rod img{width:148px;height:148px;border-radius:50%;box-shadow:0 0 0 7px #fff;flex:none}
.tit{line-height:1}
.script{font-family:'Pacifico',cursive;
  text-shadow:4px 4px 0 #fff,-4px -4px 0 #fff,4px -4px 0 #fff,-4px 4px 0 #fff,0 6px 0 #fff,0 -6px 0 #fff,6px 0 0 #fff,-6px 0 0 #fff,0 12px 14px rgba(0,0,0,.25)}
.serif{font-family:'Fraunces',serif;font-weight:900;letter-spacing:-2px;-webkit-text-stroke:20px #fff;paint-order:stroke fill;
  filter:drop-shadow(0 10px 12px rgba(0,0,0,.25))}
.pet{z-index:2;filter:drop-shadow(9px 0 0 #fff) drop-shadow(-9px 0 0 #fff) drop-shadow(0 9px 0 #fff) drop-shadow(0 -9px 0 #fff) drop-shadow(0 16px 18px rgba(0,0,0,.3))}
.handle{font-family:'Quicksand',sans-serif;font-weight:700;font-size:24px;letter-spacing:3px}
"""


def borda(c1, c2):
    return f'<div class="borda" style="background:repeating-linear-gradient(90deg,{c1} 0 30px,{c2} 30px 60px)"></div>'


def cartao(fundo, handle_cor, titulo, pet_html, petisco, borda_cores, rod_bg, rod_txt):
    return (f'<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>{CSS}</style></head><body><div class="c">'
            f'<div class="topo" style="background:{FUNDOS[fundo]}"></div>'
            f'<div class="a handle" style="left:0;right:0;top:56px;text-align:center;color:{handle_cor}">@SANTUARIOPET</div>'
            f'{titulo}{pet_html}{borda(*borda_cores)}'
            f'<div class="meio" style="background:{PETISCO[petisco]}"></div>'
            f'<div class="rod" style="background:{rod_bg}"><div class="t" style="color:#fff">{rod_txt}</div>'
            f'<img src="{LOGO}" alt="Santuário Pet Center"></div></div></body></html>')


def pet_centro(n, w):
    return f'<img class="a pet" src="{pet(n)}" style="left:50%;transform:translateX(-50%);bottom:{1772 - 990}px;width:{w}px">'


def pet_dir(n, w):
    return f'<img class="a pet" src="{pet(n)}" style="right:50px;bottom:{1772 - 990}px;width:{w}px">'


def v1():  # golden — topo creme, petisco xadrez verde claro, rodapé verde
    t = (f'<div class="a tit" style="left:0;right:0;top:120px;text-align:center">'
         f'<div class="script" style="font-size:120px;color:{C["red"]}">Feliz</div>'
         f'<div class="serif" style="font-size:210px;color:{C["red"]};margin-top:-36px">Natal!</div></div>')
    return cartao("creme_xadrez", C["verde"], t, pet_centro("golden", 500), "xadrez_verde", (C["red"], "#fff"),
                  C["verde_esc"], f'Um mimo para o teu<br><span style="color:{C["lime"]}">melhor amigo!</span>')


def v2():  # gato — topo vermelho, petisco xadrez creme, rodapé verde
    t = (f'<div class="a tit" style="left:70px;top:190px;width:600px">'
         f'<div class="script" style="font-size:100px;color:{C["red"]}">um Natal de</div>'
         f'<div class="serif" style="font-size:150px;color:#fff;-webkit-text-stroke:18px {C["red_esc"]};margin-top:-10px">muito</div>'
         f'<div class="serif" style="font-size:150px;color:#fff;-webkit-text-stroke:18px {C["red_esc"]};margin-top:-14px">ronrom</div></div>')
    return cartao("vermelho_neve", "#fff", t, pet_dir("gato", 480), "xadrez_creme", (C["verde"], "#fff"),
                  C["verde_esc"], f'Um mimo para o teu<br><span style="color:{C["lime"]}">gatinho especial!</span>')


def v3():  # shih tzu — topo verde (título vermelho com contorno branco), petisco listra vermelha, rodapé vermelho
    t = (f'<div class="a tit" style="left:0;right:0;top:100px;text-align:center">'
         f'<div class="script" style="font-size:96px;color:{C["red"]}">um Natal cheio de</div>'
         f'<div class="serif" style="font-size:170px;color:{C["red"]};margin-top:-22px">lambeijos</div></div>')
    return cartao("verde_neve", "#fff", t, pet_centro("shihtzu", 460), "listra_vermelha", (C["verde_esc"], "#fff"),
                  C["red"], 'Obrigado por fazer parte<br>da <span style="color:#FFE7A3">família Santuário!</span>')


def v4():  # beagle — topo creme xadrez vermelho, petisco listra verde, rodapé vermelho
    t = (f'<div class="a tit" style="left:70px;top:200px;width:620px">'
         f'<div class="serif" style="font-size:150px;color:{C["verde"]}">Au, au,</div>'
         f'<div class="serif" style="font-size:150px;color:{C["verde"]};margin-top:-6px">au!</div>'
         f'<div class="script" style="font-size:96px;color:{C["red"]};margin-top:4px">Feliz Natal!</div></div>')
    return cartao("creme_xadrez_red", C["red"], t, pet_dir("beagle", 450), "listra_verde", (C["red"], "#fff"),
                  C["red"], 'Um petisco com carinho<br>para o teu <span style="color:#FFE7A3">melhor amigo!</span>')


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
