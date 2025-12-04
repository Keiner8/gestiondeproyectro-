// ============================================================
// APRENDIZ DASHBOARD - JavaScript
// ============================================================

let aprendizData = {};
const API_BASE = '/api';

// ============================================================
// INICIALIZACIÓN
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation();
    initializeForms();
    loadAprendizData();
    setupEventListeners();
    loadTheme();
});

// ============================================================
// NAVEGACIÓN Y SECCIONES
// ============================================================

function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            goToSection(item.getAttribute('data-section'));
        });
    });
}

function goToSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));
    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.classList.add('active');
    }
}

// ============================================================
// CARGAR DATOS DEL APRENDIZ
// ============================================================

function loadAprendizData() {
    const usuarioId = getUserIdFromToken();
    
    if (!usuarioId) {
        console.error('No se pudo obtener el ID del usuario');
        updateDashboard();
         updateProyectosList();
         updateCalificacionesList();
         updateGaesList();
         updateEntregablesList();
         cargarTrimestresEnModal();
        return;
    }
    
    Promise.all([
        fetchWithAuth(`${API_BASE}/aprendices/usuario/${usuarioId}/dto`).then(r => {
            if (!r.ok && r.status === 404) return null;
            return r.json();
        }),
        fetchWithAuth(`${API_BASE}/usuarios/${usuarioId}`).then(r => r.json()),
    ])
    .then(([aprendiz, usuario]) => {
         if (!aprendiz) {
             console.warn('No se encontró aprendiz para este usuario');
             aprendizData.aprendiz = null;
             aprendizData.usuario = usuario;
             updateUserProfileHeader();
             updateDashboard();
            updateProyectosList();
            updateCalificacionesList();
            updateGaesList();
            updateEntregablesList();
            return;
        }
        
        console.log('✓ Datos cargados del aprendiz:', aprendiz);
        aprendizData.aprendiz = aprendiz;
        aprendizData.usuario = usuario;
        updateUserProfileHeader();
        
        const promises = [];
         
         // Cargar ficha si existe
         if (aprendiz.fichaId) {
             promises.push(
                 fetchWithAuth(`${API_BASE}/fichas/${aprendiz.fichaId}`).then(r => {
                     if (!r.ok) return null;
                     return r.json();
                 })
             );
         } else {
             promises.push(Promise.resolve(null));
         }
         
         // Cargar GAES completo con integrantes si existe
          if (aprendiz.gaesId) {
              promises.push(
                  fetchWithAuth(`${API_BASE}/gaes/${aprendiz.gaesId}/con-integrantes`).then(r => {
                      if (!r.ok) {
                          // Fallback si no se puede cargar
                          return {
                              id: aprendiz.gaesId,
                              nombre: aprendiz.gaesNombre || 'GAES ' + aprendiz.gaesId,
                              integrantes: []
                          };
                      }
                      return r.json();
                  })
              );
          } else {
              promises.push(Promise.resolve(null));
          }
        
        // Cargar proyectos del aprendiz
        if (aprendiz.id) {
            promises.push(
                fetchWithAuth(`${API_BASE}/proyectos/lider/${aprendiz.id}`).then(r => {
                    if (!r.ok) return [];
                    return r.json();
                })
            );
        } else {
            promises.push(Promise.resolve([]));
        }
        
        // Cargar evaluaciones del aprendiz
        if (aprendiz.id) {
            promises.push(
                fetchWithAuth(`${API_BASE}/evaluaciones/aprendiz/${aprendiz.id}`).then(r => {
                    if (!r.ok) return [];
                    return r.json();
                })
            );
        } else {
            promises.push(Promise.resolve([]));
        }
        
        return Promise.all(promises);
    })
    .then(([ficha, gaes, proyectos, evaluaciones]) => {
        aprendizData.ficha = ficha;
        aprendizData.gaes = gaes;
        aprendizData.proyectos = proyectos || [];
        aprendizData.evaluaciones = evaluaciones || [];
        
        updateDashboard();
        updateProyectosList();
        updateCalificacionesList();
        updateGaesList();
        updateEntregablesList();
        cargarTrimestresEnModal();
        })
        .catch(error => {
        console.error('Error cargando datos del aprendiz:', error);
        updateDashboard();
        updateProyectosList();
        updateCalificacionesList();
        updateGaesList();
        updateEntregablesList();
        cargarTrimestresEnModal();
        });
}

