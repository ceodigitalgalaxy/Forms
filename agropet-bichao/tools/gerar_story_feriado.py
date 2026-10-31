"""Story 1080x1920: lembrete para adiantar o pedido antes do feriado de 02/11.

Reaproveita o sistema visual dos carrosséis (gerar_fecha_mes.py).
Uso: python3 agropet-bichao/tools/gerar_story_feriado.py
Saída: agropet-bichao/stories/feriado-02-11.png
"""
import os
import pathlib
import subprocess
import tempfile

import gerar_fecha_mes as base

ROOT = base.ROOT
OUT = ROOT / "stories" / "feriado-02-11.png"

CSS = base.CSS.replace("height:1350px", "height:1920px") + """
.cal{background:#fff;border-radius:36px;overflow:hidden;box-shadow:0 30px 70px rgba(3,10,50,.5);text-align:center;color:var(--azul)}
.cal .topo{background:var(--vermelho);color:#fff;font-weight:800;font-size:30px;letter-spacing:4px;text-transform:uppercase;padding:18px 0;position:relative}
.cal .topo::before,.cal .topo::after{content:"";position:absolute;top:-14px;width:22px;height:46px;border-radius:11px;background:var(--azul-esc)}
.cal .topo::before{left:34px}.cal .topo::after{right:34px}
.cal .dia{font-weight:900;font-size:170px;line-height:1;letter-spacing:-8px;margin-top:18px}
.cal .mes{font-weight:800;font-size:40px;letter-spacing:6px;text-transform:uppercase;color:var(--cinza)}
.cal .fechado{display:inline-block;margin:18px 0 28px;background:#FDE7E6;color:var(--vermelho);font-weight:800;font-size:32px;
  letter-spacing:3px;text-transform:uppercase;padding:12px 28px;border-radius:14px}
"""


def story():
    prods = [("guabi-natural-caes-medias", -320, 300, 330), ("nd-pumpkin-gatos", 0, 330, 400),
             ("bionatural-sensitive-peixe", 320, 300, 330)]
    vitrine = "".join(
        f'<div class="prod" style="top:{1510 - h}px;margin-left:{dx}px;width:{w}px;height:{h}px;z-index:{2 if dx == 0 else 1}">'
        f'<img src="{base.foto(s)}" alt=""></div>'
        for s, dx, w, h in prods
    )
    return f"""<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>{CSS}</style></head><body>
<div class="slide" style="height:1920px">
  <div class="abs" style="left:0;right:0;top:170px;display:flex;justify-content:center">
    <img src="{base.LOGO}" style="height:160px;filter:drop-shadow(0 8px 18px rgba(0,0,0,.35))" alt="Agropet Bichão"></div>

  <div class="abs" style="left:48px;right:48px;top:360px;text-align:center">
    <span class="pill vermelho" style="font-size:28px;padding:14px 30px">Lembrete</span>
    <div style="font-weight:900;font-size:94px;line-height:1.02;letter-spacing:-3px;margin-top:26px;text-transform:uppercase">
      Adiante o pedido<br><span style="color:var(--laranja)">do seu pet!</span></div>
  </div>

  <div class="abs" style="left:64px;top:690px;display:flex;gap:40px;align-items:center;right:64px">
    <div class="cal" style="width:340px;flex:none">
      <div class="topo">Segunda</div>
      <div class="dia">02</div>
      <div class="mes">Novembro</div>
      <div class="fechado">Fechado</div>
    </div>
    <div style="flex:1">
      <div style="font-weight:800;font-size:44px;line-height:1.12;text-wrap:balance">Feriado de Finados: a loja não vai abrir.</div>
      <div style="width:70px;height:7px;border-radius:4px;background:var(--laranja);margin:24px 0"></div>
      <div style="font-weight:500;font-size:32px;line-height:1.4;opacity:.92;text-wrap:pretty">Não deixe a ração, a areia ou o remédio acabar. Faça seu pedido antes!</div>
    </div>
  </div>

  <div class="palco disco" style="top:1300px;width:1300px;height:1300px"></div>
  {vitrine}

  <div class="abs" style="left:0;right:0;top:1540px;display:flex;justify-content:center;z-index:3">
    <div style="display:flex;align-items:center;gap:18px;background:var(--azul);color:#fff;font-weight:800;font-size:54px;
      letter-spacing:-1px;padding:22px 46px;border-radius:999px;box-shadow:0 14px 30px rgba(3,10,50,.45)">
      {base.icon("wa", 58, "#fff", 2.4)}{base.WHATS}</div></div>
  <div class="abs" style="left:0;right:0;top:1665px;text-align:center;z-index:3;font-weight:700;font-size:28px;color:var(--azul-esc)">
    Tele-entrega grátis: consulte condições</div>
</div></body></html>"""


def main():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        src = pathlib.Path(tmp) / "story.html"
        src.write_text(story(), encoding="utf-8")
        subprocess.run(["node", str(pathlib.Path(__file__).with_name("render.js")), f"{src}|{OUT}"],
                       check=True, env={**os.environ, "H": "1920"})


if __name__ == "__main__":
    main()
