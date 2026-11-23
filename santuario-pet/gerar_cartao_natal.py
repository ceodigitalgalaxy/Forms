"""Cartões de Natal Santuário Pet (para acompanhar petisco) — 4 variações, v2.

Estrutura (como os cartões de petisco de referência):
  topo: título + ilustração do pet | meio: área estampada livre para o petisco | rodapé: mensagem + logo.
Formato 8,5 x 9,6 cm (1004 x 1134 px a 300 dpi). Saída: PNG + PDF em santuario-pet/natal/.
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
    "creme_xadrez": f"repeating-linear-gradient(0deg,rgba(6,96,58,.07) 0 26px,transparent 26px 52px),"
                    f"repeating-linear-gradient(90deg,rgba(6,96,58,.07) 0 26px,transparent 26px 52px),{C['creme']}",
    "vermelho_neve": f"radial-gradient(circle,rgba(255,255,255,.8) 0 3px,transparent 4px) 0 0/44px 44px,"
                     f"radial-gradient(circle,rgba(255,255,255,.45) 0 2px,transparent 3px) 22px 22px/44px 44px,"
                     f"radial-gradient(900px 700px at 50% 30%,#D9293A,{C['red']} 55%,{C['red_esc']})",
    "verde_neve": f"radial-gradient(circle,rgba(255,255,255,.75) 0 3px,transparent 4px) 0 0/44px 44px,"
                  f"radial-gradient(circle,rgba(255,255,255,.4) 0 2px,transparent 3px) 22px 22px/44px 44px,"
                  f"radial-gradient(900px 700px at 50% 30%,#0B7A4A,{C['verde']} 55%,{C['verde_esc']})",
    "creme_xadrez_red": f"repeating-linear-gradient(0deg,rgba(200,32,46,.07) 0 26px,transparent 26px 52px),"
                        f"repeating-linear-gradient(90deg,rgba(200,32,46,.07) 0 26px,transparent 26px 52px),{C['creme']}",
}
PETISCO = {
    "xadrez_verde": f"repeating-linear-gradient(0deg,rgba(6,96,58,.16) 0 28px,transparent 28px 56px),"
                    f"repeating-linear-gradient(90deg,rgba(6,96,58,.16) 0 28px,transparent 28px 56px),#fff",
    "listra_vermelha": f"repeating-linear-gradient(-45deg,{C['red']} 0 22px,#fff 22px 44px)",
    "xadrez_creme": f"repeating-linear-gradient(0deg,rgba(200,32,46,.12) 0 28px,transparent 28px 56px),"
                    f"repeating-linear-gradient(90deg,rgba(200,32,46,.12) 0 28px,transparent 28px 56px),#fff",
    "listra_verde": f"repeating-linear-gradient(-45deg,{C['verde']} 0 22px,#fff 22px 44px)",
}

CSS = """
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,900;1,9..144,600&family=Pacifico&family=Quicksand:wght@600;700&display=block');
@page{size:85mm 96mm;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1004px;height:1134px;overflow:hidden;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.c{position:relative;width:1004px;height:1134px;overflow:hidden;background:#fff}
.a{position:absolute}
.topo{position:absolute;left:0;right:0;top:0;height:650px}
.meio{position:absolute;left:0;right:0;top:666px;bottom:0}
.borda{position:absolute;left:0;right:0;top:650px;height:16px;z-index:3}
.tag{position:absolute;left:46px;right:46px;top:38px;height:150px;background:#fff;border-radius:22px;display:flex;align-items:center;
  gap:24px;padding:0 28px;box-shadow:0 12px 30px rgba(0,0,0,.18);z-index:4}
.tag img{width:108px;height:108px;border-radius:50%;flex:none}
.tag .txt{flex:1;font-family:'Quicksand',sans-serif;font-weight:700;color:#14261C}
.tag .para{display:flex;align-items:flex-end;gap:12px;font-size:34px}
.tag .para i{flex:1;height:0;border-bottom:4px dotted #9AA89E;margin-bottom:10px}
.tag .de{font-size:21px;letter-spacing:2px;text-transform:uppercase;margin-top:12px;color:#5C6B62}
.tag .de b{color:#C8202E}
.tag::before{content:"";position:absolute;right:-18px;top:50%;width:36px;height:36px;margin-top:-18px;border-radius:50%;background:inherit}
.tit{line-height:1;z-index:3}
.script{font-family:'Pacifico',cursive;
  text-shadow:3px 3px 0 #fff,-3px -3px 0 #fff,3px -3px 0 #fff,-3px 3px 0 #fff,0 5px 0 #fff,0 -5px 0 #fff,5px 0 0 #fff,-5px 0 0 #fff,0 10px 12px rgba(0,0,0,.25)}
.serif{font-family:'Fraunces',serif;font-weight:900;letter-spacing:-2px;-webkit-text-stroke:14px #fff;paint-order:stroke fill;
  filter:drop-shadow(0 10px 12px rgba(0,0,0,.25))}
.pet{z-index:2;filter:drop-shadow(7px 0 0 #fff) drop-shadow(-7px 0 0 #fff) drop-shadow(0 7px 0 #fff) drop-shadow(0 -7px 0 #fff) drop-shadow(0 12px 14px rgba(0,0,0,.3))}
.copy{position:absolute;font-family:'Fraunces',serif;font-style:italic;font-weight:600;font-size:33px;line-height:1.25;z-index:3;text-wrap:balance;text-shadow:0 2px 12px rgba(0,0,0,.18)}
"""


def borda(c1, c2):
    return f'<div class="borda" style="background:repeating-linear-gradient(90deg,{c1} 0 20px,{c2} 20px 40px)"></div>'


def cartao(fundo, titulo, pet_html, copy_html, petisco, borda_cores):
    return (f'<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>{CSS}</style></head><body><div class="c">'
            f'<div class="topo" style="background:{FUNDOS[fundo]}"></div>'
            f'<div class="tag"><img src="{LOGO}" alt="Santuário Pet Center"><div class="txt">'
            f'<div class="para">Para:<i></i></div><div class="de">Com carinho, <b>Santuário Pet</b></div></div></div>'
            f'{titulo}{pet_html}{copy_html}{borda(*borda_cores)}'
            f'<div class="meio" style="background:{PETISCO[petisco]}"></div></div></body></html>')


def pet_esq(n, w):
    return f'<img class="a pet" src="{pet(n)}" style="left:30px;bottom:{1134 - 658}px;width:{w}px">'


def pet_dir(n, w):
    return f'<img class="a pet" src="{pet(n)}" style="right:30px;bottom:{1134 - 658}px;width:{w}px">'


def copy(lado, cor, txt):
    pos = "right:46px" if lado == "dir" else "left:46px"
    return f'<div class="copy" style="{pos};top:430px;width:470px;color:{cor}">{txt}</div>'


def titulo(lado, html):
    pos = "right:46px" if lado == "dir" else "left:46px"
    return f'<div class="a tit" style="{pos};top:222px;width:470px;text-align:center">{html}</div>'


def v1():
    t = titulo("dir", f'<div class="script" style="font-size:78px;color:{C["red"]}">Feliz</div>'
                      f'<div class="serif" style="font-size:132px;color:{C["red"]};margin-top:-24px">Natal!</div>')
    return cartao("creme_xadrez", t, pet_esq("golden", 400),
                  copy("dir", C["verde_esc"], 'Que a tua casa tenha cheirinho de biscoito, <span style="color:#C8202E">rabinho abanando</span> e muito amor.'),
                  "xadrez_verde", (C["red"], "#fff"))


def v2():
    t = titulo("esq", f'<div class="script" style="font-size:66px;color:{C["red"]}">um Natal de</div>'
                      f'<div class="serif" style="font-size:80px;color:#fff;-webkit-text-stroke:12px {C["red_esc"]};margin-top:-4px;white-space:nowrap">muito ronrom</div>')
    return cartao("vermelho_neve", t, pet_dir("gato", 390),
                  copy("esq", "#fff", 'Quentinho como um colo e doce como uma <span style="color:#FFE7A3">soneca ao sol</span>.'),
                  "xadrez_creme", (C["verde"], "#fff"))


def v3():
    t = titulo("dir", f'<div class="serif" style="font-size:108px;color:{C["red"]}">Lambeijos</div>'
                      f'<div class="script" style="font-size:66px;color:{C["red"]};margin-top:-2px">de Natal</div>')
    return cartao("verde_neve", t, pet_esq("shihtzu", 370),
                  copy("dir", "#fff", 'Um mimo para quem enche a tua vida de <span style="color:#FFE7A3">lambeijos</span>. Feliz Natal!'),
                  "listra_vermelha", (C["verde_esc"], "#fff"))


def v4():
    t = titulo("esq", f'<div class="serif" style="font-size:104px;color:{C["verde"]}">Au, au, au!</div>'
                      f'<div class="script" style="font-size:64px;color:{C["red"]};margin-top:-2px">Feliz Natal!</div>')
    return cartao("creme_xadrez_red", t, pet_dir("beagle", 330),
                  copy("esq", C["verde_esc"], 'O Papai Noel passou no Santuário e deixou <span style="color:#C8202E">este petisco</span> só para ti!'),
                  "listra_verde", (C["red"], "#fff"))


CARTOES = [("cartao-natal-1-golden", v1), ("cartao-natal-2-gato", v2),
           ("cartao-natal-3-shihtzu", v3), ("cartao-natal-4-beagle", v4)]

JS = """
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1004, height: 1134 } });
  for (const job of process.argv.slice(2)) {
    const [src, out] = job.split('|');
    await p.goto('file://' + src, { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: out + '.png' });
    await p.pdf({ path: out + '.pdf', width: '85mm', height: '96mm', printBackground: true,
                  margin: { top: 0, right: 0, bottom: 0, left: 0 }, scale: 0.32 });
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