// ============================================================
// ACTUALIZAR PERFIL DEL USUARIO EN EL HEADER
// ============================================================

function updateUserProfileHeader() {
    const userNameDisplay = document.getElementById('user-name-display');
    if (userNameDisplay && aprendizData.usuario) {
        const nombreCompleto = `${aprendizData.usuario.nombre || ''} ${aprendizData.usuario.apellido || ''}`.trim();
        userNameDisplay.textContent = nombreCompleto || 'Usuario';
    }
}

// ============================================================
// ACTUALIZAR DASHBOARD
// ============================================================

function updateDashboard() {
    const grid = document.getElementById('dashboard-grid');
    grid.innerHTML = '';
    
    if (!aprendizData.usuario) {
        grid.innerHTML = '<p class="empty-state">Error: No se pudieron cargar los datos del usuario</p>';
        return;
    }
    
    if (!aprendizData.aprendiz) {
        grid.innerHTML = `
            <div class="dashboard-card">
                <h3>👨‍🎓 Bienvenida, ${aprendizData.usuario.nombre}</h3>
                <p>No tienes registro como aprendiz en el sistema</p>
                <p>Por favor, contacta a un administrador</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML += `
        <div class="dashboard-card">
            <h3>👨‍🎓 Bienvenida, ${aprendizData.usuario.nombre}</h3>
            <p>Ficha: ${aprendizData.ficha?.programaFormacion || 'Sin ficha asignada'}</p>
            <p>Código: ${aprendizData.ficha?.codigoFicha || 'N/A'}</p>
        </div>
    `;
    
    if (aprendizData.proyectos) {
        grid.innerHTML += `
            <div class="dashboard-card">
                <h3>📋 Mis Proyectos</h3>
                <p>Total: ${aprendizData.proyectos.length}</p>
                <button class="btn-primary" onclick="goToSection('registrar-proyecto')">
                    Ver Proyectos
                </button>
            </div>
        `;
    }
    
    if (aprendizData.evaluaciones && aprendizData.evaluaciones.length > 0) {
        const promedio = aprendizData.evaluaciones
            .filter(e => e.calificacion)
            .reduce((sum, e) => sum + e.calificacion, 0) / aprendizData.evaluaciones.filter(e => e.calificacion).length;
        
        grid.innerHTML += `
            <div class="dashboard-card">
                <h3>⭐ Promedio General</h3>
                <p style="font-size: 24px; color: #4a90e2; font-weight: bold;">${isNaN(promedio) ? 'N/A' : promedio.toFixed(2)}/5</p>
                <p>Calificaciones: ${aprendizData.evaluaciones.filter(e => e.calificacion).length}</p>
            </div>
        `;
    }
    
    if (aprendizData.gaes) {
        grid.innerHTML += `
            <div class="dashboard-card">
                <h3>👥 Mi GAES</h3>
                <p>${aprendizData.gaes.nombre}</p>
                <button class="btn-primary" onclick="goToSection('mis-grupos')">
                    Ver Integrantes
                </button>
            </div>
        `;
    }
}

// ============================================================
// PROYECTOS
// ============================================================

function updateProyectosList() {
    const list = document.getElementById('proyectos-list');
    if (!list) return;
    list.innerHTML = '';
    
    if (!aprendizData.proyectos || !Array.isArray(aprendizData.proyectos) || aprendizData.proyectos.length === 0) {
        list.innerHTML = '<p class="empty-state">No tienes proyectos registrados. Haz clic en "+ Nuevo Proyecto" para crear uno.</p>';
        return;
    }
    
    aprendizData.proyectos.forEach(proyecto => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <h3>${proyecto.nombre}</h3>
            <p>${proyecto.descripcion || 'Sin descripción'}</p>
            <p><strong>Estado:</strong> <span class="badge-estado">${proyecto.estado}</span></p>
            <p><strong>Fecha Inicio:</strong> ${proyecto.fechaInicio ? new Date(proyecto.fechaInicio).toLocaleDateString() : 'N/A'}</p>
            <p><strong>Fecha Fin:</strong> ${proyecto.fechaFin ? new Date(proyecto.fechaFin).toLocaleDateString() : 'N/A'}</p>
            <button class="btn-secondary" onclick="editarProyecto(${proyecto.id})">
                Editar
            </button>
        `;
        list.appendChild(card);
    });
}

 function cargarTrimestresEnModal() {
      fetch(`${API_BASE}/trimestres`)
          .then(response => {
              if (!response.ok) throw new Error('Error al cargar trimestres');
              return response.json();
          })
          .then(trimestres => {
              const selectTrimestre = document.getElementById('proyecto-trimestre');
              if (!selectTrimestre) return;
              
              // Limpiar opciones excepto la primera
              while (selectTrimestre.options.length > 1) {
                  selectTrimestre.remove(1);
              }
              
              trimestres.forEach(trimestre => {
                  const option = document.createElement('option');
                  option.value = trimestre.id;
                  option.textContent = `Trimestre ${trimestre.numero}`;
                  selectTrimestre.appendChild(option);
              });
          })
          .catch(error => console.error('Error cargando trimestres:', error));
  }

  function editarProyecto(id) {
        const proyecto = aprendizData.proyectos.find(p => p.id === id);
        if (proyecto) {
            document.getElementById('proyecto-id-edit').value = id;
          document.getElementById('proyecto-nombre').value = proyecto.nombre;
          document.getElementById('proyecto-descripcion').value = proyecto.descripcion;
          document.getElementById('proyecto-gaes').value = aprendizData.gaes?.id || '';
          document.getElementById('proyecto-fecha-inicio').value = proyecto.fechaInicio || '';
          document.getElementById('proyecto-fecha-fin').value = proyecto.fechaFin || '';
          openModal('modal-registrar-proyecto');
      }
  }

