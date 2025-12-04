// Reportes del Administrador

// Variables globales para almacenar datos
let todasLasFichas = [];
let todosTrimestres = [];
let todosProyectos = [];

// ============================================================
// REPORTE DE USUARIOS
// ============================================================

async function cargarReporteUsuarios() {
    try {
        console.log('🔄 Cargando reporte de usuarios...');
        const response = await fetch('/api/reportes/administrador/usuarios-general');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const usuarios = await response.json();
        
        console.log('✅ Usuarios recibidos:', usuarios);
        console.log('📊 Total de usuarios:', usuarios ? usuarios.length : 0);
        
        if (!usuarios || usuarios.length === 0) {
            document.getElementById('reporte-usuarios-list').innerHTML = '<p style="color: orange;">No hay usuarios disponibles</p>';
            return;
        }
        
        // Llamar a filtrarReporteUsuarios que se encargará de mostrar la tabla
        console.log('📝 Llamando filtrarReporteUsuarios...');
        filtrarReporteUsuarios(usuarios);
    } catch (error) {
        console.error('❌ Error cargando reporte de usuarios:', error);
        const container = document.getElementById('reporte-usuarios-list');
        if (container) {
            container.innerHTML = '<p style="color: red;">Error al cargar reporte: ' + error.message + '</p>';
        }
    }
}

function filtrarReporteUsuarios(usuarios) {
    console.log('filtrarReporteUsuarios llamado con', usuarios ? usuarios.length : 0, 'usuarios');
    
    // Buscar elementos con validación
    const searchInput = document.getElementById('usuarios-search');
    const rolFilter = document.getElementById('usuarios-rol-filter');
    const estadoFilter = document.getElementById('usuarios-estado-filter');
    
    if (!searchInput || !rolFilter || !estadoFilter) {
        console.error('No se encontraron los elementos de filtro');
        console.log('searchInput:', searchInput);
        console.log('rolFilter:', rolFilter);
        console.log('estadoFilter:', estadoFilter);
        return;
    }
    
    // Llenar opciones de rol
    const roles = [...new Set(usuarios.map(u => u.rol))].filter(r => r); // filtrar null/undefined
    rolFilter.innerHTML = '<option value="">Todos los roles</option>';
    roles.forEach(rol => {
        rolFilter.innerHTML += `<option value="${rol}">${rol}</option>`;
    });
    
    console.log('Roles disponibles:', roles);
    
    const aplicarFiltros = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const rolSeleccionado = rolFilter.value;
        const estadoSeleccionado = estadoFilter.value;
        
        console.log('Aplicando filtros:', { searchTerm, rolSeleccionado, estadoSeleccionado });
        
        const filtrados = usuarios.filter(u => {
            const coincideBusqueda = u.nombre.toLowerCase().includes(searchTerm) ||
                                    u.apellido.toLowerCase().includes(searchTerm) ||
                                    u.correo.toLowerCase().includes(searchTerm);
            const coincideRol = !rolSeleccionado || u.rol === rolSeleccionado;
            const coincideEstado = !estadoSeleccionado || u.estado === estadoSeleccionado;
            
            return coincideBusqueda && coincideRol && coincideEstado;
        });
        
        console.log('Mostrando', filtrados.length, 'usuarios después de filtrar');
        cargarTablaUsuarios(filtrados);
    };
    
    // Mostrar la tabla inicial CON TODOS los usuarios
    console.log('Mostrando tabla inicial con', usuarios.length, 'usuarios');
    cargarTablaUsuarios(usuarios);
    
    // Agregar listeners para filtros
    searchInput.addEventListener('input', aplicarFiltros);
    rolFilter.addEventListener('change', aplicarFiltros);
    estadoFilter.addEventListener('change', aplicarFiltros);
}

