// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    cargarRoles();
    setupFiltrosRoles();
});

// ===== CARGAR DATOS =====
function cargarRoles() {
    return fetchWithAuth(window.API_ROLES)
        .then(response => {
            if (!response.ok) throw new Error('Error al cargar roles');
            return response.json();
        })
        .then(data => {
            window.rolesDisponibles = data;
            mostrarRoles(data);
            return data;
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarNotificacionGlobal('Error al cargar roles', 'error');
            throw error;
        });
}

function mostrarRoles(roles) {
    const tbody = document.getElementById('roles-tbody');
    tbody.innerHTML = '';
    
    if (roles.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="no-data">No hay roles registrados</td></tr>';
        return;
    }
    
    roles.forEach(rol => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${rol.id}</td>
            <td>${rol.nombreRol}</td>
            <td class="acciones">
                <button class="btn-action btn-primary" onclick="abrirEditarRol(${rol.id})" title="Editar">EDITAR</button>
                <button class="btn-action btn-danger" onclick="eliminarRol(${rol.id})" title="Eliminar">ELIMINAR</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// ===== FILTROS =====
function setupFiltrosRoles() {
    const searchEl = document.getElementById('roles-search');
    if (searchEl) searchEl.addEventListener('keyup', aplicarFiltrosRoles);
}

function aplicarFiltrosRoles() {
    const searchTerm = document.getElementById('roles-search')?.value.toLowerCase() || '';
    
    let rolesFiltrados = window.rolesDisponibles.filter(rol => {
        return rol.nombreRol.toLowerCase().includes(searchTerm);
    });
    
    mostrarRoles(rolesFiltrados);
}

// ===== CREAR ROL =====
function crearRol(event) {
    event.preventDefault();
    
    const nombre = document.getElementById('rol-nombre').value;
    
    if (!nombre) {
        mostrarNotificacionGlobal('Por favor ingresa el nombre del rol', 'warning');
        return;
    }
    
    const nuevoRol = {
        nombreRol: nombre
    };
    
    fetchWithAuth(window.API_ROLES, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoRol)
    })
    .then(response => {
        if (!response.ok) throw new Error('Error al crear rol');
        return response.json();
    })
    .then(data => {
        mostrarNotificacionGlobal('Rol creado exitosamente', 'success');
        closeModal('modal-crear-rol');
        document.getElementById('form-crear-rol').reset();
        cargarRoles();
        
        // Actualizar los selects de roles en usuarios
        llenarSelectRoles('usuario-rol');
        llenarSelectRoles('usuario-rol-edit');
        llenarSelectRoles('usuarios-rol-filter');
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarNotificacionGlobal('Error: ' + error.message, 'error');
    });
}

// ===== EDITAR ROL =====
function abrirEditarRol(id) {
    const rol = window.rolesDisponibles.find(r => r.id === id);
    if (!rol) return;
    
    document.getElementById('rol-id-edit').value = rol.id;
    document.getElementById('rol-nombre-edit').value = rol.nombreRol;
    
    openModal('modal-editar-rol');
}

function actualizarRol(event) {
    event.preventDefault();
    
    const id = document.getElementById('rol-id-edit').value;
    const nombre = document.getElementById('rol-nombre-edit').value;
    
    if (!nombre) {
        mostrarNotificacionGlobal('Por favor ingresa el nombre del rol', 'warning');
        return;
    }
    
    const rolActualizado = {
        id: id,
        nombreRol: nombre
    };
    
    fetch(`${window.API_ROLES}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rolActualizado)
    })
    .then(response => {
        if (!response.ok) throw new Error('Error al actualizar rol');
        return response.json();
    })
    .then(data => {
        mostrarNotificacionGlobal('Rol actualizado exitosamente', 'success');
        closeModal('modal-editar-rol');
        cargarRoles();
        
        // Actualizar los selects
        llenarSelectRoles('usuario-rol');
        llenarSelectRoles('usuario-rol-edit');
        llenarSelectRoles('usuarios-rol-filter');
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarNotificacionGlobal('Error: ' + error.message, 'error');
    });
}

// ===== ELIMINAR ROL =====
function eliminarRol(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este rol?')) {
        return;
    }
    
    fetch(`${window.API_ROLES}/${id}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) throw new Error('Error al eliminar rol');
        mostrarNotificacionGlobal('Rol eliminado exitosamente', 'success');
        cargarRoles();
        
        // Actualizar los selects
        llenarSelectRoles('usuario-rol');
        llenarSelectRoles('usuario-rol-edit');
        llenarSelectRoles('usuarios-rol-filter');
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarNotificacionGlobal('Error: ' + error.message, 'error');
    });
}