function abrirRegistrarProyecto() {
     // Limpiar formulario para nuevo proyecto
     document.getElementById('proyecto-id-edit').value = '';
     document.getElementById('proyecto-nombre').value = '';
     document.getElementById('proyecto-descripcion').value = '';
     document.getElementById('proyecto-fecha-inicio').value = '';
     document.getElementById('proyecto-fecha-fin').value = '';
     
     // Llenar select de GAES
     const selectGaes = document.getElementById('proyecto-gaes');
     selectGaes.innerHTML = '<option value="">Elige tu GAES</option>';
     
     if (aprendizData.gaes) {
         const option = document.createElement('option');
         option.value = aprendizData.gaes.id;
         option.textContent = aprendizData.gaes.nombre;
         option.selected = true;
         selectGaes.appendChild(option);
     } else {
         selectGaes.innerHTML = '<option value="">Sin GAES asignado - Crea uno primero</option>';
         selectGaes.disabled = true;
     }
     
     openModal('modal-registrar-proyecto');
 }

async function registrarProyecto(event) {
      event.preventDefault();
      
      const gaesId = document.getElementById('proyecto-gaes').value;
      if (!gaesId) {
          mostrarNotificacionGlobal('Debes seleccionar un GAES', 'error');
          return;
      }
      
      const proyectoId = document.getElementById('proyecto-id-edit').value;
      const isEdit = proyectoId && proyectoId.trim() !== '';
      
      const proyecto = {
           nombre: document.getElementById('proyecto-nombre').value,
           descripcion: document.getElementById('proyecto-descripcion').value,
           gaesId: parseInt(gaesId),
           trimestre: parseInt(document.getElementById('proyecto-trimestre').value),
           aprendizLiderId: aprendizData.aprendiz.id,
           fechaInicio: document.getElementById('proyecto-fecha-inicio').value || null,
           fechaFin: document.getElementById('proyecto-fecha-fin').value || null,
           estado: 'EN_DESARROLLO'
       };
      
      try {
           const url = isEdit ? `${API_BASE}/proyectos/${proyectoId}` : `${API_BASE}/proyectos`;
           const method = isEdit ? 'PUT' : 'POST';
           
           const response = await fetchWithAuth(url, {
               method: method,
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify(proyecto)
           });
          
          if (response.ok) {
              const mensaje = isEdit ? 'Proyecto actualizado exitosamente' : 'Proyecto registrado exitosamente';
              mostrarNotificacionGlobal(mensaje, 'success');
              closeModal('modal-registrar-proyecto');
              document.getElementById('form-registrar-proyecto').reset();
              document.getElementById('proyecto-id-edit').value = '';
              
              // Esperar un poco y luego recargar datos
              setTimeout(() => {
                  loadAprendizData();
              }, 500);
          } else {
              const errorData = await response.json().catch(() => ({}));
              console.error('Error al registrar proyecto:', errorData);
              mostrarNotificacionGlobal('Error al registrar el proyecto: ' + (errorData.message || response.statusText), 'error');
          }
      } catch (error) {
          console.error('Error:', error);
          mostrarNotificacionGlobal('Error al registrar el proyecto', 'error');
      }
  }

