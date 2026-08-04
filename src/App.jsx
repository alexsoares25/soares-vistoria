import React, { useState, useEffect, useCallback, useRef } from "react";

/* ============================================================
   SISTEMA DE VISTORIA VEICULAR — LAUDO CAUTELAR
   Backend: Supabase (projeto VISTORIA)
   Modos (por hash na URL):
     #/            -> Painel (voce): lista + criar + gerar link
     #/v/<token>   -> Formulario do vistoriador (mobile)
     #/laudo/<id>  -> Laudo pronto (visualizar / imprimir PDF)
   ============================================================ */

const SUPABASE_URL = "https://oiwcnyolidryuixuabzs.supabase.co";
const SUPABASE_KEY = "sb_publishable_mDhb1o9lTurpOSAto2Jv-g_tmbbFWwz";
const BUCKET = "vistoria-fotos";

/* ---------- cliente REST minimalista do Supabase ---------- */
const api = {
  headers(extra = {}) {
    return {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      ...extra,
    };
  },
  async select(table, query = "") {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
      headers: this.headers(),
    });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },
  async insert(table, rows) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST",
      headers: this.headers({ Prefer: "return=representation" }),
      body: JSON.stringify(rows),
    });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },
  async update(table, query, patch) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
      method: "PATCH",
      headers: this.headers({ Prefer: "return=representation" }),
      body: JSON.stringify(patch),
    });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },
  async uploadFoto(file, path) {
    const r = await fetch(
      `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`,
      {
        method: "POST",
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
        body: file,
      }
    );
    if (!r.ok) throw new Error(await r.text());
    return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
  },
};

/* ---------- checklist padrao (modelo laudo cautelar) ---------- */
const SECOES = {
  ESTRUTURA: {
    tipo: "estado",
    itens: [
      "Longarina dianteira esquerda", "Longarina dianteira direita", "Painel",
      "Painel corta fogo", "Paralama interno esquerdo", "Paralama interno direito",
      "Torre amortecedor diant. esquerdo", "Torre amortecedor diant. direito",
      "Coluna dianteira direita", "Coluna central direita", "Coluna traseira direita",
      "Caixa de ar lado direito", "Coluna dianteira esquerda", "Coluna central esquerda",
      "Coluna traseira esquerda", "Caixa de ar lado esquerdo",
      "Longarina traseira esquerda", "Longarina traseira direita",
      "Painel traseiro", "Caixa estepe",
    ],
  },
  PINTURA: {
    tipo: "estado",
    itens: [
      "Capô", "Teto", "Tampa do porta-malas", "Paralama dianteiro esquerdo",
      "Porta dianteira esquerda", "Porta traseira esquerda", "Lateral traseira esquerda",
      "Lateral traseira direita", "Porta traseira direita", "Porta dianteira direita",
      "Paralama dianteiro direito", "Para-choque dianteiro", "Para-choque traseiro",
    ],
  },
  VIDROS: {
    tipo: "original",
    itens: [
      "Para-brisa", "Porta dianteira esquerda", "Porta traseira esquerda",
      "Porta dianteira direita", "Porta traseira direita", "Lateral traseira direita",
      "Lateral traseira esquerda", "Vidro traseiro",
    ],
  },
  IDENTIFICACAO: {
    tipo: "estado",
    itens: [
      "Número do motor", "Número do chassi", "Plaqueta chassi",
      "Plaqueta carroceria", "Plaqueta chassi traseira",
    ],
  },
  ETIQUETAS: {
    tipo: "original",
    itens: ["Etiqueta compartimento do motor", "Etiqueta coluna lado direito"],
  },
};

const OPCOES = {
  estado: ["OK", "NAO APLICAVEL", "NAO CONFORME"],
  original: ["ORIGINAL", "NAO APLICAVEL", "REMARCADO"],
};

const FOTOS_SUGERIDAS = [
  "Frente 45º lado direito", "Frente 45º lado esquerdo",
  "Traseira 45º lado direito", "Traseira 45º lado esquerdo",
  "Compartimento do motor", "Painel de instrumento", "Hodômetro",
  "Chassi", "Motor (numeração)", "Placa traseira",
];