function cargarTablaUsuarios(usuarios) {
    let html = '<table class="table"><thead><tr>';
    html += '<th>ID</th><th>Nombre</th><th>Apellido</th><th>Correo</th><th>Documento</th><th>Rol</th><th>Estado</th>';
    html += '</tr></thead><tbody>';
    
    usuarios.forEach(u => {
        html += '<tr>';
        html += `<td>${u.id}</td>`;
        html += `<td>${u.nombre}</td>`;
        html += `<td>${u.apellido}</td>`;
        html += `<td>${u.correo}</td>`;
        html += `<td>${u.tipoDocumento}: ${u.numeroDocumento}</td>`;
        html += `<td><span class="badge badge-primary">${u.rol}</span></td>`;
        html += `<td><span class="badge ${u.estado === 'ACTIVO' ? 'badge-success' : 'badge-danger'}">${u.estado}</span></td>`;
        html += '</tr>';
    });
    
    html += '</tbody></table>';
    document.getElementById('reporte-usuarios-list').innerHTML = html;
}

// ============================================================
// REPORTE DE FICHAS CON APRENDICES
// ============================================================

async function cargarReporteFichas() {
    try {
        console.log('🔄 Cargando reporte de fichas...');
        const response = await fetch('/api/reportes/administrador/fichas-aprendices');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const fichas = await response.json();
        
        console.log('✅ Fichas recibidas:', fichas);
        console.log('📊 Total de fichas:', fichas ? fichas.length : 0);
        todasLasFichas = fichas;
        
        // Llenar selector con fichas únicas
        const selectFichas = document.getElementById('fichas-selector');
        if (selectFichas) {
            const codigosFichas = [...new Set(fichas.map(f => f.codigo_ficha))].sort();
            selectFichas.innerHTML = '<option value="">Todas las fichas</option>';
            codigosFichas.forEach(codigo => {
                selectFichas.innerHTML += `<option value="${codigo}">${codigo}</option>`;
            });
            console.log('✅ Selector de fichas llenado con:', codigosFichas);
        }
        
        // Mostrar todas las fichas
        console.log('📝 Llamando mostrarFichas con', fichas.length, 'registros');
        mostrarFichas(fichas);
        
        // Agregar listeners a los controles de filtrado
        const inputBusqueda = document.getElementById('fichas-search');
        if (inputBusqueda) {
            inputBusqueda.addEventListener('input', filtrarPorFicha);
        }
        
    } catch (error) {
        console.error('❌ Error cargando reporte de fichas:', error);
        const container = document.getElementById('reporte-fichas-list');
        if (container) {
            container.innerHTML = '<p style="color: red;">Error al cargar reporte: ' + error.message + '</p>';
        }
    }
}

function mostrarFichas(fichas) {
    let html = '<table class="table"><thead><tr>';
    html += '<th>Código Ficha</th><th>Programa</th><th>Jornada</th><th>Modalidad</th><th>Aprendiz</th><th>Documento</th>';
    html += '</tr></thead><tbody>';
    
    if (fichas.length === 0) {
        html += '<tr><td colspan="6">No hay datos disponibles</td></tr>';
    } else {
        fichas.forEach(f => {
            html += '<tr>';
            html += `<td><strong>${f.codigo_ficha}</strong></td>`;
            html += `<td>${f.programa_formacion}</td>`;
            html += `<td>${f.jornada}</td>`;
            html += `<td>${f.modalidad}</td>`;
            html += `<td>${f.aprendiz}</td>`;
            html += `<td>${f.numero_documento}</td>`;
            html += '</tr>';
        });
    }
    
    html += '</tbody></table>';
    document.getElementById('reporte-fichas-list').innerHTML = html;
}

