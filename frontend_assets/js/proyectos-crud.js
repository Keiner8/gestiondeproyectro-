// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    cargarGaesParaProyectos();
    cargarProyectos();
    setupFiltrosProyectos();
});

// ===== CAMBIAR MODO DOCUMENTO =====
function activarModoDocumento(modo, isEdit = false) {
    const suffix = isEdit ? '-edit' : '';
    const urlContainer = document.getElementById(`documento-url-container${suffix}`);
    const archivoContainer = document.getElementById(`documento-archivo-container${suffix}`);
    
    if (modo === 'url') {
        urlContainer.style.display = 'block';
        archivoContainer.style.display = 'none';
        document.getElementById(`proyecto-documento-archivo${suffix}`).value = '';
    } else {
        urlContainer.style.display = 'none';
        archivoContainer.style.display = 'block';
        document.getElementById(`proyecto-documento-url${suffix}`).value = '';
    }
}

// ===== CARGAR DATOS =====
function cargarGaesParaProyectos() {
    fetchWithAuth(window.API_GAES)
        .then(response => {
            if (!response.ok) throw new Error('Error al cargar GAES');
            return response.json();
        })
        .then(data => {
            window.gaesListaCompleta = data;
            llenarSelectGaesProyectos();
        })
        .catch(error => console.error('Error:', error));
}

function llenarSelectGaesProyectos() {
    const select = document.getElementById('proyecto-gaes');
    const selectEdit = document.getElementById('proyecto-gaes-edit');
    
    [select, selectEdit].forEach(sel => {
        if (!sel) return;
        while (sel.options.length > 1) {
            sel.remove(1);
        }
        window.gaesListaCompleta.forEach(gae => {
            const option = document.createElement('option');
            option.value = gae.id;
            option.textContent = gae.nombre;
            sel.appendChild(option);
        });
    });
}

function cargarProyectos() {
    fetchWithAuth(window.API_PROYECTOS)
        .then(response => {
            if (!response.ok) throw new Error('Error al cargar proyectos');
            return response.json();
        })
        .then(data => {
            window.proyectosListaCompleta = data;
            mostrarProyectos(data);
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarNotificacionGlobal('Error al cargar proyectos', 'error');
        });
}

function mostrarProyectos(proyectos) {
    const tbody = document.getElementById('proyectos-tbody');
    tbody.innerHTML = '';
    
    if (proyectos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="no-data">No hay proyectos registrados</td></tr>';
        return;
    }
    
    proyectos.forEach(proyecto => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${proyecto.id}</td>
            <td>${proyecto.nombre}</td>
            <td>${proyecto.gaes?.nombre || 'Sin asignar'}</td>
            <td>-</td>
            <td>-</td>
            <td><span class="estado ${proyecto.estado?.toLowerCase()}">${proyecto.estado || 'N/A'}</span></td>
            <td>${proyecto.fechaCreacion ? new Date(proyecto.fechaCreacion).toLocaleDateString('es-ES') : 'N/A'}</td>
            <td class="acciones">
                <button class="btn-action btn-primary" onclick="abrirEditarProyecto(${proyecto.id})" title="Editar">EDITAR</button>
                <button class="btn-action btn-danger" onclick="eliminarProyecto(${proyecto.id})" title="Eliminar">ELIMINAR</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// ===== FILTROS =====
function setupFiltrosProyectos() {
    const searchEl = document.getElementById('proyectos-search');
    const filterEl = document.getElementById('proyectos-estado-filter');
    if (searchEl) searchEl.addEventListener('keyup', aplicarFiltrosProyectos);
    if (filterEl) filterEl.addEventListener('change', aplicarFiltrosProyectos);
}

function aplicarFiltrosProyectos() {
    const searchTerm = document.getElementById('proyectos-search')?.value.toLowerCase() || '';
    const estadoFilter = document.getElementById('proyectos-estado-filter')?.value || '';
    
    let proyectosFiltrados = window.proyectosListaCompleta.filter(proyecto => {
        const matchNombre = proyecto.nombre.toLowerCase().includes(searchTerm);
        const matchEstado = !estadoFilter || proyecto.estado === estadoFilter;
        return matchNombre && matchEstado;
    });
    
    mostrarProyectos(proyectosFiltrados);
}

// ===== CREAR PROYECTO =====
function crearProyecto(event) {
    event.preventDefault();
    
    const nombre = document.getElementById('proyecto-nombre').value;
    const descripcion = document.getElementById('proyecto-descripcion').value;
    const gaesId = document.getElementById('proyecto-gaes').value;
    const estado = document.getElementById('proyecto-estado').value;
    
    if (!nombre || !gaesId) {
        mostrarNotificacionGlobal('Por favor completa los campos obligatorios', 'warning');
        return;
    }
    
    const documentoUrl = document.getElementById('proyecto-documento-url').value;
    const documentoArchivo = document.getElementById('proyecto-documento-archivo').files[0];
    
    const nuevoProyecto = {
        nombre: nombre,
        descripcion: descripcion,
        gaes: { id: parseInt(gaesId) },
        documentoUrl: documentoUrl || null,
        estado: estado
    };
    
    // Si hay archivo, usa FormData
    if (documentoArchivo) {
        const formData = new FormData();
        formData.append('nombre', nombre);
        formData.append('descripcion', descripcion);
        formData.append('gaesId', gaesId);
        formData.append('estado', estado);
        formData.append('documento', documentoArchivo);
        
        fetchWithAuth(window.API_PROYECTOS, {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) throw new Error('Error al crear proyecto');
            return response.json();
        })
        .then(data => {
            mostrarNotificacionGlobal('Proyecto creado exitosamente', 'success');
            closeModal('modal-crear-proyecto');
            document.getElementById('form-crear-proyecto').reset();
            cargarProyectos();
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarNotificacionGlobal('Error: ' + error.message, 'error');
        });
    } else {
        // Si es URL, usa JSON
        fetchWithAuth(window.API_PROYECTOS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoProyecto)
        })
        .then(response => {
            if (!response.ok) throw new Error('Error al crear proyecto');
            return response.json();
        })
        .then(data => {
            mostrarNotificacionGlobal('Proyecto creado exitosamente', 'success');
            closeModal('modal-crear-proyecto');
            document.getElementById('form-crear-proyecto').reset();
            cargarProyectos();
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarNotificacionGlobal('Error: ' + error.message, 'error');
        });
    }
}

