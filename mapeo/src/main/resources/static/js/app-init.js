// ============================================================
// APP INITIALIZATION - Carga global y sincronización
// ============================================================

// APIs Globales (declaradas solo una vez)
window.API_USUARIOS = '/api/usuarios';
window.API_ROLES = '/api/roles';
window.API_FICHAS = '/api/fichas';
window.API_TRIMESTRES = '/api/trimestres';
window.API_GAES = '/api/gaes';
window.API_PROYECTOS = '/api/proyectos';
window.API_EVALUACIONES = '/api/evaluaciones';
window.API_APRENDICES = '/api/aprendices';
window.API_INSTRUCTORES = '/api/instructores';

// Variables globales
window.usuariosListaCompleta = [];
window.rolesDisponibles = [];
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

function mostrarNotificacionGlobal(mensaje, tipo = 'info') {
    console.log(`[${tipo.toUpperCase()}] ${mensaje}`);
    
    // Intenta usar una notificación visual si existe
    const panel = document.createElement('div');
    panel.className = `notification ${tipo}`;
    panel.textContent = mensaje;
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
}

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

function logout() {
    if (confirm('¿Deseas cerrar sesión?')) {
        // Limpiar localStorage
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('usuarioId');
        localStorage.removeItem('usuarioNombre');
        localStorage.removeItem('usuarioRol');
        
        // Reemplazar historial para prevenir volver atrás
        window.history.replaceState(null, null, '/login');
        window.location.replace('/login');
    }
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
            window.rolesDisponibles = data;
            
            // Llenar todos los selects de rol
            llenarSelectRoles('usuario-rol');
            llenarSelectRoles('usuario-rol-edit');
            llenarSelectRoles('usuarios-rol-filter');
            
            console.log('✓ Roles cargados:', data.length);
            return data;
        })
        .catch(error => {
            console.error('Error al cargar roles:', error);
            mostrarNotificacionGlobal('Error al cargar roles', 'error');
            throw error;
        });
}

function llenarSelectRoles(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    // Limpiar opciones excepto la primera
    while (select.options.length > 1) {
        select.remove(1);
    }
    
    window.rolesDisponibles.forEach(rol => {
        const option = document.createElement('option');
        option.value = rol.id;
        option.textContent = rol.nombreRol;
        select.appendChild(option);
    });
}

// ============================================================
// INICIALIZACIÓN AL CARGAR PÁGINA
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('✓ Página cargada');
    
    // Cargar tema
    loadTheme();
    
    // Cargar roles primero (es necesario para los selects)
    try {
        const rolesPromise = cargarRoles();
        if (rolesPromise && rolesPromise.then) {
            rolesPromise.then(() => {
                console.log('✓ Roles listos para usar');
            }).catch(error => {
                console.error('Error: no se pudieron cargar los roles', error);
            });
        } else {
            console.warn('cargarRoles() no devolvió un Promise');
        }
    } catch (error) {
        console.error('Error al cargar roles:', error);
    }
    
    // Setup modales
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Prevenir navegación hacia atrás si está en un dashboard autenticado
    if (localStorage.getItem('jwtToken') && 
        (window.location.href.includes('/dashboard') || 
         window.location.href.includes('aprendiz') || 
         window.location.href.includes('instructor') || 
         window.location.href.includes('administrador'))) {
        
        // Agregar múltiples entradas al historial para atrapar intentos de back
        for (let i = 0; i < 5; i++) {
            window.history.pushState(null, null, window.location.href);
        }
        
        // Interceptar intentos de retroceso de forma robusta
        window.addEventListener('popstate', function(e) {
            e.preventDefault();
            // Mantener en la página actual
            window.history.pushState(null, null, window.location.href);
            console.warn('⚠️ Navegación hacia atrás bloqueada - Debes cerrar sesión para salir');
        }, { passive: false });
    }
});

// Prevenir caché de página para dashboards (evitar que se cargue desde caché al volver)
window.addEventListener('pagehide', function() {
    if (localStorage.getItem('jwtToken') && 
        (window.location.href.includes('/dashboard') || 
         window.location.href.includes('aprendiz') || 
         window.location.href.includes('instructor') || 
         window.location.href.includes('administrador'))) {
        window.history.replaceState(null, null, window.location.href);
    }
});

// Solo logout cuando realmente cierra la pestaña/ventana (no en recarga)
// Detectar si es cierre de pestaña vs recarga
let isReloading = false;
window.addEventListener('beforeunload', function(e) {
    // Marcar que está recargando si presiona F5, Ctrl+R, o usa botón recarga
    if (e.type === 'beforeunload') {
        // Detectar si es recarga usando performance API
        const perfData = performance.getEntriesByType('navigation')[0];
        if (perfData && perfData.type !== 'reload') {
            isReloading = true;
        }
    }
});

// Pagehide se dispara siempre, pero podemos usar unload para cierre real
window.addEventListener('unload', function() {
    // Solo logout si está cerrando la pestaña/ventana (NO en recarga)
    if (!isReloading && localStorage.getItem('jwtToken') && 
        (window.location.href.includes('/dashboard') || 
         window.location.href.includes('aprendiz') || 
         window.location.href.includes('instructor') || 
         window.location.href.includes('administrador'))) {
        
        // Enviar logout al servidor (de forma asincrónica)
        fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
            },
            keepalive: true
        }).catch(error => console.log('Logout en segundo plano'));
        
        // Limpiar localStorage
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('usuarioId');
        localStorage.removeItem('usuarioNombre');
        localStorage.removeItem('usuarioRol');
    }
});
