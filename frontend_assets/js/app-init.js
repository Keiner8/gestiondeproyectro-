// ============================================================
// APP INITIALIZATION - Carga global y sincronizacion
// ============================================================

// APIs Globales (declaradas solo una vez)
window.API_USUARIOS = '/api/usuarios';
window.API_ROLES = '/api/roles';
window.API_FICHAS = '/api/fichas';
window.API_TRIMESTRES = '/api/trimestres';
window.API_GAES = '/api/gaes';
window.API_PROYECTOS = '/api/proyectos';
window.API_ENTREGABLES = '/api/entregables';
window.API_EVALUACIONES = '/api/evaluaciones';
window.API_APRENDICES = '/api/aprendices';
window.API_INSTRUCTORES = '/api/instructores';

// Variables globales
window.usuariosListaCompleta = [];
window.rolesDisponibles = [
    { id: 1, nombreRol: 'administrador' },
    { id: 2, nombreRol: 'instructor' },
    { id: 3, nombreRol: 'aprendiz' },
];
window.fichasListaCompleta = [];
window.trimestresListaCompleta = [];
window.gaesListaCompleta = [];
window.proyectosListaCompleta = [];
window.evaluacionesListaCompleta = [];
window.aprendicesListaCompleta = [];
window.instructoresListaCompleta = [];

// ============================================================
// FUNCIONES COMPARTIDAS
// ============================================================

function obtenerIconoSweetAlert(tipo) {
    const iconos = {
        success: 'success',
        error: 'error',
        warning: 'warning',
        info: 'info'
    };
    return iconos[tipo] || 'info';
}

function obtenerTituloSweetAlert(tipo, titulo = '') {
    if (titulo) {
        return titulo;
    }

    if (tipo === 'success') {
        return 'Operacion exitosa';
    }

    if (tipo === 'error') {
        return 'Ocurrio un error';
    }

    if (tipo === 'warning') {
        return 'Atencion';
    }

    return 'Mensaje';
}

function mostrarAlertaGlobal(mensaje, tipo = 'info', titulo = '') {
    const texto = String(mensaje ?? '');
    console.log(`[${tipo.toUpperCase()}] ${texto}`);

    if (window.Swal) {
        return window.Swal.fire({
            title: obtenerTituloSweetAlert(tipo, titulo),
            text: texto,
            icon: obtenerIconoSweetAlert(tipo),
            confirmButtonColor: '#355070'
        });
    }

    if (window.__nativeAlert__) {
        window.__nativeAlert__(texto);
    }

    return Promise.resolve();
}

