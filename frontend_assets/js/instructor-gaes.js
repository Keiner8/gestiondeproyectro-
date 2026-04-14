// ============================================================
// INSTRUCTOR GAES - JavaScript
// ============================================================

let gaesListaInstructor = [];

// ============================================================
// CARGAR Y MOSTRAR GAES
// ============================================================

function cargarGaesInstructor() {
     const fichaId = instructorData.instructor?.fichaId;
     
     if (!fichaId) {
         document.getElementById('gaes-list').innerHTML = '<p>No tienes ficha asignada</p>';
         return;
     }
     
     fetchWithAuth(`/api/gaes/ficha/${fichaId}/con-integrantes`)
         .then(response => {
             if (!response.ok) throw new Error('Error al cargar GAES');
             return response.json();
         })
         .then(data => {
             gaesListaInstructor = data;
             mostrarGaesInstructor();
         })
         .catch(error => {
             console.error('Error:', error);
             document.getElementById('gaes-list').innerHTML = '<p>Error al cargar GAES</p>';
         });
}

function mostrarGaesInstructor() {
    const container = document.getElementById('gaes-list');
    
    if (gaesListaInstructor.length === 0) {
        container.innerHTML = '<p class="no-data">No hay GAES creados en tu ficha</p>';
        return;
    }
    
    let html = `
        <table class="table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Estado</th>
                    <th>Integrantes</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    gaesListaInstructor.forEach(gae => {
        const estadoBadge = gae.estado === 'ACTIVO' 
            ? '<span class="badge badge-success">ACTIVO</span>' 
            : '<span class="badge badge-danger">INACTIVO</span>';
        
        const integrantes = gae.integrantes ? gae.integrantes.length : 0;
        const integrantesBtn = integrantes > 0 
            ? `<button class="btn-secondary btn-sm" onclick="verIntegrantesGaesInstructor(${gae.id})">${integrantes} integrante${integrantes !== 1 ? 's' : ''}</button>`
            : '<span style="color: #999;">Sin integrantes</span>';
        
        html += `
            <tr>
                <td>${gae.id}</td>
                <td>${gae.nombre}</td>
                <td>${estadoBadge}</td>
                <td>${integrantesBtn}</td>
                <td class="acciones">
                    <button class="btn-action btn-primary" onclick="abrirAgregarAprendicesGaes(${gae.id})" title="Agregar Aprendices">AGREGAR APRENDICES</button>
                    <button class="btn-action btn-danger" onclick="eliminarGaesInstructor(${gae.id})" title="Eliminar">ELIMINAR</button>
                </td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
}

// ============================================================
// CREAR GAES
// ============================================================

function crearGaesInstructor(event) {
    event.preventDefault();
    
    const nombre = document.getElementById('gaes-nombre-instructor').value;
    const fichaId = instructorData.instructor?.fichaId;
    
    if (!nombre || !fichaId) {
        alert('Por favor completa todos los campos');
        return;
    }
    
    const nuevoGaes = {
        nombre: nombre,
        fichaId: fichaId,
        estado: 'ACTIVO'
    };
    
    fetchWithAuth('/api/gaes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoGaes)
    })
    .then(response => {
        if (!response.ok) throw new Error('Error al crear GAES');
        return response.json();
    })
    .then(data => {
        alert('GAES creado exitosamente');
        closeModal('modal-crear-gaes-instructor');
        document.getElementById('form-crear-gaes-instructor').reset();
        cargarGaesInstructor();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error: ' + error.message);
    });
}

// ============================================================
// AGREGAR APRENDICES A GAES
// ============================================================

function abrirAgregarAprendicesGaes(gaesId) {
    const gae = gaesListaInstructor.find(g => g.id === gaesId);
    if (!gae) return;
    
    const fichaId = instructorData.instructor?.fichaId;
    
    // Cargar aprendices de la ficha
    fetchWithAuth(`/api/aprendices/ficha/${fichaId}/dto`)
        .then(response => {
            if (!response.ok) throw new Error('Error al cargar aprendices');
            return response.json();
        })
        .then(aprendices => {
            mostrarAgregarAprendicesModal(gaesId, gae.nombre, aprendices, gae.integrantes || []);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al cargar aprendices: ' + error.message);
        });
}

