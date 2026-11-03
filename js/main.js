/* ------------------------------------- */
/* ----// ELEMENTOS DE LA PÁGINA \\----- */
/* ------------------------------------- */

/* Aquí "agarramos" las piezas del index.html para poder controlarlas */
const botones = document.querySelectorAll('.nav-btn');
const paneles = document.querySelectorAll('.panel');
const etiqueta = document.getElementById('current-section');
const etiquetaCuadro = document.getElementById('badge-label');
const pasosCuadro = document.getElementById('badge-steps');
const cuadroSeccion = document.getElementById('section-badge');
const menu = document.getElementById('sidebar');
const botonMenu = document.getElementById('menu-toggle');
const botonCerrar = document.getElementById('menu-close');
const fondo = document.getElementById('backdrop');
const encabezado = document.getElementById('topbar');
const pantallaCarga = document.getElementById('loader');
const cargaCamara = document.getElementById('loader-camera');
const cargaTitulo = document.getElementById('loader-title');
const cargaLineas = document.getElementById('loader-lines');
const cargaPorcentaje = document.getElementById('loader-pct');
const portales = document.getElementById('portals');
const portalAzul = document.getElementById('portal-azul');
const portalNaranja = document.getElementById('portal-naranja');
const formularioAcceso = document.getElementById('gate-form');
const panelAcceso = document.getElementById('gate-form');
const campoClave = document.getElementById('gate-input');
const textoError = document.getElementById('gate-error');
const formularioSubida = document.getElementById('upload-form');
const campoFoto = document.getElementById('foto-input');
const vistaPrevia = document.getElementById('foto-preview');
const textoDrop = document.getElementById('drop-text');
const campoAutor = document.getElementById('autor-input');
const campoDescripcion = document.getElementById('desc-input');
const botonSubir = document.getElementById('subir-btn');
const estadoSubida = document.getElementById('subida-estado');
const galeria = document.getElementById('galeria');
const estadoGaleria = document.getElementById('galeria-estado');

/* Lista de secciones, en el mismo orden que los botones del menú */
const secciones = Array.from(botones).map(b => b.dataset.target);
let seccionActual = secciones[0];


/* --------------------------------------------- */
/* ----// TEXTOS DE LA PANTALLA DE CARGA \\----- */
/* --------------------------------------------- */

/* Lo que dice la pantalla de carga de cada sección. Para añadir una sección nueva,
   copia un bloque y usa el mismo nombre que le pusiste en data-target del menú */
const CARGAS = {
    inicio: { variante: 'normal', titulo: 'Inicio', lineas: ['Abriendo portales', 'Calibrando la cámara', 'Sistemas listos'] },
    ideas: { variante: 'caida', titulo: 'Ideas', lineas: ['Reuniendo ideas', 'Ordenando experimentos', 'Cámara lista'] },
    recuerdos: { variante: 'orbita', titulo: 'Recuerdos', lineas: ['Abriendo el archivo', 'Revelando fotografías', 'Cámara lista'] },
    creditos: { variante: 'fusion', titulo: 'Créditos', lineas: ['Buscando al creador', 'Verificando firmas', 'Cámara lista'] }
};

const TIEMPO_PRIMERA_CARGA = 2600; /* milisegundos mínimos al entrar a la página */
const TIEMPO_CAMBIO = 1600; /* milisegundos al cambiar de sección */


/* -------------------------------- */
/* ----// PANTALLA DE CARGA \\----- */
/* -------------------------------- */

let cargando = true; /* mientras sea true no se puede cambiar de sección */
const carga = { inicio: 0, duracion: 1, listo: true, activa: false }; /* estado del avance de la carga */

function numeroDe(id) {
    return String(secciones.indexOf(id) + 1).padStart(2, '0'); /* 1 -> "01" */
}

/* ------------------------------------------------ */
/* --// preparar los textos antes de mostrarla \\-- */
/* ------------------------------------------------ */

function prepararCarga(id, duracion, esperarPagina) {
    const datos = CARGAS[id] || { titulo: id, lineas: ['Cargando'] };
    cargaCamara.textContent = 'Cámara ' + numeroDe(id);
    cargaTitulo.textContent = datos.titulo;
    pantallaCarga.dataset.variante = datos.variante || 'normal'; /* decide qué diseño usa la carga */

    cargaLineas.innerHTML = '';
    datos.lineas.forEach((texto, i) => {
        const linea = document.createElement('li');
        linea.style.animationDelay = (duracion * 0.8 * i / datos.lineas.length) + 'ms'; /* aparecen una tras otra */
        const nombre = document.createElement('span');
        nombre.textContent = texto;
        const ok = document.createElement('b');
        ok.textContent = 'OK';
        linea.append(nombre, ok);
        cargaLineas.appendChild(linea);
    });

    carga.inicio = performance.now();
    carga.duracion = duracion;
    carga.listo = !esperarPagina; /* en la primera carga, no llega al 100% hasta que la página termine de cargar */
    carga.activa = true;
    requestAnimationFrame(pasoCarga);
}

