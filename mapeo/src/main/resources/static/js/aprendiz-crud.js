// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    // Cargar usuarios y fichas primero, luego aprendices
    Promise.all([
        cargarUsuariosParaAprendicesPromise(),
        cargarFichasParaAprendicesPromise()
    ]).then(() => {
        cargarAprendices();
        setupFiltrosAprendices();
    });
});

// ===== CARGAR DATOS =====
function cargarUsuariosParaAprendices() {
    cargarUsuariosParaAprendicesPromise();
}

function cargarUsuariosParaAprendicesPromise() {
    return fetchWithAuth(window.API_USUARIOS)
        .then(response => {
            if (!response.ok) throw new Error('Error al cargar usuarios');
            return response.json();
        })
        .then(data => {
            // Filtrar solo usuarios que sean aprendices o sin rol específico
            window.usuariosListaCompleta = data;
            llenarSelectUsuariosAprendices();
        })
        .catch(error => console.error('Error:', error));
}

function cargarFichasParaAprendices() {
    cargarFichasParaAprendicesPromise();
}

function cargarFichasParaAprendicesPromise() {
    return fetchWithAuth(window.API_FICHAS)
        .then(response => {
            if (!response.ok) throw new Error('Error al cargar fichas');
            return response.json();
        })
        .then(data => {
            window.fichasListaCompleta = data;
            llenarSelectFichasAprendices();
        })
        .catch(error => console.error('Error:', error));
}

function llenarSelectUsuariosAprendices() {
    const selects = [
        document.getElementById('aprendiz-usuario'),
        document.getElementById('aprendiz-usuario-edit')
    ].filter(s => s);
    
    if (selects.length === 0) return;
    
    console.log('Llenando select de usuarios aprendices...');
    console.log('Roles disponibles:', window.rolesDisponibles);
    console.log('Usuarios:', window.usuariosListaCompleta);
    
    // Buscar todos los roles que contengan "aprendiz" (sin importar mayúsculas)
    const rolesAprendiz = window.rolesDisponibles.filter(rol => 
        rol.nombreRol && rol.nombreRol.toLowerCase().includes('aprendiz')
    );
    
    const rolesAprendizIds = rolesAprendiz.map(rol => rol.id);
    
    console.log('Roles Aprendiz encontrados:', rolesAprendiz);
    console.log('IDs de roles Aprendiz:', rolesAprendizIds);
    
    // Filtrar solo usuarios con rol de Aprendiz
    const usuariosAprendices = window.usuariosListaCompleta.filter(usuario => {
        if (!usuario.rol) {
            console.log('Usuario sin rol:', usuario);
            return false;
        }
        const esAprendiz = rolesAprendizIds.includes(usuario.rol.id);
        console.log(`Usuario ${usuario.nombre}: rol.id=${usuario.rol.id}, esAprendiz=${esAprendiz}`);
        return esAprendiz;
    });
    
    console.log('Usuarios aprendices filtrados:', usuariosAprendices);
    
    // Llenar cada select
    selects.forEach(select => {
        while (select.options.length > 1) {
            select.remove(1);
        }
        
        // Si no hay usuarios aprendices
        if (usuariosAprendices.length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'No hay usuarios con rol Aprendiz';
            option.disabled = true;
            select.appendChild(option);
            return;
        }
        
        usuariosAprendices.forEach(usuario => {
            const option = document.createElement('option');
            option.value = usuario.id;
            option.textContent = `${usuario.nombre} ${usuario.apellido} (${usuario.correo})`;
            select.appendChild(option);
        });
    });
}

function llenarSelectFichasAprendices() {
    const selects = [
        document.getElementById('aprendiz-ficha'),
        document.getElementById('aprendiz-ficha-edit')
    ].filter(s => s);
    
    if (selects.length === 0) return;
    
    selects.forEach(select => {
        while (select.options.length > 1) {
            select.remove(1);
        }
        
        window.fichasListaCompleta.forEach(ficha => {
            const option = document.createElement('option');
            option.value = ficha.id;
            option.textContent = `${ficha.codigoFicha} - ${ficha.programaFormacion}`;
            select.appendChild(option);
        });
    });
}

function cargarAprendices() {
     fetchWithAuth(window.API_APRENDICES)
         .then(response => {
             if (!response.ok) throw new Error('Error al cargar aprendices');
             return response.json();
         })
         .then(data => {
             window.aprendicesListaCompleta = data;
             mostrarAprendices(data);
             // Llenar filtros después de cargar aprendices
             llenarSelectFichasEnFiltro();
         })
         .catch(error => {
             console.error('Error:', error);
             mostrarNotificacionGlobal('Error al cargar aprendices', 'error');
         });
 }