function filtrarPorFicha() {
    console.log('filtrarPorFicha llamado');
    const fichaSeleccionada = document.getElementById('fichas-selector')?.value || '';
    const searchTerm = document.getElementById('fichas-search')?.value.toLowerCase() || '';
    const estadoSeleccionado = document.getElementById('fichas-estado-filter')?.value || '';
    
    console.log('Ficha seleccionada:', fichaSeleccionada);
    console.log('Búsqueda:', searchTerm);
    console.log('Estado:', estadoSeleccionado);
    console.log('Total de fichas en array:', todasLasFichas ? todasLasFichas.length : 0);
    
    // Validar que todasLasFichas tiene datos
    if (!todasLasFichas || todasLasFichas.length === 0) {
        console.error('No hay fichas cargadas en todasLasFichas');
        mostrarFichas([]);
        return;
    }
    
    let filtrados = [...todasLasFichas]; // Crear una copia
    
    if (fichaSeleccionada && fichaSeleccionada.trim() !== '') {
        console.log('Filtrando por ficha:', fichaSeleccionada);
        console.log('Fichas disponibles:', todasLasFichas.map(f => f.codigo_ficha));
        
        filtrados = filtrados.filter(f => {
            const match = f.codigo_ficha === fichaSeleccionada;
            console.log(`Comparando "${f.codigo_ficha}" === "${fichaSeleccionada}": ${match}`);
            return match;
        });
        console.log('Después de filtrar por ficha:', filtrados.length);
    }
    
    if (searchTerm && searchTerm.trim() !== '') {
        filtrados = filtrados.filter(f =>
            String(f.codigo_ficha).toLowerCase().includes(searchTerm) ||
            String(f.programa_formacion).toLowerCase().includes(searchTerm) ||
            String(f.aprendiz).toLowerCase().includes(searchTerm)
        );
        console.log('Después de búsqueda:', filtrados.length);
    }
    
    if (estadoSeleccionado && estadoSeleccionado.trim() !== '') {
        filtrados = filtrados.filter(f => f.estado === estadoSeleccionado);
        console.log('Después de filtrar por estado:', filtrados.length);
    }
    
    console.log('Mostrando:', filtrados.length, 'registros');
    console.log('Datos a mostrar:', filtrados);
    mostrarFichas(filtrados);
}

// ============================================================
// REPORTE DE INSTRUCTORES
// ============================================================

async function cargarReporteInstructores() {
    try {
        console.log('🔄 Cargando reporte de instructores...');
        const response = await fetch('/api/reportes/administrador/instructores-especialidad');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const instructores = await response.json();
        
        console.log('✅ Instructores recibidos:', instructores);
        console.log('📊 Total de instructores:', instructores ? instructores.length : 0);
        
        if (!instructores || instructores.length === 0) {
            document.getElementById('reporte-instructores-list').innerHTML = '<p style="color: orange;">No hay instructores disponibles</p>';
            return;
        }
        
        cargarTablaInstructores(instructores);
        filtrarReporteInstructores(instructores);
    } catch (error) {
        console.error('❌ Error cargando reporte de instructores:', error);
        const container = document.getElementById('reporte-instructores-list');
        if (container) {
            container.innerHTML = '<p style="color: red;">Error al cargar reporte: ' + error.message + '</p>';
        }
    }
}

function filtrarReporteInstructores(instructores) {
    const searchInput = document.getElementById('instructores-search');
    const estadoFilter = document.getElementById('instructores-estado-filter');
    
    const aplicarFiltros = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const estadoSeleccionado = estadoFilter.value;
        
        const filtrados = instructores.filter(i => {
            const coincideBusqueda = i.instructor.toLowerCase().includes(searchTerm) ||
                                    i.correo.toLowerCase().includes(searchTerm) ||
                                    i.especialidad.toLowerCase().includes(searchTerm);
            const coincideEstado = !estadoSeleccionado || i.estado === estadoSeleccionado;
            
            return coincideBusqueda && coincideEstado;
        });
        
        cargarTablaInstructores(filtrados);
    };
    
    searchInput.addEventListener('input', aplicarFiltros);
    estadoFilter.addEventListener('change', aplicarFiltros);
}

function cargarTablaInstructores(instructores) {
    let html = '<table class="table"><thead><tr>';
    html += '<th>Instructor</th><th>Correo</th><th>Especialidad</th><th>Estado</th>';
    html += '</tr></thead><tbody>';
    
    instructores.forEach(i => {
        html += '<tr>';
        html += `<td><strong>${i.instructor}</strong></td>`;
        html += `<td>${i.correo}</td>`;
        html += `<td>${i.especialidad}</td>`;
        html += `<td><span class="badge ${i.estado === 'ACTIVO' ? 'badge-success' : 'badge-danger'}">${i.estado}</span></td>`;
        html += '</tr>';
    });
    
    html += '</tbody></table>';
    document.getElementById('reporte-instructores-list').innerHTML = html;
}

