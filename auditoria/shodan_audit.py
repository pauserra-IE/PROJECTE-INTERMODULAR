"""
Zevix Cybersecurity · Reconeixement passiu amb Shodan (versió de terminal)

La clau de l'API ja no s'escriu dins del codi: es llegeix de la variable
d'entorn SHODAN_API_KEY.

    export SHODAN_API_KEY="la_vostra_clau"
    python3 shodan_audit.py

La mateixa funcionalitat està integrada a la pestanya "OSINT · Shodan" de
zevix_audit.py.
"""
import ipaddress
import os
import sys

try:
    import shodan
except ImportError:
    print("[-] Falta la llibreria de Shodan: sudo apt install python3-shodan")
    sys.exit(1)


def init_api():
    """Inicialitza la connexió amb l'API de Shodan a partir de la variable d'entorn."""
    clau = os.environ.get("SHODAN_API_KEY")
    if not clau:
        print("[-] No s'ha trobat la variable d'entorn SHODAN_API_KEY.")
        print('    Configura-la així: export SHODAN_API_KEY="la_vostra_clau"')
        sys.exit(1)
    return shodan.Shodan(clau)


def ip_lookup_and_banner_grabbing(api):
    """Demana una IP i mostra els dominis, els ports oberts i els serveis (banner grabbing)."""
    ip = input("\n[>] Introdueix l'adreça IP pública a consultar (ex: 8.8.8.8): ").strip()
    try:
        ipaddress.ip_address(ip)
    except ValueError:
        print("[-] Adreça IP no vàlida.")
        return
    try:
        print(f"\n[*] Consultant l'API de Shodan per a la IP: {ip}...")
        host = api.host(ip)
        print("\n" + "=" * 50)
        print(f"IP Consultada : {host.get('ip_str', ip)}")
        hostnames = host.get("hostnames", [])
        print(f"Noms de domini: {', '.join(hostnames) if hostnames else 'Cap domini associat'}")
        print("-" * 50)
        print("Ports oberts i serveis detectats:")
        for item in host.get("data", []):
            servei = f"{item.get('product', 'Servei desconegut')} {item.get('version', '')}".strip()
            print(f" - Port {item.get('port')}: {servei}")
        print("=" * 50 + "\n")
    except shodan.APIError as e:
        print(f"\n[-] Error de l'API de Shodan: {e}")


def service_search(api):
    """Cerca global d'un servei o producte i mostra els 5 primers resultats."""
    terme = input("\n[>] Introdueix el servei o producte a cercar (ex: proftpd, nginx, webcam): ").strip()
    if not terme:
        return
    try:
        print(f"\n[*] Cercant '{terme}' a Shodan (primers 5 resultats)...")
        resultats = api.search(terme)
        print("\n" + "=" * 70)
        print(f"Total d'equips exposats trobats al món: {resultats.get('total', 0)}")
        print("-" * 70)
        for match in resultats.get("matches", [])[:5]:
            print(f"IP: {match.get('ip_str', '?'):<15} | Port: {str(match.get('port', 'N/A')):<5} | Org/ISP: {match.get('org', '?')}")
        print("=" * 70 + "\n")
    except shodan.APIError as e:
        print(f"\n[-] Error de l'API de Shodan (el pla gratuït no permet algunes cerques): {e}")


def main_menu():
    api = init_api()
    while True:
        print("\n=== EINA DE RECONEIXEMENT PASSIU (SHODAN) ===")
        print("1. Consulta d'Host i Identificació de Serveis (IP Lookup)")
        print("2. Cerca global de Serveis Específics")
        print("3. Sortir")
        opcio = input("\nSelecciona una opció (1-3): ").strip()
        if opcio == "1":
            ip_lookup_and_banner_grabbing(api)
        elif opcio == "2":
            service_search(api)
        elif opcio == "3":
            print("\n[*] Tancant el programa. Fins aviat!")
            break
        else:
            print("\n[-] Opció no vàlida. Introdueix 1, 2 o 3.")


if __name__ == "__main__":
    main_menu()
