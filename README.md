# Zevix Cybersecurity — Projecte Intermodular ASIX

<img src="assets/img/logo.svg" alt="Logo Zevix" width="90" align="right">

**CFGS Administració de Sistemes Informàtics en Xarxa — perfil Ciberseguretat**
Institut de l'Ebre · Mòdul MP0379 Projecte Intermodular · Curs 2026-27 · **Grup 3**

Zevix Cybersecurity és una empresa (simulada) d'auditories de seguretat informàtica. Desenvolupem una eina d'auditoria en Python i auditem la infraestructura de **EbreLogistics S.L.** segons el contracte `ZVX-CONT-2026-01`.

## 🔗 Enllaços ràpids

| Recurs | Enllaç |
|---|---|
| 🌐 Landing page | https://pauserra-ie.github.io/PROJECTE-INTERMODULAR/ |
| 📄 Documentació de la landing page | [docs/documentacio_landing_page.md](docs/documentacio_landing_page.md) |
| 📋 Tauler Kanban | *(afegir enllaç a KanbanFlow / Trello)* |

## 👥 Equip

| Membre | Rol |
|---|---|
| Pau Serra Bertomeu | Product Owner · Infraestructura i Sistemes |
| Iker Espinosa López | Scrum Master · Desenvolupament Web |
| Maria del Valle Suñe Nieto | Developer · Eina d'Auditoria Python |

## 🧱 Tecnologies

- **Web (Sprint 1):** HTML5, CSS3, JavaScript, Three.js (efecte Scroll World) — desplegat a GitHub Pages
- **Plataforma (fase 2):** Django (Python) o LAMP
- **Eina d'auditoria:** Python, Nmap, ssh-audit, enum4linux, Shodan, theHarvester, Docker, bot de Telegram
- **Infraestructura auditada:** Proxmox VE, alta disponibilitat (IP flotant), Apache, vsftpd, Bind9, Samba, SSH

## 🖥️ Landing page

Tota la portada és un efecte **Scroll World**: un món 3D (Three.js) on el scroll fa volar la càmera per les 4 fases d'una auditoria. Si veieu una versió antiga, recarregueu amb **Ctrl+Shift+R**.

Pàgines: Inici · Serveis · Equip · Sobre nosaltres · Tarifes (Bàsic / Professional / Avançat) · Notícies · Contacte · Login · Registre · Portal de clients · Portal d'administradors.

**Comptes de demostració** (prototip, l'autenticació es fa al navegador):

| Rol | Correu | Contrasenya |
|---|---|---|
| Client | `client@ebrelogistics.cat` | `Client2026!` |
| Administrador | `admin@zevix.tech` | `Admin2026!` |

Provar en local:

```bash
python3 -m http.server 8000
```

## 📁 Estructura

```
├── *.html                 Pàgines de la web i del portal
├── assets/css, js, img    Estils, scripts i imatges
├── informes_auditoria/    Informes d'exemple (JSON / HTML)
└── docs/                  Documentació del projecte
```
