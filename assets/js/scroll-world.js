/* ==========================================================
   Zevix Cybersecurity · Efecte "Scroll World"

   Un món 3D (Three.js) on el scroll controla una càmera que vola
   sense talls per les 4 fases d'una auditoria:
     1. Internet / OSINT        (globus amb satèl·lits)
     2. La xarxa de l'empresa   (ciutat de servidors connectats)
     3. Dins del CPD            (passadís de racks amb alertes)
     4. Informe i protecció     (cúpula-escut sobre la xarxa)

   Inspirat en la tècnica de scroll-world (oso95/scroll-world), però
   renderitzat en temps real en lloc de vídeos pre-renderitzats:
   és gratuït, lleuger i s'executa a GitHub Pages.
   ========================================================== */

(function () {
  const section = document.getElementById("world");
  if (!section) return;

  const canvas = section.querySelector("canvas");
  const stages = Array.from(section.querySelectorAll(".world-stage"));
  const caps = Array.from(section.querySelectorAll(".world-cap"));
  const dots = Array.from(section.querySelectorAll(".world-progress li"));
  const bar = section.querySelector(".world-bar span");
  const hint = section.querySelector(".world-hint");

  function hasWebGL() {
    try {
      const c = document.createElement("canvas");
      return !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl")));
    } catch (e) { return false; }
  }
  // Sense Three.js o WebGL: es mostren les 4 fases com a targetes estàtiques
  if (!window.THREE || !hasWebGL()) { section.classList.add("world-fallback"); return; }

  // Paleta: estil "informe" (línies de plànol en blanc trencat + colors de gravetat).
  // La portada original (index-original.html) conserva la paleta cian/blau.
  const ORIGINAL = document.body.classList.contains("theme-original");
  const COL = ORIGINAL
    ? { cyan: 0x22d3ee, blue: 0x3b82f6, violet: 0xa78bfa, red: 0xf87171, green: 0x34d399, amber: 0xfbbf24, bg: 0x070b14, grid1: 0x1e3a5f, grid2: 0x13213a, dots: 0.6, solid: 0x0f1a2e }
    : { cyan: 0xd6d3cc, blue: 0x5b6068, violet: 0xf5a524, red: 0xef4444, green: 0x22c55e, amber: 0xf5a524, bg: 0x0b0c0d, grid1: 0x2a2d32, grid2: 0x17191c, dots: 0.3, solid: 0x16181b };

  /* ---------- Renderer, escena i càmera ---------- */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(COL.bg);
  scene.fog = new THREE.FogExp2(COL.bg, 0.011);
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 400);

  scene.add(new THREE.AmbientLight(0x6688aa, 0.7));
  const sun = new THREE.DirectionalLight(0xffffff, 0.7);
  sun.position.set(10, 25, 10);
  scene.add(sun);

  /* ---------- Utilitats ---------- */
  const lineMat = (color, opacity) => new THREE.LineBasicMaterial({ color, transparent: true, opacity: opacity == null ? 0.9 : opacity });
  function block(w, h, d, edge, glow) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
      color: COL.solid, roughness: 0.6, metalness: 0.3, emissive: glow || edge, emissiveIntensity: 0.07,
    }));
    mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), lineMat(edge)));
    return mesh;
  }
  function line(points, color, opacity) {
    return new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), lineMat(color, opacity));
  }
  const animated = []; // funcions (t) => void que s'executen cada frame

  /* ---------- Entorn: terra en graella i partícules de dades ---------- */
  const grid = new THREE.GridHelper(420, 140, COL.grid1, COL.grid2);
  grid.position.set(0, -6, -100);
  scene.add(grid);

  const N = window.innerWidth < 700 ? 700 : 1500;
  const pPos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    pPos[i * 3] = (Math.random() - 0.5) * 140;
    pPos[i * 3 + 1] = Math.random() * 50 - 5;
    pPos[i * 3 + 2] = 30 - Math.random() * 260;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
  const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: COL.cyan, size: 0.16, transparent: true, opacity: COL.dots }));
  scene.add(particles);

  // "Autopista de dades" que uneix totes les escenes (flux continu, sense talls)
  const trail = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -5.5, 25), new THREE.Vector3(0, -5.5, -30), new THREE.Vector3(0, -5.5, -100),
    new THREE.Vector3(0, -5.5, -160), new THREE.Vector3(0, -5.5, -200),
  ]);
  scene.add(line(trail.getPoints(200), COL.blue, 0.5));
  const trailPackets = [];
  for (let i = 0; i < 14; i++) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), new THREE.MeshBasicMaterial({ color: COL.cyan }));
    m.userData.o = i / 14;
    trailPackets.push(m);
    scene.add(m);
  }
  animated.push((t) => trailPackets.forEach((m) => m.position.copy(trail.getPoint((m.userData.o + t * 0.03) % 1))));

  /* ---------- ESCENA 1: Internet / OSINT (z = 0) ---------- */
  const globe = new THREE.Group();
  globe.position.set(0, 4, 0);
  scene.add(globe);
  globe.add(new THREE.Mesh(new THREE.SphereGeometry(6.8, 32, 32), new THREE.MeshStandardMaterial({ color: COL.solid, roughness: 0.9 })));
  globe.add(new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(7, 2)), lineMat(COL.cyan, 0.35)));
  // Serveis exposats detectats a Internet (punts sobre el globus)
  for (let i = 0; i < 26; i++) {
    const v = new THREE.Vector3().setFromSphericalCoords(7.05, Math.acos(2 * Math.random() - 1), Math.random() * Math.PI * 2);
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), new THREE.MeshBasicMaterial({ color: i % 5 === 0 ? COL.red : COL.amber }));
    dot.position.copy(v);
    globe.add(dot);
  }
  // Satèl·lits en òrbita (Shodan, theHarvester...)
  const orbits = [];
  [[10, 0.3, COL.violet], [12, -0.5, COL.cyan], [14, 0.9, COL.blue]].forEach(([r, tilt, c], i) => {
    const o = new THREE.Group();
    o.position.copy(globe.position);
    o.rotation.x = Math.PI / 2 + tilt;
    o.add(new THREE.Mesh(new THREE.TorusGeometry(r, 0.03, 6, 120), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.45 })));
    const sat = new THREE.Mesh(new THREE.OctahedronGeometry(0.6), new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.6 }));
    sat.position.x = r;
    o.add(sat);
    o.userData.speed = 0.25 + i * 0.12;
    orbits.push(o);
    scene.add(o);
  });
  animated.push((t) => {
    globe.rotation.y = t * 0.12;
    orbits.forEach((o) => { o.rotation.z = t * o.userData.speed; });
  });

  /* ---------- ESCENA 2: La xarxa de l'empresa (z = -55) ---------- */
  const city = new THREE.Group();
  city.position.set(0, 0, -55);
  scene.add(city);
  city.add(block(38, 0.8, 38, COL.blue));
  city.children[0].position.y = -5.5;
  const hub = block(3, 6, 3, COL.cyan, COL.cyan);
  hub.position.y = -2;
  city.add(hub);
  const links = [];
  for (let gx = -2; gx <= 2; gx++) {
    for (let gz = -2; gz <= 2; gz++) {
      if (gx === 0 && gz === 0) continue;
      const h = 2 + Math.random() * 7;
      const b = block(2.6, h, 2.6, (gx + gz) % 2 ? COL.blue : COL.cyan);
      b.position.set(gx * 6.5, -5.1 + h / 2, gz * 6.5);
      city.add(b);
      const a = new THREE.Vector3(0, 1, 0);
      const z = new THREE.Vector3(gx * 6.5, -5.1 + h, gz * 6.5);
      city.add(line([a, z], COL.cyan, 0.35));
      links.push([a, z]);
    }
  }
  // Paquets de dades viatjant per la xarxa
  const packets = links.filter((_, i) => i % 2 === 0).map((l, i) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), new THREE.MeshBasicMaterial({ color: i % 4 ? COL.cyan : COL.amber }));
    m.userData = { l, o: Math.random() };
    city.add(m);
    return m;
  });
  // Anell d'escaneig (Nmap) que s'expandeix
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1, 0.08, 8, 90), new THREE.MeshBasicMaterial({ color: COL.cyan, transparent: true }));
  ring.rotation.x = Math.PI / 2;
  ring.position.y = -4.8;
  city.add(ring);
  animated.push((t) => {
    packets.forEach((m) => {
      const k = (m.userData.o + t * 0.35) % 1;
      m.position.lerpVectors(m.userData.l[0], m.userData.l[1], k);
    });
    const k = (t * 0.25) % 1;
    ring.scale.setScalar(1 + k * 22);
    ring.material.opacity = 1 - k;
  });

  /* ---------- ESCENA 3: Dins del CPD (z = -100 .. -150) ---------- */
  const room = new THREE.Group();
  scene.add(room);
  const door = block(12, 9, 0.6, COL.cyan);
  door.position.set(0, -1.5, -100);
  door.material.visible = false; // només es veu el marc
  room.add(door);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 56), new THREE.MeshStandardMaterial({ color: COL.solid, roughness: 0.8 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, -5.9, -127);
  room.add(floor);
  const leds = [];
  const alerts = [];
  for (let i = 0; i < 9; i++) {
    const z = -106 - i * 5.2;
    [-4.2, 4.2].forEach((x, side) => {
      const rack = block(2.4, 8, 3.6, COL.blue);
      rack.position.set(x, -1.9, z);
      room.add(rack);
      const vulnerable = (i === 2 && side === 0) || (i === 5 && side === 1) || (i === 7 && side === 0);
      for (let j = 0; j < 7; j++) {
        const led = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.18, 0.5), new THREE.MeshBasicMaterial({ color: vulnerable && j % 3 === 0 ? COL.red : COL.green }));
        led.position.set(x + (x < 0 ? 1.23 : -1.23), -4.8 + j * 1.05, z);
        led.userData.ph = Math.random() * 6;
        leds.push(led);
        room.add(led);
      }
      if (vulnerable) {
        const a = new THREE.Mesh(new THREE.OctahedronGeometry(0.55), new THREE.MeshBasicMaterial({ color: COL.red, wireframe: true }));
        a.position.set(x * 0.55, 3.6, z);
        alerts.push(a);
        room.add(a);
      }
    });
    // Llums del sostre
    room.add(line([new THREE.Vector3(-3, 4.6, z), new THREE.Vector3(3, 4.6, z)], COL.cyan, 0.5));
  }
  // Pla d'escaneig que recorre el passadís
  const scanner = new THREE.Mesh(new THREE.PlaneGeometry(6, 9.5), new THREE.MeshBasicMaterial({ color: COL.cyan, transparent: true, opacity: 0.08, side: THREE.DoubleSide }));
  scanner.add(new THREE.LineSegments(new THREE.EdgesGeometry(scanner.geometry), lineMat(COL.cyan, 0.8)));
  scanner.position.y = -1.2;
  room.add(scanner);
  animated.push((t) => {
    leds.forEach((l) => { l.visible = Math.sin(t * 4 + l.userData.ph) > -0.6; });
    alerts.forEach((a, i) => { a.rotation.y = t * 1.5; a.position.y = 3.6 + Math.sin(t * 2 + i) * 0.3; });
    scanner.position.z = -104 - ((Math.sin(t * 0.6) + 1) / 2) * 44;
  });

  /* ---------- ESCENA 4: Informe i protecció (z = -185) ---------- */
  const vault = new THREE.Group();
  vault.position.set(0, -5.5, -188);
  scene.add(vault);
  vault.add(new THREE.Mesh(new THREE.CylinderGeometry(16, 16, 0.6, 48), new THREE.MeshStandardMaterial({ color: 0x0b1a1a, roughness: 0.8 })));
  const domeGeo = new THREE.SphereGeometry(15, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2);
  const dome = new THREE.LineSegments(new THREE.WireframeGeometry(domeGeo), lineMat(COL.green, 0.28));
  vault.add(dome);
  for (let i = 0; i < 10; i++) {
    const h = 2 + Math.random() * 5;
    const b = block(2.2, h, 2.2, COL.green);
    const ang = (i / 10) * Math.PI * 2;
    b.position.set(Math.cos(ang) * 7, h / 2 + 0.3, Math.sin(ang) * 7);
    vault.add(b);
  }
  // Check gegant = vulnerabilitats corregides
  const check = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(-3, 0, 0), new THREE.Vector3(-1, -2, 0), new THREE.Vector3(3.5, 3, 0)], false, "catmullrom", 0), 40, 0.4, 10),
    new THREE.MeshStandardMaterial({ color: COL.green, emissive: COL.green, emissiveIntensity: 0.8 })
  );
  check.position.set(0, 9, 0);
  vault.add(check);
  animated.push((t) => {
    dome.rotation.y = t * 0.05;
    check.position.y = 9 + Math.sin(t * 1.2) * 0.5;
    check.rotation.y = Math.sin(t * 0.6) * 0.4;
  });

  /* ---------- Recorregut de la càmera ----------
     Fotogrames clau: [progrés, posició, punt de mira].
     Cada fase té el seu tram, sincronitzat amb el text (data-from / data-to). */
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const KEYS = [
    [0.00, V(0, 24, 58),     V(0, -2, -50)],   // intro: vista general de tot el món
    [0.07, V(0, 14, 34),     V(0, 4, 0)],      // 1: arribem al globus
    [0.17, V(17, 8, 9),      V(0, 4, 0)],      //    l'envoltem
    [0.27, V(8, 10, -18),    V(0, -1, -50)],   //    marxem cap a la xarxa
    [0.36, V(28, 24, -34),   V(0, -3, -55)],   // 2: sobrevolem la ciutat
    [0.45, V(16, 14, -70),   V(0, -2, -55)],   //    la rodegem per sobre dels edificis
    [0.53, V(0, 7, -84),     V(0, 0, -100)],   //    baixem cap a la porta del CPD
    [0.60, V(0, 1.4, -98),   V(0, 1, -115)],   // 3: creuem la porta
    [0.70, V(0, 1.2, -122),  V(0, 1, -140)],   //    passadís de racks
    [0.80, V(0, 1.2, -149),  V(0, 2, -178)],   //    sortim del CPD
    [0.87, V(14, 11, -164),  V(0, 3, -188)],   // 4: arribem a l'escut
    [0.93, V(0, 13, -160),   V(0, 4, -188)],   //    vista frontal
    [1.00, V(0, 26, -146),   V(0, 2, -188)],   // outro: ens allunyem
  ];
  const camPath = new THREE.CatmullRomCurve3(KEYS.map((k) => k[1]));
  const lookPath = new THREE.CatmullRomCurve3(KEYS.map((k) => k[2]));
  // Converteix el progrés (0..1) al paràmetre de la corba respectant els fotogrames clau
  function curveT(p) {
    let i = 0;
    while (i < KEYS.length - 2 && p > KEYS[i + 1][0]) i++;
    const f = (p - KEYS[i][0]) / (KEYS[i + 1][0] - KEYS[i][0]);
    const e = f * f * (3 - 2 * f); // suavitzat (smoothstep) dins de cada tram
    return (i + Math.min(1, Math.max(0, e))) / (KEYS.length - 1);
  }

  /* ---------- Scroll → progrés (0..1), suavitzat ---------- */
  let target = 0, progress = 0, running = false;
  function readScroll() {
    const r = section.getBoundingClientRect();
    const total = section.offsetHeight - window.innerHeight;
    target = Math.min(1, Math.max(0, -r.top / total));
  }
  window.addEventListener("scroll", readScroll, { passive: true });

  function resize() {
    const w = section.clientWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w < 700 ? 72 : 55; // en mòbil (vertical) obrim el camp de visió
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);

  // Mostra el text de l'etapa actual (intro, fases 1-4 o final)
  function updateUI(p) {
    stages.forEach((el) => {
      const on = p >= parseFloat(el.dataset.from) && p < parseFloat(el.dataset.to);
      if (on !== el.classList.contains("active")) el.classList.toggle("active", on);
    });
    dots.forEach((d, i) => d.classList.toggle("active", caps[i].classList.contains("active")));
    if (bar) bar.style.width = (p * 100).toFixed(1) + "%";
    if (hint) hint.style.opacity = p < 0.02 ? 1 : 0;
  }

  // Clic als punts de progrés: salta a cada fase
  dots.forEach((d) => d.addEventListener("click", () => {
    const total = section.offsetHeight - window.innerHeight;
    window.scrollTo({ top: section.offsetTop + total * parseFloat(d.dataset.go), behavior: "smooth" });
  }));

  const clock = new THREE.Clock();
  function frame() {
    if (!running) return;
    progress += (target - progress) * 0.08;
    if (Math.abs(target - progress) < 0.0001) progress = target;
    const t = clock.getElapsedTime();
    animated.forEach((fn) => fn(t));
    const ct = curveT(progress);
    camera.position.copy(camPath.getPoint(ct));
    camera.lookAt(lookPath.getPoint(ct));
    updateUI(progress);
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }

  // Només renderitzem quan la secció és visible (estalvi de CPU/bateria)
  new IntersectionObserver((entries) => {
    const vis = entries[0].isIntersecting;
    if (vis && !running) { running = true; readScroll(); requestAnimationFrame(frame); }
    else if (!vis) running = false;
  }).observe(section);

  resize();
  readScroll();
  progress = target;
  updateUI(progress);
})();
