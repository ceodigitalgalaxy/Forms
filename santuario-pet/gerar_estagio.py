"""Story 1080x1920: vaga de estágio em Medicina Veterinária (Hospital Veterinário Santuário Pet).

Uso: python3 santuario-pet/gerar_estagio.py
Saída: santuario-pet/vagas/estagio-medicina-veterinaria.png
Texto fiel ao card enviado pela cliente (apenas revisão de pontuação e formatação).
"""
import base64
import os
import pathlib
import subprocess
import tempfile

ROOT = pathlib.Path(__file__).resolve().parent
OUT = ROOT / "vagas" / "estagio-medicina-veterinaria.png"
RENDER = ROOT.parent / "agropet-bichao/tools/render.js"
LOGO = "data:image/png;base64," + base64.b64encode((ROOT / "brand/logo-horizontal-sem-fundo.png").read_bytes()).decode()

V, VE, LIME, LIME_CL, OFF, INK = "#06603A", "#0A3F28", "#AED250", "#DCEBB4", "#F5F7EF", "#14261C"

PATA = ('<svg viewBox="0 0 100 100" width="{s}" height="{s}" fill="{c}"><path d="M50 88c-14 0-26-8-26-19 0-9 9-17 26-17s26 8 26 17c0 11-12 19-26 19z"/>'
        '<ellipse cx="20" cy="44" rx="9" ry="12"/><ellipse cx="38" cy="26" rx="9" ry="12"/>'
        '<ellipse cx="62" cy="26" rx="9" ry="12"/><ellipse cx="80" cy="44" rx="9" ry="12"/></svg>')
CHECK = ('<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#fff" stroke-width="3.2" '
         'stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>')
MAIL = ('<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="' + VE + '" stroke-width="2.2" stroke-linecap="round" '
        'stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m4 7 8 6 8-6"/></svg>')
ZAP = ('<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="' + VE + '" stroke-width="2.2" stroke-linecap="round" '
       'stroke-linejoin="round"><path d="M4 20l1.3-3.9A8 8 0 1 1 8 18.8z"/><path d="M9.2 8.6c.2-.4.6-.5.9-.3l1 1.2c.2.3.1.6-.1.9l-.5.6a5.6 5.6 0 0 0 2.6 2.6l.6-.5c.3-.2.6-.3.9-.1l1.2 1c.2.3.1.7-.3.9-1 .7-2.3.6-3.6-.2a9 9 0 0 1-2.9-2.9c-.8-1.3-.9-2.6.2-3.2z"/></svg>')

