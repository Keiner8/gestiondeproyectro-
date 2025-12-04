// Inicializar variables globales
let fichas = [];
let usuarios = [];
let proyectos = [];
let entregables = [];
let jurados = [];
let reportes = [];
let mensajes = [];
let recordatorios = [];
let historial = [];
let accesos = [];
let ciclos = [];
let alertas = [];

const currentDate = new Date('2025-09-28');

/**
 * Inicialización al cargar la página
 */
document.addEventListener('DOMContentLoaded', () => {
    loadAllData();

    // Eventos de formularios
    document.querySelectorAll('.robust-form').forEach(form => form.addEventListener('submit', handleFormSubmission));

    // Eventos de búsqueda
    document.querySelector('#global-search').addEventListener('input', handleGlobalSearch);
    document.querySelector('#fichas-search').addEventListener('input', applyFichasFilter);
    document.querySelector('#usuarios-search').addEventListener('input', applyUsuariosFilter);
    document.querySelector('#proyectos-search').addEventListener('input', applyProyectosFilter);
    document.querySelector('#entregables-search').addEventListener('input', applyEntregablesFilter);
    document.querySelector('#jurados-search').addEventListener('input', applyJuradosFilter);
    document.querySelector('#mensajes-search').addEventListener('input', applyMensajesFilter);
    document.querySelector('#auditoria-search').addEventListener('input', applyAuditoriaFilter);

    // Navegación por el menú
    document.querySelectorAll('.sidebar ul li').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
            document.querySelectorAll('.sidebar ul li').forEach(li => li.classList.remove('active'));
            document.getElementById(item.dataset.section).classList.add('active');
            item.classList.add('active');
            document.getElementById('notification-panel').classList.remove('active');
        });
    });

    // Cerrar modales
    document.querySelectorAll('.modal-close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            closeModal(closeBtn.closest('.modal').id);
        });
    });

    // Hacer modales arrastrables
    document.querySelectorAll('.modal-content').forEach(modal => {
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;

        modal.addEventListener('mousedown', (e) => {
            initialX = e.clientX - (currentX || 0);
            initialY = e.clientY - (currentY || 0);
            isDragging = true;
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
                modal.style.left = `${currentX + 50}%`;
                modal.style.top = `${currentY + 50}%`;
                modal.style.transform = 'translate(-50%, -50%)';
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    });

    // Tabs en modal de proyectos
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => showTab(btn.getAttribute('onclick').match(/'(.+)'/)[1]));
    });
});

// Función para cargar todos los datos desde el backend
function loadAllData() {
    Promise.all([
        fetch('/api/fichas').then(res => res.json()).then(data => fichas = data),
        fetch('/api/usuarios').then(res => res.json()).then(data => usuarios = data),
        fetch('/api/proyectos').then(res => res.json()).then(data => proyectos = data),
        fetch('/api/entregables').then(res => res.json()).then(data => entregables = data),
        fetch('/api/jurados').then(res => res.json()).then(data => jurados = data),
        fetch('/api/reportes').then(res => res.json()).then(data => reportes = data),
        fetch('/api/mensajes').then(res => res.json()).then(data => mensajes = data),
        fetch('/api/recordatorios').then(res => res.json()).then(data => recordatorios = data),
        fetch('/api/historial').then(res => res.json()).then(data => historial = data),
        fetch('/api/accesos').then(res => res.json()).then(data => accesos = data),
        fetch('/api/ciclos').then(res => res.json()).then(data => ciclos = data),
        fetch('/api/alertas').then(res => res.json()).then(data => alertas = data)
    ]).then(() => {
        renderDashboard();
        renderFichasTable();
        renderUsuariosTable();
        renderProyectosList();
        renderEntregablesTimeline();
        renderJuradosTable();
        renderReportes();
        renderHistorialMensajes();
        renderHistorialTable();
        renderAccesosTable();
        renderCiclosTable();
        renderNotificaciones();
        populateSelectOptions();
    }).catch(error => console.error('Error al cargar datos:', error));
}

