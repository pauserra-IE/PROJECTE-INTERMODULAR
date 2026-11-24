"""
Zevix Cybersecurity · Eina d'auditoria de seguretat (v2)
Projecte Intermodular ASIX · Grup 3 · Institut de l'Ebre

Aplicació amb interfície gràfica (tkinter) que reuneix diverses eines
d'auditoria: OSINT (theHarvester i Shodan), escaneig de xarxa (Nmap),
auditoria web (Nikto) i utilitats de xarxa (ping, dig i whois).

Canvis respecte a la v1:
  - Disseny fosc amb la identitat visual de Zevix.
  - Shodan integrat com una pestanya més. La clau de l'API es llegeix de la
    variable d'entorn SHODAN_API_KEY i ja no s'escriu dins del codi.
  - Validació de les dades (IP, domini, URL i port) abans d'executar res.
  - Les eines s'executen en un fil secundari, però la interfície només
    s'actualitza des del fil principal (cua + root.after), que és com
    tkinter ho requereix.
  - Botó per aturar l'eina en execució, consola amb colors, historial
    d'execucions i exportació dels resultats a TXT i JSON.
  - Exemple de domini corregit: iesebre.com (iesebre.cat no existeix).

Ús:
    export SHODAN_API_KEY="la_vostra_clau"     # només per a la pestanya de Shodan
    python3 zevix_audit.py
"""

import json
import os
import queue
import re
import shutil
import subprocess
import threading
import time
import tkinter as tk
from datetime import datetime
from tkinter import ttk, scrolledtext, messagebox, filedialog, font as tkfont

# ---------------------------------------------------------------------------
# Paleta i tipografia (la mateixa que la web: negre neutre, accent ambre i
# colors de gravetat)
# ---------------------------------------------------------------------------
BG = "#0B0C0D"        # fons de la finestra
SURFACE = "#141518"   # targetes i formularis
SURFACE_2 = "#1A1C20" # pestanyes inactives, camps
BORDER = "#2A2D32"
TEXT = "#E8E6E1"
MUTED = "#8D9096"
AMBER = "#F5A524"     # accent de marca
OK = "#22C55E"
WARN = "#EAB308"
ERR = "#EF4444"
CONSOLE_BG = "#050608"

EXEMPLE_DOMINI = "iesebre.com"

# Expressions regulars per validar les entrades de l'usuari
RE_IPV4 = re.compile(r"^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}(/\d{1,2})?$")
RE_DOMINI = re.compile(r"^(?=.{1,253}$)([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}$")
RE_URL = re.compile(r"^https?://[^\s/$.?#].[^\s]*$")


def es_ip(text):
    return bool(RE_IPV4.match(text))


def es_domini(text):
    return bool(RE_DOMINI.match(text))


def es_objectiu(text):
    """IP (amb rang CIDR opcional), domini o 'localhost'."""
    return es_ip(text) or es_domini(text) or text == "localhost"


def tria_font(preferides, mida, gruix="normal"):
    """Fa servir la primera font instal·lada de la llista."""
    disponibles = set(tkfont.families())
    for nom in preferides:
        if nom in disponibles:
            return (nom, mida, gruix)
    return ("TkDefaultFont", mida, gruix)


class ZevixAuditApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Zevix · Eina d'Auditoria de Seguretat")
        self.root.geometry("1000x720")
        self.root.minsize(860, 600)
        self.root.configure(bg=BG)

        self.f_mono = tria_font(["IBM Plex Mono", "JetBrains Mono", "DejaVu Sans Mono", "Consolas", "Courier New"], 10)
        self.f_mono_b = tria_font(["IBM Plex Mono", "JetBrains Mono", "DejaVu Sans Mono", "Consolas", "Courier New"], 10, "bold")
        self.f_sans = tria_font(["IBM Plex Sans", "Inter", "Ubuntu", "DejaVu Sans", "Helvetica"], 10)
        self.f_title = tria_font(["IBM Plex Mono", "JetBrains Mono", "DejaVu Sans Mono", "Consolas"], 15, "bold")

        self.cua = queue.Queue()      # missatges del fil de treball cap a la interfície
        self.proces = None            # procés del sistema en execució
        self.inici = None             # moment d'inici de l'execució actual
        self.historial = []           # execucions per exportar a JSON
        self.execucio_actual = None
        self.botons_executar = []

        self.configura_estils()
        self.crea_capcalera()
        self.crea_barra_estat()   # abans del cos, perquè quedi sempre visible a baix

        cos = tk.Frame(self.root, bg=BG)
        cos.pack(fill="both", expand=True, padx=16, pady=(0, 8))

        self.notebook = ttk.Notebook(cos, style="Zvx.TNotebook")
        self.notebook.pack(fill="x")
        self.crea_pestanya_harvester()
        self.crea_pestanya_shodan()
        self.crea_pestanya_nmap()
        self.crea_pestanya_nikto()
        self.crea_pestanya_xarxa()

        self.crea_consola(cos)

        self.escriu("Zevix · Eina d'auditoria preparada. Tria una pestanya i introdueix l'objectiu.\n", "info")
        self.escriu("Recorda: audita només sistemes inclosos a l'abast del contracte.\n", "warn")
        self.root.after(100, self.processa_cua)
        self.root.after(1000, self.actualitza_rellotge)

    # ------------------------------------------------------------------ estils
    def configura_estils(self):
        s = ttk.Style()
        s.theme_use("clam")
        s.configure(".", background=BG, foreground=TEXT, fieldbackground=SURFACE_2, bordercolor=BORDER,
                    lightcolor=BORDER, darkcolor=BORDER, font=self.f_sans)
        s.configure("Zvx.TNotebook", background=BG, borderwidth=0, tabmargins=(0, 8, 0, 0))
        s.configure("Zvx.TNotebook.Tab", background=SURFACE_2, foreground=MUTED, padding=(14, 7),
                    font=self.f_mono, borderwidth=0)
        s.map("Zvx.TNotebook.Tab", background=[("selected", SURFACE)], foreground=[("selected", AMBER)])
        s.configure("Card.TFrame", background=SURFACE)
        s.configure("Card.TLabel", background=SURFACE, foreground=TEXT, font=self.f_sans)
        s.configure("Field.TLabel", background=SURFACE, foreground=MUTED, font=self.f_mono)
        s.configure("Hint.TLabel", background=SURFACE, foreground=MUTED, font=self.f_sans)
        s.configure("TEntry", fieldbackground=SURFACE_2, foreground=TEXT, insertcolor=AMBER, padding=6)
        s.configure("TCombobox", fieldbackground=SURFACE_2, background=SURFACE_2, foreground=TEXT,
                    arrowcolor=AMBER, padding=5)
        s.map("TCombobox", fieldbackground=[("readonly", SURFACE_2)], foreground=[("readonly", TEXT)],
              selectbackground=[("readonly", SURFACE_2)], selectforeground=[("readonly", TEXT)])
        self.root.option_add("*TCombobox*Listbox.background", SURFACE_2)
        self.root.option_add("*TCombobox*Listbox.foreground", TEXT)
        self.root.option_add("*TCombobox*Listbox.selectBackground", AMBER)
        self.root.option_add("*TCombobox*Listbox.selectForeground", BG)
        s.configure("Card.TCheckbutton", background=SURFACE, foreground=TEXT, indicatorbackground=SURFACE_2)
        s.map("Card.TCheckbutton", background=[("active", SURFACE)], indicatorbackground=[("selected", AMBER)])
        s.configure("Primary.TButton", background=AMBER, foreground=BG, font=self.f_mono_b, padding=(16, 8),
                    borderwidth=0)
        s.map("Primary.TButton", background=[("disabled", "#5c4a22"), ("active", "#FFB84A")],
              foreground=[("disabled", "#2a2a2a")])
        s.configure("Ghost.TButton", background=SURFACE_2, foreground=TEXT, font=self.f_mono, padding=(12, 6),
                    borderwidth=1)
        s.map("Ghost.TButton", background=[("active", BORDER), ("disabled", SURFACE)], foreground=[("disabled", MUTED)])
        s.configure("Vertical.TScrollbar", background=SURFACE_2, troughcolor=CONSOLE_BG, arrowcolor=MUTED,
                    bordercolor=CONSOLE_BG)

    def crea_capcalera(self):
        cap = tk.Frame(self.root, bg=BG)
        cap.pack(fill="x", padx=16, pady=(14, 6))
        tk.Label(cap, text="[ZVX]", bg=BG, fg=AMBER, font=self.f_title).pack(side="left")
        tk.Label(cap, text=" ZEVIX", bg=BG, fg=TEXT, font=self.f_title).pack(side="left")
        tk.Label(cap, text="   Eina d'auditoria de seguretat · v2", bg=BG, fg=MUTED, font=self.f_mono).pack(side="left", pady=(4, 0))
        tk.Label(cap, text="Projecte Intermodular · Grup 3", bg=BG, fg=MUTED, font=self.f_mono).pack(side="right", pady=(4, 0))

    # ------------------------------------------------------------ components
    def nova_pestanya(self, titol, descripcio):
        marc = ttk.Frame(self.notebook, style="Card.TFrame", padding=(20, 16))
        self.notebook.add(marc, text=titol)
        ttk.Label(marc, text=descripcio, style="Hint.TLabel").grid(row=0, column=0, columnspan=3, sticky="w", pady=(0, 12))
        marc.columnconfigure(1, weight=1)
        return marc

    def camp(self, marc, fila, etiqueta, ajuda=None, amplada=40):
        ttk.Label(marc, text=etiqueta.upper(), style="Field.TLabel").grid(row=fila, column=0, sticky="w", pady=6, padx=(0, 14))
        entrada = ttk.Entry(marc, width=amplada, font=self.f_sans)
        entrada.grid(row=fila, column=1, sticky="w", pady=6)
        if ajuda:
            ttk.Label(marc, text=ajuda, style="Hint.TLabel").grid(row=fila, column=2, sticky="w", padx=(12, 0))
        return entrada

    def desplegable(self, marc, fila, etiqueta, valors, amplada=38):
        ttk.Label(marc, text=etiqueta.upper(), style="Field.TLabel").grid(row=fila, column=0, sticky="w", pady=6, padx=(0, 14))
        combo = ttk.Combobox(marc, values=valors, width=amplada, state="readonly", font=self.f_sans)
        combo.current(0)
        combo.grid(row=fila, column=1, sticky="w", pady=6)
        return combo

    def boto(self, marc, fila, text, ordre, columna=1):
        b = ttk.Button(marc, text=text, style="Primary.TButton", command=ordre)
        b.grid(row=fila, column=columna, sticky="w", pady=(12, 0))
        self.botons_executar.append(b)
        return b

    # -------------------------------------------------------------- pestanyes
    def crea_pestanya_harvester(self):
        m = self.nova_pestanya(" OSINT · theHarvester ", "Recull correus, subdominis i hosts públics d'un domini.")
        self.harvester_domini = self.camp(m, 1, "Domini objectiu", f"ex: {EXEMPLE_DOMINI}")
        self.harvester_font = self.desplegable(m, 2, "Font de dades", ["google", "bing", "linkedin", "all"])
        self.desa_fitxer = tk.BooleanVar(value=False)
        ttk.Checkbutton(m, text="Desa els resultats en un fitxer (HTML/XML)", variable=self.desa_fitxer,
                        style="Card.TCheckbutton", command=self.commuta_nom_fitxer).grid(row=3, column=1, sticky="w", pady=6)
        self.harvester_fitxer = self.camp(m, 4, "Nom del fitxer", "sense extensió")
        self.harvester_fitxer.config(state="disabled")
        self.boto(m, 5, "Cerca OSINT", self.executa_harvester)

    def crea_pestanya_shodan(self):
        m = self.nova_pestanya(" OSINT · Shodan ", "Reconeixement passiu: no s'envia cap paquet a la xarxa de l'objectiu.")
        self.shodan_ip = self.camp(m, 1, "IP pública", "dominis, ports i serveis")
        self.boto(m, 2, "Consulta IP", self.executa_shodan_ip)
        self.shodan_terme = self.camp(m, 3, "Servei o producte", "ex: proftpd, nginx")
        self.boto(m, 4, "Cerca global (top 5)", self.executa_shodan_cerca)
        estat = "detectada" if os.environ.get("SHODAN_API_KEY") else "NO configurada (export SHODAN_API_KEY=...)"
        ttk.Label(m, text=f"Clau de l'API: {estat}", style="Hint.TLabel").grid(row=5, column=0, columnspan=3, sticky="w", pady=(12, 0))

    def crea_pestanya_nmap(self):
        m = self.nova_pestanya(" Nmap ", "Descobriment de ports, serveis i versions.")
        self.nmap_objectiu = self.camp(m, 1, "Objectiu", "IP, rang CIDR o domini")
        self.nmap_tipus = self.desplegable(m, 2, "Tipus d'escaneig", [
            "Escaneig ràpid (-F)",
            "Serveis i versions (-sV)",
            "Complet i sistema operatiu (-A)",
            "Ports comuns (1-1024)",
        ])
        self.boto(m, 3, "Executa Nmap", self.executa_nmap)

    def crea_pestanya_nikto(self):
        m = self.nova_pestanya(" Nikto · Web ", "Auditoria de servidors web: fitxers exposats, versions i capçaleres.")
        self.nikto_objectiu = self.camp(m, 1, "Host o URL", "ex: 192.168.56.10 o http://...")
        self.nikto_port = self.camp(m, 2, "Port", "80, 443...", amplada=10)
        self.nikto_port.insert(0, "80")
        self.boto(m, 3, "Executa Nikto", self.executa_nikto)

    def crea_pestanya_xarxa(self):
        m = self.nova_pestanya(" Xarxa · Ping / DNS / Whois ", "Diagnòstic bàsic de connectivitat i de noms de domini.")
        self.xarxa_objectiu = self.camp(m, 1, "Objectiu", "IP o domini")
        self.xarxa_eina = self.desplegable(m, 2, "Eina", [
            "Ping (connectivitat)",
            "Dig (registres DNS)",
            "Whois (informació del domini)",
        ])
        self.boto(m, 3, "Executa", self.executa_xarxa)

    def crea_consola(self, pare):
        barra = tk.Frame(pare, bg=BG)
        barra.pack(fill="x", pady=(14, 6))
        tk.Label(barra, text="SORTIDA DE LA CONSOLA", bg=BG, fg=MUTED, font=self.f_mono).pack(side="left")
        ttk.Button(barra, text="Exporta JSON", style="Ghost.TButton", command=self.exporta_json).pack(side="right")
        ttk.Button(barra, text="Desa TXT", style="Ghost.TButton", command=self.desa_txt).pack(side="right", padx=6)
        ttk.Button(barra, text="Neteja", style="Ghost.TButton", command=self.neteja).pack(side="right")
        self.boto_atura = ttk.Button(barra, text="■ Atura", style="Ghost.TButton", command=self.atura, state="disabled")
        self.boto_atura.pack(side="right", padx=6)

        self.consola = scrolledtext.ScrolledText(pare, wrap=tk.WORD, bg=CONSOLE_BG, fg=TEXT, insertbackground=AMBER,
                                                 font=self.f_mono, relief="flat", borderwidth=0, padx=12, pady=10,
                                                 highlightthickness=1, highlightbackground=BORDER)
        self.consola.pack(fill="both", expand=True)
        # Colors segons el tipus de línia
        self.consola.tag_configure("cmd", foreground=AMBER, font=self.f_mono_b)
        self.consola.tag_configure("ok", foreground=OK)
        self.consola.tag_configure("err", foreground=ERR)
        self.consola.tag_configure("warn", foreground=WARN)
        self.consola.tag_configure("info", foreground=MUTED)
        self.consola.tag_configure("port", foreground=OK)

    def crea_barra_estat(self):
        barra = tk.Frame(self.root, bg=SURFACE, height=26)
        barra.pack(fill="x", side="bottom")
        self.estat = tk.Label(barra, text="● Preparat", bg=SURFACE, fg=OK, font=self.f_mono)
        self.estat.pack(side="left", padx=12, pady=4)
        self.rellotge = tk.Label(barra, text="", bg=SURFACE, fg=MUTED, font=self.f_mono)
        self.rellotge.pack(side="right", padx=12)

    # -------------------------------------------------------- utilitats de UI
    def escriu(self, text, etiqueta=None):
        self.consola.insert(tk.END, text, etiqueta)
        self.consola.see(tk.END)

    def neteja(self):
        self.consola.delete("1.0", tk.END)

    def commuta_nom_fitxer(self):
        self.harvester_fitxer.config(state="normal" if self.desa_fitxer.get() else "disabled")

    def avisa(self, missatge):
        messagebox.showwarning("Atenció", missatge)

    def estat_execucio(self, actiu, text=""):
        for b in self.botons_executar:
            b.config(state="disabled" if actiu else "normal")
        self.boto_atura.config(state="normal" if actiu else "disabled")
        if actiu:
            self.estat.config(text=f"● Executant: {text}", fg=AMBER)
        else:
            self.estat.config(text="● Preparat", fg=OK)

    def actualitza_rellotge(self):
        text = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        if self.inici:
            text = f"temps: {time.time() - self.inici:5.1f} s   ·   " + text
        self.rellotge.config(text=text)
        self.root.after(1000, self.actualitza_rellotge)

    def etiqueta_per(self, linia):
        """Tria el color d'una línia de sortida."""
        baixa = linia.lower()
        if linia.startswith("[ERROR]") or "error" in baixa or "failed" in baixa:
            return "err"
        if re.match(r"^\d+/(tcp|udp)\s+open", linia):
            return "port"
        if "warning" in baixa or "+ osvdb" in baixa or linia.startswith("+ "):
            return "warn"
        return None

    # ------------------------------------------------ execució en segon pla
    def processa_cua(self):
        """Únic lloc on es modifica la interfície amb dades del fil de treball."""
        try:
            while True:
                tipus, valor = self.cua.get_nowait()
                if tipus == "linia":
                    self.escriu(valor, self.etiqueta_per(valor))
                    if self.execucio_actual is not None:
                        self.execucio_actual["sortida"].append(valor.rstrip("\n"))
                elif tipus == "text":
                    text, etiqueta = valor
                    self.escriu(text, etiqueta)
                elif tipus == "fi":
                    durada = time.time() - self.inici if self.inici else 0
                    self.escriu(f"\n[+] Procés finalitzat en {durada:.1f} s (codi {valor}).\n", "ok" if valor == 0 else "warn")
                    self.escriu("=" * 70 + "\n", "info")
                    if self.execucio_actual is not None:
                        self.execucio_actual.update({"codi_sortida": valor, "durada_s": round(durada, 1)})
                        self.historial.append(self.execucio_actual)
                    self.execucio_actual, self.proces, self.inici = None, None, None
                    self.estat_execucio(False)
        except queue.Empty:
            pass
        self.root.after(100, self.processa_cua)

    def inicia(self, eina, ordre, funcio=None):
        """Prepara la consola i llança l'ordre (o una funció Python) en un fil."""
        self.neteja()
        self.inici = time.time()
        self.execucio_actual = {"eina": eina, "ordre": " ".join(ordre) if ordre else eina,
                                "data": datetime.now().isoformat(timespec="seconds"), "sortida": []}
        self.escriu(f"[+] Executant: {self.execucio_actual['ordre']}\n", "cmd")
        self.escriu("-" * 70 + "\n", "info")
        self.estat_execucio(True, eina)
        destinacio = funcio if funcio else (lambda: self.fil_proces(ordre))
        threading.Thread(target=destinacio, daemon=True).start()

    def fil_proces(self, ordre):
        """Fil secundari: executa l'eina del sistema i envia cada línia a la cua."""
        try:
            self.proces = subprocess.Popen(ordre, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                                           text=True, bufsize=1)
            for linia in self.proces.stdout:
                self.cua.put(("linia", linia))
            self.proces.wait()
            self.cua.put(("fi", self.proces.returncode))
        except Exception as e:
            self.cua.put(("text", (f"[ERROR] Error durant l'execució: {e}\n", "err")))
            self.cua.put(("fi", -1))

    def atura(self):
        if self.proces and self.proces.poll() is None:
            self.proces.terminate()
            self.escriu("\n[!] Execució aturada per l'usuari.\n", "warn")

    def binari(self, *noms):
        """Retorna el primer executable instal·lat de la llista, o None."""
        for nom in noms:
            if shutil.which(nom):
                return nom
        self.neteja()
        self.escriu(f"[ERROR] L'eina '{noms[0]}' no està instal·lada o no és al PATH.\n", "err")
        self.escriu("Instal·la-la abans de continuar, per exemple: sudo apt install " + noms[0].lower() + "\n", "info")
        return None

    # ---------------------------------------------------------- accions
    def executa_harvester(self):
        domini = self.harvester_domini.get().strip().lower()
        if not es_domini(domini):
            return self.avisa(f"Introdueix un domini vàlid (ex: {EXEMPLE_DOMINI}).")
        exe = self.binari("theHarvester", "theharvester")
        if not exe:
            return
        ordre = [exe, "-d", domini, "-b", self.harvester_font.get(), "-l", "500"]
        if self.desa_fitxer.get():
            nom = self.harvester_fitxer.get().strip()
            if not re.match(r"^[\w.-]+$", nom):
                return self.avisa("Introdueix un nom de fitxer sense espais ni caràcters especials.")
            ordre += ["-f", nom]
        self.inicia("theHarvester", ordre)

    def executa_nmap(self):
        objectiu = self.nmap_objectiu.get().strip()
        if not es_objectiu(objectiu):
            return self.avisa("Introdueix una IP, un rang (ex: 192.168.56.0/24) o un domini vàlid.")
        if not self.binari("nmap"):
            return
        opcions = {"Escaneig ràpid (-F)": ["-F"], "Serveis i versions (-sV)": ["-sV"],
                   "Complet i sistema operatiu (-A)": ["-A"], "Ports comuns (1-1024)": ["-p", "1-1024"]}
        self.inicia("nmap", ["nmap"] + opcions[self.nmap_tipus.get()] + [objectiu])

    def executa_nikto(self):
        objectiu = self.nikto_objectiu.get().strip()
        port = self.nikto_port.get().strip()
        if not (es_objectiu(objectiu) or RE_URL.match(objectiu)):
            return self.avisa("Introdueix un host, una IP o una URL (http:// o https://).")
        if port and not (port.isdigit() and 1 <= int(port) <= 65535):
            return self.avisa("El port ha de ser un número entre 1 i 65535.")
        if not self.binari("nikto"):
            return
        self.inicia("nikto", ["nikto", "-h", objectiu] + (["-p", port] if port else []))

    def executa_xarxa(self):
        objectiu = self.xarxa_objectiu.get().strip()
        if not es_objectiu(objectiu):
            return self.avisa("Introdueix una IP o un domini vàlid.")
        eina = self.xarxa_eina.get()
        if eina.startswith("Ping"):
            ordre = ["ping", "-c", "4", objectiu]
        elif eina.startswith("Dig"):
            ordre = ["dig", objectiu]
        else:
            ordre = ["whois", objectiu]
        if self.binari(ordre[0]):
            self.inicia(ordre[0], ordre)

    # ---------------------------------------------------------- Shodan
    def api_shodan(self):
        """Comprova la llibreria i la clau. Retorna el client o None."""
        try:
            import shodan
        except ImportError:
            self.neteja()
            self.escriu("[ERROR] Falta la llibreria de Shodan: sudo apt install python3-shodan\n", "err")
            return None
        clau = os.environ.get("SHODAN_API_KEY")
        if not clau:
            self.neteja()
            self.escriu("[ERROR] No s'ha trobat la variable d'entorn SHODAN_API_KEY.\n", "err")
            self.escriu("Configura-la abans d'obrir l'eina:  export SHODAN_API_KEY=\"la_vostra_clau\"\n", "info")
            self.escriu("Així la clau no queda escrita dins del codi ni al repositori.\n", "info")
            return None
        return shodan.Shodan(clau)

    def executa_shodan_ip(self):
        ip = self.shodan_ip.get().strip()
        if not es_ip(ip) or "/" in ip:
            return self.avisa("Introdueix una adreça IP pública (ex: 8.8.8.8).")
        api = self.api_shodan()
        if api:
            self.inicia("shodan-host", ["shodan", "host", ip], lambda: self.fil_shodan_ip(api, ip))

    def fil_shodan_ip(self, api, ip):
        try:
            host = api.host(ip)
            self.cua.put(("linia", f"IP consultada : {host.get('ip_str', ip)}\n"))
            noms = host.get("hostnames", [])
            self.cua.put(("linia", f"Noms de domini: {', '.join(noms) if noms else 'cap domini associat'}\n"))
            self.cua.put(("linia", f"Organització  : {host.get('org', 'desconeguda')}\n"))
            self.cua.put(("linia", "Ports oberts i serveis detectats:\n"))
            for item in host.get("data", []):
                servei = f"{item.get('product', 'servei desconegut')} {item.get('version', '')}".strip()
                self.cua.put(("linia", f"{item.get('port')}/tcp open  {servei}\n"))
            self.cua.put(("fi", 0))
        except Exception as e:
            self.cua.put(("text", (f"[ERROR] Shodan: {e}\n", "err")))
            self.cua.put(("fi", 1))

    def executa_shodan_cerca(self):
        terme = self.shodan_terme.get().strip()
        if not terme:
            return self.avisa("Introdueix un servei o producte a cercar.")
        api = self.api_shodan()
        if api:
            self.inicia("shodan-search", ["shodan", "search", terme], lambda: self.fil_shodan_cerca(api, terme))

    def fil_shodan_cerca(self, api, terme):
        try:
            res = api.search(terme)
            self.cua.put(("linia", f"Total d'equips exposats trobats: {res.get('total', 0)}\n"))
            for m in res.get("matches", [])[:5]:
                self.cua.put(("linia", f"IP: {m.get('ip_str', '?'):<15} | Port: {str(m.get('port', '?')):<5} | Org: {m.get('org', '?')}\n"))
            self.cua.put(("fi", 0))
        except Exception as e:
            self.cua.put(("text", (f"[ERROR] Shodan (el pla gratuït no permet algunes cerques): {e}\n", "err")))
            self.cua.put(("fi", 1))

    # ---------------------------------------------------------- exportació
    def desa_txt(self):
        cami = filedialog.asksaveasfilename(defaultextension=".txt", filetypes=[("Text", "*.txt")],
                                            initialfile=f"zevix_sortida_{datetime.now():%Y%m%d_%H%M}.txt")
        if cami:
            with open(cami, "w", encoding="utf-8") as f:
                f.write(self.consola.get("1.0", tk.END))
            self.estat.config(text=f"● Desat: {os.path.basename(cami)}", fg=OK)

    def exporta_json(self):
        if not self.historial:
            return self.avisa("Encara no hi ha cap execució acabada per exportar.")
        cami = filedialog.asksaveasfilename(defaultextension=".json", filetypes=[("JSON", "*.json")],
                                            initialfile=f"zevix_resultats_{datetime.now():%Y%m%d_%H%M}.json")
        if cami:
            dades = {"auditor": "Zevix Cybersecurity", "eina": "zevix_audit.py v2",
                     "exportat": datetime.now().isoformat(timespec="seconds"), "execucions": self.historial}
            with open(cami, "w", encoding="utf-8") as f:
                json.dump(dades, f, ensure_ascii=False, indent=2)
            self.estat.config(text=f"● Exportat: {os.path.basename(cami)}", fg=OK)


if __name__ == "__main__":
    root = tk.Tk()
    app = ZevixAuditApp(root)
    root.mainloop()
