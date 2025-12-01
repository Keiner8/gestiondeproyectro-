// ===== REGISTRAR PROYECTO - APRENDIZ =====
// NOTA: La función registrarProyecto está en aprendiz-dashboard.js

document.addEventListener('DOMContentLoaded', function() {
    cargarGaesDelAprendiz();
    cargarMisProyectos();
});

function cargarGaesDelAprendiz() {
     // Esperar a que se cargue aprendizData (viene de aprendiz-dashboard.js)
     let intentos = 0;
     const maxIntentos = 150; // 15 segundos máximo
     
     const checkAprendizData = setInterval(() => {
         intentos++;
         const selectGaes = document.getElementById('proyecto-gaes');
         
         if (!selectGaes) {
             if (intentos >= maxIntentos) clearInterval(checkAprendizData);
             return;
         }
         
         if (typeof aprendizData !== 'undefined' && aprendizData.aprendiz) {
             clearInterval(checkAprendizData);
             
             // Usar los datos del GAES que ya vienen en aprendizData
             if (aprendizData.gaes && aprendizData.gaes.id) {
                 const option = document.createElement('option');
                 option.value = aprendizData.gaes.id;
                 option.textContent = aprendizData.gaes.nombre || 'GAES ' + aprendizData.gaes.id;
                 option.selected = true;
                 selectGaes.appendChild(option);
             } else if (aprendizData.aprendiz.gaesId) {
                 // Fallback: usar gaesId y gaesNombre del DTO si aprendizData.gaes no está disponible
                 const option = document.createElement('option');
                 option.value = aprendizData.aprendiz.gaesId;
                 option.textContent = aprendizData.aprendiz.gaesNombre || 'GAES ' + aprendizData.aprendiz.gaesId;
                 option.selected = true;
                 selectGaes.appendChild(option);
             } else {
                 console.warn('El aprendiz no tiene GAES asignado', aprendizData);
                 const selectGaes = document.getElementById('proyecto-gaes');
                 if (selectGaes) {
                     const option = document.createElement('option');
                     option.value = '';
                     option.textContent = 'Sin GAES asignado - Pide al instructor que te asigne a un GAES';
                     option.disabled = true;
                     selectGaes.appendChild(option);
                 }
             }
         } else if (intentos >= maxIntentos) {
             console.error('Timeout: No se pudo cargar aprendizData');
             clearInterval(checkAprendizData);
         }
     }, 100);
 }

function abrirRegistrarProyecto() {
    openModal('modal-registrar-proyecto');
}

