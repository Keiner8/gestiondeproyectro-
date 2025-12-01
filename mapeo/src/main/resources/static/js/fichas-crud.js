// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    cargarFichas();
    setupFiltrosFichas();
});

// ===== CARGAR DATOS =====
function cargarFichas() {
    fetchWithAuth(window.API_FICHAS)
        .then(response => {
            if (!response.ok) throw new Error('Error al cargar fichas');
            return response.json();
        })
        .then(data => {
            window.fichasListaCompleta = data;
            mostrarFichas(data);
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarNotificacionFicha('Error al cargar fichas', 'error');
        });
}

function mostrarFichas(fichas) {
    const tbody = document.getElementById('fichas-tbody');
    tbody.innerHTML = '';
    
    if (fichas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="no-data">No hay fichas registradas</td></tr>';
        return;
    }
    
    fichas.forEach(ficha => {
        const estadoBadge = ficha.estado === 'ACTIVO' 
            ? '<span class="badge badge-success">ACTIVO</span>' 
            : ficha.estado === 'INACTIVO'
            ? '<span class="badge badge-danger">INACTIVO</span>'
            : '<span class="badge badge-warning">FINALIZADO</span>';
        
        const botonEstado = ficha.estado === 'ACTIVO'
            ? `<button class="btn-action btn-danger" onclick="cambiarEstadoFicha(${ficha.id}, 'INACTIVO')" title="Desactivar">DESACTIVAR</button>`
            : `<button class="btn-action btn-success" onclick="cambiarEstadoFicha(${ficha.id}, 'ACTIVO')" title="Activar">ACTIVAR</button>`;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${ficha.id}</td>
            <td>${ficha.codigoFicha}</td>
            <td>${ficha.programaFormacion}</td>
            <td>${formatearJornada(ficha.jornada)}</td>
            <td>${formatearModalidad(ficha.modalidad)}</td>
            <td>${formatearFecha(ficha.fechaInicio)}</td>
            <td>${formatearFecha(ficha.fechaFin)}</td>
            <td>${estadoBadge}</td>
            <td class="acciones">
                <button class="btn-action btn-info" onclick="verFicha(${ficha.id})" title="Ver">VER</button>
                <button class="btn-action btn-primary" onclick="abrirEditarFicha(${ficha.id})" title="Editar">EDITAR</button>
                ${botonEstado}
            </td>
        `;
        tbody.appendChild(row);
    });
}

// ===== UTILIDADES DE FORMATO =====
function formatearJornada(jornada) {
    const map = {
        'MAÑANA': 'Mañana',
        'TARDE': 'Tarde',
        'NOCHE': 'Noche',
        'COMPLETA': 'Completa'
    };
    return map[jornada] || jornada;
}

function formatearModalidad(modalidad) {
    const map = {
        'PRESENCIAL': 'Presencial',
        'VIRTUAL': 'Virtual',
        'HIBRIDA': 'Híbrida'
    };
    return map[modalidad] || modalidad;
}

function formatearFecha(fecha) {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES');
}

// ===== FILTROS =====
function setupFiltrosFichas() {
    document.getElementById('fichas-search').addEventListener('keyup', aplicarFiltrosFichas);
    document.getElementById('fichas-estado-filter').addEventListener('change', aplicarFiltrosFichas);
}

function aplicarFiltrosFichas() {
    const searchTerm = document.getElementById('fichas-search').value.toLowerCase();
    const estadoFilter = document.getElementById('fichas-estado-filter').value;
    
    let fichasFiltradas = window.fichasListaCompleta.filter(ficha => {
        const matchBusqueda = ficha.codigoFicha.toLowerCase().includes(searchTerm) ||
                             ficha.programaFormacion.toLowerCase().includes(searchTerm);
        const matchEstado = !estadoFilter || ficha.estado === estadoFilter;
        
        return matchBusqueda && matchEstado;
    });
    
    mostrarFichas(fichasFiltradas);
}

// ===== CREAR FICHA =====
function crearFicha(event) {
    event.preventDefault();
    
    const codigo = document.getElementById('ficha-codigo').value;
    const programa = document.getElementById('ficha-programa').value;
    const jornada = document.getElementById('ficha-jornada').value;
    const modalidad = document.getElementById('ficha-modalidad').value;
    const fechaInicio = document.getElementById('ficha-inicio').value;
    const fechaFin = document.getElementById('ficha-fin').value;
    const estado = document.getElementById('ficha-estado').value;
    
    if (!codigo || !programa || !jornada || !modalidad || !fechaInicio || !fechaFin) {
        mostrarNotificacionFicha('Por favor completa todos los campos obligatorios', 'warning');
        return;
    }
    
    // Validar que la fecha fin sea mayor a la fecha inicio
    if (new Date(fechaFin) <= new Date(fechaInicio)) {
        mostrarNotificacionFicha('La fecha fin debe ser posterior a la fecha inicio', 'warning');
        return;
    }
    
    const fichanueva = {
        codigoFicha: codigo,
        programaFormacion: programa,
        jornada: jornada,
        modalidad: modalidad,
        fechaInicio: fechaInicio,
        fechaFin: fechaFin,
        estado: estado
    };
    
    fetchWithAuth(window.API_FICHAS, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(fichanueva)
    })
    .then(response => {
        if (!response.ok) {
            if (response.status === 400) {
                throw new Error('El código de ficha ya existe');
            }
            throw new Error('Error al crear ficha');
        }
        return response.json();
    })
    .then(data => {
        mostrarNotificacionFicha('Ficha creada exitosamente', 'success');
        closeModal('modal-crear-ficha');
        document.getElementById('form-crear-ficha').reset();
        cargarFichas();
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarNotificacionFicha('Error: ' + error.message, 'error');
    });
}

// ===== EDITAR FICHA =====
function abrirEditarFicha(id) {
    const ficha = window.fichasListaCompleta.find(f => f.id === id);
    if (!ficha) return;
    
    document.getElementById('ficha-id-edit').value = ficha.id;
    document.getElementById('ficha-codigo-edit').value = ficha.codigoFicha;
    document.getElementById('ficha-programa-edit').value = ficha.programaFormacion;
    document.getElementById('ficha-jornada-edit').value = ficha.jornada;
    document.getElementById('ficha-modalidad-edit').value = ficha.modalidad;
    document.getElementById('ficha-inicio-edit').value = ficha.fechaInicio;
    document.getElementById('ficha-fin-edit').value = ficha.fechaFin;
    document.getElementById('ficha-estado-edit').value = ficha.estado;
    
    openModal('modal-editar-ficha');
}

function actualizarFicha(event) {
    event.preventDefault();
    
    const id = document.getElementById('ficha-id-edit').value;
    const codigo = document.getElementById('ficha-codigo-edit').value;
    const programa = document.getElementById('ficha-programa-edit').value;
    const jornada = document.getElementById('ficha-jornada-edit').value;
    const modalidad = document.getElementById('ficha-modalidad-edit').value;
    const fechaInicio = document.getElementById('ficha-inicio-edit').value;
    const fechaFin = document.getElementById('ficha-fin-edit').value;
    const estado = document.getElementById('ficha-estado-edit').value;
    
    if (!codigo || !programa || !jornada || !modalidad || !fechaInicio || !fechaFin) {
        mostrarNotificacionFicha('Por favor completa todos los campos obligatorios', 'warning');
        return;
    }
    
    // Validar que la fecha fin sea mayor a la fecha inicio
    if (new Date(fechaFin) <= new Date(fechaInicio)) {
        mostrarNotificacionFicha('La fecha fin debe ser posterior a la fecha inicio', 'warning');
        return;
    }
    
    const fichaactualizada = {
        id: id,
        codigoFicha: codigo,
        programaFormacion: programa,
        jornada: jornada,
        modalidad: modalidad,
        fechaInicio: fechaInicio,
        fechaFin: fechaFin,
        estado: estado
    };
    
    fetchWithAuth(`${window.API_FICHAS}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(fichaactualizada)
    })
    .then(response => {
        if (!response.ok) throw new Error('Error al actualizar ficha');
        return response.json();
    })
    .then(data => {
        mostrarNotificacionFicha('Ficha actualizada exitosamente', 'success');
        closeModal('modal-editar-ficha');
        cargarFichas();
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarNotificacionFicha('Error al actualizar ficha: ' + error.message, 'error');
    });
}

