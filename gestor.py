import json
import os

ARCHIVO_PROD = 'productos.json'
ARCHIVO_OFERTAS = 'ofertas.json'

def limpiar_pantalla():
    os.system('cls' if os.name == 'nt' else 'clear')

def cargar_json(ruta, default):
    try:
        with open(ruta, 'r', encoding='utf-8') as f: return json.load(f)
    except: return default

def guardar_json(ruta, datos):
    with open(ruta, 'w', encoding='utf-8') as f: json.dump(datos, f, indent=4, ensure_ascii=False)

def pedir_categoria():
    print("\n--- SELECCIÓN DE SECCIÓN ---")
    print("1. Hombres\n2. Mujeres\n3. Unisex")
    op = input("Selecciona un número (1/2/3): ")
    return "hombres" if op == '1' else "mujeres" if op == '2' else "unisex"

def gestionar_ofertas():
    ofertas = cargar_json(ARCHIVO_OFERTAS, {"hombres": {}, "mujeres": {}, "unisex": {}})

    while True:
        limpiar_pantalla()
        print("\n--- 🏷️ GESTIÓN DE BANNERS DE OFERTAS ---")
        for cat in ["hombres", "mujeres", "unisex"]:
            data = ofertas.get(cat, {"activa": False, "texto": ""})
            estado = "🟢 ACTIVA" if data.get('activa') else "🔴 INACTIVA"
            print(f"- [{cat.upper()}]: {estado} | Banner: '{data.get('texto', '')}'")

        print("\n1. Encender / Modificar Banner de Oferta")
        print("2. Apagar un Banner de Oferta")
        print("3. Volver al menú principal")
        op = input("Elige una opción: ")

        if op == '1':
            cat = pedir_categoria()
            texto = input("Escribe el texto publicitario que saldrá en la web: ")
            ofertas[cat] = {"activa": True, "texto": texto}
            guardar_json(ARCHIVO_OFERTAS, ofertas)
            input("\n✅ Banner publicitario activado. Enter...")
        elif op == '2':
            cat = pedir_categoria()
            if cat in ofertas:
                ofertas[cat]["activa"] = False
                guardar_json(ARCHIVO_OFERTAS, ofertas)
                input("\n✅ Banner desactivado. Enter...")
        elif op == '3': break

def menu_principal():
    while True:
        limpiar_pantalla()
        datos = cargar_json(ARCHIVO_PROD, {"estado": "abierto", "productos": []})
        
        print("\n==========================================")
        print("  ALQIMIA LUMA: PANEL DE CONTROL PERFUMES ")
        print("==========================================")
        print(f"ESTADO DE LA TIENDA: {datos.get('estado', 'abierto').upper()}")
        print("------------------------------------------")
        print("1. Abrir / Cerrar Tienda (Bloquea acceso a clientes)")
        print("2. Ver Inventario Completo")
        print("3. Añadir Nuevo Perfume")
        print("4. Modificar Precio o Stock")
        print("5. Eliminar Perfume")
        print("6. 🏷️  Gestionar Banners de Ofertas")
        print("7. 🚀 GUARDAR Y SUBIR A INTERNET (Git Push)")
        print("8. ❌ Salir")
        
        op = input("\nElige una opción: ")
        
        if op == '1':
            nuevo_estado = "cerrado" if datos.get('estado') == "abierto" else "abierto"
            datos['estado'] = nuevo_estado
            guardar_json(ARCHIVO_PROD, datos)
            input(f"\n✅ Tienda cambiada a {nuevo_estado.upper()}. Enter...")
            
        elif op == '2':
            limpiar_pantalla()
            print("\n--- INVENTARIO DE PERFUMES ---")
            prods = datos.get('productos', [])
            if not prods: print("[ Catálogo vacío ]")
            for i, p in enumerate(prods):
                stk = f"{p['stock']} uds" if p['stock'] > 0 else "AGOTADO"
                print(f"ID: {i} | [{p['subseccion'].upper()}] {p['nombre']} | Precio: ${p['precio']} | Stock: {stk}")
            input("\nPresiona Enter para regresar...")
                
        elif op == '3':
            limpiar_pantalla()
            print("\n--- AÑADIR NUEVO PERFUME ---")
            sub = pedir_categoria()
            nombre = input("\nNombre de la fragancia: ")
            try:
                precio = int(input("Precio en pesos: "))
                stock = int(input("Stock inicial (unidades): "))
            except:
                input("\n❌ Error: Debes ingresar números enteros. Enter...")
                continue
            desc = input("Descripción persuasiva: ")
            
            imagen_input = input("Nombre exacto de la foto con su formato (ej. sauvage.jpg, foto1.png) [Enter para usar ✨]: ").strip()
            if imagen_input == "":
                imagen = "✨"
            else:
                imagen = imagen_input
            
            datos['productos'].append({
                "subseccion": sub, "nombre": nombre, "precio": precio, 
                "stock": stock, "desc": desc, "imagen": imagen
            })
            guardar_json(ARCHIVO_PROD, datos)
            input(f"\n✅ {nombre} añadido con éxito. Enter...")
            
        elif op == '4':
            limpiar_pantalla()
            print("\n--- MODIFICAR PERFUME ---")
            prods = datos.get('productos', [])
            if not prods: input("Catálogo vacío. Enter..."); continue
            for i, p in enumerate(prods):
                print(f"[{i}] {p['nombre']} | ${p['precio']} | Stock: {p['stock']}")
            try:
                idx = int(input("\nIngresa el ID del perfume a modificar: "))
                if 0 <= idx < len(prods):
                    p_nuevo = input(f"Nuevo precio (actual ${prods[idx]['precio']}) [Enter para saltar]: ")
                    s_nuevo = input(f"Nuevo stock (actual {prods[idx]['stock']}) [Enter para saltar]: ")
                    if p_nuevo: datos['productos'][idx]['precio'] = int(p_nuevo)
                    if s_nuevo: datos['productos'][idx]['stock'] = int(s_nuevo)
                    guardar_json(ARCHIVO_PROD, datos)
                    input("\n✅ Cambios guardados. Enter...")
            except: input("\n❌ Error al procesar. Enter...")
            
        elif op == '5':
            limpiar_pantalla()
            print("\n--- ELIMINAR PERFUME ---")
            prods = datos.get('productos', [])
            if not prods: input("Catálogo vacío. Enter..."); continue
            for i, p in enumerate(prods):
                print(f"[{i}] {p['nombre']} | Sección: {p['subseccion']}")
            try:
                idx = int(input("\nIngresa el ID para eliminar definitivamente: "))
                if 0 <= idx < len(prods):
                    eliminado = datos['productos'].pop(idx)
                    guardar_json(ARCHIVO_PROD, datos)
                    input(f"\n🗑️ {eliminado['nombre']} eliminado del sistema. Enter...")
            except: input("\n❌ Error. Enter...")
            
        elif op == '6': gestionar_ofertas()
        elif op == '7':
            limpiar_pantalla()
            print("🚀 Sincronizando con el servidor central...")
            os.system('git add . && git commit -m "Actualizacion Inventario Alqimia Luma" && git push')
            input("\n✅ ¡Todo subido a internet con éxito! Enter...")
        elif op == '8': break

if __name__ == "__main__": menu_principal()