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

/* Lista de secciones, en el mismo orden que los botones del menú */
const secciones = Array.from(botones).map(b => b.dataset.target);
let seccionActual = secciones[0];


/* --------------------------------------------- */
/* ----// TEXTOS DE LA PANTALLA DE CARGA \\----- */
/* --------------------------------------------- */

/* Lo que dice la pantalla de carga de cada sección. Para añadir una sección nueva,
   copia un bloque y usa el mismo nombre que le pusiste en data-target del menú */
const CARGAS = {
    inicio: { titulo: 'Inicio', lineas: ['Abriendo portales', 'Calibrando la cámara', 'Sistemas listos'] },
    ideas: { titulo: 'Ideas', lineas: ['Reuniendo ideas', 'Ordenando experimentos', 'Cámara lista'] },
    creditos: { titulo: 'Créditos', lineas: ['Buscando al creador', 'Verificando firmas', 'Cámara lista'] }
};

const TIEMPO_PRIMERA_CARGA = 2600; /* milisegundos mínimos al entrar a la página */
const TIEMPO_CAMBIO = 1600; /* milisegundos al cambiar de sección */


/* -------------------------------- */
/* ----// PANTALLA DE CARGA \\----- */
/* -------------------------------- */

let cargando = true; /* mientras sea true no se puede cambiar de sección */
const carga = { inicio: 0, duracion: 3, listo: true, activa: false }; /* estado del avance de la carga */

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
    }, 1000);
}

/* ------------------------------------ */
/* --// primera carga de la página \\-- */
/* ------------------------------------ */

const inicioCarga = Date.now();
window.addEventListener('load', () => {
    carga.listo = true; /* la página ya cargó: la barra puede llegar al 100% */
    const faltante = Math.max(0, TIEMPO_PRIMERA_CARGA - (Date.now() - inicioCarga));
    setTimeout(terminarCarga, faltante);
});


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


/* ----------------------- */
/* ----// ARRANQUE \\----- */
/* ----------------------- */

/* Se crean las barritas del indicador del cuadro (una por sección) */
secciones.forEach(() => pasosCuadro.appendChild(document.createElement('i')));

/* Si la dirección trae una sección (por ejemplo #ideas), se abre directamente
   y la pantalla de carga ya muestra los textos de esa sección */
const hash = location.hash.slice(1);
const inicial = secciones.includes(hash) ? hash : secciones[0];
activarSeccion(inicial);
prepararCarga(inicial, TIEMPO_PRIMERA_CARGA, true);
posicionarEncabezado();
