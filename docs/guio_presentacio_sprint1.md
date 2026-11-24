# Guió de la presentació · Sprint 1

**Zevix Cybersecurity · Grup 3** · Presentació del 30/11 al 4/12/2026
Pau Serra (Product Owner) · Maria del Valle Suñe (Scrum Master) · Iker Espinosa (Developer)

Estructura basada en el document del Moodle *Punts bàsics presentació sprint* i avaluada amb la *Rúbrica presentació individual* (presentació personal, llenguatge i contacte visual, domini del tema, estructura, conclusió i temps).

**Durada orientativa: 15 minuts** (uns 5 minuts per persona) + preguntes. Si el professor indica un altre temps, retalleu primer les diapositives 6 i 11.

| # | Diapositiva | Qui | Temps |
|---|---|---|---|
| 1 | Portada | Pau | 0:30 |
| 2 | Índex | Pau | 0:30 |
| 3 | Introducció: el projecte | Pau | 1:00 |
| 4 | Equip i rols Scrum | Valle | 1:00 |
| 5 | Kanban i planificació | Valle | 1:15 |
| 6 | Fitxes IPOP | Valle | 1:00 |
| 7 | Contracte simbòlic | Pau | 1:15 |
| 8 | Anàlisi de riscos | Pau | 1:00 |
| 9 | L'aplicació: eina d'auditoria | Iker | 1:30 |
| 10 | Scripts de reconeixement | Iker | 1:00 |
| 11 | Bots i automatització | Iker | 0:45 |
| 12 | Landing page i plataforma | Iker | 1:30 |
| 13 | Problemes i solucions | Valle | 1:15 |
| 14 | Possibles millores | Iker | 0:45 |
| 15 | Conclusions | Pau | 0:45 |
| 16 | Dubtes i preguntes | Tots | — |

---

## 1. Portada · Pau
"Bon dia. Som el Grup 3 i us presentem Zevix Cybersecurity, la nostra empresa d'auditories de seguretat. Jo soc en Pau Serra i faig de Product Owner; m'acompanyen la Valle Suñe, la nostra Scrum Master, i l'Iker Espinosa, que fa de Developer."

> Rúbrica: *presentació personal i introducció*. Mireu el públic, no la pantalla.

## 2. Índex · Pau
"Primer explicarem de què va el projecte i com ens organitzem. Després, el contracte i l'anàlisi de riscos, l'aplicació que estem construint i la web. Acabarem amb els problemes que hem trobat, les millores i les conclusions."

## 3. Introducció · Pau
- El mòdul de projecte simula una empresa d'auditoria real.
- **Projecte 1 (60 %)**: eina d'auditoria en Python amb interfície gràfica, auditoria de servidors i documentació.
- **Projecte 2 (40 %)**: pla de millora de la infraestructura auditada.
- El nostre flux: **contracte → reconeixement → auditoria → pla de millora**.

"Nosaltres som Zevix i el nostre client és EbreLogistics, una empresa de logística (fictícia) de les Terres de l'Ebre."

## 4. Equip i rols Scrum · Valle
"Treballem amb Scrum. En Pau, com a Product Owner, prioritza el que aporta més valor al client. Jo, com a Scrum Master, m'asseguro que seguim la metodologia i que ningú queda bloquejat. L'Iker, com a Developer, planifica i construeix cada increment."

"El nostre procés per a cada tasca és: requisit, tasca, prova, evidència i següent pas."