/* =====================  UI base  ===================== */
const C = {
  bg: "#0f1720", panel: "#161f2b", line: "#26313f", ink: "#e8edf3",
  sub: "#8ea0b5", brand: "#2dd4bf", ok: "#22c55e", warn: "#f59e0b",
  bad: "#ef4444", chip: "#1e2836",
};

function Badge({ result }) {
  const map = {
    OK: C.ok, ORIGINAL: C.ok, "NAO APLICAVEL": C.sub,
    "NAO CONFORME": C.bad, REMARCADO: C.bad,
  };
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, letterSpacing: .3, padding: "3px 8px",
      borderRadius: 6, color: "#04110c",
      background: map[result] || C.sub, whiteSpace: "nowrap",
    }}>{result}</span>
  );
}

function Field({ label, ...p }) {
  return (
    <label style={{ display: "block", marginBottom: 12 }}>
      <span style={{ display: "block", fontSize: 12, color: C.sub, marginBottom: 5, letterSpacing: .3 }}>{label}</span>
      <input {...p} style={{
        width: "100%", padding: "10px 12px", borderRadius: 9, border: `1px solid ${C.line}`,
        background: C.bg, color: C.ink, fontSize: 15, outline: "none", boxSizing: "border-box",
      }} />
    </label>
  );
}

