# Zevix Cybersecurity · Projecte Intermodular ASIX

<img src="assets/img/logo.svg" alt="Logo Zevix" width="90" align="right">

**CFGS Administració de Sistemes Informàtics en Xarxa, perfil Ciberseguretat**
Institut de l'Ebre · Mòdul MP0379 Projecte Intermodular · Curs 2026-27 · **Grup 3**

Zevix Cybersecurity és una empresa (simulada) d'auditories de seguretat informàtica. Desenvolupem una eina d'auditoria en Python i auditem la infraestructura de **EbreLogistics S.L.** segons el contracte `ZVX-CONT-2026-01`.

## Enllaços ràpids

| Recurs | Enllaç |
|---|---|
| Landing page | https://pauserra-ie.github.io/PROJECTE-INTERMODULAR/ |
| Documentació de la landing page | [docs/documentacio_landing_page.md](docs/documentacio_landing_page.md) |
| Tauler Kanban | https://kanbanflow.com/board/SLcaEb2 |

## Equip

| Membre | Rol |
|---|---|
| Pau Serra Bertomeu | Product Owner |
| Maria del Valle Suñe Nieto | Scrum Master |
| Iker Espinosa López | Developer |

## Tecnologies

- **Web (Sprint 1):** HTML5, CSS3, JavaScript, Three.js (efecte Scroll World), desplegat a GitHub Pages
- **Plataforma (fase 2):** Django (Python) o LAMP
- **Eina d'auditoria (v2, carpeta [auditoria/](auditoria/)):** Python + tkinter amb theHarvester, Shodan, Nmap, Nikto i ping/dig/whois · en desenvolupament: ssh-audit, enum4linux, Docker i bot de Telegram
- **Infraestructura auditada:** Proxmox VE, alta disponibilitat (IP flotant), Apache, vsftpd, Bind9, Samba, SSH

## Landing page

Tota la portada és un efecte **Scroll World**: un món 3D (Three.js) on el scroll fa volar la càmera per les 4 fases d'una auditoria. Si veieu una versió antiga, recarregueu amb **Ctrl+Shift+R**.

El disseny segueix l'estil d'un **informe d'auditoria** (IBM Plex Mono/Sans, colors de gravetat CVSS). La versió anterior està guardada a l'etiqueta `disseny-original` i a [index-original.html](index-original.html).

Pàgines: Inici · Serveis · Equip · Sobre nosaltres · Tarifes (amb calculadora de pressupost) · Notícies · Contacte · Cas d'èxit · Glossari i FAQ · Login · Registre · Portal de clients · Portal d'administradors · 404.

**Comptes de demostració** (prototip, l'autenticació es fa al navegador):

| Rol | Correu | Contrasenya |
|---|---|---|
| Client | `client@ebrelogistics.cat` | `Client2026!` |
| Administrador | `admin@zevixcyber.tech` | `Admin2026!` |

Provar en local:

```bash
python3 -m http.server 8000
```

## Estructura

```
├── *.html                 Pàgines de la web i del portal
├── assets/css, js, img    Estils, scripts i imatges
├── auditoria/             Eina d'auditoria en Python (v2)
├── informes_auditoria/    Informes d'exemple (JSON / HTML)
└── docs/                  Documentació del projecte
```

## Ús d'IA

Hem fet servir Gemini per a la planificació i Claude Code per generar el codi de la web, amb revisió de l'equip. El detall (què ha fet l'equip, què ha fet la IA i com funciona el codi) és a l'[apartat 9 de la documentació](docs/documentacio_landing_page.md#9-ús-dintel·ligència-artificial).
