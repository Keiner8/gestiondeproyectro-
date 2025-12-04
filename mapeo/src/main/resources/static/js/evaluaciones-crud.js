// Inicializar
document.addEventListener('DOMContentLoaded', function() {
     cargarAprendicesParaReportes();
     cargarGaesParaReportes();
     cargarInstructoresParaEvaluaciones();
     cargarReportes();
     setupFiltrosReportes();
 });

// ===== CARGAR DATOS =====
function cargarAprendicesParaReportes() {
    fetchWithAuth(window.API_APRENDICES)
        .then(response => {
            if (!response.ok) throw new Error('Error al cargar aprendices');
            return response.json();
        })
        .then(data => {
            window.aprendicesListaCompleta = data;
            llenarSelectAprendices();
        })
        .catch(error => console.error('Error:', error));
}

function cargarGaesParaReportes() {
     fetchWithAuth(window.API_GAES)
         .then(response => {
             if (!response.ok) throw new Error('Error al cargar GAES');
             return response.json();
         })
         .then(data => {
             window.gaesListaCompleta = data;
             llenarSelectGaesReportes();
         })
         .catch(error => console.error('Error:', error));
 }

 function cargarInstructoresParaEvaluaciones() {
     fetchWithAuth(window.API_INSTRUCTORES)
         .then(response => {
             if (!response.ok) throw new Error('Error al cargar instructores');
             return response.json();
         })
         .then(data => {
             window.instructoresListaCompleta = data;
             llenarSelectInstructores();
         })
         .catch(error => console.error('Error:', error));
 }

function llenarSelectAprendices() {
    const select = document.getElementById('evaluacion-aprendiz');
    const selectEdit = document.getElementById('evaluacion-aprendiz-edit');
    
    [select, selectEdit].forEach(sel => {
        if (!sel) return;
        while (sel.options.length > 1) {
            sel.remove(1);
        }
        window.aprendicesListaCompleta.forEach(aprendiz => {
            const option = document.createElement('option');
            option.value = aprendiz.id;
            option.textContent = aprendiz.usuario?.nombre || `Aprendiz ${aprendiz.id}`;
            sel.appendChild(option);
        });
    });
}

function llenarSelectGaesReportes() {
     const select = document.getElementById('evaluacion-gaes');
     const selectEdit = document.getElementById('evaluacion-gaes-edit');
     const selectFilter = document.getElementById('evaluaciones-gaes-filter');
     
     [select, selectEdit, selectFilter].forEach(sel => {
         if (!sel) return;
         while (sel.options.length > 1) {
             sel.remove(1);
         }
         window.gaesListaCompleta.forEach(gae => {
             const option = document.createElement('option');
             option.value = gae.id;
             option.textContent = gae.nombre;
             sel.appendChild(option);
         });
     });
 }

 function llenarSelectInstructores() {
     const select = document.getElementById('evaluacion-evaluador');
     const selectEdit = document.getElementById('evaluacion-evaluador-edit');
     const selectFilter = document.getElementById('evaluaciones-evaluador-filter');
     
     [select, selectEdit, selectFilter].forEach(sel => {
         if (!sel) return;
         while (sel.options.length > 1) {
             sel.remove(1);
         }
         window.instructoresListaCompleta.forEach(instructor => {
             const option = document.createElement('option');
             option.value = instructor.id;
             option.textContent = instructor.usuario?.nombre || `Instructor ${instructor.id}`;
             sel.appendChild(option);
         });
     });
 }

function cargarReportes() {
    fetchWithAuth(window.API_EVALUACIONES)
        .then(response => {
            if (!response.ok) throw new Error('Error al cargar reportes');
            return response.json();
        })
        .then(data => {
            window.evaluacionesListaCompleta = data;
            mostrarReportes(data);
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarNotificacionGlobal('Error al cargar reportes', 'error');
        });
}

