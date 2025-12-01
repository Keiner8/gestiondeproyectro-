// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    cargarFichasParaGaes();
    cargarGaes();
    setupFiltrosGaes();
});

// ===== CARGAR DATOS =====
function cargarFichasParaGaes() {
    fetchWithAuth(window.API_FICHAS)
        .then(response => {
            if (!response.ok) throw new Error('Error al cargar fichas');
            return response.json();
        })
        .then(data => {
            window.fichasListaCompleta = data;
            llenarSelectFichasGaes();
        })
        .catch(error => console.error('Error cargando fichas:', error));
}

function llenarSelectFichasGaes() {
    const select = document.getElementById('gaes-ficha');
    const selectEdit = document.getElementById('gaes-ficha-edit');
    const selectFilter = document.getElementById('gaes-ficha-filter');
    
    [select, selectEdit, selectFilter].forEach(sel => {
        if (!sel) return;
        while (sel.options.length > 1) {
            sel.remove(1);
        }
        window.fichasListaCompleta.forEach(ficha => {
            const option = document.createElement('option');
            option.value = ficha.id;
            option.textContent = `${ficha.codigoFicha} - ${ficha.programaFormacion}`;
            sel.appendChild(option);
        });
    });
}

function cargarGaes() {
    fetchWithAuth(window.API_GAES)
        .then(response => {
            if (!response.ok) throw new Error('Error al cargar GAES');
            return response.json();
        })
        .then(data => {
            window.gaesListaCompleta = data;
            mostrarGaes(data);
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarNotificacionGlobal('Error al cargar GAES', 'error');
        });
}

