// ============================================================
// INSTRUCTOR DASHBOARD - JavaScript
// ============================================================

let instructorData = {};
const API_BASE = '/api';

// ============================================================
// INICIALIZACIÓN
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation();
    initializeForms();
    loadInstructorData();
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
// CARGAR DATOS DEL INSTRUCTOR
// ============================================================

function loadInstructorData() {
    const usuarioId = getUserIdFromToken();
    
    Promise.all([
        fetchWithAuth(`${API_BASE}/instructores/usuario/${usuarioId}`).then(r => r.json()),
        fetchWithAuth(`${API_BASE}/usuarios/${usuarioId}`).then(r => r.json()),
    ])
    .then(([instructor, usuario]) => {
        instructorData.instructor = instructor;
        instructorData.usuario = usuario;
        
        const promises = [
            fetchWithAuth(`${API_BASE}/usuarios/${usuarioId}`).then(r => r.json())
        ];
        
        // Si el instructor tiene ficha asignada, cargar los aprendices
        if (instructor.fichaId) {
            promises.push(
                fetchWithAuth(`${API_BASE}/fichas/${instructor.fichaId}`).then(r => r.json())
            );
        } else {
            promises.push(Promise.resolve(null));
        }
        
        return Promise.all(promises);
    })
    .then(([usuario, ficha]) => {
        if (ficha) {
            instructorData.fichas = [ficha];
        } else {
            instructorData.fichas = [];
        }
        
        // Cargar todos los aprendices para poder obtener sus GAES
        return fetchWithAuth(`${API_BASE}/aprendices`).then(r => r.json());
    })
    .then(aprendices => {
        window.aprendicesListaCompleta = aprendices;
        
        updateDashboard();
        updateFichasList();
        updateAprendicesList();
        updateCalificacionesList();
        updateGaesCalificarList();
        initGaesInstructor();
        initEntregablesInstructor();
    })
    .catch(error => {
        console.error('Error cargando datos del instructor:', error);
        updateDashboard();
        updateFichasList();
        updateAprendicesList();
        updateCalificacionesList();
        updateGaesCalificarList();
        initGaesInstructor();
        initEntregablesInstructor();
    });
}

// ============================================================
// ACTUALIZAR DASHBOARD
// ============================================================

function updateDashboard() {
    const grid = document.getElementById('dashboard-grid');
    grid.innerHTML = '';
    
    grid.innerHTML += `
        <div class="dashboard-card">
            <h3>👨‍🏫 Bienvenida, ${instructorData.usuario.nombre}</h3>
            <p>Rol: Instructor</p>
            <p>Correo: ${instructorData.usuario.correo}</p>
        </div>
    `;
    
    if (instructorData.fichas) {
        grid.innerHTML += `
            <div class="dashboard-card">
                <h3>📚 Fichas a Cargo</h3>
                <p>Total: ${instructorData.fichas.length}</p>
                <button class="btn-primary" onclick="goToSection('mis-fichas')">
                    Ver Fichas
                </button>
            </div>
        `;
    }
    
    // Contar aprendices
    let totalAprendices = 0;
    if (instructorData.fichas && instructorData.fichas.length > 0) {
        instructorData.fichas.forEach(ficha => {
            if (ficha.aprendices) {
                totalAprendices += ficha.aprendices.length;
            }
        });
    }
    
    grid.innerHTML += `
        <div class="dashboard-card">
            <h3>👥 Aprendices</h3>
            <p>Total: ${totalAprendices}</p>
            <button class="btn-primary" onclick="goToSection('aprendices')">
                Ver Aprendices
            </button>
        </div>
    `;
}

// ============================================================
// FICHAS
// ============================================================