// 📊 Dashboard
function renderDashboard() {
    document.getElementById('aprendices-activos').textContent = usuarios.filter(u => u.rol === 'Aprendiz' && u.estado === 'Activo').length;
    document.getElementById('fichas-activas').textContent = fichas.filter(f => f.estado === 'Activa').length;
    document.getElementById('proyectos-activos').textContent = proyectos.filter(p => p.estado === 'Activo').length;
    document.getElementById('entregables-pendientes').textContent = entregables.flatMap(e => e.items.filter(i => i.estado === 'Pendiente')).length;

    const ctxAvance = document.getElementById('avance-fichas-chart').getContext('2d');
    new Chart(ctxAvance, {
        type: 'bar',
        data: {
            labels: fichas.map(f => f.id),
            datasets: [{ label: '% Avance', data: fichas.map(f => f.avance), backgroundColor: '#3498db' }]
        },
        options: { scales: { y: { beginAtZero: true, max: 100 } } }
    });

    const ctxProyectos = document.getElementById('proyectos-por-ficha-chart').getContext('2d');
    new Chart(ctxProyectos, {
        type: 'bar',
        data: {
            labels: fichas.map(f => f.id),
            datasets: [{ label: 'Proyectos por Ficha', data: fichas.map(f => proyectos.filter(p => p.ficha === f.id).length), backgroundColor: '#2ecc71' }]
        },
        options: { scales: { y: { beginAtZero: true } } }
    });
}

function refreshDashboard() {
    loadAllData();
    alert('Datos actualizados');
}