function mostrarAprendices(aprendices) {
    const tbody = document.getElementById('aprendices-tbody');
    tbody.innerHTML = '';
    
    if (aprendices.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="no-data">No hay aprendices registrados</td></tr>';
        return;
    }
    
    aprendices.forEach(aprendiz => {
        const usuario = window.usuariosListaCompleta.find(u => u.id === aprendiz.usuario?.id);
        const ficha = window.fichasListaCompleta.find(f => f.id === aprendiz.ficha?.id);
        const esActivo = aprendiz.estado === 'ACTIVO';
        const estado = aprendiz.estado || 'ACTIVO';
        const claseEstado = estado.toLowerCase() === 'activo' ? 'activo' : 'inactivo';
        
        const row = document.createElement('tr');
        const botonEstado = esActivo 
            ? `<button class="btn-action btn-eliminar" onclick="desactivarAprendiz(${aprendiz.id})" title="Desactivar">Desactivar</button>`
            : `<button class="btn-action btn-reactivar" onclick="activarAprendiz(${aprendiz.id})" title="Activar">Activar</button>`;
        
        row.innerHTML = `
             <td>${aprendiz.id}</td>
             <td>${usuario ? usuario.nombre + ' ' + usuario.apellido : 'N/A'}</td>
             <td>${ficha ? ficha.codigoFicha : 'N/A'}</td>
             <td><span class="estado ${claseEstado}">${estado}</span></td>
             <td class="acciones">
                 <button class="btn-action btn-ver" onclick="verAprendiz(${aprendiz.id})" title="Ver">Ver</button>
                 <button class="btn-action btn-editar" onclick="abrirEditarAprendiz(${aprendiz.id})" title="Editar">Editar</button>
                 ${botonEstado}
             </td>
         `;
         tbody.appendChild(row);
    });
}

// ===== FILTROS =====
function setupFiltrosAprendices() {
     const searchEl = document.getElementById('aprendices-search');
     const fichaFilterEl = document.getElementById('aprendices-ficha-filter');
     const estadoFilterEl = document.getElementById('aprendices-estado-filter');
     
     if (searchEl) searchEl.addEventListener('keyup', aplicarFiltrosAprendices);
     if (fichaFilterEl) fichaFilterEl.addEventListener('change', aplicarFiltrosAprendices);
     if (estadoFilterEl) estadoFilterEl.addEventListener('change', aplicarFiltrosAprendices);
     
     // Llenar select de fichas en el filtro
     llenarSelectFichasEnFiltro();
 }
 
 function llenarSelectFichasEnFiltro() {
     const select = document.getElementById('aprendices-ficha-filter');
     if (!select) return;
     
     while (select.options.length > 1) {
         select.remove(1);
     }
     
     window.fichasListaCompleta.forEach(ficha => {
         const option = document.createElement('option');
         option.value = ficha.id;
         option.textContent = ficha.codigoFicha;
         select.appendChild(option);
     });
 }
 
 function aplicarFiltrosAprendices() {
     const searchTerm = document.getElementById('aprendices-search')?.value.toLowerCase() || '';
     const fichaFilter = document.getElementById('aprendices-ficha-filter')?.value || '';
     const estadoFilter = document.getElementById('aprendices-estado-filter')?.value || '';
     
     console.log('Filtros aplicados - Búsqueda:', searchTerm, 'Ficha:', fichaFilter, 'Estado:', estadoFilter);
     console.log('Total aprendices:', window.aprendicesListaCompleta?.length);
     
     let aprendicesFiltrados = window.aprendicesListaCompleta.filter(aprendiz => {
         const usuario = window.usuariosListaCompleta.find(u => u.id === aprendiz.usuario?.id);
         const nombreCompleto = usuario ? (usuario.nombre + ' ' + usuario.apellido).toLowerCase() : '';
         
         const matchNombre = nombreCompleto.includes(searchTerm);
         const matchFicha = !fichaFilter || (aprendiz.ficha && parseInt(aprendiz.ficha.id) === parseInt(fichaFilter));
         const matchEstado = !estadoFilter || aprendiz.estado === estadoFilter;
         
         console.log(`Aprendiz ${aprendiz.id}: nombre match=${matchNombre}, ficha match=${matchFicha}, estado match=${matchEstado}, ficha.id=${aprendiz.ficha?.id}`);
         
         return matchNombre && matchFicha && matchEstado;
     });
     
     console.log('Aprendices filtrados:', aprendicesFiltrados.length);
     mostrarAprendices(aprendicesFiltrados);
 }