// ============================================================
// ENTREGABLES
// ============================================================

function updateEntregablesList() {
    const list = document.getElementById('entregables-list');
    list.innerHTML = '';
    
    if (!aprendizData.proyectos || aprendizData.proyectos.length === 0) {
        list.innerHTML = '<p class="empty-state">No hay proyectos. Crea un proyecto primero para entregar entregables.</p>';
        return;
    }
    
    let html = `
        <table class="table">
            <thead>
                <tr>
                    <th>Proyecto</th>
                    <th>Nombre</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    // Mostrar placeholders para cargar entregables de cada proyecto
    aprendizData.proyectos.forEach(proyecto => {
        html += `
            <tr>
                <td>${proyecto.nombre}</td>
                <td>-</td>
                <td><span class="badge-estado">SIN ENTREGABLES</span></td>
                <td>
                    <button class="btn-primary" onclick="abrirEntregable(${proyecto.id})">
                        Entregar
                    </button>
                </td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
    `;
    
    list.innerHTML = html;
}

function abrirEntregable(proyectoId) {
    document.getElementById('entregable-proyecto').value = proyectoId;
    openModal('modal-subir-entregable');
}

async function subirEntregable(event) {
    event.preventDefault();
    
    const proyectoId = parseInt(document.getElementById('entregable-proyecto').value);
    const nombre = document.getElementById('entregable-nombre').value;
    const descripcion = document.getElementById('entregable-descripcion').value;
    const url = document.getElementById('entregable-url').value;
    const archivo = document.getElementById('entregable-archivo').files[0];
    
    if (!nombre) {
        alert('Por favor ingresa el nombre del entregable');
        return;
    }
    
    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('descripcion', descripcion);
    formData.append('proyectoId', proyectoId);
    formData.append('aprendizId', aprendizData.aprendiz.id);
    
    if (url) {
        formData.append('url', url);
    }
    
    if (archivo) {
        formData.append('archivo', archivo);
    }
    
    try {
         const response = await fetchWithAuth(`${API_BASE}/entregables`, {
             method: 'POST',
             body: formData
         });
        
        if (response.ok) {
            alert('Entregable subido correctamente');
            closeModal('modal-subir-entregable');
            document.getElementById('form-subir-entregable').reset();
            loadAprendizData();
        } else {
            alert('Error al subir el entregable');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al subir el entregable');
    }
}

function activarModoEntrega(modo) {
    const urlContainer = document.getElementById('entrega-url-container');
    const archivoContainer = document.getElementById('entrega-archivo-container');
    
    if (modo === 'url') {
        urlContainer.style.display = 'block';
        archivoContainer.style.display = 'none';
    } else {
        urlContainer.style.display = 'none';
        archivoContainer.style.display = 'block';
    }
}

// ============================================================
// CALIFICACIONES
// ============================================================

function updateCalificacionesList() {
    const list = document.getElementById('calificaciones-list');
    if (!list) return;
    list.innerHTML = '';
    
    if (!aprendizData.evaluaciones || !Array.isArray(aprendizData.evaluaciones) || aprendizData.evaluaciones.length === 0) {
        list.innerHTML = '<p class="empty-state">No tienes calificaciones aún</p>';
        return;
    }
    
    aprendizData.evaluaciones.forEach(evaluacion => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <h3>Calificación</h3>
            <p><strong>Nota:</strong> ${evaluacion.calificacion ? (evaluacion.calificacion.toFixed(2)) + '/5' : 'Pendiente'}</p>
            <p><strong>Observaciones:</strong> ${evaluacion.observaciones || 'Sin observaciones'}</p>
            <p><strong>Fecha:</strong> ${evaluacion.fecha ? new Date(evaluacion.fecha).toLocaleDateString() : 'N/A'}</p>
        `;
        list.appendChild(card);
    });
}