// ============================================================
// REPORTE DE TRIMESTRES
// ============================================================

async function cargarReporteTrimestres() {
    try {
        const response = await fetch('/api/reportes/administrador/trimestres-ficha');
        const trimestres = await response.json();
        
        todosTrimestres = trimestres;
        
        // Llenar selector con fichas únicas
        const selectFichas = document.getElementById('trimestres-ficha-selector');
        if (selectFichas) {
            const codigosFichas = [...new Set(trimestres.map(t => t.codigo_ficha))].sort();
            selectFichas.innerHTML = '<option value="">Todas las fichas</option>';
            codigosFichas.forEach(codigo => {
                selectFichas.innerHTML += `<option value="${codigo}">${codigo}</option>`;
            });
        }
        
        mostrarTrimestres(trimestres);
        
        // Agregar listeners a los controles de filtrado
        const inputBusqueda = document.getElementById('trimestres-search');
        if (inputBusqueda) {
            inputBusqueda.addEventListener('input', filtrarPorFichaTrimestres);
        }
    } catch (error) {
        console.error('Error cargando reporte de trimestres:', error);
        document.getElementById('reporte-trimestres-list').innerHTML = '<p style="color: red;">Error al cargar reporte</p>';
    }
}

function mostrarTrimestres(trimestres) {
    let html = '<table class="table"><thead><tr>';
    html += '<th>Código Ficha</th><th>Trimestre</th><th>Fecha Inicio</th><th>Fecha Fin</th><th>Estado</th>';
    html += '</tr></thead><tbody>';
    
    trimestres.forEach(t => {
        html += '<tr>';
        html += `<td><strong>${t.codigo_ficha}</strong></td>`;
        html += `<td>Trimestre ${t.trimestre}</td>`;
        html += `<td>${formatearFecha(t.fecha_inicio)}</td>`;
        html += `<td>${formatearFecha(t.fecha_fin)}</td>`;
        html += `<td><span class="badge ${t.estado === 'ACTIVO' ? 'badge-success' : 'badge-warning'}">${t.estado}</span></td>`;
        html += '</tr>';
    });
    
    html += '</tbody></table>';
    document.getElementById('reporte-trimestres-list').innerHTML = html;
}

function filtrarPorFichaTrimestres() {
    console.log('filtrarPorFichaTrimestres llamado');
    const fichaSeleccionada = document.getElementById('trimestres-ficha-selector')?.value || '';
    const searchTerm = document.getElementById('trimestres-search')?.value.toLowerCase() || '';
    const estadoSeleccionado = document.getElementById('trimestres-estado-filter')?.value || '';
    
    console.log('Ficha:', fichaSeleccionada, 'Búsqueda:', searchTerm, 'Estado:', estadoSeleccionado);
    console.log('Total de trimestres:', todosTrimestres ? todosTrimestres.length : 0);
    
    if (!todosTrimestres || todosTrimestres.length === 0) {
        console.error('No hay trimestres cargados');
        mostrarTrimestres([]);
        return;
    }
    
    let filtrados = [...todosTrimestres];
    
    if (fichaSeleccionada && fichaSeleccionada.trim() !== '') {
        filtrados = filtrados.filter(t => t.codigo_ficha === fichaSeleccionada);
        console.log('Después de filtrar por ficha:', filtrados.length);
    }
    
    if (searchTerm && searchTerm.trim() !== '') {
        filtrados = filtrados.filter(t =>
            String(t.codigo_ficha).toLowerCase().includes(searchTerm)
        );
        console.log('Después de búsqueda:', filtrados.length);
    }
    
    if (estadoSeleccionado && estadoSeleccionado.trim() !== '') {
        filtrados = filtrados.filter(t => t.estado === estadoSeleccionado);
        console.log('Después de filtrar por estado:', filtrados.length);
    }
    
    console.log('Mostrando:', filtrados.length, 'registros');
    mostrarTrimestres(filtrados);
}

// ============================================================
// REPORTE DE PROYECTOS
// ============================================================