CSS = f"""
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;0,9..144,800;1,9..144,600&family=Nunito+Sans:opsz,wght@6..12,500;6..12,600;6..12,700;6..12,800;6..12,900&family=Quicksand:wght@600;700&display=block');
*{{box-sizing:border-box;margin:0;padding:0}}
html,body{{width:1080px;height:1920px;overflow:hidden}}
.s{{position:relative;width:1080px;height:1920px;overflow:hidden;background:{OFF};font-family:'Nunito Sans',sans-serif;color:{INK}}}
.a{{position:absolute}}
.topo{{position:absolute;left:0;right:0;top:0;height:668px;
  background:radial-gradient(900px 600px at 85% 10%,#0D7449 0%,{V} 40%,{VE} 100%);border-radius:0 0 80px 80px}}
.tag{{display:inline-flex;align-items:center;gap:12px;background:{LIME};color:{VE};font-weight:900;font-size:26px;letter-spacing:4px;
  text-transform:uppercase;padding:14px 28px;border-radius:999px}}
.tag i{{width:12px;height:12px;border-radius:50%;background:{VE}}}
h1{{font-family:'Fraunces',serif;font-weight:800;font-size:100px;line-height:.98;letter-spacing:-2px;color:#fff;margin-top:26px}}
h1 em{{font-style:italic;font-weight:600;color:{LIME_CL}}}
.area{{display:inline-block;margin-top:30px;background:#fff;color:{VE};font-weight:800;font-size:36px;padding:16px 32px;border-radius:20px;
  box-shadow:0 14px 30px rgba(0,0,0,.25)}}
.intro{{text-wrap:balance;font-size:32px;line-height:1.4;font-weight:600;color:{INK}}}
.intro b{{font-weight:900;color:{V}}}
.card{{background:#fff;border-radius:36px;padding:30px 44px 34px;box-shadow:0 18px 44px rgba(10,63,40,.12)}}
.rot{{font-family:'Quicksand',sans-serif;font-weight:700;font-size:26px;letter-spacing:4px;text-transform:uppercase;color:{V};
  display:flex;align-items:center;gap:14px}}
.rot::after{{content:"";flex:1;height:3px;border-radius:2px;background:{LIME_CL}}}
.req{{display:flex;gap:22px;align-items:flex-start;margin-top:18px;font-size:30px;line-height:1.35;font-weight:600}}
.req div:last-child{{text-wrap:pretty}}
.req .ck{{flex:none;width:48px;height:48px;border-radius:50%;background:{V};display:flex;align-items:center;justify-content:center;margin-top:-1px}}
.pref{{display:flex;gap:24px;align-items:center;background:{LIME_CL};border-radius:30px;padding:24px 36px}}
.pref .ic{{flex:none;width:84px;height:84px;border-radius:24px;background:{VE};display:flex;align-items:center;justify-content:center}}
.pref b{{display:block;font-family:'Quicksand',sans-serif;font-weight:700;font-size:24px;letter-spacing:4px;text-transform:uppercase;color:{VE}}}
.pref span{{display:block;font-size:30px;line-height:1.3;font-weight:700;color:{INK};margin-top:6px;text-wrap:balance}}
.cta{{background:{VE};border-radius:40px;padding:32px 44px;color:#fff}}
.cta .t{{font-weight:800;font-size:28px;letter-spacing:3px;text-transform:uppercase;color:{LIME_CL}}}
.ct{{display:flex;align-items:center;gap:20px;margin-top:16px;font-weight:800;font-size:34px;white-space:nowrap}}
.ct .ic{{flex:none;width:68px;height:68px;border-radius:20px;background:{LIME};display:flex;align-items:center;justify-content:center}}
.ct small{{display:block;font-weight:600;font-size:22px;letter-spacing:1px;color:rgba(255,255,255,.7);text-transform:uppercase}}
"""


def story():
    reqs = ["Estar regularmente matriculado no curso de Medicina Veterinária;",
            "Ser proativo, organizado e comprometido com o horário de trabalho;",
            "Saber trabalhar bem em equipe."]
    lista = "".join(f'<div class="req"><div class="ck">{CHECK}</div><div>{r}</div></div>' for r in reqs)
    return f"""<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>{CSS}</style></head><body><div class="s">
<div class="topo"></div>
<div class="a" style="right:-40px;top:330px;opacity:.06;transform:rotate(-18deg)">{PATA.format(s=420, c='#fff')}</div>
<div class="a" style="left:80px;top:112px"><img src="{LOGO}" style="width:360px;display:block" alt="Santuário Pet Center"></div>
<div class="a" style="left:80px;right:80px;top:266px">
  <span class="tag"><i></i>Estamos contratando</span>
  <h1>Oportunidade<br>de <em>estágio</em></h1>
  <span class="area">Medicina Veterinária</span>
</div>

<div class="a" style="left:64px;right:64px;top:712px;bottom:52px;display:flex;flex-direction:column;justify-content:space-between">
  <div class="intro" style="padding:0 16px">Vaga para estágio em Medicina Veterinária no <b>Hospital Veterinário Santuário Pet</b>.</div>
  <div class="card"><div class="rot">Requisitos</div>{lista}</div>
  <div class="pref">
    <div class="ic">{PATA.format(s=50, c=LIME)}</div>
    <div><b>Preferência</b><span>Experiência prévia no setor de internação de cães e gatos.</span></div>
  </div>
  <div class="cta">
    <div class="t">Envie seu currículo</div>
    <div class="ct"><div class="ic">{MAIL}</div><div><small>E-mail</small>marianabrino@yahoo.com.br</div></div>
    <div class="ct"><div class="ic">{ZAP}</div><div><small>WhatsApp</small>(51) 99377-2655</div></div>
    <div style="margin-top:24px;padding-top:20px;border-top:2px solid rgba(255,255,255,.14);font-family:Fraunces,serif;
      font-weight:600;font-size:36px;color:#fff">Venha fazer parte da nossa equipe!</div>
  </div>
</div>
</div></body></html>"""


def main():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        src = pathlib.Path(tmp) / "s.html"
        src.write_text(story(), encoding="utf-8")
        subprocess.run(["node", str(RENDER), f"{src}|{OUT}"], check=True, env={**os.environ, "H": "1920"})
    print(OUT)


if __name__ == "__main__":
    main()