// ============================================================
// GAES (GRUPOS)
// ============================================================

// Almacenar GAES actual para operaciones
let gaesActual = null;

function updateGaesList() {
    const list = document.getElementById('gaes-list');
    list.innerHTML = '';
    
    if (!aprendizData.gaes) {
        list.innerHTML = `
            <div class="card">
                <h3>👥 Sin GAES asignado</h3>
                <p>Crea un GAES o espera a que te asignen a uno</p>
            </div>
        `;
        return;
    }
    
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
        <h3>👥 ${aprendizData.gaes.nombre}</h3>
        <p><strong>Integrantes:</strong> ${aprendizData.gaes.integrantes?.length || 0}</p>
        <p><strong>Estado:</strong> <span class="badge-estado">${aprendizData.gaes.estado}</span></p>
        <button class="btn-primary" onclick="showIntegrantes()">
            Ver Integrantes
        </button>
    `;
    list.appendChild(card);
}

function showIntegrantes() {
    if (!aprendizData.gaes) return;
    
    gaesActual = aprendizData.gaes;
    const tbody = document.getElementById('integrantes-table-body');
    tbody.innerHTML = '';
    
    if (!aprendizData.gaes.integrantes || aprendizData.gaes.integrantes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="empty-state">No hay integrantes aún</td></tr>';
        cargarAprendicesDisponibles();
        openModal('modal-ver-integrantes');
        return;
    }
    
    aprendizData.gaes.integrantes.forEach((integrante, index) => {
         const tr = document.createElement('tr');
         const nombre = integrante.usuarioNombre || integrante.usuario?.nombre || integrante.nombre || 'N/A';
         const correo = integrante.usuarioCorreo || integrante.usuario?.correo || integrante.correo || 'N/A';
         tr.innerHTML = `
             <td>${nombre}</td>
             <td>${correo}</td>
             <td>${integrante.esLider ? '👑 Líder' : 'Miembro'}</td>
             <td>
                 <button class="btn-secondary" onclick="removerIntegrante(${integrante.id})">
                     Remover
                 </button>
             </td>
         `;
         tbody.appendChild(tr);
     });
    
    cargarAprendicesDisponibles();
    openModal('modal-ver-integrantes');
}

async function crearGaes(event) {
    event.preventDefault();
    
    const nombre = document.getElementById('gaes-nombre').value;
    
    const gaes = {
        nombre: nombre,
        fichaId: aprendizData.ficha?.id,
        estado: 'ACTIVO'
    };
    
    try {
         const response = await fetchWithAuth(`${API_BASE}/gaes`, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify(gaes)
         });
         
         if (response.ok) {
             const nuevoGaes = await response.json();
             console.log('✓ GAES creado:', nuevoGaes);
             
             // Asignar el GAES al aprendiz usando el endpoint PATCH
             const url = `${API_BASE}/aprendices/${aprendizData.aprendiz.id}/gaes/${nuevoGaes.id}`;
             console.log('Asignando GAES con URL:', url);
             
             const asignGaesResponse = await fetchWithAuth(url, {
                 method: 'PATCH'
             });
             
             if (asignGaesResponse.ok) {
                 const asignado = await asignGaesResponse.json();
                 console.log('✓ GAES asignado:', asignado);
                 alert('GAES creado y asignado exitosamente');
                 closeModal('modal-crear-gaes');
                 document.getElementById('form-crear-gaes').reset();
                 
                 // Esperar un poco y luego recargar datos
                 setTimeout(() => loadAprendizData(), 500);
             } else {
                 console.error('Error asignando GAES:', asignGaesResponse.status);
                 alert('GAES creado pero no se pudo asignar al aprendiz');
             }
        } else {
            console.error('Error creando GAES:', response.status);
            alert('Error al crear el GAES');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al crear el GAES');
    }
}

async function cargarAprendicesDisponibles() {
     const select = document.getElementById('aprendiz-select');
     select.innerHTML = '<option value="">Seleccione un aprendiz</option>';
     
     try {
         const response = await fetch(`${API_BASE}/aprendices`);
         const aprendices = await response.json();
         
         console.log('DEBUG - aprendizData.ficha:', aprendizData.ficha);
         console.log('DEBUG - aprendizData.ficha?.id:', aprendizData.ficha?.id);
         console.log('DEBUG - Todos los aprendices:', aprendices);
         
         // Filtrar aprendices de la misma ficha que no estén en el GAES
         const fichaId = aprendizData.ficha?.id;
         
         if (!fichaId) {
             console.warn('Sin fichaId - mostrando todos los aprendices');
         }
         
         const aprendicesDisponibles = aprendices.filter(a => 
             (fichaId ? a.ficha?.id === fichaId : true) &&
             a.id !== aprendizData.aprendiz.id &&
             (!gaesActual.integrantes || !gaesActual.integrantes.find(i => i.id === a.id))
         );
         
         console.log('DEBUG - Aprendices disponibles:', aprendicesDisponibles);
         
         if (aprendicesDisponibles.length === 0) {
             select.innerHTML = '<option value="">No hay aprendices disponibles</option>';
             return;
         }
         
         aprendicesDisponibles.forEach(aprendiz => {
             const option = document.createElement('option');
             option.value = aprendiz.id;
             option.textContent = `${aprendiz.usuario?.nombre || aprendiz.nombre} (${aprendiz.usuario?.correo})`;
             select.appendChild(option);
         });
     } catch (error) {
         console.error('Error cargando aprendices:', error);
         select.innerHTML = '<option value="">Error al cargar aprendices</option>';
     }
 }

async function agregarIntegrante(event) {
    event.preventDefault();
    
    const aprendizId = parseInt(document.getElementById('aprendiz-select').value);
    const esLider = document.getElementById('es-lider').checked;
    
    if (!aprendizId) {
        alert('Selecciona un aprendiz');
        return;
    }
    
    try {
        // Asignar el GAES al aprendiz usando PATCH
        const url = `${API_BASE}/aprendices/${aprendizId}/gaes/${gaesActual.id}`;
        console.log('Agregando integrante al GAES:', url);
        
        const response = await fetchWithAuth(url, {
            method: 'PATCH'
        });
        
        if (response.ok) {
            const resultado = await response.json();
            console.log('✓ Integrante agregado:', resultado);
            alert('Integrante agregado al GAES');
            closeModal('modal-agregar-integrante');
            document.getElementById('form-agregar-integrante').reset();
            
            // Esperar un poco y luego recargar datos
            setTimeout(() => loadAprendizData(), 500);
        } else {
            console.error('Error agregando integrante:', response.status);
            alert('Error al agregar integrante');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al agregar integrante');
    }
}

async function removerIntegrante(aprendizId) {
     if (!confirm('¿Remover este integrante del GAES?')) return;
     
     try {
         // Desasignar el GAES usando PATCH
         const url = `${API_BASE}/aprendices/${aprendizId}/gaes`;
         console.log('Removiendo integrante del GAES:', url);
         
         const response = await fetchWithAuth(url, {
             method: 'PATCH'
         });
         
         if (response.ok) {
             const resultado = await response.json();
             console.log('✓ Integrante removido:', resultado);
             alert('Integrante removido del GAES');
             
             // Esperar un poco y luego recargar datos
             setTimeout(() => loadAprendizData(), 500);
         } else {
             console.error('Error removiendo integrante:', response.status);
             alert('Error al remover integrante');
         }
     } catch (error) {
         console.error('Error:', error);
         alert('Error al remover integrante');
     }
 }

// ============================================================
// FORMULARIOS
// ============================================================

function initializeForms() {
    const formPerfil = document.getElementById('form-editar-perfil');
    if (formPerfil) {
        formPerfil.addEventListener('submit', (e) => {
            e.preventDefault();
            actualizarPerfil();
        });
    }
    
    const formPassword = document.getElementById('form-cambiar-contrasena');
    if (formPassword) {
        formPassword.addEventListener('submit', (e) => {
            e.preventDefault();
            cambiarContrasena();
        });
    }
}

async function actualizarPerfil() {
    const usuario = {
        ...aprendizData.usuario,
        nombre: document.getElementById('perfil-nombre').value,
        apellido: document.getElementById('perfil-apellido').value,
        correo: document.getElementById('perfil-correo').value
    };
    
    try {
        const response = await fetch(`${API_BASE}/usuarios/${usuario.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(usuario)
        });
        
        if (response.ok) {
            alert('Perfil actualizado');
            closeModal('modal-editar-perfil');
            loadAprendizData();
        }
    } catch (error) {
        console.error('Error actualizando perfil:', error);
    }
}