/* -------------------------------------------- */
/* --// avance de la barra y el porcentaje \\-- */
/* -------------------------------------------- */

function pintarAvance(avance) {
    pantallaCarga.style.setProperty('--avance', avance); /* la parte azul de la barra usa este valor (0 a 1) */
    cargaPorcentaje.textContent = Math.round(avance * 100) + '%';
}

function pasoCarga(ahora) {
    if (!carga.activa) return;
    let avance = Math.min(1, (ahora - carga.inicio) / carga.duracion);
    if (!carga.listo) avance = Math.min(avance, 0.95); /* espera en 95% hasta que la página termine de cargar */
    pintarAvance(avance);
    requestAnimationFrame(pasoCarga);
}

/* -------------------- */
/* --// terminarla \\-- */
/* -------------------- */

function terminarCarga() {
    carga.activa = false;
    pintarAvance(1); /* llena la barra al 100% */
    pantallaCarga.classList.add('is-done'); /* los portales se agrandan y todo se desvanece */
    setTimeout(() => {
        pantallaCarga.classList.add('is-hidden'); /* luego se quita del todo */
        cargando = false;
        if (document.documentElement.classList.contains('is-locked')) campoClave.focus(); /* si está bloqueada, deja listo el campo de clave */
    }, 1000);
}

/* ------------------------------------ */
/* --// primera carga de la página \\-- */
/* ------------------------------------ */

let inicioCarga = 0;

function iniciarPrimeraCarga() {
    cargando = true;
    inicioCarga = Date.now();
    pantallaCarga.classList.remove('is-done', 'is-hidden');
    prepararCarga(seccionActual, TIEMPO_PRIMERA_CARGA, document.readyState !== 'complete');
    if (document.readyState === 'complete') finalizarCuandoListo(); /* la página ya cargó (por ejemplo, después de la clave) */
}

function finalizarCuandoListo() {
    carga.listo = true; /* la barra puede llegar al 100% */
    const faltante = Math.max(0, TIEMPO_PRIMERA_CARGA - (Date.now() - inicioCarga));
    setTimeout(terminarCarga, faltante);
}

window.addEventListener('load', () => { if (carga.activa) finalizarCuandoListo(); }); /* la página terminó de cargar */


/* -------------------------------------------- */
/* ----// MENÚ LATERAL (abrir y cerrar) \\----- */
/* -------------------------------------------- */

let menuAbierto = false;

function abrirMenu(abrir) {
    menuAbierto = abrir;
    menu.classList.toggle('is-open', abrir);
    fondo.classList.toggle('is-open', abrir);
    botonMenu.setAttribute('aria-expanded', abrir);
    posicionarEncabezado(); /* con el menú abierto, el encabezado se queda quieto */
}

/* ----------------------------------- */
/* --// qué abre o cierra el menú \\-- */
/* ----------------------------------- */

botonMenu.addEventListener('click', () => abrirMenu(true));
botonCerrar.addEventListener('click', () => abrirMenu(false));
fondo.addEventListener('click', () => abrirMenu(false));
document.addEventListener('keydown', e => { if (e.key === 'Escape') abrirMenu(false); });


/* ---------------------------------- */
/* ----// CAMBIO DE SECCIONES \\----- */
/* ---------------------------------- */

/* --- poner la sección en pantalla (sin pantalla de carga) --- */
function activarSeccion(id) {
    seccionActual = id;
    paneles.forEach(p => p.classList.toggle('is-active', p.id === id));
    botones.forEach(b => {
        const activo = b.dataset.target === id;
        b.classList.toggle('is-active', activo);
        if (activo) etiqueta.textContent = b.dataset.label; /* nombre que sale en el cuadro del encabezado */
    });
    etiquetaCuadro.textContent = 'Cámara ' + numeroDe(id);
    Array.from(pasosCuadro.children).forEach((paso, i) => paso.classList.toggle('is-on', secciones[i] === id));
    animarCuadro();
    try { history.replaceState(null, '', '#' + id); } catch (e) {} /* guarda la sección en la dirección (#ideas) */
    revisarScroll(); /* el encabezado se ajusta a la nueva sección */
    if (id === 'recuerdos') cargarGaleria(); /* al entrar a Recuerdos se actualiza la galería */
}

