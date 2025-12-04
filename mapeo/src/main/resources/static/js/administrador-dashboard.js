// ============================================================
// ADMINISTRADOR DASHBOARD - JavaScript
// ============================================================

const API_BASE = '/api';
let administradores = [];

// ============================================================
// INICIALIZACIÓN
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation();
    // cargarAdministradores(); // Desactivado - no existe sección de administradores en HTML
    setupEventListeners();
    loadTheme();
});

// ============================================================
// NAVEGACIÓN
// ============================================================

function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            goToSection(item.getAttribute('data-section'));
        });
    });
}

function goToSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));
    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.classList.add('active');
    }
    
    // Cargar datos de reportes cuando se navega a ellos
    switch(sectionId) {
        case 'reporte-usuarios':
            if (typeof cargarReporteUsuarios === 'function') cargarReporteUsuarios();
            break;
        case 'reporte-fichas':
            if (typeof cargarReporteFichas === 'function') cargarReporteFichas();
            break;
        case 'reporte-instructores':
            if (typeof cargarReporteInstructores === 'function') cargarReporteInstructores();
            break;
        case 'reporte-trimestres':
            if (typeof cargarReporteTrimestres === 'function') cargarReporteTrimestres();
            break;
        case 'reporte-proyectos':
            if (typeof cargarReporteProyectos === 'function') cargarReporteProyectos();
            break;
    }
}

// ============================================================
// CARGAR ADMINISTRADORES
// ============================================================

function cargarAdministradores() {
    fetch(`${API_BASE}/administradores`)
        .then(response => response.json())
        .then(data => {
            administradores = data;
            mostrarAdministradores();
        })
        .catch(error => console.error('Error cargando administradores:', error));
}

function mostrarAdministradores() {
    const tbody = document.getElementById('administradores-tbody');
    tbody.innerHTML = '';
    
    if (administradores.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">No hay administradores registrados</td></tr>';
        return;
    }
    
    administradores.forEach(admin => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${admin.id}</td>
            <td>${admin.usuario?.nombre || 'N/A'}</td>
            <td>${admin.usuario?.correo || 'N/A'}</td>
            <td>${admin.usuario?.id || 'N/A'}</td>
            <td>
                <button class="btn-small" onclick="abrirEditarAdministrador(${admin.id})">✏️ Editar</button>
                <button class="btn-small btn-danger" onclick="eliminarAdministrador(${admin.id})">🗑️ Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ============================================================
// CREAR ADMINISTRADOR
// ============================================================

function crearAdministrador(event) {
    event.preventDefault();
    
    const usuarioId = document.getElementById('admin-usuario-id').value;
    
    const administrador = {
        usuario: {
            id: parseInt(usuarioId)
        }
    };
    
    fetch(`${API_BASE}/administradores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(administrador)
    })
    .then(response => response.json())
    .then(data => {
        alert('Administrador creado exitosamente');
        closeModal('modal-crear-administrador');
        document.getElementById('form-crear-administrador').reset();
        cargarAdministradores();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error al crear administrador');
    });
}

// ============================================================
// EDITAR ADMINISTRADOR
// ============================================================

function abrirEditarAdministrador(id) {
    const admin = administradores.find(a => a.id === id);
    if (admin) {
        document.getElementById('admin-id-edit').value = admin.id;
        document.getElementById('admin-usuario-id-edit').value = admin.usuario?.id || '';
        openModal('modal-editar-administrador');
    }
}

function actualizarAdministrador(event) {
    event.preventDefault();
    
    const id = document.getElementById('admin-id-edit').value;
    const usuarioId = document.getElementById('admin-usuario-id-edit').value;
    
    const administrador = {
        usuario: {
            id: parseInt(usuarioId)
        }
    };
    
    fetch(`${API_BASE}/administradores/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(administrador)
    })
    .then(response => response.json())
    .then(data => {
        alert('Administrador actualizado exitosamente');
        closeModal('modal-editar-administrador');
        cargarAdministradores();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error al actualizar administrador');
    });
}

// ============================================================
// ELIMINAR ADMINISTRADOR
// ============================================================

function eliminarAdministrador(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este administrador?')) {
        fetch(`${API_BASE}/administradores/${id}`, {
            method: 'DELETE'
        })
        .then(() => {
            alert('Administrador eliminado exitosamente');
            cargarAdministradores();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al eliminar administrador');
        });
    }
}

// ============================================================
// MODALES
// ============================================================

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

// ============================================================
// TEMA (DARK MODE)
// ============================================================

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

function logout() {
    if (confirm('¿Deseas cerrar sesión?')) {
        window.location.href = '/login';
    }
}

// ============================================================
// EVENT LISTENERS
// ============================================================

function setupEventListeners() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Notificaciones
    const notificationBtn = document.querySelector('[onclick="toggleNotificationPanel()"]');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', toggleNotificationPanel);
    }
}

function toggleNotificationPanel() {
    const panel = document.getElementById('notification-panel');
    if (panel) {
        panel.classList.toggle('active');
    }
}