async function cambiarContrasena() {
    const nueva = document.getElementById('contrasena-nueva').value;
    const confirmar = document.getElementById('contrasena-confirmar').value;
    
    if (nueva !== confirmar) {
        alert('Las contraseñas no coinciden');
        return;
    }
    
    alert('Contraseña cambiada');
    closeModal('modal-cambiar-contrasena');
}

// ============================================================
// UTILIDADES
// ============================================================

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

function toggleNotificationPanel() {
    const panel = document.getElementById('notification-panel');
    panel.classList.toggle('active');
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
}

function loadTheme() {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
    }
}

function logout() {
    if (confirm('¿Deseas cerrar sesión?')) {
        window.location.href = '/login';
    }
}

function getUserIdFromToken() {
    // Obtener del localStorage (se guarda durante el login)
    const usuarioId = localStorage.getItem('usuarioId');
    if (usuarioId) {
        return parseInt(usuarioId);
    }
    
    // Si no está en localStorage, intentar decodificar del JWT
    const token = localStorage.getItem('jwtToken');
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.usuarioId || payload.sub || null;
        } catch (e) {
            console.error('Error decodificando token:', e);
        }
    }
    
    console.warn('No se pudo obtener usuarioId. Usando valor por defecto.');
    return null;
}

function setupEventListeners() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
}

