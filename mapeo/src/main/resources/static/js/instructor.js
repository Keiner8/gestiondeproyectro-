// Inicializar variables globales
let fichas = [];
let gaes = [];
let proyectos = [];
let entregables = [];
let evaluaciones = [];
let mensajes = [];
let chats = { individual: [], grupal: [], list: [] };
let solicitudes = [];
let alertas = [];

const currentDate = new Date('2025-09-28');

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    loadAllData(); // Cargar todos los datos iniciales desde el backend

    // Eventos
    document.querySelectorAll('.robust-form').forEach(form => form.addEventListener('submit', handleFormSubmission));
    document.querySelector('#global-search').addEventListener('input', handleGlobalSearch);
    document.querySelector('#fichas-search').addEventListener('input', applyFichasFilter);
    document.querySelector('#gaes-search').addEventListener('input', applyGaesFilter);
    document.querySelector('#proyectos-search').addEventListener('input', applyProyectosFilter);
    document.querySelector('#entregables-search').addEventListener('input', applyEntregablesFilter);
    document.querySelector('#guardar-revision').addEventListener('click', handleRevisionGuardar);
    document.querySelector('#send-chat').addEventListener('click', handleChatIndividual);
    document.querySelector('#send-chat-grupal').addEventListener('click', handleChatGrupal);
    document.querySelector('#export-calificaciones').addEventListener('click', handleExportCalificaciones);

    // Navegación menú
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
        fetch('/api/gaes').then(res => res.json()).then(data => gaes = data),
        fetch('/api/proyectos').then(res => res.json()).then(data => proyectos = data),
        fetch('/api/entregables').then(res => res.json()).then(data => entregables = data),
        fetch('/api/evaluaciones').then(res => res.json()).then(data => evaluaciones = data),
        fetch('/api/mensajes').then(res => res.json()).then(data => mensajes = data),
        fetch('/api/chats').then(res => res.json()).then(data => chats = data),
        fetch('/api/solicitudes').then(res => res.json()).then(data => solicitudes = data),
        fetch('/api/alertas').then(res => res.json()).then(data => alertas = data)
    ]).then(() => {
        renderDashboard();
        renderFichasTable();
        renderGaesTable();
        renderProyectosList();
        renderEntregablesTimeline();
        renderCalificacionesTable();
        renderSolicitudesList();
        renderChatList();
        renderNotificaciones();
        populateSelectOptions();
    }).catch(error => console.error('Error al cargar datos:', error));
}

// Funciones de renderizado
function renderDashboard() {
    document.getElementById('fichas-asignadas').textContent = fichas.length;
    document.getElementById('aprendices-total').textContent = fichas.reduce((sum, f) => sum + f.aprendices, 0);
    document.getElementById('gaes-conformados').textContent = gaes.length;
    document.getElementById('entregables-pendientes').textContent = entregables.flatMap(e => e.items.filter(i => i.estado === 'Pendiente')).length;

    const ctxAvance = document.getElementById('avance-fichas-chart').getContext('2d');
    new Chart(ctxAvance, {
        type: 'bar',
        data: {
            labels: fichas.map(f => f.id),
            datasets: [{ label: '% Avance', data: fichas.map(f => f.avance), backgroundColor: '#3498db' }]
        },
        options: { scales: { y: { beginAtZero: true } } }
    });

    const ctxGaes = document.getElementById('gaes-por-ficha-chart').getContext('2d');
    new Chart(ctxGaes, {
        type: 'bar',
        data: {
            labels: fichas.map(f => f.id),
            datasets: [{ label: 'GAEs por Ficha', data: fichas.map(f => f.gaes), backgroundColor: '#2ecc71' }]
        },
        options: { scales: { y: { beginAtZero: true } } }
    });
}

