// ============================================================
// INSTRUCTOR ENTREGABLES - JavaScript
// ============================================================

let entregablesLista = [];
let proyectosInstructor = [];
let trimestresLista = [];
let entregableEditandoId = null;

async function obtenerMensajeError(response, fallback) {
    let detalle = '';
    try {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
            const data = await response.json();
            detalle = data.detail || data.message || data.error || '';
        } else {
            detalle = await response.text();
        }
    } catch (error) {
        console.warn('No fue posible leer el detalle del error:', error);
    }

    detalle = String(detalle || '').trim();
    return detalle || fallback;
}

async function validarAccesoInstructor() {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        window.location.replace('/login');
        return false;
    }

    try {
        const response = await fetchWithAuth('/api/usuario-actual');
        if (!response || !response.ok) {
            const mensaje = response
                ? await obtenerMensajeError(response, 'No fue posible validar la sesion actual')
                : 'No fue posible validar la sesion actual';
            throw new Error(mensaje);
        }

        const usuario = await response.json();
        const rol = (usuario?.rol?.nombreRol || '').toLowerCase();

        if (rol !== 'instructor') {
            await mostrarAlertaGlobal('Tu sesion no corresponde a un instructor. Seras redirigido a tu panel.', 'warning', 'Acceso no permitido');

            if (rol === 'aprendiz') {
                window.location.replace('/dashboard/aprendiz');
            } else if (rol === 'administrador') {
                window.location.replace('/dashboard/administrador');
            } else {
                window.location.replace('/login');
            }
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error validando acceso del instructor:', error);
        await mostrarAlertaGlobal('No fue posible validar tu sesion: ' + error.message, 'error', 'Sesion invalida');
        window.location.replace('/login');
        return false;
    }
}

// ============================================================
// CARGAR PROYECTOS DE LA FICHA
// ============================================================

