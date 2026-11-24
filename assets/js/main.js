/* ==========================================================
   Zevix Cybersecurity · Lògica comuna de la Landing Page
   - Menú responsive
   - Animacions en fer scroll (IntersectionObserver)
   - Terminal animada del Hero
   - Validació del formulari de contacte i newsletter
   - Commutador mensual/anual de tarifes
   - Filtre i "llegir més" del blog
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  /* ---- Menú mòbil ---- */
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.querySelector(".nav-menu");
  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open);
    });
  }

  /* ---- Estat de sessió a la navbar ---- */
  if (window.ZevixAuth) {
    const user = ZevixAuth.currentUser();
    const actions = document.querySelector(".nav-actions");
    if (user && actions) {
      const dest = user.role === "admin" ? "portal-admin.html" : "portal-client.html";
      actions.innerHTML =
        `<a class="btn btn-ghost" href="${dest}">Hola, ${user.name.split(" ")[0]}</a>` +
        `<a class="btn btn-primary" href="${dest}">El meu portal</a>`;
    }
  }

  /* ---- Rellotge del document (capçalera i peu, estil log) ---- */
  const clocks = document.querySelectorAll(".js-now");
  if (clocks.length) {
    const pad = (n) => String(n).padStart(2, "0");
    const tick = () => {
      const d = new Date();
      const txt = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
      clocks.forEach((c) => { c.textContent = txt; });
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ---- Tema clar / fosc ---- */
  const tema = document.querySelector(".theme-toggle");
  if (tema) {
    tema.addEventListener("click", () => {
      const nou = document.documentElement.dataset.theme === "light" ? "dark" : "light";
      document.documentElement.dataset.theme = nou;
      try { localStorage.setItem("zevix_theme", nou); } catch (e) {}
    });
  }

  /* ---- Reveal on scroll ---- */
  const items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    items.forEach((el) => io.observe(el));
  } else {
    items.forEach((el) => el.classList.add("visible"));
  }

  /* ---- Botó tornar amunt ---- */
  const top = document.querySelector(".back-top");
  if (top) {
    window.addEventListener("scroll", () => top.classList.toggle("show", window.scrollY > 500));
    top.addEventListener("click", () => window.scrollTo({ top: 0 }));
  }

  /* ---- Comptadors animats ---- */
  document.querySelectorAll("[data-count]").forEach((el) => {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || "";
    let n = 0;
    const step = Math.max(1, Math.ceil(target / 40));
    const t = setInterval(() => {
      n = Math.min(target, n + step);
      el.textContent = n + suffix;
      if (n >= target) clearInterval(t);
    }, 30);
  });

  /* ---- Terminal animada ---- */
  const term = document.getElementById("terminal");
  if (term) {
    const lines = [
      ['<span class="t-cy">zevix@audit</span>:<span class="t-mu">~</span>$ docker run --rm --network host zevix/audit --target 192.168.56.0/24', 0],
      ['<span class="t-mu">[*] Mòdul OSINT (Shodan + theHarvester)...</span>', 500],
      ['<span class="t-ok">[+]</span> 4 hosts actius descoberts', 600],
      ['<span class="t-mu">[*] Escaneig de ports (Nmap -sV)...</span>', 600],
      ['<span class="t-ok">[+]</span> 192.168.56.10  22/ssh 21/ftp 80/http 53/dns', 500],
      ['<span class="t-ok">[+]</span> 192.168.56.11  139,445/smb 3306/mysql', 400],
      ['<span class="t-mu">[*] Auditoria SSH (ssh-audit)...</span>', 600],
      ['<span class="t-bad">[!] CRÍTIC</span>  PermitRootLogin yes', 400],
      ['<span class="t-warn">[!] ALT</span>     FTP anònim amb escriptura', 400],
      ['<span class="t-warn">[!] MITJÀ</span>   Transferència de zona DNS oberta', 400],
      ['<span class="t-ok">[✓]</span> Informe generat: informes/ebrelogistics.json', 700],
      ['<span class="t-ok">[✓]</span> Alerta enviada al bot de Telegram', 400],
    ];
    let html = "";
    let delay = 300;
    lines.forEach(([line, d]) => {
      delay += d;
      setTimeout(() => {
        html += line + "\n";
        term.innerHTML = html + '<span class="cursor"></span>';
      }, delay);
    });
  }

  /* ---- Tarifes: mensual / anual ---- */
  const sw = document.getElementById("billing-switch");
  if (sw) {
    sw.addEventListener("click", () => {
      const annual = sw.classList.toggle("on");
      sw.setAttribute("aria-checked", annual);
      document.querySelectorAll("[data-price]").forEach((el) => {
        const base = parseFloat(el.dataset.price);
        const value = annual ? Math.round(base * 0.85) : base;
        el.textContent = value.toLocaleString("ca-ES");
      });
      document.querySelectorAll("[data-period]").forEach((el) => {
        el.textContent = annual ? "/auditoria · contracte anual (-15%)" : "/auditoria puntual";
      });
    });
  }

  /* ---- Blog: filtre i llegir més ---- */
  document.querySelectorAll(".filters button").forEach((b) => {
    b.addEventListener("click", () => {
      document.querySelectorAll(".filters button").forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      const cat = b.dataset.filter;
      document.querySelectorAll(".post").forEach((p) => {
        p.style.display = cat === "all" || p.dataset.cat === cat ? "" : "none";
      });
    });
  });
  document.querySelectorAll(".post .more").forEach((b) => {
    b.addEventListener("click", () => {
      const full = b.previousElementSibling;
      const open = full.classList.toggle("open");
      b.textContent = open ? "Mostrar menys ↑" : "Llegir més →";
    });
  });

  /* ---- Calculadora de pressupost (tarifes.html) ---- */
  const calc = document.getElementById("calc");
  if (calc) {
    const $ = (id) => document.getElementById(id);
    const plans = {
      basic: { nom: "Bàsic", preu: 490, max: 5 },
      professional: { nom: "Professional", preu: 1290, max: 20 },
      avancat: { nom: "Avançat", preu: 2900, max: Infinity },
    };
    const recalcula = () => {
      const hosts = parseInt($("calc-hosts").value, 10);
      $("calc-hosts-val").textContent = hosts >= 60 ? "60+" : hosts;
      let pla = "basic";
      const motius = [];
      if (hosts > 5 || $("calc-osint").checked || $("calc-serveis").checked) pla = "professional";
      if (hosts > 20 || $("calc-ha").checked) pla = "avancat";
      if (hosts > 20) motius.push("més de 20 equips");
      else if (hosts > 5) motius.push("més de 5 equips");
      if ($("calc-ha").checked) motius.push("infraestructura crítica o redundant");
      if ($("calc-osint").checked) motius.push("reconeixement OSINT");
      if ($("calc-serveis").checked) motius.push("serveis web, DNS o carpetes compartides");
      const anual = $("calc-anual").checked;
      const preu = Math.round(plans[pla].preu * (anual ? 0.85 : 1));
      $("calc-plan").textContent = plans[pla].nom;
      $("calc-price").textContent = preu.toLocaleString("ca-ES");
      $("calc-why").textContent = (motius.length ? "Perquè necessites: " + motius.join(", ") + "." : "Suficient per a una primera revisió d'una xarxa petita.") +
        (anual ? " Preu per auditoria amb contracte anual." : " Preu per auditoria puntual.");
      $("calc-cta").href = "contacte.html?pla=" + pla;
    };
    calc.querySelectorAll("input").forEach((i) => i.addEventListener("input", recalcula));
    recalcula();
  }

  /* ---- Cercador del glossari (glossari.html) ---- */
  const cerca = document.getElementById("gl-search");
  if (cerca) {
    cerca.addEventListener("input", () => {
      const q = cerca.value.trim().toLowerCase();
      let visibles = 0;
      document.querySelectorAll(".gl-item").forEach((el) => {
        const ok = !q || el.textContent.toLowerCase().includes(q);
        el.style.display = ok ? "" : "none";
        if (ok) visibles++;
      });
      document.getElementById("gl-empty").style.display = visibles ? "none" : "block";
    });
  }

  /* ---- Formulari de contacte ---- */
  const contact = document.getElementById("contact-form");
  if (contact) {
    contact.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!validateForm(contact)) return;
      const ok = document.getElementById("contact-ok");
      ok.classList.add("show");
      contact.reset();
      setTimeout(() => ok.classList.remove("show"), 6000);
    });
    // Preselecciona el pla si ve de la pàgina de tarifes (?pla=...)
    const pla = new URLSearchParams(location.search).get("pla");
    const sel = contact.querySelector("#servei");
    if (pla && sel) sel.value = pla;
  }

  /* ---- Newsletter ---- */
  document.querySelectorAll(".newsletter").forEach((f) => {
    f.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = f.querySelector("input");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) { input.focus(); return; }
      input.value = "";
      input.placeholder = "Subscripció feta ✓";
    });
  });
});

/* Validació genèrica: camps amb [required], tipus email i minlength */
function validateForm(form) {
  let valid = true;
  form.querySelectorAll(".field").forEach((f) => {
    const input = f.querySelector("input, textarea, select");
    if (!input) return;
    let ok = true;
    if (input.required && !input.value.trim()) ok = false;
    if (ok && input.type === "email" && input.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) ok = false;
    if (ok && input.minLength > 0 && input.value.length < input.minLength) ok = false;
    f.classList.toggle("invalid", !ok);
    if (!ok) valid = false;
  });
  form.querySelectorAll('input[type="checkbox"][required]').forEach((c) => {
    if (!c.checked) { valid = false; c.closest(".check").style.color = "var(--danger)"; }
    else c.closest(".check").style.color = "";
  });
  return valid;
}