/* =====================  PAINEL  ===================== */
function Painel() {
  const [vistorias, setVistorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [novo, setNovo] = useState(false);
  const [form, setForm] = useState({ placa: "", modelo: "", cliente: "", vistoriador: "" });
  const [criando, setCriando] = useState(false);
  const [linkGerado, setLinkGerado] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await api.select("vistorias", "select=*&order=criado_em.desc");
      setVistorias(d);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function criar() {
    setCriando(true);
    try {
      const resp = await api.insert("vistorias", [{
        placa: (form.placa || "").toUpperCase(), modelo: form.modelo,
        cliente: form.cliente, vistoriador: form.vistoriador,
        solicitante: "Alex Soares", status: "pendente",
      }]);
      const v = Array.isArray(resp) ? resp[0] : resp;
      if (!v || !v.token) throw new Error("Resposta sem token do servidor.");
      const link = `${location.origin}${location.pathname}#/v/${encodeURIComponent(v.token)}`;
      setLinkGerado({ link, placa: v.placa });
      setForm({ placa: "", modelo: "", cliente: "", vistoriador: "" });
      setNovo(false);
      window.scrollTo(0, 0);
      load();
    } catch (e) {
      console.error(e);
      alert("Não consegui criar a vistoria.\n\nDetalhe: " + (e.message || e));
    }
    setCriando(false);
  }

  const statusColor = { pendente: C.warn, em_andamento: C.brand, concluida: C.ok };

  return (
    <div style={{ maxWidth: 880, margin: "0 auto", padding: "24px 16px 80px" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 13, letterSpacing: 2, color: C.brand, fontWeight: 700 }}>SOARES · VISTORIAS</div>
          <h1 style={{ margin: "4px 0 0", fontSize: 26, letterSpacing: -.5 }}>Laudo Cautelar</h1>
        </div>
        <button onClick={() => setNovo(true)} style={btnPrimary}>+ Nova vistoria</button>
      </header>

      {linkGerado && (
        <div style={{ ...card, borderColor: C.brand, marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: C.brand, fontWeight: 700, marginBottom: 8 }}>
            Link gerado — placa {linkGerado.placa || "—"}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input readOnly value={linkGerado.link} style={{
              flex: 1, minWidth: 200, padding: "10px 12px", borderRadius: 9,
              border: `1px solid ${C.line}`, background: C.bg, color: C.ink, fontSize: 13,
            }} />
            <button style={btnGhost} onClick={() => { navigator.clipboard?.writeText(linkGerado.link); }}>Copiar</button>
            <a style={{ ...btnGhost, textDecoration: "none", display: "inline-flex", alignItems: "center" }}
               href={`https://wa.me/?text=${encodeURIComponent("Vistoria do veículo: " + linkGerado.link)}`}
               target="_blank" rel="noreferrer">WhatsApp</a>
            <button style={btnGhost} onClick={() => setLinkGerado(null)}>Fechar</button>
          </div>
          <div style={{ fontSize: 12, color: C.sub, marginTop: 8 }}>
            Envie este link ao vistoriador. Ele preenche pelo celular e o laudo aparece aqui.
          </div>
        </div>
      )}

      {novo && (
        <div style={{ ...card, marginBottom: 20 }}>
          <div style={{ fontWeight: 700, marginBottom: 14 }}>Nova vistoria</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Placa" value={form.placa} onChange={e => setForm({ ...form, placa: e.target.value })} placeholder="ABC1D23" />
            <Field label="Modelo" value={form.modelo} onChange={e => setForm({ ...form, modelo: e.target.value })} placeholder="Citroën C4 Cactus" />
            <Field label="Cliente" value={form.cliente} onChange={e => setForm({ ...form, cliente: e.target.value })} placeholder="Nome do cliente" />
            <Field label="Vistoriador" value={form.vistoriador} onChange={e => setForm({ ...form, vistoriador: e.target.value })} placeholder="Quem vai vistoriar" />
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <button style={btnPrimary} disabled={criando} onClick={criar}>{criando ? "Criando…" : "Criar e gerar link"}</button>
            <button style={btnGhost} onClick={() => setNovo(false)}>Cancelar</button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ color: C.sub, textAlign: "center", padding: 40 }}>Carregando…</div>
      ) : vistorias.length === 0 ? (
        <div style={{ ...card, textAlign: "center", color: C.sub, padding: 40 }}>
          Nenhuma vistoria ainda. Crie a primeira e gere um link.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {vistorias.map(v => (
            <div key={v.id} style={{ ...card, display: "flex", alignItems: "center", gap: 14, padding: "14px 16px" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 17, fontWeight: 700 }}>{v.placa || "sem placa"} <span style={{ color: C.sub, fontWeight: 400, fontSize: 14 }}>· {v.modelo || "—"}</span></div>
                <div style={{ fontSize: 12, color: C.sub, marginTop: 3 }}>
                  {v.cliente || "—"} · {new Date(v.criado_em).toLocaleDateString("pt-BR")}
                </div>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "4px 9px", borderRadius: 20,
                color: "#04110c", background: statusColor[v.status] || C.sub,
              }}>{v.status.replace("_", " ")}</span>
              {v.status === "concluida" ? (
                <a href={`#/laudo/${v.id}`} style={{ ...btnGhost, textDecoration: "none" }}>Ver laudo</a>
              ) : (
                <button style={btnGhost} onClick={() => {
                  const link = `${location.origin}${location.pathname}#/v/${encodeURIComponent(v.token)}`;
                  setLinkGerado({ link, placa: v.placa });
                  window.scrollTo(0, 0);
                }}>Link</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* =====================  FORMULARIO VISTORIADOR  ===================== */
function Formulario({ token }) {
  const [vist, setVist] = useState(null);
  const [erro, setErro] = useState(null);
  const [passo, setPasso] = useState(0); // 0 dados, 1..N secoes, N+1 fotos, N+2 enviar
  const [dados, setDados] = useState({});
  const [itens, setItens] = useState({});
  const [fotos, setFotos] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    (async () => {
      try {
        const d = await api.select("vistorias", `token=eq.${encodeURIComponent(token)}&select=*`);
        if (!d.length) { setErro("Vistoria não encontrada. Verifique o link."); return; }
        if (d[0].status === "concluida") { setErro("Esta vistoria já foi concluída."); return; }
        setVist(d[0]);
        setDados({
          placa: d[0].placa || "", chassi: d[0].chassi || "", renavam: d[0].renavam || "",
          fabricante: d[0].fabricante || "", modelo: d[0].modelo || "", cor: d[0].cor || "",
          ano_fab: d[0].ano_fab || "", ano_mod: d[0].ano_mod || "", combustivel: d[0].combustivel || "",
          km: d[0].km || "", motor: d[0].motor || "", uf: d[0].uf || "",
          vistoriador: d[0].vistoriador || "", observacoes: "",
        });
        const init = {};
        Object.entries(SECOES).forEach(([sec, cfg]) => {
          cfg.itens.forEach(it => {
            init[`${sec}||${it}`] = cfg.tipo === "original" ? "ORIGINAL" : "OK";
          });
        });
        setItens(init);
      } catch (e) { setErro("Erro ao carregar: " + e.message); }
    })();
  }, [token]);

  const secKeys = Object.keys(SECOES);
  const totalPassos = 1 + secKeys.length + 1; // dados + secoes + fotos

  async function addFotos(files) {
    for (const f of files) {
      const id = Math.random().toString(36).slice(2);
      setFotos(prev => [...prev, { id, file: f, legenda: "", preview: URL.createObjectURL(f) }]);
    }
  }

  async function enviar() {
    setEnviando(true);
    try {
      // 1. upload das fotos
      const fotoRows = [];
      let i = 0;
      for (const f of fotos) {
        const ext = (f.file.name.split(".").pop() || "jpg").toLowerCase();
        const path = `${vist.id}/${Date.now()}_${i}.${ext}`;
        const url = await api.uploadFoto(f.file, path);
        fotoRows.push({ vistoria_id: vist.id, legenda: f.legenda || `Foto ${i + 1}`, url, ordem: i });
        i++;
      }
      if (fotoRows.length) await api.insert("vistoria_fotos", fotoRows);

      // 2. itens
      const itemRows = [];
      let ord = 0;
      Object.entries(itens).forEach(([k, v]) => {
        const [secao, item] = k.split("||");
        itemRows.push({ vistoria_id: vist.id, secao, item, resultado: v, ordem: ord++ });
      });
      await api.insert("vistoria_itens", itemRows);

      // 3. parecer automatico
      const temNaoConforme = Object.values(itens).some(v => v === "NAO CONFORME" || v === "REMARCADO");
      await api.update("vistorias", `id=eq.${vist.id}`, {
        ...dados, placa: (dados.placa || "").toUpperCase(),
        status: "concluida", parecer: temNaoConforme ? "NAO CONFORME" : "CONFORME",
        concluido_em: new Date().toISOString(),
      });
      setEnviado(true);
    } catch (e) { alert("Erro ao enviar: " + e.message); }
    setEnviando(false);
  }

  if (erro) return <TelaMsg titulo="Ops" texto={erro} />;
  if (!vist) return <TelaMsg titulo="Carregando…" texto="Buscando dados da vistoria." />;
  if (enviado) return <TelaMsg titulo="Vistoria enviada ✓" texto="Laudo gerado com sucesso. Pode fechar esta página." cor={C.ok} />;

  const pct = Math.round((passo / totalPassos) * 100);

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "16px 14px 100px" }}>
      <div style={{ fontSize: 12, letterSpacing: 2, color: C.brand, fontWeight: 700 }}>VISTORIA VEICULAR</div>
      <div style={{ height: 6, background: C.chip, borderRadius: 20, margin: "10px 0 18px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: C.brand, transition: "width .3s" }} />
      </div>

      {passo === 0 && (
        <div style={card}>
          <h2 style={h2}>Dados do veículo</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field label="Placa" value={dados.placa} onChange={e => setDados({ ...dados, placa: e.target.value })} />
            <Field label="Cor" value={dados.cor} onChange={e => setDados({ ...dados, cor: e.target.value })} />
            <Field label="Fabricante" value={dados.fabricante} onChange={e => setDados({ ...dados, fabricante: e.target.value })} />
            <Field label="Modelo" value={dados.modelo} onChange={e => setDados({ ...dados, modelo: e.target.value })} />
            <Field label="Ano fab." value={dados.ano_fab} onChange={e => setDados({ ...dados, ano_fab: e.target.value })} />
            <Field label="Ano mod." value={dados.ano_mod} onChange={e => setDados({ ...dados, ano_mod: e.target.value })} />
            <Field label="Combustível" value={dados.combustivel} onChange={e => setDados({ ...dados, combustivel: e.target.value })} />
            <Field label="KM" value={dados.km} onChange={e => setDados({ ...dados, km: e.target.value })} />
            <Field label="UF" value={dados.uf} onChange={e => setDados({ ...dados, uf: e.target.value })} />
            <Field label="Motor (nº)" value={dados.motor} onChange={e => setDados({ ...dados, motor: e.target.value })} />
          </div>
          <Field label="Chassi" value={dados.chassi} onChange={e => setDados({ ...dados, chassi: e.target.value })} />
          <Field label="Renavam" value={dados.renavam} onChange={e => setDados({ ...dados, renavam: e.target.value })} />
        </div>
      )}

      {passo >= 1 && passo <= secKeys.length && (() => {
        const sec = secKeys[passo - 1];
        const cfg = SECOES[sec];
        const ops = OPCOES[cfg.tipo];
        return (
          <div style={card}>
            <h2 style={h2}>{sec}</h2>
            <div style={{ fontSize: 12, color: C.sub, marginBottom: 14 }}>Toque para marcar cada item.</div>
            {cfg.itens.map(it => {
              const k = `${sec}||${it}`;
              return (
                <div key={k} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: `1px solid ${C.line}` }}>
                  <div style={{ fontSize: 14, marginBottom: 7 }}>{it}</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {ops.map(op => {
                      const active = itens[k] === op;
                      const col = op.startsWith("NAO CONF") || op === "REMARCADO" ? C.bad
                        : op === "NAO APLICAVEL" ? C.sub : C.ok;
                      return (
                        <button key={op} onClick={() => setItens({ ...itens, [k]: op })}
                          style={{
                            flex: 1, padding: "8px 4px", borderRadius: 8, fontSize: 11.5, fontWeight: 700,
                            cursor: "pointer", border: `1.5px solid ${active ? col : C.line}`,
                            background: active ? col : "transparent",
                            color: active ? "#04110c" : C.sub,
                          }}>{op}</button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}

      {passo === secKeys.length + 1 && (
        <div style={card}>
          <h2 style={h2}>Fotos</h2>
          <div style={{ fontSize: 12, color: C.sub, marginBottom: 12 }}>
            Tire ou selecione as fotos do veículo. Sugestões: {FOTOS_SUGERIDAS.slice(0, 6).join(", ")}…
          </div>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" multiple
            style={{ display: "none" }} onChange={e => { addFotos([...e.target.files]); e.target.value = ""; }} />
          <button style={{ ...btnPrimary, width: "100%", marginBottom: 14 }} onClick={() => fileRef.current?.click()}>
            📷 Adicionar fotos
          </button>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {fotos.map((f, idx) => (
              <div key={f.id} style={{ background: C.bg, borderRadius: 10, overflow: "hidden", border: `1px solid ${C.line}` }}>
                <img src={f.preview} alt="" style={{ width: "100%", height: 110, objectFit: "cover", display: "block" }} />
                <div style={{ padding: 7 }}>
                  <input list="fotolist" placeholder="Legenda" value={f.legenda}
                    onChange={e => setFotos(fotos.map(x => x.id === f.id ? { ...x, legenda: e.target.value } : x))}
                    style={{ width: "100%", padding: "6px 8px", borderRadius: 6, border: `1px solid ${C.line}`, background: C.panel, color: C.ink, fontSize: 12, boxSizing: "border-box" }} />
                  <button onClick={() => setFotos(fotos.filter(x => x.id !== f.id))}
                    style={{ marginTop: 6, width: "100%", padding: "5px", borderRadius: 6, border: "none", background: "#3a1d24", color: C.bad, fontSize: 11, cursor: "pointer" }}>Remover</button>
                </div>
              </div>
            ))}
          </div>
          <datalist id="fotolist">{FOTOS_SUGERIDAS.map(f => <option key={f} value={f} />)}</datalist>

          <div style={{ marginTop: 16 }}>
            <label style={{ display: "block", fontSize: 12, color: C.sub, marginBottom: 5 }}>Observações</label>
            <textarea value={dados.observacoes} onChange={e => setDados({ ...dados, observacoes: e.target.value })}
              rows={4} style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: `1px solid ${C.line}`, background: C.bg, color: C.ink, fontSize: 14, boxSizing: "border-box", resize: "vertical" }} />
          </div>
        </div>
      )}

      {/* navegacao */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, padding: "12px 14px",
        background: C.panel, borderTop: `1px solid ${C.line}`, display: "flex", gap: 8,
        maxWidth: 560, margin: "0 auto",
      }}>
        {passo > 0 && <button style={btnGhost} onClick={() => setPasso(passo - 1)}>Voltar</button>}
        {passo < totalPassos - 1 ? (
          <button style={{ ...btnPrimary, flex: 1 }} onClick={() => setPasso(passo + 1)}>Continuar</button>
        ) : (
          <button style={{ ...btnPrimary, flex: 1, background: C.ok }} disabled={enviando} onClick={enviar}>
            {enviando ? "Enviando…" : "Finalizar e enviar laudo"}
          </button>
        )}
      </div>
    </div>
  );
}

/* =====================  LAUDO  ===================== */
function Laudo({ id }) {
  const [v, setV] = useState(null);
  const [itens, setItens] = useState([]);
  const [fotos, setFotos] = useState([]);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [vd] = await api.select("vistorias", `id=eq.${id}&select=*`);
        if (!vd) { setErro("Laudo não encontrado."); return; }
        setV(vd);
        setItens(await api.select("vistoria_itens", `vistoria_id=eq.${id}&select=*&order=ordem.asc`));
        setFotos(await api.select("vistoria_fotos", `vistoria_id=eq.${id}&select=*&order=ordem.asc`));
      } catch (e) { setErro("Erro: " + e.message); }
    })();
  }, [id]);

  if (erro) return <TelaMsg titulo="Ops" texto={erro} />;
  if (!v) return <TelaMsg titulo="Carregando laudo…" texto="" />;

  const bySecao = {};
  itens.forEach(it => { (bySecao[it.secao] ||= []).push(it); });
  const conforme = v.parecer === "CONFORME";

  const dado = (label, val) => (
    <div><div style={{ fontSize: 10, color: "#888", letterSpacing: .5 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 600 }}>{val || "—"}</div></div>
  );

  return (
    <div style={{ background: "#f3f5f8", minHeight: "100vh", padding: "20px 0" }}>
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "0 14px" }}>
        <div className="noprint" style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <a href="#/" style={{ ...btnGhost, textDecoration: "none", color: "#333", borderColor: "#ccc" }}>← Painel</a>
          <button style={{ ...btnPrimary, background: "#111" }} onClick={() => window.print()}>Imprimir / Salvar PDF</button>
        </div>

        <div id="laudo" style={{ background: "#fff", color: "#1a1a1a", borderRadius: 4, overflow: "hidden", boxShadow: "0 2px 20px rgba(0,0,0,.08)" }}>
          {/* cabecalho */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "22px 26px", borderBottom: "3px solid #111" }}>
            <div>
              <div style={{ fontSize: 12, letterSpacing: 2, color: "#0d9488", fontWeight: 800 }}>SOARES SERVIÇOS</div>
              <h1 style={{ margin: "2px 0 0", fontSize: 26, letterSpacing: -.5 }}>Laudo Cautelar</h1>
              <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                Data: {new Date(v.concluido_em || v.criado_em).toLocaleString("pt-BR")} · Vistoriador: {v.vistoriador || "—"}
              </div>
            </div>
            <div style={{
              padding: "8px 18px", borderRadius: 6, fontWeight: 800, fontSize: 15, color: "#fff",
              background: conforme ? "#16a34a" : "#dc2626",
            }}>{v.parecer}</div>
          </div>

          {/* dados veiculo */}
          <div style={{ padding: "18px 26px", background: "#fafbfc" }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, color: "#111", marginBottom: 12 }}>DADOS DO VEÍCULO</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "14px 18px" }}>
              {dado("PLACA", v.placa)} {dado("MARCA/MODELO", `${v.fabricante || ""} ${v.modelo || ""}`.trim())}
              {dado("COR", v.cor)} {dado("ANO FAB/MOD", `${v.ano_fab || "—"}/${v.ano_mod || "—"}`)}
              {dado("COMBUSTÍVEL", v.combustivel)} {dado("KM", v.km)}
              {dado("UF", v.uf)} {dado("CHASSI", v.chassi)}
              {dado("RENAVAM", v.renavam)} {dado("MOTOR", v.motor)} {dado("CLIENTE", v.cliente)}
            </div>
          </div>

          {/* secoes */}
          {Object.entries(bySecao).map(([sec, list]) => (
            <div key={sec} style={{ padding: "16px 26px", borderTop: "1px solid #eee" }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, color: "#111", marginBottom: 10 }}>{sec}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px 20px" }}>
                {list.map(it => (
                  <div key={it.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, borderBottom: "1px solid #f2f2f2", paddingBottom: 4 }}>
                    <span style={{ color: "#444" }}>{it.item}</span>
                    <span style={{
                      fontSize: 10.5, fontWeight: 800, padding: "2px 7px", borderRadius: 4, color: "#fff",
                      background: (it.resultado === "OK" || it.resultado === "ORIGINAL") ? "#16a34a"
                        : it.resultado === "NAO APLICAVEL" ? "#94a3b8" : "#dc2626",
                    }}>{it.resultado}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* observacoes */}
          {v.observacoes && (
            <div style={{ padding: "16px 26px", borderTop: "1px solid #eee" }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, marginBottom: 8 }}>OBSERVAÇÕES</div>
              <div style={{ fontSize: 13, color: "#444", whiteSpace: "pre-wrap" }}>{v.observacoes}</div>
            </div>
          )}

          {/* fotos */}
          {fotos.length > 0 && (
            <div style={{ padding: "16px 26px", borderTop: "1px solid #eee" }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, marginBottom: 12 }}>REGISTRO FOTOGRÁFICO</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                {fotos.map(f => (
                  <div key={f.id}>
                    <img src={f.url} alt={f.legenda} style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 6, border: "1px solid #eee" }} />
                    <div style={{ fontSize: 10.5, color: "#666", textAlign: "center", marginTop: 4 }}>{f.legenda}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ padding: "14px 26px", background: "#111", color: "#9aa5b1", fontSize: 10.5, lineHeight: 1.5 }}>
            Laudo emitido por Soares Serviços. As informações refletem a condição do veículo no momento da vistoria.
            Não substitui perícia oficial. Válido apenas para a data de realização.
          </div>
        </div>
      </div>
      <style>{`@media print { .noprint{display:none!important} body{background:#fff} #laudo{box-shadow:none} }`}</style>
    </div>
  );
}

