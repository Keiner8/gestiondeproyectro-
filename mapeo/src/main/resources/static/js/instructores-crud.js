// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado, iniciando instructores...');
    cargarUsuariosParaInstructores();
    cargarFichasParaInstructores();
    setTimeout(() => {
        cargarInstructores();
        setupFiltrosInstructores();
        setupSeleccionadorModal();
    }, 500);
});

function setupSeleccionadorModal() {
    // Vacío - se llama desde el HTML directamente
}

// ===== CARGAR DATOS =====
function cargarUsuariosParaInstructores() {
    console.log('Iniciando carga de usuarios...');
    fetchWithAuth(window.API_USUARIOS)
        .then(response => {
            if (!response.ok) throw new Error('Error al cargar usuarios');
            return response.json();
        })
        .then(data => {
            console.log('Usuarios cargados:', data.length);
            window.usuariosListaCompleta = data;
        })
        .catch(error => {
            console.error('Error cargando usuarios:', error);
            setTimeout(cargarUsuariosParaInstructores, 2000);
        });
}

function cargarFichasParaInstructores() {
    console.log('Iniciando carga de fichas...');
    fetchWithAuth(window.API_FICHAS)
        .then(response => {
            if (!response.ok) throw new Error('Error al cargar fichas');
            return response.json();
        })
        .then(data => {
            console.log('Fichas cargadas:', data.length);
            window.fichasListaCompleta = data;
            llenarSelectFichasInstructores();
        })
        .catch(error => {
            console.error('Error cargando fichas:', error);
            setTimeout(cargarFichasParaInstructores, 2000);
        });
}

function llenarSelectFichasInstructores() {
     const selects = [
         document.getElementById('instructor-ficha'),
         document.getElementById('instructor-ficha-edit')
     ].filter(Boolean);
     
     if (!window.fichasListaCompleta) {
         console.error('Fichas no cargadas');
         return;
     }
     
     selects.forEach(select => {
         // Limpiar opciones anteriores (excepto la primera)
         while (select.options.length > 1) {
             select.remove(1);
         }
         
         // Agregar fichas
         window.fichasListaCompleta.forEach(ficha => {
             const option = document.createElement('option');
             option.value = ficha.id;
             const codigo = ficha.codigoFicha || 'S/N';
             const programa = ficha.programaFormacion || 'Sin programa';
             option.textContent = `${codigo} - ${programa}`;
             select.appendChild(option);
         });
     });
 }

 function llenarSelectUsuarios() {
     const select = document.getElementById('instructor-usuario');
     
     if (!select) {
         console.error('Select instructor-usuario no encontrado');
         return;
     }
     
     if (!window.usuariosListaCompleta || window.usuariosListaCompleta.length === 0) {
         console.warn('Usuarios no cargados aún, esperando...');
         setTimeout(llenarSelectUsuarios, 500);
         return;
     }
     
     // Limpiar opciones anteriores (excepto la primera)
     while (select.options.length > 1) {
         select.remove(1);
     }
     
     // Filtrar solo usuarios con rol instructor
     const usuariosInstructores = window.usuariosListaCompleta.filter(usuario => 
         usuario.rol && usuario.rol.nombreRol && 
         usuario.rol.nombreRol.toLowerCase().includes('instructor')
     );
     
     // Agregar solo usuarios instructores
     usuariosInstructores.forEach(usuario => {
         const option = document.createElement('option');
         option.value = usuario.id;
         option.textContent = `${usuario.nombre} ${usuario.apellido}`;
         select.appendChild(option);
     });
     
     if (usuariosInstructores.length === 0) {
         const option = document.createElement('option');
         option.value = '';
         option.textContent = 'No hay usuarios con rol Instructor';
         option.disabled = true;
         select.appendChild(option);
     }
 }

 function llenarSelectUsuariosEdit() {
     const select = document.getElementById('instructor-usuario-edit');
     
     if (!select) {
         console.error('Select instructor-usuario-edit no encontrado');
         return;
     }
     
     if (!window.usuariosListaCompleta || window.usuariosListaCompleta.length === 0) {
         console.warn('Usuarios no cargados aún, esperando...');
         setTimeout(llenarSelectUsuariosEdit, 500);
         return;
     }
     
     // Limpiar opciones anteriores (excepto la primera)
     while (select.options.length > 1) {
         select.remove(1);
     }
     
     // Filtrar solo usuarios con rol instructor
     const usuariosInstructores = window.usuariosListaCompleta.filter(usuario => 
         usuario.rol && usuario.rol.nombreRol && 
         usuario.rol.nombreRol.toLowerCase().includes('instructor')
     );
     
     // Agregar solo usuarios instructores
     usuariosInstructores.forEach(usuario => {
         const option = document.createElement('option');
         option.value = usuario.id;
         option.textContent = `${usuario.nombre} ${usuario.apellido}`;
         select.appendChild(option);
     });
     
     if (usuariosInstructores.length === 0) {
         const option = document.createElement('option');
         option.value = '';
         option.textContent = 'No hay usuarios con rol Instructor';
         option.disabled = true;
         select.appendChild(option);
     }
 }

