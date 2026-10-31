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
.cal .topo{background:var(--vermelho);color:#fff;font-weight:800;font-size:32px;letter-spacing:4px;text-transform:uppercase;padding:18px 0;position:relative}
.cal .topo::before,.cal .topo::after{content:"";position:absolute;top:-14px;width:22px;height:46px;border-radius:11px;background:var(--azul-esc)}
.cal .topo::before{left:30px}.cal .topo::after{right:30px}
.cal .dia{font-weight:900;font-size:220px;line-height:1;letter-spacing:-8px;margin-top:18px}
.cal .mes{font-weight:800;font-size:40px;letter-spacing:6px;text-transform:uppercase;color:var(--cinza)}
.cal .fechado{display:inline-block;margin:18px 0 28px;background:#FDE7E6;color:var(--vermelho);font-weight:800;font-size:32px;
  letter-spacing:3px;text-transform:uppercase;padding:12px 28px;border-radius:14px}
"""


PATA = ('<svg viewBox="0 0 100 100" fill="currentColor"><ellipse cx="50" cy="68" rx="22" ry="19"/>'
        '<ellipse cx="22" cy="42" rx="10" ry="13"/><ellipse cx="40" cy="25" rx="10" ry="13"/>'
        '<ellipse cx="60" cy="25" rx="10" ry="13"/><ellipse cx="78" cy="42" rx="10" ry="13"/></svg>')


def patas():
    pos = [(70, 760, 120, -20), (900, 820, 90, 18), (840, 1380, 130, 24), (90, 1430, 95, -14), (930, 300, 80, 12), (60, 260, 70, -18)]
    return "".join(f'<div class="abs" style="left:{x}px;top:{y}px;width:{w}px;height:{w}px;transform:rotate({r}deg);'
                   f'color:#fff;opacity:.07">{PATA}</div>' for x, y, w, r in pos)


def story():
    return f"""<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>{CSS}</style></head><body>
<div class="slide" style="height:1920px;background:radial-gradient(1200px 1100px at 50% 52%,#1E42C8 0%,var(--azul) 48%,var(--azul-esc) 100%)">
  {patas()}
  <div class="abs" style="left:0;right:0;top:200px;display:flex;justify-content:center">
    <img src="{base.LOGO}" style="height:160px;filter:drop-shadow(0 8px 18px rgba(0,0,0,.35))" alt="Agropet Bichão"></div>

  <div class="abs" style="left:48px;right:48px;top:400px;text-align:center">
    <span class="pill vermelho" style="font-size:28px;padding:14px 32px">Lembrete</span>
    <div style="font-weight:900;font-size:100px;line-height:1.02;letter-spacing:-3px;margin-top:26px;text-transform:uppercase">
      Adiante o pedido<br><span style="color:var(--laranja)">do seu pet!</span></div>
  </div>

  <div class="palco anel" style="top:730px;width:640px;height:640px"></div>
  <div class="palco disco" style="top:790px;width:520px;height:520px"></div>
  <div class="abs" style="left:50%;top:780px;transform:translateX(-50%) rotate(-4deg)">
    <div class="cal" style="width:440px">
      <div class="topo">Segunda-feira</div>
      <div class="dia">02</div>
      <div class="mes">Novembro</div>
      <div class="fechado">Loja fechada</div>
    </div>
  </div>

  <div class="abs" style="left:96px;right:96px;top:1385px;text-align:center">
    <div style="font-weight:800;font-size:46px;line-height:1.15">Feriado de Finados</div>
    <div style="width:70px;height:7px;border-radius:4px;background:var(--laranja);margin:22px auto"></div>
    <div style="font-weight:500;font-size:33px;line-height:1.42;opacity:.92;text-wrap:balance">
      Não deixe a ração, a areia ou o remédio acabar. Faça seu pedido antes do feriado!</div>
  </div>

  <div class="abs" style="left:0;right:0;top:1605px;display:flex;justify-content:center">
    <div style="display:flex;align-items:center;gap:18px;background:var(--laranja);color:var(--azul-esc);font-weight:800;font-size:54px;
      letter-spacing:-1px;padding:22px 46px;border-radius:999px;box-shadow:0 12px 0 var(--laranja-esc)">
      {base.icon("wa", 58, "#06175E", 2.4)}{base.WHATS}</div></div>
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
