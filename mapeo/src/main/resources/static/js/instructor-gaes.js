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
    
    fetchWithAuth(`/api/gaes?fichaId=${fichaId}`)
        .then(response => {
            if (!response.ok) throw new Error('Error al cargar GAES');
            return response.json();
        })
        .then(data => {
            gaesListaInstructor = data.filter(g => g.fichaId == fichaId);
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
        
        html += `
            <tr>
                <td>${gae.id}</td>
                <td>${gae.nombre}</td>
                <td>${estadoBadge}</td>
                <td>${integrantes}</td>
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
    
    let html = `
        <div id="modal-agregar-aprendices" class="modal" style="display: block;">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Agregar Aprendices a ${gaesNombre}</h2>
                    <button class="modal-close" onclick="closeModal('modal-agregar-aprendices')">&times;</button>
                </div>
                <div class="form-group" style="max-height: 400px; overflow-y: auto;">
    `;
    
    aprendicesDisponibles.forEach(aprendiz => {
        const isChecked = actualIds.includes(aprendiz.id) ? 'checked' : '';
        const nombre = aprendiz.usuarioNombre || aprendiz.nombres || '';
        const apellido = aprendiz.usuarioApellido || aprendiz.apellidos || '';
        const numeroDoc = aprendiz.numeroDocumento || '';
        html += `
            <label style="display: flex; align-items: center; margin-bottom: 10px; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                <input type="checkbox" class="aprendiz-checkbox" value="${aprendiz.id}" ${isChecked} data-gaes="${gaesId}">
                <span style="margin-left: 10px;">${nombre} ${apellido} (${numeroDoc})</span>
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
}

function guardarAprendicesGaes(gaesId) {
     const checkboxes = document.querySelectorAll('.aprendiz-checkbox[data-gaes="' + gaesId + '"]:checked');
     const aprendizIds = Array.from(checkboxes).map(cb => parseInt(cb.value));
     
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
         alert('Aprendices asignados exitosamente');
         closeModal('modal-agregar-aprendices');
         cargarGaesInstructor();
     })
     .catch(error => {
         console.error('Error:', error);
         alert('Error: ' + error.message);
     });
 }

// ============================================================
// ELIMINAR GAES
// ============================================================

function eliminarGaesInstructor(gaesId) {
    if (!confirm('¿Estás seguro de que deseas eliminar este GAES?')) {
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
