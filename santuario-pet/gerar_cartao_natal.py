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
FUNDOS["kraft"] = ("repeating-linear-gradient(0deg,rgba(120,80,30,.07) 0 26px,transparent 26px 52px),"
                   "repeating-linear-gradient(90deg,rgba(120,80,30,.07) 0 26px,transparent 26px 52px),#E9D7B9")
FUNDOS["verde_esc_neve"] = (f"radial-gradient(circle,rgba(255,255,255,.7) 0 3px,transparent 4px) 0 0/44px 44px,"
                            f"radial-gradient(circle,rgba(255,255,255,.35) 0 2px,transparent 3px) 22px 22px/44px 44px,"
                            f"radial-gradient(800px 600px at 50% 30%,#0E5A39,{C['verde_esc']} 60%,#062A1B)")
PETISCO = {
    "xadrez_kraft": "repeating-linear-gradient(0deg,rgba(158,22,34,.14) 0 28px,transparent 28px 56px),"
                    "repeating-linear-gradient(90deg,rgba(158,22,34,.14) 0 28px,transparent 28px 56px),#F7EEDD",
    "listra_dourada": f"repeating-linear-gradient(-45deg,{C['ouro']} 0 22px,#FFF8EA 22px 44px)",
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


def v1_cores(fundo, tit_cor, tit_extra, copy_cor, destaque, petisco, borda_cores, feliz_cor=None, caixa=None):
    t = titulo("dir", f'<div class="script" style="font-size:78px;color:{feliz_cor or tit_cor}">Feliz</div>'
                      f'<div class="serif" style="font-size:132px;color:{tit_cor};margin-top:-24px;{tit_extra}">Natal!</div>')
    c = copy("dir", copy_cor, f'Que a tua casa tenha cheirinho de biscoito, <span style="color:{destaque}">rabinho abanando</span> e muito amor.')
    if caixa:
        c = c.replace('top:430px;width:470px;', f'top:420px;width:470px;background:{caixa};border-radius:20px;padding:18px 22px;text-shadow:none;')
    return cartao(fundo, t, pet_esq("golden", 400), c, petisco, borda_cores)


VARIACOES_GOLDEN = [
    ("cartao-natal-1b-golden-vermelho", lambda: v1_cores("vermelho_neve", "#fff", f"-webkit-text-stroke:12px {C['red_esc']}",
                                                          "#fff", "#FFE7A3", "xadrez_creme", (C["verde"], "#fff"), feliz_cor=C["ouro"], caixa="rgba(120,10,20,.55)")),
    ("cartao-natal-1c-golden-verde", lambda: v1_cores("verde_esc_neve", C["red"], "", "#fff", "#FFE7A3",
                                                       "listra_vermelha", (C["ouro"], "#fff"), caixa="rgba(4,30,18,.6)")),
    ("cartao-natal-1d-golden-kraft", lambda: v1_cores("kraft", C["red"], "", C["verde_esc"], C["red"],
                                                       "listra_dourada", (C["red"], "#fff"))),
]

def natau():
    fundo = (f"radial-gradient(circle,rgba(255,240,200,.5) 0 3px,transparent 4px) 0 0/44px 44px,"
             f"radial-gradient(circle,rgba(255,255,255,.25) 0 2px,transparent 3px) 22px 22px/44px 44px,"
             f"radial-gradient(700px 520px at 72% 22%,#13704A,#0A4A30 55%,#05301F)")
    col = "left:486px;width:476px"
    logo = (f'<img class="a" src="{LOGO}" style="left:40px;top:36px;width:92px;height:92px;border-radius:50%;'
            f'box-shadow:0 0 0 5px #fff,0 8px 18px rgba(0,0,0,.35);z-index:4">')
    dupla = f'<img class="a pet" src="{pet("dupla")}" style="left:-8px;bottom:{1134 - 660}px;width:470px;z-index:2">'
    sombra = "text-shadow:0 6px 16px rgba(0,0,0,.35)"
    tit = (f'<div class="a" style="{col};top:74px;text-align:center;line-height:1;z-index:3">'
           f'<div style="font-family:Pacifico,cursive;font-size:76px;color:#FBF4E6;{sombra}">Feliz</div>'
           f'<div style="font-family:Fraunces,serif;font-weight:900;font-size:124px;letter-spacing:-1px;color:#fff;'
           f'margin-top:10px;white-space:nowrap;{sombra}">Nat<span style="display:inline-block;line-height:.86;color:#fff;'
           f'background:{C["red"]};border-radius:16px;padding:6px 14px 10px 12px;margin:0 6px 0 8px;font-style:italic;'
           f'transform:rotate(-3deg);box-shadow:0 8px 18px rgba(0,0,0,.35)">AU</span>!</div>'
           f'<div style="width:90px;height:4px;border-radius:2px;background:{C["red"]};margin:26px auto 0"></div></div>')
    msg = (f'<div class="a" style="{col};top:368px;z-index:3;text-align:center;font-family:Fraunces,serif;'
           f'font-style:italic;font-weight:600;font-size:34px;line-height:1.34;color:#fff;text-wrap:balance;{sombra}">'
           f'Um petisco especial para quem deixa todos os nossos dias mais felizes!</div>'
           f'<div class="a" style="{col};top:530px;z-index:3;text-align:center;font-family:Quicksand,sans-serif;'
           f'font-weight:700;font-size:21px;letter-spacing:4px;color:#FBF4E6;text-transform:uppercase">Com carinho, Santuário Pet</div>')
    return (f'<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>{CSS}</style></head><body><div class="c">'
            f'<div class="topo" style="background:{fundo}"></div>{logo}{dupla}{tit}{msg}'
            f'{borda(C["red"], "#fff")}<div class="meio" style="background:{PETISCO["listra_vermelha"]}"></div></div></body></html>')


def aumiau():
    fundo = (f"radial-gradient(circle,rgba(255,240,200,.5) 0 3px,transparent 4px) 0 0/44px 44px,"
             f"radial-gradient(circle,rgba(255,255,255,.25) 0 2px,transparent 3px) 22px 22px/44px 44px,"
             f"radial-gradient(700px 520px at 72% 22%,#13704A,#0A4A30 55%,#05301F)")
    col = "left:486px;width:476px"
    logo = (f'<img class="a" src="{LOGO}" style="left:40px;top:36px;width:92px;height:92px;border-radius:50%;'
            f'box-shadow:0 0 0 5px #fff,0 8px 18px rgba(0,0,0,.35);z-index:4">')
    dupla = f'<img class="a pet" src="{pet("dupla")}" style="left:-8px;bottom:{1134 - 660}px;width:470px;z-index:2">'
    sombra = "text-shadow:0 6px 16px rgba(0,0,0,.35)"
    tag = (f'display:inline-block;line-height:.9;color:#fff;background:{C["red"]};border-radius:14px;'
           f'padding:4px 14px 8px 12px;font-style:italic;box-shadow:0 8px 18px rgba(0,0,0,.35)')
    linha = f'font-family:Fraunces,serif;font-weight:900;color:#fff;white-space:nowrap;letter-spacing:-.5px;{sombra}'
    tit = (f'<div class="a" style="{col};top:58px;text-align:center;line-height:1;z-index:3">'
           f'<div style="{linha};font-size:82px">Au, au!</div>'
           f'<div style="{linha};font-size:82px;margin-top:14px"><span style="{tag};transform:rotate(-2deg)">Miau, miau!</span></div>'
           f'<div style="font-family:Pacifico,cursive;font-size:68px;color:#FBF4E6;margin-top:14px;{sombra}">Feliz Natal!</div>'
           f'<div style="width:90px;height:4px;border-radius:2px;background:{C["red"]};margin:22px auto 0"></div></div>')
    msg = (f'<div class="a" style="{col};top:400px;z-index:3;text-align:center;font-family:Fraunces,serif;'
           f'font-style:italic;font-weight:600;font-size:30px;line-height:1.32;color:#fff;text-wrap:balance;{sombra}">'
           f'Um petisco especial para quem deixa todos os nossos dias mais felizes!</div>'
           f'<div class="a" style="{col};top:540px;z-index:3;text-align:center;font-family:Quicksand,sans-serif;'
           f'font-weight:700;font-size:21px;letter-spacing:4px;color:#FBF4E6;text-transform:uppercase">Com carinho, Santuário Pet</div>')
    return (f'<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>{CSS}</style></head><body><div class="c">'
            f'<div class="topo" style="background:{fundo}"></div>{logo}{dupla}{tit}{msg}'
            f'{borda(C["red"], "#fff")}<div class="meio" style="background:{PETISCO["listra_vermelha"]}"></div></div></body></html>')


CARTOES = [("cartao-natal-1-golden", v1), ("cartao-natal-2-gato", v2),
           ("cartao-natal-3-shihtzu", v3), ("cartao-natal-4-beagle", v4)] + VARIACOES_GOLDEN + [("cartao-natal-5-natau", natau), ("cartao-natal-6-au-miau", aumiau)]

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
    # PDF final a partir do PNG em 300 dpi (85 x 96 mm): idêntico à arte em qualquer programa/gráfica
    from PIL import Image
    for nome, _ in CARTOES:
        im = Image.open(OUT / f"{nome}.png").convert("RGB")
        im.save(OUT / f"{nome}.pdf", "PDF", resolution=300.0)


if __name__ == "__main__":
    main()