## 5. Kanban i planificació · Valle
- Tauler a KanbanFlow (ensenyeu-lo en directe si podeu: https://kanbanflow.com/board/SLcaEb2).
- Explicar com repartim les tasques: columnes, responsable de cada targeta.
- Calendari del projecte: preparació (12/11) → Sprint 1 (30/11) → auditoria de serveis (15/12) → funcionalitats (15/01) → Sprint 2 (18/01) → Sprint 3 i lliurament (01/02).

> Consell: tingueu el tauler obert en una pestanya. Ensenyar-lo en directe demostra *domini del tema*.

## 6. Fitxes IPOP · Valle
"Cada membre ha fet la seva fitxa IPOP amb el seu perfil i objectius professionals." Cadascú diu en una frase el seu objectiu professional.

> **Adapteu aquesta diapositiva a les vostres fitxes reals.**

## 7. Contracte simbòlic · Pau
- Contracte **ZVX-CONT-2026-01** amb EbreLogistics S.L., basat en ISO/IEC 27001 i les guies d'INCIBE.
- **Inclòs**: xarxa local i alta disponibilitat (IP flotant), servidors web, FTP i DNS, SSH, Samba i bases de dades.
- **Exclòs**: accés físic, dispositius mòbils dels empleats (BYOD) i serveis de tercers.
- **Permisos**: compte de baix privilegi; prohibit accés root, modificacions permanents i atacs DoS.
- Confidencialitat indefinida i lliurament d'informe executiu, informe tècnic (CVSS) i pla de millora.

"El punt més important és la delimitació de l'abast: deixa clar què podem tocar i què no."

## 8. Anàlisi de riscos · Pau
"Abans d'executar cap eina vam fer l'anàlisi de riscos amb el model d'INCIBE: risc = probabilitat × impacte. De 10 actius, 3 tenen risc crític (12 sobre 16): l'accés SSH com a root, els serveis innecessaris com Telnet o Samba obert, i MySQL sense contrasenya escoltant a totes les interfícies."

"Aquests tres són els primers que auditarem."

## 9. L'aplicació · Iker
- Aplicació d'escriptori en Python amb **tkinter** (versió 2, amb el disseny de Zevix).
- Pestanyes: OSINT (theHarvester i Shodan), Nmap, Nikto i utilitats de xarxa (ping, dig, whois).
- Cada eina s'executa en un **fil separat** (`threading` + `subprocess`) i la sortida passa per una **cua** fins a la consola, amb colors per a ports oberts, avisos i errors.
- Valida les dades abans d'executar, permet **aturar** l'escaneig i **exporta** els resultats a TXT i JSON.
- La clau de Shodan es llegeix d'una **variable d'entorn**, no del codi.

"A la captura veieu un escaneig de serveis i versions de scanme.nmap.org, el servidor que el projecte Nmap ofereix per fer proves."

> Si podeu, feu una demo en directe d'1 minut amb l'escaneig ràpid.

## 10. Scripts de reconeixement · Iker
- **Shodan**: consulta d'una IP (dominis, ports i serveis amb banner grabbing) i cerca global de serveis. És reconeixement **passiu**: no enviem cap paquet a la xarxa del client.
- **theHarvester**: correus, subdominis i hosts a partir d'un domini, amb exportació en HTML i XML.

## 11. Bots i automatització · Iker
"Pel Sprint 2 afegirem un bot de Telegram que avisarà quan acabi una auditoria i un contenidor Docker per executar l'eina des d'un USB sense deixar rastre al sistema auditat."

## 12. Landing page i plataforma · Iker
- Web estàtica (HTML, CSS i JavaScript) publicada a GitHub Pages.
- Portada amb un recorregut 3D (Three.js): el scroll mou la càmera per les quatre fases de l'auditoria.
- Login per rols: el **client** consulta i descarrega els seus informes; l'**administrador** gestiona clients i informes.
- El login és un prototip; a la fase 2 passarà a Django amb validació al servidor.

## 13. Problemes i solucions · Valle
"Hem tingut problemes reals i els hem resolt així:"
- La clau de l'API de Shodan era dins del codi → ara es llegeix d'una variable d'entorn (versió 2 de l'eina).
- El navegador mostrava el CSS antic → versionat dels fitxers (`?v=7`).
- Configurar el domini propi va deixar la web sense accés → hem tret el `CNAME` fins que el DNS estigui a punt.
- Dos membres pujant a GitHub alhora → `git pull` / `rebase` abans de fer `push`.
- La IA va proposar dades que no eren nostres (rols, eines) → ho vam contrastar amb els nostres documents.

> Aquesta diapositiva puntua molt: demostra que enteneu el projecte.

## 14. Possibles millores · Iker
- Mòduls d'auditoria SSH (ssh-audit) i enumeració SMB (enum4linux), per al 15/12.
- Exportar resultats en JSON perquè el portal de clients els mostri directament.
- Backend real (Django) amb usuaris a base de dades.
- Domini propi amb HTTPS.

## 15. Conclusions · Pau
"En aquest primer sprint tenim l'empresa definida, el contracte i l'anàlisi de riscos fets, una primera versió de l'eina amb cinc mòduls que funcionen i la web publicada. El següent pas és l'auditoria de serveis (SSH i enumeració) per al 15 de desembre."

> Rúbrica: la conclusió ha de donar els *resultats clau*. Digueu què heu aconseguit, no què heu fet.

## 16. Dubtes i preguntes · Tots
Repartiu-vos les preguntes per temes: Pau (contracte i riscos), Valle (organització i problemes), Iker (eina i web).

---

### Consells de la rúbrica de comunicació
- **Gestualitat**: postura oberta, mans visibles, no us quedeu darrere l'ordinador.
- **Mirada**: mireu tot el públic, no la pantalla. Les diapositives són una guia.
- **Volum i entonació**: parleu més fort del que creieu necessari.
- **Ritme**: deixeu una pausa entre diapositives. Assajeu-ho cronometrant-vos.