/* --------------------------------------------------- */
/* --// ir a otra sección (con pantalla de carga) \\-- */
/* --------------------------------------------------- */

function irASeccion(id) {
    abrirMenu(false);
    if (cargando || id === seccionActual) return; /* si ya estás ahí, no hace nada */
    cargando = true;
    prepararCarga(id, TIEMPO_CAMBIO);
    pantallaCarga.classList.remove('is-done', 'is-hidden');
    setTimeout(() => activarSeccion(id), 450); /* el cambio ocurre cuando la carga ya tapa todo */
    setTimeout(terminarCarga, TIEMPO_CAMBIO);
}

botones.forEach(b => b.addEventListener('click', () => irASeccion(b.dataset.target)));

/* ------------------------------------------------- */
/* --// efecto del cuadro al cambiar de sección \\-- */
/* ------------------------------------------------- */

function animarCuadro() {
    cuadroSeccion.classList.remove('is-switching');
    void cuadroSeccion.offsetWidth; /* truco para poder repetir la animación */
    cuadroSeccion.classList.add('is-switching');
}


/* --------------------------------------------- */
/* ----// ENCABEZADO (cuándo se muestra) \\----- */
/* --------------------------------------------- */

/* Regla: el encabezado vive arriba de la página y se va con el scroll (sin seguirte).
   Reaparece si pones el mouse en el borde superior, si abres el menú, o al subir con el scroll. */
let desplazamiento = 0; /* cuánto se ha bajado en la sección activa */
let ratonArriba = false; /* ¿el mouse está en el borde superior? */
let estabaFijado = false;
let temporizador;

function posicionarEncabezado() {
    const fijado = ratonArriba || menuAbierto;
    if (fijado !== estabaFijado) { /* movimiento suave solo cuando aparece o se va por el mouse */
        encabezado.classList.add('is-animating');
        clearTimeout(temporizador);
        temporizador = setTimeout(() => encabezado.classList.remove('is-animating'), 350);
        estabaFijado = fijado;
    }
    const altura = encabezado.offsetHeight;
    const corrimiento = fijado ? 0 : Math.min(desplazamiento, altura);
    encabezado.style.setProperty('--desplazamiento', corrimiento);
    encabezado.classList.toggle('is-gone', corrimiento >= altura);
}

/* ------------------------------------- */
/* --// scroll de la sección activa \\-- */
/* ------------------------------------- */

function revisarScroll() {
    desplazamiento = document.querySelector('.panel.is-active').scrollTop;
    medirBarra();
    posicionarEncabezado();
}
paneles.forEach(p => p.addEventListener('scroll', revisarScroll));

/* --------------------------------------------------------------------- */
/* --// barra de desplazamiento (para que el encabezado no la tape) \\-- */
/* --------------------------------------------------------------------- */

function medirBarra() {
    const activo = document.querySelector('.panel.is-active');
    const ancho = activo.offsetWidth - activo.clientWidth; /* ancho de la barra; 0 si no hay scroll */
    encabezado.style.setProperty('--barra', ancho + 'px');
}
window.addEventListener('resize', revisarScroll);
window.addEventListener('load', revisarScroll);

/* ------------------------------------ */
/* --// mouse en el borde superior \\-- */
/* ------------------------------------ */

document.addEventListener('mousemove', e => {
    const zona = estabaFijado ? encabezado.offsetHeight : 20; /* 20 = zona sensible en píxeles */
    ratonArriba = e.clientY < zona;
    posicionarEncabezado();
});


/* ------------------------------------ */
/* ----// PORTALES INTERACTIVOS \\----- */
/* ------------------------------------ */

/* Al tocar un portal, una esfera cae dentro de él y sale por el otro */
function lanzarEsfera(entrada, salida) {
    const caja = portales.getBoundingClientRect();
    const a = entrada.getBoundingClientRect();
    const b = salida.getBoundingClientRect();
    const ax = a.left - caja.left + a.width / 2; /* centro del portal de entrada */
    const ay = a.top - caja.top + a.height / 2;
    const bx = b.left - caja.left + b.width / 2; /* centro del portal de salida */
    const by = b.top - caja.top + b.height / 2;
    const dir = bx >= ax ? 1 : -1; /* hacia dónde sale la esfera */

    const esfera = document.createElement('div');
    esfera.className = 'orb';
    portales.appendChild(esfera);

    /* -------------------------------------------- */
    /* --// la esfera cae al portal de entrada \\-- */
    /* -------------------------------------------- */

    const caida = esfera.animate([
        { transform: `translate(${ax}px, ${ay - 130}px) scale(1)`, opacity: 1 },
        { transform: `translate(${ax}px, ${ay}px) scale(.1)`, opacity: 1 }
    ], { duration: 450, easing: 'ease-in', fill: 'forwards' });

    /* -------------------------------------- */
    /* --// y sale disparada por el otro \\-- */
    /* -------------------------------------- */

    caida.finished.then(() => esfera.animate([
        { transform: `translate(${bx}px, ${by}px) scale(.1)`, opacity: 1 },
        { transform: `translate(${bx + dir * 200}px, ${by - 70}px) scale(1)`, opacity: 0 }
    ], { duration: 750, easing: 'ease-out', fill: 'forwards' }).finished)
      .then(() => esfera.remove());
}

