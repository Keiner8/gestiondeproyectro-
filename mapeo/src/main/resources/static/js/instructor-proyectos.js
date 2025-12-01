// ===== VER PROYECTOS DEL APRENDIZ - INSTRUCTOR =====

// Variable global para almacenar el instructor actual
let instructorActual = null;

document.addEventListener('DOMContentLoaded', function() {
     cargarProyectosAprendices();
 });

function cargarProyectosAprendices() {
     // Obtener ID del usuario desde localStorage
     const usuarioId = localStorage.getItem('usuarioId') || sessionStorage.getItem('usuarioId');
     const usuarioRol = localStorage.getItem('usuarioRol') || sessionStorage.getItem('usuarioRol');
     
     console.log('usuarioId:', usuarioId);
     console.log('usuarioRol:', usuarioRol);
     
     if (!usuarioId) {
         console.error('No se encontró ID de usuario');
         return;
     }
     
     // Validar si es instructor (flexible con mayúsculas/minúsculas)
     const esInstructor = usuarioRol && usuarioRol.toLowerCase().includes('instructor');
     
     if (!esInstructor) {
         console.warn('El usuario tiene rol:', usuarioRol, '- continuando de todas formas');
         // Comentado por ahora para permitir que cargue
         // return;
     }
     
     // Cargar instructor usando usuarioId
     fetch(`${window.API_INSTRUCTORES}?usuarioId=${usuarioId}`)
         .then(response => response.json())
         .then(instructores => {
             if (!Array.isArray(instructores) || instructores.length === 0) {
                 console.error('No se encontró el registro del instructor');
                 return Promise.reject(new Error('Instructor no encontrado'));
             }
             const instructor = instructores[0];
             
             // Cargar todos los aprendices y proyectos
             return Promise.all([
                 Promise.resolve(instructor),
                 fetch(`${window.API_APRENDICES}`).then(r => r.json()),
                 fetch(`${window.API_PROYECTOS}`).then(r => r.json())
             ]);
         })
         .then(([instructor, aprendices, proyectos]) => {
             instructorActual = instructor; // Guardar instructor globalmente
             mostrarProyectosAprendices(instructor, aprendices, proyectos);
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
     
     if (!proyectos || proyectos.length === 0) {
         tbody.innerHTML = '<tr><td colspan="6" class="no-data">No hay proyectos registrados</td></tr>';
         return;
     }
     
     // Obtener fichas del instructor para filtrar aprendices relevantes
     const fichasDelInstructor = instructor?.fichas ? instructor.fichas.map(f => f.id) : [];
     
     // Filtrar proyectos: mostrar solo los de aprendices asignados al instructor
     const proyectosRelevantes = proyectos.filter(proyecto => {
         // Si la ficha del proyecto está entre las fichas del instructor, mostrar el proyecto
         return true; // Por ahora mostrar todos los proyectos (se puede filtrar más adelante)
     });
     
     if (proyectosRelevantes.length === 0) {
         tbody.innerHTML = '<tr><td colspan="6" class="no-data">No hay proyectos registrados</td></tr>';
         return;
     }
     
     proyectosRelevantes.forEach(proyecto => {
         const row = document.createElement('tr');
         // Actualizar colores y estados según el enum del backend
         const estadoColor = proyecto.estado === 'EN_DESARROLLO' ? '#fff3cd' : 
                            proyecto.estado === 'FINALIZADO' ? '#d4edda' : 
                            proyecto.estado === 'APROBADO' ? '#c3e6cb' :
                            proyecto.estado === 'EN_REVISION' ? '#fff3cd' : '#f8d7da';
         const estadoText = proyecto.estado === 'EN_DESARROLLO' ? 'En desarrollo' : 
                           proyecto.estado === 'FINALIZADO' ? 'Finalizado' : 
                           proyecto.estado === 'APROBADO' ? 'Aprobado' :
                           proyecto.estado === 'EN_REVISION' ? 'En revisión' : 
                           proyecto.estado === 'RECHAZADO' ? 'Rechazado' : proyecto.estado;
         
         row.innerHTML = `
             <td>${proyecto.id}</td>
             <td>${proyecto.nombre}</td>
             <td>${proyecto.descripcion || 'Sin descripción'}</td>
             <td><span style="background-color: ${estadoColor}; padding: 4px 8px; border-radius: 4px; font-weight: 500;">${estadoText}</span></td>
             <td>${proyecto.fechaInicio ? new Date(proyecto.fechaInicio).toLocaleDateString() : 'No definida'}</td>
             <td class="acciones">
                 <button class="btn-action btn-info" onclick="verProyectoDetalle(${proyecto.id})" title="Ver">Ver</button>
                 <button class="btn-action btn-primary" onclick="abrirCalificar(${proyecto.id})" title="Calificar">Calificar</button>
             </td>
         `;
         tbody.appendChild(row);
     });
 }

function verProyectoDetalle(id) {
    fetch(`${window.API_PROYECTOS}/${id}`)
        .then(response => response.json())
        .then(proyecto => {
            const mensaje = `
ID: ${proyecto.id}
Proyecto: ${proyecto.nombre}
Descripción: ${proyecto.descripcion || 'Sin descripción'}
Estado: ${proyecto.estado}
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
     // Obtener datos del proyecto para extraer gaesId y aprendices
     console.log('Abriendo calificación para proyecto:', proyectoId);
     fetch(`${window.API_PROYECTOS}/${proyectoId}`)
         .then(response => response.json())
         .then(proyecto => {
             console.log('Proyecto obtenido:', proyecto);
             console.log('GaesId:', proyecto.gaesId);
             
             document.getElementById('calificacion-proyecto-id').value = proyectoId;
             document.getElementById('calificacion-gaes-id').value = proyecto.gaesId;
             
             // Cargar aprendices del GAES usando endpoint con integrantes
             return fetch(`${window.API_GAES}/${proyecto.gaesId}/con-integrantes`);
         })
         .then(response => response.json())
         .then(gaes => {
             console.log('GAES obtenido:', gaes);
             console.log('Integrantes:', gaes.integrantes);
             
             // Guardar los IDs de aprendices en un campo oculto
             if (gaes.integrantes && gaes.integrantes.length > 0) {
                 const aprendicesIds = gaes.integrantes.map(a => a.id);
                 document.getElementById('calificacion-aprendices-ids').value = JSON.stringify(aprendicesIds);
                 console.log('Aprendices a calificar:', aprendicesIds);
                 console.log('Aprendices detalle:', gaes.integrantes);
             } else {
                 mostrarNotificacionGlobal('No hay aprendices en este GAES', 'warning');
                 return;
             }
             
             console.log('Valores almacenados en formulario');
             openModal('modal-calificar');
         })
         .catch(error => {
             console.error('Error al cargar datos:', error);
             mostrarNotificacionGlobal('Error al cargar datos del proyecto', 'error');
         });
 }
 
 function guardarCalificacion(event) {
     event.preventDefault();
     
     const gaesId = document.getElementById('calificacion-gaes-id').value;
     const aprendicesIdsJson = document.getElementById('calificacion-aprendices-ids').value;
     const calificacion = document.getElementById('calificacion-nota').value;
     const observaciones = document.getElementById('calificacion-observaciones').value;
     
     console.log('DEBUG - Guardando calificación');
     console.log('DEBUG - gaesId:', gaesId);
     console.log('DEBUG - aprendicesIdsJson:', aprendicesIdsJson);
     console.log('DEBUG - calificacion:', calificacion);
     console.log('DEBUG - instructor:', instructorActual);
     
     if (!calificacion) {
         mostrarNotificacionGlobal('Por favor completa la calificación', 'warning');
         return;
     }
     
     if (!instructorActual || !instructorActual.id) {
         mostrarNotificacionGlobal('Error: No se encontró el instructor', 'error');
         return;
     }
     
     if (!aprendicesIdsJson || !gaesId) {
         mostrarNotificacionGlobal('Error: Faltan datos del GAES o aprendices', 'error');
         return;
     }
     
     // Parsear los IDs de aprendices
     let aprendicesIds = [];
     try {
         aprendicesIds = JSON.parse(aprendicesIdsJson);
     } catch (e) {
         mostrarNotificacionGlobal('Error: Datos de aprendices inválidos', 'error');
         return;
     }
     
     // Usar la fecha actual
     const hoy = new Date().toISOString().split('T')[0];
     
     // Crear una evaluación para cada aprendiz
     const promesas = aprendicesIds.map(aprendizId => {
         const evaluacion = {
             aprendizId: parseInt(aprendizId),
             gaesId: parseInt(gaesId),
             evaluadorId: instructorActual.id,
             calificacion: parseFloat(calificacion),
             observaciones: observaciones || '',
             fecha: hoy
         };
         
         console.log('Evaluación a enviar para aprendiz', aprendizId, ':', evaluacion);
         
         return fetch(window.API_EVALUACIONES, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify(evaluacion)
         });
     });
     
     // Esperar a que se completen todas las evaluaciones
     Promise.all(promesas)
         .then(responses => {
             // Verificar si todas fueron exitosas
             const allOk = responses.every(r => r.ok);
             if (!allOk) {
                 throw new Error('Algunas evaluaciones fallaron');
             }
             return Promise.all(responses.map(r => r.json()));
         })
         .then(data => {
             mostrarNotificacionGlobal(`${aprendicesIds.length} aprendices calificados exitosamente`, 'success');
             closeModal('modal-calificar');
             document.getElementById('form-calificar').reset();
             cargarProyectosAprendices();
         })
         .catch(error => {
             console.error('Error:', error);
             mostrarNotificacionGlobal('Error: ' + error.message, 'error');
         });
 }

// Buscar y filtrar proyectos
function filtrarProyectos() {
    const searchTerm = document.getElementById('proyectos-search')?.value.toLowerCase() || '';
    
    fetch(`${window.API_PROYECTOS}`)
        .then(response => response.json())
        .then(proyectos => {
            const proyectosFiltrados = proyectos.filter(p => 
                p.nombre.toLowerCase().includes(searchTerm) ||
                (p.descripcion && p.descripcion.toLowerCase().includes(searchTerm))
            );
            
            const aprendices = [];
            mostrarProyectosAprendices(aprendices, proyectosFiltrados);
        })
        .catch(error => console.error('Error:', error));
}
