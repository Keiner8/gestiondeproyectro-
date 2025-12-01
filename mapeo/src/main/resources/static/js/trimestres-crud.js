// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado, iniciando trimestres...');
    cargarFichasParaTrimestres();
    setTimeout(() => {
        cargarTrimestres();
        setupFiltrosTrimestres();
    }, 500);
    setupBuscadorFichas();
});

// ===== BUSCADOR DE FICHAS =====
function setupBuscadorFichas() {
    const searchInput = document.getElementById('trimestre-ficha-search');
    const searchInputEdit = document.getElementById('trimestre-ficha-search-edit');
    
    if (searchInput) {
        searchInput.addEventListener('keyup', function() {
            filtrarFichasEnSelect('trimestre-ficha-search', 'trimestre-ficha');
        });
    }
    
    if (searchInputEdit) {
        searchInputEdit.addEventListener('keyup', function() {
            filtrarFichasEnSelect('trimestre-ficha-search-edit', 'trimestre-ficha-edit');
        });
    }
}

function filtrarFichasEnSelect(searchInputId, selectId) {
    const searchTerm = document.getElementById(searchInputId).value.toLowerCase();
    const select = document.getElementById(selectId);
    const options = select.querySelectorAll('option');
    
    options.forEach(option => {
        if (option.value === '') {
            option.style.display = 'block';
        } else {
            const text = option.textContent.toLowerCase();
            option.style.display = text.includes(searchTerm) ? 'block' : 'none';
        }
    });
}

// ===== CARGAR DATOS =====
function cargarFichasParaTrimestres() {
    console.log('Iniciando carga de fichas...');
    fetchWithAuth(window.API_FICHAS)
        .then(response => {
            console.log('Respuesta fichas:', response.status);
            if (!response.ok) throw new Error('Error al cargar fichas');
            return response.json();
        })
        .then(data => {
            console.log('Fichas cargadas:', data.length, 'fichas');
            window.fichasListaCompleta = data;
            // Llenar selects inmediatamente
            llenarSelectFichasTrimestres();
        })
        .catch(error => {
            console.error('Error cargando fichas:', error);
            // Reintentar después de 2 segundos
            setTimeout(cargarFichasParaTrimestres, 2000);
        });
}

function llenarSelectFichasTrimestres() {
    const select = document.getElementById('trimestre-ficha');
    const selectEdit = document.getElementById('trimestre-ficha-edit');
    const selectFilter = document.getElementById('trimestres-ficha-filter');
    
    console.log('Llenando selects con fichas:', window.fichasListaCompleta);
    
    if (!window.fichasListaCompleta) {
        console.error('Fichas no cargadas');
        return;
    }
    
    const selectores = [select, selectEdit, selectFilter].filter(Boolean);
    
    selectores.forEach(sel => {
        // Limpiar opciones anteriores (excepto la primera)
        while (sel.options.length > 1) {
            sel.remove(1);
        }
        
        // Agregar fichas
        window.fichasListaCompleta.forEach(ficha => {
            const option = document.createElement('option');
            option.value = ficha.id;
            const codigo = ficha.codigoFicha || 'S/N';
            const programa = ficha.programaFormacion || 'Sin programa';
            option.textContent = `${codigo} - ${programa}`;
            sel.appendChild(option);
        });
    });
}

function cargarTrimestres() {
    fetchWithAuth(window.API_TRIMESTRES)
        .then(response => {
            if (!response.ok) throw new Error('Error al cargar trimestres');
            return response.json();
        })
        .then(data => {
            window.trimestresListaCompleta = data;
            mostrarTrimestres(data);
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarNotificacionGlobal('Error al cargar trimestres', 'error');
        });
}

