/* ==========================================================
   Zevix Cybersecurity · Portal de clients (funcions avançades)
   - Gràfics de risc (SVG, sense llibreries)
   - Pla de millora interactiu: estat de cada troballa i progrés
   - Re-auditoria: compara l'informe actual amb un de nou
   L'informe arriba des de portal-client.html amb l'esdeveniment
   "zevix:report" un cop s'ha carregat.
   ========================================================== */

(function () {
  const GRAVETATS = ["critical", "high", "medium", "low"];
  const NOMS = { critical: "Crítica", high: "Alta", medium: "Mitjana", low: "Baixa" };
  const COLORS = { critical: "#ef4444", high: "#f97316", medium: "#eab308", low: "#22c55e" };
  const ESTATS = { pendent: "Pendent", curs: "En curs", corregida: "Corregida" };
  let informe = null;

  const esc = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const clau = () => "zevix_pla_" + (informe.auditoria || "informe");
  const llegeix = (k, def) => { try { return JSON.parse(localStorage.getItem(k)) ?? def; } catch (e) { return def; } };
  const desa = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  // Una troballa és "la mateixa" en dos informes si coincideixen el host i el títol
  const idTroballa = (v) => `${v.host}|${v.titol}`;

  /* ---------------- 3. Gràfics ---------------- */
  function donut(comptes, total) {
    const r = 54, c = 2 * Math.PI * r;
    let offset = 0;
    const arcs = GRAVETATS.filter((g) => comptes[g]).map((g) => {
      const len = (comptes[g] / total) * c;
      const arc = `<circle r="${r}" cx="70" cy="70" fill="none" stroke="${COLORS[g]}" stroke-width="22"
        stroke-dasharray="${len} ${c - len}" stroke-dashoffset="${-offset}" transform="rotate(-90 70 70)"><title>${NOMS[g]}: ${comptes[g]}</title></circle>`;
      offset += len;
      return arc;
    }).join("");
    return `<svg viewBox="0 0 140 140" class="donut" role="img" aria-label="Troballes per gravetat">
      <circle r="${r}" cx="70" cy="70" fill="none" stroke="var(--surface-2)" stroke-width="22"/>${arcs}
      <text x="70" y="68" text-anchor="middle" class="donut-n">${total}</text>
      <text x="70" y="88" text-anchor="middle" class="donut-l">troballes</text></svg>`;
  }

  function barresHosts(vulns) {
    const perHost = {};
    vulns.forEach((v) => {
      perHost[v.host] = perHost[v.host] || { critical: 0, high: 0, medium: 0, low: 0, total: 0 };
      perHost[v.host][v.gravetat]++;
      perHost[v.host].total++;
    });
    const max = Math.max(...Object.values(perHost).map((h) => h.total), 1);
    return Object.entries(perHost).sort((a, b) => b[1].total - a[1].total).map(([host, h]) => `
      <div class="hbar"><span class="hbar-host mono">${esc(host)}</span>
        <span class="hbar-track">${GRAVETATS.filter((g) => h[g]).map((g) =>
          `<span style="width:${(h[g] / max) * 100}%;background:${COLORS[g]}" title="${NOMS[g]}: ${h[g]}"></span>`).join("")}</span>
        <span class="hbar-n mono">${h.total}</span></div>`).join("");
  }

  function pintaGrafics() {
    const comptes = { critical: 0, high: 0, medium: 0, low: 0 };
    informe.vulnerabilitats.forEach((v) => comptes[v.gravetat]++);
    const total = informe.vulnerabilitats.length;
    document.getElementById("chart-donut").innerHTML = total ? donut(comptes, total) : "<p>Cap troballa.</p>";
    document.getElementById("chart-legend").innerHTML = GRAVETATS.map((g) =>
      `<li><i style="background:${COLORS[g]}"></i>${NOMS[g]}<strong class="mono">${comptes[g]}</strong></li>`).join("");
    document.getElementById("chart-hosts").innerHTML = barresHosts(informe.vulnerabilitats);
  }

  /* ---------------- 1. Pla de millora interactiu ---------------- */
  function pintaPla() {
    const estats = llegeix(clau(), {});
    const ordenades = [...informe.vulnerabilitats].sort((a, b) => GRAVETATS.indexOf(a.gravetat) - GRAVETATS.indexOf(b.gravetat));
    document.getElementById("plan-list").innerHTML = ordenades.map((v) => {
      const estat = estats[idTroballa(v)] || "pendent";
      return `<li class="pla-item estat-${estat}">
        <div><span class="sev ${esc(v.gravetat)}">${NOMS[v.gravetat] || esc(v.gravetat)}</span>
          <strong class="mono"> ${esc(v.id)}</strong> · ${esc(v.titol)}<br><span class="pla-rec">${esc(v.recomanacio)}</span></div>
        <select data-id="${esc(idTroballa(v))}" aria-label="Estat de ${esc(v.id)}">
          ${Object.entries(ESTATS).map(([k, n]) => `<option value="${k}"${k === estat ? " selected" : ""}>${n}</option>`).join("")}
        </select></li>`;
    }).join("") || "<li>Cap troballa.</li>";
    document.querySelectorAll("#plan-list select").forEach((s) => s.addEventListener("change", () => {
      const e = llegeix(clau(), {});
      e[s.dataset.id] = s.value;
      desa(clau(), e);
      pintaPla();
    }));
    const total = informe.vulnerabilitats.length;
    const fetes = informe.vulnerabilitats.filter((v) => estats[idTroballa(v)] === "corregida").length;
    const curs = informe.vulnerabilitats.filter((v) => estats[idTroballa(v)] === "curs").length;
    const pct = total ? Math.round((fetes / total) * 100) : 0;
    document.getElementById("pla-bar").style.width = pct + "%";
    document.getElementById("pla-text").textContent = `${fetes} de ${total} corregides (${pct} %) · ${curs} en curs`;
  }

  /* ---------------- 2. Re-auditoria: abans i després ---------------- */
  function compara(nou) {
    const abans = new Map(informe.vulnerabilitats.map((v) => [idTroballa(v), v]));
    const despres = new Map(nou.vulnerabilitats.map((v) => [idTroballa(v), v]));
    const corregides = [...abans.values()].filter((v) => !despres.has(idTroballa(v)));
    const persistents = [...abans.values()].filter((v) => despres.has(idTroballa(v)));
    const noves = [...despres.values()].filter((v) => !abans.has(idTroballa(v)));

    // Les corregides es marquen automàticament al pla de millora
    const e = llegeix(clau(), {});
    corregides.forEach((v) => { e[idTroballa(v)] = "corregida"; });
    desa(clau(), e);
    pintaPla();

    const fila = (v, estat, cls) => `<tr><td class="mono">${esc(v.id)}</td><td class="mono">${esc(v.host)}</td>
      <td style="text-align:left">${esc(v.titol)}</td><td><span class="sev ${esc(v.gravetat)}">${NOMS[v.gravetat] || ""}</span></td>
      <td><span class="sev ${cls}">${estat}</span></td></tr>`;
    document.getElementById("cmp-result").innerHTML = `
      <div class="grid grid-3 cmp-stats">
        <div class="card stat"><div class="label">Corregides</div><div class="value low">${corregides.length}</div></div>
        <div class="card stat"><div class="label">Encara presents</div><div class="value medium">${persistents.length}</div></div>
        <div class="card stat"><div class="label">Noves</div><div class="value critical">${noves.length}</div></div>
      </div>
      <p class="caption">Comparat amb ${esc(nou.auditoria)} (${esc(nou.data)}). Les troballes corregides s'han marcat al pla de millora.</p>
      <div class="table-wrap"><table class="compare"><thead><tr><th>ID</th><th>Host</th><th>Troballa</th><th>Gravetat</th><th>Estat</th></tr></thead><tbody>
      ${corregides.map((v) => fila(v, "Corregida", "low")).join("")}
      ${persistents.map((v) => fila(v, "Persisteix", "medium")).join("")}
      ${noves.map((v) => fila(v, "Nova", "critical")).join("")}
      </tbody></table></div>`;
  }

  function preparaComparacio() {
    const form = document.getElementById("cmp-form");
    if (!form || form.dataset.ready) return;
    form.dataset.ready = "1";
    const msg = document.getElementById("cmp-msg");
    const carrega = (d) => {
      if (!d || !Array.isArray(d.vulnerabilitats)) {
        msg.className = "alert alert-err show";
        msg.textContent = "El fitxer no té el format d'informe de l'eina.";
        return;
      }
      msg.className = "alert";
      compara(d);
    };
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const f = document.getElementById("cmp-file").files[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = () => { let d = null; try { d = JSON.parse(r.result); } catch (err) {} carrega(d); };
      r.readAsText(f);
    });
    document.getElementById("cmp-demo").addEventListener("click", async () => {
      try { carrega(await (await fetch("informes_auditoria/exemple_reauditoria.json")).json()); }
      catch (err) { msg.className = "alert alert-err show"; msg.textContent = "No s'ha pogut carregar l'exemple."; }
    });
  }

  window.addEventListener("zevix:report", (e) => {
    informe = e.detail;
    pintaGrafics();
    pintaPla();
    preparaComparacio();
  });
})();