portalAzul.addEventListener('click', () => lanzarEsfera(portalAzul, portalNaranja));
portalNaranja.addEventListener('click', () => lanzarEsfera(portalNaranja, portalAzul));


/* ------------------------------------- */
/* ----// ACCESO PRIVADO (clave) \\----- */
/* ------------------------------------- */

/* AVISO: esta clave está escrita en el código, así que cualquiera que sepa abrir las herramientas
   del navegador puede verla. Sirve como "cortina" para visitas casuales, no como seguridad real. */
const CLAVE = 'proyecto2026'; /* la clave de acceso: cámbiala aquí */

function desbloquear() {
    try { sessionStorage.setItem('acceso', 'ok'); } catch (e) {} /* recuerda el acceso hasta cerrar la pestaña */
    document.documentElement.classList.remove('is-locked');
    campoClave.value = '';
    iniciarPrimeraCarga(); /* ahora sí sale la pantalla de carga de la sección */
    revisarScroll();
    if (seccionActual === 'recuerdos') cargarGaleria();
}

formularioAcceso.addEventListener('submit', e => {
    e.preventDefault();
    if (campoClave.value === CLAVE) {
        desbloquear();
    } else {
        textoError.textContent = 'Clave incorrecta. Inténtalo de nuevo.';
        panelAcceso.classList.remove('is-shaking');
        void panelAcceso.offsetWidth; /* truco para poder repetir la animación */
        panelAcceso.classList.add('is-shaking');
        campoClave.select();
    }
});


/* ---------------------------------------------------- */
/* --// decoración animada de la pantalla de clave \\-- */
/* ---------------------------------------------------- */

/* Crea las partículas que suben por el fondo (cambia 18 por más o menos) */
const decoracionClave = document.querySelector('.gate__decor');
for (let i = 0; i < 18; i++) {
    const particula = document.createElement('i');
    particula.className = 'gate__particle';
    particula.style.setProperty('--x', (Math.random() * 100) + '%'); /* posición horizontal */
    particula.style.setProperty('--size', (2 + Math.random() * 3) + 'px'); /* tamaño */
    particula.style.setProperty('--dur', (6 + Math.random() * 8) + 's'); /* velocidad */
    particula.style.animationDelay = -(Math.random() * 10) + 's'; /* para que no salgan todas juntas */
    decoracionClave.appendChild(particula);
}


/* ------------------------------------ */
/* ----// CONEXIÓN CON SUPABASE \\----- */
/* ------------------------------------ */

const SUPABASE_URL = 'https://rxoytzliswfhwxskcioa.supabase.co';
const SUPABASE_CLAVE = 'sb_publishable_Wv32QDV55TBVhq6u6jLraA_QaUUlig6'; /* clave "publishable": está pensada para ir en la página */
const BUCKET = 'imagenes'; /* nombre del almacenamiento de fotos */
const TABLA = 'fotos'; /* nombre de la tabla en Supabase */
const MAX_MB = 5; /* tamaño máximo de cada foto */

let cliente = null;
try {
    cliente = window.supabase.createClient(SUPABASE_URL, SUPABASE_CLAVE);
} catch (error) {
    console.error('No se pudo cargar Supabase:', error); /* por ejemplo, si no hay internet */
}


/* ----------------------------------- */
/* ----// GALERÍA DE RECUERDOS \\----- */
/* ----------------------------------- */

function mostrarEstado(texto, esError) {
    estadoSubida.textContent = texto;
    estadoSubida.classList.toggle('is-error', !!esError);
}

/* ----------------------------------------- */
/* --// vista previa de la foto elegida \\-- */
/* ----------------------------------------- */

campoFoto.addEventListener('change', () => {
    const archivo = campoFoto.files[0];
    vistaPrevia.hidden = !archivo;
    if (archivo) vistaPrevia.src = URL.createObjectURL(archivo);
    textoDrop.textContent = archivo ? archivo.name : 'Toca para elegir una foto';
});