function cargarMisProyectos() {
    // Esperar a que aprendizData esté disponible
    let intentos = 0;
    const maxIntentos = 150; // 15 segundos máximo
    
    const checkAprendizData = setInterval(() => {
        intentos++;
        const tbody = document.getElementById('mis-proyectos-tbody');
        
        if (!tbody) {
            if (intentos >= maxIntentos) clearInterval(checkAprendizData);
            return;
        }
        
        if (typeof aprendizData !== 'undefined' && aprendizData.aprendiz) {
            clearInterval(checkAprendizData);
            
            // Usar los proyectos cargados en aprendizData
            const proyectos = aprendizData.proyectos || [];
            tbody.innerHTML = '';
            
            if (proyectos.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="no-data">No hay proyectos registrados</td></tr>';
                return;
            }
            
            proyectos.forEach(proyecto => {
                const row = document.createElement('tr');
                const estadoColor = proyecto.estado === 'EN_DESARROLLO' ? '#fff3cd' : proyecto.estado === 'FINALIZADO' ? '#d4edda' : '#f8d7da';
                const estadoText = proyecto.estado === 'EN_DESARROLLO' ? 'En proceso' : proyecto.estado === 'FINALIZADO' ? 'Finalizado' : 'Cancelado';
                
                row.innerHTML = `
                    <td>${proyecto.id}</td>
                    <td>${proyecto.nombre}</td>
                    <td>${proyecto.descripcion || 'Sin descripción'}</td>
                    <td><span style="background-color: ${estadoColor}; padding: 4px 8px; border-radius: 4px;">${estadoText}</span></td>
                    <td class="acciones">
                        <button class="btn-action btn-ver" onclick="verDetallesProyecto(${proyecto.id})" title="Ver">Ver</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        } else if (intentos >= maxIntentos) {
            console.error('Timeout: No se pudo cargar aprendizData');
            clearInterval(checkAprendizData);
        }
    }, 100);
}

function verDetallesProyecto(id) {
    fetch(`${window.API_PROYECTOS}/${id}`)
        .then(response => response.json())
        .then(proyecto => {
            const mensaje = `
Proyecto: ${proyecto.nombre}
Descripción: ${proyecto.descripcion || 'Sin descripción'}
Estado: ${proyecto.estado}
Fecha Inicio: ${proyecto.fechaInicio || 'No definida'}
Fecha Fin: ${proyecto.fechaFin || 'No definida'}
            `;
            alert(mensaje);
        })
        .catch(error => console.error('Error:', error));
}

// ===== ENTREGABLES =====

function activarModoEntrega(modo) {
    const urlContainer = document.getElementById('entrega-url-container');
    const archivoContainer = document.getElementById('entrega-archivo-container');
    const urlInput = document.getElementById('entregable-url');
    const archivoInput = document.getElementById('entregable-archivo');
    
    if (modo === 'url') {
        urlContainer.style.display = 'block';
        archivoContainer.style.display = 'none';
        archivoInput.removeAttribute('required');
        urlInput.setAttribute('required', 'required');
    } else {
        urlContainer.style.display = 'none';
        archivoContainer.style.display = 'block';
        urlInput.removeAttribute('required');
        archivoInput.setAttribute('required', 'required');
    }
}

function subirEntregable(event) {
    event.preventDefault();
    
    const proyectoId = document.getElementById('entregable-proyecto')?.value;
    const nombre = document.getElementById('entregable-nombre')?.value;
    const descripcion = document.getElementById('entregable-descripcion')?.value;
    const url = document.getElementById('entregable-url')?.value;
    const archivo = document.getElementById('entregable-archivo')?.files[0];
    
    if (!proyectoId || !nombre) {
        mostrarNotificacionGlobal('Por favor completa proyecto y nombre', 'warning');
        return;
    }
    
    // Si es por URL
    if (url) {
        const nuevoEntregable = {
            nombre: nombre,
            descripcion: descripcion,
            proyectoId: parseInt(proyectoId),
            documentoUrl: url
        };
        
        guardarEntregable(nuevoEntregable);
    }
    // Si es por archivo
    else if (archivo) {
        const formData = new FormData();
        formData.append('nombre', nombre);
        formData.append('descripcion', descripcion);
        formData.append('proyectoId', proyectoId);
        formData.append('archivo', archivo);
        
        // Usar la función fetchPostFormData que maneja autenticación correctamente
        fetchPostFormData(window.API_ENTREGABLES, formData)
        .then(response => {
            if (!response.ok) throw new Error('Error al subir archivo - Status: ' + response.status);
            return response.json();
        })
        .then(data => {
            mostrarNotificacionGlobal('Entregable subido exitosamente', 'success');
            closeModal('modal-subir-entregable');
            document.getElementById('form-subir-entregable').reset();
            activarModoEntrega('url');
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarNotificacionGlobal('Error: ' + error.message, 'error');
        });
    }
}

function guardarEntregable(entregable) {
    fetch(window.API_ENTREGABLES, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entregable)
    })
    .then(response => {
        if (!response.ok) throw new Error('Error al guardar entregable');
        return response.json();
    })
    .then(data => {
        mostrarNotificacionGlobal('Entregable registrado exitosamente', 'success');
        closeModal('modal-subir-entregable');
        document.getElementById('form-subir-entregable').reset();
        activarModoEntrega('url');
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarNotificacionGlobal('Error: ' + error.message, 'error');
    });
}