function cargarInstructores() {
    fetchWithAuth(window.API_INSTRUCTORES)
        .then(response => {
            if (!response.ok) throw new Error('Error al cargar instructores');
            return response.json();
        })
        .then(data => {
            window.instructoresListaCompleta = data;
            mostrarInstructores(data);
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarNotificacionGlobal('Error al cargar instructores', 'error');
        });
}

function mostrarInstructores(instructores) {
    const tbody = document.getElementById('instructores-tbody');
    tbody.innerHTML = '';
    
    if (instructores.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="no-data">No hay instructores registrados</td></tr>';
        return;
    }
    
    instructores.forEach(instructor => {
        const usuario = window.usuariosListaCompleta ? window.usuariosListaCompleta.find(u => u.id === instructor.usuarioId) : null;
        const usuarioNombre = usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Sin asignar';
        
        const ficha = window.fichasListaCompleta ? window.fichasListaCompleta.find(f => f.id === instructor.fichaId) : null;
        const fichaNombre = ficha ? ficha.codigoFicha : 'Sin asignar';
        
        const especialidad = instructor.especialidad || 'Sin especificar';
         const estado = (instructor.estado || 'ACTIVO').trim().toUpperCase();
        
        const row = document.createElement('tr');
         const estadoColor = estado === 'ACTIVO' ? '#d4edda' : '#f8d7da';
         const estadoTextColor = estado === 'ACTIVO' ? '#155724' : '#721c24';
         row.innerHTML = `
             <td>${instructor.id}</td>
             <td>${usuarioNombre}</td>
             <td>${fichaNombre}</td>
             <td>${especialidad}</td>
             <td><span style="background-color: ${estadoColor}; color: ${estadoTextColor}; padding: 6px 12px; border-radius: 20px; font-weight: 500;">${estado}</span></td>
            <td class="acciones">
                <button class="btn-action btn-info" onclick="abrirEditarInstructor(${instructor.id})" title="Ver/Editar">VER</button>
                <button class="btn-action btn-primary" onclick="abrirEditarInstructor(${instructor.id})" title="Editar">EDITAR</button>
                <button class="btn-action ${estado === 'ACTIVO' ? 'btn-danger' : 'btn-success'}" onclick="cambiarEstadoInstructor(${instructor.id})" title="Cambiar Estado">${estado === 'ACTIVO' ? 'DESACTIVAR' : 'ACTIVAR'}</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// ===== FILTROS =====
function setupFiltrosInstructores() {
    const searchEl = document.getElementById('instructores-search');
    
    if (searchEl) searchEl.addEventListener('keyup', aplicarFiltrosInstructores);
}

function aplicarFiltrosInstructores() {
    const searchTerm = document.getElementById('instructores-search')?.value.toLowerCase() || '';
    
    let instructoresFiltrados = window.instructoresListaCompleta.filter(instructor => {
        const usuario = window.usuariosListaCompleta ? window.usuariosListaCompleta.find(u => u.id === instructor.usuarioId) : null;
        const usuarioNombre = usuario ? `${usuario.nombre} ${usuario.apellido}`.toLowerCase() : '';
        return usuarioNombre.includes(searchTerm);
    });
    
    mostrarInstructores(instructoresFiltrados);
}

// ===== CREAR INSTRUCTOR =====
function crearInstructor(event) {
    event.preventDefault();
    
    const usuarioId = document.getElementById('instructor-usuario').value;
    const fichaId = document.getElementById('instructor-ficha').value;
    const especialidad = document.getElementById('instructor-especialidad')?.value || '';
    const estado = document.getElementById('instructor-estado')?.value || 'ACTIVO';
    
    if (!usuarioId || !fichaId) {
        mostrarNotificacionGlobal('Por favor completa todos los campos obligatorios', 'warning');
        return;
    }
    
    const nuevoInstructor = {
        usuarioId: parseInt(usuarioId),
        fichaId: parseInt(fichaId),
        especialidad: especialidad,
        estado: estado
    };
    
    fetchWithAuth(window.API_INSTRUCTORES, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoInstructor)
    })
    .then(response => {
        if (!response.ok) throw new Error('Error al crear instructor');
        return response.json();
    })
    .then(data => {
        mostrarNotificacionGlobal('Instructor creado exitosamente', 'success');
        closeModal('modal-crear-instructor');
        document.getElementById('form-crear-instructor').reset();
        cargarInstructores();
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarNotificacionGlobal('Error: ' + error.message, 'error');
    });
}

// ===== EDITAR INSTRUCTOR =====
function abrirEditarInstructor(id) {
    const instructor = window.instructoresListaCompleta.find(i => i.id === id);
    if (!instructor) return;
    
    document.getElementById('instructor-id-edit').value = instructor.id;
    document.getElementById('instructor-usuario-edit').value = instructor.usuarioId || '';
    document.getElementById('instructor-ficha-edit').value = instructor.fichaId || '';
    document.getElementById('instructor-especialidad-edit').value = instructor.especialidad || '';
    document.getElementById('instructor-estado-edit').value = instructor.estado || 'ACTIVO';
    
    llenarSelectUsuariosEdit();
    llenarSelectFichasInstructores();
    openModal('modal-editar-instructor');
}

function actualizarInstructor(event) {
    event.preventDefault();
    
    const id = document.getElementById('instructor-id-edit').value;
    const usuarioId = document.getElementById('instructor-usuario-edit').value;
    const fichaId = document.getElementById('instructor-ficha-edit').value;
    const especialidad = document.getElementById('instructor-especialidad-edit')?.value || '';
    const estado = document.getElementById('instructor-estado-edit')?.value || 'ACTIVO';
    
    if (!usuarioId || !fichaId) {
        mostrarNotificacionGlobal('Por favor completa todos los campos obligatorios', 'warning');
        return;
    }
    
    const instructorActualizado = {
        id: id,
        usuarioId: parseInt(usuarioId),
        fichaId: parseInt(fichaId),
        especialidad: especialidad,
        estado: estado
    };
    
    fetch(`${window.API_INSTRUCTORES}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(instructorActualizado)
    })
    .then(response => {
        if (!response.ok) throw new Error('Error al actualizar instructor');
        return response.json();
    })
    .then(data => {
        mostrarNotificacionGlobal('Instructor actualizado exitosamente', 'success');
        closeModal('modal-editar-instructor');
        cargarInstructores();
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarNotificacionGlobal('Error: ' + error.message, 'error');
    });
}