// ===== VER FICHA =====
function verFicha(id) {
    const ficha = window.fichasListaCompleta.find(f => f.id === id);
    if (!ficha) return;
    
    const mensaje = `
ID: ${ficha.id}
Código: ${ficha.codigoFicha}
Programa: ${ficha.programaFormacion}
Jornada: ${formatearJornada(ficha.jornada)}
Modalidad: ${formatearModalidad(ficha.modalidad)}
Fecha Inicio: ${formatearFecha(ficha.fechaInicio)}
Fecha Fin: ${formatearFecha(ficha.fechaFin)}
Estado: ${ficha.estado}
    `;
    
    alert(mensaje);
}

// ===== CAMBIAR ESTADO FICHA =====
function cambiarEstadoFicha(id, nuevoEstado) {
    const ficha = window.fichasListaCompleta.find(f => f.id === id);
    if (!ficha) return;
    
    const fichaActualizada = {
        codigoFicha: ficha.codigoFicha,
        programaFormacion: ficha.programaFormacion,
        jornada: ficha.jornada,
        modalidad: ficha.modalidad,
        fechaInicio: ficha.fechaInicio,
        fechaFin: ficha.fechaFin,
        estado: nuevoEstado
    };
    
    fetchWithAuth(`${window.API_FICHAS}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fichaActualizada)
    })
    .then(response => {
        if (!response.ok) throw new Error('Error al cambiar estado');
        return response.json();
    })
    .then(data => {
        const accion = nuevoEstado === 'ACTIVO' ? 'activada' : 'desactivada';
        mostrarNotificacionFicha(`Ficha ${accion} exitosamente`, 'success');
        cargarFichas();
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarNotificacionFicha('Error: ' + error.message, 'error');
    });
}

// ===== ELIMINAR FICHA =====
function eliminarFicha(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta ficha?')) {
        return;
    }
    
    fetchWithAuth(`${window.API_FICHAS}/${id}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) throw new Error('Error al eliminar ficha');
        mostrarNotificacionFicha('Ficha eliminada exitosamente', 'success');
        cargarFichas();
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarNotificacionFicha('Error al eliminar ficha: ' + error.message, 'error');
    });
}

// ===== FUNCIONES AUXILIARES =====
function mostrarNotificacionFicha(mensaje, tipo = 'info') {
    mostrarNotificacionGlobal(mensaje, tipo);
}