function cargarProyectosInstructor() {
    console.log('Cargando proyectos del instructor...');
    
    // Cargar todos los proyectos
    fetchWithAuth('/api/proyectos')
        .then(response => response.json())
        .then(data => {
            const proyectos = Array.isArray(data) ? data : [];

            // Mostrar todos los proyectos disponibles
            proyectosInstructor = proyectos;
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
    fetchWithAuth('/api/trimestres')
        .then(response => response.json())
        .then(data => {
            trimestresLista = Array.isArray(data) ? data : [];
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
    fetchWithAuth('/api/entregables')
        .then(response => response.json())
        .then(data => {
            entregablesLista = Array.isArray(data) ? data : [];
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
                    <button class="btn-action btn-primary" onclick="editarEntregableInstructor(${entregable.id})" title="Editar">EDITAR</button>
                    ${entregable.archivo || entregable.url ? `<button class="btn-action btn-info" onclick="descargarEntregableInstructor(${entregable.id}, '${(entregable.nombreArchivo || entregable.nombre || 'entregable').replace(/'/g, "\\'")}')" title="Descargar">DESCARGAR</button>` : ''}
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

    if (!entregableEditandoId && !archivo) {
        alert('Debes adjuntar un archivo para crear el entregable');
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
    
    if (entregableEditandoId) {
        const payload = {
            nombre: nombre,
            descripcion: descripcion,
            proyectoId: parseInt(proyectoId),
            trimestreId: parseInt(trimestreId)
        };

        fetchWithAuth(`/api/entregables/${entregableEditandoId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(text || `Error ${response.status}: Error al editar entregable`);
                });
            }
            return response.json();
        })
        .then(() => {
            alert('Entregable actualizado exitosamente');
            resetModalEntregableInstructor();
            cargarEntregables();
        })
        .catch(error => {
            console.error('Error completo:', error);
            alert('Error al editar entregable: ' + error.message);
        });
        return;
    }

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
            resetModalEntregableInstructor();
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
            resetModalEntregableInstructor();
            cargarEntregables();
        })
        .catch(error => {
            console.error('Error completo:', error);
            alert('Error al crear entregable: ' + error.message);
        });
    }
}

function editarEntregableInstructor(entregableId) {
    const entregable = entregablesLista.find(item => item.id === entregableId);
    if (!entregable) {
        alert('No se encontró el entregable');
        return;
    }

    entregableEditandoId = entregableId;

    document.getElementById('entregable-proyecto-instructor').value = entregable.proyectoId || '';
    document.getElementById('entregable-trimestre-instructor').value = entregable.trimestreId || '';
    document.getElementById('entregable-nombre-instructor').value = entregable.nombre || '';
    document.getElementById('entregable-descripcion-instructor').value = entregable.descripcion || '';

    const titulo = document.querySelector('#modal-subir-entregable-instructor .modal-header h2');
    if (titulo) {
        titulo.textContent = 'Editar Entregable';
    }

    const botonSubmit = document.querySelector('#form-subir-entregable-instructor button[type="submit"]');
    if (botonSubmit) {
        botonSubmit.textContent = 'Guardar Cambios';
    }

    openModal('modal-subir-entregable-instructor');
}

function resetModalEntregableInstructor() {
    entregableEditandoId = null;
    closeModal('modal-subir-entregable-instructor');
    document.getElementById('form-subir-entregable-instructor').reset();

    const titulo = document.querySelector('#modal-subir-entregable-instructor .modal-header h2');
    if (titulo) {
        titulo.textContent = 'Subir Entregable';
    }

    const botonSubmit = document.querySelector('#form-subir-entregable-instructor button[type="submit"]');
    if (botonSubmit) {
        botonSubmit.textContent = 'Subir Entregable';
    }
}

function descargarEntregableInstructor(entregableId, nombreArchivo) {
    fetchWithAuth(`/api/entregables/${entregableId}/descargar`)
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(`Error ${response.status}: ${text}`);
                });
            }

            const contentType = response.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
                return response.json().then(data => ({ tipo: 'url', url: data.url }));
            }

            return response.blob().then(blob => ({ tipo: 'blob', blob }));
        })
        .then(resultado => {
            if (resultado.tipo === 'url') {
                window.open(resultado.url, '_blank', 'noopener');
                return;
            }

            const url = window.URL.createObjectURL(resultado.blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = nombreArchivo || 'entregable.bin';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        })
        .catch(error => {
            console.error('Error al descargar:', error);
            alert('Error al descargar: ' + error.message);
        });
}

// ============================================================
// ELIMINAR ENTREGABLE
// ============================================================

async function eliminarEntregableInstructor(entregableId) {
    if (window.confirmarAccion) {
        const confirmado = await window.confirmarAccion('Estas seguro de que deseas eliminar este entregable?', 'Eliminar entregable');
        if (!confirmado) return;
    } else if (!confirm('Estas seguro de que deseas eliminar este entregable?')) {
        return;
    }
    
    fetchWithAuth(`/api/entregables/${entregableId}`, {
        method: 'DELETE'
    })
    .then(async response => {
        if (!response.ok) {
            const mensaje = await obtenerMensajeError(response, 'Error al eliminar entregable');
            throw new Error(mensaje);
        }
        await mostrarAlertaGlobal('Entregable eliminado exitosamente', 'success', 'Operacion exitosa');
        cargarEntregables();
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarAlertaGlobal('Error al eliminar entregable: ' + error.message, 'error', 'No se pudo eliminar');
    });
}

// ============================================================
// INICIALIZACIÓN
// ============================================================

async function initEntregablesInstructor() {
    console.log('Inicializando entregables del instructor...');
    const accesoValido = await validarAccesoInstructor();
    if (!accesoValido) {
        return;
    }
    cargarProyectosInstructor();
}

// Ejecutar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado, inicializando entregables...');
    initEntregablesInstructor();
});