// ===== CREAR APRENDIZ =====
function crearAprendiz(event) {
     event.preventDefault();
     
     const usuarioId = document.getElementById('aprendiz-usuario').value;
     const fichaId = document.getElementById('aprendiz-ficha').value;
     const nivel = document.getElementById('aprendiz-nivel').value;
     
     console.log('Creando aprendiz con usuarioId:', usuarioId, 'fichaId:', fichaId, 'nivel:', nivel);
     
     if (!usuarioId) {
         mostrarNotificacionGlobal('Por favor selecciona un usuario', 'warning');
         return;
     }
     
     if (!nivel) {
         mostrarNotificacionGlobal('Por favor selecciona el nivel de formación', 'warning');
         return;
     }
     
     const nuevoAprendiz = {
         usuarioId: parseInt(usuarioId),
         fichaId: fichaId ? parseInt(fichaId) : null,
         nivel: nivel
     };
    
    console.log('Datos a enviar:', JSON.stringify(nuevoAprendiz));
    console.log('URL:', `${window.API_APRENDICES}/por-ids`);
     
    fetch(`${window.API_APRENDICES}/por-ids`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoAprendiz)
    })
    .then(response => {
        console.log('Respuesta:', response.status, response.ok);
        if (!response.ok) {
            return response.text().then(text => {
                throw new Error(`Error ${response.status}: ${text}`);
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('Aprendiz creado:', data);
        mostrarNotificacionGlobal('Aprendiz creado exitosamente', 'success');
        closeModal('modal-crear-aprendiz');
        document.getElementById('form-crear-aprendiz').reset();
        cargarAprendices();
    })
    .catch(error => {
        console.error('Error completo:', error);
        mostrarNotificacionGlobal('Error: ' + error.message, 'error');
    });
}

// ===== EDITAR APRENDIZ =====
function abrirEditarAprendiz(id) {
    const aprendiz = window.aprendicesListaCompleta.find(a => a.id === id);
    if (!aprendiz) return;
    
    // Llenar los selects antes de abrir el modal
    llenarSelectUsuariosAprendices();
    llenarSelectFichasAprendices();
    
    document.getElementById('aprendiz-id-edit').value = aprendiz.id;
    document.getElementById('aprendiz-usuario-edit').value = aprendiz.usuario?.id || '';
    document.getElementById('aprendiz-ficha-edit').value = aprendiz.ficha?.id || '';
    
    openModal('modal-editar-aprendiz');
}

function actualizarAprendiz(event) {
    event.preventDefault();
    
    const id = document.getElementById('aprendiz-id-edit').value;
    const usuarioId = document.getElementById('aprendiz-usuario-edit').value;
    const fichaId = document.getElementById('aprendiz-ficha-edit').value;
    
    if (!usuarioId || !fichaId) {
        mostrarNotificacionGlobal('Por favor completa todos los campos', 'warning');
        return;
    }
    
    const aprendizActualizado = {
        usuarioId: parseInt(usuarioId),
        fichaId: parseInt(fichaId)
    };
    
    fetch(`${window.API_APRENDICES}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aprendizActualizado)
    })
    .then(response => {
        if (!response.ok) throw new Error('Error al actualizar aprendiz');
        return response.json();
    })
    .then(data => {
        mostrarNotificacionGlobal('Aprendiz actualizado exitosamente', 'success');
        closeModal('modal-editar-aprendiz');
        cargarAprendices();
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarNotificacionGlobal('Error: ' + error.message, 'error');
    });
}

// ===== VER APRENDIZ =====
function verAprendiz(id) {
    const aprendiz = window.aprendicesListaCompleta.find(a => a.id === id);
    if (!aprendiz) return;
    
    const usuario = window.usuariosListaCompleta.find(u => u.id === aprendiz.usuario?.id);
    const ficha = window.fichasListaCompleta.find(f => f.id === aprendiz.ficha?.id);
    
    const mensaje = `
ID: ${aprendiz.id}
Usuario: ${usuario ? usuario.nombre + ' ' + usuario.apellido : 'N/A'}
Correo: ${usuario ? usuario.correo : 'N/A'}
Ficha: ${ficha ? ficha.codigoFicha + ' - ' + ficha.programaFormacion : 'N/A'}
Estado: ${aprendiz.estado || 'ACTIVO'}
    `;
    
    alert(mensaje);
}

// ===== DESACTIVAR APRENDIZ =====
function desactivarAprendiz(id) {
    if (!confirm('¿Estás seguro de que deseas desactivar este aprendiz?')) {
        return;
    }
    
    fetch(`${window.API_APRENDICES}/${id}/desactivar`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => {
        if (!response.ok) throw new Error('Error al desactivar aprendiz');
        mostrarNotificacionGlobal('Aprendiz desactivado exitosamente', 'success');
        cargarAprendices();
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarNotificacionGlobal('Error: ' + error.message, 'error');
    });
}

// ===== ACTIVAR APRENDIZ =====
function activarAprendiz(id) {
    if (!confirm('¿Estás seguro de que deseas activar este aprendiz?')) {
        return;
    }
    
    fetch(`${window.API_APRENDICES}/${id}/activar`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => {
        if (!response.ok) throw new Error('Error al activar aprendiz');
        mostrarNotificacionGlobal('Aprendiz activado exitosamente', 'success');
        cargarAprendices();
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarNotificacionGlobal('Error: ' + error.message, 'error');
    });
}