function mostrarAgregarAprendicesModal(gaesId, gaesNombre, aprendicesDisponibles, aprendicesActuales) {
    const actualIds = aprendicesActuales.map(a => a.id);
    const maxIntegrantes = 5;
    
    let html = `
        <div id="modal-agregar-aprendices" class="modal" style="display: block;">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Agregar Aprendices a ${gaesNombre}</h2>
                    <button class="modal-close" onclick="closeModal('modal-agregar-aprendices')">&times;</button>
                </div>
                <p style="margin-bottom: 12px; color: #cbd5e1;">Solo se muestran aprendices de tu ficha. Cada GAES puede tener maximo ${maxIntegrantes} aprendices.</p>
                <div class="form-group" style="max-height: 400px; overflow-y: auto;">
    `;
    
    aprendicesDisponibles.forEach(aprendiz => {
        const isChecked = actualIds.includes(aprendiz.id) ? 'checked' : '';
        const nombre = aprendiz.usuarioNombre || aprendiz.nombres || '';
        const apellido = aprendiz.usuarioApellido || aprendiz.apellidos || '';
        const numeroDoc = aprendiz.numeroDocumento || '';
        const gaesActual = aprendiz.gaesNombre && aprendiz.gaesId !== gaesId
            ? `<small style="display:block; color:#fbbf24;">Actualmente en: ${aprendiz.gaesNombre}</small>`
            : '';
        html += `
            <label style="display: flex; align-items: center; margin-bottom: 10px; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                <input type="checkbox" class="aprendiz-checkbox" value="${aprendiz.id}" ${isChecked} data-gaes="${gaesId}">
                <span style="margin-left: 10px;">${nombre} ${apellido} (${numeroDoc}) ${gaesActual}</span>
            </label>
        `;
    });
    
    html += `
                </div>
                <div class="modal-actions">
                    <button class="btn-primary" onclick="guardarAprendicesGaes(${gaesId})">Guardar</button>
                    <button class="btn-secondary" onclick="closeModal('modal-agregar-aprendices')">Cancelar</button>
                </div>
            </div>
        </div>
    `;
    
    // Agregar modal al DOM si no existe
    let modal = document.getElementById('modal-agregar-aprendices');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-agregar-aprendices';
        document.body.appendChild(modal);
    }
    modal.innerHTML = html;
    modal.style.display = 'block';

    const checkboxes = modal.querySelectorAll(`.aprendiz-checkbox[data-gaes="${gaesId}"]`);
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const seleccionados = modal.querySelectorAll(`.aprendiz-checkbox[data-gaes="${gaesId}"]:checked`);
            if (seleccionados.length > maxIntegrantes) {
                checkbox.checked = false;
                mostrarNotificacionGlobal(`Cada GAES solo admite ${maxIntegrantes} aprendices`, 'warning');
            }
        });
    });
}

function guardarAprendicesGaes(gaesId) {
     const checkboxes = document.querySelectorAll('.aprendiz-checkbox[data-gaes="' + gaesId + '"]:checked');
     const aprendizIds = Array.from(checkboxes).map(cb => parseInt(cb.value));

     if (aprendizIds.length > 5) {
         mostrarNotificacionGlobal('Cada GAES solo admite maximo 5 aprendices', 'warning');
         return;
     }
     
     console.log('Guardando aprendices para GAES:', gaesId, 'Aprendices:', aprendizIds);
     
     const actualizacion = {
         integrantes: aprendizIds.map(id => ({ id }))
     };
     
     // Usar el endpoint específico para asignar aprendices
     const url = `/api/gaes/${gaesId}/asignar-aprendices`;
     fetchWithAuth(url, {
         method: 'PUT',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(actualizacion)
     })
     .then(response => {
         if (!response.ok) {
             console.error('Error response:', response.status);
             throw new Error('Error al guardar aprendices');
         }
         return response.json();
     })
     .then(data => {
         console.log('✓ Aprendices asignados:', data);
         mostrarNotificacionGlobal('Aprendices asignados exitosamente', 'success');
         closeModal('modal-agregar-aprendices');
         cargarGaesInstructor();
     })
     .catch(error => {
         console.error('Error:', error);
         mostrarNotificacionGlobal('Error: ' + error.message, 'error');
     });
 }