async function cargarReporteProyectos() {
    try {
        const response = await fetch('/api/reportes/administrador/proyectos-gaes');
        const proyectos = await response.json();
        
        todosProyectos = proyectos;
        
        // Llenar selector con GAES únicos
        const selectGaes = document.getElementById('proyectos-gaes-selector');
        if (selectGaes) {
            const gaesUnicos = [...new Set(proyectos.map(p => p.gaes))].sort();
            selectGaes.innerHTML = '<option value="">Todos los GAES</option>';
            gaesUnicos.forEach(gaes => {
                selectGaes.innerHTML += `<option value="${gaes}">${gaes}</option>`;
            });
        }
        
        mostrarProyectos(proyectos);
        
        // Agregar listeners a los controles de filtrado
        const inputBusqueda = document.getElementById('proyectos-search');
        if (inputBusqueda) {
            inputBusqueda.addEventListener('input', filtrarPorGaes);
        }
    } catch (error) {
        console.error('Error cargando reporte de proyectos:', error);
        document.getElementById('reporte-proyectos-list').innerHTML = '<p style="color: red;">Error al cargar reporte</p>';
    }
}

function mostrarProyectos(proyectos) {
    let html = '<table class="table"><thead><tr>';
    html += '<th>GAES</th><th>Proyecto</th><th>Estado</th><th>Fecha Inicio</th><th>Fecha Fin</th>';
    html += '</tr></thead><tbody>';
    
    proyectos.forEach(p => {
        html += '<tr>';
        html += `<td><strong>${p.gaes}</strong></td>`;
        html += `<td>${p.proyecto}</td>`;
        html += `<td><span class="badge ${getEstadoBadge(p.estado)}">${p.estado}</span></td>`;
        html += `<td>${formatearFecha(p.fecha_inicio)}</td>`;
        html += `<td>${formatearFecha(p.fecha_fin)}</td>`;
        html += '</tr>';
    });
    
    html += '</tbody></table>';
    document.getElementById('reporte-proyectos-list').innerHTML = html;
}

function filtrarPorGaes() {
    console.log('filtrarPorGaes llamado');
    const gaesSeleccionado = document.getElementById('proyectos-gaes-selector')?.value || '';
    const searchTerm = document.getElementById('proyectos-search')?.value.toLowerCase() || '';
    const estadoSeleccionado = document.getElementById('proyectos-estado-filter')?.value || '';
    
    console.log('GAES:', gaesSeleccionado, 'Búsqueda:', searchTerm, 'Estado:', estadoSeleccionado);
    console.log('Total de proyectos:', todosProyectos ? todosProyectos.length : 0);
    
    if (!todosProyectos || todosProyectos.length === 0) {
        console.error('No hay proyectos cargados');
        mostrarProyectos([]);
        return;
    }
    
    let filtrados = [...todosProyectos];
    
    if (gaesSeleccionado && gaesSeleccionado.trim() !== '') {
        filtrados = filtrados.filter(p => p.gaes === gaesSeleccionado);
        console.log('Después de filtrar por GAES:', filtrados.length);
    }
    
    if (searchTerm && searchTerm.trim() !== '') {
        filtrados = filtrados.filter(p =>
            String(p.gaes).toLowerCase().includes(searchTerm) ||
            String(p.proyecto).toLowerCase().includes(searchTerm)
        );
        console.log('Después de búsqueda:', filtrados.length);
    }
    
    if (estadoSeleccionado && estadoSeleccionado.trim() !== '') {
        filtrados = filtrados.filter(p => p.estado.toLowerCase() === estadoSeleccionado.toLowerCase());
        console.log('Después de filtrar por estado:', filtrados.length);
    }
    
    console.log('Mostrando:', filtrados.length, 'registros');
    mostrarProyectos(filtrados);
}

// ============================================================
// FUNCIONES UTILITARIAS
// ============================================================

function formatearFecha(fecha) {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-ES');
}

function getEstadoBadge(estado) {
    const estadoLower = estado.toLowerCase();
    if (estadoLower.includes('proceso')) return 'badge-info';
    if (estadoLower.includes('finalizado')) return 'badge-success';
    if (estadoLower.includes('cancelado')) return 'badge-danger';
    return 'badge-secondary';
}

