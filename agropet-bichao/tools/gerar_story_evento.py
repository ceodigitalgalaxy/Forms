"""Story 1080x1920: convite para o Super Evento Agropet Bichão + PremieRpet (14/11).

Uso: python3 agropet-bichao/tools/gerar_story_evento.py
Saída: agropet-bichao/stories/super-evento-14-11.png
"""
import base64
import os
import pathlib
import subprocess
import tempfile

import gerar_fecha_mes as base

ROOT = base.ROOT
OUT = ROOT / "stories" / "super-evento-14-11.png"
PREMIER = "data:image/svg+xml;base64," + base64.b64encode(
    (ROOT / "brand/parceiros/premierpet-laranja.svg").read_bytes()).decode()

ICON = dict(base.ICON)
ICON["tag"] = '<path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z"/><circle cx="7.5" cy="7.5" r="1.5"/>'
ICON["vet"] = '<path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10Z"/><path d="M12 10v5M9.5 12.5h5"/>'
ICON["syringe"] = '<path d="m18 2 4 4M15 5l4 4M7 13l4 4M3 21l3-3M14 6 6 14l4 4 8-8z"/>'
base.ICON.update(ICON)

CSS = base.CSS.replace("height:1350px", "height:1920px") + """
.data{display:flex;align-items:stretch;background:#fff;border-radius:34px;overflow:hidden;box-shadow:0 24px 60px rgba(3,10,50,.45)}
.data .dia{background:var(--laranja);color:var(--azul);padding:22px 34px;display:flex;flex-direction:column;align-items:center;justify-content:center}
.data .dia small{font-weight:800;font-size:26px;letter-spacing:4px;text-transform:uppercase}
.data .dia b{font-family:'Alfa Slab One',serif;font-weight:400;font-size:120px;line-height:1}
.data .dia span{font-weight:800;font-size:26px;letter-spacing:4px;text-transform:uppercase}
.data .info{flex:1;padding:26px 34px;color:var(--azul);display:flex;flex-direction:column;justify-content:center;gap:16px}
.data .linha{display:flex;align-items:center;gap:16px;font-weight:700;font-size:32px;line-height:1.2}
.data .linha small{display:block;font-weight:500;font-size:24px;color:var(--cinza)}
.item{display:flex;align-items:center;gap:22px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.16);
  border-radius:24px;padding:20px 26px}
.item .ic{width:72px;height:72px;border-radius:20px;background:var(--laranja);display:flex;align-items:center;justify-content:center;flex:none}
.item b{display:block;font-weight:800;font-size:34px;line-height:1.1}
.item span{display:block;font-weight:500;font-size:24px;opacity:.85;margin-top:4px}
.vacina{display:flex;align-items:stretch;border-radius:30px;overflow:hidden;box-shadow:0 24px 60px rgba(3,10,50,.45)}
.vacina .txt{flex:1;background:#fff;color:var(--azul);padding:26px 30px;display:flex;align-items:center;gap:20px}
.vacina .txt b{display:block;font-family:'Alfa Slab One',serif;font-weight:400;font-size:34px;line-height:1.08}
.vacina .txt span{display:block;font-weight:600;font-size:26px;color:var(--cinza);margin-top:6px}
.vacina .preco{flex:none;width:380px;background:linear-gradient(160deg,#F2352B 0%,var(--vermelho) 45%,#B3131B 100%);
  display:flex;flex-direction:column;justify-content:center;align-items:center;padding:22px 14px;color:#fff}
"""


def story():
    itens = [
        ("tag", "Ofertas imperdíveis", "Preços especiais só no dia do evento"),
        ("vet", "Veterinária no local", "Tire suas dúvidas sobre a saúde do seu pet"),
    ]
    cards = "".join(
        f'<div class="item"><div class="ic">{base.icon(i, 40, "#00238B")}</div><div><b>{t}</b><span>{d}</span></div></div>'
        for i, t, d in itens
    )
    return f"""<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>{CSS}</style></head><body>
<div class="slide" style="height:1920px;background:radial-gradient(1200px 1100px at 50% 40%,#0B36B8 0%,var(--azul) 48%,var(--azul-esc) 100%)">
  <div class="abs" style="left:0;right:0;top:170px;display:flex;justify-content:center">
    <img src="{base.LOGO_HS}" style="width:500px;filter:drop-shadow(0 8px 18px rgba(0,0,0,.35))" alt="Agropet Bichão"></div>

  <div class="abs" style="left:48px;right:48px;top:400px;text-align:center">
    <span class="pill vermelho" style="font-size:26px;padding:12px 30px">Você é nosso convidado</span>
    <div class="slab" style="font-size:132px;line-height:1;margin-top:24px;text-transform:uppercase">Super</div>
    <div class="slab" style="display:inline-block;margin-top:12px;background:var(--laranja);color:var(--azul);font-size:110px;line-height:1;
      text-transform:uppercase;padding:12px 44px 22px;border-radius:24px;transform:rotate(-2deg);box-shadow:0 14px 0 var(--laranja-esc)">Evento</div>
  </div>

  <div class="abs" style="left:0;right:0;top:815px;display:flex;justify-content:center">
    <div style="display:flex;align-items:center;gap:22px;background:#fff;border-radius:999px;padding:16px 36px 16px 32px;
      box-shadow:0 14px 34px rgba(3,10,50,.4)">
      <span style="font-weight:700;font-size:24px;letter-spacing:2px;text-transform:uppercase;color:var(--cinza)">Em parceria com</span>
      <img src="{PREMIER}" style="height:58px" alt="PremieRpet"></div>
  </div>

  <div class="abs data" style="left:64px;right:64px;top:945px">
    <div class="dia"><small>Sábado</small><b>14</b><span>Novembro</span></div>
    <div class="info">
      <div class="linha">{base.icon("clock", 40, "#FFA800", 2.4)}<div>A partir das 9h</div></div>
      <div class="linha">{base.icon("pin", 40, "#FFA800", 2.4)}<div>Av. Alberto Pasqualini, 451<small>Jardim Sabará · Porto Alegre</small></div></div>
    </div>
  </div>

  <div class="abs" style="left:64px;right:64px;top:1215px;display:flex;flex-direction:column;gap:16px">{cards}</div>

  <div class="abs vacina" style="left:64px;right:64px;top:1490px">
    <div class="txt">{base.icon("syringe", 56, "#FFA800", 2.2)}<div><b>Combo de vacinação</b><span>Proteção anual para o seu pet</span></div></div>
    {base.preco("119,90", "A partir de")}
  </div>
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