function renderNotificaciones() {
    const container = document.getElementById('alertas-prioritarias');
    container.innerHTML = '';
    alertas.forEach(a => {
        const div = document.createElement('div');
        div.classList.add('alerta', a.tipo);
        div.textContent = a.text;
        container.appendChild(div);
    });

    const notifList = document.getElementById('notificaciones-list');
    notifList.innerHTML = alertas.map(a => `<div class="alerta ${a.tipo}">${a.text}</div>`).join('');
}

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
            <td>${f.gaes}</td>
            <td>${f.estado}</td>
            <td>
                <button onclick="viewAprendices('${f.id}')">Ver Aprendices</button>
                <button onclick="viewGaes('${f.id}')">Ver GAEs</button>
                <button onclick="sendMensajeMasivo('${f.id}')">Mensaje Masivo</button>
                <button onclick="exportFicha('${f.id}', 'excel')">Exportar Excel</button>
                <button onclick="exportFicha('${f.id}', 'pdf')">Exportar PDF</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderGaesTable(filtered = gaes) {
    const tbody = document.querySelector('#gaes-table tbody');
    tbody.innerHTML = '';
    filtered.forEach(g => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${g.id}</td>
            <td>${g.integrantes}</td>
            <td>${g.proyecto}</td>
            <td>${g.ultimaEntrega}</td>
            <td>${g.estado}</td>
            <td>
                <button onclick="editGae('${g.id}')">Editar GAE</button>
                <button onclick="deleteGae('${g.id}')">Eliminar GAE</button>
                <button onclick="viewEntregablesGae('${g.ficha}', '${g.id}')">Ver Entregables</button>
                <button onclick="sendMensajeGae('${g.id}')">Mensaje a GAE</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderProyectosList(filtered = proyectos) {
    const container = document.getElementById('proyectos-list');
    container.innerHTML = '';
    filtered.forEach(p => {
        const card = document.createElement('div');
        card.classList.add('proyecto-card');
        card.innerHTML = `
            <h3>${p.id}</h3>
            <p>Ficha: ${p.ficha} | GAE: ${p.gae} | Estado: ${p.estado}</p>
            <button onclick="viewProyecto('${p.id}')">Ver Detalle</button>
            <button onclick="viewEntregablesProyecto('${p.id}')">Ver Entregables</button>
            <button onclick="openForm('evaluate-proyecto-form', 'modal', '${p.id}')">Evaluar Proyecto</button>
            <button onclick="editProyecto('${p.id}')">Editar Proyecto</button>
            <button onclick="deleteProyecto('${p.id}')">Eliminar Proyecto</button>
            <button onclick="exportProyecto('${p.id}', 'pdf')">Exportar PDF</button>
            <button onclick="exportProyecto('${p.id}', 'excel')">Exportar Excel</button>
        `;
        container.appendChild(card);
    });
}

function renderEntregablesTimeline(filtered = entregables) {
    const container = document.getElementById('entregables-timeline');
    container.innerHTML = '';
    filtered.forEach(e => {
        const fichaDiv = document.createElement('div');
        fichaDiv.classList.add('ficha-folder');
        fichaDiv.innerHTML = `<h3>Ficha ${e.ficha}</h3>`;
        const gaeDiv = document.createElement('div');
        gaeDiv.classList.add('gae-folder');
        gaeDiv.innerHTML = `<h4>${e.gae}</h4><p>Proyecto: ${e.proyecto}</p>`;
        e.items.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('entregable-item');
            itemDiv.innerHTML = `
                <span>${item.name} → ${item.estado} (Fecha límite: ${item.fechaLimite})</span>
                <div>
                    <button onclick="viewEntregable('${e.ficha}', '${e.gae}', '${item.name}')">Ver</button>
                    <button onclick="retroalimentarEntregable('${e.ficha}', '${e.gae}', '${item.name}')">Retroalimentar</button>
                    <button onclick="calificarEntregable('${e.ficha}', '${e.gae}', '${item.name}')">Calificar</button>
                </div>
            `;
            gaeDiv.appendChild(itemDiv);
        });
        fichaDiv.appendChild(gaeDiv);
        container.appendChild(fichaDiv);
    });
}