// ============================================================
// DESCARGAS PDF Y EXCEL
// ============================================================

async function descargarReporteUsuariosPDF() {
    try {
        const response = await fetch('/api/reportes/descargar/usuarios/pdf');
        if (!response.ok) throw new Error('Error al descargar PDF');
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'reporte-usuarios.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        mostrarNotificacionGlobal('PDF descargado exitosamente', 'success');
    } catch (error) {
        mostrarNotificacionGlobal('Error al descargar PDF: ' + error.message, 'error');
    }
}

async function descargarReporteUsuariosExcel() {
    try {
        const response = await fetch('/api/reportes/descargar/usuarios/excel');
        if (!response.ok) throw new Error('Error al descargar Excel');
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'reporte-usuarios.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        mostrarNotificacionGlobal('Excel descargado exitosamente', 'success');
    } catch (error) {
        mostrarNotificacionGlobal('Error al descargar Excel: ' + error.message, 'error');
    }
}

async function descargarReporteFichasPDF() {
    try {
        const response = await fetch('/api/reportes/descargar/fichas/pdf');
        if (!response.ok) throw new Error('Error al descargar PDF');
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'reporte-fichas.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        mostrarNotificacionGlobal('PDF descargado exitosamente', 'success');
    } catch (error) {
        mostrarNotificacionGlobal('Error al descargar PDF: ' + error.message, 'error');
    }
}

async function descargarReporteFichasExcel() {
    try {
        const response = await fetch('/api/reportes/descargar/fichas/excel');
        if (!response.ok) throw new Error('Error al descargar Excel');
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'reporte-fichas.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        mostrarNotificacionGlobal('Excel descargado exitosamente', 'success');
    } catch (error) {
        mostrarNotificacionGlobal('Error al descargar Excel: ' + error.message, 'error');
    }
}

async function descargarReporteInstructoresPDF() {
    try {
        const response = await fetch('/api/reportes/descargar/instructores/pdf');
        if (!response.ok) throw new Error('Error al descargar PDF');
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'reporte-instructores.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        mostrarNotificacionGlobal('PDF descargado exitosamente', 'success');
    } catch (error) {
        mostrarNotificacionGlobal('Error al descargar PDF: ' + error.message, 'error');
    }
}

async function descargarReporteInstructoresExcel() {
    try {
        const response = await fetch('/api/reportes/descargar/instructores/excel');
        if (!response.ok) throw new Error('Error al descargar Excel');
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'reporte-instructores.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        mostrarNotificacionGlobal('Excel descargado exitosamente', 'success');
    } catch (error) {
        mostrarNotificacionGlobal('Error al descargar Excel: ' + error.message, 'error');
    }
}

async function descargarReporteTrimestresPDF() {
    try {
        const response = await fetch('/api/reportes/descargar/trimestres/pdf');
        if (!response.ok) throw new Error('Error al descargar PDF');
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'reporte-trimestres.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        mostrarNotificacionGlobal('PDF descargado exitosamente', 'success');
    } catch (error) {
        mostrarNotificacionGlobal('Error al descargar PDF: ' + error.message, 'error');
    }
}

async function descargarReporteTrimestresExcel() {
    try {
        const response = await fetch('/api/reportes/descargar/trimestres/excel');
        if (!response.ok) throw new Error('Error al descargar Excel');
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'reporte-trimestres.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        mostrarNotificacionGlobal('Excel descargado exitosamente', 'success');
    } catch (error) {
        mostrarNotificacionGlobal('Error al descargar Excel: ' + error.message, 'error');
    }
}

async function descargarReporteProyectosPDF() {
    try {
        const response = await fetch('/api/reportes/descargar/proyectos/pdf');
        if (!response.ok) throw new Error('Error al descargar PDF');
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'reporte-proyectos.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        mostrarNotificacionGlobal('PDF descargado exitosamente', 'success');
    } catch (error) {
        mostrarNotificacionGlobal('Error al descargar PDF: ' + error.message, 'error');
    }
}

