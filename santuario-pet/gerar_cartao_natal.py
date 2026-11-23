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
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,900;1,9..144,600&family=Pacifico&family=Quicksand:wght@600;700&display=block');
@page{size:100mm 150mm;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1181px;height:1772px;overflow:hidden;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.c{position:relative;width:1181px;height:1772px;overflow:hidden;background:#fff}
.a{position:absolute}
.topo{position:absolute;left:0;right:0;top:0;height:1110px}
.meio{position:absolute;left:0;right:0;top:1130px;bottom:0}
.borda{position:absolute;left:0;right:0;top:1110px;height:20px;z-index:3}
.tag{position:absolute;left:70px;right:70px;top:60px;height:200px;background:#fff;border-radius:28px;display:flex;align-items:center;
  gap:34px;padding:0 40px;box-shadow:0 12px 30px rgba(0,0,0,.18);z-index:4}
.tag img{width:140px;height:140px;border-radius:50%;flex:none}
.tag .txt{flex:1;font-family:'Quicksand',sans-serif;font-weight:700;color:#14261C}
.tag .para{display:flex;align-items:flex-end;gap:16px;font-size:40px}
.tag .para i{flex:1;height:0;border-bottom:4px dotted #9AA89E;margin-bottom:10px}
.tag .de{font-size:26px;letter-spacing:2px;text-transform:uppercase;margin-top:16px;color:#5C6B62}
.tag .de b{color:#C8202E}
.tag::before{content:"";position:absolute;right:-18px;top:50%;width:36px;height:36px;margin-top:-18px;border-radius:50%;background:inherit}
.tit{line-height:1;z-index:3}
.script{font-family:'Pacifico',cursive;
  text-shadow:4px 4px 0 #fff,-4px -4px 0 #fff,4px -4px 0 #fff,-4px 4px 0 #fff,0 6px 0 #fff,0 -6px 0 #fff,6px 0 0 #fff,-6px 0 0 #fff,0 12px 14px rgba(0,0,0,.25)}
.serif{font-family:'Fraunces',serif;font-weight:900;letter-spacing:-2px;-webkit-text-stroke:20px #fff;paint-order:stroke fill;
  filter:drop-shadow(0 10px 12px rgba(0,0,0,.25))}
.pet{z-index:2;filter:drop-shadow(9px 0 0 #fff) drop-shadow(-9px 0 0 #fff) drop-shadow(0 9px 0 #fff) drop-shadow(0 -9px 0 #fff) drop-shadow(0 16px 18px rgba(0,0,0,.3))}
.copy{position:absolute;font-family:'Fraunces',serif;font-style:italic;font-weight:600;font-size:46px;line-height:1.25;z-index:3;text-wrap:balance;text-shadow:0 2px 12px rgba(0,0,0,.18)}
"""


def borda(c1, c2):
    return f'<div class="borda" style="background:repeating-linear-gradient(90deg,{c1} 0 30px,{c2} 30px 60px)"></div>'


def cartao(fundo, titulo, pet_html, copy_html, petisco, borda_cores):
    return (f'<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>{CSS}</style></head><body><div class="c">'
            f'<div class="topo" style="background:{FUNDOS[fundo]}"></div>'
            f'<div class="tag"><img src="{LOGO}" alt="Santuário Pet Center"><div class="txt">'
            f'<div class="para">Para:<i></i></div><div class="de">Com carinho, <b>Santuário Pet</b></div></div></div>'
            f'{titulo}{pet_html}{copy_html}{borda(*borda_cores)}'
            f'<div class="meio" style="background:{PETISCO[petisco]}"></div></div></body></html>')


def pet_esq(n, w):
    return f'<img class="a pet" src="{pet(n)}" style="left:40px;bottom:{1772 - 1118}px;width:{w}px">'


def pet_dir(n, w):
    return f'<img class="a pet" src="{pet(n)}" style="right:40px;bottom:{1772 - 1118}px;width:{w}px">'


def copy(lado, cor, txt):
    pos = "right:70px" if lado == "dir" else "left:70px"
    al = "left"
    return f'<div class="copy" style="{pos};top:640px;width:520px;color:{cor};text-align:{al}">{txt}</div>'


def v1():  # golden — topo creme xadrez verde
    t = (f'<div class="a tit" style="left:0;right:0;top:300px;text-align:center">'
         f'<div class="script" style="font-size:110px;color:{C["red"]}">Feliz</div>'
         f'<div class="serif" style="font-size:190px;color:{C["red"]};margin-top:-34px">Natal!</div></div>')
    return cartao("creme_xadrez", t, pet_esq("golden", 470),
                  copy("dir", C["verde_esc"], 'Que a tua casa tenha cheirinho de biscoito, <span style="color:#C8202E">rabinho abanando</span> e muito amor.'),
                  "xadrez_verde", (C["red"], "#fff"))


def v2():  # gato — topo vermelho
    t = (f'<div class="a tit" style="left:0;right:0;top:300px;text-align:center">'
         f'<div class="script" style="font-size:96px;color:{C["red"]}">um Natal de</div>'
         f'<div class="serif" style="font-size:160px;color:#fff;-webkit-text-stroke:18px {C["red_esc"]};margin-top:-14px">muito ronrom</div></div>')
    return cartao("vermelho_neve", t, pet_dir("gato", 450),
                  copy("esq", "#fff", 'Quentinho como um colo e doce como uma <span style="color:#FFE7A3">soneca ao sol</span>.'),
                  "xadrez_creme", (C["verde"], "#fff"))


def v3():  # shih tzu — topo verde: título vermelho com contorno branco, copy branca
    t = (f'<div class="a tit" style="left:0;right:0;top:300px;text-align:center">'
         f'<div class="serif" style="font-size:176px;color:{C["red"]}">Lambeijos</div>'
         f'<div class="script" style="font-size:100px;color:{C["red"]};margin-top:-6px">de Natal</div></div>')
    return cartao("verde_neve", t, pet_esq("shihtzu", 400),
                  copy("dir", "#fff", 'Um mimo para quem enche a tua vida de <span style="color:#FFE7A3">lambeijos</span>. Feliz Natal!'),
                  "listra_vermelha", (C["verde_esc"], "#fff"))


def v4():  # beagle — topo creme xadrez vermelho
    t = (f'<div class="a tit" style="left:0;right:0;top:300px;text-align:center">'
         f'<div class="serif" style="font-size:150px;color:{C["verde"]}">Au, au, au!</div>'
         f'<div class="script" style="font-size:86px;color:{C["red"]};margin-top:-6px">Feliz Natal!</div></div>')
    return cartao("creme_xadrez_red", t, pet_dir("beagle", 360),
                  copy("esq", C["verde_esc"], 'O Papai Noel passou no Santuário e deixou <span style="color:#C8202E">este petisco</span> só para ti!'),
                  "listra_verde", (C["red"], "#fff"))


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