function renderCalificacionesTable() {
    const tbody = document.querySelector('#calificaciones-table tbody');
    tbody.innerHTML = '';
    evaluaciones.forEach(ev => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${ev.ficha}</td>
            <td>${ev.gae}</td>
            <td>${ev.entregable}</td>
            <td>${ev.nota}</td>
            <td>${ev.observaciones}</td>
        `;
        tbody.appendChild(tr);
    });
}

function renderSolicitudesList() {
    const container = document.getElementById('solicitudes-list');
    container.innerHTML = '';
    solicitudes.forEach(s => {
        const card = document.createElement('div');
        card.classList.add('solicitud-card');
        card.id = `solicitud-${s.id}`;
        card.innerHTML = `
            <p>${s.aprendiz}: ${s.mensaje}</p>
            <button onclick="acceptSolicitud('${s.id}')">Aceptar</button>
            <button onclick="rejectSolicitud('${s.id}')">Rechazar</button>
            <button onclick="viewSolicitud('${s.id}')">Ver Detalle</button>
        `;
        container.appendChild(card);
    });
}

function renderChatList() {
    const container = document.getElementById('chat-list');
    container.innerHTML = '';
    chats.list.forEach((chat, index) => {
        const div = document.createElement('div');
        div.innerHTML = `
            <p>${chat.destinatario}: ${chat.asunto}</p>
            <button onclick="deleteChat(${index})">Eliminar Chat</button>
            <button onclick="pinChat(${index})">Fijar Chat</button>
        `;
        container.appendChild(div);
    });
}

// Poblar selects dinámicamente desde backend
function populateSelectOptions() {
    // Para fichas
    fetch('/api/fichas')
        .then(res => res.json())
        .then(data => {
            const fichaSelects = ['ficha-gae', 'proyecto-ficha', 'entregable-proyecto', 'gaes-filter-ficha', 'proyectos-filter-ficha'];
            fichaSelects.forEach(id => {
                const select = document.getElementById(id);
                if (select) {
                    select.innerHTML = '<option value="">Selecciona</option>' + data.map(f => `<option value="${f.id}">${f.id}</option>`).join('');
                }
            });
        });

    // Para GAEs
    fetch('/api/gaes')
        .then(res => res.json())
        .then(data => {
            const gaeSelect = document.getElementById('proyecto-gae');
            if (gaeSelect) {
                gaeSelect.innerHTML = '<option value="">Selecciona GAE</option>' + data.map(g => `<option value="${g.id}">${g.id}</option>`).join('');
            }
            const moveGaeSelect = document.getElementById('move-aprendiz-gae');
            if (moveGaeSelect) {
                moveGaeSelect.innerHTML = '<option value="">Selecciona GAE</option>' + data.map(g => `<option value="${g.id}">${g.id}</option>`).join('');
            }
        });

    // Para aprendices
    fetch('/api/aprendices')
        .then(res => res.json())
        .then(data => {
            const aprendizSelect = document.getElementById('add-aprendiz-name');
            if (aprendizSelect) {
                aprendizSelect.innerHTML = '<option value="">Selecciona Aprendiz</option>' + data.map(a => `<option value="${a.id}">${a.nombre}</option>`).join('');
            }
        });

    // Para proyectos
    fetch('/api/proyectos')
        .then(res => res.json())
        .then(data => {
            const proyectoSelect = document.getElementById('entregable-proyecto');
            if (proyectoSelect) {
                proyectoSelect.innerHTML = '<option value="">Selecciona Proyecto</option>' + data.map(p => `<option value="${p.id}">${p.id}</option>`).join('');
            }
        });
}

// Funciones de navegación y modales
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
    } else {
        fetch(`/api/forms/${formId}`)
            .then(res => res.text())
            .then(html => {
                const section = document.getElementById('form-section');
                document.getElementById('form-section-title').textContent = html.match(/<h3>(.*)<\/h3>/)[1];
                document.getElementById('form-section-content').innerHTML = html;
                section.classList.add('active');
                const form = document.getElementById('form-section-content').querySelector('form');
                form.addEventListener('submit', handleFormSubmission);
            }).catch(error => console.error('Error al cargar formulario:', error));
    }
}

function loadFormData(formId, context) {
    fetch(`/api/data/${formId}/${context}`)
        .then(res => res.json())
        .then(data => {
            // Prellenar campos según formId
            if (formId === 'edit-gae-form') {
                document.getElementById('edit-gae-id').value = data.id;
                document.getElementById('edit-integrantes').value = data.integrantes;
                document.getElementById('edit-proyecto').value = data.proyecto;
                document.getElementById('edit-estado-gae').value = data.estado;
            } else if (formId === 'delete-gae-form') {
                document.getElementById('delete-gae-message').textContent = `¿Seguro que desea eliminar el GAE ${data.id}?`;
            } else if (formId === 'edit-proyecto-form') {
                document.getElementById('edit-proyecto-titulo').value = data.id;
                document.getElementById('edit-proyecto-descripcion').value = data.descripcion;
            } else if (formId === 'delete-proyecto-form') {
                document.getElementById('delete-proyecto-message').textContent = `¿Seguro que desea eliminar el proyecto ${data.id}?`;
            } else if (formId === 'evaluate-proyecto-form') {
                // Prellenar si es necesario
            } else if (formId === 'retroalimentar-entregable-form' || formId === 'evaluation-form') {
                const [ficha, gae, name] = context.split('|');
                // Prellenar campos relevantes si aplica
            } else if (formId === 'delete-aprendiz-form') {
                document.getElementById('delete-aprendiz-message').textContent = `¿Seguro que desea eliminar este aprendiz?`;
            } else if (formId === 'move-aprendiz-form') {
                document.getElementById('move-aprendiz-message').textContent = `¿Seguro que desea mover a este aprendiz?`;
            }
        }).catch(error => console.error('Error al cargar datos del formulario:', error));
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function backToMain() {
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    document.getElementById('dashboard').classList.add('active');
    document.querySelector('.sidebar ul li[data-section="dashboard"]').classList.add('active');
}

function goToSection(sectionId) {
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.sidebar ul li').forEach(li => li.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    document.querySelector(`.sidebar ul li[data-section="${sectionId}"]`).classList.add('active');
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

// Form submission con backend
function handleFormSubmission(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const formName = form.id.replace('-form', '');
    const endpoint = `/api/${formName}`;
    const method = formName.includes('delete') ? 'DELETE' : formName.includes('edit') || formName.includes('update') || formName.includes('change') ? 'PUT' : 'POST';

    fetch(endpoint, {
        method,
        body: formData
    })
    .then(res => {
        if (!res.ok) throw new Error('Error en la respuesta del servidor');
        return res.json();
    })
    .then(() => {
        loadAllData(); // Recargar datos después de la operación
        alert('Operación realizada con éxito');
        closeModal(form.closest('.modal')?.id);
        backToMain();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Ocurrió un error al procesar la solicitud.');
    });
}

// Búsquedas y filtros
function handleGlobalSearch(event) {
    const query = event.target.value.toLowerCase();
    fetch(`/api/search?query=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(results => {
            // Procesar resultados y navegar/renderizar según tipo
            if (results.type === 'fichas') {
                goToSection('fichas');
                renderFichasTable(results.data);
            } else if (results.type === 'proyectos') {
                goToSection('proyectos');
                renderProyectosList(results.data);
            } else if (results.type === 'gaes') {
                goToSection('gaes');
                renderGaesTable(results.data);
            }
        }).catch(error => console.error('Error en búsqueda global:', error));
}

function applyFichasFilter() {
    const query = document.getElementById('fichas-search').value.toLowerCase();
    const estado = document.getElementById('fichas-filter-estado').value;
    fetch(`/api/fichas?query=${encodeURIComponent(query)}&estado=${estado}`)
        .then(res => res.json())
        .then(filtered => renderFichasTable(filtered))
        .catch(error => console.error('Error en filtro de fichas:', error));
}

function applyGaesFilter() {
    const query = document.getElementById('gaes-search').value.toLowerCase();
    const ficha = document.getElementById('gaes-filter-ficha').value;
    fetch(`/api/gaes?query=${encodeURIComponent(query)}&ficha=${ficha}`)
        .then(res => res.json())
        .then(filtered => renderGaesTable(filtered))
        .catch(error => console.error('Error en filtro de GAEs:', error));
}

function applyProyectosFilter() {
    const query = document.getElementById('proyectos-search').value.toLowerCase();
    const ficha = document.getElementById('proyectos-filter-ficha').value;
    const estado = document.getElementById('proyectos-filter-estado').value;
    fetch(`/api/proyectos?query=${encodeURIComponent(query)}&ficha=${ficha}&estado=${estado}`)
        .then(res => res.json())
        .then(filtered => renderProyectosList(filtered))
        .catch(error => console.error('Error en filtro de proyectos:', error));
}

function applyEntregablesFilter() {
    const query = document.getElementById('entregables-search').value.toLowerCase();
    const estado = document.getElementById('entregables-filter-estado').value;
    fetch(`/api/entregables?query=${encodeURIComponent(query)}&estado=${estado}`)
        .then(res => res.json())
        .then(filtered => renderEntregablesTimeline(filtered))
        .catch(error => console.error('Error en filtro de entregables:', error));
}

// Acciones con backend
function viewAprendices(fichaId) {
    fetch(`/api/aprendices?ficha=${fichaId}`)
        .then(res => res.json())
        .then(data => alert(`Aprendices: ${data.map(a => a.nombre).join(', ')}`))
        .catch(error => console.error('Error al ver aprendices:', error));
}

function viewGaes(fichaId) {
    goToSection('gaes');
    fetch(`/api/gaes?ficha=${fichaId}`)
        .then(res => res.json())
        .then(filtered => renderGaesTable(filtered))
        .catch(error => console.error('Error al ver GAEs:', error));
}

function sendMensajeMasivo(fichaId) {
    openForm('send-message-form', 'modal');
    // Prellenar destinatario con fichaId en el formulario si es necesario
    document.getElementById('destinatario').value = `Ficha ${fichaId}`;
}

function exportFicha(fichaId, formato) {
    window.location.href = `/api/export/ficha/${fichaId}?formato=${formato}`;
}

function editGae(gaeId) {
    openForm('edit-gae-form', 'modal', gaeId);
}

function deleteGae(gaeId) {
    openForm('delete-gae-form', 'modal', gaeId);
}

function viewEntregablesGae(ficha, gaeId) {
    goToSection('entregables');
    fetch(`/api/entregables?gae=${gaeId}&ficha=${ficha}`)
        .then(res => res.json())
        .then(filtered => renderEntregablesTimeline(filtered))
        .catch(error => console.error('Error al ver entregables de GAE:', error));
}

function sendMensajeGae(gaeId) {
    openForm('send-message-form', 'modal');
    document.getElementById('destinatario').value = gaeId;
}

function viewProyecto(proyectoId) {
    fetch(`/api/proyectos/${proyectoId}`)
        .then(res => res.json())
        .then(proyecto => {
            document.getElementById('proyecto-descripcion').textContent = proyecto.descripcion;
            document.getElementById('proyecto-integrantes').textContent = proyecto.integrantes;
            fetch(`/api/entregables?proyecto=${proyectoId}`)
                .then(res => res.json())
                .then(ent => {
                    const entregablesList = document.getElementById('proyecto-entregables');
                    entregablesList.innerHTML = ent.items.map(i => `<p>${i.name} (${i.estado})</p>`).join('');
                    openForm('view-proyecto-form', 'modal');
                }).catch(error => console.error('Error al cargar entregables de proyecto:', error));
        }).catch(error => console.error('Error al ver proyecto:', error));
}

function viewEntregablesProyecto(proyectoId) {
    goToSection('entregables');
    fetch(`/api/entregables?proyecto=${proyectoId}`)
        .then(res => res.json())
        .then(filtered => renderEntregablesTimeline(filtered))
        .catch(error => console.error('Error al ver entregables de proyecto:', error));
}

function editProyecto(proyectoId) {
    openForm('edit-proyecto-form', 'modal', proyectoId);
}

function deleteProyecto(proyectoId) {
    openForm('delete-proyecto-form', 'modal', proyectoId);
}

function exportProyecto(proyectoId, formato) {
    window.location.href = `/api/export/proyecto/${proyectoId}?formato=${formato}`;
}

function viewEntregable(ficha, gae, name) {
    fetch(`/api/entregables/view?ficha=${ficha}&gae=${gae}&name=${encodeURIComponent(name)}`)
        .then(res => res.blob())
        .then(blob => {
            const url = URL.createObjectURL(blob);
            window.open(url); // O integrar visor
        }).catch(error => console.error('Error al ver entregable:', error));
}

function retroalimentarEntregable(ficha, gae, name) {
    openForm('retroalimentar-entregable-form', 'modal', `${ficha}|${gae}|${name}`);
}

function calificarEntregable(ficha, gae, name) {
    openForm('evaluation-form', 'modal', `${ficha}|${gae}|${name}`);
}

function acceptSolicitud(solicitudId) {
    fetch(`/api/solicitudes/${solicitudId}/accept`, { method: 'PUT' })
        .then(() => {
            loadAllData();
            alert('Solicitud aceptada');
        }).catch(error => console.error('Error al aceptar solicitud:', error));
}

function rejectSolicitud(solicitudId) {
    fetch(`/api/solicitudes/${solicitudId}/reject`, { method: 'PUT' })
        .then(() => {
            loadAllData();
            alert('Solicitud rechazada');
        }).catch(error => console.error('Error al rechazar solicitud:', error));
}

function viewSolicitud(solicitudId) {
    fetch(`/api/solicitudes/${solicitudId}`)
        .then(res => res.json())
        .then(solicitud => {
            document.getElementById('solicitud-mensaje').textContent = solicitud.mensaje;
            openForm('view-solicitud-form', 'modal');
        }).catch(error => console.error('Error al ver solicitud:', error));
}

function handleRevisionGuardar() {
    const estado = document.getElementById('estado-revision').value;
    const retro = document.getElementById('retroalimentacion').value;
    const nota = document.getElementById('nota-revision').value;
    // Asumir context en algún hidden input o variable global
    fetch('/api/revision/guardar', {
        method: 'POST',
        body: JSON.stringify({ estado, retro, nota /*, context */ }),
        headers: { 'Content-Type': 'application/json' }
    })
    .then(() => {
        loadAllData();
        document.getElementById('revision-flujo').style.display = 'none';
    }).catch(error => console.error('Error al guardar revisión:', error));
}

function cancelRevision() {
    document.getElementById('revision-flujo').style.display = 'none';
}

function handleChatIndividual() {
    const input = document.getElementById('chat-input');
    const msg = input.value;
    if (msg) {
        fetch('/api/chats/individual', {
            method: 'POST',
            body: JSON.stringify({ mensaje: msg }),
            headers: { 'Content-Type': 'application/json' }
        })
        .then(() => {
            loadAllData();
            input.value = '';
        }).catch(error => console.error('Error al enviar chat individual:', error));
    }
}

function handleChatGrupal() {
    const input = document.getElementById('chat-input-grupal');
    const msg = input.value;
    if (msg) {
        fetch('/api/chats/grupal', {
            method: 'POST',
            body: JSON.stringify({ mensaje: msg }),
            headers: { 'Content-Type': 'application/json' }
        })
        .then(() => {
            loadAllData();
            input.value = '';
        }).catch(error => console.error('Error al enviar chat grupal:', error));
    }
}

function deleteChat(index) {
    fetch(`/api/chats/${index}`, { method: 'DELETE' })
        .then(() => {
            loadAllData();
            alert('Chat eliminado');
        }).catch(error => console.error('Error al eliminar chat:', error));
}

function pinChat(index) {
    fetch(`/api/chats/${index}/pin`, { method: 'PUT' })
        .then(() => {
            loadAllData();
            alert('Chat fijado');
        }).catch(error => console.error('Error al fijar chat:', error));
}

function handleExportCalificaciones() {
    window.location.href = '/api/export/calificaciones';
}

function sendSupportMessage() {
    const mensaje = document.getElementById('support-message').value;
    fetch('/api/support', {
        method: 'POST',
        body: JSON.stringify({ mensaje }),
        headers: { 'Content-Type': 'application/json' }
    })
    .then(() => {
        alert(`Consulta enviada: ${mensaje}`);
        closeModal('modal-support-form');
    }).catch(error => console.error('Error al enviar soporte:', error));
}