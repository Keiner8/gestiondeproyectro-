// ===== VER PROYECTOS DEL APRENDIZ - INSTRUCTOR =====

let instructorActual = null;
let proyectosGlobales = [];
let aprendicesGlobales = [];

document.addEventListener('DOMContentLoaded', () => {
    cargarProyectosAprendices();
});

function cargarProyectosAprendices() {
    const usuarioId = localStorage.getItem('usuarioId') || sessionStorage.getItem('usuarioId');
    const usuarioRol = localStorage.getItem('usuarioRol') || sessionStorage.getItem('usuarioRol');

    console.log('usuarioId:', usuarioId);
    console.log('usuarioRol:', usuarioRol);

    if (!usuarioId) {
        console.error('No se encontro ID de usuario');
        return;
    }

    const esInstructor = usuarioRol && usuarioRol.toLowerCase().includes('instructor');
    if (!esInstructor) {
        console.warn('El usuario tiene rol:', usuarioRol, '- continuando de todas formas');
    }

    fetchWithAuth(`${window.API_INSTRUCTORES}/usuario/${usuarioId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Instructor no encontrado');
            }
            return response.json();
        })
        .then(instructor => {
            if (!instructor || !instructor.id) {
                throw new Error('Instructor no encontrado');
            }

            return Promise.all([
                Promise.resolve(instructor),
                fetchWithAuth(`${window.API_APRENDICES}`).then(r => r.json()),
                fetchWithAuth(`${window.API_PROYECTOS}`).then(r => r.json()),
            ]);
        })
        .then(([instructor, aprendices, proyectos]) => {
            instructorActual = instructor;
            proyectosGlobales = Array.isArray(proyectos) ? proyectos : [];
            aprendicesGlobales = Array.isArray(aprendices) ? aprendices : [];
            mostrarProyectosAprendices(instructor, aprendicesGlobales, proyectosGlobales);
        })
        .catch(error => {
            console.error('Error cargando proyectos:', error);
            mostrarNotificacionGlobal('Error al cargar proyectos', 'error');
        });
}

function mostrarProyectosAprendices(instructor, aprendices, proyectos) {
    const tbody = document.getElementById('proyectos-aprendices-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (!Array.isArray(proyectos) || proyectos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="no-data">No hay proyectos registrados</td></tr>';
        return;
    }

    const proyectosRelevantes = proyectos.filter(() => true);

    if (proyectosRelevantes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="no-data">No hay proyectos registrados</td></tr>';
        return;
    }

    proyectosRelevantes.forEach(proyecto => {
        const row = document.createElement('tr');
        const estadoInfo = obtenerEstadoProyectoInfo(proyecto.estado);

        row.innerHTML = `
            <td>${proyecto.id}</td>
            <td>${proyecto.nombre}</td>
            <td>${proyecto.descripcion || 'Sin descripcion'}</td>
            <td><span style="background-color: ${estadoInfo.color}; color: ${estadoInfo.textColor}; padding: 4px 10px; border-radius: 999px; font-weight: 600; display: inline-block; min-width: 110px; text-align: center;">${estadoInfo.label}</span></td>
            <td>${proyecto.fechaInicio ? new Date(proyecto.fechaInicio).toLocaleDateString() : 'No definida'}</td>
            <td class="acciones">
                <button class="btn-action btn-info" onclick="verProyectoDetalle(${proyecto.id})" title="Ver">Ver</button>
                <button class="btn-action btn-primary" onclick="abrirCalificar(${proyecto.id})" title="Calificar">Calificar</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function obtenerEstadoProyectoInfo(estado) {
    const estadoNormalizado = (estado || '').toString().trim();

    if (['EN_PROCESO', 'EN_DESARROLLO', 'EN_REVISION', 'en_proceso'].includes(estadoNormalizado)) {
        return {
            label: 'En proceso',
            color: '#fef3c7',
            textColor: '#92400e',
        };
    }

    if (['FINALIZADO', 'APROBADO', 'finalizado'].includes(estadoNormalizado)) {
        return {
            label: 'Finalizado',
            color: '#dcfce7',
            textColor: '#166534',
        };
    }

    if (['CANCELADO', 'RECHAZADO', 'cancelado'].includes(estadoNormalizado)) {
        return {
            label: 'Cancelado',
            color: '#fee2e2',
            textColor: '#991b1b',
        };
    }

    return {
        label: estadoNormalizado || 'Sin estado',
        color: '#e5e7eb',
        textColor: '#374151',
    };
}

function verProyectoDetalle(id) {
    fetchWithAuth(`${window.API_PROYECTOS}/${id}`)
        .then(response => response.json())
        .then(proyecto => {
            const estadoInfo = obtenerEstadoProyectoInfo(proyecto.estado);
            const mensaje = `
ID: ${proyecto.id}
Proyecto: ${proyecto.nombre}
Descripcion: ${proyecto.descripcion || 'Sin descripcion'}
Estado: ${estadoInfo.label}
Fecha Inicio: ${proyecto.fechaInicio || 'No definida'}
Fecha Fin: ${proyecto.fechaFin || 'No definida'}
GAES ID: ${proyecto.gaesId}
            `;
            alert(mensaje);
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarNotificacionGlobal('Error al cargar proyecto', 'error');
        });
}

function abrirCalificar(proyectoId) {
    console.log('Abriendo calificacion para proyecto:', proyectoId);

    fetchWithAuth(`${window.API_PROYECTOS}/${proyectoId}`)
        .then(response => response.json())
        .then(proyecto => {
            document.getElementById('calificacion-proyecto-id').value = proyectoId;
            document.getElementById('calificacion-gaes-id').value = proyecto.gaesId;
            return fetchWithAuth(`${window.API_GAES}/${proyecto.gaesId}/con-integrantes`);
        })
        .then(response => response.json())
        .then(gaes => {
            if (gaes.integrantes && gaes.integrantes.length > 0) {
                const aprendicesIds = gaes.integrantes.map(aprendiz => aprendiz.id);
                document.getElementById('calificacion-aprendices-ids').value = JSON.stringify(aprendicesIds);
            } else {
                mostrarNotificacionGlobal('No hay aprendices en este GAES', 'warning');
                return;
            }

            openModal('modal-calificar');
        })
        .catch(error => {
            console.error('Error al cargar datos:', error);
            mostrarNotificacionGlobal('Error al cargar datos del proyecto', 'error');
        });
}

function guardarCalificacion(event) {
    event.preventDefault();

    const proyectoId = document.getElementById('calificacion-proyecto-id').value;
    const gaesId = document.getElementById('calificacion-gaes-id').value;
    const aprendicesIdsJson = document.getElementById('calificacion-aprendices-ids').value;
    const calificacion = document.getElementById('calificacion-nota').value;
    const observaciones = document.getElementById('calificacion-observaciones').value;

    if (!calificacion) {
        mostrarNotificacionGlobal('Por favor completa la calificacion', 'warning');
        return;
    }

    if (!instructorActual || !instructorActual.id) {
        mostrarNotificacionGlobal('Error: No se encontro el instructor', 'error');
        return;
    }

    if (!aprendicesIdsJson || !gaesId) {
        mostrarNotificacionGlobal('Error: Faltan datos del GAES o aprendices', 'error');
        return;
    }

    let aprendicesIds = [];
    try {
        aprendicesIds = JSON.parse(aprendicesIdsJson);
    } catch (error) {
        mostrarNotificacionGlobal('Error: Datos de aprendices invalidos', 'error');
        return;
    }

    const hoy = new Date().toISOString().split('T')[0];

    const promesas = aprendicesIds.map(aprendizId => {
        const evaluacion = {
            proyectoId: parseInt(proyectoId, 10),
            aprendizId: parseInt(aprendizId, 10),
            gaesId: parseInt(gaesId, 10),
            evaluadorId: instructorActual.id,
            calificacion: parseFloat(calificacion),
            observaciones: observaciones || '',
            fecha: hoy,
        };

        return fetchWithAuth(window.API_EVALUACIONES, {
            method: 'POST',
            body: JSON.stringify(evaluacion),
        });
    });

    Promise.all(promesas)
        .then(responses => {
            const allOk = responses.every(response => response.ok);
            if (!allOk) {
                throw new Error('Algunas evaluaciones fallaron');
            }
            return Promise.all(responses.map(response => response.json()));
        })
        .then(() => {
            mostrarNotificacionGlobal(`${aprendicesIds.length} aprendices calificados exitosamente`, 'success');
            closeModal('modal-calificar');
            document.getElementById('form-calificar').reset();
            cargarProyectosAprendices();
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarNotificacionGlobal(`Error: ${error.message}`, 'error');
        });
}

function filtrarProyectos() {
    if (!Array.isArray(proyectosGlobales) || proyectosGlobales.length === 0) {
        cargarProyectosAprendices();
        return;
    }

    const searchTerm = document.getElementById('proyectos-search')?.value.toLowerCase() || '';
    const estadoFiltro = document.getElementById('proyectos-estado-filter')?.value || '';

    const estadoMap = {
        en_proceso: ['EN_PROCESO', 'EN_DESARROLLO', 'EN_REVISION', 'en_proceso'],
        finalizado: ['FINALIZADO', 'APROBADO', 'finalizado'],
        cancelado: ['CANCELADO', 'RECHAZADO', 'cancelado'],
    };

    const estadosPermitidos = estadoMap[estadoFiltro] || null;

    const proyectosFiltrados = proyectosGlobales.filter(proyecto => {
        const cumpleBusqueda = !searchTerm ||
            proyecto.nombre.toLowerCase().includes(searchTerm) ||
            (proyecto.descripcion && proyecto.descripcion.toLowerCase().includes(searchTerm));

        const cumpleEstado = !estadoFiltro ||
            (proyecto.estado && estadosPermitidos && estadosPermitidos.includes(proyecto.estado));

        return cumpleBusqueda && cumpleEstado;
    });

    const tbody = document.getElementById('proyectos-aprendices-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (proyectosFiltrados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="no-data">No hay proyectos que coincidan con tu busqueda</td></tr>';
        return;
    }

    proyectosFiltrados.forEach(proyecto => {
        const row = document.createElement('tr');
        const estadoInfo = obtenerEstadoProyectoInfo(proyecto.estado);

        row.innerHTML = `
            <td>${proyecto.id}</td>
            <td>${proyecto.nombre}</td>
            <td>${proyecto.descripcion || 'Sin descripcion'}</td>
            <td><span style="background-color: ${estadoInfo.color}; color: ${estadoInfo.textColor}; padding: 4px 10px; border-radius: 999px; font-weight: 600; display: inline-block; min-width: 110px; text-align: center;">${estadoInfo.label}</span></td>
            <td>${proyecto.fechaInicio ? new Date(proyecto.fechaInicio).toLocaleDateString() : 'No definida'}</td>
            <td class="acciones">
                <button class="btn-action btn-info" onclick="verProyectoDetalle(${proyecto.id})" title="Ver">Ver</button>
                <button class="btn-action btn-primary" onclick="abrirCalificar(${proyecto.id})" title="Calificar">Calificar</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}
