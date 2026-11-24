/* ==========================================================
   Zevix Cybersecurity · Mòdul d'autenticació (PROTOTIP)

   IMPORTANT: GitHub Pages només serveix fitxers estàtics, per tant
   aquest mòdul simula el login i el control d'accés per rols (RBAC)
   al navegador per poder demostrar el flux:
       Usuari → Landing Page → Login → Plataforma (Client / Admin)

   NO és un sistema segur: les credencials de demostració són
   visibles al codi. En la fase 2 (Sprint 2-3) la validació es farà
   al servidor (Django / LAMP) amb contrasenyes amb hash, sessions
   i protecció CSRF. Vegeu docs/documentacio_landing_page.md.
   ========================================================== */

(function () {
  const SESSION_KEY = "zevix_session";
  const USERS_KEY = "zevix_users";

  // Usuaris de demostració (entorn de proves)
  const DEMO_USERS = [
    { email: "client@ebrelogistics.cat", password: "Client2026!", role: "client", name: "EbreLogistics S.L.", company: "EbreLogistics S.L." },
    { email: "admin@zevixcyber.tech", password: "Admin2026!", role: "admin", name: "Equip Zevix", company: "Zevix Cybersecurity" },
  ];

  function safeGet(storage, key) {
    try { return JSON.parse(storage.getItem(key)); } catch (e) { return null; }
  }
  function safeSet(storage, key, value) {
    try { storage.setItem(key, JSON.stringify(value)); return true; } catch (e) { return false; }
  }

  function allUsers() {
    return DEMO_USERS.concat(safeGet(localStorage, USERS_KEY) || []);
  }

  const ZevixAuth = {
    login(email, password, role) {
      email = String(email).trim().toLowerCase();
      const user = allUsers().find((u) => u.email === email && u.password === password);
      if (!user) return { ok: false, error: "Credencials incorrectes." };
      if (role && user.role !== role) {
        return { ok: false, error: role === "admin" ? "Aquest compte no té permisos d'administrador." : "Aquest compte és d'administrador: selecciona «Administrador»." };
      }
      const session = { email: user.email, name: user.name, company: user.company, role: user.role, since: new Date().toISOString() };
      safeSet(sessionStorage, SESSION_KEY, session);
      return { ok: true, user: session, redirect: user.role === "admin" ? "portal-admin.html" : "portal-client.html" };
    },

    register(data) {
      const email = String(data.email).trim().toLowerCase();
      if (allUsers().some((u) => u.email === email)) return { ok: false, error: "Ja existeix un compte amb aquest correu." };
      const users = safeGet(localStorage, USERS_KEY) || [];
      users.push({ email, password: data.password, role: "client", name: data.name, company: data.company });
      if (!safeSet(localStorage, USERS_KEY, users)) return { ok: false, error: "No s'ha pogut desar el compte en aquest navegador." };
      return { ok: true };
    },

    logout() {
      try { sessionStorage.removeItem(SESSION_KEY); } catch (e) {}
      location.href = "login.html";
    },

    currentUser() {
      return safeGet(sessionStorage, SESSION_KEY);
    },

    // Protegeix una pàgina privada: si no hi ha sessió o el rol no és vàlid, redirigeix al login
    require(roles) {
      const user = this.currentUser();
      if (!user || (roles && !roles.includes(user.role))) {
        location.replace("login.html?next=" + encodeURIComponent(location.pathname.split("/").pop()));
        return null;
      }
      return user;
    },

    // Puntuació simple de robustesa de contrasenya (0-4)
    strength(pw) {
      let s = 0;
      if (pw.length >= 8) s++;
      if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
      if (/\d/.test(pw)) s++;
      if (/[^A-Za-z0-9]/.test(pw)) s++;
      return s;
    },
  };

  window.ZevixAuth = ZevixAuth;
})();