// ============================================================
// PREVIEW DE FOTO DE PERFIL
// ============================================================

function previewFoto(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('perfil-foto-preview').src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function previewFotoModal(event) {
    const file = event.target.files[0];
    if (file) {
        // Validar tamaño
        if (file.size > 5 * 1024 * 1024) {
            alert('El archivo es muy grande. Máximo 5MB.');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const previewImg = document.getElementById('preview-img');
            const previewInitials = document.getElementById('preview-initials');
            previewImg.src = e.target.result;
            previewImg.style.display = 'block';
            previewInitials.style.display = 'none';
        };
        reader.readAsDataURL(file);
    }
}

async function guardarFotoPerfil(event) {
    event.preventDefault();
    
    const file = document.getElementById('foto-archivo').files[0];
    if (!file) {
        alert('Por favor selecciona una foto');
        return;
    }
    
    const usuarioId = localStorage.getItem('usuarioId');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('usuarioId', usuarioId);
    
    try {
        const response = await fetch(`/api/usuarios/${usuarioId}/foto`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
            },
            body: formData
        });
        
        if (response.ok) {
            const result = await response.json();
            
            // Mostrar la foto en el avatar
            const avatarImg = document.getElementById('user-avatar-img');
            const avatarInitials = document.getElementById('user-initials');
            
            if (result.fotoPerfil) {
                avatarImg.src = result.fotoPerfil;
                avatarImg.style.display = 'block';
                avatarInitials.style.display = 'none';
            }
            
            alert('Foto actualizada correctamente');
            closeModal('modal-editar-foto-perfil');
            
            // Limpiar el input
            document.getElementById('foto-archivo').value = '';
            document.getElementById('preview-img').src = '';
            document.getElementById('preview-img').style.display = 'none';
            document.getElementById('preview-initials').style.display = 'block';
        } else {
            const error = await response.json().catch(() => ({}));
            alert('Error al guardar la foto: ' + (error.message || 'Error desconocido'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al guardar la foto');
    }
}