function updateFichasList() {
    const list = document.getElementById('fichas-list');
    list.innerHTML = '';
    
    if (!instructorData.fichas || instructorData.fichas.length === 0) {
        list.innerHTML = '<p class="empty-state">No tienes fichas asignadas</p>';
        return;
    }
    
    instructorData.fichas.forEach(ficha => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <h3>${ficha.programaFormacion}</h3>
            <p><strong>Código:</strong> ${ficha.codigoFicha}</p>
            <p><strong>Aprendices:</strong> ${ficha.aprendices?.length || 0}</p>
            <p><strong>Estado:</strong> <span class="badge-estado">${ficha.estado}</span></p>
        `;
        list.appendChild(card);
    });
}

// ============================================================
// APRENDICES
// ============================================================

function updateAprendicesList() {
    const list = document.getElementById('aprendices-list');
    list.innerHTML = '';
    
    if (!instructorData.fichas || instructorData.fichas.length === 0) {
        list.innerHTML = '<p class="empty-state">No hay aprendices</p>';
        return;
    }
    
    let allAprendices = [];
    instructorData.fichas.forEach(ficha => {
        if (ficha.aprendices) {
            ficha.aprendices.forEach(aprendiz => {
                allAprendices.push({
                    ...aprendiz,
                    fichaAsignada: ficha
                });
            });
        }
    });
    
    if (allAprendices.length === 0) {
        list.innerHTML = '<table class="table"><tr><td colspan="5" class="empty-state">No hay aprendices registrados</td></tr></table>';
        return;
    }
    
    let html = `
        <table class="table">
            <thead>
                <tr>
                    <th>Aprendiz</th>
                    <th>Correo</th>
                    <th>Ficha Asignada</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    allAprendices.forEach(aprendiz => {
        const nombreCompleto = `${aprendiz.usuarioNombre || aprendiz.usuario?.nombre || aprendiz.nombre || ''} ${aprendiz.usuarioApellido || aprendiz.usuario?.apellido || aprendiz.apellido || ''}`.trim() || 'N/A';
        const correo = aprendiz.usuarioCorreo || aprendiz.usuario?.correo || aprendiz.correo || 'N/A';
        const ficha = aprendiz.fichaCodigoFicha || aprendiz.fichaAsignada?.codigoFicha || aprendiz.ficha?.codigoFicha || 'N/A';
        const programaFormacion = aprendiz.fichaProgramaFormacion || aprendiz.fichaAsignada?.programaFormacion || aprendiz.ficha?.programaFormacion || '';
        
        html += `
            <tr>
                <td><strong>${nombreCompleto}</strong></td>
                <td>${correo}</td>
                <td>
                    <div>${ficha}</div>
                    <small>${programaFormacion}</small>
                </td>
                <td><span class="badge-estado">${aprendiz.estado || 'ACTIVO'}</span></td>
                <td><button class="btn-secondary" onclick="verAprendiz(${aprendiz.id})">Ver</button></td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
    `;
    
    list.innerHTML = html;
}

function verAprendiz(id) {
    console.log('Ver aprendiz:', id);
}

// ============================================================
// CALIFICACIONES
// ============================================================

function updateCalificacionesList() {
    const list = document.getElementById('calificaciones-list');
    if (!list) return;
    
    list.innerHTML = '';
    
    // Obtener todos los aprendices de la ficha
    let todasEntregables = [];
    if (instructorData.fichas && instructorData.fichas.length > 0) {
        instructorData.fichas.forEach(ficha => {
            if (ficha.aprendices && ficha.aprendices.length > 0) {
            ficha.aprendices.forEach(aprendiz => {
             const nombreCompleto = `${aprendiz.usuarioNombre || aprendiz.usuario?.nombre || aprendiz.nombre || ''} ${aprendiz.usuarioApellido || aprendiz.usuario?.apellido || aprendiz.apellido || ''}`.trim() || 'N/A';
             todasEntregables.push({
                 aprendizId: aprendiz.id,
                 aprendizNombre: nombreCompleto,
                 aprendizCorreo: aprendiz.usuarioCorreo || aprendiz.usuario?.correo || aprendiz.correo || 'N/A',
                 fichaId: ficha.id,
                 fichaCodigoFicha: ficha.codigoFicha,
                 fichaProgramaFormacion: ficha.programaFormacion
             });
            });
            }
        });
    }
    
    if (todasEntregables.length === 0) {
        list.innerHTML = '<p class="empty-state">No hay aprendices para calificar</p>';
        return;
    }
    
    let html = `
        <table class="table">
            <thead>
                <tr>
                    <th>Aprendiz</th>
                    <th>Correo</th>
                    <th>Ficha</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    todasEntregables.forEach((entregable, index) => {
        html += `
            <tr>
                <td>${entregable.aprendizNombre}</td>
                <td>${entregable.aprendizCorreo}</td>
                <td>
                    <div>${entregable.fichaCodigoFicha}</div>
                    <small>${entregable.fichaProgramaFormacion}</small>
                </td>
                <td>
                    <button class="btn-primary" onclick="abrirCalificacion(${entregable.aprendizId})">
                        Calificar
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

// Variables para rastrear la escala actual
let escalaActual = 5;

function cambiarEscala(escala) {
    escalaActual = escala;
    const etiqueta = document.getElementById('etiqueta-calificacion');
    const input = document.getElementById('calificacion-nota');
    
    if (escala === 100) {
        etiqueta.textContent = '(0-100)';
        input.max = 100;
        input.value = '';
    } else {
        etiqueta.textContent = '(0-5)';
        input.max = 5;
        input.value = '';
    }
}

function abrirCalificacion(aprendizId) {
    const aprendiz = instructorData.fichas
        .flatMap(f => f.aprendices || [])
        .find(a => a.id === aprendizId);
    
    if (!aprendiz) {
        alert('Aprendiz no encontrado');
        return;
    }
    
    escalaActual = 5;
    document.getElementById('calificacion-aprendiz-id').value = aprendizId;
    document.getElementById('calificacion-nota').value = '';
    document.getElementById('calificacion-observaciones').value = '';
    document.querySelector('input[name="escala-calificacion"][value="5"]').checked = true;
    document.getElementById('calificacion-nota').max = 5;
    document.getElementById('etiqueta-calificacion').textContent = '(0-5)';
    
    openModal('modal-calificar');
}

async function guardarCalificacion(event) {
     event.preventDefault();
     
     const aprendizId = parseInt(document.getElementById('calificacion-aprendiz-id').value);
     let nota = parseFloat(document.getElementById('calificacion-nota').value);
     const observaciones = document.getElementById('calificacion-observaciones').value;
     
     if (isNaN(aprendizId) || isNaN(nota)) {
         alert('Por favor completa todos los campos');
         return;
     }
     
     // Validar según la escala
     if (escalaActual === 100) {
         if (nota < 0 || nota > 100) {
             alert('La calificación debe estar entre 0 y 100');
             return;
         }
         // Convertir a escala 0-5
         nota = (nota / 100) * 5;
     } else {
         if (nota < 0 || nota > 5) {
             alert('La calificación debe estar entre 0 y 5');
             return;
         }
     }
     
     // Buscar el aprendiz para obtener su GAES
     let gaesId = null;
     if (window.aprendicesListaCompleta) {
         const aprendiz = window.aprendicesListaCompleta.find(a => a.id === aprendizId);
         if (aprendiz && aprendiz.gaesId) {
             gaesId = aprendiz.gaesId;
         }
     }
     
     if (!gaesId) {
         alert('El aprendiz no tiene GAES asignado');
         return;
     }
     
     // Crear objeto de evaluación con la estructura correcta
     const evaluacion = {
         aprendiz: { id: aprendizId },
         gaes: { id: gaesId },
         evaluador: { id: instructorData.instructor.id },
         calificacion: nota,
         observaciones: observaciones,
         fecha: new Date().toISOString().split('T')[0]
     };
     
     try {
         console.log('Enviando evaluación:', evaluacion);
         const response = await fetchWithAuth(`${API_BASE}/evaluaciones`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(evaluacion)
          });
         
         if (response.ok) {
             alert('Calificación guardada correctamente');
             closeModal('modal-calificar');
             loadInstructorData();
         } else {
             const errorData = await response.json().catch(() => ({}));
             console.error('Error response:', errorData);
             alert('Error al guardar la calificación: ' + (errorData.message || response.statusText));
         }
     } catch (error) {
         console.error('Error:', error);
         alert('Error al guardar la calificación');
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
        ...instructorData.usuario,
        nombre: document.getElementById('perfil-nombre').value,
        apellido: document.getElementById('perfil-apellido').value,
        correo: document.getElementById('perfil-correo').value
    };
    
    try {
         const response = await fetchWithAuth(`${API_BASE}/usuarios/${usuario.id}`, {
             method: 'PUT',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify(usuario)
         });
        
        if (response.ok) {
            alert('Perfil actualizado');
            closeModal('modal-editar-perfil');
            loadInstructorData();
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
        // Implementar logout
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
    // Cerrar modal al hacer clic fuera
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

// ============================================================
// CALIFICAR GAES
// ============================================================

let escalaGaesActual = 5;

function cambiarEscalaGaes(escala) {
    escalaGaesActual = escala;
    const etiqueta = document.getElementById('etiqueta-calificacion-gaes');
    const input = document.getElementById('calificacion-nota-gaes');
    
    if (escala === 100) {
        etiqueta.textContent = '(0-100)';
        input.max = 100;
        input.value = '';
    } else {
        etiqueta.textContent = '(0-5)';
        input.max = 5;
        input.value = '';
    }
}

function updateGaesCalificarList() {
    const list = document.getElementById('gaes-calificar-list');
    if (!list) return;
    
    list.innerHTML = '';
    
    // Obtener todos los GAES de los aprendices de la ficha
    let todosGaes = new Map();
    
    if (instructorData.fichas && instructorData.fichas.length > 0) {
        instructorData.fichas.forEach(ficha => {
            if (ficha.aprendices && ficha.aprendices.length > 0) {
                ficha.aprendices.forEach(aprendiz => {
                    if (aprendiz.gaes) {
                        const gaesId = aprendiz.gaes.id;
                        if (!todosGaes.has(gaesId)) {
                            todosGaes.set(gaesId, {
                                gaesId: aprendiz.gaes.id,
                                gaesNombre: aprendiz.gaes.nombre,
                                fichaId: ficha.id,
                                fichaCodigoFicha: ficha.codigoFicha,
                                fichaProgramaFormacion: ficha.programaFormacion,
                                integrantes: aprendiz.gaes.integrantes?.length || 0
                            });
                        }
                    }
                });
            }
        });
    }
    
    const gaesArray = Array.from(todosGaes.values());
    
    if (gaesArray.length === 0) {
        list.innerHTML = '<p class="empty-state">No hay GAES para calificar</p>';
        return;
    }
    
    let html = `
        <table class="table">
            <thead>
                <tr>
                    <th>GAES</th>
                    <th>Integrantes</th>
                    <th>Ficha</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    gaesArray.forEach(gaes => {
        html += `
            <tr>
                <td><strong>${gaes.gaesNombre}</strong></td>
                <td>${gaes.integrantes}</td>
                <td>
                    <div>${gaes.fichaCodigoFicha}</div>
                    <small>${gaes.fichaProgramaFormacion}</small>
                </td>
                <td>
                    <button class="btn-primary" onclick="abrirCalificacionGaes(${gaes.gaesId})">
                        Calificar
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

function abrirCalificacionGaes(gaesId) {
    escalaGaesActual = 5;
    document.getElementById('calificacion-gaes-id').value = gaesId;
    document.getElementById('calificacion-nota-gaes').value = '';
    document.getElementById('calificacion-observaciones-gaes').value = '';
    document.querySelector('input[name="escala-calificacion-gaes"][value="5"]').checked = true;
    document.getElementById('calificacion-nota-gaes').max = 5;
    document.getElementById('etiqueta-calificacion-gaes').textContent = '(0-5)';
    
    openModal('modal-calificar-gaes');
}

async function guardarCalificacionGaes(event) {
    event.preventDefault();
    
    const gaesId = parseInt(document.getElementById('calificacion-gaes-id').value);
    let nota = parseFloat(document.getElementById('calificacion-nota-gaes').value);
    const observaciones = document.getElementById('calificacion-observaciones-gaes').value;
    
    if (isNaN(gaesId) || isNaN(nota)) {
        alert('Por favor completa todos los campos');
        return;
    }
    
    // Validar según la escala
    if (escalaGaesActual === 100) {
        if (nota < 0 || nota > 100) {
            alert('La calificación debe estar entre 0 y 100');
            return;
        }
        // Convertir a escala 0-5
        nota = (nota / 100) * 5;
    } else {
        if (nota < 0 || nota > 5) {
            alert('La calificación debe estar entre 0 y 5');
            return;
        }
    }
    
    // Crear objeto de evaluación para el GAES
    const evaluacion = {
        calificacion: nota,
        observaciones: observaciones,
        gaesId: gaesId,
        instructorId: instructorData.instructor.id,
        fecha: new Date().toISOString()
    };
    
    try {
         // Nota: Esto requiere un endpoint POST /api/evaluaciones/gaes
         // Si no existe, crea uno en el backend
         const response = await fetchWithAuth(`${API_BASE}/evaluaciones/gaes`, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify(evaluacion)
         });
        
        if (response.ok) {
            alert('Calificación del GAES guardada correctamente');
            closeModal('modal-calificar-gaes');
            loadInstructorData();
        } else {
            alert('Error al guardar la calificación del GAES');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al guardar la calificación del GAES');
    }
}