function mostrarReportes(evaluaciones) {
    const tbody = document.getElementById('evaluaciones-tbody');
    tbody.innerHTML = '';
    
    if (evaluaciones.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="no-data">No hay evaluaciones registradas</td></tr>';
        return;
    }
    
    evaluaciones.forEach(evaluacion => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td data-label="ID">${evaluacion.id}</td>
            <td data-label="Aprendiz">${evaluacion.aprendiz?.usuario?.nombre || 'N/A'}</td>
            <td data-label="GAES">${evaluacion.gaes?.nombre || 'N/A'}</td>
            <td data-label="Calificación">${evaluacion.calificacion || 'N/A'}</td>
            <td data-label="Fecha">${evaluacion.fecha ? new Date(evaluacion.fecha).toLocaleDateString('es-ES') : 'N/A'}</td>
            <td class="acciones" data-label="Acciones">
                <button class="btn-icon btn-edit" onclick="abrirEditarEvaluacion(${evaluacion.id})" title="Editar">Editar</button>
                <button class="btn-icon btn-delete" onclick="eliminarEvaluacion(${evaluacion.id})" title="Eliminar">Eliminar</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// ===== FILTROS =====
function setupFiltrosReportes() {
    const searchEl = document.getElementById('evaluaciones-search');
    const gaesEl = document.getElementById('evaluaciones-gaes-filter');
    const evaluadorEl = document.getElementById('evaluaciones-evaluador-filter');
    
    if (searchEl) searchEl.addEventListener('keyup', aplicarFiltrosReportes);
    if (gaesEl) gaesEl.addEventListener('change', aplicarFiltrosReportes);
    if (evaluadorEl) evaluadorEl.addEventListener('change', aplicarFiltrosReportes);
}

function aplicarFiltrosReportes() {
    const searchTerm = document.getElementById('evaluaciones-search')?.value.toLowerCase() || '';
    const gaesFilter = document.getElementById('evaluaciones-gaes-filter')?.value || '';
    const evaluadorFilter = document.getElementById('evaluaciones-evaluador-filter')?.value || '';
    
    let evaluacionesFiltradas = window.evaluacionesListaCompleta.filter(evaluacion => {
        const matchBusqueda = (evaluacion.aprendiz?.usuario?.nombre || '').toLowerCase().includes(searchTerm);
        const matchGaes = !gaesFilter || evaluacion.gaes?.id == gaesFilter;
        const matchEvaluador = !evaluadorFilter || evaluacion.evaluador?.id == evaluadorFilter;
        return matchBusqueda && matchGaes && matchEvaluador;
    });
    
    mostrarReportes(evaluacionesFiltradas);
}

// ===== CREAR REPORTE =====
function crearEvaluacion(event) {
     event.preventDefault();
     
     const aprendizId = document.getElementById('evaluacion-aprendiz').value;
     const gaesId = document.getElementById('evaluacion-gaes').value;
     const evaluadorId = document.getElementById('evaluacion-evaluador').value;
     const rango = document.getElementById('evaluacion-rango').value;
     const calificacion = document.getElementById('evaluacion-calificacion').value;
     const observaciones = document.getElementById('evaluacion-observaciones').value;
     const fecha = document.getElementById('evaluacion-fecha').value;
     
     if (!aprendizId || !gaesId || !evaluadorId || !calificacion || !fecha) {
         mostrarNotificacionGlobal('Por favor completa todos los campos obligatorios', 'warning');
         return;
     }
     
     const nuevaEvaluacion = {
         aprendizId: parseInt(aprendizId),
         gaesId: parseInt(gaesId),
         evaluadorId: parseInt(evaluadorId),
         calificacion: parseFloat(calificacion),
         observaciones: observaciones,
         fecha: fecha
     };
    
    fetchWithAuth(window.API_EVALUACIONES, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevaEvaluacion)
    })
    .then(response => {
        if (!response.ok) throw new Error('Error al crear evaluación');
        return response.json();
    })
    .then(data => {
        mostrarNotificacionGlobal('Reporte creado exitosamente', 'success');
        closeModal('modal-crear-evaluacion');
        document.getElementById('form-crear-evaluacion').reset();
        cargarReportes();
        })
        .catch(error => {
         console.error('Error:', error);
         mostrarNotificacionGlobal('Error: ' + error.message, 'error');
        });
        }
        
        // ===== EDITAR REPORTE =====
        function abrirEditarEvaluacion(id) {
             const evaluacion = window.evaluacionesListaCompleta.find(e => e.id === id);
             if (!evaluacion) return;
             
             document.getElementById('evaluacion-id-edit').value = evaluacion.id;
             document.getElementById('evaluacion-aprendiz-edit').value = evaluacion.aprendiz?.id || '';
             document.getElementById('evaluacion-gaes-edit').value = evaluacion.gaes?.id || '';
             document.getElementById('evaluacion-evaluador-edit').value = evaluacion.evaluador?.id || '';
             document.getElementById('evaluacion-calificacion-edit').value = evaluacion.calificacion || '';
             document.getElementById('evaluacion-observaciones-edit').value = evaluacion.observaciones || '';
             document.getElementById('evaluacion-fecha-edit').value = evaluacion.fecha || '';
             
             openModal('modal-editar-evaluacion');
         }