/* --------------------------- */
/* --// subir un recuerdo \\-- */
/* --------------------------- */

formularioSubida.addEventListener('submit', async e => {
    e.preventDefault();
    const archivo = campoFoto.files[0];
    if (!cliente) return mostrarEstado('No se pudo conectar con Supabase.', true);
    if (!archivo) return mostrarEstado('Elige una foto primero.', true);
    if (!archivo.type.startsWith('image/')) return mostrarEstado('El archivo debe ser una imagen.', true);
    if (archivo.size > MAX_MB * 1024 * 1024) return mostrarEstado('La foto pesa más de ' + MAX_MB + ' MB.', true);

    botonSubir.disabled = true;
    mostrarEstado('Subiendo...');
    try {
        const extension = (archivo.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
        const ruta = Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.' + extension;

        const subida = await cliente.storage.from(BUCKET).upload(ruta, archivo, { contentType: archivo.type });
        if (subida.error) throw new Error('Almacenamiento: ' + subida.error.message);

        const url = cliente.storage.from(BUCKET).getPublicUrl(ruta).data.publicUrl;
        const registro = await cliente.from(TABLA).insert({
            autor: campoAutor.value.trim() || null,
            descripcion: campoDescripcion.value.trim() || null,
            url_imagen: url,
            ruta: ruta
        });
        if (registro.error) throw new Error('Tabla: ' + registro.error.message);

        formularioSubida.reset();
        vistaPrevia.hidden = true;
        textoDrop.textContent = 'Toca para elegir una foto';
        mostrarEstado('¡Recuerdo guardado!');
        await cargarGaleria();
    } catch (error) {
        console.error(error);
        mostrarEstado('No se pudo subir: ' + (error.message || 'error desconocido'), true);
    } finally {
        botonSubir.disabled = false;
    }
});

/* ---------------------------- */
/* --// mostrar la galería \\-- */
/* ---------------------------- */

async function cargarGaleria() {
    if (document.documentElement.classList.contains('is-locked')) return; /* no carga nada mientras está bloqueada */
    if (!cliente) { estadoGaleria.textContent = 'No se pudo conectar con Supabase.'; return; }
    estadoGaleria.textContent = 'Cargando recuerdos...';

    const resultado = await cliente.from(TABLA)
        .select('autor, descripcion, url_imagen')
        .order('creado', { ascending: false })
        .limit(60); /* muestra los 60 más recientes */
    if (resultado.error) {
        console.error(resultado.error);
        estadoGaleria.textContent = 'No se pudo cargar la galería.';
        return;
    }

    galeria.innerHTML = '';
    estadoGaleria.textContent = resultado.data.length ? '' : 'Todavía no hay recuerdos. ¡Sube el primero!';
    resultado.data.forEach(item => {
        if (!item.url_imagen.startsWith(SUPABASE_URL)) return; /* solo fotos que estén en nuestro Supabase */
        const tarjeta = document.createElement('figure');
        tarjeta.className = 'card';

        const imagen = document.createElement('img');
        imagen.src = item.url_imagen;
        imagen.loading = 'lazy';
        imagen.alt = item.descripcion || 'Recuerdo subido por ' + (item.autor || 'alguien');

        const pie = document.createElement('figcaption');
        const autor = document.createElement('span');
        autor.className = 'card__author';
        autor.textContent = item.autor || 'Anónimo';
        pie.appendChild(autor);
        if (item.descripcion) {
            const texto = document.createElement('p');
            texto.className = 'card__text';
            texto.textContent = item.descripcion;
            pie.appendChild(texto);
        }

        tarjeta.append(imagen, pie);
        galeria.appendChild(tarjeta);
    });
}


/* ----------------------- */
/* ----// ARRANQUE \\----- */
/* ----------------------- */

/* El bloqueo se decide en el <head> del index.html, antes de que se vea nada */

/* Se crean las barritas del indicador del cuadro (una por sección) */
secciones.forEach(() => pasosCuadro.appendChild(document.createElement('i')));

/* Si la dirección trae una sección (por ejemplo #ideas), se abre directamente
   y la pantalla de carga ya muestra los textos de esa sección */
const hash = location.hash.slice(1);
const inicial = secciones.includes(hash) ? hash : secciones[0];
activarSeccion(inicial);
if (document.documentElement.classList.contains('is-locked')) {
    campoClave.focus(); /* primero la clave; la pantalla de carga sale después de verificarla */
} else {
    iniciarPrimeraCarga(); /* si ya hay acceso en esta pestaña, va directo a la carga */
}
posicionarEncabezado();