// ===== EDITAR PROYECTO =====
function abrirEditarProyecto(id) {
     const proyecto = window.proyectosListaCompleta.find(p => p.id === id);
     if (!proyecto) return;
     
     document.getElementById('proyecto-id-edit').value = proyecto.id;
     document.getElementById('proyecto-nombre-edit').value = proyecto.nombre;
     document.getElementById('proyecto-descripcion-edit').value = proyecto.descripcion || '';
     document.getElementById('proyecto-gaes-edit').value = proyecto.gaes?.id || '';
     document.getElementById('proyecto-estado-edit').value = proyecto.estado || '';
     
     // Agregar fechas si los campos existen
     const fechaInicioEdit = document.getElementById('proyecto-fecha-inicio-edit');
     const fechaFinEdit = document.getElementById('proyecto-fecha-fin-edit');
     
     if (fechaInicioEdit && proyecto.fechaInicio) {
         fechaInicioEdit.value = proyecto.fechaInicio;
     }
     if (fechaFinEdit && proyecto.fechaFin) {
         fechaFinEdit.value = proyecto.fechaFin;
     }
     
     openModal('modal-editar-proyecto');
 }

function actualizarProyecto(event) {
    event.preventDefault();
    
    const id = document.getElementById('proyecto-id-edit').value;
    const nombre = document.getElementById('proyecto-nombre-edit').value;
    const descripcion = document.getElementById('proyecto-descripcion-edit').value;
    const gaesId = document.getElementById('proyecto-gaes-edit').value;
    const estado = document.getElementById('proyecto-estado-edit').value;
    
    if (!nombre || !gaesId) {
        mostrarNotificacionGlobal('Por favor completa los campos obligatorios', 'warning');
        return;
    }
    
    const documentoUrl = document.getElementById('proyecto-documento-url-edit').value;
    const documentoArchivo = document.getElementById('proyecto-documento-archivo-edit').files[0];
    
    const proyectoActualizado = {
        id: id,
        nombre: nombre,
        descripcion: descripcion,
        gaes: { id: parseInt(gaesId) },
        documentoUrl: documentoUrl || null,
        estado: estado
    };
    
    // Si hay archivo nuevo, usa FormData
    if (documentoArchivo) {
        const formData = new FormData();
        formData.append('id', id);
        formData.append('nombre', nombre);
        formData.append('descripcion', descripcion);
        formData.append('gaesId', gaesId);
        formData.append('estado', estado);
        formData.append('documento', documentoArchivo);
        
        fetch(`${window.API_PROYECTOS}/${id}`, {
            method: 'PUT',
            body: formData
        })
        .then(response => {
            if (!response.ok) throw new Error('Error al actualizar proyecto');
            return response.json();
        })
        .then(data => {
            mostrarNotificacionGlobal('Proyecto actualizado exitosamente', 'success');
            closeModal('modal-editar-proyecto');
            cargarProyectos();
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarNotificacionGlobal('Error: ' + error.message, 'error');
        });
    } else {
        // Si es URL, usa JSON
        fetch(`${window.API_PROYECTOS}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(proyectoActualizado)
        })
        .then(response => {
            if (!response.ok) throw new Error('Error al actualizar proyecto');
            return response.json();
        })
        .then(data => {
            mostrarNotificacionGlobal('Proyecto actualizado exitosamente', 'success');
            closeModal('modal-editar-proyecto');
            cargarProyectos();
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarNotificacionGlobal('Error: ' + error.message, 'error');
        });
    }
}

// ===== ELIMINAR PROYECTO =====
function eliminarProyecto(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este proyecto?')) {
        return;
    }
    
    fetch(`${window.API_PROYECTOS}/${id}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) throw new Error('Error al eliminar proyecto');
        mostrarNotificacionGlobal('Proyecto eliminado exitosamente', 'success');
        cargarProyectos();
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarNotificacionGlobal('Error: ' + error.message, 'error');
    });
}