// 📂 Gestión de Fichas
function renderFichasTable(filtered = fichas) {
    const tbody = document.querySelector('#fichas-table tbody');
    tbody.innerHTML = '';
    filtered.forEach(f => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${f.id}</td>
            <td>${f.programa}</td>
            <td>${f.trimestre}</td>
            <td>${f.aprendices}</td>
            <td>${f.instructor}</td>
            <td>${f.estado}</td>
            <td>
                <button class="action-btn" onclick="editFicha('${f.id}')">✏️ Editar</button>
                <button class="delete-btn" onclick="deleteFicha('${f.id}')">🗑️ Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function applyFichasFilter() {
    const query = document.getElementById('fichas-search').value.toLowerCase();
    const estado = document.getElementById('fichas-filter-estado').value;
    fetch(`/api/fichas?query=${encodeURIComponent(query)}&estado=${estado}`)
        .then(res => res.json())
        .then(filtered => renderFichasTable(filtered))
        .catch(error => console.error('Error en filtro de fichas:', error));
}

function editFicha(id) {
    openForm('edit-ficha-form', 'modal', id);
}

function deleteFicha(id) {
    openForm('delete-ficha-form', 'modal', id);
}

// 👥 Gestión de Usuarios
function renderUsuariosTable(filtered = usuarios) {
    const tbody = document.querySelector('#usuarios-table tbody');
    tbody.innerHTML = '';
    filtered.forEach(u => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${u.nombre}</td>
            <td>${u.correo}</td>
            <td>${u.rol}</td>
            <td>${u.estado}</td>
            <td>
                <button class="action-btn" onclick="editUsuario('${u.id}')">✏️ Editar</button>
                <button class="action-btn" onclick="cambiarRol('${u.id}')">🔄 Cambiar Rol</button>
                <button class="${u.estado === 'Activo' ? 'delete-btn' : 'confirm-btn'}" onclick="toggleUsuarioEstado('${u.id}')">${u.estado === 'Activo' ? '🚫 Bloquear' : '✅ Desbloquear'}</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function applyUsuariosFilter() {
    const query = document.getElementById('usuarios-search').value.toLowerCase();
    const rol = document.getElementById('usuarios-filter-rol').value;
    fetch(`/api/usuarios?query=${encodeURIComponent(query)}&rol=${rol}`)
        .then(res => res.json())
        .then(filtered => renderUsuariosTable(filtered))
        .catch(error => console.error('Error en filtro de usuarios:', error));
}

function editUsuario(id) {
    openForm('edit-usuario-form', 'modal', id);
}

function cambiarRol(id) {
    openForm('cambiar-rol-form', 'modal', id);
}

function toggleUsuarioEstado(id) {
    openForm('bloquear-usuario-form', 'modal', id);
}

// 📑 Gestión de Proyectos
function renderProyectosList(filtered = proyectos) {
    const container = document.getElementById('proyectos-list');
    container.innerHTML = '';
    filtered.forEach(p => {
        const card = document.createElement('div');
        card.classList.add('proyecto-card');
        card.innerHTML = `
            <h3>${p.id}</h3>
            <p>Ficha: ${p.ficha} | Estado: ${p.estado} | Jurado: ${p.jurado || 'No asignado'}</p>
            <button class="action-btn" onclick="viewProyecto('${p.id}')">📂 Ver Proyecto</button>
            <button class="action-btn" onclick="editProyecto('${p.id}')">✏️ Editar</button>
            <button class="delete-btn" onclick="deleteProyecto('${p.id}')">🗑️ Eliminar</button>
            <button class="action-btn" onclick="reasignarProyecto('${p.id}')">🔄 Reasignar</button>
        `;
        container.appendChild(card);
    });
}

function applyProyectosFilter() {
    const query = document.getElementById('proyectos-search').value.toLowerCase();
    const ficha = document.getElementById('proyectos-filter-ficha').value;
    fetch(`/api/proyectos?query=${encodeURIComponent(query)}&ficha=${ficha}`)
        .then(res => res.json())
        .then(filtered => renderProyectosList(filtered))
        .catch(error => console.error('Error en filtro de proyectos:', error));
}

function viewProyecto(id) {
    fetch(`/api/proyectos/${id}`)
        .then(res => res.json())
        .then(proyecto => {
            document.getElementById('proyecto-descripcion').textContent = proyecto.descripcion;
            document.getElementById('proyecto-integrantes').textContent = proyecto.integrantes;
            fetch(`/api/entregables?proyecto=${id}`)
                .then(res => res.json())
                .then(ent => {
                    document.getElementById('proyecto-entregables').innerHTML = ent.items.map(i => `<p>${i.name}: ${i.estado} (Fecha límite: ${i.fechaLimite})</p>`).join('');
                    openForm('view-proyecto-form', 'modal');
                });
        });
}

function editProyecto(id) {
    openForm('edit-proyecto-form', 'modal', id);
}

function deleteProyecto(id) {
    openForm('delete-proyecto-form', 'modal', id);
}

function reasignarProyecto(id) {
    openForm('reasignar-proyecto-form', 'modal', id);
}

// 🗂️ Gestión de Entregables
function renderEntregablesTimeline(filtered = entregables) {
    const container = document.getElementById('entregables-timeline');
    container.innerHTML = '';
    filtered.forEach(e => {
        const fichaDiv = document.createElement('div');
        fichaDiv.classList.add('ficha-folder');
        fichaDiv.innerHTML = `<h3>Ficha ${e.ficha}</h3>`;
        const proyectoDiv = document.createElement('div');
        proyectoDiv.classList.add('gae-folder');
        proyectoDiv.innerHTML = `<h4>${e.proyecto}</h4>`;
        e.items.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('entregable-item');
            itemDiv.innerHTML = `
                <span>${item.name} → ${item.estado} (Fecha límite: ${item.fechaLimite})</span>
                <div>
                    <button class="action-btn" onclick="viewEntregable('${e.ficha}|${e.proyecto}|${item.name}')">👀 Ver archivo</button>
                    <button class="action-btn" onclick="editEntregable('${e.ficha}|${e.proyecto}|${item.name}')">✏️ Editar</button>
                    <button class="delete-btn" onclick="deleteEntregable('${e.ficha}|${e.proyecto}|${item.name}')">🗑️ Eliminar</button>
                    <button class="action-btn" onclick="asignarEntregable('${e.ficha}|${e.proyecto}|${item.name}')">📂 Asignar</button>
                </div>
            `;
            proyectoDiv.appendChild(itemDiv);
        });
        fichaDiv.appendChild(proyectoDiv);
        container.appendChild(fichaDiv);
    });
}

function applyEntregablesFilter() {
    const query = document.getElementById('entregables-search').value.toLowerCase();
    const estado = document.getElementById('entregables-filter-estado').value;
    fetch(`/api/entregables?query=${encodeURIComponent(query)}&estado=${estado}`)
        .then(res => res.json())
        .then(filtered => renderEntregablesTimeline(filtered))
        .catch(error => console.error('Error en filtro de entregables:', error));
}

function viewEntregable(context) {
    fetch(`/api/entregables/view?context=${encodeURIComponent(context)}`)
        .then(res => res.blob())
        .then(blob => {
            const url = URL.createObjectURL(blob);
            window.open(url);
        });
}

function editEntregable(context) {
    openForm('edit-entregable-form', 'modal', context);
}

function deleteEntregable(context) {
    openForm('delete-entregable-form', 'modal', context);
}

function asignarEntregable(context) {
    openForm('asignar-entregable-form', 'modal', context);
}

// ⭐ Gestión de Jurados
function renderJuradosTable(filtered = jurados) {
    const tbody = document.querySelector('#jurados-table tbody');
    tbody.innerHTML = '';
    filtered.forEach(j => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${j.nombre}</td>
            <td>${j.proyecto}</td>
            <td>${j.ficha}</td>
            <td>
                <button class="action-btn" onclick="cambiarJurado('${j.id}')">🔄 Cambiar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function applyJuradosFilter() {
    const query = document.getElementById('jurados-search').value.toLowerCase();
    fetch(`/api/jurados?query=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(filtered => renderJuradosTable(filtered))
        .catch(error => console.error('Error en filtro de jurados:', error));
}

function cambiarJurado(id) {
    openForm('cambiar-jurado-form', 'modal', id);
}

// 📊 Reportes
function renderReportes() {
    const container = document.getElementById('reportes-vista');
    container.innerHTML = reportes.length 
        ? reportes.map(r => `<p>Reporte: ${r.ficha || 'General'} - ${r.fecha}</p>`).join('')
        : '<p>No hay reportes generados</p>';
}

function exportReporte(tipo) {
    window.location.href = `/api/export/reporte?tipo=${tipo}`;
}

// 💬 Comunicaciones
function renderHistorialMensajes(filtered = mensajes) {
    const container = document.getElementById('historial-mensajes');
    container.innerHTML = filtered.length 
        ? filtered.map(m => `<p>${m.destinatarios}: ${m.mensaje} (Enviado: ${m.fecha})</p>`).join('')
        : '<p>No hay mensajes</p>';
}

function applyMensajesFilter() {
    const query = document.getElementById('mensajes-search').value.toLowerCase();
    fetch(`/api/mensajes?query=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(filtered => renderHistorialMensajes(filtered))
        .catch(error => console.error('Error en filtro de mensajes:', error));
}

// 🔒 Auditoría y Seguridad
function renderHistorialTable(filtered = historial) {
    const tbody = document.querySelector('#historial-table tbody');
    tbody.innerHTML = '';
    filtered.forEach(h => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${h.usuario}</td>
            <td>${h.accion}</td>
            <td>${h.fecha}</td>
        `;
        tbody.appendChild(tr);
    });
}

function renderAccesosTable(filtered = accesos) {
    const tbody = document.querySelector('#accesos-table tbody');
    tbody.innerHTML = '';
    filtered.forEach(a => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${a.usuario}</td>
            <td>${a.fecha}</td>
            <td>${a.ip}</td>
        `;
        tbody.appendChild(tr);
    });
}

function applyAuditoriaFilter() {
    const query = document.getElementById('auditoria-search').value.toLowerCase();
    fetch(`/api/auditoria?query=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(data => {
            renderHistorialTable(data.historial);
            renderAccesosTable(data.accesos);
        })
        .catch(error => console.error('Error en filtro de auditoría:', error));
}

function toggleAlertasSeguridad() {
    fetch('/api/seguridad/toggle-alertas', { method: 'POST' })
        .then(() => alert('Alertas de seguridad activadas/desactivadas'))
        .catch(error => console.error('Error al togglear alertas:', error));
}

// 🗓️ Ciclos Académicos
function renderCiclosTable(filtered = ciclos) {
    const tbody = document.querySelector('#ciclos-table tbody');
    tbody.innerHTML = '';
    filtered.forEach(c => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${c.nombre}</td>
            <td>${c.fechas}</td>
            <td>
                <button class="action-btn" onclick="viewCiclo('${c.nombre}')">📂 Ver</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function toggleCiclosHistoricos() {
    const historicos = document.getElementById('ciclos-historicos');
    historicos.style.display = historicos.style.display === 'none' ? 'block' : 'none';
}

function viewCiclo(nombre) {
    fetch(`/api/ciclos/${nombre}`)
        .then(res => res.json())
        .then(data => alert(`Detalles del ciclo: ${JSON.stringify(data)}`))
        .catch(error => console.error('Error al ver ciclo:', error));
}

// 💾 Respaldo e Integraciones
function generarRespaldo() {
    fetch('/api/respaldo/generar', { method: 'POST' })
        .then(() => alert('Respaldo generado exitosamente'))
        .catch(error => console.error('Error al generar respaldo:', error));
}

// ⚙️ Configuración General
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    fetch('/api/config/theme', { method: 'POST', body: JSON.stringify({ theme: document.body.classList.contains('dark-mode') ? 'dark' : 'light' }) })
        .catch(error => console.error('Error al cambiar tema:', error));
}

// Funciones generales
function renderNotificaciones() {
    const container = document.getElementById('notificaciones-list');
    container.innerHTML = alertas.length 
        ? alertas.map(a => `<div class="alerta ${a.tipo}">${a.text}</div>`).join('')
        : '<p>No hay notificaciones</p>';
}

function populateSelectOptions() {
    // Fichas
    fetch('/api/fichas')
        .then(res => res.json())
        .then(data => {
            const fichaSelects = ['proyecto-ficha', 'edit-proyecto-ficha', 'reasignar-ficha', 'reporte-ficha'];
            fichaSelects.forEach(id => {
                const select = document.getElementById(id);
                if (select) {
                    select.innerHTML = '<option value="">Selecciona</option>' + 
                        data.map(f => `<option value="${f.id}">${f.id}</option>`).join('');
                }
            });
        });

    // Instructores y Jurados
    fetch('/api/usuarios?rol=Instructor,Jurado')
        .then(res => res.json())
        .then(data => {
            const instructorSelects = ['instructor-ficha', 'edit-instructor', 'jurado-instructor', 'reporte-instructor', 'reasignar-instructor', 'cambiar-jurado-instructor'];
            instructorSelects.forEach(id => {
                const select = document.getElementById(id);
                if (select) {
                    select.innerHTML = '<option value="">Selecciona</option>' + 
                        data.map(u => `<option value="${u.nombre}">${u.nombre}</option>`).join('');
                }
            });
        });

    // Proyectos
    fetch('/api/proyectos')
        .then(res => res.json())
        .then(data => {
            const proyectoSelects = ['entregable-proyecto', 'asignar-entregable-proyecto', 'jurado-proyecto'];
            proyectoSelects.forEach(id => {
                const select = document.getElementById(id);
                if (select) {
                    select.innerHTML = '<option value="">Selecciona</option>' + 
                        data.map(p => `<option value="${p.id}">${p.id}</option>`).join('');
                }
            });
        });
}

function openForm(formId, mode, context = '') {
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.modal').forEach(modal => modal.style.display = 'none');

    if (mode === 'modal') {
        const modal = document.getElementById(`modal-${formId}`);
        modal.style.display = 'block';
        const modalContent = modal.querySelector('.modal-content');
        modalContent.style.left = '50%';
        modalContent.style.top = '50%';

        if (context) {
            loadFormData(formId, context);
        }
    }
}

function loadFormData(formId, context) {
    fetch(`/api/data/${formId}/${context}`)
        .then(res => res.json())
        .then(data => {
            if (formId === 'view-aprendices') {
                const tbody = document.querySelector('#aprendices-table tbody');
                tbody.innerHTML = data.map(u => `<tr><td>${u.nombre}</td><td>${u.correo}</td><td>${u.ficha || 'Sin ficha'}</td></tr>`).join('');
            } else if (formId === 'edit-ficha-form') {
                document.getElementById('edit-num-ficha').value = data.id;
                document.getElementById('edit-programa').value = data.programa;
                document.getElementById('edit-trimestre').value = data.trimestre;
                document.getElementById('edit-instructor').value = data.instructor;
            } else if (formId === 'delete-ficha-form') {
                document.getElementById('delete-ficha-message').textContent = `¿Seguro que desea eliminar la ficha ${data.id}?`;
            } else if (formId === 'edit-usuario-form') {
                document.getElementById('edit-usuario-nombre').value = data.nombre;
                document.getElementById('edit-usuario-correo').value = data.correo;
            } else if (formId === 'cambiar-rol-form') {
                document.getElementById('cambiar-usuario-rol').value = data.rol;
            } else if (formId === 'bloquear-usuario-form') {
                document.getElementById('bloquear-usuario-message').textContent = `¿Seguro que desea ${data.estado === 'Activo' ? 'bloquear' : 'desbloquear'} al usuario ${data.nombre}?`;
            } else if (formId === 'edit-proyecto-form') {
                document.getElementById('edit-proyecto-titulo').value = data.id;
                document.getElementById('edit-proyecto-descripcion').value = data.descripcion;
                document.getElementById('edit-proyecto-ficha').value = data.ficha;
                document.getElementById('edit-proyecto-integrantes').value = data.integrantes;
            } else if (formId === 'delete-proyecto-form') {
                document.getElementById('delete-proyecto-message').textContent = `¿Seguro que desea eliminar el proyecto ${data.id}?`;
            } else if (formId === 'reasignar-proyecto-form') {
                document.getElementById('reasignar-ficha').value = data.ficha;
                document.getElementById('reasignar-instructor').value = data.jurado || '';
            } else if (formId === 'edit-entregable-form') {
                document.getElementById('edit-entregable-nombre').value = data.name;
                document.getElementById('edit-entregable-descripcion').value = data.retro;
                document.getElementById('edit-entregable-fecha').value = data.fechaLimite;
            } else if (formId === 'delete-entregable-form') {
                document.getElementById('delete-entregable-message').textContent = `¿Seguro que desea eliminar el entregable ${data.name}?`;
            } else if (formId === 'asignar-entregable-form') {
                document.getElementById('asignar-entregable-proyecto').value = data.proyecto;
            } else if (formId === 'cambiar-jurado-form') {
                document.getElementById('cambiar-jurado-instructor').value = data.nombre;
            } else if (formId === 'cerrar-ciclo-form') {
                document.getElementById('cerrar-ciclo-message').textContent = `¿Seguro que desea cerrar el ciclo ${data.nombre}?`;
            }
        }).catch(error => console.error('Error al cargar datos del formulario:', error));
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function toggleNotificationPanel() {
    const panel = document.getElementById('notification-panel');
    panel.classList.toggle('active');
    if (panel.classList.contains('active')) {
        fetch('/api/alertas')
            .then(res => res.json())
            .then(data => {
                alertas = data;
                renderNotificaciones();
            }).catch(error => console.error('Error al cargar notificaciones:', error));
    }
}

function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    document.querySelector(`[onclick="showTab('${tabId}')"]`).classList.add('active');
}

function handleGlobalSearch(event) {
    const query = event.target.value.toLowerCase();
    fetch(`/api/search?query=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(results => {
            // Renderizar según tipo de resultados
        }).catch(error => console.error('Error en búsqueda global:', error));
}

function goToSection(sectionId) {
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.sidebar ul li').forEach(li => li.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');
}

/**
 * Manejo de formularios con backend
 */
function handleFormSubmission(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const formName = form.id.replace('-form', '');
    const endpoint = `/api/${formName}`;
    const method = formName.includes('delete') || formName.includes('cerrar') || formName.includes('bloquear') ? 'DELETE' : formName.includes('edit') || formName.includes('cambiar') || formName.includes('reasignar') || formName.includes('configurar') ? 'PUT' : 'POST';

    fetch(endpoint, {
        method,
        body: formData
    })
    .then(res => {
        if (!res.ok) throw new Error('Error en la respuesta del servidor');
        return res.json();
    })
    .then(() => {
        loadAllData(); // Recargar datos
        alert('Operación realizada con éxito');
        closeModal(form.closest('.modal')?.id);
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Ocurrió un error al procesar la solicitud.');
    });
}

function toggleCiclosHistoricos() {
    const historicos = document.getElementById('ciclos-historicos');
    historicos.style.display = historicos.style.display === 'none' ? 'block' : 'none';
}

function toggleAlertasSeguridad() {
    fetch('/api/seguridad/toggle-alertas', { method: 'POST' })
        .then(() => alert('Alertas de seguridad activadas/desactivadas'))
        .catch(error => console.error('Error:', error));
}

function generarRespaldo() {
    fetch('/api/respaldo/generar', { method: 'POST' })
        .then(() => alert('Respaldo generado exitosamente'))
        .catch(error => console.error('Error:', error));
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    fetch('/api/config/theme', { method: 'POST', body: JSON.stringify({ theme: document.body.classList.contains('dark-mode') ? 'dark' : 'light' }), headers: { 'Content-Type': 'application/json' } })
        .catch(error => console.error('Error:', error));
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