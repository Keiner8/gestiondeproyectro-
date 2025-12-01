// ============================================================
// ADMINISTRADOR INSTRUCTORES - JavaScript
// ============================================================

let instructoresLista = [];
let aprendicesLista = [];

// ============================================================
// CARGAR INSTRUCTORES
// ============================================================

function cargarInstructores() {
    fetch('/api/instructores')
        .then(response => response.json())
        .then(data => {
            instructoresLista = data;
            mostrarInstructores();
        })
        .catch(error => console.error('Error cargando instructores:', error));
}

function mostrarInstructores() {
    const tbody = document.getElementById('instructores-tbody');
    
    if (instructoresLista.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="no-data">No hay instructores registrados</td></tr>';
        return;
    }
    
    tbody.innerHTML = instructoresLista.map(instructor => {
        const fichaInfo = instructor.ficha ? `${instructor.ficha.codigoFicha}` : 'Sin ficha';
        const estadoBadge = instructor.estado === 'ACTIVO' 
            ? '<span class="badge badge-success">ACTIVO</span>' 
            : '<span class="badge badge-danger">INACTIVO</span>';
        
        return `
            <tr>
                <td>${instructor.id}</td>
                <td>${instructor.usuario?.nombre || 'N/A'}</td>
                <td>${fichaInfo}</td>
                <td>${instructor.especialidad || 'N/A'}</td>
                <td>${estadoBadge}</td>
                <td class="acciones">
                    <button class="btn-action btn-primary" onclick="abrirAsignarFicha(${instructor.id})" title="Asignar Ficha">ASIGNAR FICHA</button>
                    <button class="btn-action btn-info" onclick="abrirAsignarAprendices(${instructor.id})" title="Asignar Aprendices">APRENDICES</button>
                    <button class="btn-action btn-danger" onclick="eliminarInstructor(${instructor.id})" title="Eliminar">ELIMINAR</button>
                </td>
            </tr>
        `;
    }).join('');
}

// ============================================================
// LLENAR SELECTS
// ============================================================

function llenarSelectUsuarios() {
    fetch('/api/usuarios?rol=Instructor')
        .then(response => response.json())
        .then(data => {
            const select = document.getElementById('instructor-usuario');
            select.innerHTML = '<option value="">Seleccione un usuario</option>' +
                data.map(u => `<option value="${u.id}">${u.nombre}</option>`).join('');
        })
        .catch(error => console.error('Error:', error));
}

function llenarSelectFichasInstructores() {
    fetch('/api/fichas')
        .then(response => response.json())
        .then(data => {
            const select = document.getElementById('instructor-ficha');
            select.innerHTML = '<option value="">Seleccione una ficha</option>' +
                data.map(f => `<option value="${f.id}">${f.codigoFicha} - ${f.programaFormacion}</option>`).join('');
        })
        .catch(error => console.error('Error:', error));
}

// ============================================================
// CREAR INSTRUCTOR
// ============================================================

function crearInstructor(event) {
    event.preventDefault();
    
    const usuarioId = document.getElementById('instructor-usuario').value;
    const fichaId = document.getElementById('instructor-ficha').value;
    const especialidad = document.getElementById('instructor-especialidad').value;
    const estado = document.getElementById('instructor-estado').value;
    
    if (!usuarioId || !fichaId) {
        alert('Por favor completa todos los campos requeridos');
        return;
    }
    
    const nuevoInstructor = {
        usuarioId: parseInt(usuarioId),
        fichaId: parseInt(fichaId),
        especialidad: especialidad,
        estado: estado
    };
    
    fetch('/api/instructores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoInstructor)
    })
    .then(response => {
        if (!response.ok) throw new Error('Error al crear instructor');
        return response.json();
    })
    .then(data => {
        alert('Instructor creado exitosamente');
        closeModal('modal-crear-instructor');
        document.getElementById('form-crear-instructor').reset();
        cargarInstructores();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error: ' + error.message);
    });
}

// ============================================================
// ASIGNAR FICHA
// ============================================================

function abrirAsignarFicha(instructorId) {
    const instructor = instructoresLista.find(i => i.id === instructorId);
    if (!instructor) return;
    
    fetch('/api/fichas')
        .then(response => response.json())
        .then(fichas => {
            mostrarModalAsignarFicha(instructorId, instructor, fichas);
        })
        .catch(error => console.error('Error:', error));
}