function mostrarTrimestres(trimestres) {
    const tbody = document.getElementById('trimestres-tbody');
    tbody.innerHTML = '';
    
    if (trimestres.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="no-data">No hay trimestres registrados</td></tr>';
        return;
    }
    
    trimestres.forEach(trimestre => {
        // Usar el objeto ficha del backend si existe, sino buscar por fichaId
        let fichaNombre = 'Sin asignar';
        let fichaPrograma = '';
        
        if (trimestre.ficha) {
            fichaNombre = trimestre.ficha.codigoFicha || 'Sin asignar';
            fichaPrograma = trimestre.ficha.programaFormacion || '';
        } else if (trimestre.fichaId && window.fichasListaCompleta) {
            const ficha = window.fichasListaCompleta.find(f => f.id === trimestre.fichaId);
            if (ficha) {
                fichaNombre = ficha.codigoFicha || 'Sin asignar';
                fichaPrograma = ficha.programaFormacion || '';
            }
        }
        
        const row = document.createElement('tr');
         const btnActivarDesactivar = trimestre.estado === 'ACTIVO' 
             ? `<button class="btn-action btn-danger" onclick="desactivarTrimestre(${trimestre.id})" title="Desactivar">DESACTIVAR</button>`
             : `<button class="btn-action btn-success" onclick="activarTrimestre(${trimestre.id})" title="Activar">ACTIVAR</button>`;
         row.innerHTML = `
             <td>${trimestre.id}</td>
             <td>${trimestre.numero}</td>
             <td>${fichaNombre}</td>
             <td>${fichaPrograma}</td>
             <td>${trimestre.fechaInicio ? new Date(trimestre.fechaInicio).toLocaleDateString('es-ES') : 'N/A'}</td>
             <td>${trimestre.fechaFin ? new Date(trimestre.fechaFin).toLocaleDateString('es-ES') : 'N/A'}</td>
             <td><span class="estado ${trimestre.estado?.toLowerCase()}">${trimestre.estado || 'N/A'}</span></td>
             <td class="acciones">
                 <button class="btn-action btn-info" onclick="abrirEditarTrimestre(${trimestre.id})" title="Ver/Editar">VER</button>
                 <button class="btn-action btn-primary" onclick="abrirEditarTrimestre(${trimestre.id})" title="Editar">EDITAR</button>
                 ${btnActivarDesactivar}
             </td>
         `;
         tbody.appendChild(row);
    });
}

// ===== FILTROS =====
function setupFiltrosTrimestres() {
    const searchEl = document.getElementById('trimestres-search');
    const fichaEl = document.getElementById('trimestres-ficha-filter');
    const estadoEl = document.getElementById('trimestres-estado-filter');
    
    if (searchEl) searchEl.addEventListener('keyup', aplicarFiltrosTrimestres);
    if (fichaEl) fichaEl.addEventListener('change', aplicarFiltrosTrimestres);
    if (estadoEl) estadoEl.addEventListener('change', aplicarFiltrosTrimestres);
}

function aplicarFiltrosTrimestres() {
    const searchTerm = document.getElementById('trimestres-search')?.value.toLowerCase() || '';
    const fichaFilter = document.getElementById('trimestres-ficha-filter')?.value || '';
    const estadoFilter = document.getElementById('trimestres-estado-filter')?.value || '';
    
    let trimestrosFiltrados = window.trimestresListaCompleta.filter(trimestre => {
        const matchBusqueda = trimestre.numero.toString().includes(searchTerm);
        // Verificar si la ficha coincide (usar el objeto ficha del backend o el fichaId)
        const fichaId = trimestre.ficha ? trimestre.ficha.id : trimestre.fichaId;
        const matchFicha = !fichaFilter || fichaId == fichaFilter;
        const matchEstado = !estadoFilter || trimestre.estado === estadoFilter;
        return matchBusqueda && matchFicha && matchEstado;
    });
    
    mostrarTrimestres(trimestrosFiltrados);
}

// ===== ABRIR MODAL CREAR TRIMESTRE =====
function abrirCrearTrimestre() {
    console.log('Abriendo modal crear trimestre...');
    // Siempre recargar fichas para obtener las nuevas creadas
    cargarFichasParaTrimestres();
    setTimeout(() => {
        llenarSelectFichasTrimestres();
        openModal('modal-crear-trimestre');
    }, 300);
}

// ===== CREAR TRIMESTRE =====
function crearTrimestre(event) {
    event.preventDefault();
    
    const numero = document.getElementById('trimestre-numero').value;
    const fichaId = document.getElementById('trimestre-ficha').value;
    const inicio = document.getElementById('trimestre-inicio').value;
    const fin = document.getElementById('trimestre-fin').value;
    const estado = document.getElementById('trimestre-estado').value;
    
    if (!numero || !fichaId || !inicio || !fin) {
        mostrarNotificacionGlobal('Por favor completa todos los campos obligatorios', 'warning');
        return;
    }
    
    const nuevoTrimestre = {
        numero: parseInt(numero),
        fichaId: parseInt(fichaId),
        fechaInicio: inicio,
        fechaFin: fin,
        estado: estado
    };
    
    fetchWithAuth(window.API_TRIMESTRES, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoTrimestre)
    })
    .then(response => {
        if (!response.ok) throw new Error('Error al crear trimestre');
        return response.json();
    })
    .then(data => {
        mostrarNotificacionGlobal('Trimestre creado exitosamente', 'success');
        closeModal('modal-crear-trimestre');
        document.getElementById('form-crear-trimestre').reset();
        cargarTrimestres();
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarNotificacionGlobal('Error: ' + error.message, 'error');
    });
}