// ===== CAMBIAR ESTADO INSTRUCTOR =====
function cambiarEstadoInstructor(id) {
     const instructor = window.instructoresListaCompleta.find(i => i.id === id);
     if (!instructor) return;
     
     const estadoActual = (instructor.estado || 'ACTIVO').trim().toUpperCase();
     const nuevoEstado = estadoActual === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
     const mensaje = `¿Cambiar estado a ${nuevoEstado}?`;
     
     if (!confirm(mensaje)) {
         return;
     }
    const instructorActualizado = {
        id: id,
        usuarioId: instructor.usuarioId,
        fichaId: instructor.fichaId,
        especialidad: instructor.especialidad,
        estado: nuevoEstado
    };
    
    fetch(`${window.API_INSTRUCTORES}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(instructorActualizado)
    })
    .then(response => {
        if (!response.ok) throw new Error('Error al cambiar estado');
        // Actualizar en memoria inmediatamente
        instructor.estado = nuevoEstado;
        mostrarInstructores(window.instructoresListaCompleta);
        mostrarNotificacionGlobal(`Estado cambiado a ${nuevoEstado}`, 'success');
        // Recargar desde servidor después
        setTimeout(() => cargarInstructores(), 500);
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarNotificacionGlobal('Error: ' + error.message, 'error');
    });
}

// ===== ELIMINAR INSTRUCTOR =====
function eliminarInstructor(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este instructor?')) {
        return;
    }
    
    fetch(`${window.API_INSTRUCTORES}/${id}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) throw new Error('Error al eliminar instructor');
        mostrarNotificacionGlobal('Instructor eliminado exitosamente', 'success');
        cargarInstructores();
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarNotificacionGlobal('Error: ' + error.message, 'error');
    });
}
