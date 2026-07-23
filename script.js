let carrito = {}; 
let totalPrecio = 0; let totalArticulos = 0;
let catalogoPerfumes = [];
let ofertasGlobales = {};

// Quitar la pantalla de bienvenida interactiva
function entrarTienda() {
    document.getElementById('pantalla-bienvenida').classList.add('oculta');
    document.body.classList.remove('bloqueado');
}

function crearFondoMagico() {
    let contenedor = document.getElementById('contenedor-magico');
    let colores = ["%23EFBF04", "%232B0071"]; 
    let esCelular = window.innerWidth <= 600;
    let cantidadEstrellas = esCelular ? 15 : 40; 

    for (let i = 0; i < cantidadEstrellas; i++) {
        let estrella = document.createElement('div');
        estrella.className = 'estrella-js';
        estrella.style.top = Math.random() * 100 + '%'; 
        estrella.style.left = Math.random() * 100 + '%'; 
        let size = esCelular ? (Math.random() * 30 + 15) : (Math.random() * 70 + 25); 
        estrella.style.width = size + 'px'; estrella.style.height = size + 'px';
        let color = colores[Math.floor(Math.random() * colores.length)];
        estrella.style.backgroundImage = `url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12 0 Q12 12 24 12 Q12 12 12 24 Q12 12 0 12 Q12 12 12 0 Z' fill='${color}'/%3E%3C/svg%3E")`;
        estrella.style.animationDelay = (Math.random() * 5) + 's'; 
        contenedor.appendChild(estrella);
    }
}
crearFondoMagico();

Promise.all([
    fetch('ofertas.json').then(r => r.json()),
    fetch('productos.json').then(r => r.json())
]).then(([datosOfertas, datosProductos]) => {
    ofertasGlobales = datosOfertas || {};
    colocarEtiquetasOferta();
    
    if (datosProductos.estado === "cerrado") {
        document.getElementById("contenedor-catalogo").innerHTML = `
            <div class="contenedor-agotado">
                <h1 class="texto-agotado-gigante">CERRADO</h1>
                <p class="subtexto-agotado">Alqimia Luma no está recibiendo pedidos en este momento.<br>Disculpa las molestias.</p>
            </div>`;
        document.querySelector('.menu-categorias').style.pointerEvents = "none";
        document.querySelector('.menu-categorias').style.opacity = "0.5";
    } else {
        catalogoPerfumes = datosProductos.productos;
        filtrarSeccion('todos'); 
    }
}).catch(e => console.log("Error cargando base de datos."));

function colocarEtiquetasOferta() {
    ['mujeres', 'hombres', 'unisex'].forEach(cat => {
        if(ofertasGlobales[cat] && ofertasGlobales[cat].activa) {
            let btn = document.getElementById(`btn-${cat}`);
            if(btn) btn.innerHTML += ` <span class="etiqueta-oferta">🔥</span>`;
        }
    });
}

function renderizarCatalogo(productosArray, seccionActual) {
    let contenedor = document.getElementById("contenedor-catalogo");
    contenedor.innerHTML = ""; 
    
    if (seccionActual !== 'todos' && ofertasGlobales[seccionActual] && ofertasGlobales[seccionActual].activa) {
        contenedor.innerHTML += `<div class="banner-oferta-contenedor"><div class="banner-oferta-texto">${ofertasGlobales[seccionActual].texto}</div></div>`;
    }
    
    if(productosArray.length === 0) {
        contenedor.innerHTML += `
            <div class="contenedor-agotado">
                <h1 class="texto-agotado-gigante">AGOTADO</h1>
                <p class="subtexto-agotado">Nuestros alquimistas están elaborando nuevas esencias mágicas.</p>
            </div>`;
        return;
    }

    productosArray.forEach(producto => {
        let esAgotado = producto.stock <= 0 ? "agotado" : "";
        let botonHTML = producto.stock > 0 ? `<button class="btn-comprar" onclick="agregarAlCarrito('${producto.nombre}', ${producto.precio})">Comprar ahora</button>` : `<button class="btn-comprar" disabled>No disponible</button>`;
        let textoStock = producto.stock > 0 ? `Disponibles: ${producto.stock} uds` : "Agotado";
        
        contenedor.innerHTML += `
            <div class="tarjeta ${esAgotado}">
                <p style="font-size:11px; color:#666; text-transform:uppercase; font-weight:bold; letter-spacing:1px; margin-bottom:5px;">Para: ${producto.subseccion}</p>
                <h2>${producto.nombre}</h2>
                <div class="contenedor-img-perfume">
                    <img src="${producto.imagen}" alt="${producto.nombre}" onerror="this.onerror=null; this.src='https://via.placeholder.com/150/fcfcfc/2B0071?text=✨';">
                </div>
                <p class="desc">${producto.desc}</p>
                <p class="precio">$${producto.precio}</p>
                <p class="stock">${textoStock}</p>
                ${botonHTML}
            </div>
        `;
    });
}

function filtrarSeccion(subseccion) {
    document.querySelectorAll('.btn-cat').forEach(btn => btn.classList.remove('activo'));
    let btnActivo = document.getElementById(`btn-${subseccion}`);
    if(btnActivo) btnActivo.classList.add('activo');

    let titulos = { 
        'todos': 'ALQIMIA LUMA', 
        'mujeres': 'ESENCIAS PARA MUJER', 
        'hombres': 'FRAGANCIAS PARA HOMBRE',
        'unisex': 'FRAGANCIAS UNISEX'
    };
    document.getElementById("titulo-tienda").innerText = titulos[subseccion];

    if (subseccion === 'todos') {
        renderizarCatalogo(catalogoPerfumes, subseccion);
    } else {
        let filtrados = catalogoPerfumes.filter(p => p.subseccion === subseccion);
        renderizarCatalogo(filtrados, subseccion);
    }
}

function agregarAlCarrito(nombre, precio) {
    if (carrito[nombre]) {
        carrito[nombre].cantidad += 1;
    } else {
        carrito[nombre] = { precio: precio, cantidad: 1 };
    }
    totalPrecio += precio; 
    totalArticulos += 1;
    document.getElementById("contador").innerText = totalArticulos;
}

function abrirCarrito() {
    let divLista = document.getElementById("lista-carrito"); 
    divLista.innerHTML = ""; 
    if (totalArticulos === 0) {
        divLista.innerHTML = "<p>Aún no has agregado ninguna esencia mágica.</p>";
    } else {
        for (let nombre in carrito) {
            let item = carrito[nombre];
            divLista.innerHTML += `
                <div class="item-carrito">
                    <span>${item.cantidad}x ${nombre}</span>
                    <span>$${item.precio * item.cantidad}</span>
                </div>`;
        }
    }
    document.getElementById("total-precio").innerText = totalPrecio;
    document.getElementById("modal-carrito").style.display = "block";
}
function cerrarCarrito() { document.getElementById("modal-carrito").style.display = "none"; }

function enviarPedido() {
    if (totalArticulos === 0) return alert("Agrega productos antes de enviar.");
    let mensaje = "🛍️ *NUEVO PEDIDO DE ALQIMIA LUMA*%0A%0A";
    for (let nombre in carrito) { 
        mensaje += `✨ ${carrito[nombre].cantidad}x ${nombre}%0A`; 
    }
    mensaje += "%0A*Total a pagar: $" + totalPrecio + "*";
    window.open("https://wa.me/525649314335?text=" + mensaje, "_blank");
}