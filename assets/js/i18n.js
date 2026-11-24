/* ==========================================================
   Zevix Cybersecurity · Traducció de la web (CA · ES · EN)

   La web està escrita en català. Quan l'usuari tria un altre idioma,
   aquest script recorre els textos visibles de la pàgina i substitueix
   els que apareixen al diccionari. L'idioma es desa a localStorage.

   Estan traduïts: menú, peu, capçaleres de pàgina, portada, tarifes
   (plans i calculadora), contacte i inici de sessió. La resta del
   contingut queda en català.
   ========================================================== */
(function () {
  // "text en català": ["castellà", "anglès"]
  const T = {
    // Navegació i peu
    "Inici": ["Inicio", "Home"], "Serveis": ["Servicios", "Services"], "Equip": ["Equipo", "Team"],
    "Sobre nosaltres": ["Sobre nosotros", "About us"], "Tarifes": ["Tarifas", "Pricing"],
    "Notícies": ["Noticias", "News"], "Contacte": ["Contacto", "Contact"], "Accedir": ["Acceder", "Log in"],
    "Registrar-se": ["Registrarse", "Sign up"], "Classificació: públic": ["Clasificación: público", "Classification: public"],
    "Empreses que confien en Zevix": ["Empresas que confían en Zevix", "Companies that trust Zevix"],
    "Auditories de ciberseguretat i pentesting ètic per a pimes de les Terres de l'Ebre. Detectem les vulnerabilitats abans que ho faci un atacant.":
      ["Auditorías de ciberseguridad y pentesting ético para pymes de las Terres de l'Ebre. Detectamos las vulnerabilidades antes que un atacante.",
       "Cybersecurity audits and ethical pentesting for small businesses in the Terres de l'Ebre. We find vulnerabilities before an attacker does."],
    "Empresa": ["Empresa", "Company"], "Cas d'èxit": ["Caso de éxito", "Case study"], "Glossari i FAQ": ["Glosario y FAQ", "Glossary and FAQ"],
    "Reconeixement OSINT": ["Reconocimiento OSINT", "OSINT reconnaissance"], "Auditoria de xarxa": ["Auditoría de red", "Network audit"],
    "Hardening SSH": ["Hardening SSH", "SSH hardening"], "Pla de millora": ["Plan de mejora", "Remediation plan"],
    "Butlletí de seguretat": ["Boletín de seguridad", "Security bulletin"],
    "Rep alertes de vulnerabilitats i consells un cop al mes.": ["Recibe alertas de vulnerabilidades y consejos una vez al mes.", "Get vulnerability alerts and tips once a month."],
    "Subscriure": ["Suscribirse", "Subscribe"],

    // Portada
    "Informe d'auditoria de seguretat · Model de servei": ["Informe de auditoría de seguridad · Modelo de servicio", "Security audit report · Service model"],
    "Trobem les vulnerabilitats de la teva empresa abans que ho faci un atacant.": ["Encontramos las vulnerabilidades de tu empresa antes que un atacante.", "We find your company's vulnerabilities before an attacker does."],
    "Client": ["Cliente", "Client"], "la teva empresa": ["tu empresa", "your company"], "Abast": ["Alcance", "Scope"],
    "Xarxa local, servidors i serveis exposats a Internet": ["Red local, servidores y servicios expuestos a Internet", "Local network, servers and Internet-facing services"],
    "Mètode": ["Método", "Method"], "OSINT → escaneig → anàlisi → pla de millora": ["OSINT → escaneo → análisis → plan de mejora", "OSINT → scanning → analysis → remediation plan"],
    "Eina": ["Herramienta", "Tool"], "Pròpia, en Python (tkinter): theHarvester, Shodan, Nmap, Nikto i DNS": ["Propia, en Python (tkinter): theHarvester, Shodan, Nmap, Nikto y DNS", "In-house, in Python (tkinter): theHarvester, Shodan, Nmap, Nikto and DNS"],
    "Sol·licitar auditoria": ["Solicitar auditoría", "Request an audit"], "Veure serveis": ["Ver servicios", "See services"],
    "Exterior": ["Exterior", "External"], "Comencem des de fora: què sap Internet de la teva empresa?": ["Empezamos desde fuera: ¿qué sabe Internet de tu empresa?", "We start from the outside: what does the Internet know about your company?"],
    "Eines": ["Herramientas", "Tools"], "Objectiu": ["Objetivo", "Goal"],
    "Serveis exposats, subdominis i correus públics": ["Servicios expuestos, subdominios y correos públicos", "Exposed services, subdomains and public emails"],
    "Xarxa interna": ["Red interna", "Internal network"], "Descobriment i escaneig": ["Descubrimiento y escaneo", "Discovery and scanning"],
    "Entrem a la xarxa local i inventariem cada equip i servei actiu.": ["Entramos en la red local e inventariamos cada equipo y servicio activo.", "We enter the local network and list every active host and service."],
    "Hosts, ports oberts i versions": ["Hosts, puertos abiertos y versiones", "Hosts, open ports and versions"],
    "Troballes crítiques": ["Hallazgos críticos", "Critical findings"], "Anàlisi de vulnerabilitats": ["Análisis de vulnerabilidades", "Vulnerability analysis"],
    "Revisem servidors web, DNS i serveis exposats. Cada marca vermella és una porta oberta.": ["Revisamos servidores web, DNS y servicios expuestos. Cada marca roja es una puerta abierta.", "We review web servers, DNS and exposed services. Every red mark is an open door."],
    "Classificació": ["Clasificación", "Rating"], "CVSS v3.1: crítica · alta · mitjana · baixa": ["CVSS v3.1: crítica · alta · media · baja", "CVSS v3.1: critical · high · medium · low"],
    "Protegit": ["Protegido", "Protected"], "Informe i pla de millora": ["Informe y plan de mejora", "Report and remediation plan"],
    "Lliurem l'informe al teu portal i t'acompanyem a corregir cada vulnerabilitat. Després, re-auditem.": ["Entregamos el informe en tu portal y te acompañamos a corregir cada vulnerabilidad. Después, volvemos a auditar.", "We deliver the report to your portal and help you fix every vulnerability. Then we audit again."],
    "Lliurable": ["Entregable", "Deliverable"], "Informe executiu + tècnic (HTML / JSON)": ["Informe ejecutivo + técnico (HTML / JSON)", "Executive + technical report (HTML / JSON)"],
    "Avís": ["Aviso", "Alert"], "Bot de Telegram i portal de client": ["Bot de Telegram y portal de cliente", "Telegram bot and client portal"],
    "AUDITAT ✓": ["AUDITADO ✓", "AUDITED ✓"], "Conclusió": ["Conclusión", "Conclusion"],
    "Saps quantes portes té obertes la teva xarxa?": ["¿Sabes cuántas puertas tiene abiertas tu red?", "Do you know how many doors your network has open?"],
    "Tria el pla que millor s'adapta a la teva empresa: Bàsic, Professional o Avançat.": ["Elige el plan que mejor se adapta a tu empresa: Básico, Profesional o Avanzado.", "Choose the plan that fits your company: Basic, Professional or Advanced."],
    "Veure tarifes": ["Ver tarifas", "See pricing"], "Crear compte de client": ["Crear cuenta de cliente", "Create a client account"],
    "02 Xarxa": ["02 Red", "02 Network"], "04 Protecció": ["04 Protección", "04 Protection"], "fes scroll ↓": ["haz scroll ↓", "scroll ↓"],

    // Capçaleres de pàgina
    "Sobre Zevix": ["Sobre Zevix", "About Zevix"], "Plans i tarifes": ["Planes y tarifas", "Plans and pricing"],
    "Cas d'èxit: EbreLogistics S.L.": ["Caso de éxito: EbreLogistics S.L.", "Case study: EbreLogistics S.L."],
    "Glossari i preguntes freqüents": ["Glosario y preguntas frecuentes", "Glossary and FAQ"],
    "Cada servei correspon a un mòdul de la nostra eina d'auditoria en Python. Es poden contractar per separat o dins d'un dels nostres plans.":
      ["Cada servicio corresponde a un módulo de nuestra herramienta de auditoría en Python. Se pueden contratar por separado o dentro de uno de nuestros planes.",
       "Each service is a module of our Python audit tool. You can hire them separately or as part of one of our plans."],
    "Tres tècnics en administració de sistemes especialitzats en ciberseguretat, treballant amb metodologia àgil SCRUM.":
      ["Tres técnicos en administración de sistemas especializados en ciberseguridad, trabajando con metodología ágil SCRUM.",
       "Three systems administrators specialised in cybersecurity, working with the SCRUM agile method."],
    "Una consultora jove de ciberseguretat nascuda a les Terres de l'Ebre amb una idea clara: que la seguretat no sigui un luxe.":
      ["Una consultora joven de ciberseguridad nacida en las Terres de l'Ebre con una idea clara: que la seguridad no sea un lujo.",
       "A young cybersecurity consultancy from the Terres de l'Ebre with a clear idea: security should not be a luxury."],
    "Vulnerabilitats, consells i novetats del món de la ciberseguretat, explicats de manera clara.":
      ["Vulnerabilidades, consejos y novedades del mundo de la ciberseguridad, explicados de forma clara.", "Vulnerabilities, tips and cybersecurity news, explained clearly."],
    "Com auditem una empresa de logística de les Terres de l'Ebre, del contracte al pla de millora. Cas simulat del Projecte Intermodular.":
      ["Cómo auditamos una empresa de logística de las Terres de l'Ebre, del contrato al plan de mejora. Caso simulado del Proyecto Intermodular.",
       "How we audit a logistics company in the Terres de l'Ebre, from the contract to the remediation plan. A simulated case from our school project."],
    "Els termes de ciberseguretat que fem servir als informes, explicats en una frase.": ["Los términos de ciberseguridad que usamos en los informes, explicados en una frase.", "The cybersecurity terms we use in our reports, each explained in one sentence."],

    // Tarifes
    "Tres nivells de servei (senzill, mitjà i fort) perquè cada empresa pagui només pel que necessita.": ["Tres niveles de servicio (sencillo, medio y fuerte) para que cada empresa pague solo por lo que necesita.", "Three service levels (basic, medium and strong) so each company only pays for what it needs."],
    "Auditoria puntual": ["Auditoría puntual", "One-off audit"], "Contracte anual": ["Contrato anual", "Annual contract"],
    "Nivell Senzill": ["Nivel Sencillo", "Basic level"], "Nivell Mitjà": ["Nivel Medio", "Medium level"], "Nivell Fort": ["Nivel Fuerte", "Strong level"],
    "Bàsic": ["Básico", "Basic"], "Professional": ["Profesional", "Professional"], "Avançat": ["Avanzado", "Advanced"],
    "Per a petits negocis que volen una primera fotografia de la seva seguretat.": ["Para pequeños negocios que quieren una primera foto de su seguridad.", "For small businesses that want a first picture of their security."],
    "L'opció més completa per a pimes amb servidors i serveis propis.": ["La opción más completa para pymes con servidores y servicios propios.", "The most complete option for SMEs with their own servers and services."],
    "Per a organitzacions amb infraestructura crítica o d'alta disponibilitat.": ["Para organizaciones con infraestructura crítica o de alta disponibilidad.", "For organisations with critical or high-availability infrastructure."],
    "/auditoria puntual": ["/auditoría puntual", "/one-off audit"], "RECOMANAT": ["RECOMENDADO", "RECOMMENDED"],
    "Contractar Bàsic": ["Contratar Básico", "Choose Basic"], "Contractar Professional": ["Contratar Profesional", "Choose Professional"], "Contractar Avançat": ["Contratar Avanzado", "Choose Advanced"],
    "Fins a 5 hosts / 1 xarxa LAN": ["Hasta 5 hosts / 1 red LAN", "Up to 5 hosts / 1 LAN"], "Fins a 20 hosts / 2 xarxes": ["Hasta 20 hosts / 2 redes", "Up to 20 hosts / 2 networks"],
    "Hosts il·limitats dins l'abast pactat": ["Hosts ilimitados dentro del alcance pactado", "Unlimited hosts within the agreed scope"],
    "Descobriment d'hosts i escaneig de ports": ["Descubrimiento de hosts y escaneo de puertos", "Host discovery and port scanning"],
    "Auditoria de configuració SSH": ["Auditoría de configuración SSH", "SSH configuration audit"],
    "Informe tècnic en HTML i JSON": ["Informe técnico en HTML y JSON", "Technical report in HTML and JSON"],
    "Accés al portal de clients": ["Acceso al portal de clientes", "Client portal access"],
    "Enumeració SMB i serveis web": ["Enumeración SMB y servicios web", "SMB enumeration and web services"],
    "Pla de millora personalitzat": ["Plan de mejora personalizado", "Tailored remediation plan"],
    "Re-auditoria de verificació": ["Re-auditoría de verificación", "Verification re-audit"],
    "Tot el que inclou el pla Bàsic": ["Todo lo que incluye el plan Básico", "Everything in the Basic plan"],
    "Tot el que inclou el pla Professional": ["Todo lo que incluye el plan Profesional", "Everything in the Professional plan"],
    "Reconeixement OSINT (Shodan + theHarvester)": ["Reconocimiento OSINT (Shodan + theHarvester)", "OSINT reconnaissance (Shodan + theHarvester)"],
    "Enumeració SMB i anàlisi web / DNS / FTP": ["Enumeración SMB y análisis web / DNS / FTP", "SMB enumeration and web / DNS / FTP analysis"],
    "Informe executiu + informe tècnic (CVSS)": ["Informe ejecutivo + informe técnico (CVSS)", "Executive + technical report (CVSS)"],
    "Alertes per Telegram": ["Alertas por Telegram", "Telegram alerts"], "Suport prioritari": ["Soporte prioritario", "Priority support"],
    "Auditoria d'infraestructura HA (Proxmox, clústers)": ["Auditoría de infraestructura HA (Proxmox, clústeres)", "HA infrastructure audit (Proxmox, clusters)"],
    "Detecció de vulnerabilitats amb NSE (CVE)": ["Detección de vulnerabilidades con NSE (CVE)", "Vulnerability detection with NSE (CVE)"],
    "Sessió de presentació de resultats amb la direcció": ["Sesión de presentación de resultados con la dirección", "Results meeting with management"],
    "Re-auditoria de verificació inclosa": ["Re-auditoría de verificación incluida", "Verification re-audit included"],
    "Suport prioritari durant 3 mesos": ["Soporte prioritario durante 3 meses", "Priority support for 3 months"],
    "Formació bàsica de conscienciació per a l'equip": ["Formación básica de concienciación para el equipo", "Basic security awareness training for staff"],
    "Informe en PDF signat": ["Informe en PDF firmado", "Signed PDF report"],
    "Quin pla necessites?": ["¿Qué plan necesitas?", "Which plan do you need?"],
    "Respon tres preguntes i et diem quin pla s'adapta a la teva empresa i el preu orientatiu.": ["Responde tres preguntas y te decimos qué plan se adapta a tu empresa y el precio orientativo.", "Answer three questions and we'll tell you which plan fits your company and the estimated price."],
    "Càlcul orientatiu": ["Cálculo orientativo", "Estimate"], "Equips a auditar:": ["Equipos a auditar:", "Hosts to audit:"],
    "Volem saber què es veu de nosaltres a Internet (OSINT)": ["Queremos saber qué se ve de nosotros en Internet (OSINT)", "We want to know what the Internet shows about us (OSINT)"],
    "Tenim carpetes compartides, web o DNS propis": ["Tenemos carpetas compartidas, web o DNS propios", "We run shared folders, a website or our own DNS"],
    "Tenim servidors redundants o infraestructura crítica": ["Tenemos servidores redundantes o infraestructura crítica", "We have redundant servers or critical infrastructure"],
    "Contracte anual (-15 %)": ["Contrato anual (-15 %)", "Annual contract (-15%)"], "Pla recomanat": ["Plan recomendado", "Recommended plan"],
    "Demanar aquest pla": ["Pedir este plan", "Request this plan"], "Compara els plans": ["Compara los planes", "Compare plans"],
    "Preguntes freqüents": ["Preguntas frecuentes", "FAQ"],

    // Contacte
    "Explica'ns què necessites i et respondrem en menys de 24 hores laborables.": ["Explícanos qué necesitas y te responderemos en menos de 24 horas laborables.", "Tell us what you need and we'll reply within one working day."],
    "Envia'ns un missatge": ["Envíanos un mensaje", "Send us a message"], "Tots els camps marcats amb * són obligatoris.": ["Todos los campos marcados con * son obligatorios.", "Fields marked with * are required."],
    "Nom i cognoms *": ["Nombre y apellidos *", "Full name *"], "Correu electrònic *": ["Correo electrónico *", "Email *"], "Telèfon": ["Teléfono", "Phone"],
    "Servei d'interès *": ["Servicio de interés *", "Service *"], "Selecciona una opció": ["Selecciona una opción", "Choose an option"],
    "Auditoria a mida": ["Auditoría a medida", "Custom audit"], "Consulta general": ["Consulta general", "General enquiry"], "Missatge *": ["Mensaje *", "Message *"],
    "He llegit i accepto la política de privacitat. Les meves dades només s'utilitzaran per respondre aquesta consulta.": ["He leído y acepto la política de privacidad. Mis datos solo se usarán para responder esta consulta.", "I have read and accept the privacy policy. My data will only be used to answer this enquiry."],
    "Enviar missatge": ["Enviar mensaje", "Send message"], "Correu": ["Correo", "Email"], "Oficina": ["Oficina", "Office"], "Horari": ["Horario", "Opening hours"],
    "Dilluns a divendres · 8:00 – 15:00": ["Lunes a viernes · 8:00 – 15:00", "Monday to Friday · 8:00 – 15:00"], "Segueix-nos": ["Síguenos", "Follow us"],
    "✓ Formulari validat correctament. Aquesta web és una demostració i encara no envia correus: escriu-nos a info@zevixcyber.tech.":
      ["✓ Formulario validado. Esta web es una demostración y todavía no envía correos: escríbenos a info@zevixcyber.tech.", "✓ Form validated. This site is a demo and does not send emails yet: write to info@zevixcyber.tech."],

    // Inici de sessió
    "Accés a la plataforma d'auditoria": ["Acceso a la plataforma de auditoría", "Audit platform access"],
    "Des del portal pots consultar l'estat de les teves auditories i descarregar els informes de vulnerabilitats.": ["Desde el portal puedes consultar el estado de tus auditorías y descargar los informes de vulnerabilidades.", "From the portal you can check your audits and download your vulnerability reports."],
    "Iniciar sessió": ["Iniciar sesión", "Log in"], "Selecciona el tipus de compte i introdueix les teves credencials.": ["Selecciona el tipo de cuenta e introduce tus credenciales.", "Choose the account type and enter your credentials."],
    "Administrador": ["Administrador", "Administrator"], "Correu electrònic": ["Correo electrónico", "Email"], "Contrasenya": ["Contraseña", "Password"],
    "Entrar": ["Entrar", "Log in"], "No tens compte?": ["¿No tienes cuenta?", "No account?"], "Registra't": ["Regístrate", "Sign up"],
    "Comptes de demostració": ["Cuentas de demostración", "Demo accounts"],
    "+ IVA": ["+ IVA", "+ VAT"],
    // Textos d'ajuda dins dels camps (placeholder)
    "Explica'ns breument la teva infraestructura (nombre de servidors, serveis, etc.)": ["Explícanos brevemente tu infraestructura (número de servidores, servicios, etc.)", "Briefly describe your infrastructure (number of servers, services, etc.)"],
    "el-teu@correu.cat": ["tu@correo.es", "you@company.com"],
    "p. ex. CVSS, OSINT, hardening...": ["p. ej. CVSS, OSINT, hardening...", "e.g. CVSS, OSINT, hardening..."],
  };
  const IDIOMES = { ca: 0, es: 1, en: 2 };
  const originals = new WeakMap();

  function tradueix(lang) {
    const idx = IDIOMES[lang] || 0;
    document.documentElement.lang = lang;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (node.parentElement && node.parentElement.closest("script, style, code, .lang-switch")) continue;
      if (!originals.has(node)) originals.set(node, node.nodeValue);
      const original = originals.get(node);
      const clau = original.replace(/\s+/g, " ").trim();
      if (!clau) continue;
      const tr = T[clau];
      node.nodeValue = idx === 0 || !tr ? original : original.replace(original.trim(), tr[idx - 1]);
    }
    document.querySelectorAll("[placeholder]").forEach((el) => {
      if (!el.dataset.phCa) el.dataset.phCa = el.placeholder;
      const tr = T[el.dataset.phCa];
      el.placeholder = idx === 0 || !tr ? el.dataset.phCa : tr[idx - 1];
    });
    document.querySelectorAll(".lang-switch button").forEach((b) => b.classList.toggle("active", b.dataset.lang === lang));
  }

  document.addEventListener("DOMContentLoaded", () => {
    let lang = "ca";
    try { lang = localStorage.getItem("zevix_lang") || "ca"; } catch (e) {}
    document.querySelectorAll(".lang-switch button").forEach((b) => b.addEventListener("click", () => {
      try { localStorage.setItem("zevix_lang", b.dataset.lang); } catch (e) {}
      tradueix(b.dataset.lang);
    }));
    if (lang !== "ca") tradueix(lang); else tradueix("ca");
  });
})();