function actualizarEvaluacion(event) {
     event.preventDefault();
     
     const id = document.getElementById('evaluacion-id-edit').value;
     const aprendizId = document.getElementById('evaluacion-aprendiz-edit').value;
     const gaesId = document.getElementById('evaluacion-gaes-edit').value;
     const evaluadorId = document.getElementById('evaluacion-evaluador-edit').value;
     const calificacion = document.getElementById('evaluacion-calificacion-edit').value;
     const observaciones = document.getElementById('evaluacion-observaciones-edit').value;
     const fecha = document.getElementById('evaluacion-fecha-edit').value;
     
     if (!aprendizId || !gaesId || !evaluadorId || !calificacion || !fecha) {
         mostrarNotificacionGlobal('Por favor completa todos los campos obligatorios', 'warning');
         return;
     }
     
     const evaluacionActualizada = {
         aprendizId: parseInt(aprendizId),
         gaesId: parseInt(gaesId),
         evaluadorId: parseInt(evaluadorId),
         calificacion: parseFloat(calificacion),
         observaciones: observaciones,
         fecha: fecha
     };
    
    fetchWithAuth(`${window.API_EVALUACIONES}/${id}`, {
         method: 'PUT',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(evaluacionActualizada)
     })
     .then(response => {
         if (!response.ok) throw new Error('Error al actualizar evaluación');
         return response.json();
     })
     .then(data => {
         mostrarNotificacionGlobal('Reporte actualizado exitosamente', 'success');
         closeModal('modal-editar-evaluacion');
         cargarReportes();
         })
         .catch(error => {
          console.error('Error:', error);
          mostrarNotificacionGlobal('Error: ' + error.message, 'error');
         });
         }
        
        // ===== ELIMINAR REPORTE =====
        function eliminarEvaluacion(id) {
        if (!confirm('¿Estás seguro de que deseas eliminar este reporte?')) {
        return;
    }
    
    fetchWithAuth(`${window.API_EVALUACIONES}/${id}`, {
         method: 'DELETE'
     })
     .then(response => {
         if (!response.ok) throw new Error('Error al eliminar reporte');
         mostrarNotificacionGlobal('Reporte eliminado exitosamente', 'success');
         cargarReportes();
     })
     .catch(error => {
         console.error('Error:', error);
         mostrarNotificacionGlobal('Error: ' + error.message, 'error');
     });
    }

function actualizarRangoCalificacion(inputId, selectId) {
    const input = document.getElementById(inputId);
    const select = document.getElementById(selectId);
    const rango = select.value;
    
    if (rango === '5') {
        input.max = '5';
        input.step = '0.01';
    } else if (rango === '100') {
        input.max = '100';
        input.step = '1';
    }
    
    input.value = '';
}

// ===== EXPORTAR A PDF (desde el backend con OpenPDF) =====
function descargarEvaluacionesPDF() {
    if (!window.evaluacionesListaCompleta || window.evaluacionesListaCompleta.length === 0) {
        mostrarNotificacionGlobal('No hay datos para exportar', 'warning');
        return;
    }
    
    // Mostrar modal para seleccionar filtro
    mostrarModalFiltrarPDF();
}

