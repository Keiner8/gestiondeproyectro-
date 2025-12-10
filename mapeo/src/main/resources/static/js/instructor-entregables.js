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
    console.log('Cargando proyectos del instructor...');
    
    // Cargar todos los proyectos
    fetch('/api/proyectos')
        .then(response => response.json())
        .then(data => {
            // Mostrar todos los proyectos disponibles
            proyectosInstructor = data;
            console.log('Proyectos cargados:', proyectosInstructor.length);
            
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
                console.log('Select de proyectos actualizado');
            } else {
                console.error('No se encontró el select de proyectos');
            }
            
            cargarTrimestres();
            cargarEntregables();
        })
        .catch(error => {
            console.error('Error cargando proyectos:', error);
            alert('Error al cargar proyectos: ' + error.message);
        });
}

// ============================================================
// CARGAR TRIMESTRES
// ============================================================

function cargarTrimestres() {
    console.log('Cargando trimestres...');
    fetch('/api/trimestres')
        .then(response => response.json())
        .then(data => {
            trimestresLista = data;
            console.log('Trimestres cargados:', trimestresLista.length);
            
            // Llenar select de trimestres en el modal
            const select = document.getElementById('entregable-trimestre-instructor');
            if (select) {
                select.innerHTML = '<option value="">Selecciona un trimestre</option>';
                
                // Mostrar todos los trimestres disponibles
                trimestresLista.forEach(trimestre => {
                    const option = document.createElement('option');
                    option.value = trimestre.id;
                    option.textContent = `Trimestre ${trimestre.numero}`;
                    select.appendChild(option);
                });
                console.log('Select de trimestres actualizado');
            } else {
                console.error('No se encontró el select de trimestres');
            }
        })
        .catch(error => {
            console.error('Error cargando trimestres:', error);
            alert('Error al cargar trimestres: ' + error.message);
        });
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
    
    console.log('Subiendo entregable...');
    console.log('Proyecto ID:', proyectoId);
    console.log('Trimestre ID:', trimestreId);
    console.log('Nombre:', nombre);
    console.log('Hay archivo:', !!archivo);
    if (archivo) {
        console.log('Tamaño del archivo:', (archivo.size / 1024 / 1024).toFixed(2) + ' MB');
    }
    
    if (!proyectoId || !nombre || !trimestreId) {
        alert('Por favor completa proyecto, trimestre y nombre');
        return;
    }
    
    // Validar tamaño del archivo (máximo 50MB)
    if (archivo) {
        const maxSize = 50 * 1024 * 1024; // 50 MB
        if (archivo.size > maxSize) {
            alert(`El archivo es demasiado grande (${(archivo.size / 1024 / 1024).toFixed(2)} MB). El tamaño máximo permitido es 50 MB.\n\nPor favor, comprime el archivo o usa una versión más pequeña.`);
            return;
        }
    }
    
    // Obtener token JWT
    const token = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken');
    
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
        
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        fetch('/api/entregables', {
            method: 'POST',
            headers: headers,
            body: formData
        })
        .then(response => {
            console.log('Response status:', response.status);
            if (!response.ok) {
                return response.text().then(text => {
                    console.error('Error response:', text);
                    throw new Error(text || `Error ${response.status}: Error al subir archivo`);
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('Entregable subido:', data);
            alert('Entregable subido exitosamente');
            closeModal('modal-subir-entregable-instructor');
            document.getElementById('form-subir-entregable-instructor').reset();
            cargarEntregables();
        })
        .catch(error => {
            console.error('Error completo:', error);
            alert('Error al subir archivo: ' + error.message);
        });
    } 
    // Sin archivo, enviar como JSON
    else {
        const headers = { 'Content-Type': 'application/json' };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        fetch('/api/entregables', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(nuevoEntregable)
        })
        .then(response => {
            console.log('Response status:', response.status);
            if (!response.ok) {
                return response.text().then(text => {
                    console.error('Error response:', text);
                    throw new Error(text || `Error ${response.status}: Error al crear entregable`);
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('Entregable creado:', data);
            alert('Entregable creado exitosamente');
            closeModal('modal-subir-entregable-instructor');
            document.getElementById('form-subir-entregable-instructor').reset();
            cargarEntregables();
        })
        .catch(error => {
            console.error('Error completo:', error);
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
    console.log('Inicializando entregables del instructor...');
    cargarProyectosInstructor();
}

// Ejecutar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado, inicializando entregables...');
    initEntregablesInstructor();
});