function mostrarModalAsignarFicha(instructorId, instructor, fichas) {
    const fichaActual = instructor.fichaId;
    
    let html = `
        <div id="modal-asignar-ficha" class="modal" style="display: block;">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Asignar Ficha a ${instructor.usuario?.nombre}</h2>
                    <button class="modal-close" onclick="closeModal('modal-asignar-ficha')">&times;</button>
                </div>
                <div class="form-group">
                    <label>Selecciona una ficha *</label>
                    <select id="nueva-ficha-instructor" required>
                        <option value="">Selecciona una ficha</option>
    `;
    
    fichas.forEach(ficha => {
        const selected = ficha.id === fichaActual ? 'selected' : '';
        html += `<option value="${ficha.id}" ${selected}>${ficha.codigoFicha} - ${ficha.programaFormacion}</option>`;
    });
    
    html += `
                    </select>
                </div>
                <div class="modal-actions">
                    <button class="btn-primary" onclick="guardarAsignarFicha(${instructorId})">Asignar</button>
                    <button class="btn-secondary" onclick="closeModal('modal-asignar-ficha')">Cancelar</button>
                </div>
            </div>
        </div>
    `;
    
    let modal = document.getElementById('modal-asignar-ficha');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-asignar-ficha';
        document.body.appendChild(modal);
    }
    modal.innerHTML = html;
    modal.style.display = 'block';
}

function guardarAsignarFicha(instructorId) {
    const fichaId = document.getElementById('nueva-ficha-instructor').value;
    
    if (!fichaId) {
        alert('Por favor selecciona una ficha');
        return;
    }
    
    const actualizacion = {
        fichaId: parseInt(fichaId)
    };
    
    fetch(`/api/instructores/${instructorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(actualizacion)
    })
    .then(response => {
        if (!response.ok) throw new Error('Error al asignar ficha');
        return response.json();
    })
    .then(data => {
        alert('Ficha asignada exitosamente');
        closeModal('modal-asignar-ficha');
        cargarInstructores();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error: ' + error.message);
    });
}

// ============================================================
// ASIGNAR APRENDICES
// ============================================================

function abrirAsignarAprendices(instructorId) {
    const instructor = instructoresLista.find(i => i.id === instructorId);
    if (!instructor || !instructor.fichaId) {
        alert('El instructor no tiene ficha asignada');
        return;
    }
    
    // Cargar aprendices de la ficha
    fetch(`/api/aprendices?fichaId=${instructor.fichaId}`)
        .then(response => response.json())
        .then(aprendices => {
            mostrarModalAsignarAprendices(instructorId, instructor, aprendices);
        })
        .catch(error => console.error('Error:', error));
}

function mostrarModalAsignarAprendices(instructorId, instructor, aprendices) {
    let html = `
        <div id="modal-asignar-aprendices" class="modal" style="display: block;">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Aprendices de ${instructor.usuario?.nombre}</h2>
                    <button class="modal-close" onclick="closeModal('modal-asignar-aprendices')">&times;</button>
                </div>
                <div class="form-group" style="max-height: 400px; overflow-y: auto; border: 1px solid #ddd; padding: 10px; border-radius: 4px;">
                    <p style="margin-bottom: 10px;">Aprendices de la ficha asignada:</p>
    `;
    
    if (aprendices.length === 0) {
        html += '<p>No hay aprendices en esta ficha</p>';
    } else {
        aprendices.forEach(aprendiz => {
            html += `
                <div style="padding: 8px; border-bottom: 1px solid #eee;">
                    ${aprendiz.nombres} ${aprendiz.apellidos}<br>
                    <small>${aprendiz.numeroDocumento}</small>
                </div>
            `;
        });
    }
    
    html += `
                </div>
                <div class="modal-actions">
                    <button class="btn-secondary" onclick="closeModal('modal-asignar-aprendices')">Cerrar</button>
                </div>
            </div>
        </div>
    `;
    
    let modal = document.getElementById('modal-asignar-aprendices');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-asignar-aprendices';
        document.body.appendChild(modal);
    }
    modal.innerHTML = html;
    modal.style.display = 'block';
}

// ============================================================
// ELIMINAR INSTRUCTOR
// ============================================================

function eliminarInstructor(instructorId) {
    if (!confirm('¿Estás seguro de que deseas eliminar este instructor?')) {
        return;
    }
    
    fetch(`/api/instructores/${instructorId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) throw new Error('Error al eliminar instructor');
        alert('Instructor eliminado exitosamente');
        cargarInstructores();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error: ' + error.message);
    });
}

// ============================================================
// INICIALIZACIÓN
// ============================================================

function initAdminInstructores() {
    cargarInstructores();
}

// Cargar cuando se abre la sección de instructores
document.addEventListener('DOMContentLoaded', function() {
    const section = document.getElementById('instructores');
    if (section) {
        initAdminInstructores();
    }
});