function mostrarModalFiltrarPDF() {
    // Obtener aprendices únicos de las evaluaciones
    const aprendices = [...new Set(window.evaluacionesListaCompleta
        .filter(e => e.aprendiz)
        .map(e => ({
            id: e.aprendiz.id,
            nombre: e.aprendiz.usuario?.nombre || 'N/A'
        })))]
        .sort((a, b) => a.nombre.localeCompare(b.nombre));
    
    let html = `
        <div id="modal-filtrar-pdf" class="modal" style="display: block; z-index: 9999;">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Descargar Reporte PDF</h2>
                    <button class="modal-close" onclick="cerrarModalFiltrarPDF()">&times;</button>
                </div>
                <div class="form-group">
                    <label>Selecciona una opción:</label>
                    <select id="filtro-pdf-select">
                        <option value="">Todos los registros</option>
    `;
    
    aprendices.forEach(a => {
        html += `<option value="aprendiz-${a.id}">${a.nombre}</option>`;
    });
    
    html += `
                    </select>
                </div>
                <div class="modal-actions">
                    <button class="btn-primary" onclick="descargarPDFConFiltro()">Descargar</button>
                    <button class="btn-secondary" onclick="cerrarModalFiltrarPDF()">Cancelar</button>
                </div>
            </div>
        </div>
    `;
    
    let modal = document.getElementById('modal-filtrar-pdf');
    if (!modal) {
        modal = document.createElement('div');
        document.body.appendChild(modal);
    }
    modal.id = 'modal-filtrar-pdf';
    modal.innerHTML = html;
    modal.style.display = 'block';
}

function cerrarModalFiltrarPDF() {
    const modal = document.getElementById('modal-filtrar-pdf');
    if (modal) modal.remove();
}

function descargarPDFConFiltro() {
    const filtro = document.getElementById('filtro-pdf-select').value;
    let url = '/api/evaluaciones/descargar/pdf';
    
    if (filtro.startsWith('aprendiz-')) {
        const aprendizId = filtro.split('-')[1];
        url += `?aprendizId=${aprendizId}`;
    }
    
    try {
        fetchWithAuth(url)
            .then(response => {
                if (!response.ok) throw new Error('Error al descargar archivo');
                return response.blob();
            })
            .then(blob => {
                const urlObj = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = urlObj;
                link.download = `Reportes_Evaluaciones_${new Date().getTime()}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(urlObj);
                cerrarModalFiltrarPDF();
                mostrarNotificacionGlobal('Archivo PDF descargado exitosamente', 'success');
            })
            .catch(error => {
                console.error('Error al descargar PDF:', error);
                mostrarNotificacionGlobal('Error al descargar PDF: ' + error.message, 'error');
            });
    } catch (error) {
        console.error('Error al generar descarga:', error);
        mostrarNotificacionGlobal('Error: ' + error.message, 'error');
    }
}

// ===== EXPORTAR A EXCEL (.xlsx) (desde el backend con Apache POI) =====
function descargarEvaluacionesExcel() {
    if (!window.evaluacionesListaCompleta || window.evaluacionesListaCompleta.length === 0) {
        mostrarNotificacionGlobal('No hay datos para exportar', 'warning');
        return;
    }
    
    try {
        // Descargar desde el endpoint del backend
        fetchWithAuth('/api/evaluaciones/descargar/excel')
            .then(response => {
                if (!response.ok) throw new Error('Error al descargar archivo');
                return response.blob();
            })
            .then(blob => {
                // Crear URL de descarga
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `Reportes_Evaluaciones_${new Date().getTime()}.xlsx`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                mostrarNotificacionGlobal('Archivo Excel descargado exitosamente', 'success');
            })
            .catch(error => {
                console.error('Error al descargar Excel:', error);
                mostrarNotificacionGlobal('Error al descargar archivo: ' + error.message, 'error');
            });
    } catch (error) {
        console.error('Error al generar descarga:', error);
        mostrarNotificacionGlobal('Error: ' + error.message, 'error');
    }
}