function mostrarGaes(gaes) {
    const tbody = document.getElementById('gaes-tbody');
    tbody.innerHTML = '';
    
    if (gaes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="no-data">No hay GAES registrados</td></tr>';
        return;
    }
    
    gaes.forEach(gae => {
        const ficha = window.fichasListaCompleta.find(f => f.id === gae.fichaId);
        const fichaNombre = ficha ? ficha.codigoFicha : 'Sin asignar';
        const fichaPrograma = ficha ? ficha.programaFormacion : '';
        
        const estadoBadge = gae.estado === 'ACTIVO' 
            ? '<span class="badge badge-success">ACTIVO</span>' 
            : '<span class="badge badge-danger">INACTIVO</span>';
        
        const botonEstado = gae.estado === 'ACTIVO'
            ? `<button class="btn-action btn-danger" onclick="cambiarEstadoGaes(${gae.id}, 'INACTIVO')" title="Desactivar">DESACTIVAR</button>`
            : `<button class="btn-action btn-success" onclick="cambiarEstadoGaes(${gae.id}, 'ACTIVO')" title="Activar">ACTIVAR</button>`;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${gae.id}</td>
            <td>${gae.nombre}</td>
            <td>${gae.fichaId || 'N/A'}</td>
            <td>${fichaNombre}</td>
            <td>${fichaPrograma}</td>
            <td>${estadoBadge}</td>
            <td class="acciones">
                <button class="btn-action btn-info" onclick="abrirEditarGaes(${gae.id})" title="Ver">VER</button>
                <button class="btn-action btn-primary" onclick="abrirEditarGaes(${gae.id})" title="Editar">EDITAR</button>
                ${botonEstado}
            </td>
        `;
        tbody.appendChild(row);
    });
}

// ===== FILTROS =====
function setupFiltrosGaes() {
    const searchEl = document.getElementById('gaes-search');
    const filterEl = document.getElementById('gaes-ficha-filter');
    const estadoFilterEl = document.getElementById('gaes-estado-filter');
    if (searchEl) searchEl.addEventListener('keyup', aplicarFiltrosGaes);
    if (filterEl) filterEl.addEventListener('change', aplicarFiltrosGaes);
    if (estadoFilterEl) estadoFilterEl.addEventListener('change', aplicarFiltrosGaes);
}

function aplicarFiltrosGaes() {
    const searchTerm = document.getElementById('gaes-search')?.value.toLowerCase() || '';
    const fichaFilter = document.getElementById('gaes-ficha-filter')?.value || '';
    const estadoFilter = document.getElementById('gaes-estado-filter')?.value || '';
    
    let gaesFiltrados = window.gaesListaCompleta.filter(gae => {
        const matchNombre = gae.nombre.toLowerCase().includes(searchTerm);
        const matchFicha = !fichaFilter || gae.fichaId == fichaFilter;
        const matchEstado = !estadoFilter || gae.estado === estadoFilter;
        return matchNombre && matchFicha && matchEstado;
    });
    
    mostrarGaes(gaesFiltrados);
}

// ===== CREAR GAES =====
function crearGaes(event) {
    event.preventDefault();
    
    const nombre = document.getElementById('gaes-nombre').value;
    const fichaId = document.getElementById('gaes-ficha').value;
    const estado = document.getElementById('gaes-estado').value;
    
    if (!nombre || !fichaId) {
        mostrarNotificacionGlobal('Por favor completa todos los campos', 'warning');
        return;
    }
    
    const nuevoGaes = {
        nombre: nombre,
        fichaId: parseInt(fichaId),
        estado: estado
    };
    
    fetchWithAuth(window.API_GAES, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoGaes)
    })
    .then(response => {
        if (!response.ok) throw new Error('Error al crear GAES');
        return response.json();
    })
    .then(data => {
        mostrarNotificacionGlobal('GAES creado exitosamente', 'success');
        closeModal('modal-crear-gaes');
        document.getElementById('form-crear-gaes').reset();
        cargarGaes();
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarNotificacionGlobal('Error: ' + error.message, 'error');
    });
}

// ===== EDITAR GAES =====
function abrirEditarGaes(id) {
    const gae = window.gaesListaCompleta.find(g => g.id === id);
    if (!gae) return;
    
    document.getElementById('gaes-id-edit').value = gae.id;
    document.getElementById('gaes-nombre-edit').value = gae.nombre;
    document.getElementById('gaes-ficha-edit').value = gae.fichaId || '';
    document.getElementById('gaes-estado-edit').value = gae.estado || 'ACTIVO';
    
    openModal('modal-editar-gaes');
}

function actualizarGaes(event) {
    event.preventDefault();
    
    const id = document.getElementById('gaes-id-edit').value;
    const nombre = document.getElementById('gaes-nombre-edit').value;
    const fichaId = document.getElementById('gaes-ficha-edit').value;
    const estado = document.getElementById('gaes-estado-edit').value;
    
    if (!nombre || !fichaId) {
        mostrarNotificacionGlobal('Por favor completa todos los campos', 'warning');
        return;
    }
    
    const gaesActualizado = {
        id: id,
        nombre: nombre,
        fichaId: parseInt(fichaId),
        estado: estado
    };
    
    fetchWithAuth(`${window.API_GAES}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gaesActualizado)
    })
    .then(response => {
        if (!response.ok) throw new Error('Error al actualizar GAES');
        return response.json();
    })
    .then(data => {
        mostrarNotificacionGlobal('GAES actualizado exitosamente', 'success');
        closeModal('modal-editar-gaes');
        cargarGaes();
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarNotificacionGlobal('Error: ' + error.message, 'error');
    });
}

// ===== CAMBIAR ESTADO GAES =====
function cambiarEstadoGaes(id, nuevoEstado) {
    const gae = window.gaesListaCompleta.find(g => g.id === id);
    if (!gae) return;
    
    const gaesActualizado = {
        id: gae.id,
        nombre: gae.nombre,
        fichaId: gae.fichaId,
        estado: nuevoEstado
    };
    
    fetchWithAuth(`${window.API_GAES}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gaesActualizado)
    })
    .then(response => {
        if (!response.ok) throw new Error('Error al cambiar estado');
        return response.json();
    })
    .then(data => {
        const accion = nuevoEstado === 'ACTIVO' ? 'activado' : 'desactivado';
        mostrarNotificacionGlobal(`GAES ${accion} exitosamente`, 'success');
        cargarGaes();
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarNotificacionGlobal('Error: ' + error.message, 'error');
    });
}

// ===== ELIMINAR GAES =====
function eliminarGaes(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este GAES?')) {
        return;
    }
    
    fetchWithAuth(`${window.API_GAES}/${id}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) throw new Error('Error al eliminar GAES');
        mostrarNotificacionGlobal('GAES eliminado exitosamente', 'success');
        cargarGaes();
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarNotificacionGlobal('Error: ' + error.message, 'error');
    });
}