function mostrarNotificacionGlobal(mensaje, tipo = 'info') {
    const texto = String(mensaje ?? '');
    console.log(`[${tipo.toUpperCase()}] ${texto}`);

    if (window.Swal) {
        return window.Swal.fire({
            toast: true,
            position: 'top-end',
            icon: obtenerIconoSweetAlert(tipo),
            title: texto,
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
        });
    }

    const panel = document.createElement('div');
    panel.className = `notification ${tipo}`;
    panel.textContent = texto;
    panel.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${tipo === 'success' ? '#4caf50' : tipo === 'error' ? '#f44336' : '#2196f3'};
        color: white;
        border-radius: 4px;
        z-index: 10000;
        max-width: 400px;
    `;
    document.body.appendChild(panel);

    setTimeout(() => panel.remove(), 3000);
    return Promise.resolve();
}

async function confirmarAccion(mensaje, titulo = 'Confirmar accion') {
    const texto = String(mensaje ?? '');

    if (window.Swal) {
        const resultado = await window.Swal.fire({
            title: titulo,
            text: texto,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Si, continuar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#355070',
            cancelButtonColor: '#6c757d'
        });
        return !!resultado.isConfirmed;
    }

    return window.__nativeConfirm__ ? window.__nativeConfirm__(texto) : false;
}

window.__nativeAlert__ = window.alert.bind(window);
window.__nativeConfirm__ = window.confirm.bind(window);
window.mostrarAlertaGlobal = mostrarAlertaGlobal;
window.mostrarNotificacionGlobal = mostrarNotificacionGlobal;
window.confirmarAccion = confirmarAccion;
window.alert = function(mensaje) {
    mostrarAlertaGlobal(mensaje, 'info');
};

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
}

function loadTheme() {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
    }
}

function toggleNotificationPanel() {
    const panel = document.getElementById('notification-panel');
    if (panel) {
        panel.classList.toggle('active');
    }
}

async function logout() {
    if (await confirmarAccion('Deseas cerrar sesion?', 'Cerrar sesion')) {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('usuarioId');
        localStorage.removeItem('usuarioNombre');
        localStorage.removeItem('usuarioRol');

        window.history.replaceState(null, null, '/login');
        window.location.replace('/login');
    }
}

// ============================================================
// FUNCION PARA FILTRAR TRIMESTRES (segun tipo de programa)
// ============================================================

function obtenerDuracionPrograma(ficha) {
    if (!ficha) return 4;

    const nivel = (ficha.nivel || '').toString().toUpperCase();
    if (nivel === 'TECNOLOGO') {
        return 7;
    }

    if (nivel === 'TECNICO') {
        return 4;
    }

    const programaBase = ficha.programaFormacion || '';
    const programa = programaBase
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

    if (programa.includes('tecnologo')) {
        return 7;
    }

    if (programa.includes('tecnico')) {
        return 4;
    }

    return 4;
}

function filtrarTrimestresValidos(trimestres, fichaId = null) {
    if (!Array.isArray(trimestres)) return [];

    let duracionMaxima = 4;

    if (fichaId && window.fichasListaCompleta) {
        const ficha = window.fichasListaCompleta.find(f => f.id === fichaId);
        if (ficha) {
            duracionMaxima = obtenerDuracionPrograma(ficha);
        }
    }

    return trimestres
        .filter(t => t.numero >= 1 && t.numero <= duracionMaxima)
        .sort((a, b) => a.numero - b.numero);
}

// ============================================================
// CARGAR ROLES (ejecutar primero)
// ============================================================

function cargarRoles() {
    return fetchWithAuth(window.API_ROLES)
        .then(response => {
            if (!response.ok) throw new Error('Error al cargar roles');
            return response.json();
        })
        .then(data => {
            window.rolesDisponibles = Array.isArray(data) && data.length > 0
                ? data
                : window.rolesDisponibles;

            llenarSelectRoles('usuario-rol');
            llenarSelectRoles('usuario-rol-edit');
            llenarSelectRoles('usuarios-rol-filter');

            console.log('Roles cargados:', data.length);
            return data;
        })
        .catch(error => {
            console.error('Error al cargar roles:', error);
            throw error;
        });
}

function llenarSelectRoles(selectId) {
    const select = document.getElementById(selectId);
    if (!select) {
        console.warn('Select no encontrado:', selectId);
        return;
    }

    console.log('Llenando select:', selectId, 'con roles:', window.rolesDisponibles);

    while (select.options.length > 1) {
        select.remove(1);
    }

    if (!window.rolesDisponibles || window.rolesDisponibles.length === 0) {
        console.warn('No hay roles disponibles para llenar', selectId);
        return;
    }

    window.rolesDisponibles.forEach(rol => {
        const option = document.createElement('option');
        option.value = rol.id;
        option.textContent = rol.nombreRol;
        select.appendChild(option);
    });

    console.log('Select llenado:', selectId);
}

// ============================================================
// INICIALIZACION AL CARGAR PAGINA
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Pagina cargada');

    loadTheme();

    let intentos = 0;
    const maxIntentos = 5;

    function intentarCargarRoles() {
        intentos++;
        console.log(`Intento ${intentos} de cargar roles...`);

        try {
            const rolesPromise = cargarRoles();
            if (rolesPromise && rolesPromise.then) {
                rolesPromise.then(() => {
                    console.log('Roles listos para usar');
                    setTimeout(() => {
                        llenarSelectRoles('usuarios-rol-filter');
                        llenarSelectRoles('usuario-rol');
                        llenarSelectRoles('usuario-rol-edit');
                    }, 100);
                }).catch(error => {
                    console.error('Error: no se pudieron cargar los roles', error);
                    if (intentos < maxIntentos) {
                        setTimeout(intentarCargarRoles, 1000);
                    }
                });
            } else {
                console.warn('cargarRoles() no devolvio un Promise');
            }
        } catch (error) {
            console.error('Error al cargar roles:', error);
            if (intentos < maxIntentos) {
                setTimeout(intentarCargarRoles, 1000);
            }
        }
    }

    intentarCargarRoles();

    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', event => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });

    if (
        localStorage.getItem('jwtToken') &&
        (
            window.location.href.includes('/dashboard') ||
            window.location.href.includes('aprendiz') ||
            window.location.href.includes('instructor') ||
            window.location.href.includes('administrador')
        )
    ) {
        for (let i = 0; i < 5; i++) {
            window.history.pushState(null, null, window.location.href);
        }

        window.addEventListener('popstate', function(event) {
            event.preventDefault();
            window.history.pushState(null, null, window.location.href);
            console.warn('Navegacion hacia atras bloqueada - Debes cerrar sesion para salir');
        }, { passive: false });
    }
});

window.addEventListener('pagehide', function() {
    if (
        localStorage.getItem('jwtToken') &&
        (
            window.location.href.includes('/dashboard') ||
            window.location.href.includes('aprendiz') ||
            window.location.href.includes('instructor') ||
            window.location.href.includes('administrador')
        )
    ) {
        window.history.replaceState(null, null, window.location.href);
    }
});

let isReloading = false;
window.addEventListener('beforeunload', function(event) {
    if (event.type === 'beforeunload') {
        const perfData = performance.getEntriesByType('navigation')[0];
        if (perfData && perfData.type !== 'reload') {
            isReloading = true;
        }
    }
});

window.addEventListener('unload', function() {
    if (
        !isReloading &&
        localStorage.getItem('jwtToken') &&
        (
            window.location.href.includes('/dashboard') ||
            window.location.href.includes('aprendiz') ||
            window.location.href.includes('instructor') ||
            window.location.href.includes('administrador')
        )
    ) {
        fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
            },
            keepalive: true
        }).catch(() => console.log('Logout en segundo plano'));

        localStorage.removeItem('jwtToken');
        localStorage.removeItem('usuarioId');
        localStorage.removeItem('usuarioNombre');
        localStorage.removeItem('usuarioRol');
    }
});