// ============================================================
// ELIMINAR GAES
// ============================================================

async function eliminarGaesInstructor(gaesId) {
    if (window.confirmarAccion) {
        const confirmado = await window.confirmarAccion('Estas seguro de que deseas eliminar este GAES?', 'Eliminar GAES');
        if (!confirmado) return;
    } else if (!confirm('Estas seguro de que deseas eliminar este GAES?')) {
        return;
    }
    
    fetchWithAuth(`/api/gaes/${gaesId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) throw new Error('Error al eliminar GAES');
        alert('GAES eliminado exitosamente');
        cargarGaesInstructor();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error: ' + error.message);
    });
}

// ============================================================
// VER INTEGRANTES DEL GAES
// ============================================================

function verIntegrantesGaesInstructor(gaesId) {
    // Encontrar el GAES en la lista
    const gaes = gaesListaInstructor.find(g => g.id === gaesId);
    
    if (!gaes) {
        alert('No se encontró el GAES');
        return;
    }
    
    if (!gaes.integrantes || gaes.integrantes.length === 0) {
        alert('Este GAES no tiene integrantes');
        return;
    }
    
    console.log('Mostrando integrantes del GAES:', gaes.nombre);
    console.log('Integrantes:', gaes.integrantes);
    
    // Actualizar el titulo del modal
    document.getElementById('integrantes-gaes-titulo').textContent = `Integrantes - ${gaes.nombre}`;
    
    // Limpiar la tabla
    const tbody = document.getElementById('integrantes-gaes-tbody');
    tbody.innerHTML = '';
    
    // Llenar la tabla con los integrantes
    gaes.integrantes.forEach(integrante => {
        const tr = document.createElement('tr');
        const nombre = integrante.usuarioNombre || integrante.nombre || 'N/A';
        const correo = integrante.usuarioCorreo || integrante.correo || 'N/A';
        const esLider = integrante.esLider ? '👑 Líder' : 'Miembro';
        
        tr.innerHTML = `
            <td>${nombre}</td>
            <td>${correo}</td>
            <td>${esLider}</td>
            <td>
                <button class="btn-secondary btn-sm" onclick="removerIntegrantesGaes(${integrante.id}, ${gaesId})">
                    Remover
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    // Abrir el modal
    openModal('modal-ver-integrantes-gaes');
}

// Remover integrante del GAES
async function removerIntegrantesGaes(aprendizId, gaesId) {
    if (window.confirmarAccion) {
        const confirmado = await window.confirmarAccion('Estas seguro de que deseas remover este aprendiz del GAES?', 'Remover integrante');
        if (!confirmado) return;
    } else if (!confirm('Estas seguro de que deseas remover este aprendiz del GAES?')) {
        return;
    }
    
    fetchWithAuth(`/api/aprendices/${aprendizId}/gaes/${gaesId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) throw new Error('Error al remover aprendiz');
        alert('Aprendiz removido del GAES exitosamente');
        cargarGaesInstructor();
        closeModal('modal-ver-integrantes-gaes');
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error al remover aprendiz: ' + error.message);
    });
}

// ============================================================
// INICIALIZACIÓN
// ============================================================

// Llamar cuando se carga el instructor data
function initGaesInstructor() {
    // Llenar el campo de ficha en el modal
    if (instructorData.fichas && instructorData.fichas.length > 0) {
        const ficha = instructorData.fichas[0];
        document.getElementById('gaes-ficha-display').value = `${ficha.codigoFicha} - ${ficha.programaFormacion}`;
        document.getElementById('gaes-ficha-id').value = ficha.id;
    }
    
    cargarGaesInstructor();
}