// ===== EDITAR TRIMESTRE =====
function abrirEditarTrimestre(id) {
    const trimestre = window.trimestresListaCompleta.find(t => t.id === id);
    if (!trimestre) return;
    
    // Asegurar que las fichas estén cargadas
    if (!window.fichasListaCompleta || window.fichasListaCompleta.length === 0) {
        console.log('Fichas no cargadas, cargando...');
        cargarFichasParaTrimestres();
        setTimeout(() => {
            llenarSelectFichasTrimestres();
            rellenarModalEditar(trimestre);
            openModal('modal-editar-trimestre');
        }, 500);
    } else {
        console.log('Fichas ya cargadas, llenando select...');
        llenarSelectFichasTrimestres();
        rellenarModalEditar(trimestre);
        openModal('modal-editar-trimestre');
    }
}

function rellenarModalEditar(trimestre) {
    document.getElementById('trimestre-id-edit').value = trimestre.id;
    document.getElementById('trimestre-numero-edit').value = trimestre.numero;
    document.getElementById('trimestre-ficha-edit').value = trimestre.fichaId || '';
    document.getElementById('trimestre-inicio-edit').value = trimestre.fechaInicio;
    document.getElementById('trimestre-fin-edit').value = trimestre.fechaFin;
    document.getElementById('trimestre-estado-edit').value = trimestre.estado || '';
    
    console.log('Modal rellenado:', {
        id: trimestre.id,
        numero: trimestre.numero,
        fichaId: trimestre.fichaId,
        selectValue: document.getElementById('trimestre-ficha-edit').value
    });
}

function actualizarTrimestre(event) {
    event.preventDefault();
    
    const id = document.getElementById('trimestre-id-edit').value;
    const numero = document.getElementById('trimestre-numero-edit').value;
    const fichaId = document.getElementById('trimestre-ficha-edit').value;
    const inicio = document.getElementById('trimestre-inicio-edit').value;
    const fin = document.getElementById('trimestre-fin-edit').value;
    const estado = document.getElementById('trimestre-estado-edit').value;
    
    if (!numero || !fichaId || !inicio || !fin) {
        mostrarNotificacionGlobal('Por favor completa todos los campos obligatorios', 'warning');
        return;
    }
    
    const trimestreActualizado = {
        id: id,
        numero: parseInt(numero),
        fichaId: parseInt(fichaId),
        fechaInicio: inicio,
        fechaFin: fin,
        estado: estado
    };
    
    fetchWithAuth(`${window.API_TRIMESTRES}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trimestreActualizado)
    })
    .then(response => {
        if (!response.ok) throw new Error('Error al actualizar trimestre');
        return response.json();
    })
    .then(data => {
        mostrarNotificacionGlobal('Trimestre actualizado exitosamente', 'success');
        closeModal('modal-editar-trimestre');
        cargarTrimestres();
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarNotificacionGlobal('Error: ' + error.message, 'error');
    });
}

// ===== ACTIVAR TRIMESTRE =====
function activarTrimestre(id) {
     const trimestre = window.trimestresListaCompleta.find(t => t.id === id);
     if (!trimestre) return;
     
     const trimestreActualizado = {
         ...trimestre,
         estado: 'ACTIVO'
     };
     
     fetchWithAuth(`${window.API_TRIMESTRES}/${id}`, {
         method: 'PUT',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(trimestreActualizado)
     })
     .then(response => {
         if (!response.ok) throw new Error('Error al activar trimestre');
         mostrarNotificacionGlobal('Trimestre activado exitosamente', 'success');
         cargarTrimestres();
     })
     .catch(error => {
         console.error('Error:', error);
         mostrarNotificacionGlobal('Error: ' + error.message, 'error');
     });
}

// ===== DESACTIVAR TRIMESTRE =====
function desactivarTrimestre(id) {
     const trimestre = window.trimestresListaCompleta.find(t => t.id === id);
     if (!trimestre) return;
     
     const trimestreActualizado = {
         ...trimestre,
         estado: 'INACTIVO'
     };
     
     fetchWithAuth(`${window.API_TRIMESTRES}/${id}`, {
         method: 'PUT',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(trimestreActualizado)
     })
     .then(response => {
         if (!response.ok) throw new Error('Error al desactivar trimestre');
         mostrarNotificacionGlobal('Trimestre desactivado exitosamente', 'success');
         cargarTrimestres();
     })
     .catch(error => {
         console.error('Error:', error);
         mostrarNotificacionGlobal('Error: ' + error.message, 'error');
     });
}

// ===== ELIMINAR TRIMESTRE =====
function eliminarTrimestre(id) {
     if (!confirm('¿Estás seguro de que deseas eliminar este trimestre?')) {
         return;
     }
     
     fetchWithAuth(`${window.API_TRIMESTRES}/${id}`, {
         method: 'DELETE'
     })
     .then(response => {
         if (!response.ok) throw new Error('Error al eliminar trimestre');
         mostrarNotificacionGlobal('Trimestre eliminado exitosamente', 'success');
         cargarTrimestres();
     })
     .catch(error => {
         console.error('Error:', error);
         mostrarNotificacionGlobal('Error: ' + error.message, 'error');
     });
}
