// Función para generar contraseña automática
function generarContraseña() {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let contraseña = '';
    for (let i = 0; i < 12; i++) {
        contraseña += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return contraseña;
}

// Función para llenar select de roles
function llenarSelectRoles(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    if (window.rolesDisponibles && window.rolesDisponibles.length > 0) {
        select.innerHTML = '<option value="">Seleccione rol</option>' +
            window.rolesDisponibles.map(rol => 
                `<option value="${rol.id}">${rol.nombreRol}</option>`
            ).join('');
    } else {
        // Si los roles aún no están cargados, esperar e intentar de nuevo
        setTimeout(() => llenarSelectRoles(selectId), 500);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    cargarUsuarios();
    setupFiltros();
    
    // Llenar select de roles
    llenarSelectRoles('usuario-rol');
});

// ===== CARGAR DATOS =====
function cargarUsuarios() {
    fetchWithAuth(window.API_USUARIOS)
        .then(response => {
            if (!response.ok) throw new Error('Error al cargar usuarios');
            return response.json();
        })
        .then(data => {
            window.usuariosListaCompleta = data;
            mostrarUsuarios(data);
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarNotificacion('Error al cargar usuarios', 'error');
        });
}

function mostrarUsuarios(usuarios) {
    const tbody = document.getElementById('usuarios-tbody');
    tbody.innerHTML = '';
    
    if (usuarios.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="no-data">No hay usuarios registrados</td></tr>';
        return;
    }
    
    usuarios.forEach(usuario => {
        const rol = window.rolesDisponibles.find(r => r.id === usuario.rol?.id);
        const rolNombre = rol ? rol.nombreRol : 'Sin asignar';
        const tipoDocFormatted = formatearTipoDocumento(usuario.tipoDocumento);
        const esActivo = usuario.estado === 'ACTIVO';
        
        const botonEstado = esActivo 
            ? `<button class="btn-action btn-eliminar" onclick="desactivarUsuario(${usuario.id})" title="Desactivar">Desactivar</button>`
            : `<button class="btn-action btn-reactivar" onclick="activarUsuario(${usuario.id})" title="Activar">Activar</button>`;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${usuario.id}</td>
            <td>${usuario.nombre}</td>
            <td>${usuario.apellido}</td>
            <td>${usuario.correo}</td>
            <td>${tipoDocFormatted}</td>
            <td>${usuario.numeroDocumento}</td>
            <td>${rolNombre}</td>
            <td><span class="estado ${usuario.estado?.toLowerCase()}">${usuario.estado}</span></td>
            <td class="acciones">
                <button class="btn-action btn-ver" onclick="verUsuario(${usuario.id})" title="Ver">Ver</button>
                <button class="btn-action btn-editar" onclick="abrirEditarUsuario(${usuario.id})" title="Editar">Editar</button>
                ${botonEstado}
            </td>
        `;
        tbody.appendChild(row);
    });
}

// ===== FILTROS =====
function setupFiltros() {
    document.getElementById('usuarios-search').addEventListener('keyup', aplicarFiltros);
    document.getElementById('usuarios-rol-filter').addEventListener('change', aplicarFiltros);
    document.getElementById('usuarios-estado-filter').addEventListener('change', aplicarFiltros);
}

function aplicarFiltros() {
     const searchTerm = document.getElementById('usuarios-search').value.toLowerCase();
     const rolFilter = document.getElementById('usuarios-rol-filter').value;
     const estadoFilter = document.getElementById('usuarios-estado-filter').value;
     
     let usuariosFiltrados = window.usuariosListaCompleta.filter(usuario => {
         const matchNombre = usuario.nombre.toLowerCase().includes(searchTerm) || 
                            usuario.apellido.toLowerCase().includes(searchTerm) ||
                            usuario.correo.toLowerCase().includes(searchTerm);
         const matchRol = !rolFilter || (usuario.rol && parseInt(usuario.rol.id) === parseInt(rolFilter));
         const matchEstado = !estadoFilter || usuario.estado === estadoFilter;
         
         return matchNombre && matchRol && matchEstado;
     });
     
     mostrarUsuarios(usuariosFiltrados);
 }

// ===== CREAR USUARIO =====
function crearUsuario(event) {
    event.preventDefault();
    
    const nombre = document.getElementById('usuario-nombre').value;
    const apellido = document.getElementById('usuario-apellido').value;
    const correo = document.getElementById('usuario-correo').value;
    const tipoDocumento = document.getElementById('usuario-tipo-documento').value;
    const numeroDocumento = document.getElementById('usuario-numero-documento').value;
    const rolId = document.getElementById('usuario-rol').value;
    const estado = document.getElementById('usuario-estado').value;
    const password = document.getElementById('usuario-contrasena').value;
    const passwordConfirmacion = document.getElementById('usuario-contrasena-confirmacion').value;
    
    if (!nombre || !apellido || !correo || !numeroDocumento || !rolId || !password) {
        mostrarNotificacion('Por favor completa todos los campos obligatorios', 'warning');
        return;
    }
    
    // Validar que las contraseñas coincidan
    if (password !== passwordConfirmacion) {
        mostrarNotificacion('Las contraseñas no coinciden', 'warning');
        return;
    }
    
    // Validar longitud mínima de contraseña
    if (password.length < 8) {
        mostrarNotificacion('La contraseña debe tener al menos 8 caracteres', 'warning');
        return;
    }
    
    const usuarioNuevo = {
        nombre: nombre,
        apellido: apellido,
        correo: correo,
        tipoDocumento: tipoDocumento,
        numeroDocumento: numeroDocumento,
        rol: {
            id: parseInt(rolId)
        },
        password: password,
        estado: estado
    };
    
    fetchWithAuth(window.API_USUARIOS, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(usuarioNuevo)
    })
    .then(response => {
        if (!response.ok) throw new Error('Error al crear usuario');
        return response.json();
    })
    .then(data => {
        mostrarNotificacion('Usuario creado exitosamente', 'success');
        closeModal('modal-crear-usuario');
        document.getElementById('form-crear-usuario').reset();
        cargarUsuarios();
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarNotificacion('Error al crear usuario: ' + error.message, 'error');
    });
}

// ===== EDITAR USUARIO =====
function abrirEditarUsuario(id) {
    const usuario = window.usuariosListaCompleta.find(u => u.id === id);
    if (!usuario) return;
    
    // Primero llenar el select de roles
    llenarSelectRoles('usuario-rol-edit');
    
    // Luego llenar los campos
    document.getElementById('usuario-id-edit').value = usuario.id;
    document.getElementById('usuario-nombre-edit').value = usuario.nombre;
    document.getElementById('usuario-apellido-edit').value = usuario.apellido;
    document.getElementById('usuario-correo-edit').value = usuario.correo;
    document.getElementById('usuario-tipo-documento-edit').value = usuario.tipoDocumento;
    document.getElementById('usuario-numero-documento-edit').value = usuario.numeroDocumento;
    document.getElementById('usuario-rol-edit').value = usuario.rol?.id || '';
    document.getElementById('usuario-estado-edit').value = usuario.estado;
    
    openModal('modal-editar-usuario');
}

function actualizarUsuario(event) {
    event.preventDefault();
    
    const id = document.getElementById('usuario-id-edit').value;
    const nombre = document.getElementById('usuario-nombre-edit').value;
    const apellido = document.getElementById('usuario-apellido-edit').value;
    const correo = document.getElementById('usuario-correo-edit').value;
    const tipoDocumento = document.getElementById('usuario-tipo-documento-edit').value;
    const numeroDocumento = document.getElementById('usuario-numero-documento-edit').value;
    const rolId = document.getElementById('usuario-rol-edit').value;
    const estado = document.getElementById('usuario-estado-edit').value;
    
    if (!nombre || !apellido || !correo || !numeroDocumento || !rolId) {
        mostrarNotificacion('Por favor completa todos los campos obligatorios', 'warning');
        return;
    }
    
    const usuarioActualizado = {
        id: id,
        nombre: nombre,
        apellido: apellido,
        correo: correo,
        tipoDocumento: tipoDocumento,
        numeroDocumento: numeroDocumento,
        rol: {
            id: parseInt(rolId)
        },
        estado: estado
    };
    
    fetchWithAuth(`${window.API_USUARIOS}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(usuarioActualizado)
    })
    .then(response => {
        if (!response.ok) throw new Error('Error al actualizar usuario');
        return response.json();
    })
    .then(data => {
        mostrarNotificacion('Usuario actualizado exitosamente', 'success');
        closeModal('modal-editar-usuario');
        cargarUsuarios();
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarNotificacion('Error al actualizar usuario: ' + error.message, 'error');
    });
}

// ===== VER USUARIO =====
function verUsuario(id) {
    const usuario = window.usuariosListaCompleta.find(u => u.id === id);
    if (!usuario) return;
    
    const rol = window.rolesDisponibles.find(r => r.id === usuario.rol?.id);
    const rolNombre = rol ? rol.nombreRol : 'Sin asignar';
    const tipoDocFormatted = formatearTipoDocumento(usuario.tipoDocumento);
    
    const mensaje = `
ID: ${usuario.id}
Nombre: ${usuario.nombre} ${usuario.apellido}
Correo: ${usuario.correo}
Documento: ${tipoDocFormatted} - ${usuario.numeroDocumento}
Rol: ${rolNombre}
Estado: ${usuario.estado}
    `;
    
    alert(mensaje);
}

// ===== DESACTIVAR USUARIO =====
function desactivarUsuario(id) {
    if (!confirm('¿Estás seguro de que deseas desactivar este usuario?')) {
        return;
    }
    
    fetchWithAuth(`${window.API_USUARIOS}/${id}/desactivar`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => {
        if (!response.ok) throw new Error('Error al desactivar usuario');
        mostrarNotificacion('Usuario desactivado exitosamente', 'success');
        cargarUsuarios();
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarNotificacion('Error: ' + error.message, 'error');
    });
}

// ===== ACTIVAR USUARIO =====
function activarUsuario(id) {
    if (!confirm('¿Estás seguro de que deseas activar este usuario?')) {
        return;
    }
    
    fetchWithAuth(`${window.API_USUARIOS}/${id}/activar`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => {
        if (!response.ok) throw new Error('Error al activar usuario');
        mostrarNotificacion('Usuario activado exitosamente', 'success');
        cargarUsuarios();
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarNotificacion('Error: ' + error.message, 'error');
    });
}

// ===== ELIMINAR USUARIO =====
function eliminarUsuario(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
        return;
    }
    
    fetchWithAuth(`${window.API_USUARIOS}/${id}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) throw new Error('Error al eliminar usuario');
        mostrarNotificacion('Usuario eliminado exitosamente', 'success');
        cargarUsuarios();
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarNotificacion('Error al eliminar usuario: ' + error.message, 'error');
    });
}

// ===== FUNCIONES AUXILIARES =====
function formatearTipoDocumento(tipo) {
    const map = {
        'CC': 'Cédula Ciudadanía',
        'CE': 'Cédula Extranjería',
        'TI': 'Tarjeta Identidad',
        'PA': 'Pasaporte'
    };
    return map[tipo] || tipo || 'N/A';
}

function mostrarNotificacion(mensaje, tipo = 'info') {
    mostrarNotificacionGlobal(mensaje, tipo);
}
