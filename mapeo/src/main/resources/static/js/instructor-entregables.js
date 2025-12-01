// ============================================================
// INSTRUCTOR ENTREGABLES - JavaScript
// ============================================================

let entregablesLista = [];
let proyectosInstructor = [];
let trimestresLista = [];

// ============================================================
// CARGAR PROYECTOS DE LA FICHA
// ============================================================

function cargarProyectosInstructor() {
    const fichaId = instructorData.instructor?.fichaId;
    
    if (!fichaId) {
        console.log('No hay ficha asignada');
        return;
    }
    
    // Cargar todos los proyectos
    fetch('/api/proyectos')
        .then(response => response.json())
        .then(data => {
            // Filtrar solo proyectos de aprendices en la ficha del instructor
            proyectosInstructor = data;
            
            // Llenar select de proyectos en el modal
            const select = document.getElementById('entregable-proyecto-instructor');
            if (select) {
                select.innerHTML = '<option value="">Selecciona un proyecto</option>';
                proyectosInstructor.forEach(proyecto => {
                    const option = document.createElement('option');
                    option.value = proyecto.id;
                    option.textContent = proyecto.nombre;
                    select.appendChild(option);
                });
            }
            
            cargarTrimestres();
            cargarEntregables();
        })
        .catch(error => console.error('Error cargando proyectos:', error));
}

// ============================================================
// CARGAR TRIMESTRES
// ============================================================

function cargarTrimestres() {
    fetch('/api/trimestres')
        .then(response => response.json())
        .then(data => {
            trimestresLista = data;
            
            // Llenar select de trimestres en el modal
            const select = document.getElementById('entregable-trimestre-instructor');
            if (select) {
                select.innerHTML = '<option value="">Selecciona un trimestre</option>';
                trimestresLista.forEach(trimestre => {
                    const option = document.createElement('option');
                    option.value = trimestre.id;
                    option.textContent = trimestre.nombre || `Trimestre ${trimestre.numero}`;
                    select.appendChild(option);
                });
            }
        })
        .catch(error => console.error('Error cargando trimestres:', error));
}

// ============================================================
// CARGAR Y MOSTRAR ENTREGABLES
// ============================================================

function cargarEntregables() {
    fetch('/api/entregables')
        .then(response => response.json())
        .then(data => {
            entregablesLista = data;
            mostrarEntregables();
        })
        .catch(error => console.error('Error cargando entregables:', error));
}

function mostrarEntregables() {
    const container = document.getElementById('entregables-list');
    
    if (entregablesLista.length === 0) {
        container.innerHTML = '<p class="no-data">No hay entregables</p>';
        return;
    }
    
    let html = `
        <table class="table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Proyecto</th>
                    <th>Descripción</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    entregablesLista.forEach(entregable => {
        const proyecto = proyectosInstructor.find(p => p.id === entregable.proyectoId);
        const nombreProyecto = proyecto ? proyecto.nombre : 'Sin proyecto';
        
        html += `
            <tr>
                <td>${entregable.id}</td>
                <td>${entregable.nombre}</td>
                <td>${nombreProyecto}</td>
                <td>${entregable.descripcion || 'Sin descripción'}</td>
                <td class="acciones">
                    <button class="btn-action btn-danger" onclick="eliminarEntregableInstructor(${entregable.id})" title="Eliminar">ELIMINAR</button>
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
// SUBIR ENTREGABLE
// ============================================================

function subirEntregableInstructor(event) {
    event.preventDefault();
    
    const proyectoId = document.getElementById('entregable-proyecto-instructor')?.value;
    const trimestreId = document.getElementById('entregable-trimestre-instructor')?.value;
    const nombre = document.getElementById('entregable-nombre-instructor')?.value;
    const descripcion = document.getElementById('entregable-descripcion-instructor')?.value;
    const archivo = document.getElementById('entregable-archivo-instructor')?.files[0];
    
    if (!proyectoId || !nombre || !trimestreId) {
        alert('Por favor completa proyecto, trimestre y nombre');
        return;
    }
    
    const nuevoEntregable = {
        nombre: nombre,
        descripcion: descripcion,
        proyectoId: parseInt(proyectoId),
        trimestreId: parseInt(trimestreId)
    };
    
    // Si hay archivo, usar FormData
    if (archivo) {
        const formData = new FormData();
        formData.append('nombre', nombre);
        formData.append('descripcion', descripcion);
        formData.append('proyectoId', proyectoId);
        formData.append('trimestreId', trimestreId);
        formData.append('archivo', archivo);
        
        fetch('/api/entregables', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(text || 'Error al subir archivo');
                });
            }
            return response.json();
        })
        .then(data => {
            alert('Entregable subido exitosamente');
            closeModal('modal-subir-entregable-instructor');
            document.getElementById('form-subir-entregable-instructor').reset();
            cargarEntregables();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al subir archivo: ' + error.message);
        });
    } 
    // Sin archivo, enviar como JSON
    else {
        fetch('/api/entregables', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoEntregable)
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(text || 'Error al crear entregable');
                });
            }
            return response.json();
        })
        .then(data => {
            alert('Entregable creado exitosamente');
            closeModal('modal-subir-entregable-instructor');
            document.getElementById('form-subir-entregable-instructor').reset();
            cargarEntregables();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al crear entregable: ' + error.message);
        });
    }
}

// ============================================================
// ELIMINAR ENTREGABLE
// ============================================================

function eliminarEntregableInstructor(entregableId) {
    if (!confirm('¿Estás seguro de que deseas eliminar este entregable?')) {
        return;
    }
    
    fetch(`/api/entregables/${entregableId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) throw new Error('Error al eliminar entregable');
        alert('Entregable eliminado exitosamente');
        cargarEntregables();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error: ' + error.message);
    });
}

// ============================================================
// INICIALIZACIÓN
// ============================================================

function initEntregablesInstructor() {
    cargarProyectosInstructor();
}