/* =====================  helpers  ===================== */
function TelaMsg({ titulo, texto, cor }) {
  return (
    <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 24 }}>
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, color: cor || C.ink }}>{titulo}</div>
        <div style={{ color: C.sub, marginTop: 8, maxWidth: 340 }}>{texto}</div>
      </div>
    </div>
  );
}

const card = { background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, padding: 18 };
const h2 = { margin: "0 0 14px", fontSize: 19 };
const btnPrimary = { padding: "10px 16px", borderRadius: 10, border: "none", background: C.brand, color: "#04110c", fontWeight: 700, fontSize: 14, cursor: "pointer" };
const btnGhost = { padding: "10px 14px", borderRadius: 10, border: `1px solid ${C.line}`, background: "transparent", color: C.ink, fontWeight: 600, fontSize: 14, cursor: "pointer" };

/* =====================  ROTEADOR  ===================== */
export default function App() {
  const [hash, setHash] = useState(window.location.hash || "#/");
  useEffect(() => {
    const on = () => setHash(window.location.hash || "#/");
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);

  let view;
  const mV = hash.match(/^#\/v\/(.+)$/);
  const mL = hash.match(/^#\/laudo\/(.+)$/);
  if (mV) view = <Formulario token={decodeURIComponent(mV[1])} />;
  else if (mL) view = <Laudo id={mL[1]} />;
  else view = <Painel />;

  const isLaudo = !!mL;
  return (
    <div style={{
      minHeight: "100vh",
      background: isLaudo ? "#f3f5f8" : C.bg,
      color: C.ink,
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    }}>
      {view}
    </div>
  );
}