async function descargarReporteProyectosExcel() {
    try {
        const response = await fetch('/api/reportes/descargar/proyectos/excel');
        if (!response.ok) throw new Error('Error al descargar Excel');
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'reporte-proyectos.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        mostrarNotificacionGlobal('Excel descargado exitosamente', 'success');
    } catch (error) {
        mostrarNotificacionGlobal('Error al descargar Excel: ' + error.message, 'error');
    }
}

function generarPDF(titulo, encabezados, datos) {
    // Método simple: convertir a CSV y mostrar aviso
    mostrarNotificacionGlobal('Generando PDF... Por favor espera.', 'info');
    
    // Los PDFs se generan desde el servidor
    console.log('PDF generado - usa los endpoints /api/reportes/descargar/**/pdf');
}

function generarExcel(titulo, encabezados, datos) {
    console.log('Generando Excel - XLSX disponible:', typeof XLSX !== 'undefined');
    
    // Usar SheetJS (xlsx) - siempre disponible
    if (typeof XLSX !== 'undefined') {
        console.log('✅ Usando librería XLSX para generar archivo Excel');
        // Con librería XLSX
        const ws = XLSX.utils.aoa_to_sheet([encabezados, ...datos]);
        
        // Aplicar estilos a los encabezados
        const encabezadoStyle = {
            fill: { fgColor: { rgb: '1F7585' } }, // Color teal
            font: { bold: true, color: { rgb: 'FFFFFF' } },
            alignment: { horizontal: 'center', vertical: 'center' },
            border: {
                top: { style: 'thin', color: { rgb: '000000' } },
                bottom: { style: 'thin', color: { rgb: '000000' } },
                left: { style: 'thin', color: { rgb: '000000' } },
                right: { style: 'thin', color: { rgb: '000000' } }
            }
        };
        
        // Aplicar estilos a las celdas de datos
        const datosStyle = {
            alignment: { horizontal: 'center', vertical: 'center' },
            border: {
                top: { style: 'thin', color: { rgb: 'CCCCCC' } },
                bottom: { style: 'thin', color: { rgb: 'CCCCCC' } },
                left: { style: 'thin', color: { rgb: 'CCCCCC' } },
                right: { style: 'thin', color: { rgb: 'CCCCCC' } }
            }
        };
        
        // Aplicar estilo a encabezados (primera fila)
        encabezados.forEach((_, colIndex) => {
            const cellAddress = XLSX.utils.encode_col(colIndex) + '1';
            if (!ws[cellAddress]) ws[cellAddress] = {};
            ws[cellAddress].s = encabezadoStyle;
        });
        
        // Aplicar estilo a datos (alternando colores)
        datos.forEach((fila, rowIndex) => {
            const actualRow = rowIndex + 2; // +2 porque empieza en fila 2 (después del encabezado)
            fila.forEach((_, colIndex) => {
                const cellAddress = XLSX.utils.encode_col(colIndex) + actualRow;
                if (!ws[cellAddress]) ws[cellAddress] = {};
                
                // Aplicar estilo base
                ws[cellAddress].s = JSON.parse(JSON.stringify(datosStyle));
                
                // Alternar colores de fondo
                if (rowIndex % 2 === 0) {
                    ws[cellAddress].s.fill = { fgColor: { rgb: 'F0F0F0' } }; // Gris claro
                }
            });
        });
        
        // Ajustar ancho de columnas
        const colWidths = encabezados.map(header => ({ wch: Math.max(15, header.length + 2) }));
        ws['!cols'] = colWidths;
        
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Reporte');
        const nombreArchivo = `${titulo.toLowerCase().replace(/ /g, '-')}.xlsx`;
        console.log('Descargando archivo:', nombreArchivo);
        XLSX.writeFile(wb, nombreArchivo);
    } else {
        // Fallback a CSV con formato correcto
        console.log('⚠️ XLSX no disponible, generando CSV');
        let contenido = encabezados.map(h => `"${String(h).replace(/"/g, '""')}"`).join(',') + '\n';
        datos.forEach(fila => {
            const filaCSV = fila.map(v => {
                const valor = String(v).replace(/"/g, '""');
                return `"${valor}"`;
            }).join(',');
            contenido += filaCSV + '\n';
        });
        
        const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${titulo.toLowerCase().replace(/ /g, '-')}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }
}
